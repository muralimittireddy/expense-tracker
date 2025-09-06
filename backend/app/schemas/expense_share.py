# backend/app/schemas/expense_share.py
# from pydantic import BaseModel, Field
# from datetime import datetime

# class ExpenseShareBase(BaseModel):
#     user_id: int
#     share_amount: float = Field(..., gt=0)

# class ExpenseShareCreate(ExpenseShareBase):
#     pass

# class ExpenseShareResponse(ExpenseShareBase):
#     id: int
#     expense_id: int
#     created_at: datetime
#     updated_at: datetime | None = None

#     class Config:
#         from_attributes = True
