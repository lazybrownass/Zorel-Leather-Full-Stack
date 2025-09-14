from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date
from app.models.sqlalchemy_models import User, UserRole, Order, OrderStatus, PaymentStatus
from app.schemas.user import UserResponse, UserUpdate
from app.core.security import require_roles
from app.core.postgresql import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, asc, func
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_all_customers(
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get all customers with filtering and pagination (Admin only)"""
    try:
        # Build query for customers only
        query = select(User).where(User.role == UserRole.CUSTOMER)
        
        if is_active is not None:
            query = query.where(User.is_active == is_active)
        if date_from:
            query = query.where(User.created_at >= datetime.combine(date_from, datetime.min.time()))
        if date_to:
            query = query.where(User.created_at <= datetime.combine(date_to, datetime.max.time()))
        if search:
            query = query.where(
                or_(
                    User.name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%"),
                    User.phone.ilike(f"%{search}%")
                )
            )
        
        # Sort
        sort_field = getattr(User, sort_by) if hasattr(User, sort_by) else User.created_at
        if sort_order == "desc":
            query = query.order_by(desc(sort_field))
        else:
            query = query.order_by(asc(sort_field))
        
        # Pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        result = await db.execute(query)
        customers = result.scalars().all()
        
        return [
            UserResponse(
                id=str(customer.id),
                name=customer.name,
                email=customer.email,
                role=customer.role.value,
                phone=customer.phone,
                addresses=customer.addresses,
                is_active=customer.is_active,
                created_at=customer.created_at
            )
            for customer in customers
        ]
        
    except Exception as e:
        logger.error(f"Error fetching customers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch customers"
        )


@router.get("/{customer_id}", response_model=UserResponse)
async def get_customer(
    customer_id: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific customer (Admin only)"""
    try:
        import uuid
        
        # Validate UUID format
        try:
            customer_uuid = uuid.UUID(customer_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        query = select(User).where(User.id == customer_uuid, User.role == UserRole.CUSTOMER)
        result = await db.execute(query)
        customer = result.scalar_one_or_none()
        
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        return UserResponse(
            id=str(customer.id),
            name=customer.name,
            email=customer.email,
            role=customer.role.value,
            phone=customer.phone,
            addresses=customer.addresses,
            is_active=customer.is_active,
            created_at=customer.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching customer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch customer"
        )


@router.put("/{customer_id}", response_model=UserResponse)
async def update_customer(
    customer_id: str,
    customer_update: UserUpdate,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Update a customer (Admin only)"""
    try:
        import uuid
        
        # Validate UUID format
        try:
            customer_uuid = uuid.UUID(customer_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        query = select(User).where(User.id == customer_uuid, User.role == UserRole.CUSTOMER)
        result = await db.execute(query)
        customer = result.scalar_one_or_none()
        
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Update fields
        update_data = customer_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(customer, field):
                setattr(customer, field, value)
        
        await db.commit()
        await db.refresh(customer)
        
        logger.info(f"Customer updated: {customer.email} by {current_user.email}")
        
        return UserResponse(
            id=str(customer.id),
            name=customer.name,
            email=customer.email,
            role=customer.role.value,
            phone=customer.phone,
            addresses=customer.addresses,
            is_active=customer.is_active,
            created_at=customer.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating customer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update customer"
        )


@router.get("/{customer_id}/orders")
async def get_customer_orders(
    customer_id: str,
    status: Optional[OrderStatus] = Query(None),
    payment_status: Optional[PaymentStatus] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get orders for a specific customer (Admin only)"""
    try:
        import uuid
        
        # Validate UUID format
        try:
            customer_uuid = uuid.UUID(customer_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Verify customer exists
        customer_query = select(User).where(User.id == customer_uuid, User.role == UserRole.CUSTOMER)
        customer_result = await db.execute(customer_query)
        customer = customer_result.scalar_one_or_none()
        
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Build query
        query = select(Order).where(Order.user_id == customer_uuid)
        if status:
            query = query.where(Order.status == status)
        if payment_status:
            query = query.where(Order.payment_status == payment_status)
        
        # Pagination
        offset = (page - 1) * limit
        
        query = query.order_by(desc(Order.created_at)).offset(offset).limit(limit)
        result = await db.execute(query)
        orders = result.scalars().all()
        
        return [
            {
                "id": str(order.id),
                "status": order.status.value,
                "payment_status": order.payment_status.value,
                "total": order.total_amount,
                "items_count": 0,  # This would need to be calculated from order items
                "created_at": order.created_at,
                "updated_at": order.updated_at
            }
            for order in orders
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching customer orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch customer orders"
        )


@router.get("/{customer_id}/analytics")
async def get_customer_analytics(
    customer_id: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get analytics for a specific customer (Admin only)"""
    try:
        import uuid
        
        # Validate UUID format
        try:
            customer_uuid = uuid.UUID(customer_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Verify customer exists
        customer_query = select(User).where(User.id == customer_uuid, User.role == UserRole.CUSTOMER)
        customer_result = await db.execute(customer_query)
        customer = customer_result.scalar_one_or_none()
        
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Get order statistics
        total_orders_query = select(func.count(Order.id)).where(Order.user_id == customer_uuid)
        total_orders_result = await db.execute(total_orders_query)
        total_orders = total_orders_result.scalar()
        
        paid_orders_query = select(Order).where(
            Order.user_id == customer_uuid,
            Order.payment_status == PaymentStatus.COMPLETED
        )
        paid_orders_result = await db.execute(paid_orders_query)
        paid_orders = paid_orders_result.scalars().all()
        
        total_spent = sum(order.total_amount for order in paid_orders)
        average_order_value = total_spent / len(paid_orders) if paid_orders else 0
        
        # Get last order date
        last_order_query = select(Order).where(Order.user_id == customer_uuid).order_by(desc(Order.created_at)).limit(1)
        last_order_result = await db.execute(last_order_query)
        last_order = last_order_result.scalar_one_or_none()
        last_order_date = last_order.created_at if last_order else None
        
        # Get order status breakdown
        status_breakdown = {}
        for status in OrderStatus:
            count_query = select(func.count(Order.id)).where(
                Order.user_id == customer_uuid,
                Order.status == status
            )
            count_result = await db.execute(count_query)
            count = count_result.scalar()
            status_breakdown[status.value] = count
        
        # Get payment method breakdown
        payment_method_breakdown = {}
        for order in paid_orders:
            if order.payment_method:
                method = order.payment_method.value
                payment_method_breakdown[method] = payment_method_breakdown.get(method, 0) + 1
        
        return {
            "customer_id": customer_id,
            "customer_name": customer.name,
            "customer_email": customer.email,
            "total_orders": total_orders,
            "total_spent": total_spent,
            "average_order_value": average_order_value,
            "last_order_date": last_order_date,
            "status_breakdown": status_breakdown,
            "payment_method_breakdown": payment_method_breakdown,
            "customer_since": customer.created_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching customer analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch customer analytics"
        )


@router.post("/{customer_id}/toggle-status")
async def toggle_customer_status(
    customer_id: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Toggle customer active status (Admin only)"""
    try:
        import uuid
        
        # Validate UUID format
        try:
            customer_uuid = uuid.UUID(customer_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        query = select(User).where(User.id == customer_uuid, User.role == UserRole.CUSTOMER)
        result = await db.execute(query)
        customer = result.scalar_one_or_none()
        
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        customer.is_active = not customer.is_active
        await db.commit()
        await db.refresh(customer)
        
        status_text = "activated" if customer.is_active else "deactivated"
        logger.info(f"Customer {status_text}: {customer.email} by {current_user.email}")
        
        return {
            "message": f"Customer {status_text} successfully",
            "is_active": customer.is_active
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling customer status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to toggle customer status"
        )


@router.get("/stats/summary")
async def get_customer_stats(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get customer statistics summary (Admin only)"""
    try:
        # Total customers
        total_customers_query = select(func.count(User.id)).where(User.role == UserRole.CUSTOMER)
        total_customers_result = await db.execute(total_customers_query)
        total_customers = total_customers_result.scalar()
        
        # Active customers
        active_customers_query = select(func.count(User.id)).where(
            User.role == UserRole.CUSTOMER,
            User.is_active == True
        )
        active_customers_result = await db.execute(active_customers_query)
        active_customers = active_customers_result.scalar()
        
        # New customers this month
        now = datetime.utcnow()
        month_start = datetime(now.year, now.month, 1)
        new_customers_query = select(func.count(User.id)).where(
            User.role == UserRole.CUSTOMER,
            User.created_at >= month_start
        )
        new_customers_result = await db.execute(new_customers_query)
        new_customers_this_month = new_customers_result.scalar()
        
        # New customers today
        today = datetime.now().date()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        new_customers_today_query = select(func.count(User.id)).where(
            User.role == UserRole.CUSTOMER,
            User.created_at >= today_start,
            User.created_at <= today_end
        )
        new_customers_today_result = await db.execute(new_customers_today_query)
        new_customers_today = new_customers_today_result.scalar()
        
        # Top customers by spending
        top_customers_query = select(
            User.id,
            User.name,
            User.email,
            func.sum(Order.total_amount).label('total_spent'),
            func.count(Order.id).label('order_count')
        ).join(Order, User.id == Order.user_id).where(
            Order.payment_status == PaymentStatus.COMPLETED
        ).group_by(User.id, User.name, User.email).order_by(
            desc(func.sum(Order.total_amount))
        ).limit(10)
        
        top_customers_result = await db.execute(top_customers_query)
        top_customers = [
            {
                "customer_id": str(row.id),
                "customer_name": row.name,
                "customer_email": row.email,
                "total_spent": row.total_spent,
                "order_count": row.order_count
            }
            for row in top_customers_result
        ]
        
        return {
            "total_customers": total_customers,
            "active_customers": active_customers,
            "inactive_customers": total_customers - active_customers,
            "new_customers_this_month": new_customers_this_month,
            "new_customers_today": new_customers_today,
            "top_customers": top_customers
        }
        
    except Exception as e:
        logger.error(f"Error fetching customer stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch customer statistics"
        )
