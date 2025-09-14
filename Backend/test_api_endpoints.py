#!/usr/bin/env python3
"""
Test script for API endpoints with PostgreSQL
"""
import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

async def test_api_imports():
    """Test that API endpoints can be imported without errors"""
    print("🔄 Testing API endpoint imports...")
    
    try:
        # Test auth endpoint
        from app.api.v1.endpoints.auth import router as auth_router
        print("✅ Auth endpoint imported successfully")
        
        # Test products endpoint
        from app.api.v1.endpoints.products import router as products_router
        print("✅ Products endpoint imported successfully")
        
        # Test core modules
        from app.core.postgresql import get_db
        from app.core.security import get_current_active_user
        print("✅ Core modules imported successfully")
        
        # Test models
        from app.models.sqlalchemy_models import User, Product, UserRole
        print("✅ SQLAlchemy models imported successfully")
        
        # Test schemas
        from app.schemas.user import UserCreate, UserResponse
        from app.schemas.product import ProductCreate, ProductResponse
        print("✅ Pydantic schemas imported successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_database_operations():
    """Test basic database operations"""
    print("🔄 Testing database operations...")
    
    try:
        from app.core.postgresql import get_db
        from app.models.sqlalchemy_models import User, Product, UserRole
        from app.schemas.user import UserCreate
        from sqlalchemy import select
        
        # Test database session
        async for session in get_db():
            try:
                # Test user creation
                user_data = UserCreate(
                    email="test@example.com",
                    username="testuser",
                    name="Test User",
                    password="testpassword123"
                )
                
                # Check if user exists
                result = await session.execute(select(User).where(User.email == user_data.email))
                existing_user = result.scalar_one_or_none()
                
                if existing_user:
                    print("✅ User query successful")
                else:
                    print("✅ User query successful (no existing user)")
                
                # Test product query
                result = await session.execute(select(Product).limit(1))
                product = result.scalar_one_or_none()
                
                if product:
                    print("✅ Product query successful")
                else:
                    print("✅ Product query successful (no products)")
                
                return True
                
            except Exception as e:
                print(f"❌ Database operation failed: {e}")
                return False
            finally:
                await session.close()
            break
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

async def test_schema_validation():
    """Test Pydantic schema validation"""
    print("🔄 Testing schema validation...")
    
    try:
        from app.schemas.user import UserCreate, UserResponse
        from app.schemas.product import ProductCreate, ProductResponse
        
        # Test user schema
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "name": "Test User",
            "password": "testpassword123"
        }
        user_create = UserCreate(**user_data)
        print("✅ User schema validation successful")
        
        # Test product schema
        product_data = {
            "name": "Test Product",
            "description": "Test description",
            "price": 99.99,
            "category": "test",
            "stock_quantity": 10
        }
        product_create = ProductCreate(**product_data)
        print("✅ Product schema validation successful")
        
        return True
        
    except Exception as e:
        print(f"❌ Schema validation failed: {e}")
        return False

async def main():
    """Run all API tests"""
    print("🚀 API Endpoints Test")
    print("=" * 50)
    
    tests = [
        ("Import Test", test_api_imports),
        ("Database Operations", test_database_operations),
        ("Schema Validation", test_schema_validation),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        
        try:
            result = await test_func()
            if result:
                passed += 1
                print(f"✅ {test_name} PASSED")
            else:
                print(f"❌ {test_name} FAILED")
        except Exception as e:
            print(f"❌ {test_name} FAILED with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 API TEST RESULTS: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL API TESTS PASSED! Endpoints are ready.")
        return True
    else:
        print("⚠️  Some tests failed. Please review the issues above.")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
