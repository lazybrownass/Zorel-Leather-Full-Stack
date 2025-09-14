from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select, and_, or_, desc, asc, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.sqlalchemy_models import Order, OrderItem, Product, User, OrderStatus, PaymentStatus, PaymentMethod
from app.schemas.order import (
    OrderCreate, OrderUpdate, OrderResponse, OrderListResponse, 
    OrderFilters, OrderSummary, OrderAnalytics, OrderItemResponse
)
from app.core.security import get_current_active_user, require_roles, UserRole
from app.core.postgresql import get_db
from app.core.exceptions import NotFoundException, ForbiddenException
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
    """Create a new order"""
    # Generate order number
    order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    # Calculate totals
    total_amount = 0.0
    order_items = []
    
    for item_data in order_data.items:
        # Get product details
        result = await db.execute(select(Product).where(Product.id == item_data.product_id))
        product = result.scalar_one_or_none()
        
        if not product:
            raise NotFoundException(f"Product {item_data.product_id} not found")
        
        if product.stock_quantity < item_data.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product {product.name}. Available: {product.stock_quantity}"
            )
        
        item_total = product.price * item_data.quantity
        total_amount += item_total
        
        # Create order item
        order_item = OrderItem(
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            price=product.price,
            size=item_data.size,
            color=item_data.color
        )
        order_items.append(order_item)
    
    # Calculate GST (8.33%)
    gst_amount = total_amount * 0.0833
    
    # Create order
    order = Order(
        user_id=current_user.id,
        order_number=order_number,
        status=OrderStatus.PENDING,
        total_amount=total_amount,
        gst_amount=gst_amount,
        payment_method=order_data.payment_method,
        payment_status=PaymentStatus.PENDING,
        shipping_address=order_data.shipping_address.dict(),
        billing_address=order_data.billing_address.dict() if order_data.billing_address else None,
        customer_notes=order_data.customer_notes,
        communication_log=[]
    )
    
    db.add(order)
    await db.flush()  # Get the order ID
    
    # Add order items
    for order_item in order_items:
        order_item.order_id = order.id
        db.add(order_item)
    
    # Update product stock
    for item_data in order_data.items:
        result = await db.execute(select(Product).where(Product.id == item_data.product_id))
        product = result.scalar_one_or_none()
        if product:
            product.stock_quantity -= item_data.quantity
    
    await db.commit()
    await db.refresh(order)
    
    # Get order with items
    result = await db.execute(
        select(Order)
        .where(Order.id == order.id)
        .options(selectinload(Order.order_items))
    )
    order_with_items = result.scalar_one()
    
    return OrderResponse.from_orm(order_with_items)


