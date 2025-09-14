from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from app.models.sqlalchemy_models import User, UserRole, Order, OrderStatus, PaymentStatus, PaymentMethod, Product
from app.core.security import require_roles
from app.core.postgresql import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, asc, func
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard statistics (Admin only)"""
    try:
        now = datetime.utcnow()
        today = now.date()
        month_start = datetime(now.year, now.month, 1)
        
        # Today's stats
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        
        today_orders_query = select(func.count(Order.id)).where(
            Order.created_at >= today_start,
            Order.created_at <= today_end
        )
        today_orders_result = await db.execute(today_orders_query)
        today_orders = today_orders_result.scalar()
        
        today_revenue_query = select(func.sum(Order.total_amount)).where(
            Order.created_at >= today_start,
            Order.created_at <= today_end,
            Order.payment_status == PaymentStatus.COMPLETED
        )
        today_revenue_result = await db.execute(today_revenue_query)
        today_revenue = today_revenue_result.scalar() or 0
        
        today_customers_query = select(func.count(User.id)).where(
            User.role == UserRole.CUSTOMER,
            User.created_at >= today_start,
            User.created_at <= today_end
        )
        today_customers_result = await db.execute(today_customers_query)
        today_customers = today_customers_result.scalar()
        
        # This month's stats
        month_orders_query = select(func.count(Order.id)).where(
            Order.created_at >= month_start
        )
        month_orders_result = await db.execute(month_orders_query)
        month_orders = month_orders_result.scalar()
        
        month_revenue_query = select(func.sum(Order.total_amount)).where(
            Order.created_at >= month_start,
            Order.payment_status == PaymentStatus.COMPLETED
        )
        month_revenue_result = await db.execute(month_revenue_query)
        month_revenue = month_revenue_result.scalar() or 0
        
        month_customers_query = select(func.count(User.id)).where(
            User.role == UserRole.CUSTOMER,
            User.created_at >= month_start
        )
        month_customers_result = await db.execute(month_customers_query)
        month_customers = month_customers_result.scalar()
        
        # Last month for comparison
        last_month_start = (month_start - timedelta(days=1)).replace(day=1)
        last_month_end = month_start - timedelta(days=1)
        
        last_month_orders_query = select(func.count(Order.id)).where(
            Order.created_at >= last_month_start,
            Order.created_at <= last_month_end
        )
        last_month_orders_result = await db.execute(last_month_orders_query)
        last_month_orders = last_month_orders_result.scalar()
        
        last_month_revenue_query = select(func.sum(Order.total_amount)).where(
            Order.created_at >= last_month_start,
            Order.created_at <= last_month_end,
            Order.payment_status == PaymentStatus.COMPLETED
        )
        last_month_revenue_result = await db.execute(last_month_revenue_query)
        last_month_revenue = last_month_revenue_result.scalar() or 0
        
        last_month_customers_query = select(func.count(User.id)).where(
            User.role == UserRole.CUSTOMER,
            User.created_at >= last_month_start,
            User.created_at <= last_month_end
        )
        last_month_customers_result = await db.execute(last_month_customers_query)
        last_month_customers = last_month_customers_result.scalar()
        
        # Calculate growth percentages
        orders_growth = ((month_orders - last_month_orders) / last_month_orders * 100) if last_month_orders > 0 else 0
        revenue_growth = ((month_revenue - last_month_revenue) / last_month_revenue * 100) if last_month_revenue > 0 else 0
        customers_growth = ((month_customers - last_month_customers) / last_month_customers * 100) if last_month_customers > 0 else 0
        
        # Top products (simplified - would need order items table for full implementation)
        top_products = []  # This would need to be implemented with proper order items relationship
        
        # Recent orders
        recent_orders_query = select(Order).order_by(desc(Order.created_at)).limit(5)
        recent_orders_result = await db.execute(recent_orders_query)
        recent_orders = recent_orders_result.scalars().all()
        
        recent_orders_data = [
            {
                "id": str(order.id),
                "customer_name": order.shipping_address.get("name", "Unknown") if order.shipping_address else "Unknown",
                "total": order.total_amount,
                "status": order.status.value,
                "created_at": order.created_at
            }
            for order in recent_orders
        ]
        
        # Revenue chart data (last 30 days)
        revenue_chart = []
        for i in range(30):
            date = today - timedelta(days=i)
            date_start = datetime.combine(date, datetime.min.time())
            date_end = datetime.combine(date, datetime.max.time())
            
            daily_revenue_query = select(func.sum(Order.total_amount)).where(
                Order.created_at >= date_start,
                Order.created_at <= date_end,
                Order.payment_status == PaymentStatus.COMPLETED
            )
            daily_revenue_result = await db.execute(daily_revenue_query)
            daily_revenue = daily_revenue_result.scalar() or 0
            
            revenue_chart.append({
                "date": date.isoformat(),
                "revenue": daily_revenue
            })
        
        revenue_chart.reverse()
        
        # Order status breakdown
        order_status_breakdown = {}
        for status in OrderStatus:
            count_query = select(func.count(Order.id)).where(Order.status == status)
            count_result = await db.execute(count_query)
            count = count_result.scalar()
            order_status_breakdown[status.value] = count
        
        return {
            "today_orders": today_orders,
            "today_revenue": today_revenue,
            "today_customers": today_customers,
            "month_orders": month_orders,
            "month_revenue": month_revenue,
            "month_customers": month_customers,
            "orders_growth": orders_growth,
            "revenue_growth": revenue_growth,
            "customers_growth": customers_growth,
            "top_products": top_products,
            "recent_orders": recent_orders_data,
            "revenue_chart": revenue_chart,
            "order_status_breakdown": order_status_breakdown
        }
        
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch dashboard statistics"
        )


@router.get("/products")
async def get_product_analytics(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get product analytics (Admin only)"""
    try:
        # Get all products with their analytics
        products_query = select(Product).limit(limit)
        products_result = await db.execute(products_query)
        products = products_result.scalars().all()
        
        product_analytics = []
        
        for product in products:
            # Get order statistics for this product (simplified - would need order items table)
            # For now, return basic product info
            product_analytics.append({
                "product_id": str(product.id),
                "product_name": product.name,
                "total_sold": 0,  # Placeholder - would need order items table
                "total_revenue": 0.0,  # Placeholder - would need order items table
                "average_rating": 4.5,  # Placeholder - implement rating system
                "views": 0,  # Placeholder - implement view tracking
                "conversion_rate": 0.0,  # Placeholder - implement conversion tracking
                "last_sold": None  # Placeholder - would need order items table
            })
        
        return product_analytics
        
    except Exception as e:
        logger.error(f"Error fetching product analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch product analytics"
        )


