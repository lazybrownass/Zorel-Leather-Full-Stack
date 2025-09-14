#!/usr/bin/env python3
"""
Simple test script for PostgreSQL setup without complex dependencies
"""
import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

async def test_postgresql_connection():
    """Test basic PostgreSQL connection"""
    print("🚀 Testing PostgreSQL Connection...")
    print("=" * 50)
    
    try:
        # Test basic imports
        print("🔄 Testing imports...")
        from app.core.postgresql import engine, AsyncSessionLocal
        from app.models.sqlalchemy_models import Base
        from sqlalchemy import text
        print("✅ Imports successful")
        
        # Test database connection
        print("🔄 Testing database connection...")
        async with engine.begin() as conn:
            # Test basic query
            result = await conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            if row and row[0] == 1:
                print("✅ Database connection successful")
            else:
                print("❌ Database connection failed")
                return False
        
        # Test session creation
        print("🔄 Testing session creation...")
        async with AsyncSessionLocal() as session:
            # Test basic query
            result = await session.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            if row and row[0] == 1:
                print("✅ Session creation successful")
            else:
                print("❌ Session creation failed")
                return False
        
        # Test table creation
        print("🔄 Testing table creation...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Tables created successfully")
        
        print("🎉 All PostgreSQL tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        try:
            await engine.dispose()
            print("🔌 Database connections closed")
        except:
            pass

if __name__ == "__main__":
    success = asyncio.run(test_postgresql_connection())
    sys.exit(0 if success else 1)
