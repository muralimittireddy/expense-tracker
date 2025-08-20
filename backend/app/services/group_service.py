# backend/app/services/group_service.py
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from app.db.models import Group, User, group_members_association_table
from app.schemas.group import GroupCreate
from typing import List, Optional
from app.core.exceptions import UserNotFoundException # Assuming UserNotFoundException exists
from app.db import crud # Import crud functions
from app.core.exceptions import GroupNotFoundException

def create_group(db: Session, group_in: GroupCreate, user_id: int) -> Group:
    """
    Creates a new group and adds the creating user as a member.
    """
    group_data = group_in.model_dump()
    group_data["created_by_user_id"] = user_id
    
    db_group = crud.create_item(db, Group, group_data)

    # Add the creator as the first member of the group
    db_group.members.append(db.query(User).filter(User.id == user_id).first())
    db.commit()
    db.refresh(db_group)
    return db_group

def get_user_groups(db: Session, user_id: int) -> List[Group]:
    """
    Retrieves all groups that a user is a member of.
    Includes eager loading of members.
    """
    # Query groups where the user is either the creator or a member
    groups_as_creator = db.query(Group).filter(Group.created_by_user_id == user_id)
    
    groups_as_member = db.query(Group).join(group_members_association_table).filter(
        group_members_association_table.c.user_id == user_id
    )
    
    # Union the results to get all groups the user is associated with
    # Use distinct to avoid duplicates if a user is both creator and member
    all_groups = groups_as_creator.union(groups_as_member).options(joinedload(Group.members)).all()
    
    return all_groups

def get_user_group_by_id(db: Session, group_id: int, user_id: int) -> Optional[Group]:
    """
    Retrieves a single group by ID, ensuring the user is a member or creator.
    Includes eager loading of members.
    """
    group = db.query(Group).options(joinedload(Group.members)).filter(
        Group.id == group_id,
        or_(
            Group.created_by_user_id == user_id,
            Group.members.any(User.id == user_id)
        )
    ).first()
    
    if not group:
        raise GroupNotFoundException()
    return group