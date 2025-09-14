#!/usr/bin/env python3
"""
Script to fix the database by adding the missing google_id column
"""
import asyncio
import asyncpg
from app.core.config import settings
import re

def convert_sqlalchemy_url_to_asyncpg_url(sqlalchemy_url: str) -> str:
    """Convert SQLAlchemy URL to asyncpg URL"""
    # Remove the +asyncpg part
    url = sqlalchemy_url.replace('postgresql+asyncpg://', 'postgresql://')
    return url

async def fix_database():
    """Add the missing google_id column to the users table"""
    try:
        # Convert SQLAlchemy URL to asyncpg URL
        asyncpg_url = convert_sqlalchemy_url_to_asyncpg_url(settings.DATABASE_URL)
        
        # Connect to the database
        conn = await asyncpg.connect(asyncpg_url)
        
        print("🔍 Checking if google_id column exists...")
        
        # Check if column already exists
        result = await conn.fetchval("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'google_id'
        """)
        
        if not result:
            print("➕ Adding google_id column to users table...")
            
            # Add the google_id column
            await conn.execute('ALTER TABLE users ADD COLUMN google_id VARCHAR(100)')
            print("✅ Added google_id column")
            
            # Create index on google_id for faster lookups
            await conn.execute('CREATE INDEX ix_users_google_id ON users(google_id)')
            print("✅ Created index on google_id")
            
            # Make password_hash nullable for OAuth users
            await conn.execute('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL')
            print("✅ Made password_hash nullable")
            
            print("🎉 Database migration completed successfully!")
        else:
            print("✅ google_id column already exists")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'conn' in locals():
            await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_database())
