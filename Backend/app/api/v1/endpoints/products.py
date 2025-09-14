from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select, and_, or_, desc, asc, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sqlalchemy_models import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.models.sqlalchemy_models import User
from app.core.security import get_current_active_user, require_roles, UserRole
from app.core.postgresql import get_db
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/", response_model=ProductListResponse)
@limiter.limit("60/minute")
async def get_products(
    request: Request,
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    tags: Optional[str] = Query(None),
    is_featured: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get all products with filtering and pagination"""
    # Build base query
    query = select(Product).where(Product.is_active == True)
    
    # Apply filters
    if category:
        query = query.where(Product.category == category)
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query = query.where(Product.tags.overlap(tag_list))
    if is_featured is not None:
        query = query.where(Product.is_featured == is_featured)
    if search:
        search_filter = or_(
            Product.name.ilike(f"%{search}%"),
            Product.description.ilike(f"%{search}%"),
            Product.tags.overlap([search])
        )
        query = query.where(search_filter)
    
    # Apply sorting
    if sort_by == "price":
        if sort_order == "asc":
            query = query.order_by(asc(Product.price))
        else:
            query = query.order_by(desc(Product.price))
    elif sort_by == "name":
        if sort_order == "asc":
            query = query.order_by(asc(Product.name))
        else:
            query = query.order_by(desc(Product.name))
    else:  # created_at
        if sort_order == "asc":
            query = query.order_by(asc(Product.created_at))
        else:
            query = query.order_by(desc(Product.created_at))
    
    # Get total count
    count_query = select(func.count(Product.id)).where(Product.is_active == True)
    if category:
        count_query = count_query.where(Product.category == category)
    if min_price is not None:
        count_query = count_query.where(Product.price >= min_price)
    if max_price is not None:
        count_query = count_query.where(Product.price <= max_price)
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        count_query = count_query.where(Product.tags.overlap(tag_list))
    if is_featured is not None:
        count_query = count_query.where(Product.is_featured == is_featured)
    if search:
        search_filter = or_(
            Product.name.ilike(f"%{search}%"),
            Product.description.ilike(f"%{search}%"),
            Product.tags.overlap([search])
        )
        count_query = count_query.where(search_filter)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    products = result.scalars().all()
    
    # Calculate total pages
    total_pages = (total + limit - 1) // limit
    
    return ProductListResponse(
        products=[ProductResponse.from_orm(product) for product in products],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.get("/categories")
@limiter.limit("60/minute")
async def get_categories(request: Request, db: AsyncSession = Depends(get_db)):
    """Get all product categories"""
    result = await db.execute(select(Product.category).distinct().where(Product.is_active == True))
    categories = [row[0] for row in result.fetchall()]
    return {"categories": categories}


@router.get("/slug/{slug}", response_model=ProductResponse)
@limiter.limit("60/minute")
async def get_product_by_slug(
    slug: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific product by slug"""
    result = await db.execute(select(Product).where(Product.slug == slug, Product.is_active == True))
    product = result.scalar_one_or_none()
    
    if not product:
        raise NotFoundException("Product not found")
    
    return ProductResponse.from_orm(product)


@router.get("/{product_id}", response_model=ProductResponse)
@limiter.limit("60/minute")
async def get_product(
    product_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific product by ID"""
    result = await db.execute(select(Product).where(Product.id == product_id, Product.is_active == True))
    product = result.scalar_one_or_none()
    
    if not product:
        raise NotFoundException("Product not found")
    
    return ProductResponse.from_orm(product)


@router.post("/", response_model=ProductResponse)
@limiter.limit("10/minute")
async def create_product(
    product_data: ProductCreate,
    request: Request,
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Create a new product (Admin only)"""
    product = Product(**product_data.dict())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    return ProductResponse.from_orm(product)


@router.put("/{product_id}", response_model=ProductResponse)
@limiter.limit("10/minute")
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    request: Request,
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Update a product (Admin only)"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise NotFoundException("Product not found")
    
    # Update fields
    update_data = product_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(product, field):
            setattr(product, field, value)
    
    product.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(product)
    
    return ProductResponse.from_orm(product)


@router.delete("/{product_id}")
@limiter.limit("10/minute")
async def delete_product(
    product_id: str,
    request: Request,
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Delete a product (Admin only)"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise NotFoundException("Product not found")
    
    # Soft delete by setting is_active to False
    product.is_active = False
    product.updated_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": "Product deleted successfully"}


@router.get("/featured/", response_model=List[ProductResponse])
@limiter.limit("60/minute")
async def get_featured_products(
    request: Request,
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """Get featured products"""
    result = await db.execute(
        select(Product)
        .where(Product.is_active == True, Product.is_featured == True)
        .order_by(desc(Product.created_at))
        .limit(limit)
    )
    products = result.scalars().all()
    
    return [ProductResponse.from_orm(product) for product in products]


@router.get("/search/", response_model=ProductListResponse)
@limiter.limit("60/minute")
async def search_products(
    request: Request,
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Search products by query"""
    # Build search query
    search_filter = or_(
        Product.name.ilike(f"%{q}%"),
        Product.description.ilike(f"%{q}%"),
        Product.tags.overlap([q]),
        Product.category.ilike(f"%{q}%")
    )
    
    query = select(Product).where(Product.is_active == True, search_filter)
    
    # Get total count
    count_query = select(func.count(Product.id)).where(Product.is_active == True, search_filter)
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    products = result.scalars().all()
    
    # Calculate total pages
    total_pages = (total + limit - 1) // limit
    
    return ProductListResponse(
        products=[ProductResponse.from_orm(product) for product in products],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )