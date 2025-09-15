#!/usr/bin/env python3
"""
Script to check existing admin users
"""
import asyncio
import sys
import os

# Add the Backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select
from app.models.sqlalchemy_models import User, UserRole
from app.core.postgresql import get_db
from app.core.config import settings

async def check_admin_users():
    """Check existing admin users"""
    print("🔍 Checking existing admin users...")
    print(f"📧 Expected Admin Email: {settings.ADMIN_EMAIL}")
    print(f"🔑 Expected Admin Password: {settings.ADMIN_PASSWORD}")
    print(f"📧 Expected Super Admin Email: {settings.SUPER_ADMIN_EMAIL}")
    print(f"🔑 Expected Super Admin Password: {settings.SUPER_ADMIN_PASSWORD}")
    print("-" * 60)
    
    async for session in get_db():
        try:
            # Check for admin users
            result = await session.execute(
                select(User).where(User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
            )
            admin_users = result.scalars().all()
            
            if not admin_users:
                print("❌ No admin users found in database")
                return
            
            print(f"✅ Found {len(admin_users)} admin user(s):")
            print()
            
            for user in admin_users:
                print(f"👤 User: {user.name}")
                print(f"📧 Email: {user.email}")
                print(f"👤 Username: {user.username}")
                print(f"🔑 Role: {user.role}")
                print(f"✅ Active: {user.is_active}")
                print(f"✅ Verified: {user.is_verified}")
                print(f"📅 Created: {user.created_at}")
                print("-" * 40)
            
            print("\n🌐 Login URLs:")
            print("Admin Login: http://localhost:3000/admin/login")
            print("Super Admin Login: http://localhost:3000/admin/login")
            
        except Exception as e:
            print(f"❌ Error checking admin users: {e}")
        finally:
            await session.close()
        break

if __name__ == "__main__":
    asyncio.run(check_admin_users())
