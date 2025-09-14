#!/usr/bin/env python3

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import verify_token, get_current_active_user
from app.core.postgresql import get_db
from app.models.sqlalchemy_models import User, UserRole
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI()
security = HTTPBearer()

@app.get("/debug-role")
async def debug_role(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """Debug endpoint to check role information"""
    
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    email = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=401, detail="No email in token")
    
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "email": user.email,
        "role": user.role,
        "role_type": type(user.role),
        "role_value": user.role.value if hasattr(user.role, 'value') else str(user.role),
        "is_super_admin": user.role == UserRole.SUPER_ADMIN,
        "is_admin": user.role == UserRole.ADMIN,
        "in_admin_roles": user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN],
        "UserRole.SUPER_ADMIN": UserRole.SUPER_ADMIN,
        "UserRole.ADMIN": UserRole.ADMIN,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
