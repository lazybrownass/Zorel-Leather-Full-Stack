#!/usr/bin/env python3

import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.security import verify_token, get_current_user
from app.core.postgresql import get_db
from app.models.sqlalchemy_models import UserRole, User
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

async def debug_auth():
    """Debug authentication and role checking"""
    
    # Test token
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdXBlcmFkbWluQHpvcmVsbGVhdGhlci5jb20iLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJleHAiOjE3NTc4MTAwMjV9.uxqidfMp7180GK8TSbmgkkaGs6syHrNGPOwOE-FK2eY"
    
    print("1. Verifying token...")
    payload = verify_token(token)
    if payload:
        print(f"   Token payload: {payload}")
        print(f"   Role in token: {payload.get('role')}")
        print(f"   Role type: {type(payload.get('role'))}")
    else:
        print("   Token verification failed")
        return
    
    print("\n2. Getting user from database...")
    async for db in get_db():
        result = await db.execute(select(User).where(User.email == payload.get('sub')))
        user = result.scalar_one_or_none()
        if user:
            print(f"   User found: {user.email}")
            print(f"   User role: {user.role}")
            print(f"   User role type: {type(user.role)}")
            print(f"   User role value: {user.role.value if hasattr(user.role, 'value') else user.role}")
            
            print(f"\n3. Role comparison:")
            print(f"   user.role == UserRole.SUPER_ADMIN: {user.role == UserRole.SUPER_ADMIN}")
            print(f"   user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]: {user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]}")
            
            print(f"\n4. Enum values:")
            print(f"   UserRole.SUPER_ADMIN: {UserRole.SUPER_ADMIN}")
            print(f"   UserRole.ADMIN: {UserRole.ADMIN}")
        else:
            print("   User not found")
        break

if __name__ == "__main__":
    asyncio.run(debug_auth())
