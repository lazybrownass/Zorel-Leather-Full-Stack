from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_active_user
)
from app.models.sqlalchemy_models import User, UserRole
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, UserUpdate
from app.core.postgresql import get_db
from app.core.exceptions import ConflictException, UnauthorizedException

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=UserResponse)
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists by email
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise ConflictException("An account with this email address already exists. Please use a different email or try logging in.")
    
    # Check if username already exists
    result = await db.execute(select(User).where(User.username == user_data.username))
    existing_username = result.scalar_one_or_none()
    if existing_username:
        raise ConflictException("This username is already taken. Please choose a different username.")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password,
        phone=user_data.phone,
        date_of_birth=user_data.date_of_birth,
        employee_id=user_data.employee_id,
        role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=False
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Return user without password hash
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        username=user.username,
        role=user.role,
        phone=user.phone,
        date_of_birth=user.date_of_birth,
        employee_id=user.employee_id,
        addresses=user.addresses,
        preferences=user.preferences,
        is_active=user.is_active,
        is_verified=user.is_verified,
        profile_image=user.profile_image,
        created_at=user.created_at,
        updated_at=user.updated_at
    )


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(request: Request, user_credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user and return JWT token"""
    # Find user by email
    result = await db.execute(select(User).where(User.email == user_credentials.email))
    user = result.scalar_one_or_none()
    
    # Check if user exists
    if not user:
        raise UnauthorizedException("No account found with this email address. Please check your email or register for a new account.")
    
    # Check if password is correct
    if not verify_password(user_credentials.password, user.password_hash):
        raise UnauthorizedException("Incorrect password. Please check your password and try again.")
    
    # Check if account is active
    if not user.is_active:
        raise UnauthorizedException("Your account has been deactivated. Please contact support for assistance.")
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    # Return user info with token
    user_response = UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        username=user.username,
        role=user.role,
        phone=user.phone,
        date_of_birth=user.date_of_birth,
        employee_id=user.employee_id,
        addresses=user.addresses,
        preferences=user.preferences,
        is_active=user.is_active,
        is_verified=user.is_verified,
        profile_image=user.profile_image,
        created_at=user.created_at,
        updated_at=user.updated_at
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        username=current_user.username,
        role=current_user.role,
        phone=current_user.phone,
        date_of_birth=current_user.date_of_birth,
        employee_id=current_user.employee_id,
        addresses=current_user.addresses,
        preferences=current_user.preferences,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        profile_image=current_user.profile_image,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )


@router.post("/logout")
async def logout():
    """Logout user (client should remove token)"""
    return {"message": "Successfully logged out"}


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user information"""
    # Update user fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(current_user, field) and value is not None:
            setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(current_user)
    
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        username=current_user.username,
        role=current_user.role,
        phone=current_user.phone,
        date_of_birth=current_user.date_of_birth,
        employee_id=current_user.employee_id,
        addresses=current_user.addresses,
        preferences=current_user.preferences,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        profile_image=current_user.profile_image,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )
