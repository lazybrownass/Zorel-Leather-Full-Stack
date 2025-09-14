#!/usr/bin/env python3

from fastapi import FastAPI, Depends, HTTPException
from app.core.security import get_current_active_user, require_roles, UserRole
from app.models.sqlalchemy_models import User

app = FastAPI()

@app.get("/test-auth")
async def test_auth(current_user: User = Depends(get_current_active_user)):
    return {
        "user_email": current_user.email,
        "user_role": current_user.role,
        "user_role_value": current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role),
        "is_active": current_user.is_active
    }

@app.get("/test-require-roles")
async def test_require_roles(current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    return {
        "user_email": current_user.email,
        "user_role": current_user.role,
        "user_role_value": current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role),
        "is_active": current_user.is_active,
        "message": "Access granted!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
