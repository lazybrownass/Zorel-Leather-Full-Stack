from app.core.postgresql import init_postgresql, close_postgresql, get_db
from app.core.config import settings
from app.core.init_data import initialize_data
import logging

logger = logging.getLogger(__name__)


async def init_db():
    """Initialize PostgreSQL database"""
    try:
        logger.info("🔄 Initializing PostgreSQL database...")
        await init_postgresql()
        
        # Initialize sample data in development
        if settings.ENVIRONMENT == "development":
            await initialize_data()
            
        logger.info("✅ Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {e}")
        raise e


async def close_db():
    """Close database connections"""
    try:
        await close_postgresql()
        logger.info("🔌 Database connections closed")
    except Exception as e:
        logger.error(f"❌ Error closing database connections: {e}")


# Export the get_db dependency for use in API endpoints
__all__ = ["init_db", "close_db", "get_db"]
