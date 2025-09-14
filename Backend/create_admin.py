#!/usr/bin/env python3
"""
Script to create admin users for the Zorel Leather system
"""
import asyncio
import sys
import os

# Add the Backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.init_data import create_admin_user, create_super_admin_user
from app.core.config import settings

async def main():
    """Create admin users"""
    print("🚀 Creating admin users for Zorel Leather...")
    print(f"📧 Admin Email: {settings.ADMIN_EMAIL}")
    print(f"🔑 Admin Password: {settings.ADMIN_PASSWORD}")
    print(f"📧 Super Admin Email: {settings.SUPER_ADMIN_EMAIL}")
    print(f"🔑 Super Admin Password: {settings.SUPER_ADMIN_PASSWORD}")
    print("-" * 50)
    
    try:
        # Create Super Admin first
        print("👑 Creating Super Admin user...")
        await create_super_admin_user()
        
        # Create regular Admin
        print("👤 Creating Admin user...")
        await create_admin_user()
        
        print("✅ Admin users created successfully!")
        print("\n📋 Login Credentials:")
        print(f"Super Admin: {settings.SUPER_ADMIN_EMAIL} / {settings.SUPER_ADMIN_PASSWORD}")
        print(f"Admin: {settings.ADMIN_EMAIL} / {settings.ADMIN_PASSWORD}")
        print("\n🌐 You can now login at: http://localhost:3000/admin/login")
        
    except Exception as e:
        print(f"❌ Error creating admin users: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
