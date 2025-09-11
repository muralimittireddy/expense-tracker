# # backend/app/api/v1/groups.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.group import GroupResponse ,GroupCreate, AddGroupMember, GroupDetailResponse ,LeaveGroupResponse #  GroupBalancesResponse # Import GroupBalancesResponse
from app.services import group_service
from app.api.deps import get_current_user # Dependency to get authenticated user
from app.core.exceptions import GroupNotFoundException # Import custom exception

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

@router.post("/addMember",response_model=GroupResponse)
def add_member(
    member: AddGroupMember,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add group member to existing group
    """
    return group_service.add_group_member(db=db,addMember=member, user_id=current_user["id"])

@router.get("/getGroupDetail/{groupId}",response_model=GroupDetailResponse)
def get_group_detail(
    groupId:int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get Specific group details with group members names
    """

    return group_service.get_group_detail(db=db,id=groupId, user_id=current_user["id"])

@router.delete("/leaveGroup/{groupId}",response_model=LeaveGroupResponse)
def leave_group(
    groupId:int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get Specific group details with group members names
    """

    return group_service.leave_group(db=db,group_id=groupId, user_id=current_user["id"])

# @router.get("/{group_id}", response_model=GroupResponse)
# def read_group(
#     group_id: int,
#     current_user: dict = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     """
#     Retrieve a specific group by ID, ensuring the authenticated user is a member.
#     """
#     try:
#         group = group_service.get_user_group_by_id(db=db, group_id=group_id, user_id=current_user["id"])
#         return group
#     except GroupNotFoundException as e:
#         raise HTTPException(status_code=e.status_code, detail=e.detail)

# @router.get("/{group_id}/balances", response_model=GroupBalancesResponse) # NEW: Balances endpoint
# def get_group_balances_endpoint(
#     group_id: int,
#     current_user: dict = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     """
#     Calculate and retrieve balances for a specific group.
#     """
#     try:
#         balances_data = group_service.get_group_balances(db=db, group_id=group_id, current_user_id=current_user["id"])
#         return balances_data
#     except GroupNotFoundException as e:
#         raise HTTPException(status_code=e.status_code, detail=e.detail)
