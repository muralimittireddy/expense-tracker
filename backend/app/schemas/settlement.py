# backend/app/schemas/settlement.py
from pydantic import BaseModel, Field
from datetime import datetime

class SettlementBase(BaseModel):
    from_user_id: int
    to_user_id: int
    group_id: int
    amount: float = Field(..., gt=0)

class SettlementCreate(SettlementBase):
    pass

class SettlementResponse(SettlementBase):
    id: int
    settled_at: datetime

    class Config:
        from_attributes = True
