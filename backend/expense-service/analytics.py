# backend/app/api/v1/analytics.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime

from app.db.database import get_db
from app.services import expense_service
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/monthly_spending", response_model=List[Dict[str, Any]])
def get_monthly_spending(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get total spending for each month for the authenticated user.
    """
    return expense_service.get_monthly_spending_summary(db=db, user_id=current_user["id"])

@router.get("/spending_by_category", response_model=List[Dict[str, Any]])
def get_category_spending(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    month: int | None = Query(None, ge=1, le=12, description="Filter by specific month (1-12)"),
    year: int | None = Query(None, ge=2000, description="Filter by specific year")
):
    """
    Get total spending by category for the authenticated user, optionally filtered by month and year.
    """
    return expense_service.get_spending_by_category(db=db, user_id=current_user["id"], month=month, year=year)
