from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.api import api_router
from app.core.exceptions import setup_exception_handlers

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# Rate limiting setup
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        logger.info("Initializing database...")
        await init_db()
        logger.info("Database initialized successfully")
        logger.info("ZOREL LEATHER Backend is ready!")
        logger.info(f"Environment: {settings.ENVIRONMENT}")
        logger.info(f"Database: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise
    yield
    # Shutdown
    logger.info("Shutting down ZOREL LEATHER Backend...")


app = FastAPI(
    title="ZOREL LEATHER API",
    description="E-commerce backend for ZOREL LEATHER with request-confirm-pay model",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.zorelleather.com"]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Setup exception handlers
setup_exception_handlers(app)


@app.get("/")
async def root():
    return {
        "message": "ZOREL LEATHER API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )
