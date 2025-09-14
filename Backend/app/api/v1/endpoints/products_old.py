from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select, and_, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sqlalchemy_models import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.models.sqlalchemy_models import User
from app.core.security import get_current_active_user, require_roles, UserRole
from app.core.postgresql import get_db
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/", response_model=List[ProductResponse])
@limiter.limit("60/minute")
async def get_products(
    request: Request,
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    tags: Optional[str] = Query(None),
    is_new: Optional[bool] = Query(None),
    is_on_sale: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all products with filtering and pagination"""
    # Build query
    query = {"status": ProductStatus.ACTIVE}
    
    if category:
        query["category"] = category
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        if "price" in query:
            query["price"]["$lte"] = max_price
        else:
            query["price"] = {"$lte": max_price}
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    if is_new is not None:
        query["is_new"] = is_new
    if is_on_sale is not None:
        query["is_on_sale"] = is_on_sale
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    # Calculate skip
    skip = (page - 1) * limit
    
    # Sort order
    sort_direction = -1 if sort_order == "desc" else 1
    sort_field = sort_by if sort_by in ["name", "price", "created_at", "rating"] else "created_at"
    
    # Execute query
    products = await Product.find(query).sort([(sort_field, sort_direction)]).skip(skip).limit(limit).to_list()
    
    # Convert to response format (exclude inventory_quantity)
    return [
        ProductResponse(
            id=str(product.id),
            name=product.name,
            description=product.description,
            description_arabic=product.description_arabic,
            price=product.price,
            discount_price=product.discount_price,
            images=product.images,
            category=product.category,
            tags=product.tags,
            specifications=product.specifications,
            variants=product.variants,
            colors=product.colors,
            status=product.status,
            is_new=product.is_new,
            is_on_sale=product.is_on_sale,
            rating=product.rating,
            review_count=product.review_count,
            created_at=product.created_at
        )
        for product in products
    ]


@router.get("/categories")
@limiter.limit("60/minute")
async def get_categories(request: Request):
    """Get all product categories"""
    categories = await Product.distinct("category")
    return {"categories": categories}


@router.get("/{product_id}", response_model=ProductResponse)
@limiter.limit("60/minute")
async def get_product(request: Request, product_id: str):
    """Get a single product by ID"""
    product = await Product.get(product_id)
    if not product or product.status != ProductStatus.ACTIVE:
        raise NotFoundException("Product not found")
    
    return ProductResponse(
        id=str(product.id),
        name=product.name,
        description=product.description,
        description_arabic=product.description_arabic,
        price=product.price,
        discount_price=product.discount_price,
        images=product.images,
        category=product.category,
        tags=product.tags,
        specifications=product.specifications,
        variants=product.variants,
        colors=product.colors,
        status=product.status,
        is_new=product.is_new,
        is_on_sale=product.is_on_sale,
        rating=product.rating,
        review_count=product.review_count,
        created_at=product.created_at
    )


@router.post("/", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Create a new product (Admin only)"""
    product = Product(**product_data.dict())
    await product.insert()
    
    return ProductResponse(
        id=str(product.id),
        name=product.name,
        description=product.description,
        description_arabic=product.description_arabic,
        price=product.price,
        discount_price=product.discount_price,
        images=product.images,
        category=product.category,
        tags=product.tags,
        specifications=product.specifications,
        variants=product.variants,
        colors=product.colors,
        status=product.status,
        is_new=product.is_new,
        is_on_sale=product.is_on_sale,
        rating=product.rating,
        review_count=product.review_count,
        created_at=product.created_at
    )


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Update a product (Admin only)"""
    product = await Product.get(product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    # Update fields
    update_data = product_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    product.updated_at = datetime.utcnow()
    await product.save()
    
    return ProductResponse(
        id=str(product.id),
        name=product.name,
        description=product.description,
        description_arabic=product.description_arabic,
        price=product.price,
        discount_price=product.discount_price,
        images=product.images,
        category=product.category,
        tags=product.tags,
        specifications=product.specifications,
        variants=product.variants,
        colors=product.colors,
        status=product.status,
        is_new=product.is_new,
        is_on_sale=product.is_on_sale,
        rating=product.rating,
        review_count=product.review_count,
        created_at=product.created_at
    )


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Soft delete a product (Admin only)"""
    product = await Product.get(product_id)
    if not product:
        raise NotFoundException("Product not found")
    
    # Soft delete by setting status to inactive
    product.status = ProductStatus.INACTIVE
    product.updated_at = datetime.utcnow()
    await product.save()
    
    return {"message": "Product deleted successfully"}
