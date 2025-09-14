from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.sqlalchemy_models import Page, User
from app.schemas.page import PageCreate, PageUpdate, PageResponse
from app.core.security import get_current_active_user, require_roles, UserRole
from app.core.exceptions import NotFoundException, ConflictException
from app.core.postgresql import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, asc

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/{slug}", response_model=PageResponse)
@limiter.limit("60/minute")
async def get_page(
    request: Request, 
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get page content by slug"""
    query = select(Page).where(
        and_(
            Page.slug == slug,
            Page.is_published == True
        )
    )
    result = await db.execute(query)
    page = result.scalar_one_or_none()
    
    if not page:
        raise NotFoundException("Page not found")
    
    return PageResponse(
        id=str(page.id),
        slug=page.slug,
        title=page.title,
        content=page.content,
        meta_title=page.meta_title,
        meta_description=page.meta_description,
        is_published=page.is_published,
        created_at=page.created_at,
        updated_at=page.updated_at
    )


@router.get("/", response_model=List[PageResponse])
async def get_all_pages(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    published_only: bool = Query(False),
    db: AsyncSession = Depends(get_db)
):
    """Get all pages (Admin only)"""
    query = select(Page)
    if published_only:
        query = query.where(Page.is_published == True)
    
    query = query.order_by(desc(Page.created_at))
    result = await db.execute(query)
    pages = result.scalars().all()
    
    return [
        PageResponse(
            id=str(page.id),
            slug=page.slug,
            title=page.title,
            content=page.content,
            meta_title=page.meta_title,
            meta_description=page.meta_description,
            is_published=page.is_published,
            created_at=page.created_at,
            updated_at=page.updated_at
        )
        for page in pages
    ]


@router.post("/", response_model=PageResponse)
async def create_page(
    page_data: PageCreate,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Create a new page (Admin only)"""
    # Check if slug already exists
    existing_query = select(Page).where(Page.slug == page_data.slug)
    existing_result = await db.execute(existing_query)
    existing_page = existing_result.scalar_one_or_none()
    
    if existing_page:
        raise ConflictException("Page with this slug already exists")
    
    # Create new page
    page = Page(
        title=page_data.title,
        slug=page_data.slug,
        content=page_data.content,
        meta_title=page_data.meta_title,
        meta_description=page_data.meta_description,
        is_published=page_data.is_published if page_data.is_published is not None else False
    )
    
    db.add(page)
    await db.commit()
    await db.refresh(page)
    
    return PageResponse(
        id=str(page.id),
        slug=page.slug,
        title=page.title,
        content=page.content,
        meta_title=page.meta_title,
        meta_description=page.meta_description,
        is_published=page.is_published,
        created_at=page.created_at,
        updated_at=page.updated_at
    )


@router.put("/{page_id}", response_model=PageResponse)
async def update_page(
    page_id: str,
    page_data: PageUpdate,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Update a page (Admin only)"""
    import uuid
    
    # Validate UUID format
    try:
        page_uuid = uuid.UUID(page_id)
    except ValueError:
        raise NotFoundException("Invalid page ID format")
    
    # Get existing page
    query = select(Page).where(Page.id == page_uuid)
    result = await db.execute(query)
    page = result.scalar_one_or_none()
    
    if not page:
        raise NotFoundException("Page not found")
    
    # Update fields
    update_data = page_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(page, field):
            setattr(page, field, value)
    
    await db.commit()
    await db.refresh(page)
    
    return PageResponse(
        id=str(page.id),
        slug=page.slug,
        title=page.title,
        content=page.content,
        meta_title=page.meta_title,
        meta_description=page.meta_description,
        is_published=page.is_published,
        created_at=page.created_at,
        updated_at=page.updated_at
    )


@router.delete("/{page_id}")
async def delete_page(
    page_id: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Delete a page (Admin only)"""
    import uuid
    
    # Validate UUID format
    try:
        page_uuid = uuid.UUID(page_id)
    except ValueError:
        raise NotFoundException("Invalid page ID format")
    
    # Get existing page
    query = select(Page).where(Page.id == page_uuid)
    result = await db.execute(query)
    page = result.scalar_one_or_none()
    
    if not page:
        raise NotFoundException("Page not found")
    
    await db.delete(page)
    await db.commit()
    return {"message": "Page deleted successfully"}
