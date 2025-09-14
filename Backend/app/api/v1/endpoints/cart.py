from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from sqlalchemy import select, and_, or_, desc, asc, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sqlalchemy_models import Cart, User, Product
from app.schemas.cart import (
    CartItemCreate, CartItemUpdate, CartItemResponse, CartResponse, CartCountResponse
)
from app.core.postgresql import get_db
from app.core.security import get_current_active_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Constants
SHIPPING_COST = 9.99
TAX_RATE = 0.08  # 8% tax rate


@router.get("/", response_model=CartResponse)
async def get_my_cart(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's shopping cart"""
    try:
        # Get cart items for current user
        result = await db.execute(
            select(Cart, Product)
            .join(Product, Cart.product_id == Product.id)
            .where(Cart.user_id == current_user.id, Product.is_active == True)
        )
        cart_data = result.fetchall()
        
        # Process cart items
        cart_items = []
        subtotal = 0.0
        total_items = 0
        
        for cart_item, product in cart_data:
            item_subtotal = product.price * cart_item.quantity
            subtotal += item_subtotal
            total_items += cart_item.quantity
            
            cart_items.append(CartItemResponse(
                id=str(cart_item.id),
                product_id=str(cart_item.product_id),
                product_name=product.name,
                product_image=product.images[0] if product.images else "/placeholder.svg",
                product_price=product.price,
                quantity=cart_item.quantity,
                size=cart_item.size,
                color=cart_item.color,
                subtotal=item_subtotal,
                created_at=cart_item.created_at,
                updated_at=cart_item.updated_at
            ))
        
        # Calculate totals
        shipping_cost = SHIPPING_COST if subtotal > 0 else 0
        tax = subtotal * TAX_RATE
        total = subtotal + shipping_cost + tax
        
        # Create response (using first cart item's timestamps if available)
        created_at = cart_data[0][0].created_at if cart_data else datetime.utcnow()
        updated_at = cart_data[0][0].updated_at if cart_data else datetime.utcnow()
        
        return CartResponse(
            id="cart",  # Cart doesn't have a single ID in SQLAlchemy model
            user_id=str(current_user.id),
            items=cart_items,
            total_items=total_items,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax=tax,
            total=total,
            created_at=created_at,
            updated_at=updated_at
        )
        
    except Exception as e:
        logger.error(f"Error fetching cart: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch cart"
        )


@router.post("/add", response_model=CartItemResponse)
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a product to cart"""
    try:
        # Verify product exists and is active
        product_result = await db.execute(
            select(Product).where(Product.id == item_data.product_id, Product.is_active == True)
        )
        product = product_result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Check stock quantity
        if product.stock_quantity and item_data.quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock_quantity} items available in stock"
            )
        
        # Check if product is already in cart
        existing_cart_result = await db.execute(
            select(Cart).where(
                Cart.user_id == current_user.id,
                Cart.product_id == item_data.product_id,
                Cart.size == item_data.size,
                Cart.color == item_data.color
            )
        )
        existing_cart_item = existing_cart_result.scalar_one_or_none()
        
        if existing_cart_item:
            # Update quantity
            new_quantity = existing_cart_item.quantity + item_data.quantity
            
            # Check stock again
            if product.stock_quantity and new_quantity > product.stock_quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Only {product.stock_quantity} items available in stock"
                )
            
            existing_cart_item.quantity = new_quantity
            existing_cart_item.updated_at = datetime.utcnow()
            
            await db.commit()
            await db.refresh(existing_cart_item)
            
            updated_item = existing_cart_item
        else:
            # Add new item
            new_cart_item = Cart(
                user_id=current_user.id,
                product_id=product.id,
                quantity=item_data.quantity,
                size=item_data.size,
                color=item_data.color
            )
            
            db.add(new_cart_item)
            await db.commit()
            await db.refresh(new_cart_item)
            
            updated_item = new_cart_item
        
        logger.info(f"Product {item_data.product_id} added to cart for user {current_user.email}")
        
        # Return the updated item
        item_subtotal = product.price * updated_item.quantity
        
        return CartItemResponse(
            id=str(updated_item.id),
            product_id=str(updated_item.product_id),
            product_name=product.name,
            product_image=product.images[0] if product.images else "/placeholder.svg",
            product_price=product.price,
            quantity=updated_item.quantity,
            size=updated_item.size,
            color=updated_item.color,
            subtotal=item_subtotal,
            created_at=updated_item.created_at,
            updated_at=updated_item.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding to cart: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add to cart"
        )


@router.put("/update/{cart_item_id}")
async def update_cart_item(
    cart_item_id: str,
    item_update: CartItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a cart item"""
    try:
        # Find cart item
        cart_result = await db.execute(
            select(Cart).where(Cart.id == cart_item_id, Cart.user_id == current_user.id)
        )
        cart_item = cart_result.scalar_one_or_none()
        
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
        
        # Verify product exists and check stock
        product_result = await db.execute(
            select(Product).where(Product.id == cart_item.product_id, Product.is_active == True)
        )
        product = product_result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is not available"
            )
        
        if product.stock_quantity and item_update.quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock_quantity} items available in stock"
            )
        
        # Update item
        cart_item.quantity = item_update.quantity
        cart_item.size = item_update.size
        cart_item.color = item_update.color
        cart_item.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(cart_item)
        
        logger.info(f"Cart item updated for product {cart_item.product_id} by user {current_user.email}")
        
        return {"message": "Cart item updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating cart item: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update cart item"
        )


@router.delete("/remove/{cart_item_id}")
async def remove_from_cart(
    cart_item_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a product from cart"""
    try:
        # Find and delete cart item
        result = await db.execute(
            select(Cart).where(Cart.id == cart_item_id, Cart.user_id == current_user.id)
        )
        cart_item = result.scalar_one_or_none()
        
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
        
        await db.delete(cart_item)
        await db.commit()
        
        logger.info(f"Product {cart_item.product_id} removed from cart for user {current_user.email}")
        
        return {"message": "Product removed from cart successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing from cart: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove from cart"
        )


@router.delete("/clear")
async def clear_cart(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Clear all items from cart"""
    try:
        # Delete all cart items for user
        await db.execute(
            Cart.__table__.delete().where(Cart.user_id == current_user.id)
        )
        await db.commit()
        
        logger.info(f"Cart cleared for user {current_user.email}")
        
        return {"message": "Cart cleared successfully"}
        
    except Exception as e:
        logger.error(f"Error clearing cart: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear cart"
        )


@router.get("/count", response_model=CartCountResponse)
async def get_cart_count(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the number of items in user's cart"""
    try:
        # Get cart count
        result = await db.execute(
            select(func.sum(Cart.quantity)).where(Cart.user_id == current_user.id)
        )
        count = result.scalar() or 0
        
        return CartCountResponse(count=count)
        
    except Exception as e:
        logger.error(f"Error getting cart count: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get cart count"
        )
