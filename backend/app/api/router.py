# backend/app/api/router.py
from fastapi import APIRouter

from app.api.v1 import auth, expenses, budgets, analytics,groups,users # Import analytics

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"]) # Include analytics router
api_router.include_router(groups.router, prefix="/splits/groups", tags=["splits_groups"]) # Include groups router
api_router.include_router(users.router, prefix="/users", tags=["users"]) # Include users router