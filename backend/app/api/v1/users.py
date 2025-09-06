from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.api.deps import get_current_user # Dependency to get authenticated user
from app.core.exceptions import EmailNotFoundException 
from app.db.models import User
from app.schemas.user import UserSearchResponse

router = APIRouter()

@router.get("/validate_email/{email}")
def validate_email(
    email: str,
    db: Session = Depends(get_db)
):
    """
    check if an email is associated with an existing user.
    """
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            return True
        return False
        
        
    except EmailNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    
@router.get("/search", response_model=List[UserSearchResponse])
async def search_users(
    email: str = Query(..., min_length=3, description="Email address to search for."),
    db: Session = Depends(get_db)
):
    """
    Search for users by their email address.
    
    This endpoint performs a case-insensitive search for users whose email
    contains the provided query string.
    """
    # Use ilike for case-insensitive partial matching
    # Add a limit to prevent returning too many results
    users = db.query(User).filter(User.email.ilike(f"%{email}%")).limit(10).all()
    
    # Return a list of UserSearchResponse models
    return [UserSearchResponse(email=user.email) for user in users]