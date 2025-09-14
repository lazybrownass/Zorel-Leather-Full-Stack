from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# Review Schemas
class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None
    images: Optional[List[str]] = []

    @validator('comment')
    def validate_comment(cls, v):
        if v and len(v.strip()) < 10:
            raise ValueError('Comment must be at least 10 characters long')
        return v

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None
    images: Optional[List[str]] = None

class ReviewResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None
    images: List[str] = []
    is_verified_purchase: bool
    is_approved: bool
    helpful_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ReviewWithUser(ReviewResponse):
    user_name: str
    user_email: str
    user_profile_image: Optional[str] = None

class ReviewStats(BaseModel):
    total_reviews: int
    average_rating: float
    rating_distribution: Dict[int, int]  # {1: count, 2: count, ...}

class ReviewListResponse(BaseModel):
    reviews: List[ReviewWithUser]
    total: int
    page: int
    limit: int
    total_pages: int
    stats: ReviewStats

class ReviewHelpfulUpdate(BaseModel):
    is_helpful: bool
