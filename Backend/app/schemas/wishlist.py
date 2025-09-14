from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

# Wishlist Schemas
class WishlistItemCreate(BaseModel):
    product_id: str
    personal_note: Optional[str] = None

class WishlistItemUpdate(BaseModel):
    personal_note: Optional[str] = None

class WishlistItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    product_image: str
    product_price: float
    personal_note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class WishlistResponse(BaseModel):
    id: str
    user_id: str
    items: List[WishlistItemResponse]
    total_items: int
    created_at: datetime

    class Config:
        from_attributes = True

class WishlistStatusResponse(BaseModel):
    in_wishlist: bool
    personal_note: str = ""

class WishlistCountResponse(BaseModel):
    count: int
