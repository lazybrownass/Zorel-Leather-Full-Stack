#!/usr/bin/env python3
"""
Data seeding script for ZOREL LEATHER Backend
Run this script to populate the database with sample data
"""

import asyncio
import sys
import os

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import init_db
from app.core.init_data import initialize_data
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed_data():
    """Seed the database with sample data"""
    try:
        logger.info("Connecting to database...")
        await init_db()
        
        logger.info("Seeding data...")
        await initialize_data()
        
        logger.info("Data seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Data seeding failed: {str(e)}")
        raise
    finally:
        # Close database connection
        from app.core.database import close_db
        await close_db()


if __name__ == "__main__":
    asyncio.run(seed_data())
