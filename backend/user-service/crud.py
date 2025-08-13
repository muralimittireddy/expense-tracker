# backend/app/db/crud.py
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import TypeVar, Type, List, Dict, Any, Optional

# Define a type variable for SQLAlchemy models
ModelType = TypeVar("ModelType", bound=Any)

def create_item(db: Session, model: Type[ModelType], obj_in: Dict[str, Any]) -> ModelType:
    """
    Creates a new record in the database.
    :param db: SQLAlchemy session.
    :param model: The SQLAlchemy ORM model class.
    :param obj_in: A dictionary of attributes for the new record.
    :return: The created ORM object.
    """
    db_obj = model(**obj_in)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_item_by_id(db: Session, model: Type[ModelType], item_id: int) -> Optional[ModelType]:
    """
    Retrieves a single record by its ID.
    :param db: SQLAlchemy session.
    :param model: The SQLAlchemy ORM model class.
    :param item_id: The ID of the record to retrieve.
    :return: The ORM object if found, else None.
    """
    return db.query(model).filter(model.id == item_id).first()

def get_items(db: Session, model: Type[ModelType], skip: int = 0, limit: int = 100) -> List[ModelType]:
    """
    Retrieves a list of records.
    :param db: SQLAlchemy session.
    :param model: The SQLAlchemy ORM model class.
    :param skip: Number of records to skip.
    :param limit: Maximum number of records to return.
    :return: A list of ORM objects.
    """
    return db.query(model).offset(skip).limit(limit).all()

def update_item(db: Session, db_obj: ModelType, obj_in: Dict[str, Any]) -> ModelType:
    """
    Updates an existing record in the database.
    :param db: SQLAlchemy session.
    :param db_obj: The existing ORM object to update.
    :param obj_in: A dictionary of attributes to update.
    :return: The updated ORM object.
    """
    for field, value in obj_in.items():
        if hasattr(db_obj, field):
            setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_item(db: Session, db_obj: ModelType):
    """
    Deletes a record from the database.
    :param db: SQLAlchemy session.
    :param db_obj: The ORM object to delete.
    """
    db.delete(db_obj)
    db.commit()
