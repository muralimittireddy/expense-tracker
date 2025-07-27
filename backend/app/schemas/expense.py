# backend/app/schemas/expense.py
from pydantic import BaseModel, Field
from datetime import datetime
from app.db.models import ExpenseCategory

class ExpenseBase(BaseModel):
    description: str = Field(..., max_length=255)
    amount: float = Field(..., gt=0)
    date: datetime = Field(default_factory=datetime.now)
    category: ExpenseCategory = ExpenseCategory.OTHER

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(ExpenseBase):
    description: str | None = None
    amount: float | None = None
    date: datetime | None = None
    category: ExpenseCategory | None = None

class ExpenseResponse(ExpenseBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True