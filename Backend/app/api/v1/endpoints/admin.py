from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException
import logging
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.sqlalchemy_models import User, UserRole, Order, OrderItem, OrderStatus, PaymentStatus, Product, Notification
from app.schemas.user import UserResponse
from app.schemas.order import OrderResponse, OrderItemResponse
from app.schemas.product import ProductResponse
from app.schemas.notification import NotificationResponse
from app.core.security import require_roles
from app.core.exceptions import NotFoundException
from app.core.postgresql import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get admin dashboard statistics"""
    # Get date ranges
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Order statistics
    total_orders_result = await db.execute(select(func.count(Order.id)))
    total_orders = total_orders_result.scalar()
    
    pending_orders_result = await db.execute(select(func.count(Order.id)).where(Order.status == OrderStatus.PENDING))
    pending_orders = pending_orders_result.scalar()
    
    confirmed_orders_result = await db.execute(select(func.count(Order.id)).where(Order.status == OrderStatus.CONFIRMED))
    confirmed_orders = confirmed_orders_result.scalar()
    
    paid_orders_result = await db.execute(select(func.count(Order.id)).where(Order.payment_status == PaymentStatus.COMPLETED))
    paid_orders = paid_orders_result.scalar()
    
    # Recent orders (last 7 days)
    recent_orders_result = await db.execute(select(func.count(Order.id)).where(Order.created_at >= week_ago))
    recent_orders = recent_orders_result.scalar()
    
    # Product statistics
    total_products_result = await db.execute(select(func.count(Product.id)))
    total_products = total_products_result.scalar()
    
    active_products_result = await db.execute(select(func.count(Product.id)).where(Product.is_active == True))
    active_products = active_products_result.scalar()
    
    # User statistics
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar()
    
    total_customers_result = await db.execute(select(func.count(User.id)).where(User.role == UserRole.CUSTOMER))
    total_customers = total_customers_result.scalar()
    
    # Notification statistics
    total_notifications_result = await db.execute(select(func.count(Notification.id)))
    total_notifications = total_notifications_result.scalar()
    
    sent_notifications_result = await db.execute(select(func.count(Notification.id)).where(Notification.is_read == True))
    sent_notifications = sent_notifications_result.scalar()
    
    return {
        "orders": {
            "total": total_orders,
            "pending": pending_orders,
            "confirmed": confirmed_orders,
            "paid": paid_orders,
            "recent_week": recent_orders
        },
        "products": {
            "total": total_products,
            "active": active_products
        },
        "users": {
            "total": total_users,
            "customers": total_customers
        },
        "notifications": {
            "total": total_notifications,
            "sent": sent_notifications
        }
    }


@router.get("/orders", response_model=List[OrderResponse])
async def get_all_orders(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    status: Optional[OrderStatus] = Query(None),
    payment_status: Optional[PaymentStatus] = Query(None),
    user_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all orders with filtering (Admin only)"""
    query = {}
    if status:
        query["status"] = status
    if payment_status:
        query["payment_status"] = payment_status
    if user_id:
        query["user_id"] = user_id
    
    skip = (page - 1) * limit
    orders = await Order.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list()
    
    return [
        OrderResponse(
            id=str(order.id),
            user_id=order.user_id,
            items=order.items,
            shipping_address=order.shipping_address,
            status=order.status,
            payment_status=order.payment_status,
            subtotal=order.subtotal,
            shipping_cost=order.shipping_cost,
            tax=order.tax,
            total=order.total,
            payment_intent_id=order.payment_intent_id,
            tracking_number=order.tracking_number,
            notes=order.notes,
            created_at=order.created_at,
            updated_at=order.updated_at
        )
        for order in orders
    ]




