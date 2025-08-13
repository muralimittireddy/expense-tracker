# backend/app/schemas/budget.py
from pydantic import BaseModel, Field
from datetime import datetime

class BudgetBase(BaseModel):
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000)
    amount: float = Field(..., gt=0)

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BudgetBase):
    amount: float | None = None

class BudgetResponse(BudgetBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True