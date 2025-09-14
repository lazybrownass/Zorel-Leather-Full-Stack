from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Union
from datetime import datetime
from app.models.sqlalchemy_models import AdminRequestStatus
import uuid

class AdminRequestCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    date_of_birth: Optional[datetime] = None
    employee_id: Optional[str] = None

class AdminRequestResponse(BaseModel):
    id: Union[str, uuid.UUID]
    name: str
    email: str
    date_of_birth: Optional[datetime] = None
    employee_id: Optional[str] = None
    status: AdminRequestStatus
    requested_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[Union[str, uuid.UUID]] = None
    rejection_reason: Optional[str] = None

    @field_validator('id', 'reviewed_by', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

    class Config:
        from_attributes = True

class AdminRequestApproval(BaseModel):
    rejection_reason: Optional[str] = None

class AdminRequestList(BaseModel):
    requests: List[AdminRequestResponse]
    total: int
    page: int
    limit: int
    total_pages: int