@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    role: Optional[UserRole] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all users (Admin only)"""
    query = {}
    if role:
        query["role"] = role
    
    skip = (page - 1) * limit
    users = await User.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list()
    
    return [
        UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            phone=user.phone,
            addresses=user.addresses,
            is_active=user.is_active,
            created_at=user.created_at
        )
        for user in users
    ]




@router.get("/products", response_model=List[ProductResponse])
async def get_all_products_admin(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all products including inventory (Admin only)"""
    query = {}
    if status:
        query["status"] = status
    if category:
        query["category"] = category
    
    skip = (page - 1) * limit
    products = await Product.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list()
    
    return [
        ProductResponse(
            id=str(product.id),
            name=product.name,
            description=product.description,
            description_arabic=product.description_arabic,
            price=product.price,
            discount_price=product.discount_price,
            images=product.images,
            category=product.category,
            tags=product.tags,
            specifications=product.specifications,
            variants=product.variants,
            colors=product.colors,
            status=product.status,
            is_new=product.is_new,
            is_on_sale=product.is_on_sale,
            rating=product.rating,
            review_count=product.review_count,
            created_at=product.created_at
        )
        for product in products
    ]




@router.get("/notifications", response_model=List[NotificationResponse])
async def get_all_notifications(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all notifications (Admin only)"""
    query = {}
    if type:
        query["type"] = type
    if status:
        query["status"] = status
    
    skip = (page - 1) * limit
    notifications = await Notification.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list()
    
    return [
        NotificationResponse(
            id=str(notification.id),
            type=notification.type,
            channel=notification.channel,
            recipient_email=notification.recipient_email,
            recipient_phone=notification.recipient_phone,
            subject=notification.subject,
            message=notification.message,
            status=notification.status,
            order_id=notification.order_id,
            user_id=notification.user_id,
            metadata=notification.metadata,
            sent_at=notification.sent_at,
            error_message=notification.error_message,
            created_at=notification.created_at
        )
        for notification in notifications
    ]




@router.put("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Toggle user active status (Admin only)"""
    user = await User.get(user_id)
    if not user:
        raise NotFoundException("User not found")
    
    # Prevent admin from deactivating themselves
    if str(user.id) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    
    user.is_active = not user.is_active
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return {"message": f"User {'activated' if user.is_active else 'deactivated'} successfully"}


@router.get("/reports/sales")
async def get_sales_report(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """Get sales report (Admin only)"""
    # Default to last 30 days if no dates provided
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Get orders in date range
    orders = await Order.find(
        Order.created_at >= start_date,
        Order.created_at <= end_date,
        Order.payment_status == PaymentStatus.PAID
    ).to_list()
    
    # Calculate totals
    total_revenue = sum(order.total for order in orders)
    total_orders = len(orders)
    average_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    # Group by date
    daily_sales = {}
    for order in orders:
        date_key = order.created_at.date().isoformat()
        if date_key not in daily_sales:
            daily_sales[date_key] = {"orders": 0, "revenue": 0}
        daily_sales[date_key]["orders"] += 1
        daily_sales[date_key]["revenue"] += order.total
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "summary": {
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "average_order_value": average_order_value
        },
        "daily_sales": daily_sales
    }


@router.get("/requests", response_model=List[OrderResponse])
async def get_all_requests(
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
    status: Optional[OrderStatus] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get all product requests/orders (Admin only)"""
    try:
        # Build query
        query = select(Order)
        
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
    except Exception as e:
        logger.error(f"Error in get_all_requests: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")




@router.get("/analytics")
async def get_analytics(
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Get analytics data (Admin only)"""
    # Get basic analytics data
    total_orders = await Order.count()
    total_products = await Product.count()
    total_users = await User.count()
    
    # Recent activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_orders = await Order.find(Order.created_at >= week_ago).count()
    recent_users = await User.find(User.created_at >= week_ago).count()
    
    return {
        "overview": {
            "total_orders": total_orders,
            "total_products": total_products,
            "total_users": total_users
        },
        "recent_activity": {
            "orders_last_week": recent_orders,
            "new_users_last_week": recent_users
        }
    }


@router.get("/customers", response_model=List[UserResponse])
async def get_all_customers(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all customers (Admin only) - alias for users endpoint"""
    skip = (page - 1) * limit
    users = await User.find(User.role == UserRole.CUSTOMER).sort("created_at", -1).skip(skip).limit(limit).to_list()
    
    return [
        UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            phone=user.phone,
            addresses=user.addresses,
            is_active=user.is_active,
            created_at=user.created_at
        )
        for user in users
    ]


