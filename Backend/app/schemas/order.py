from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID
from app.models.sqlalchemy_models import OrderStatus, PaymentStatus, PaymentMethod


class OrderItemBase(BaseModel):
    product_id: str
    quantity: int
    price: float


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: str
    product_name: Optional[str] = None
    product_image: Optional[str] = None


class OrderBase(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    shipping_address: dict
    items: List[OrderItemCreate]
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    shipping_cost: float = Field(default=0.0, ge=0)


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    shipping_address: dict
    items: List[OrderItemResponse]
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: Optional[PaymentMethod] = None
    total_amount: float
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderFilters(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    customer_email: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    limit: int = Field(default=50, le=100)
    offset: int = Field(default=0, ge=0)


class OrderSummary(BaseModel):
    id: str
    customer_name: str
    status: OrderStatus
    total_amount: float
    created_at: datetime