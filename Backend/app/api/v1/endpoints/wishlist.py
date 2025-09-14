from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from sqlalchemy import select, and_, or_, desc, asc, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sqlalchemy_models import Wishlist, User, Product
from app.schemas.wishlist import (
    WishlistItemCreate, WishlistItemUpdate, WishlistItemResponse, 
    WishlistResponse, WishlistStatusResponse, WishlistCountResponse
)
from app.core.postgresql import get_db
from app.core.security import get_current_active_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=WishlistResponse)
async def get_my_wishlist(
    current_user: User = Depends(get_current_active_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's wishlist with product details"""
    try:
        # Get wishlist items for current user
        result = await db.execute(
            select(Wishlist, Product)
            .join(Product, Wishlist.product_id == Product.id)
            .where(Wishlist.user_id == current_user.id, Product.is_active == True)
            .order_by(desc(Wishlist.created_at))
        )
        wishlist_data = result.fetchall()
        
        # Apply pagination
        offset = (page - 1) * limit
        paginated_data = wishlist_data[offset:offset + limit]
        
        # Process wishlist items
        wishlist_items = []
        for wishlist_item, product in paginated_data:
            wishlist_items.append(WishlistItemResponse(
                id=str(wishlist_item.id),
                product_id=str(wishlist_item.product_id),
                product_name=product.name,
                product_image=product.images[0] if product.images else "/placeholder.svg",
                product_price=product.price,
                personal_note=wishlist_item.personal_note,
                created_at=wishlist_item.created_at
            ))
        
        # Get total count
        total_items = len(wishlist_data)
        
        # Get earliest created_at for response
        created_at = wishlist_data[0][0].created_at if wishlist_data else datetime.utcnow()
        
        return WishlistResponse(
            id="wishlist",  # Wishlist doesn't have a single ID in SQLAlchemy model
            user_id=str(current_user.id),
            items=wishlist_items,
            total_items=total_items,
            created_at=created_at
        )
        
    except Exception as e:
        logger.error(f"Error fetching wishlist: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch wishlist"
        )


@router.post("/add", response_model=WishlistItemResponse)
async def add_to_wishlist(
    item_data: WishlistItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a product to wishlist"""
    try:
        # Verify product exists
        product_result = await db.execute(
            select(Product).where(Product.id == item_data.product_id, Product.is_active == True)
        )
        product = product_result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Check if product is already in wishlist
        existing_item_result = await db.execute(
            select(Wishlist).where(
                Wishlist.user_id == current_user.id,
                Wishlist.product_id == item_data.product_id
            )
        )
        existing_item = existing_item_result.scalar_one_or_none()
        
        if existing_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is already in your wishlist"
            )
        
        # Add new item
        new_wishlist_item = Wishlist(
            user_id=current_user.id,
            product_id=product.id,
            personal_note=item_data.personal_note
        )
        
        db.add(new_wishlist_item)
        await db.commit()
        await db.refresh(new_wishlist_item)
        
        logger.info(f"Product {item_data.product_id} added to wishlist for user {current_user.email}")
        
        return WishlistItemResponse(
            id=str(new_wishlist_item.id),
            product_id=str(new_wishlist_item.product_id),
            product_name=product.name,
            product_image=product.images[0] if product.images else "/placeholder.svg",
            product_price=product.price,
            personal_note=new_wishlist_item.personal_note,
            created_at=new_wishlist_item.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding to wishlist: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add to wishlist"
        )


@router.delete("/remove/{product_id}")
async def remove_from_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a product from wishlist"""
    try:
        # Find and delete wishlist item
        result = await db.execute(
            select(Wishlist).where(
                Wishlist.user_id == current_user.id,
                Wishlist.product_id == product_id
            )
        )
        wishlist_item = result.scalar_one_or_none()
        
        if not wishlist_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found in wishlist"
            )
        
        await db.delete(wishlist_item)
        await db.commit()
        
        logger.info(f"Product {product_id} removed from wishlist for user {current_user.email}")
        
        return {"message": "Product removed from wishlist successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing from wishlist: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove from wishlist"
        )


@router.put("/update-note/{product_id}")
async def update_wishlist_item_note(
    product_id: str,
    item_update: WishlistItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update personal note for a wishlist item"""
    try:
        # Find wishlist item
        result = await db.execute(
            select(Wishlist).where(
                Wishlist.user_id == current_user.id,
                Wishlist.product_id == product_id
            )
        )
        wishlist_item = result.scalar_one_or_none()
        
        if not wishlist_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found in wishlist"
            )
        
        # Update note
        wishlist_item.personal_note = item_update.personal_note
        wishlist_item.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(wishlist_item)
        
        logger.info(f"Wishlist note updated for product {product_id} by user {current_user.email}")
        
        return {"message": "Wishlist item note updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating wishlist note: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update wishlist note"
        )


@router.get("/check/{product_id}", response_model=WishlistStatusResponse)
async def check_wishlist_status(
    product_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Check if a product is in user's wishlist"""
    try:
        # Check if product is in wishlist
        result = await db.execute(
            select(Wishlist).where(
                Wishlist.user_id == current_user.id,
                Wishlist.product_id == product_id
            )
        )
        wishlist_item = result.scalar_one_or_none()
        
        return WishlistStatusResponse(
            in_wishlist=wishlist_item is not None,
            personal_note=wishlist_item.personal_note if wishlist_item else ""
        )
        
    except Exception as e:
        logger.error(f"Error checking wishlist status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check wishlist status"
        )


@router.get("/count", response_model=WishlistCountResponse)
async def get_wishlist_count(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the number of items in user's wishlist"""
    try:
        # Get wishlist count
        result = await db.execute(
            select(func.count(Wishlist.id)).where(Wishlist.user_id == current_user.id)
        )
        count = result.scalar() or 0
        
        return WishlistCountResponse(count=count)
        
    except Exception as e:
        logger.error(f"Error getting wishlist count: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get wishlist count"
        )


@router.delete("/clear")
async def clear_wishlist(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Clear all items from wishlist"""
    try:
        # Delete all wishlist items for user
        await db.execute(
            Wishlist.__table__.delete().where(Wishlist.user_id == current_user.id)
        )
        await db.commit()
        
        logger.info(f"Wishlist cleared for user {current_user.email}")
        
        return {"message": "Wishlist cleared successfully"}
        
    except Exception as e:
        logger.error(f"Error clearing wishlist: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear wishlist"
        )