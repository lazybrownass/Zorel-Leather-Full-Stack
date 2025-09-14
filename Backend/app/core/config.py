from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database - PostgreSQL
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/zorel_leather"
    DATABASE_NAME: str = "zorel_leather"
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"
    
    # Legacy MongoDB (keeping for reference)
    MONGODB_URL: str = "mongodb://localhost:27017"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Email Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = "support@zorelleather.com"
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "support@zorelleather.com"
    FROM_EMAIL: str = "noreply@zorelleather.com"
    
    # WhatsApp Configuration (Twilio)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = "whatsapp:+14155238886"
    
    # WhatsApp Business API (Alternative)
    WHATSAPP_BUSINESS_API_TOKEN: str = ""
    WHATSAPP_BUSINESS_PHONE_NUMBER_ID: str = ""
    WHATSAPP_BUSINESS_VERIFY_TOKEN: str = ""
    WHATSAPP_BUSINESS_API_URL: str = "https://graph.facebook.com/v18.0"
    
    # Payment Configuration
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    
    # Security
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # File Upload
    MAX_FILE_SIZE: int = 10485760  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    # Admin Configuration
    ADMIN_EMAIL: str = "admin@zorelleather.com"
    ADMIN_PASSWORD: str = "Admin123!"
    SUPER_ADMIN_EMAIL: str = "superadmin@zorelleather.com"
    SUPER_ADMIN_PASSWORD: str = "SuperAdmin123!"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379"
    
    # Additional API Keys
    GOOGLE_MAPS_API_KEY: str = ""
    SENDGRID_API_KEY: str = ""
    
    # Social Media Integration
    FACEBOOK_APP_ID: str = ""
    FACEBOOK_APP_SECRET: str = ""
    INSTAGRAM_ACCESS_TOKEN: str = ""
    
    # Analytics
    GOOGLE_ANALYTICS_ID: str = ""
    FACEBOOK_PIXEL_ID: str = ""
    
    # Monitoring
    SENTRY_DSN: str = ""
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
