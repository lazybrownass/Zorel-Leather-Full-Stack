from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class CouponStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    EXPIRED = "expired"
    USED_UP = "used_up"


class DiscountType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"


class CouponBase(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    discount_type: DiscountType
    discount_value: float = Field(..., gt=0)
    minimum_amount: Optional[float] = Field(None, ge=0)
    maximum_discount: Optional[float] = Field(None, ge=0)
    usage_limit: Optional[int] = Field(None, gt=0)
    is_active: bool = True
    valid_from: datetime
    valid_until: datetime


class CouponCreate(CouponBase):
    pass


class CouponUpdate(BaseModel):
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[float] = Field(None, gt=0)
    minimum_amount: Optional[float] = Field(None, ge=0)
    maximum_discount: Optional[float] = Field(None, ge=0)
    usage_limit: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None


class CouponResponse(CouponBase):
    id: UUID
    used_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CouponValidation(BaseModel):
    code: str
    amount: float = Field(..., gt=0)


class CouponValidationResponse(BaseModel):
    is_valid: bool
    discount_amount: float
    final_amount: float
    message: Optional[str] = None
