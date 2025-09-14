from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

# Cart Item Schemas
class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., ge=1)
    size: Optional[str] = None
    color: Optional[str] = None

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)
    size: Optional[str] = None
    color: Optional[str] = None

class CartItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    product_image: str
    product_price: float
    quantity: int
    size: Optional[str] = None
    color: Optional[str] = None
    subtotal: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: str
    user_id: str
    items: List[CartItemResponse]
    total_items: int
    subtotal: float
    shipping_cost: float
    tax: float
    total: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CartCountResponse(BaseModel):
    count: int
