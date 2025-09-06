# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

from app.api.router import api_router
from app.core.config import settings
from app.db.database import Base, engine, get_db
from app.db.models import User, Expense, Budget, ExpenseCategory # Import models to ensure they are registered with SQLAlchemy

# Create database tables if they don't exist
# In a production environment, you would use Alembic for migrations
# Base.metadata.create_all(bind=engine) # Commented out for Docker Compose setup, migrations will handle this

# Load .env file
load_dotenv()

# Read values
vm_ip = os.getenv("CORS_ORIGIN")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"/{settings.API_V1_STR}/openapi.json",
)

# Set up CORS middleware
origins = [
    vm_ip,
    # "*"
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:5173",  # React frontend development server
    "http://localhost:80"    # Nginx default port
    
    # "http://34.172.240.198:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Expense Tracker API!"}
