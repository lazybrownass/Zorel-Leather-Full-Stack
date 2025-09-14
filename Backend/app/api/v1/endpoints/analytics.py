from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.sqlalchemy_models import User, Order, OrderStatus, PaymentStatus, Product, Review, Notification
from app.core.security import require_roles, UserRole
from app.core.exceptions import ValidationException
from app.core.postgresql import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, asc, func

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/dashboard")
async def get_dashboard_analytics(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive dashboard analytics"""
    
    # Calculate date range
    end_date = datetime.utcnow()
    if period == "7d":
        start_date = end_date - timedelta(days=7)
    elif period == "30d":
        start_date = end_date - timedelta(days=30)
    elif period == "90d":
        start_date = end_date - timedelta(days=90)
    else:  # 1y
        start_date = end_date - timedelta(days=365)
    
    # Get basic counts
    total_orders_result = await db.execute(select(func.count(Order.id)))
    total_orders = total_orders_result.scalar()
    
    total_products_result = await db.execute(select(func.count(Product.id)))
    total_products = total_products_result.scalar()
    
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar()
    
    total_reviews_result = await db.execute(select(func.count(Review.id)))
    total_reviews = total_reviews_result.scalar()
    
    # Get period-specific data
    period_orders_query = select(Order).where(
        and_(
            Order.created_at >= start_date,
            Order.created_at <= end_date
        )
    )
    period_orders_result = await db.execute(period_orders_query)
    period_orders = period_orders_result.scalars().all()
    
    period_users_query = select(User).where(
        and_(
            User.created_at >= start_date,
            User.created_at <= end_date
        )
    )
    period_users_result = await db.execute(period_users_query)
    period_users = period_users_result.scalars().all()
    
    # Calculate revenue
    paid_orders_query = select(Order).where(
        and_(
            Order.payment_status == PaymentStatus.COMPLETED,
            Order.created_at >= start_date,
            Order.created_at <= end_date
        )
    )
    paid_orders_result = await db.execute(paid_orders_query)
    paid_orders = paid_orders_result.scalars().all()
    
    total_revenue = sum(order.total_amount for order in paid_orders)
    
    # Order status breakdown
    order_status_counts = {}
    for status in OrderStatus:
        count_query = select(func.count(Order.id)).where(Order.status == status)
        count_result = await db.execute(count_query)
        count = count_result.scalar()
        order_status_counts[status.value] = count
    
    # Payment status breakdown
    payment_status_counts = {}
    for status in PaymentStatus:
        count_query = select(func.count(Order.id)).where(Order.payment_status == status)
        count_result = await db.execute(count_query)
        count = count_result.scalar()
        payment_status_counts[status.value] = count
    
    # Top products by orders
    top_products = await get_top_products_by_orders(limit=5, db=db)
    
    # Top categories
    top_categories = await get_top_categories(limit=5, db=db)
    
    # Recent activity
    recent_orders_query = select(Order).order_by(desc(Order.created_at)).limit(5)
    recent_orders_result = await db.execute(recent_orders_query)
    recent_orders = recent_orders_result.scalars().all()
    
    recent_reviews_query = select(Review).order_by(desc(Review.created_at)).limit(5)
    recent_reviews_result = await db.execute(recent_reviews_query)
    recent_reviews = recent_reviews_result.scalars().all()
    
    return {
        "period": period,
        "date_range": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "overview": {
            "total_orders": total_orders,
            "total_products": total_products,
            "total_users": total_users,
            "total_reviews": total_reviews,
            "period_orders": len(period_orders),
            "period_users": len(period_users),
            "total_revenue": total_revenue
        },
        "order_breakdown": {
            "by_status": order_status_counts,
            "by_payment_status": payment_status_counts
        },
        "top_products": top_products,
        "top_categories": top_categories,
        "recent_activity": {
            "orders": [
                {
                    "id": str(order.id),
                    "user_id": str(order.user_id),
                    "total": order.total_amount,
                    "status": order.status.value,
                    "created_at": order.created_at
                }
                for order in recent_orders
            ],
            "reviews": [
                {
                    "id": str(review.id),
                    "product_id": str(review.product_id),
                    "rating": review.rating,
                    "created_at": review.created_at
                }
                for review in recent_reviews
            ]
        }
    }


@router.get("/sales")
async def get_sales_analytics(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    group_by: str = Query("day", regex="^(day|week|month)$")
):
    """Get sales analytics with time series data"""
    
    # Default to last 30 days if no dates provided
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Get paid orders in date range
    orders = await Order.find(
        Order.payment_status == PaymentStatus.PAID,
        Order.created_at >= start_date,
        Order.created_at <= end_date
    ).to_list()
    
    # Group orders by time period
    sales_data = {}
    for order in orders:
        if group_by == "day":
            key = order.created_at.date().isoformat()
        elif group_by == "week":
            # Get week start (Monday)
            week_start = order.created_at.date() - timedelta(days=order.created_at.weekday())
            key = week_start.isoformat()
        else:  # month
            key = order.created_at.strftime("%Y-%m")
        
        if key not in sales_data:
            sales_data[key] = {"revenue": 0, "orders": 0}
        
        sales_data[key]["revenue"] += order.total
        sales_data[key]["orders"] += 1
    
    # Convert to list and sort
    sales_timeline = [
        {"period": period, "revenue": data["revenue"], "orders": data["orders"]}
        for period, data in sorted(sales_data.items())
    ]
    
    # Calculate totals
    total_revenue = sum(data["revenue"] for data in sales_data.values())
    total_orders = sum(data["orders"] for data in sales_data.values())
    average_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    return {
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat(),
            "group_by": group_by
        },
        "summary": {
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "average_order_value": average_order_value
        },
        "timeline": sales_timeline
    }


@router.get("/products")
async def get_product_analytics(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    limit: int = Query(10, ge=1, le=50)
):
    """Get product performance analytics"""
    
    # Get all products with their order counts
    products = await Product.find().to_list()
    
    product_analytics = []
    for product in products:
        # Count orders containing this product
        order_count = await Order.find(
            {"items.product_id": str(product.id)}
        ).count()
        
        # Get review stats
        reviews = await Review.find(
            Review.product_id == str(product.id),
            Review.is_approved == True
        ).to_list()
        
        total_reviews = len(reviews)
        avg_rating = sum(r.rating for r in reviews) / total_reviews if total_reviews > 0 else 0
        
        product_analytics.append({
            "product_id": str(product.id),
            "name": product.name,
            "category": product.category,
            "price": product.price,
            "order_count": order_count,
            "total_reviews": total_reviews,
            "average_rating": round(avg_rating, 1),
            "status": product.status,
            "created_at": product.created_at
        })
    
    # Sort by order count
    product_analytics.sort(key=lambda x: x["order_count"], reverse=True)
    
    return {
        "top_products": product_analytics[:limit],
        "summary": {
            "total_products": len(products),
            "active_products": len([p for p in products if p.status == "active"]),
            "products_with_orders": len([p for p in product_analytics if p["order_count"] > 0]),
            "products_with_reviews": len([p for p in product_analytics if p["total_reviews"] > 0])
        }
    }


@router.get("/users")
async def get_user_analytics(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$")
):
    """Get user analytics and behavior"""
    
    # Calculate date range
    end_date = datetime.utcnow()
    if period == "7d":
        start_date = end_date - timedelta(days=7)
    elif period == "30d":
        start_date = end_date - timedelta(days=30)
    elif period == "90d":
        start_date = end_date - timedelta(days=90)
    else:  # 1y
        start_date = end_date - timedelta(days=365)
    
    # Get user counts
    total_users = await User.count()
    period_users = await User.find(
        User.created_at >= start_date,
        User.created_at <= end_date
    ).count()
    
    # Get user role breakdown
    customers = await User.find(User.role == "customer").count()
    admins = await User.find(User.role == "admin").count()
    
    # Get users with orders
    users_with_orders = await User.aggregate([
        {"$lookup": {
            "from": "orders",
            "localField": "_id",
            "foreignField": "user_id",
            "as": "orders"
        }},
        {"$match": {"orders": {"$ne": []}}},
        {"$count": "count"}
    ]).to_list(1)
    
    users_with_orders_count = users_with_orders[0]["count"] if users_with_orders else 0
    
    # Get top customers by order value
    top_customers = await get_top_customers_by_revenue(limit=10)
    
    return {
        "period": period,
        "overview": {
            "total_users": total_users,
            "period_new_users": period_users,
            "customers": customers,
            "admins": admins,
            "users_with_orders": users_with_orders_count
        },
        "top_customers": top_customers
    }


async def get_top_products_by_orders(limit: int = 5, db: AsyncSession = None) -> List[Dict]:
    """Get top products by number of orders"""
    if db is None:
        # This is a simplified version - in a real implementation, 
        # you'd need to join OrderItem with Product tables
        return []
    
    # Simplified query - get products with their order item counts
    from app.models.sqlalchemy_models import OrderItem
    
    query = select(
        Product.id,
        Product.name,
        func.count(OrderItem.id).label('order_count'),
        func.sum(OrderItem.quantity).label('total_quantity')
    ).join(OrderItem, Product.id == OrderItem.product_id)\
     .group_by(Product.id, Product.name)\
     .order_by(desc('order_count'))\
     .limit(limit)
    
    result = await db.execute(query)
    rows = result.fetchall()
    
    top_products = []
    for row in rows:
        top_products.append({
            "product_id": str(row.id),
            "name": row.name,
            "order_count": row.order_count,
            "total_quantity": row.total_quantity
        })
    
    return top_products


async def get_top_categories(limit: int = 5, db: AsyncSession = None) -> List[Dict]:
    """Get top categories by order count"""
    if db is None:
        return []
    
    # Simplified query - get categories with their product counts
    query = select(
        Product.category,
        func.count(Product.id).label('product_count')
    ).group_by(Product.category)\
     .order_by(desc('product_count'))\
     .limit(limit)
    
    result = await db.execute(query)
    rows = result.fetchall()
    
    top_categories = []
    for row in rows:
        top_categories.append({
            "category": row.category,
            "product_count": row.product_count
        })
    
    return top_categories


async def get_top_customers_by_revenue(limit: int = 10) -> List[Dict]:
    """Get top customers by total revenue"""
    pipeline = [
        {"$match": {"payment_status": PaymentStatus.PAID}},
        {"$group": {
            "_id": "$user_id",
            "total_revenue": {"$sum": "$total"},
            "order_count": {"$sum": 1}
        }},
        {"$sort": {"total_revenue": -1}},
        {"$limit": limit}
    ]
    
    results = await Order.aggregate(pipeline).to_list()
    
    # Get user details
    top_customers = []
    for result in results:
        user = await User.get(result["_id"])
        if user:
            top_customers.append({
                "user_id": result["_id"],
                "name": user.name,
                "email": user.email,
                "total_revenue": result["total_revenue"],
                "order_count": result["order_count"]
            })
    
    return top_customers
