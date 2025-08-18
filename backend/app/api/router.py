# backend/app/api/router.py
from fastapi import APIRouter

from app.api.v1 import auth, expenses, budgets, analytics # Import analytics

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"]) # Include analytics router s
