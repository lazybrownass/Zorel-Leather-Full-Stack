from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.postgresql import get_db
from app.core.security import get_current_active_user
from app.services.oauth_service import google_oauth_service
from app.core.exceptions import BadRequestException
import logging
import secrets

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/auth/google")
async def google_login():
    """Initiate Google OAuth login"""
    try:
        # Generate a random state for security
        state = secrets.token_urlsafe(32)
        
        # Get authorization URL
        authorization_url, state = google_oauth_service.get_authorization_url(state=state)
        
        # In a real app, you'd store the state in session or cache
        # For now, we'll redirect directly
        return RedirectResponse(url=authorization_url)
        
    except Exception as e:
        logger.error(f"Error initiating Google OAuth: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate Google login")

@router.get("/auth/google/callback")
async def google_callback(
    code: str = Query(..., description="Authorization code from Google"),
    state: str = Query(None, description="State parameter for security"),
    db: AsyncSession = Depends(get_db)
):
    """Handle Google OAuth callback"""
    try:
        if not code:
            raise BadRequestException("Authorization code not provided")
        
        # Exchange code for access token
        token = await google_oauth_service.get_access_token(code)
        access_token = token.get("access_token")
        
        if not access_token:
            raise BadRequestException("Failed to get access token from Google")
        
        # Get user info from Google
        user_info = await google_oauth_service.get_user_info(access_token)
        
        # Authenticate or create user
        user = await google_oauth_service.authenticate_user(user_info, db)
        
        # Create JWT token
        jwt_token = await google_oauth_service.create_jwt_token(user)
        
        # Redirect to frontend with token
        # In production, you'd want to use a more secure method
        redirect_url = f"http://localhost:3000/auth/callback?token={jwt_token}&user_id={user.id}"
        
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        logger.error(f"Error in Google OAuth callback: {e}")
        # Redirect to frontend with error
        error_url = f"http://localhost:3000/auth/callback?error={str(e)}"
        return RedirectResponse(url=error_url)

@router.get("/auth/google/user-info")
async def get_google_user_info(
    current_user = Depends(get_current_active_user)
):
    """Get current user's Google OAuth info"""
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "profile_image": current_user.profile_image,
        "google_id": current_user.google_id,
        "is_google_user": bool(current_user.google_id)
    }
