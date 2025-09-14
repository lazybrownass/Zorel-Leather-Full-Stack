from fastapi import APIRouter, HTTPException, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from pydantic import BaseModel
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.models.sqlalchemy_models import User, UserRole
from app.core.postgresql import get_db
from app.core.exceptions import UnauthorizedException


class AdminLoginRequest(BaseModel):
    email: str
    password: str

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")
async def admin_login(
    request: Request,
    login_data: AdminLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Admin login endpoint"""
    # Find user by email
    result = await db.execute(select(User).where(User.email == login_data.email))
    user = result.scalar_one_or_none()
    
    # Check if user exists
    if not user:
        raise UnauthorizedException("No admin account found with this email address. Please check your email or contact the system administrator.")
    
    # Check if user has admin or super admin role
    if user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise UnauthorizedException("Access denied. This account does not have admin privileges.")
    
    # Check if password is correct
    if not verify_password(login_data.password, user.password_hash):
        raise UnauthorizedException("Incorrect password. Please check your password and try again.")
    
    # Check if account is active
    if not user.is_active:
        raise UnauthorizedException("Your admin account has been deactivated. Please contact the system administrator.")
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role.value
        }
    }
