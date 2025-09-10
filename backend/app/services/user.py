# backend/app/crud/user.py

from sqlalchemy.orm import Session
from app.db.models import User as UserModel
from typing import Optional

def get_user_by_id(db: Session, user_id: int) -> Optional[UserModel]:
    """
    Retrieves a user by their ID.
    """
    return db.query(UserModel).filter(UserModel.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[UserModel]:
    """
    Retrieves a user by their email.
    """
    return db.query(UserModel).filter(UserModel.email == email).first()