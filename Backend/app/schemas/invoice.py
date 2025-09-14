from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"
    CHECK = "check"
    PAYPAL = "paypal"
    STRIPE = "stripe"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class InvoiceItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    net_amount: float = Field(..., gt=0)
    gst_amount: float = Field(..., ge=0)
    total_amount: float = Field(..., gt=0)


class InvoiceBase(BaseModel):
    order_id: UUID
    customer_id: UUID
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    customer_address: Dict[str, Any]
    invoice_date: datetime
    due_date: Optional[datetime] = None
    items: List[InvoiceItem]
    subtotal: float = Field(..., gt=0)
    gst_amount: float = Field(..., ge=0)
    total_amount: float = Field(..., gt=0)
    notes: Optional[str] = None
    terms_conditions: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[Dict[str, Any]] = None
    due_date: Optional[datetime] = None
    items: Optional[List[InvoiceItem]] = None
    subtotal: Optional[float] = Field(None, gt=0)
    gst_amount: Optional[float] = Field(None, ge=0)
    total_amount: Optional[float] = Field(None, gt=0)
    notes: Optional[str] = None
    terms_conditions: Optional[str] = None


class InvoiceResponse(InvoiceBase):
    id: UUID
    invoice_number: str
    status: InvoiceStatus
    payment_method: Optional[PaymentMethod] = None
    payment_date: Optional[datetime] = None
    payment_reference: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
