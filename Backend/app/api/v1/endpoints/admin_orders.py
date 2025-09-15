from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date
from app.models.sqlalchemy_models import User, UserRole, Order, OrderStatus, PaymentStatus, OrderItem
from app.schemas.order import OrderResponse, OrderItemResponse
from app.core.security import require_roles
from app.core.postgresql import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, asc, func
import logging
import uuid

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=List[OrderResponse])
async def get_all_orders(
    status: Optional[OrderStatus] = Query(None),
    payment_status: Optional[PaymentStatus] = Query(None),
    user_id: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get all orders with filtering and pagination (Admin only)"""
    try:
        # Build query
        query = select(Order)
        
        # Apply filters
        if status:
            query = query.where(Order.status == status)
        if payment_status:
            query = query.where(Order.payment_status == payment_status)
        if user_id:
            try:
                user_uuid = uuid.UUID(user_id)
                query = query.where(Order.user_id == user_uuid)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid user ID format"
                )
        if date_from:
            query = query.where(Order.created_at >= datetime.combine(date_from, datetime.min.time()))
        if date_to:
            query = query.where(Order.created_at <= datetime.combine(date_to, datetime.max.time()))
        
        # Sort
        sort_field = getattr(Order, sort_by) if hasattr(Order, sort_by) else Order.created_at
        if sort_order == "desc":
            query = query.order_by(desc(sort_field))
        else:
            query = query.order_by(asc(sort_field))
        
        # Pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
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
                    id=str(item.id),
                    product_id=str(item.product_id),
                    quantity=item.quantity,
                    price=item.price
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch orders"
        )