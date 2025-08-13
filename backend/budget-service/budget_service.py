# backend/app/services/budget_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.models import Budget, Expense
from app.schemas.budget import BudgetCreate, BudgetUpdate
from datetime import datetime
from app.db import crud # Import crud
from app.core.exceptions import BudgetNotFoundException

def create_or_update_budget(db: Session, budget: BudgetCreate, user_id: int):
    """Creates a new budget or updates an existing one for a given month/year and user."""
    db_budget = db.query(Budget).filter(
        Budget.owner_id == user_id,
        Budget.month == budget.month,
        Budget.year == budget.year
    ).first()

    if db_budget:
        # Update existing budget
        updated_data = budget.model_dump(exclude_unset=True)
        db_budget = crud.update_item(db, db_budget, updated_data)
    else:
        # Create new budget
        budget_in_db = budget.model_dump()
        budget_in_db["owner_id"] = user_id
        db_budget = crud.create_item(db, Budget, budget_in_db)
    return db_budget

def get_user_budget(db: Session, user_id: int, month: int, year: int):
    """Retrieves the budget for a specific month/year for a user."""
    budget = db.query(Budget).filter(
        Budget.owner_id == user_id,
        Budget.month == month,
        Budget.year == year
    ).first()
    if not budget:
        raise BudgetNotFoundException()
    return budget

def get_current_month_spending(db: Session, user_id: int, month: int, year: int):
    """Calculates total spending for the current month and year for a user."""
    total_spending = db.query(func.sum(Expense.amount)).filter(
        Expense.owner_id == user_id,
        func.extract('month', Expense.date) == month,
        func.extract('year', Expense.date) == year
    ).scalar()
    return total_spending if total_spending is not None else 0.0

def get_remaining_budget(db: Session, user_id: int, month: int, year: int):
    """Calculates the remaining budget for a specific month/year for a user."""
    try:
        budget_obj = get_user_budget(db, user_id, month, year) # This will raise BudgetNotFoundException
    except BudgetNotFoundException:
        return {"budget_set": False, "remaining_amount": 0.0, "total_budget": 0.0, "total_spent": 0.0}

    total_spent = get_current_month_spending(db, user_id, month, year)
    remaining = budget_obj.amount - total_spent
    return {
        "budget_set": True,
        "remaining_amount": remaining,
        "total_budget": budget_obj.amount,
        "total_spent": total_spent
    }
