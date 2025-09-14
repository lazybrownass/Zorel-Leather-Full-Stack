from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select, and_, or_, desc, asc, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sqlalchemy_models import Order, OrderItem, User, Product
from app.schemas.order import (
    OrderCreate, 
    OrderUpdate, 
    OrderResponse, 
    OrderListResponse,
    OrderFilters,
    OrderSummary,
    OrderAnalytics
)
from app.core.postgresql import get_db
from app.core.security import get_current_active_user, require_roles, UserRole
from app.core.exceptions import NotFoundException, ForbiddenException
from app.services.notification_service import NotificationService
import uuid

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/", response_model=OrderResponse)
@limiter.limit("10/minute")
async def create_order(
    request: Request,
    order_data: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new order request"""
    # Calculate totals and get product information
    subtotal = 0.0
    order_items = []
    
    for item_data in order_data.items:
        # Get product information
        product_result = await db.execute(
            select(Product).where(Product.id == item_data.product_id, Product.is_active == True)
        )
        product = product_result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_data.product_id} not found")
        
        # Calculate item total
        item_total = product.price * item_data.quantity
        subtotal += item_total
        
        # Create order item
        order_item = OrderItem(
            product_id=product.id,
            quantity=item_data.quantity,
            price=product.price,
            size=item_data.size,
            color=item_data.color
        )
        order_items.append(order_item)
    
    # Calculate GST and total
    gst_amount = subtotal * 0.0833  # 8.33% GST
    total_amount = subtotal + gst_amount
    
    # Generate order number
    order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    
    # Create order
    order = Order(
        user_id=current_user.id,
        order_number=order_number,
        status="pending",
        total_amount=total_amount,
        gst_amount=gst_amount,
        payment_method=order_data.payment_method.value,
        payment_status="pending",
        shipping_address=order_data.shipping_address.dict(),
        billing_address=order_data.billing_address.dict() if order_data.billing_address else None,
        customer_notes=order_data.customer_notes,
        order_items=order_items
    )
    
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    # Send notification to admin
    notification_service = NotificationService()
    await notification_service.send_order_request_notification(order)
    
    return OrderResponse.from_orm(order)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get order by ID (user can only see their own orders)"""
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise NotFoundException("Order not found")
    
    # Check if user owns this order or is admin
    if order.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise ForbiddenException("Access denied")
    
    return OrderResponse.from_orm(order)


@router.get("/", response_model=OrderListResponse)
async def get_user_orders(
    current_user: User = Depends(get_current_active_user),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's orders"""
    # Build base query
    query = select(Order).where(Order.user_id == current_user.id)
    
    # Apply status filter
    if status:
        query = query.where(Order.status == status)
    
    # Get total count
    count_query = select(func.count(Order.id)).where(Order.user_id == current_user.id)
    if status:
        count_query = count_query.where(Order.status == status)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and sorting
    offset = (page - 1) * limit
    query = query.order_by(desc(Order.created_at)).offset(offset).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    orders = result.scalars().all()
    
    # Calculate total pages
    total_pages = (total + limit - 1) // limit
    
    return OrderListResponse(
        orders=[OrderResponse.from_orm(order) for order in orders],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.put("/{order_id}/confirm", response_model=OrderResponse)
async def confirm_order(
    order_id: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Confirm an order (Admin only)"""
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise NotFoundException("Order not found")
    
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Order cannot be confirmed")
    
    # Update order status
    order.status = "confirmed"
    order.confirmed_at = datetime.utcnow()
    order.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(order)
    
    # Send confirmation notification with payment link
    notification_service = NotificationService()
    await notification_service.send_order_confirmation_notification(order)
    
    return OrderResponse.from_orm(order)


@router.put("/{order_id}/reject", response_model=OrderResponse)
async def reject_order(
    order_id: str,
    reason: str = Query(..., description="Reason for rejection"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Reject an order (Admin only)"""
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise NotFoundException("Order not found")
    
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Order cannot be rejected")
    
    # Update order status
    order.status = "cancelled"
    order.admin_notes = f"Rejected: {reason}"
    order.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(order)
    
    # Send rejection notification
    notification_service = NotificationService()
    await notification_service.send_order_rejection_notification(order, reason)
    
    return OrderResponse.from_orm(order)


@router.put("/{order_id}/ship", response_model=OrderResponse)
async def ship_order(
    order_id: str,
    tracking_number: str = Query(..., description="Tracking number"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Mark order as shipped (Admin only)"""
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise NotFoundException("Order not found")
    
    if order.payment_status != "completed":
        raise HTTPException(status_code=400, detail="Order must be paid before shipping")
    
    # Update order status
    order.status = "shipped"
    order.tracking_number = tracking_number
    order.shipped_at = datetime.utcnow()
    order.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(order)
    
    # Send shipping notification
    notification_service = NotificationService()
    await notification_service.send_order_shipped_notification(order)
    
    return OrderResponse.from_orm(order)
