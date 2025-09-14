from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select, and_, or_, desc, asc, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sqlalchemy_models import Notification, User
from app.schemas.notification import (
    NotificationCreate, 
    NotificationResponse, 
    NotificationFilters,
    NotificationType,
    NotificationChannel,
    NotificationStatus,
    NotificationListResponse
)
from app.core.postgresql import get_db
from app.core.security import get_current_active_user, require_roles, UserRole
from app.services.notification_service import NotificationService

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/email")
async def send_email_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Send email notification (Admin only)"""
    notification_service = NotificationService()
    
    # Create notification record
    notification = Notification(
        user_id=notification_data.user_id,
        title=notification_data.subject or "Notification from ZOREL LEATHER",
        message=notification_data.message,
        type=notification_data.type.value,
        is_read=False,
        notification_data=notification_data.notification_data or {}
    )
    
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    
    # Send email
    success = await notification_service.send_email(
        notification_data.recipient_email,
        notification_data.subject or "Notification from ZOREL LEATHER",
        notification_data.message
    )
    
    return {"message": "Email notification sent successfully" if success else "Failed to send email notification"}


@router.post("/whatsapp")
async def send_whatsapp_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Send WhatsApp notification (Admin only)"""
    notification_service = NotificationService()
    
    # Create notification record
    notification = Notification(
        user_id=notification_data.user_id,
        title="WhatsApp Notification",
        message=notification_data.message,
        type=notification_data.type.value,
        is_read=False,
        notification_data=notification_data.notification_data or {}
    )
    
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    
    # Send WhatsApp message
    success = await notification_service.send_whatsapp(
        notification_data.recipient_phone,
        notification_data.message
    )
    
    return {"message": "WhatsApp notification sent successfully" if success else "Failed to send WhatsApp notification"}


@router.get("/", response_model=NotificationListResponse)
async def get_notifications(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    type_filter: Optional[str] = Query(None, alias="type"),
    is_read: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get all notifications (Admin only)"""
    # Build base query
    query = select(Notification)
    
    # Apply filters
    if type_filter:
        query = query.where(Notification.type == type_filter)
    if is_read is not None:
        query = query.where(Notification.is_read == is_read)
    
    # Get total count
    count_query = select(func.count(Notification.id))
    if type_filter:
        count_query = count_query.where(Notification.type == type_filter)
    if is_read is not None:
        count_query = count_query.where(Notification.is_read == is_read)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and sorting
    offset = (page - 1) * limit
    query = query.order_by(desc(Notification.created_at)).offset(offset).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    # Get unread count
    unread_result = await db.execute(
        select(func.count(Notification.id)).where(Notification.is_read == False)
    )
    unread_count = unread_result.scalar() or 0
    
    # Calculate total pages
    total_pages = (total + limit - 1) // limit
    
    return NotificationListResponse(
        notifications=[NotificationResponse.from_orm(notification) for notification in notifications],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        unread_count=unread_count
    )


@router.get("/stats")
async def get_notification_stats(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get notification statistics (Admin only)"""
    # Get total notifications
    total_result = await db.execute(select(func.count(Notification.id)))
    total_notifications = total_result.scalar() or 0
    
    # Get read/unread counts
    read_result = await db.execute(
        select(func.count(Notification.id)).where(Notification.is_read == True)
    )
    read_notifications = read_result.scalar() or 0
    
    unread_notifications = total_notifications - read_notifications
    
    return {
        "total": total_notifications,
        "read": read_notifications,
        "unread": unread_notifications,
        "read_rate": (read_notifications / total_notifications * 100) if total_notifications > 0 else 0
    }
