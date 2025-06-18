from pydantic import BaseModel, EmailStr, validator
import re
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    phone: str
    
    @validator('email')
    def email_must_be_valid(cls, v):
        if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', v):
            raise ValueError('Invalid email format')
        return v
    
    @validator('phone')
    def phone_must_be_valid(cls, v):
        if not re.match(r'^01[0125][0-9]{8}$', v):
            raise ValueError('Invalid Egyptian phone number format')
        return v
    
    @validator('password')
    def password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    username: str
    email: str
    
class UserProfile(BaseModel):
    user_id: str
    username: str
    email: str
    phone: str
    created_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
