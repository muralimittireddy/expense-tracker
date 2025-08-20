# backend/app/schemas/expense.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.db.models import ExpenseCategory
from app.schemas.expense_share import ExpenseShareCreate, ExpenseShareResponse # Import ExpenseShare schemas

class ExpenseBase(BaseModel):
    description: str = Field(..., max_length=255)
    amount: float = Field(..., gt=0)
    date: datetime = Field(default_factory=datetime.now)
    category: ExpenseCategory = ExpenseCategory.OTHER
    group_id: Optional[int] = None # Optional, if it's a group expense
    paid_by_user_id: Optional[int] = None# NEW: Who paid for this expense

class ExpenseCreate(ExpenseBase):
    # For group expenses, include shares when creating
    expense_shares: Optional[List[ExpenseShareCreate]] = None

class ExpenseUpdate(ExpenseBase):
    description: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[datetime] = None
    category: Optional[ExpenseCategory] = None
    group_id: Optional[int] = None # Can be updated, but usually set on creation
    paid_by_user_id: Optional[int] = None # Can be updated


class ExpenseResponse(ExpenseBase):
    id: int
    owner_id: int # The user who owns this expense record
    created_at: datetime
    updated_at: datetime | None = None
    expense_shares: List[ExpenseShareResponse] = [] # NEW: Include shares in response

    class Config:
        from_attributes = True