# backend/app/schemas/group.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Assuming UserResponse or a similar slimmed-down user schema for members
class GroupMemberResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class GroupBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None # NEW: Optional description

class GroupCreate(GroupBase):
    pass

class GroupResponse(GroupBase):
    id: int
    created_by_user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    members: List[GroupMemberResponse] = [] # List of members in the group

    class Config:
        from_attributes = True
