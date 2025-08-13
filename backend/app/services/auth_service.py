# backend/app/services/auth_service.py
from sqlalchemy.orm import Session
from app.db.models import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash
from app.core.exceptions import UserAlreadyExistsException, UserNotFoundException
from app.db import crud # Import crud

def get_user_by_username(db: Session, username: str):
    """Retrieves a user by username."""
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    """Retrieves a user by email."""
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    """Creates a new user in the database."""
    # Check if username or email already exists using service functions
    if get_user_by_username(db, username=user.username) or get_user_by_email(db, email=user.email):
        raise UserAlreadyExistsException()

    hashed_password = get_password_hash(user.password)
    user_in_db = user.model_dump()
    user_in_db["hashed_password"] = hashed_password
    del user_in_db["password"] # Remove plain password before passing to crud

    db_user = crud.create_item(db, User, user_in_db)
    return db_user
