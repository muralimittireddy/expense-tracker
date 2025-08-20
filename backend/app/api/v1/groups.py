# backend/app/api/v1/groups.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.group import GroupCreate, GroupResponse
from app.services import group_service
from app.api.deps import get_current_user # Dependency to get authenticated user
from app.core.exceptions import GroupNotFoundException

router = APIRouter()

@router.post("/", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    group: GroupCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new split group for the authenticated user.
    The creator will automatically be added as a member.
    """
    return group_service.create_group(db=db, group_in=group, user_id=current_user["id"])

@router.get("/", response_model=List[GroupResponse])
def read_groups(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all groups the authenticated user is a member of.
    """
    groups = group_service.get_user_groups(db=db, user_id=current_user["id"])
    return groups
@router.get("/{group_id}", response_model=GroupResponse)
def read_group(
    group_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific group by ID, ensuring the authenticated user is a member.
    """
    try:
        group = group_service.get_user_group_by_id(db=db, group_id=group_id, user_id=current_user["id"])
        return group
    except GroupNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
