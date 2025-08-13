# backend/app/api/v1/expenses.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.services import expense_service
from app.db.models import ExpenseCategory
from app.api.deps import get_current_user # Dependency to get authenticated user
from app.core.exceptions import ExpenseNotFoundException # Import custom exception

router = APIRouter()

@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: ExpenseCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new expense for the authenticated user.
    """
    return expense_service.create_user_expense(db=db, expense=expense, user_id=current_user["id"])

@router.get("/", response_model=List[ExpenseResponse])
def read_expenses(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    start_date: datetime | None = Query(None, description="Filter expenses from this date (YYYY-MM-DD)"),
    end_date: datetime | None = Query(None, description="Filter expenses up to this date (YYYY-MM-DD)"),
    category: ExpenseCategory | None = Query(None, description="Filter expenses by category")
):
    """
    Retrieve expenses for the authenticated user with optional filters.
    """
    expenses = expense_service.get_user_expenses(
        db=db,
        user_id=current_user["id"],
        skip=skip,
        limit=limit,
        start_date=start_date,
        end_date=end_date,
        category=category
    )
    return expenses

@router.get("/{expense_id}", response_model=ExpenseResponse)
def read_expense(
    expense_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific expense by ID for the authenticated user.
    """
    try:
        expense = expense_service.get_user_expense(db=db, expense_id=expense_id, user_id=current_user["id"])
        return expense
    except ExpenseNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense: ExpenseUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing expense for the authenticated user.
    """
    try:
        db_expense = expense_service.update_user_expense(db=db, expense_id=expense_id, user_id=current_user["id"], expense_update=expense)
        return db_expense
    except ExpenseNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an expense for the authenticated user.
    """
    try:
        expense_service.delete_user_expense(db=db, expense_id=expense_id, user_id=current_user["id"])
        return
    except ExpenseNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
