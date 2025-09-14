# backend/app/schemas/group.py
from pydantic import BaseModel, Field, EmailStr
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
    members: List[EmailStr] = []

class AddGroupMember(BaseModel):
    id: int
    email: EmailStr

class GroupId(BaseModel):
    id: int

class LeaveGroupResponse(BaseModel):
    group_id: int
    message: str
    remaining_members: List[str]
    new_admin: Optional[str] = None

class GroupDetailResponse(BaseModel):
    name: str
    description: Optional[str] = None
    users: List[GroupMemberResponse]

class GroupResponse(GroupBase):
    id: int
    created_by_user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    members: List[GroupMemberResponse] = [] # List of members in the group

    class Config:
        from_attributes = True

class ShareResponse(BaseModel):
    user_id: int
    share_amount: float
    is_paid: bool

    class Config:
        from_attributes = True


class GroupExpenseListResponse(BaseModel):
    id: int
    description: str
    amount: float
    group_id: int
    paid_by_user_id: int
    created_at: datetime
    expense_shares: List[ShareResponse] = []   # match ORM name

    class Config:
        from_attributes = True


class Share(BaseModel):
    user_id: int
    share_amount: float

class GroupExpenseCreate(BaseModel):
    description: str
    amount: float
    selectedMembers: List[int]
    splitMethod: str
    shares: List[Share]

class GroupExpenseResponse(BaseModel):
    id: int
    description: str
    amount: float
    group_id: int
    paid_by_user_id: int
    created_at: datetime
    shares: List[Share]

    class Config:
        from_attributes = True


# # NEW: Schema for individual balance within a group
# class UserBalance(BaseModel):
#     user_id: int
#     username: str
#     net_balance: float

# # NEW: Schema for the overall balances response
# class GroupBalancesResponse(BaseModel):
#     group_id: int
#     total_owed_by_you: float
#     total_owed_to_you: float
#     individual_balances: List[UserBalance]