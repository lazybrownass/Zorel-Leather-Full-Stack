#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.security import get_current_user, verify_token
from app.models.sqlalchemy_models import User, UserRole
from app.core.postgresql import get_db
from sqlalchemy import select
import jwt
from app.core.config import settings

async def debug_auth():
    # Test token
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdXBlcmFkbWluQHpvcmVsbGVhdGhlci5jb20iLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJleHAiOjE3NTc4MTExODh9.YobljhijfWq6r87Rgx8NkYiVF0WJwZoFn3gZj1-uAgk"
    
    print("=== DEBUGGING AUTHENTICATION ===")
    
    # Decode token manually
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        print(f"Token payload: {payload}")
        print(f"Subject (email): {payload.get('sub')}")
        print(f"Role from token: {payload.get('role')}")
    except Exception as e:
        print(f"Token decode error: {e}")
        return
    
    # Test user lookup
    async for db in get_db():
        try:
            # Find user by email
            result = await db.execute(select(User).where(User.email == payload.get('sub')))
            user = result.scalar_one_or_none()
            
            if user:
                print(f"User found: {user.email}")
                print(f"User role: {user.role}")
                print(f"User role type: {type(user.role)}")
                print(f"User role value: {user.role.value if hasattr(user.role, 'value') else user.role}")
                print(f"User is_active: {user.is_active}")
                
                # Test role comparison
                print(f"\n=== ROLE COMPARISON ===")
                print(f"User role == UserRole.SUPER_ADMIN: {user.role == UserRole.SUPER_ADMIN}")
                print(f"User role == 'super_admin': {user.role == 'super_admin'}")
                print(f"str(user.role) == 'super_admin': {str(user.role) == 'super_admin'}")
                print(f"user.role.value == 'super_admin': {user.role.value == 'super_admin' if hasattr(user.role, 'value') else 'No value attr'}")
                
                # Test require_roles logic
                print(f"\n=== REQUIRE_ROLES TEST ===")
                user_role = user.role
                if hasattr(user_role, 'value'):
                    user_role_value = user_role.value
                else:
                    user_role_value = str(user_role)
                
                role_values = [UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value]
                print(f"User role value: {user_role_value}")
                print(f"Required role values: {role_values}")
                print(f"User role in required roles: {user_role_value in role_values}")
                
            else:
                print("User not found!")
                
        except Exception as e:
            print(f"Database error: {e}")
        finally:
            await db.close()
        break

if __name__ == "__main__":
    asyncio.run(debug_auth())