@router.get("/customers")
async def get_customer_analytics(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get customer analytics (Admin only)"""
    try:
        # Get top customers by spending
        customer_analytics_query = select(
            User.id,
            User.name,
            func.count(Order.id).label('total_orders'),
            func.sum(Order.total_amount).label('total_spent'),
            func.max(Order.created_at).label('last_order_date')
        ).join(Order, User.id == Order.user_id).where(
            Order.payment_status == PaymentStatus.COMPLETED
        ).group_by(User.id, User.name).order_by(
            desc(func.sum(Order.total_amount))
        ).limit(limit)
        
        customer_analytics_result = await db.execute(customer_analytics_query)
        customer_analytics = [
            {
                "customer_id": str(row.id),
                "customer_name": row.name,
                "total_orders": row.total_orders,
                "total_spent": row.total_spent,
                "average_order_value": row.total_spent / row.total_orders if row.total_orders > 0 else 0,
                "last_order_date": row.last_order_date,
                "customer_lifetime_value": row.total_spent
            }
            for row in customer_analytics_result
        ]
        
        return customer_analytics
        
    except Exception as e:
        logger.error(f"Error fetching customer analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch customer analytics"
        )


@router.get("/revenue/trend")
async def get_revenue_trend(
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Get revenue trend data (Admin only)"""
    try:
        now = datetime.utcnow()
        days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
        
        revenue_data = []
        for i in range(days):
            date = now.date() - timedelta(days=i)
            date_start = datetime.combine(date, datetime.min.time())
            date_end = datetime.combine(date, datetime.max.time())
            
            daily_revenue = await Order.aggregate([
                {"$match": {
                    "created_at": {"$gte": date_start, "$lte": date_end},
                    "payment_status": PaymentStatus.PAID
                }},
                {"$group": {"_id": None, "total": {"$sum": "$total"}}}
            ]).to_list()
            
            revenue_data.append({
                "date": date.isoformat(),
                "revenue": daily_revenue[0]["total"] if daily_revenue else 0
            })
        
        revenue_data.reverse()
        return {"period": period, "data": revenue_data}
        
    except Exception as e:
        logger.error(f"Error fetching revenue trend: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch revenue trend"
        )


@router.get("/payment-methods")
async def get_payment_method_analytics(
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Get payment method analytics (Admin only)"""
    try:
        # Get payment method breakdown
        payment_method_stats = await Order.aggregate([
            {"$match": {"payment_status": PaymentStatus.PAID}},
            {"$group": {
                "_id": "$payment_method",
                "count": {"$sum": 1},
                "total_revenue": {"$sum": "$total"}
            }},
            {"$sort": {"total_revenue": -1}}
        ]).to_list()
        
        return {
            "payment_methods": payment_method_stats,
            "total_orders": sum(item["count"] for item in payment_method_stats),
            "total_revenue": sum(item["total_revenue"] for item in payment_method_stats)
        }
        
    except Exception as e:
        logger.error(f"Error fetching payment method analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch payment method analytics"
        )
