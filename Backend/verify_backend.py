#!/usr/bin/env python3
"""
Comprehensive backend verification script
"""
import asyncio
import sys
import os
import importlib

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_imports():
    """Test all critical imports"""
    print("🔄 Testing critical imports...")
    
    try:
        # Core imports
        from app.core.config import settings
        from app.core.postgresql import engine, AsyncSessionLocal, get_db
        from app.core.database import init_db, close_db
        from app.core.security import get_password_hash, verify_password
        print("✅ Core imports successful")
        
        # Model imports
        from app.models.sqlalchemy_models import User, Product, Order, UserRole
        print("✅ Model imports successful")
        
        # Schema imports
        from app.schemas.user import UserCreate, UserResponse, UserLogin
        from app.schemas.product import ProductCreate, ProductResponse
        print("✅ Schema imports successful")
        
        return True
        
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False

def test_configuration():
    """Test configuration settings"""
    print("🔄 Testing configuration...")
    
    try:
        from app.core.config import settings
        
        # Check required settings
        required_settings = [
            'DATABASE_URL', 'DATABASE_NAME', 'SECRET_KEY', 
            'ENVIRONMENT', 'FRONTEND_URL'
        ]
        
        for setting in required_settings:
            if not hasattr(settings, setting):
                print(f"❌ Missing setting: {setting}")
                return False
            if not getattr(settings, setting):
                print(f"❌ Empty setting: {setting}")
                return False
        
        print("✅ Configuration test successful")
        return True
        
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

async def test_database_connection():
    """Test database connection"""
    print("🔄 Testing database connection...")
    
    try:
        from app.core.postgresql import engine
        
        # Test connection
        async with engine.begin() as conn:
            result = await conn.execute("SELECT 1 as test")
            row = result.fetchone()
            if row and row[0] == 1:
                print("✅ Database connection successful")
                return True
            else:
                print("❌ Database connection failed")
                return False
                
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False

async def test_database_initialization():
    """Test database initialization"""
    print("🔄 Testing database initialization...")
    
    try:
        from app.core.database import init_db, close_db
        
        # Initialize database
        await init_db()
        print("✅ Database initialization successful")
        
        # Close database
        await close_db()
        print("✅ Database cleanup successful")
        
        return True
        
    except Exception as e:
        print(f"❌ Database initialization test failed: {e}")
        return False

def test_model_relationships():
    """Test model relationships"""
    print("🔄 Testing model relationships...")
    
    try:
        from app.models.sqlalchemy_models import User, Product, Order, OrderItem
        
        # Check if models have proper relationships
        user_relationships = ['orders', 'reviews', 'wishlist_items', 'cart_items']
        product_relationships = ['order_items', 'reviews', 'wishlist_items', 'cart_items']
        order_relationships = ['user', 'order_items', 'invoices']
        
        for rel in user_relationships:
            if not hasattr(User, rel):
                print(f"❌ Missing User relationship: {rel}")
                return False
        
        for rel in product_relationships:
            if not hasattr(Product, rel):
                print(f"❌ Missing Product relationship: {rel}")
                return False
        
        for rel in order_relationships:
            if not hasattr(Order, rel):
                print(f"❌ Missing Order relationship: {rel}")
                return False
        
        print("✅ Model relationships test successful")
        return True
        
    except Exception as e:
        print(f"❌ Model relationships test failed: {e}")
        return False

def test_schema_validation():
    """Test Pydantic schema validation"""
    print("🔄 Testing schema validation...")
    
    try:
        from app.schemas.user import UserCreate, UserResponse
        from app.schemas.product import ProductCreate, ProductResponse
        from app.models.sqlalchemy_models import UserRole
        
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
        print(f"❌ Schema validation test failed: {e}")
        return False

async def main():
    """Run all verification tests"""
    print("🚀 ZOREL LEATHER Backend Verification")
    print("=" * 60)
    
    tests = [
        ("Import Test", test_imports),
        ("Configuration Test", test_configuration),
        ("Database Connection", test_database_connection),
        ("Database Initialization", test_database_initialization),
        ("Model Relationships", test_model_relationships),
        ("Schema Validation", test_schema_validation),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 40)
        
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
            
            if result:
                passed += 1
                print(f"✅ {test_name} PASSED")
            else:
                print(f"❌ {test_name} FAILED")
                
        except Exception as e:
            print(f"❌ {test_name} FAILED with exception: {e}")
    
    print("\n" + "=" * 60)
    print(f"📊 VERIFICATION RESULTS: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Backend is ready for use.")
        return True
    else:
        print("⚠️  Some tests failed. Please review the issues above.")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
