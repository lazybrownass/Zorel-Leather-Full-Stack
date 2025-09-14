from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.models.sqlalchemy_models import User
from app.schemas.user import UserUpdate, Address
from app.core.security import get_current_active_user, get_password_hash, verify_password
from app.core.postgresql import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, asc
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class AddressCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    street: str = Field(..., min_length=5, max_length=200)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    zip_code: str = Field(..., min_length=5, max_length=10)
    country: str = Field(default="USA", max_length=100)
    phone: Optional[str] = None
    is_default: bool = False


class AddressUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    street: Optional[str] = Field(None, min_length=5, max_length=200)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    state: Optional[str] = Field(None, min_length=2, max_length=100)
    zip_code: Optional[str] = Field(None, min_length=5, max_length=10)
    country: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = None
    is_default: Optional[bool] = None


@router.get("/")
async def get_my_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's profile"""
    try:
        return {
            "id": str(current_user.id),
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "addresses": current_user.addresses,
            "is_active": current_user.is_active,
            "created_at": current_user.created_at,
            "updated_at": current_user.updated_at
        }
        
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile"
        )


@router.put("/")
async def update_profile(
    profile_update: ProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile"""
    try:
        # Check if email is being changed and if it's already taken
        if profile_update.email and profile_update.email != current_user.email:
            existing_query = select(User).where(User.email == profile_update.email)
            existing_result = await db.execute(existing_query)
            existing_user = existing_result.scalar_one_or_none()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists"
                )
        
        # Update fields
        update_data = profile_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(current_user, field):
                setattr(current_user, field, value)
        
        await db.commit()
        await db.refresh(current_user)
        
        logger.info(f"Profile updated for user {current_user.email}")
        
        return {
            "message": "Profile updated successfully",
            "user": {
                "id": str(current_user.id),
                "name": current_user.name,
                "email": current_user.email,
                "phone": current_user.phone,
                "updated_at": current_user.updated_at
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.put("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Change user password"""
    try:
        # Verify current password
        if not verify_password(password_data.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Update password
        current_user.password_hash = get_password_hash(password_data.new_password)
        await db.commit()
        await db.refresh(current_user)
        
        logger.info(f"Password changed for user {current_user.email}")
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )


@router.get("/addresses")
async def get_addresses(
    current_user: User = Depends(get_current_active_user)
):
    """Get user's addresses"""
    try:
        return {"addresses": current_user.addresses}
        
    except Exception as e:
        logger.error(f"Error fetching addresses: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch addresses"
        )


@router.post("/addresses")
async def add_address(
    address_data: AddressCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a new address"""
    try:
        # If this is set as default, remove default from other addresses
        if address_data.is_default:
            for address in current_user.addresses:
                address.is_default = False
        
        # Create new address
        new_address = Address(
            name=address_data.name,
            street=address_data.street,
            city=address_data.city,
            state=address_data.state,
            zip_code=address_data.zip_code,
            country=address_data.country,
            phone=address_data.phone,
            is_default=address_data.is_default
        )
        
        current_user.addresses.append(new_address)
        await db.commit()
        await db.refresh(current_user)
        
        logger.info(f"Address added for user {current_user.email}")
        
        return {
            "message": "Address added successfully",
            "address": new_address
        }
        
    except Exception as e:
        logger.error(f"Error adding address: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add address"
        )


@router.put("/addresses/{address_index}")
async def update_address(
    address_index: int,
    address_update: AddressUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an address"""
    try:
        if address_index < 0 or address_index >= len(current_user.addresses):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
        
        address = current_user.addresses[address_index]
        
        # If setting as default, remove default from other addresses
        if address_update.is_default:
            for addr in current_user.addresses:
                addr.is_default = False
        
        # Update address fields
        update_data = address_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(address, field):
                setattr(address, field, value)
        
        await db.commit()
        await db.refresh(current_user)
        
        logger.info(f"Address updated for user {current_user.email}")
        
        return {
            "message": "Address updated successfully",
            "address": address
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating address: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update address"
        )


@router.delete("/addresses/{address_index}")
async def delete_address(
    address_index: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an address"""
    try:
        if address_index < 0 or address_index >= len(current_user.addresses):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
        
        # Check if this is the only address
        if len(current_user.addresses) == 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the only address"
            )
        
        deleted_address = current_user.addresses.pop(address_index)
        
        # If deleted address was default, set first address as default
        if deleted_address.is_default and current_user.addresses:
            current_user.addresses[0].is_default = True
        
        await db.commit()
        await db.refresh(current_user)
        
        logger.info(f"Address deleted for user {current_user.email}")
        
        return {"message": "Address deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting address: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete address"
        )


@router.put("/addresses/{address_index}/set-default")
async def set_default_address(
    address_index: int,
    current_user: User = Depends(get_current_active_user)
):
    """Set an address as default"""
    try:
        if address_index < 0 or address_index >= len(current_user.addresses):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
        
        # Remove default from all addresses
        for address in current_user.addresses:
            address.is_default = False
        
        # Set selected address as default
        current_user.addresses[address_index].is_default = True
        
        current_user.updated_at = datetime.utcnow()
        await current_user.save()
        
        logger.info(f"Default address set for user {current_user.email}")
        
        return {"message": "Default address set successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting default address: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set default address"
        )


@router.get("/stats")
async def get_profile_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user profile statistics"""
    try:
        from app.models.sqlalchemy_models import Order, PaymentStatus, Wishlist, Cart
        from sqlalchemy import select, func
        
        # Get order statistics
        orders_query = select(Order).where(Order.user_id == current_user.id)
        orders_result = await db.execute(orders_query)
        orders = orders_result.scalars().all()
        total_orders = len(orders)
        total_spent = sum(order.total_amount for order in orders if order.payment_status == PaymentStatus.COMPLETED)
        
        # Get wishlist count
        wishlist_query = select(func.count(Wishlist.id)).where(Wishlist.user_id == current_user.id)
        wishlist_result = await db.execute(wishlist_query)
        wishlist_count = wishlist_result.scalar() or 0
        
        # Get cart count
        cart_query = select(func.sum(Cart.quantity)).where(Cart.user_id == current_user.id)
        cart_result = await db.execute(cart_query)
        cart_count = cart_result.scalar() or 0
        
        return {
            "total_orders": total_orders,
            "total_spent": total_spent,
            "wishlist_count": wishlist_count,
            "cart_count": cart_count,
            "member_since": current_user.created_at
        }
        
    except Exception as e:
        logger.error(f"Error fetching profile stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile statistics"
        )
