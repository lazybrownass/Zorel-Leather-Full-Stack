#!/usr/bin/env python3
"""
Test script for PostgreSQL setup
"""
import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.database import init_db, close_db
from app.core.postgresql import get_db
from app.models.sqlalchemy_models import User, Product, UserRole
from sqlalchemy import select

async def test_postgresql():
    """Test PostgreSQL connection and basic operations"""
    print("🚀 Testing PostgreSQL Setup...")
    print("=" * 50)
    
    try:
        # Initialize database
        await init_db()
        print("✅ Database initialized successfully")
        
        # Test database session
        async for session in get_db():
            try:
                # Test creating a user
                print("🔄 Testing user creation...")
                test_user = User(
                    email="test@example.com",
                    username="testuser",
                    password_hash="hashed_password",
                    name="Test User",
                    role=UserRole.CUSTOMER
                )
                session.add(test_user)
                await session.commit()
                print("✅ User created successfully")
                
                # Test querying users
                print("🔍 Testing user query...")
                result = await session.execute(select(User).where(User.email == "test@example.com"))
                user = result.scalar_one_or_none()
                if user:
                    print(f"✅ User found: {user.name} ({user.email})")
                else:
                    print("❌ User not found")
                
                # Test creating a product
                print("🔄 Testing product creation...")
                test_product = Product(
                    name="Test Leather Bag",
                    description="A beautiful test leather bag",
                    price=99.99,
                    category="bags",
                    stock_quantity=10
                )
                session.add(test_product)
                await session.commit()
                print("✅ Product created successfully")
                
                # Test querying products
                print("🔍 Testing product query...")
                result = await session.execute(select(Product).where(Product.name == "Test Leather Bag"))
                product = result.scalar_one_or_none()
                if product:
                    print(f"✅ Product found: {product.name} - ${product.price}")
                else:
                    print("❌ Product not found")
                
                # Clean up test data
                print("🧹 Cleaning up test data...")
                if user:
                    await session.delete(user)
                if product:
                    await session.delete(product)
                await session.commit()
                print("✅ Test data cleaned up")
                
            except Exception as e:
                await session.rollback()
                print(f"❌ Session error: {e}")
                raise
            finally:
                await session.close()
            break  # Only use the first session
        
        print("🎉 PostgreSQL test completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Close connections
        await close_db()
        print("🔌 Database connections closed.")

if __name__ == "__main__":
    asyncio.run(test_postgresql())
