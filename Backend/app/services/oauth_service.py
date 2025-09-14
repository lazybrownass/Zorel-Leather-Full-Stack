from authlib.integrations.httpx_client import AsyncOAuth2Client
from authlib.oauth2.rfc6749 import OAuth2Token
from app.core.config import settings
from app.core.security import create_access_token
from app.models.sqlalchemy_models import User, UserRole
from app.core.postgresql import get_db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import logging

logger = logging.getLogger(__name__)

class GoogleOAuthService:
    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI
        self.scope = "openid email profile"
        
    def get_authorization_url(self, state: str = None) -> str:
        """Generate Google OAuth authorization URL"""
        client = AsyncOAuth2Client(
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.redirect_uri,
            scope=self.scope
        )
        
        authorization_url, state = client.create_authorization_url(
            "https://accounts.google.com/o/oauth2/v2/auth",
            state=state
        )
        
        return authorization_url, state
    
    async def get_access_token(self, authorization_code: str) -> OAuth2Token:
        """Exchange authorization code for access token"""
        client = AsyncOAuth2Client(
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.redirect_uri
        )
        
        token = await client.fetch_token(
            "https://oauth2.googleapis.com/token",
            code=authorization_code
        )
        
        return token
    
    async def get_user_info(self, access_token: str) -> dict:
        """Get user information from Google"""
        client = AsyncOAuth2Client(token={"access_token": access_token})
        
        response = await client.get("https://www.googleapis.com/oauth2/v2/userinfo")
        return response.json()
    
    async def authenticate_user(self, user_info: dict, db: AsyncSession) -> User:
        """Authenticate or create user from Google OAuth data"""
        email = user_info.get("email")
        google_id = user_info.get("id")
        name = user_info.get("name", "")
        picture = user_info.get("picture", "")
        
        if not email:
            raise ValueError("Email not provided by Google")
        
        # Check if user exists by email
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user:
            # Update user with Google ID if not set
            if not user.google_id:
                user.google_id = google_id
                user.profile_image = picture
                await db.commit()
                await db.refresh(user)
            return user
        
        # Create new user
        user = User(
            email=email,
            username=email.split("@")[0],  # Use email prefix as username
            name=name,
            google_id=google_id,
            profile_image=picture,
            is_active=True,
            is_verified=True,  # Google verified users are considered verified
            role=UserRole.CUSTOMER
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        logger.info(f"Created new user via Google OAuth: {email}")
        return user
    
    async def create_jwt_token(self, user: User) -> str:
        """Create JWT token for authenticated user"""
        return create_access_token(
            data={"sub": user.email, "role": user.role.value}
        )

# Global instance
google_oauth_service = GoogleOAuthService()
