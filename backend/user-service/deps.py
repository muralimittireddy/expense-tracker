# backend/app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.database import get_db
from app.services import auth_service
from app.schemas.token import TokenData
from app.schemas.user import UserInDB
from app.core.exceptions import UserNotFoundException # Import custom exception

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> dict: # Changed return type to dict for simplicity in this scaffold
    """
    Dependency to get the current authenticated user.
    Raises HTTPException if token is invalid or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = auth_service.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    # Return a dictionary representation of the user for simplicity in this scaffold
    # In a real app, you might return a UserInDB object or a custom User object
    return {"id": user.id, "username": user.username, "email": user.email}
