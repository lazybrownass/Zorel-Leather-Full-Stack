from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy import select, and_, or_, desc, asc, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sqlalchemy_models import Order, User
from app.schemas.order import OrderUpdate, OrderResponse, OrderFilters, OrderListResponse
from app.core.postgresql import get_db
from app.core.security import require_roles, UserRole
from app.services.notification_service import NotificationService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=OrderListResponse)
async def get_all_orders(
    status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get all orders with filtering and pagination (Admin only)"""
    try:
        # Build base query
        query = select(Order)
        
        # Apply filters
        if status:
            query = query.where(Order.status == status)
        if payment_status:
            query = query.where(Order.payment_status == payment_status)
        if payment_method:
            query = query.where(Order.payment_method == payment_method)
        if user_id:
            query = query.where(Order.user_id == user_id)
        if date_from:
            query = query.where(Order.created_at >= datetime.combine(date_from, datetime.min.time()))
        if date_to:
            query = query.where(Order.created_at <= datetime.combine(date_to, datetime.max.time()))
        if search:
            search_filter = or_(
                Order.tracking_number.ilike(f"%{search}%"),
                Order.order_number.ilike(f"%{search}%")
            )
            query = query.where(search_filter)
        
        # Get total count
        count_query = select(func.count(Order.id))
        if status:
            count_query = count_query.where(Order.status == status)
        if payment_status:
            count_query = count_query.where(Order.payment_status == payment_status)
        if payment_method:
            count_query = count_query.where(Order.payment_method == payment_method)
        if user_id:
            count_query = count_query.where(Order.user_id == user_id)
        if date_from:
            count_query = count_query.where(Order.created_at >= datetime.combine(date_from, datetime.min.time()))
        if date_to:
            count_query = count_query.where(Order.created_at <= datetime.combine(date_to, datetime.max.time()))
        if search:
            search_filter = or_(
                Order.tracking_number.ilike(f"%{search}%"),
                Order.order_number.ilike(f"%{search}%")
            )
            count_query = count_query.where(search_filter)
        
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if sort_by == "total_amount":
            if sort_order == "asc":
                query = query.order_by(asc(Order.total_amount))
            else:
                query = query.order_by(desc(Order.total_amount))
        elif sort_by == "updated_at":
            if sort_order == "asc":
                query = query.order_by(asc(Order.updated_at))
            else:
                query = query.order_by(desc(Order.updated_at))
        else:  # created_at
            if sort_order == "asc":
                query = query.order_by(asc(Order.created_at))
            else:
                query = query.order_by(desc(Order.created_at))
        
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
        
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch orders"
        )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific order (Admin only)"""
    try:
        result = await db.execute(
            select(Order).where(Order.id == order_id)
        )
        order = result.scalar_one_or_none()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return OrderResponse.from_orm(order)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch order"
        )


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: str,
    order_update: OrderUpdate,
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Update an order (Admin only)"""
    try:
        order = await Order.get(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Track status changes for notifications
        old_status = order.status
        old_payment_status = order.payment_status
        
        # Update fields
        update_data = order_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(order, field, value)
        
        # Update timestamps based on status changes
        now = datetime.utcnow()
        if order.status != old_status:
            if order.status == OrderStatus.CONFIRMED and not order.confirmed_at:
                order.confirmed_at = now
            elif order.status == OrderStatus.SHIPPED and not order.shipped_at:
                order.shipped_at = now
            elif order.status == OrderStatus.DELIVERED and not order.delivered_at:
                order.delivered_at = now
        
        if order.payment_status != old_payment_status and order.payment_status == PaymentStatus.PAID:
            order.payment_date = now
        
        order.updated_at = now
        await order.save()
        
        # Send notifications for status changes
        notification_service = NotificationService()
        
        if order.status != old_status:
            if order.status == OrderStatus.CONFIRMED:
                await notification_service.send_order_confirmation_notification(order)
            elif order.status == OrderStatus.SHIPPED:
                await notification_service.send_order_shipped_notification(order)
            elif order.status == OrderStatus.REJECTED:
                await notification_service.send_order_rejection_notification(order, "Order rejected by admin")
        
        logger.info(f"Order updated: {order_id} by {current_user.email}")
        
        return OrderResponse(
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order"
        )


@router.post("/{order_id}/assign")
async def assign_order(
    order_id: str,
    assigned_to: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Assign an order to an admin user (Admin only)"""
    try:
        order = await Order.get(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Verify assigned user exists and is admin
        assigned_user = await User.get(assigned_to)
        if not assigned_user or assigned_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid admin user"
            )
        
        order.assigned_to = assigned_to
        order.updated_at = datetime.utcnow()
        await order.save()
        
        logger.info(f"Order {order_id} assigned to {assigned_user.email} by {current_user.email}")
        
        return {"message": "Order assigned successfully", "assigned_to": assigned_user.email}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign order"
        )


@router.post("/{order_id}/communication")
async def add_communication_log(
    order_id: str,
    message: str,
    communication_type: str = "note",  # note, call, email, whatsapp
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Add communication log to an order (Admin only)"""
    try:
        order = await Order.get(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Add communication log
        communication_entry = {
            "timestamp": datetime.utcnow(),
            "admin_id": str(current_user.id),
            "admin_name": current_user.name,
            "type": communication_type,
            "message": message
        }
        
        order.communication_log.append(communication_entry)
        order.updated_at = datetime.utcnow()
        await order.save()
        
        logger.info(f"Communication log added to order {order_id} by {current_user.email}")
        
        return {"message": "Communication log added successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding communication log: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add communication log"
        )


@router.get("/stats/summary")
async def get_order_stats(
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Get order statistics summary (Admin only)"""
    try:
        # Get counts by status
        status_counts = {}
        for status in OrderStatus:
            count = await Order.find({"status": status}).count()
            status_counts[status.value] = count
        
        # Get counts by payment status
        payment_status_counts = {}
        for payment_status in PaymentStatus:
            count = await Order.find({"payment_status": payment_status}).count()
            payment_status_counts[payment_status.value] = count
        
        # Get counts by payment method
        payment_method_counts = {}
        for payment_method in PaymentMethod:
            count = await Order.find({"payment_method": payment_method}).count()
            payment_method_counts[payment_method.value] = count
        
        # Get total revenue
        total_revenue = await Order.aggregate([
            {"$match": {"payment_status": PaymentStatus.PAID}},
            {"$group": {"_id": None, "total": {"$sum": "$total"}}}
        ]).to_list()
        
        total_revenue = total_revenue[0]["total"] if total_revenue else 0
        
        # Get today's stats
        today = datetime.now().date()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        
        today_orders = await Order.find({
            "created_at": {"$gte": today_start, "$lte": today_end}
        }).count()
        
        today_revenue = await Order.aggregate([
            {"$match": {
                "created_at": {"$gte": today_start, "$lte": today_end},
                "payment_status": PaymentStatus.PAID
            }},
            {"$group": {"_id": None, "total": {"$sum": "$total"}}}
        ]).to_list()
        
        today_revenue = today_revenue[0]["total"] if today_revenue else 0
        
        return {
            "status_counts": status_counts,
            "payment_status_counts": payment_status_counts,
            "payment_method_counts": payment_method_counts,
            "total_revenue": total_revenue,
            "today_orders": today_orders,
            "today_revenue": today_revenue
        }
        
    except Exception as e:
        logger.error(f"Error fetching order stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch order statistics"
        )
