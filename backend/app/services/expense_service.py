# backend/app/services/expense_service.py
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, extract
from app.db.models import Expense, User, ExpenseCategory, Group # Import Group model
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.db import crud # Import crud
from app.core.exceptions import ExpenseNotFoundException

def create_user_expense(db: Session, expense: ExpenseCreate, user_id: int):
    """Creates a new expense for a given user."""
    expense_in_db = expense.model_dump()
    expense_in_db["owner_id"] = user_id

    # If paid_by_user_id is not provided, default it to the owner_id
    if expense_in_db.get("paid_by_user_id") is None:
        expense_in_db["paid_by_user_id"] = user_id

    # Ensure expense_shares is an empty list if None, as SQLAlchemy expects a list-like collection
    if expense_in_db.get("expense_shares") is None:
        expense_in_db["expense_shares"] = []

    db_expense = crud.create_item(db, Expense, expense_in_db)
    return db_expense

def get_user_expenses(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    category: ExpenseCategory | None = None,
    group_id: int | None = None # Added group_id parameter
) -> List[Expense]:
    """Retrieves expenses for a user with optional filters."""
    # Start with a base query for Expense
    query = db.query(Expense)

    # If group_id is provided, filter by group_id and ensure the user is part of that group
    if group_id:
        # Corrected join: Join Expense to Group, then Group to its members
        query = query.join(Expense.group).join(Group.members).filter( # <--- CORRECTED LINE
            Expense.group_id == group_id,
            User.id == user_id # Ensure the authenticated user is a member of the group
        )
    else:
        # If no group_id, filter by owner_id (personal expenses)
        query = query.filter(Expense.owner_id == user_id)

    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)
    if category:
        query = query.filter(Expense.category == category)
    
    # Eager load related data for response
    query = query.options(joinedload(Expense.payer), joinedload(Expense.expense_shares))

    return query.offset(skip).limit(limit).all()

def get_user_expense(db: Session, expense_id: int, user_id: int) -> Optional[Expense]:
    """Retrieves a single expense by ID for a specific user."""
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.owner_id == user_id).first()
    if not expense:
        raise ExpenseNotFoundException()
    return expense

def update_user_expense(db: Session, expense_id: int, user_id: int, expense_update: ExpenseUpdate) -> Expense:
    """Updates an existing expense for a user."""
    db_expense = get_user_expense(db, expense_id, user_id)
    
    updated_data = expense_update.model_dump(exclude_unset=True)
    db_expense = crud.update_item(db, db_expense, updated_data)
    return db_expense

def delete_user_expense(db: Session, expense_id: int, user_id: int):
    """Deletes an expense for a user."""
    db_expense = get_user_expense(db, expense_id, user_id)
    crud.delete_item(db, db_expense)
    return True # Indicate successful deletion

def get_monthly_spending_summary(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """
    Calculates total spending per month for a user across all years.
    Returns a list of dictionaries like: [{"year": 2023, "month": 1, "total_spent": 1500.0}, ...]
    """
    results = db.query(
        extract('year', Expense.date).label('year'),
        extract('month', Expense.date).label('month'),
        func.sum(Expense.amount).label('total_spent')
    ).filter(
        Expense.owner_id == user_id
    ).group_by(
        extract('year', Expense.date),
        extract('month', Expense.date)
    ).order_by(
        extract('year', Expense.date),
        extract('month', Expense.date)
    ).all()

    return [{"year": int(r.year), "month": int(r.month), "total_spent": float(r.total_spent)} for r in results]

def get_spending_by_category(db: Session, user_id: int, month: int | None = None, year: int | None = None) -> List[Dict[str, Any]]:
    """
    Calculates total spending per category for a user, optionally filtered by month and year.
    Returns a list of dictionaries like: [{"category": "Food", "total_spent": 500.0}, ...]
    """
    query = db.query(
        Expense.category,
        func.sum(Expense.amount).label('total_spent')
    ).filter(
        Expense.owner_id == user_id
    )

    if month:
        query = query.filter(extract('month', Expense.date) == month)
    if year:
        query = query.filter(extract('year', Expense.date) == year)

    results = query.group_by(
        Expense.category
    ).order_by(
        Expense.category
    ).all()

    return [{"category": r.category.value, "total_spent": float(r.total_spent)} for r in results]
