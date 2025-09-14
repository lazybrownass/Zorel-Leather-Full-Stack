from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from app.models.sqlalchemy_models import UserRole
import uuid


class Address(BaseModel):
    id: Optional[str] = None
    type: str = Field(..., description="Address type: 'home', 'work', 'billing', 'shipping'")
    name: str = Field(..., min_length=1, max_length=100)
    line1: str = Field(..., min_length=1, max_length=200)
    line2: Optional[str] = Field(None, max_length=200)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None
    is_default: bool = False

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    employee_id: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    employee_id: Optional[str] = None
    addresses: Optional[List[Dict[str, Any]]] = None
    preferences: Optional[Dict[str, Any]] = None

class UserResponse(UserBase):
    id: Union[str, uuid.UUID]
    role: UserRole
    is_active: bool
    is_verified: bool
    profile_image: Optional[str] = None
    addresses: List[Dict[str, Any]] = []
    preferences: Dict[str, Any] = {}
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
