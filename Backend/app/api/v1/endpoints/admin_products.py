from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select, and_, or_, desc, asc, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import uuid
import logging

from app.models.sqlalchemy_models import Product, User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.core.security import get_current_active_user, require_roles, UserRole
from app.core.postgresql import get_db
from app.core.exceptions import NotFoundException, ForbiddenException, ConflictException, BadRequestException
from app.services.file_service import FileService

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/", response_model=ProductListResponse)
@limiter.limit("60/minute")
async def get_admin_products(
    request: Request,
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    is_featured: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))
):
    """Get all products with admin-specific filtering and pagination"""
    try:
        # Build base query
        query = select(Product)
        
        # Apply filters
        if category:
            query = query.where(Product.category == category)
        if is_active is not None:
            query = query.where(Product.is_active == is_active)
        if is_featured is not None:
            query = query.where(Product.is_featured == is_featured)
        if search:
            search_filter = or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
                Product.category.ilike(f"%{search}%")
            )
            query = query.where(search_filter)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        sort_column = getattr(Product, sort_by, Product.created_at)
        if sort_order.lower() == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        # Execute query
        result = await db.execute(query)
        products = result.scalars().all()
        
        return ProductListResponse(
            products=[ProductResponse.from_orm(product) for product in products],
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit
        )
        
    except Exception as e:
        logger.error(f"Error fetching admin products: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch products"
        )


@router.get("/{product_id}", response_model=ProductResponse)
@limiter.limit("60/minute")
async def get_admin_product(
    request: Request,
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))
):
    """Get a specific product by ID (Admin only)"""
    try:
        # Validate UUID format
        try:
            product_uuid = uuid.UUID(product_id)
        except ValueError:
            raise NotFoundException("Invalid product ID format")
        
        result = await db.execute(select(Product).where(Product.id == product_uuid))
        product = result.scalar_one_or_none()
        
        if not product:
            raise NotFoundException("Product not found")
        
        return ProductResponse.from_orm(product)
        
    except NotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch product"
        )


@router.post("/", response_model=ProductResponse)
@limiter.limit("10/minute")
async def create_product(
    request: Request,
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))
):
    """Create a new product (Admin only)"""
    try:
        # Check if SKU already exists
        if product_data.sku:
            result = await db.execute(select(Product).where(Product.sku == product_data.sku))
            existing_product = result.scalar_one_or_none()
            if existing_product:
                raise ConflictException("A product with this SKU already exists")
        
        # Create new product
        product = Product(
            id=uuid.uuid4(),
            name=product_data.name,
            description=product_data.description,
            price=product_data.price,
            original_price=product_data.original_price,
            category=product_data.category,
            subcategory=product_data.subcategory,
            brand=product_data.brand,
            sku=product_data.sku,
            images=product_data.images or [],
            specifications=product_data.specifications or {},
            features=product_data.features or [],
            sizes=product_data.sizes or [],
            colors=product_data.colors or [],
            stock_quantity=product_data.stock_quantity or 0,
            is_active=product_data.is_active if product_data.is_active is not None else True,
            is_featured=product_data.is_featured if product_data.is_featured is not None else False,
            tags=product_data.tags or [],
            seo_title=product_data.seo_title,
            seo_description=product_data.seo_description,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(product)
        await db.commit()
        await db.refresh(product)
        
        logger.info(f"Product created: {product.id} by user {current_user.id}")
        return ProductResponse.from_orm(product)
        
    except ConflictException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating product: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create product"
        )


@router.put("/{product_id}", response_model=ProductResponse)
@limiter.limit("20/minute")
async def update_product(
    request: Request,
    product_id: str,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))
):
    """Update an existing product (Admin only)"""
    try:
        # Validate UUID format
        try:
            product_uuid = uuid.UUID(product_id)
        except ValueError:
            raise NotFoundException("Invalid product ID format")
        
        # Get existing product
        result = await db.execute(select(Product).where(Product.id == product_uuid))
        product = result.scalar_one_or_none()
        
        if not product:
            raise NotFoundException("Product not found")
        
        # Check if SKU is being changed and if it conflicts
        if product_data.sku and product_data.sku != product.sku:
            result = await db.execute(select(Product).where(Product.sku == product_data.sku))
            existing_product = result.scalar_one_or_none()
            if existing_product:
                raise ConflictException("A product with this SKU already exists")
        
        # Update product fields
        update_data = product_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(product, field):
                setattr(product, field, value)
        
        product.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(product)
        
        logger.info(f"Product updated: {product.id} by user {current_user.id}")
        return ProductResponse.from_orm(product)
        
    except (NotFoundException, ConflictException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update product"
        )


@router.delete("/{product_id}")
@limiter.limit("10/minute")
async def delete_product(
    request: Request,
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))
):
    """Delete a product (Admin only)"""
    try:
        # Validate UUID format
        try:
            product_uuid = uuid.UUID(product_id)
        except ValueError:
            raise NotFoundException("Invalid product ID format")
        
        # Get existing product
        result = await db.execute(select(Product).where(Product.id == product_uuid))
        product = result.scalar_one_or_none()
        
        if not product:
            raise NotFoundException("Product not found")
        
        # Check if product has associated orders (optional safety check)
        # This could be enhanced to check for existing orders
        
        await db.delete(product)
        await db.commit()
        
        logger.info(f"Product deleted: {product.id} by user {current_user.id}")
        return {"message": "Product deleted successfully", "product_id": product_id}
        
    except NotFoundException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete product"
        )


