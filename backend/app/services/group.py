# backend/app/crud/group.py

from sqlalchemy.orm import Session
from app.db.models import Group as GroupModel
from typing import Optional

def get_group_by_id(db: Session, group_id: int) -> Optional[GroupModel]:
    """
    Retrieves a single group by its ID.
    """
    return db.query(GroupModel).filter(GroupModel.id == group_id).first()