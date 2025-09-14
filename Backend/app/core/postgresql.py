from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    future=True
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Create base class for models
Base = declarative_base()


async def init_postgresql():
    """Initialize PostgreSQL database connection"""
    try:
        logger.info("🔄 Initializing PostgreSQL connection...")
        # Test the connection
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ PostgreSQL connection initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize PostgreSQL: {e}")
        raise e


async def close_postgresql():
    """Close PostgreSQL database connection"""
    try:
        await engine.dispose()
        logger.info("🔌 PostgreSQL connection closed")
    except Exception as e:
        logger.error(f"❌ Error closing PostgreSQL connection: {e}")
        raise e


async def get_db() -> AsyncSession:
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
