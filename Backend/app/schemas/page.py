from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class PageBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    is_published: bool = False


class PageCreate(PageBase):
    pass


class PageUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    is_published: Optional[bool] = None


class PageResponse(PageBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
