# backend/app/api/v1/budgets.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.budget import BudgetCreate, BudgetResponse
from app.services import budget_service
from app.api.deps import get_current_user # Dependency to get authenticated user
from datetime import datetime
from app.core.exceptions import BudgetNotFoundException # Import custom exception

router = APIRouter()

@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def set_or_update_budget(
    budget: BudgetCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Set or update a monthly budget for the authenticated user.
    """
    return budget_service.create_or_update_budget(db=db, budget=budget, user_id=current_user["id"])

@router.get("/", response_model=BudgetResponse | dict)
def get_budget(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    month: int = Query(datetime.now().month, description="Month for the budget (1-12)"),
    year: int = Query(datetime.now().year, description="Year for the budget")
):
    """
    Retrieve the budget for a specific month/year for the authenticated user.
    """
    try:
        budget = budget_service.get_user_budget(db=db, user_id=current_user["id"], month=month, year=year)
        return budget
    except BudgetNotFoundException as e:
        # Return a dictionary indicating no budget is set, consistent with remaining budget structure
        return {"budget_set": False, "total_budget": 0.0, "month": month, "year": year}

@router.get("/remaining", response_model=dict)
def get_remaining_budget_endpoint(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    month: int = Query(datetime.now().month, description="Month for remaining budget (1-12)"),
    year: int = Query(datetime.now().year, description="Year for remaining budget")
):
    """
    Calculate and retrieve the remaining budget for a specific month/year for the authenticated user.
    """
    return budget_service.get_remaining_budget(db=db, user_id=current_user["id"], month=month, year=year)
