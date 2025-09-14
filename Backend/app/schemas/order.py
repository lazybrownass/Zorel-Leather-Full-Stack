from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

# Enums
class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"

class PaymentMethod(str, Enum):
    COD = "cod"
    ONLINE = "online"
    BANK_TRANSFER = "bank_transfer"
    CHEQUE = "cheque"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

# Address Schema
class Address(BaseModel):
    name: str
    street: str
    city: str
    state: str
    postal_code: str
    country: str
    phone: Optional[str] = None

# Order Item Schema
class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., ge=1)
    size: Optional[str] = None
    color: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    quantity: int
    price: float
    size: Optional[str] = None
    color: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: Address
    billing_address: Optional[Address] = None
    payment_method: PaymentMethod
    customer_notes: Optional[str] = None

    @validator('items')
    def validate_items(cls, v):
        if not v:
            raise ValueError('Order must have at least one item')
        return v

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    payment_reference: Optional[str] = None
    shipping_company: Optional[str] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    admin_notes: Optional[str] = None
    internal_notes: Optional[str] = None
    assigned_to: Optional[str] = None
    customer_notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    user_id: str
    order_number: str
    status: OrderStatus
    total_amount: float
    gst_amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    payment_reference: Optional[str] = None
    payment_date: Optional[datetime] = None
    shipping_address: Dict[str, Any]
    billing_address: Optional[Dict[str, Any]] = None
    shipping_company: Optional[str] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    admin_notes: Optional[str] = None
    internal_notes: Optional[str] = None
    assigned_to: Optional[str] = None
    customer_notes: Optional[str] = None
    communication_log: List[Dict[str, Any]]
    confirmed_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    order_items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    page: int
    limit: int
    total_pages: int

# Order Filters
class OrderFilters(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    payment_method: Optional[PaymentMethod] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    search: Optional[str] = None

# Order Summary
class OrderSummary(BaseModel):
    total_orders: int
    pending_orders: int
    confirmed_orders: int
    shipped_orders: int
    delivered_orders: int
    cancelled_orders: int
    total_revenue: float
    pending_revenue: float
    completed_revenue: float

# Order Analytics
class OrderAnalytics(BaseModel):
    daily_orders: List[Dict[str, Any]]
    monthly_orders: List[Dict[str, Any]]
    order_status_distribution: Dict[str, int]
    payment_method_distribution: Dict[str, int]
    top_products: List[Dict[str, Any]]
    revenue_trends: List[Dict[str, Any]]
