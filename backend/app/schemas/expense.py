# backend/app/schemas/expense.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.db.models import ExpenseCategory

class ExpenseBase(BaseModel):
    description: str = Field(..., max_length=255)
    amount: float = Field(..., gt=0)
    date: datetime = Field(default_factory=datetime.now)
    category: ExpenseCategory = ExpenseCategory.OTHER



class ExpenseUpdate(ExpenseBase):
    description: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[datetime] = None
    category: Optional[ExpenseCategory] = None


class ExpenseResponse(ExpenseBase):
    id: int
    owner_id: int # The user who owns this expense record
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True