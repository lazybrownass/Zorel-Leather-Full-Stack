#!/usr/bin/env python3
"""
Debug script to check users in database
"""

import asyncio
from app.core.postgresql import get_db
from app.models.sqlalchemy_models import User
from sqlalchemy import select
from app.schemas.user import UserResponse

async def debug_users():
    """Debug users in database"""
    print("🔍 Debugging users in database...")
    
    async for db in get_db():
        try:
            # Get all users
            result = await db.execute(select(User))
            users = result.scalars().all()
            
            print(f"📊 Found {len(users)} users in database")
            
            for i, user in enumerate(users):
                print(f"\n👤 User {i+1}:")
                print(f"   ID: {user.id}")
                print(f"   Name: {user.name}")
                print(f"   Email: {user.email}")
                print(f"   Username: {user.username}")
                print(f"   Role: {user.role}")
                print(f"   Is Active: {user.is_active}")
                print(f"   Is Verified: {user.is_verified}")
                print(f"   Phone: {user.phone}")
                print(f"   Addresses: {user.addresses}")
                print(f"   Created At: {user.created_at}")
                print(f"   Updated At: {user.updated_at}")
                
                # Try to create UserResponse
                try:
                    user_response = UserResponse(
                        id=str(user.id),
                        name=user.name,
                        email=user.email,
                        username=user.username,
                        role=user.role,
                        phone=user.phone,
                        addresses=user.addresses or [],
                        is_active=user.is_active,
                        is_verified=user.is_verified,
                        created_at=user.created_at,
                        updated_at=user.updated_at
                    )
                    print("   ✅ UserResponse created successfully")
                except Exception as e:
                    print(f"   ❌ UserResponse creation failed: {str(e)}")
                    print(f"   Error type: {type(e)}")
        
        except Exception as e:
            print(f"❌ Database error: {str(e)}")
        
        break

if __name__ == "__main__":
    asyncio.run(debug_users())
