#!/usr/bin/env python3
"""
ZOREL LEATHER - CRUD Operations Test Suite
Comprehensive testing of all CRUD operations for admin and user roles
"""

import asyncio
import httpx
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ZorelCRUDTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.test_product_id = None
        self.test_order_id = None
        
    async def run_all_tests(self):
        """Run all CRUD operation tests"""
        print("🚀 Starting ZOREL LEATHER CRUD Operations Test Suite")
        print("=" * 60)
        
        try:
            # Test authentication
            await self.test_authentication()
            
            # Test User CRUD operations
            await self.test_user_crud_operations()
            
            # Test Product CRUD operations
            await self.test_product_crud_operations()
            
            # Test Order CRUD operations
            await self.test_order_crud_operations()
            
            # Test Admin-specific operations
            await self.test_admin_operations()
            
            print("\n✅ All CRUD operations tests completed successfully!")
            
        except Exception as e:
            print(f"\n❌ Test suite failed: {str(e)}")
            logger.error(f"Test suite error: {str(e)}")
    
    async def test_authentication(self):
        """Test user and admin authentication"""
        print("\n🔐 Testing Authentication...")
        
        # Test admin login
        admin_credentials = {
            "email": "admin@zorelleather.com",
            "password": "AdminPass123!"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/api/v1/auth/admin-login", json=admin_credentials)
            if response.status_code == 200:
                admin_data = response.json()
                self.admin_token = admin_data.get("access_token")
                print("✅ Admin authentication successful")
            else:
                print(f"❌ Admin authentication failed: {response.status_code} - {response.text}")
                return False
        
        # Test user registration
        user_data = {
            "name": "Test User",
            "email": f"testuser_{uuid.uuid4().hex[:8]}@example.com",
            "password": "TestPass123!",
            "phone": "+1234567890"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/api/v1/auth/register", json=user_data)
            if response.status_code == 201:
                user_response = response.json()
                self.test_user_id = user_response.get("id")
                print("✅ User registration successful")
            else:
                print(f"❌ User registration failed: {response.status_code} - {response.text}")
                return False
        
        # Test user login
        user_credentials = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/api/v1/auth/login", json=user_credentials)
            if response.status_code == 200:
                user_auth_data = response.json()
                self.user_token = user_auth_data.get("access_token")
                print("✅ User authentication successful")
            else:
                print(f"❌ User authentication failed: {response.status_code} - {response.text}")
                return False
        
        return True
    
    async def test_user_crud_operations(self):
        """Test user CRUD operations"""
        print("\n👤 Testing User CRUD Operations...")
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # Test GET current user info
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/auth/me", headers=headers)
            if response.status_code == 200:
                user_info = response.json()
                print("✅ GET current user info successful")
            else:
                print(f"❌ GET current user info failed: {response.status_code}")
        
        # Test UPDATE current user
        update_data = {
            "name": "Updated Test User",
            "phone": "+1987654321"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.put(f"{self.base_url}/api/v1/auth/me", json=update_data, headers=headers)
            if response.status_code == 200:
                updated_user = response.json()
                print("✅ UPDATE current user successful")
            else:
                print(f"❌ UPDATE current user failed: {response.status_code}")
        
        # Test user profile operations
        await self.test_user_profile_operations()
    
    async def test_user_profile_operations(self):
        """Test user profile specific operations"""
        print("  📋 Testing User Profile Operations...")
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # Test GET user profile
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/customer/profile", headers=headers)
            if response.status_code == 200:
                profile = response.json()
                print("  ✅ GET user profile successful")
            else:
                print(f"  ❌ GET user profile failed: {response.status_code}")
        
        # Test UPDATE user profile
        profile_update = {
            "addresses": [
                {
                    "type": "shipping",
                    "street": "123 Test Street",
                    "city": "Test City",
                    "state": "Test State",
                    "postal_code": "12345",
                    "country": "Test Country"
                }
            ]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.put(f"{self.base_url}/api/v1/customer/profile", json=profile_update, headers=headers)
            if response.status_code == 200:
                updated_profile = response.json()
                print("  ✅ UPDATE user profile successful")
            else:
                print(f"  ❌ UPDATE user profile failed: {response.status_code}")
    
    async def test_product_crud_operations(self):
        """Test product CRUD operations"""
        print("\n🛍️ Testing Product CRUD Operations...")
        
        # Test GET products (public endpoint)
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/products/")
            if response.status_code == 200:
                products = response.json()
                print("✅ GET products (public) successful")
                if products.get("products") and len(products["products"]) > 0:
                    self.test_product_id = products["products"][0]["id"]
            else:
                print(f"❌ GET products failed: {response.status_code}")
        
        # Test GET specific product
        if self.test_product_id:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/v1/products/{self.test_product_id}")
                if response.status_code == 200:
                    product = response.json()
                    print("✅ GET specific product successful")
                else:
                    print(f"❌ GET specific product failed: {response.status_code}")
        
        # Test product search
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/search/products?q=leather")
            if response.status_code == 200:
                search_results = response.json()
                print("✅ Product search successful")
            else:
                print(f"❌ Product search failed: {response.status_code}")
        
        # Test admin product operations
        await self.test_admin_product_operations()
    
    async def test_admin_product_operations(self):
        """Test admin product CRUD operations"""
        print("  🔧 Testing Admin Product Operations...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test GET all products (admin)
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/admin/products/", headers=headers)
            if response.status_code == 200:
                admin_products = response.json()
                print("  ✅ GET all products (admin) successful")
            else:
                print(f"  ❌ GET all products (admin) failed: {response.status_code}")
        
        # Test CREATE product
        new_product = {
            "name": "Test Leather Product",
            "description": "A test product for CRUD operations",
            "price": 299.99,
            "category": "Accessories",
            "subcategory": "Wallets",
            "brand": "ZOREL LEATHER",
            "sku": f"TEST-{uuid.uuid4().hex[:8].upper()}",
            "stock_quantity": 10,
            "is_active": True,
            "is_featured": False,
            "features": ["Premium leather", "Handcrafted"],
            "sizes": ["One Size"],
            "colors": ["Brown", "Black"],
            "tags": ["test", "leather", "wallet"]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/api/v1/admin/products/", json=new_product, headers=headers)
            if response.status_code == 201:
                created_product = response.json()
                self.test_product_id = created_product["id"]
                print("  ✅ CREATE product successful")
            else:
                print(f"  ❌ CREATE product failed: {response.status_code} - {response.text}")
        
        # Test UPDATE product
        if self.test_product_id:
            update_data = {
                "name": "Updated Test Leather Product",
                "price": 349.99,
                "description": "Updated description for test product"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.put(f"{self.base_url}/api/v1/admin/products/{self.test_product_id}", json=update_data, headers=headers)
                if response.status_code == 200:
                    updated_product = response.json()
                    print("  ✅ UPDATE product successful")
                else:
                    print(f"  ❌ UPDATE product failed: {response.status_code}")
        
        # Test PATCH product status
        if self.test_product_id:
            async with httpx.AsyncClient() as client:
                response = await client.patch(f"{self.base_url}/api/v1/admin/products/{self.test_product_id}/status?is_active=false", headers=headers)
                if response.status_code == 200:
                    status_result = response.json()
                    print("  ✅ PATCH product status successful")
                else:
                    print(f"  ❌ PATCH product status failed: {response.status_code}")
        
        # Test GET product stats
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/admin/products/stats/summary", headers=headers)
            if response.status_code == 200:
                stats = response.json()
                print("  ✅ GET product stats successful")
            else:
                print(f"  ❌ GET product stats failed: {response.status_code}")
    
    async def test_order_crud_operations(self):
        """Test order CRUD operations"""
        print("\n📦 Testing Order CRUD Operations...")
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # Test CREATE order
        if self.test_product_id:
            order_data = {
                "customer_name": "Test User",
                "customer_email": "testuser@example.com",
                "customer_phone": "+1234567890",
                "shipping_address": {
                    "street": "123 Test Street",
                    "city": "Test City",
                    "state": "Test State",
                    "postal_code": "12345",
                    "country": "Test Country"
                },
                "items": [
                    {
                        "product_id": self.test_product_id,
                        "quantity": 1,
                        "price": 299.99
                    }
                ],
                "shipping_cost": 15.00,
                "notes": "Test order for CRUD operations"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.base_url}/api/v1/orders/", json=order_data, headers=headers)
                if response.status_code == 201:
                    created_order = response.json()
                    self.test_order_id = created_order["id"]
                    print("✅ CREATE order successful")
                else:
                    print(f"❌ CREATE order failed: {response.status_code} - {response.text}")
        
        # Test GET user orders
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/customer/orders", headers=headers)
            if response.status_code == 200:
                user_orders = response.json()
                print("✅ GET user orders successful")
            else:
                print(f"❌ GET user orders failed: {response.status_code}")
        
        # Test GET specific order
        if self.test_order_id:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/v1/customer/orders/{self.test_order_id}", headers=headers)
                if response.status_code == 200:
                    order_details = response.json()
                    print("✅ GET specific order successful")
                else:
                    print(f"❌ GET specific order failed: {response.status_code}")
        
        # Test admin order operations
        await self.test_admin_order_operations()
    
    async def test_admin_order_operations(self):
        """Test admin order management operations"""
        print("  🔧 Testing Admin Order Operations...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test GET all orders (admin)
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/admin/orders", headers=headers)
            if response.status_code == 200:
                admin_orders = response.json()
                print("  ✅ GET all orders (admin) successful")
            else:
                print(f"  ❌ GET all orders (admin) failed: {response.status_code}")
        
        # Test GET all requests (admin)
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/admin/requests", headers=headers)
            if response.status_code == 200:
                admin_requests = response.json()
                print("  ✅ GET all requests (admin) successful")
            else:
                print(f"  ❌ GET all requests (admin) failed: {response.status_code}")
    
    async def test_admin_operations(self):
        """Test admin-specific operations"""
        print("\n👑 Testing Admin-Specific Operations...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test GET all users (admin)
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/admin/users", headers=headers)
            if response.status_code == 200:
                all_users = response.json()
                print("✅ GET all users (admin) successful")
            else:
                print(f"❌ GET all users (admin) failed: {response.status_code}")
        
        # Test GET all customers (admin)
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/admin/customers", headers=headers)
            if response.status_code == 200:
                all_customers = response.json()
                print("✅ GET all customers (admin) successful")
            else:
                print(f"❌ GET all customers (admin) failed: {response.status_code}")
        
        # Test GET analytics
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/admin/analytics", headers=headers)
            if response.status_code == 200:
                analytics = response.json()
                print("✅ GET analytics successful")
            else:
                print(f"❌ GET analytics failed: {response.status_code}")
        
        # Test GET notifications
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/api/v1/admin/notifications", headers=headers)
            if response.status_code == 200:
                notifications = response.json()
                print("✅ GET notifications successful")
            else:
                print(f"❌ GET notifications failed: {response.status_code}")
        
        # Test user status toggle (if we have a test user)
        if self.test_user_id:
            async with httpx.AsyncClient() as client:
                response = await client.put(f"{self.base_url}/api/v1/admin/users/{self.test_user_id}/toggle-status", headers=headers)
                if response.status_code == 200:
                    toggle_result = response.json()
                    print("✅ Toggle user status successful")
                else:
                    print(f"❌ Toggle user status failed: {response.status_code}")
    
    async def cleanup_test_data(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Delete test product
        if self.test_product_id:
            async with httpx.AsyncClient() as client:
                response = await client.delete(f"{self.base_url}/api/v1/admin/products/{self.test_product_id}", headers=headers)
                if response.status_code == 200:
                    print("✅ Test product deleted")
                else:
                    print(f"❌ Failed to delete test product: {response.status_code}")
        
        print("🧹 Cleanup completed")

async def main():
    """Main function to run the test suite"""
    tester = ZorelCRUDTester()
    
    try:
        await tester.run_all_tests()
    finally:
        await tester.cleanup_test_data()

if __name__ == "__main__":
    print("ZOREL LEATHER - CRUD Operations Test Suite")
    print("Make sure the backend server is running on http://localhost:8000")
    print("Press Ctrl+C to cancel...")
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⏹️ Test suite cancelled by user")
    except Exception as e:
        print(f"\n💥 Test suite crashed: {str(e)}")
        logger.error(f"Test suite crash: {str(e)}")