@router.patch("/{product_id}/status")
@limiter.limit("30/minute")
async def toggle_product_status(
    request: Request,
    product_id: str,
    is_active: bool = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))
):
    """Toggle product active status (Admin only)"""
    try:
        # Validate UUID format
        try:
            product_uuid = uuid.UUID(product_id)
        except ValueError:
            raise NotFoundException("Invalid product ID format")
        
        # Get existing product
        result = await db.execute(select(Product).where(Product.id == product_uuid))
        product = result.scalar_one_or_none()
        
        if not product:
            raise NotFoundException("Product not found")
        
        product.is_active = is_active
        product.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(product)
        
        status_text = "activated" if is_active else "deactivated"
        logger.info(f"Product {status_text}: {product.id} by user {current_user.id}")
        
        return {
            "message": f"Product {status_text} successfully",
            "product_id": product_id,
            "is_active": is_active
        }
        
    except NotFoundException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error toggling product status {product_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update product status"
        )


@router.patch("/{product_id}/featured")
@limiter.limit("30/minute")
async def toggle_product_featured(
    request: Request,
    product_id: str,
    is_featured: bool = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))
):
    """Toggle product featured status (Admin only)"""
    try:
        # Validate UUID format
        try:
            product_uuid = uuid.UUID(product_id)
        except ValueError:
            raise NotFoundException("Invalid product ID format")
        
        # Get existing product
        result = await db.execute(select(Product).where(Product.id == product_uuid))
        product = result.scalar_one_or_none()
        
        if not product:
            raise NotFoundException("Product not found")
        
        product.is_featured = is_featured
        product.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(product)
        
        status_text = "featured" if is_featured else "unfeatured"
        logger.info(f"Product {status_text}: {product.id} by user {current_user.id}")
        
        return {
            "message": f"Product {status_text} successfully",
            "product_id": product_id,
            "is_featured": is_featured
        }
        
    except NotFoundException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error toggling product featured status {product_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update product featured status"
        )


@router.post("/{product_id}/images")
@limiter.limit("5/minute")
async def upload_product_images(
    request: Request,
    product_id: str,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))
):
    """Upload images for a product (Admin only)"""
    try:
        # Validate UUID format
        try:
            product_uuid = uuid.UUID(product_id)
        except ValueError:
            raise NotFoundException("Invalid product ID format")
        
        # Get existing product
        result = await db.execute(select(Product).where(Product.id == product_uuid))
        product = result.scalar_one_or_none()
        
        if not product:
            raise NotFoundException("Product not found")
        
        # Validate file types and sizes
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        max_size = 5 * 1024 * 1024  # 5MB
        
        uploaded_files = []
        for file in files:
            if file.content_type not in allowed_types:
                raise BadRequestException(f"Invalid file type: {file.content_type}")
            
            content = await file.read()
            if len(content) > max_size:
                raise BadRequestException(f"File too large: {file.filename}")
            
            # Upload file using FileService
            file_service = FileService()
            file_path = await file_service.upload_file(
                content=content,
                filename=file.filename,
                folder="products"
            )
            
            uploaded_files.append(file_path)
        
        # Update product images
        if not product.images:
            product.images = []
        
        product.images.extend(uploaded_files)
        product.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(product)
        
        logger.info(f"Images uploaded for product {product.id} by user {current_user.id}")
        return {
            "message": f"{len(uploaded_files)} images uploaded successfully",
            "product_id": product_id,
            "uploaded_files": uploaded_files,
            "total_images": len(product.images)
        }
        
    except (NotFoundException, BadRequestException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error uploading images for product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to upload images"
        )


@router.get("/stats/summary")
@limiter.limit("30/minute")
async def get_product_stats(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))
):
    """Get product statistics summary (Admin only)"""
    try:
        # Get total products
        total_result = await db.execute(select(func.count(Product.id)))
        total_products = total_result.scalar()
        
        # Get active products
        active_result = await db.execute(select(func.count(Product.id)).where(Product.is_active == True))
        active_products = active_result.scalar()
        
        # Get featured products
        featured_result = await db.execute(select(func.count(Product.id)).where(Product.is_featured == True))
        featured_products = featured_result.scalar()
        
        # Get low stock products (less than 10)
        low_stock_result = await db.execute(select(func.count(Product.id)).where(Product.stock_quantity < 10))
        low_stock_products = low_stock_result.scalar()
        
        # Get out of stock products
        out_of_stock_result = await db.execute(select(func.count(Product.id)).where(Product.stock_quantity == 0))
        out_of_stock_products = out_of_stock_result.scalar()
        
        return {
            "total_products": total_products,
            "active_products": active_products,
            "inactive_products": total_products - active_products,
            "featured_products": featured_products,
            "low_stock_products": low_stock_products,
            "out_of_stock_products": out_of_stock_products,
            "categories": await get_category_stats(db)
        }
        
    except Exception as e:
        logger.error(f"Error fetching product stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch product statistics"
        )


async def get_category_stats(db: AsyncSession):
    """Get product count by category"""
    try:
        result = await db.execute(
            select(Product.category, func.count(Product.id).label('count'))
            .group_by(Product.category)
            .order_by(desc('count'))
        )
        categories = result.all()
        return [{"category": cat[0], "count": cat[1]} for cat in categories]
    except Exception as e:
        logger.error(f"Error fetching category stats: {str(e)}")
        return []