from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.sqlalchemy_models import Product, User
from app.schemas.product import ProductResponse
from app.core.security import get_current_active_user, require_roles, UserRole
from app.core.exceptions import ValidationException
from app.core.postgresql import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, asc, func
import re

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/products", response_model=List[ProductResponse])
@limiter.limit("60/minute")
async def search_products(
    request: Request,
    q: str = Query(..., min_length=2, description="Search query"),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    tags: Optional[str] = Query(None),
    is_new: Optional[bool] = Query(None),
    is_on_sale: Optional[bool] = Query(None),
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    sort_by: str = Query("relevance", regex="^(relevance|price|rating|newest|oldest)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Advanced product search with filtering and sorting"""
    
    # Build SQLAlchemy query
    query = select(Product).where(Product.is_active == True)
    
    # Text search
    if q:
        # Create text search using ILIKE for case-insensitive search
        search_terms = re.findall(r'\b\w+\b', q.lower())
        if search_terms:
            search_conditions = []
            for term in search_terms:
                search_conditions.extend([
                    Product.name.ilike(f"%{term}%"),
                    Product.description.ilike(f"%{term}%"),
                    Product.category.ilike(f"%{term}%")
                ])
            query = query.where(or_(*search_conditions))
    
    # Category filter
    if category:
        query = query.where(Product.category.ilike(f"%{category}%"))
    
    # Price range filter
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    
    # Tags filter
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query = query.where(Product.tags.overlap(tag_list))
    
    # Boolean filters
    if is_new is not None:
        # For new products, check if created within last 30 days
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        if is_new:
            query = query.where(Product.created_at >= thirty_days_ago)
        else:
            query = query.where(Product.created_at < thirty_days_ago)
    
    if is_on_sale is not None:
        # Check if there's a discount (original_price > price)
        if is_on_sale:
            query = query.where(Product.original_price > Product.price)
        else:
            query = query.where(Product.original_price <= Product.price)
    
    # Rating filter (would need to join with reviews table for actual rating)
    # For now, we'll skip this as it requires a more complex query
    
    # Calculate offset
    offset = (page - 1) * limit
    
    # Sort options
    sort_column = Product.created_at  # default
    if sort_by == "price":
        sort_column = Product.price
    elif sort_by == "newest":
        sort_column = Product.created_at
    elif sort_by == "oldest":
        sort_column = Product.created_at
    
    # Apply sorting
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Apply pagination
    query = query.offset(offset).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    products = result.scalars().all()
    
    # Convert to response format
    return [
        ProductResponse(
            id=str(product.id),
            name=product.name,
            description=product.description,
            price=product.price,
            original_price=product.original_price,
            images=product.images,
            category=product.category,
            subcategory=product.subcategory,
            brand=product.brand,
            sku=product.sku,
            tags=product.tags,
            specifications=product.specifications,
            features=product.features,
            sizes=product.sizes,
            colors=product.colors,
            stock_quantity=product.stock_quantity,
            is_active=product.is_active,
            is_featured=product.is_featured,
            seo_title=product.seo_title,
            seo_description=product.seo_description,
            created_at=product.created_at,
            updated_at=product.updated_at
        )
        for product in products
    ]


@router.get("/suggestions")
@limiter.limit("60/minute")
async def get_search_suggestions(
    request: Request,
    q: str = Query(..., min_length=1, max_length=50),
    limit: int = Query(10, ge=1, le=20),
    db: AsyncSession = Depends(get_db)
):
    """Get search suggestions based on query"""
    
    # Get product name suggestions
    product_query = select(Product.name).where(
        and_(
            Product.is_active == True,
            Product.name.ilike(f"{q}%")
        )
    ).limit(limit)
    product_result = await db.execute(product_query)
    products = [row[0] for row in product_result.fetchall()]
    
    # Get category suggestions
    category_query = select(Product.category).where(
        and_(
            Product.is_active == True,
            Product.category.ilike(f"{q}%")
        )
    ).distinct().limit(5)
    category_result = await db.execute(category_query)
    categories = [row[0] for row in category_result.fetchall()]
    
    # Get tag suggestions (simplified - would need more complex query for array overlap)
    tag_query = select(Product.tags).where(
        and_(
            Product.is_active == True,
            Product.tags.any(q)  # Check if any tag starts with q
        )
    ).limit(5)
    tag_result = await db.execute(tag_query)
    tags = []
    for row in tag_result.fetchall():
        if row[0]:  # if tags array is not None
            matching_tags = [tag for tag in row[0] if tag.lower().startswith(q.lower())]
            tags.extend(matching_tags[:2])  # Limit to 2 per product
    
    suggestions = {
        "products": products[:5],
        "categories": categories[:5],
        "tags": list(set(tags))[:5]  # Remove duplicates and limit
    }
    
    return suggestions


@router.get("/filters")
@limiter.limit("60/minute")
async def get_search_filters(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Get available search filters"""
    
    # Get all categories
    category_query = select(Product.category).where(Product.is_active == True).distinct()
    category_result = await db.execute(category_query)
    categories = [row[0] for row in category_result.fetchall()]
    
    # Get all tags (simplified - would need more complex query for array aggregation)
    tag_query = select(Product.tags).where(Product.is_active == True)
    tag_result = await db.execute(tag_query)
    all_tags = set()
    for row in tag_result.fetchall():
        if row[0]:  # if tags array is not None
            all_tags.update(row[0])
    tags = list(all_tags)
    
    # Get price range
    price_stats_query = select(
        func.min(Product.price).label('min_price'),
        func.max(Product.price).label('max_price'),
        func.avg(Product.price).label('avg_price')
    ).where(Product.is_active == True)
    price_stats_result = await db.execute(price_stats_query)
    price_stats = price_stats_result.first()
    
    price_range = {
        "min_price": float(price_stats.min_price) if price_stats.min_price else 0,
        "max_price": float(price_stats.max_price) if price_stats.max_price else 1000,
        "avg_price": float(price_stats.avg_price) if price_stats.avg_price else 50
    }
    
    return {
        "categories": sorted(categories),
        "tags": sorted(tags),
        "price_range": {
            "min": price_range.get("min_price", 0),
            "max": price_range.get("max_price", 1000),
            "avg": price_range.get("avg_price", 50)
        },
        "filters": {
            "is_new": True,
            "is_on_sale": True,
            "rating": [1, 2, 3, 4, 5]
        }
    }


@router.get("/trending")
@limiter.limit("60/minute")
async def get_trending_products(
    request: Request,
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = Query(None)
):
    """Get trending products based on recent orders and reviews"""
    
    # This is a simplified trending algorithm
    # In a real implementation, you'd analyze order history, view counts, etc.
    
    query = {"status": ProductStatus.ACTIVE}
    if category:
        query["category"] = category
    
    # Get products with high ratings and recent reviews
    products_query = select(Product).where(
        and_(
            Product.rating >= 4.0,
            Product.review_count >= 5
        )
    ).order_by(desc(Product.rating)).limit(limit)
    
    result = await db.execute(products_query)
    products = result.scalars().all()
    
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


@router.get("/popular-searches")
@limiter.limit("60/minute")
async def get_popular_searches(
    request: Request,
    limit: int = Query(10, ge=1, le=20)
):
    """Get popular search terms (placeholder - would need search analytics)"""
    
    # This would typically come from search analytics
    # For now, return popular categories and tags
    from app.core.postgresql import get_db
    
    db = next(get_db())
    popular_categories_query = select(
        Product.category,
        func.count(Product.id).label('count')
    ).where(Product.status == ProductStatus.ACTIVE).group_by(
        Product.category
    ).order_by(desc(func.count(Product.id))).limit(limit)
    
    popular_categories_result = await db.execute(popular_categories_query)
    popular_categories = [
        {"_id": row.category, "count": row.count}
        for row in popular_categories_result
    ]
    
    # For tags, we'll need to handle the array field differently
    # This is a simplified version - would need proper array handling
    popular_tags = []  # Placeholder - would need proper array aggregation
    
    return {
        "categories": [{"term": item["_id"], "count": item["count"]} for item in popular_categories],
        "tags": [{"term": item["_id"], "count": item["count"]} for item in popular_tags]
    }
