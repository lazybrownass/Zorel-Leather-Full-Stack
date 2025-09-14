from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.sqlalchemy_models import Coupon, User
from app.schemas.coupon import CouponCreate, CouponUpdate, CouponResponse, CouponValidation, CouponStatus
from app.core.security import get_current_active_user, require_roles, UserRole
from app.core.exceptions import NotFoundException, ConflictException, ValidationException
from app.core.postgresql import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, asc, func

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/", response_model=List[CouponResponse])
@limiter.limit("60/minute")
async def get_coupons(
    request: Request,
    status: Optional[CouponStatus] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get all active coupons"""
    # Build query
    query = select(Coupon).where(Coupon.status == CouponStatus.ACTIVE)
    if status:
        query = query.where(Coupon.status == status)
    
    # Check if coupons are still valid
    now = datetime.utcnow()
    query = query.where(
        or_(
            Coupon.valid_until > now,
            Coupon.valid_until.is_(None)
        )
    )
    
    # Pagination
    offset = (page - 1) * limit
    query = query.order_by(desc(Coupon.created_at)).offset(offset).limit(limit)
    
    result = await db.execute(query)
    coupons = result.scalars().all()
    
    return [
        CouponResponse(
            id=str(coupon.id),
            code=coupon.code,
            name=coupon.name,
            description=coupon.description,
            type=coupon.type,
            value=coupon.value,
            minimum_order_amount=coupon.minimum_order_amount,
            maximum_discount=coupon.maximum_discount,
            usage_limit=coupon.usage_limit,
            used_count=coupon.used_count,
            status=coupon.status,
            valid_from=coupon.valid_from,
            valid_until=coupon.valid_until,
            applicable_categories=coupon.applicable_categories,
            applicable_products=coupon.applicable_products,
            created_at=coupon.created_at
        )
        for coupon in coupons
    ]


@router.get("/{coupon_code}", response_model=CouponResponse)
@limiter.limit("60/minute")
async def get_coupon_by_code(
    request: Request, 
    coupon_code: str,
    db: AsyncSession = Depends(get_db)
):
    """Get coupon by code"""
    query = select(Coupon).where(Coupon.code == coupon_code.upper())
    result = await db.execute(query)
    coupon = result.scalar_one_or_none()
    
    if not coupon:
        raise NotFoundException("Coupon not found")
    
    return CouponResponse(
        id=str(coupon.id),
        code=coupon.code,
        name=coupon.name,
        description=coupon.description,
        type=coupon.type,
        value=coupon.value,
        minimum_order_amount=coupon.minimum_order_amount,
        maximum_discount=coupon.maximum_discount,
        usage_limit=coupon.usage_limit,
        used_count=coupon.used_count,
        status=coupon.status,
        valid_from=coupon.valid_from,
        valid_until=coupon.valid_until,
        applicable_categories=coupon.applicable_categories,
        applicable_products=coupon.applicable_products,
        created_at=coupon.created_at
    )


@router.post("/validate", response_model=dict)
@limiter.limit("10/minute")
async def validate_coupon(
    request: Request,
    validation_data: CouponValidation,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Validate a coupon code"""
    query = select(Coupon).where(Coupon.code == validation_data.code.upper())
    result = await db.execute(query)
    coupon = result.scalar_one_or_none()
    
    if not coupon:
        raise NotFoundException("Invalid coupon code")
    
    # Check if coupon is active
    if coupon.status != CouponStatus.ACTIVE:
        raise ValidationException("Coupon is not active")
    
    # Check validity period
    now = datetime.utcnow()
    if coupon.valid_from > now:
        raise ValidationException("Coupon is not yet valid")
    
    if coupon.valid_until and coupon.valid_until < now:
        raise ValidationException("Coupon has expired")
    
    # Check usage limit
    if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
        raise ValidationException("Coupon usage limit exceeded")
    
    # Check minimum order amount
    if coupon.minimum_order_amount and validation_data.order_amount < coupon.minimum_order_amount:
        raise ValidationException(f"Minimum order amount of ${coupon.minimum_order_amount} required")
    
    # Calculate discount
    if coupon.type == "percentage":
        discount_amount = (validation_data.order_amount * coupon.value) / 100
        if coupon.maximum_discount:
            discount_amount = min(discount_amount, coupon.maximum_discount)
    elif coupon.type == "fixed_amount":
        discount_amount = min(coupon.value, validation_data.order_amount)
    else:  # free_shipping
        discount_amount = 0  # This would be handled separately
    
    return {
        "valid": True,
        "discount_amount": discount_amount,
        "coupon": CouponResponse(
            id=str(coupon.id),
            code=coupon.code,
            name=coupon.name,
            description=coupon.description,
            type=coupon.type,
            value=coupon.value,
            minimum_order_amount=coupon.minimum_order_amount,
            maximum_discount=coupon.maximum_discount,
            usage_limit=coupon.usage_limit,
            used_count=coupon.used_count,
            status=coupon.status,
            valid_from=coupon.valid_from,
            valid_until=coupon.valid_until,
            applicable_categories=coupon.applicable_categories,
            applicable_products=coupon.applicable_products,
            created_at=coupon.created_at
        )
    }


@router.post("/", response_model=CouponResponse)
async def create_coupon(
    coupon_data: CouponCreate,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Create a new coupon (Admin only)"""
    # Check if coupon code already exists
    existing_query = select(Coupon).where(Coupon.code == coupon_data.code.upper())
    existing_result = await db.execute(existing_query)
    existing_coupon = existing_result.scalar_one_or_none()
    
    if existing_coupon:
        raise ConflictException("Coupon code already exists")
    
    # Create coupon
    import uuid
    
    coupon = Coupon(
        id=uuid.uuid4(),
        code=coupon_data.code.upper(),
        name=coupon_data.name,
        description=coupon_data.description,
        type=coupon_data.type,
        value=coupon_data.value,
        minimum_order_amount=coupon_data.minimum_order_amount,
        maximum_discount=coupon_data.maximum_discount,
        usage_limit=coupon_data.usage_limit,
        valid_from=coupon_data.valid_from or datetime.utcnow(),
        valid_until=coupon_data.valid_until,
        applicable_categories=coupon_data.applicable_categories,
        applicable_products=coupon_data.applicable_products,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    
    return CouponResponse(
        id=str(coupon.id),
        code=coupon.code,
        name=coupon.name,
        description=coupon.description,
        type=coupon.type,
        value=coupon.value,
        minimum_order_amount=coupon.minimum_order_amount,
        maximum_discount=coupon.maximum_discount,
        usage_limit=coupon.usage_limit,
        used_count=coupon.used_count,
        status=coupon.status,
        valid_from=coupon.valid_from,
        valid_until=coupon.valid_until,
        applicable_categories=coupon.applicable_categories,
        applicable_products=coupon.applicable_products,
        created_at=coupon.created_at
    )


@router.put("/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: str,
    coupon_data: CouponUpdate,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Update a coupon (Admin only)"""
    import uuid
    
    # Validate UUID format
    try:
        coupon_uuid = uuid.UUID(coupon_id)
    except ValueError:
        raise NotFoundException("Coupon not found")
    
    query = select(Coupon).where(Coupon.id == coupon_uuid)
    result = await db.execute(query)
    coupon = result.scalar_one_or_none()
    
    if not coupon:
        raise NotFoundException("Coupon not found")
    
    # Update fields
    update_data = coupon_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(coupon, field):
            setattr(coupon, field, value)
    
    await db.commit()
    await db.refresh(coupon)
    
    return CouponResponse(
        id=str(coupon.id),
        code=coupon.code,
        name=coupon.name,
        description=coupon.description,
        type=coupon.type,
        value=coupon.value,
        minimum_order_amount=coupon.minimum_order_amount,
        maximum_discount=coupon.maximum_discount,
        usage_limit=coupon.usage_limit,
        used_count=coupon.used_count,
        status=coupon.status,
        valid_from=coupon.valid_from,
        valid_until=coupon.valid_until,
        applicable_categories=coupon.applicable_categories,
        applicable_products=coupon.applicable_products,
        created_at=coupon.created_at
    )


@router.delete("/{coupon_id}")
async def delete_coupon(
    coupon_id: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Delete a coupon (Admin only)"""
    import uuid
    
    # Validate UUID format
    try:
        coupon_uuid = uuid.UUID(coupon_id)
    except ValueError:
        raise NotFoundException("Coupon not found")
    
    query = select(Coupon).where(Coupon.id == coupon_uuid)
    result = await db.execute(query)
    coupon = result.scalar_one_or_none()
    
    if not coupon:
        raise NotFoundException("Coupon not found")
    
    # Soft delete by setting status to inactive
    coupon.status = CouponStatus.INACTIVE
    await db.commit()
    await db.refresh(coupon)
    
    return {"message": "Coupon deleted successfully"}


@router.post("/{coupon_id}/use")
async def use_coupon(
    coupon_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a coupon as used"""
    import uuid
    
    # Validate UUID format
    try:
        coupon_uuid = uuid.UUID(coupon_id)
    except ValueError:
        raise NotFoundException("Coupon not found")
    
    query = select(Coupon).where(Coupon.id == coupon_uuid)
    result = await db.execute(query)
    coupon = result.scalar_one_or_none()
    
    if not coupon:
        raise NotFoundException("Coupon not found")
    
    # Increment usage count
    coupon.used_count += 1
    await db.commit()
    await db.refresh(coupon)
    
    return {"message": "Coupon used successfully"}
