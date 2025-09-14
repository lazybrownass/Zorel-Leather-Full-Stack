from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    ORDER_REQUEST = "order_request"
    ORDER_CONFIRMATION = "order_confirmation"
    ORDER_REJECTION = "order_rejection"
    PAYMENT_LINK = "payment_link"
    ORDER_SHIPPED = "order_shipped"
    ORDER_DELIVERED = "order_delivered"
    WELCOME = "welcome"
    PASSWORD_RESET = "password_reset"

class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"

class NotificationChannel(str, Enum):
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    SMS = "sms"

class NotificationCreate(BaseModel):
    type: NotificationType
    channel: NotificationChannel
    recipient_email: Optional[str] = None
    recipient_phone: Optional[str] = None
    subject: Optional[str] = None
    message: str
    order_id: Optional[str] = None
    user_id: Optional[str] = None
    notification_data: Optional[Dict[str, Any]] = {}

class NotificationResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    message: str
    type: str
    is_read: bool
    notification_data: Optional[Dict[str, Any]] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationFilters(BaseModel):
    type: Optional[NotificationType] = None
    is_read: Optional[bool] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    unread_count: int
