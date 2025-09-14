from typing import List, Optional
from datetime import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.sqlalchemy_models import (
    Order, 
    OrderItem,
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
    User
)
from app.schemas.order import (
    OrderCreate,
    OrderUpdate,
    OrderResponse,
    OrderItemResponse,
    OrderFilters
)
from app.core.security import get_current_active_user, require_roles, UserRole
from app.core.exceptions import NotFoundException, ForbiddenException
from app.core.postgresql import get_db
from app.services.notification_service import NotificationService

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
    try:
        # Calculate totals
        subtotal = sum(item.price * item.quantity for item in order_data.items)
        tax = subtotal * 0.0833  # 8.33% tax
        total = subtotal + order_data.shipping_cost + tax
        
        # Create order
        order = Order(
            user_id=current_user.id,
            customer_name=order_data.customer_name,
            customer_email=order_data.customer_email,
            customer_phone=order_data.customer_phone,
            order_number=f"ORD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{str(current_user.id)[:8]}",
            status=OrderStatus.PENDING,
            total_amount=total,
            gst_amount=tax,
            payment_method=PaymentMethod.ONLINE,
            payment_status=PaymentStatus.PENDING,
            shipping_address=order_data.shipping_address,
            customer_notes=order_data.notes
        )
        
        db.add(order)
        await db.commit()
        await db.refresh(order)
        
        # Create order items
        for item in order_data.items:
            # Convert product_id to UUID if it's a string
            try:
                product_uuid = uuid.UUID(item.product_id) if isinstance(item.product_id, str) else item.product_id
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid product_id format: {item.product_id}")
            
            order_item = OrderItem(
                order_id=order.id,
                product_id=product_uuid,
                quantity=item.quantity,
                price=item.price
            )
            db.add(order_item)
        
        await db.commit()
        
        # Send notification to admin
        notification_service = NotificationService()
        await notification_service.send_order_request_notification(order)
        
        # Get order items for response
        result = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
        order_items = result.scalars().all()
        items_response = [
            OrderItemResponse(
                id=str(item.id),
                product_id=str(item.product_id),
                quantity=item.quantity,
                price=item.price
            )
            for item in order_items
        ]
        
        return OrderResponse(
            id=str(order.id),
            customer_name=order.customer_name,
            customer_email=order.customer_email,
            customer_phone=order.customer_phone,
            shipping_address=order.shipping_address,
            items=items_response,
            status=order.status,
            payment_status=order.payment_status,
            payment_method=order.payment_method,
            total_amount=order.total_amount,
            tracking_number=order.tracking_number,
            notes=order.customer_notes,
            created_at=order.created_at,
            updated_at=order.updated_at
        )
    
    except Exception as e:
        await db.rollback()
        print(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get order by ID (user can only see their own orders)"""
    order = await Order.get(order_id)
    if not order:
        raise NotFoundException("Order not found")
    
    # Check if user owns this order or is admin
    if order.user_id != str(current_user.id) and current_user.role != UserRole.ADMIN:
        raise ForbiddenException("Access denied")
    
    return OrderResponse(
        id=str(order.id),
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        shipping_address=order.shipping_address,
        items=order.items,
        status=order.status,
        payment_status=order.payment_status,
        total_amount=order.total,
        tracking_number=order.tracking_number,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at
    )


@router.get("/", response_model=List[OrderResponse])
async def get_user_orders(
    current_user: User = Depends(get_current_active_user),
    status: Optional[OrderStatus] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's orders"""
    from sqlalchemy import select
    from app.models.sqlalchemy_models import Order, OrderItem
    from app.schemas.order import OrderItemResponse
    
    # Build query
    query = select(Order).where(Order.user_id == current_user.id)
    
    if status:
        query = query.where(Order.status == status)
    
    # Apply pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit).order_by(Order.created_at.desc())
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    # Convert to response format
    order_responses = []
    for order in orders:
        # Get order items
        items_result = await db.execute(
            select(OrderItem).where(OrderItem.order_id == order.id)
        )
        items = items_result.scalars().all()
        
        items_response = [
            OrderItemResponse(
                product_id=str(item.product_id),
                quantity=item.quantity,
                price=item.price,
                size=item.size,
                color=item.color
            )
            for item in items
        ]
        
        order_responses.append(OrderResponse(
            id=str(order.id),
            customer_name=order.customer_name,
            customer_email=order.customer_email,
            customer_phone=order.customer_phone,
            shipping_address=order.shipping_address,
            items=items_response,
            status=order.status,
            payment_status=order.payment_status,
            payment_method=order.payment_method,
            total_amount=order.total_amount,
            tracking_number=order.tracking_number,
            notes=order.customer_notes,
            created_at=order.created_at,
            updated_at=order.updated_at
        ))
    
    return order_responses


@router.put("/{order_id}/confirm", response_model=OrderResponse)
async def confirm_order(
    order_id: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Confirm an order (Admin only)"""
    order = await Order.get(order_id)
    if not order:
        raise NotFoundException("Order not found")
    
    if order.status != OrderStatus.PENDING_CONFIRMATION:
        raise HTTPException(status_code=400, detail="Order cannot be confirmed")
    
    # Update order status
    order.status = OrderStatus.CONFIRMED
    order.updated_at = datetime.utcnow()
    await order.save()
    
    # Send confirmation notification with payment link
    notification_service = NotificationService()
    await notification_service.send_order_confirmation_notification(order)
    
    return OrderResponse(
        id=str(order.id),
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        shipping_address=order.shipping_address,
        items=order.items,
        status=order.status,
        payment_status=order.payment_status,
        total_amount=order.total,
        tracking_number=order.tracking_number,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at
    )


@router.put("/{order_id}/reject", response_model=OrderResponse)
async def reject_order(
    order_id: str,
    reason: str = Query(..., description="Reason for rejection"),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Reject an order (Admin only)"""
    order = await Order.get(order_id)
    if not order:
        raise NotFoundException("Order not found")
    
    if order.status != OrderStatus.PENDING_CONFIRMATION:
        raise HTTPException(status_code=400, detail="Order cannot be rejected")
    
    # Update order status
    order.status = OrderStatus.REJECTED
    order.notes = f"Rejected: {reason}"
    order.updated_at = datetime.utcnow()
    await order.save()
    
    # Send rejection notification
    notification_service = NotificationService()
    await notification_service.send_order_rejection_notification(order, reason)
    
    return OrderResponse(
        id=str(order.id),
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        shipping_address=order.shipping_address,
        items=order.items,
        status=order.status,
        payment_status=order.payment_status,
        total_amount=order.total,
        tracking_number=order.tracking_number,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at
    )


@router.put("/{order_id}/ship", response_model=OrderResponse)
async def ship_order(
    order_id: str,
    tracking_number: str = Query(..., description="Tracking number"),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Mark order as shipped (Admin only)"""
    order = await Order.get(order_id)
    if not order:
        raise NotFoundException("Order not found")
    
    if order.status != OrderStatus.PAID:
        raise HTTPException(status_code=400, detail="Order must be paid before shipping")
    
    # Update order status
    order.status = OrderStatus.SHIPPED
    order.tracking_number = tracking_number
    order.updated_at = datetime.utcnow()
    await order.save()
    
    # Send shipping notification
    notification_service = NotificationService()
    await notification_service.send_order_shipped_notification(order)
    
    return OrderResponse(
        id=str(order.id),
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        shipping_address=order.shipping_address,
        items=order.items,
        status=order.status,
        payment_status=order.payment_status,
        total_amount=order.total,
        tracking_number=order.tracking_number,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at
    )