@router.get("/", response_model=OrderListResponse)
@limiter.limit("60/minute")
async def get_orders(
    request: Request,
    status: Optional[OrderStatus] = Query(None),
    payment_status: Optional[PaymentStatus] = Query(None),
    payment_method: Optional[PaymentMethod] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get orders with filtering and pagination"""
    # Build base query
    if current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        # Admin can see all orders
        query = select(Order)
    else:
        # Customer can only see their own orders
        query = select(Order).where(Order.user_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.where(Order.status == status)
    if payment_status:
        query = query.where(Order.payment_status == payment_status)
    if payment_method:
        query = query.where(Order.payment_method == payment_method)
    if date_from:
        query = query.where(Order.created_at >= date_from)
    if date_to:
        query = query.where(Order.created_at <= date_to)
    if min_amount:
        query = query.where(Order.total_amount >= min_amount)
    if max_amount:
        query = query.where(Order.total_amount <= max_amount)
    if search:
        search_filter = or_(
            Order.order_number.ilike(f"%{search}%"),
            Order.customer_notes.ilike(f"%{search}%")
        )
        query = query.where(search_filter)
    
    # Apply sorting
    if sort_by == "total_amount":
        if sort_order == "asc":
            query = query.order_by(asc(Order.total_amount))
        else:
            query = query.order_by(desc(Order.total_amount))
    elif sort_by == "order_number":
        if sort_order == "asc":
            query = query.order_by(asc(Order.order_number))
        else:
            query = query.order_by(desc(Order.order_number))
    else:  # created_at
        if sort_order == "asc":
            query = query.order_by(asc(Order.created_at))
        else:
            query = query.order_by(desc(Order.created_at))
    
    # Get total count
    count_query = select(func.count(Order.id))
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        count_query = count_query.where(Order.user_id == current_user.id)
    
    # Apply same filters to count query
    if status:
        count_query = count_query.where(Order.status == status)
    if payment_status:
        count_query = count_query.where(Order.payment_status == payment_status)
    if payment_method:
        count_query = count_query.where(Order.payment_method == payment_method)
    if date_from:
        count_query = count_query.where(Order.created_at >= date_from)
    if date_to:
        count_query = count_query.where(Order.created_at <= date_to)
    if min_amount:
        count_query = count_query.where(Order.total_amount >= min_amount)
    if max_amount:
        count_query = count_query.where(Order.total_amount <= max_amount)
    if search:
        search_filter = or_(
            Order.order_number.ilike(f"%{search}%"),
            Order.customer_notes.ilike(f"%{search}%")
        )
        count_query = count_query.where(search_filter)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
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


@router.get("/{order_id}", response_model=OrderResponse)
@limiter.limit("60/minute")
async def get_order(
    order_id: str,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific order by ID"""
    query = select(Order).where(Order.id == order_id)
    
    # Non-admin users can only see their own orders
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        query = query.where(Order.user_id == current_user.id)
    
    result = await db.execute(query)
    order = result.scalar_one_or_none()
    
    if not order:
        raise NotFoundException("Order not found")
    
    return OrderResponse.from_orm(order)


@router.put("/{order_id}", response_model=OrderResponse)
@limiter.limit("10/minute")
async def update_order(
    order_id: str,
    order_data: OrderUpdate,
    request: Request,
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Update an order (Admin only)"""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise NotFoundException("Order not found")
    
    # Update fields
    update_data = order_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(order, field):
            setattr(order, field, value)
    
    # Update timestamps based on status changes
    if order_data.status == OrderStatus.CONFIRMED and not order.confirmed_at:
        order.confirmed_at = datetime.utcnow()
    elif order_data.status == OrderStatus.SHIPPED and not order.shipped_at:
        order.shipped_at = datetime.utcnow()
    elif order_data.status == OrderStatus.DELIVERED and not order.delivered_at:
        order.delivered_at = datetime.utcnow()
    
    order.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(order)
    
    return OrderResponse.from_orm(order)


@router.delete("/{order_id}")
@limiter.limit("10/minute")
async def cancel_order(
    order_id: str,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel an order"""
    query = select(Order).where(Order.id == order_id)
    
    # Non-admin users can only cancel their own orders
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        query = query.where(Order.user_id == current_user.id)
    
    result = await db.execute(query)
    order = result.scalar_one_or_none()
    
    if not order:
        raise NotFoundException("Order not found")
    
    # Check if order can be cancelled
    if order.status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED]:
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel order that has been shipped or delivered"
        )
    
    # Cancel the order
    order.status = OrderStatus.CANCELLED
    order.updated_at = datetime.utcnow()
    
    # Restore product stock
    result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order_id)
    )
    order_items = result.scalars().all()
    
    for item in order_items:
        result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = result.scalar_one_or_none()
        if product:
            product.stock_quantity += item.quantity
    
    await db.commit()
    
    return {"message": "Order cancelled successfully"}


@router.get("/analytics/summary", response_model=OrderSummary)
@limiter.limit("60/minute")
async def get_order_summary(
    request: Request,
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get order summary analytics (Admin only)"""
    # Get total orders
    total_result = await db.execute(select(func.count(Order.id)))
    total_orders = total_result.scalar()
    
    # Get orders by status
    status_counts = {}
    for status in OrderStatus:
        result = await db.execute(select(func.count(Order.id)).where(Order.status == status))
        status_counts[status.value] = result.scalar()
    
    # Get revenue totals
    revenue_result = await db.execute(select(func.sum(Order.total_amount)))
    total_revenue = revenue_result.scalar() or 0.0
    
    pending_revenue_result = await db.execute(
        select(func.sum(Order.total_amount)).where(Order.payment_status == PaymentStatus.PENDING)
    )
    pending_revenue = pending_revenue_result.scalar() or 0.0
    
    completed_revenue_result = await db.execute(
        select(func.sum(Order.total_amount)).where(Order.payment_status == PaymentStatus.COMPLETED)
    )
    completed_revenue = completed_revenue_result.scalar() or 0.0
    
    return OrderSummary(
        total_orders=total_orders,
        pending_orders=status_counts.get("pending", 0),
        confirmed_orders=status_counts.get("confirmed", 0),
        shipped_orders=status_counts.get("shipped", 0),
        delivered_orders=status_counts.get("delivered", 0),
        cancelled_orders=status_counts.get("cancelled", 0),
        total_revenue=total_revenue,
        pending_revenue=pending_revenue,
        completed_revenue=completed_revenue
    )


@router.get("/user/{user_id}", response_model=List[OrderResponse])
@limiter.limit("60/minute")
async def get_user_orders(
    user_id: str,
    request: Request,
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get orders for a specific user (Admin only)"""
    result = await db.execute(
        select(Order)
        .where(Order.user_id == user_id)
        .order_by(desc(Order.created_at))
    )
    orders = result.scalars().all()
    
    return [OrderResponse.from_orm(order) for order in orders]
