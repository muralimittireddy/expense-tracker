# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: int
    hashed_password: str
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserSearchResponse(BaseModel):
    """
    Pydantic schema for the user search response.
    """
    email: str

    class Config:
        orm_mode = True