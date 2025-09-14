from pydantic import BaseModel, field_validator
from typing import Union
import uuid

class BaseResponseSchema(BaseModel):
    """Base schema with UUID to string conversion"""
    
    @field_validator('*', mode='before')
    @classmethod
    def convert_uuid_fields(cls, v):
        """Convert UUID fields to strings"""
        if isinstance(v, uuid.UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True
