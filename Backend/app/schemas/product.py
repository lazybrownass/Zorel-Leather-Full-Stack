from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
import uuid
import re

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    description: Optional[str] = Field(None, max_length=2000, description="Product description")
    price: Optional[float] = Field(None, gt=0, description="Product price")
    original_price: Optional[float] = Field(None, gt=0, description="Original price before discount")
    category: str = Field(..., min_length=1, max_length=100, description="Product category")
    subcategory: Optional[str] = Field(None, max_length=100, description="Product subcategory")
    brand: Optional[str] = Field(None, max_length=100, description="Product brand")
    sku: Optional[str] = Field(None, max_length=50, description="Stock keeping unit")
    images: List[str] = Field(default=[], description="Product images")
    specifications: Dict[str, Any] = Field(default={}, description="Product specifications")
    features: List[str] = Field(default=[], description="Product features")
    sizes: List[str] = Field(default=[], description="Available sizes")
    colors: List[str] = Field(default=[], description="Available colors")
    stock_quantity: int = Field(default=0, ge=0, description="Stock quantity")
    is_active: bool = Field(default=True, description="Product is active")
    is_featured: bool = Field(default=False, description="Product is featured")
    tags: List[str] = Field(default=[], description="Product tags")
    seo_title: Optional[str] = Field(None, max_length=60, description="SEO title")
    seo_description: Optional[str] = Field(None, max_length=160, description="SEO description")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Product name cannot be empty')
        return v.strip()

    @field_validator('sku')
    @classmethod
    def validate_sku(cls, v):
        if v and not re.match(r'^[A-Z0-9\-_]+$', v):
            raise ValueError('SKU must contain only uppercase letters, numbers, hyphens, and underscores')
        return v.upper() if v else v

    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        allowed_categories = ['men', 'women', 'accessories', 'bags', 'wallets', 'belts', 'shoes']
        if v.lower() not in allowed_categories:
            raise ValueError(f'Category must be one of: {", ".join(allowed_categories)}')
        return v.lower()

    @field_validator('images')
    @classmethod
    def validate_images(cls, v):
        if len(v) > 10:
            raise ValueError('Maximum 10 images allowed')
        return v

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        if len(v) > 20:
            raise ValueError('Maximum 20 tags allowed')
        return v

    @model_validator(mode='after')
    def validate_price_logic(self):
        if self.price and self.original_price:
            if self.original_price <= self.price:
                raise ValueError('Original price must be greater than current price for discounts')
        return self

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    original_price: Optional[float] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    sku: Optional[str] = None
    images: Optional[List[str]] = None
    specifications: Optional[Dict[str, Any]] = None
    features: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class ProductResponse(ProductBase):
    id: Union[str, uuid.UUID]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    limit: int
    total_pages: int
