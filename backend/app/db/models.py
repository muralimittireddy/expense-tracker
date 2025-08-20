# backend/app/db/models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Table, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class ExpenseCategory(str, enum.Enum):
    FOOD = "Food"
    TRAVEL = "Travel"
    RENT = "Rent"
    UTILITIES = "Utilities"
    ENTERTAINMENT = "Entertainment"
    SHOPPING = "Shopping"
    HEALTH = "Health"
    EDUCATION = "Education"
    TRANSPORTATION = "Transportation"
    OTHER = "Other"

# Association table for Group and User (many-to-many)
group_members_association_table = Table(
    "group_members",
    Base.metadata,
    Column("group_id", Integer, ForeignKey("groups.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("joined_at", DateTime(timezone=True), server_default=func.now())
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Explicitly define foreign_keys for the 'expenses' relationship
    expenses = relationship(
        "Expense",
        back_populates="owner",
        foreign_keys="[Expense.owner_id]" # This user owns these expenses
    )
    budgets = relationship("Budget", back_populates="owner")
    created_groups = relationship("Group", back_populates="creator")
    member_of_groups = relationship(
        "Group",
        secondary=group_members_association_table,
        back_populates="members"
    )
    # New relationships for split-wise
    # Explicitly define foreign_keys for the 'paid_expenses' relationship
    paid_expenses = relationship(
        "Expense",
        back_populates="payer",
        foreign_keys="[Expense.paid_by_user_id]" # This user paid for these expenses
    )
    expense_shares_owed = relationship("ExpenseShare", back_populates="user_owing")
    settlements_made = relationship("Settlement", back_populates="from_user", foreign_keys="[Settlement.from_user_id]")
    settlements_received = relationship("Settlement", back_populates="to_user", foreign_keys="[Settlement.to_user_id]")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    amount = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    category = Column(
        Enum(ExpenseCategory, values_callable=lambda x: [e.value for e in x]),
        default=ExpenseCategory.OTHER,
        nullable=False
    )
    owner_id = Column(Integer, ForeignKey("users.id"))
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True) # New
    paid_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False) # New
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="expenses", foreign_keys="[Expense.owner_id]")
    group = relationship("Group", back_populates="expenses") # New
    payer = relationship("User", back_populates="paid_expenses", foreign_keys="[Expense.paid_by_user_id]") # New
    expense_shares = relationship("ExpenseShare", back_populates="expense", cascade="all, delete-orphan") # New

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(Integer, nullable=False) # e.g., 1 for January, 12 for December
    year = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="budgets")

class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True) # New
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    creator = relationship("User", back_populates="created_groups")
    members = relationship(
        "User",
        secondary=group_members_association_table,
        back_populates="member_of_groups"
    )
    expenses = relationship("Expense", back_populates="group") # New
    settlements = relationship("Settlement", back_populates="group") # New

class ExpenseShare(Base):
    __tablename__ = "expense_shares"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False) # The user who owes this share
    share_amount = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    expense = relationship("Expense", back_populates="expense_shares")
    user_owing = relationship("User", back_populates="expense_shares_owed")

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    amount = Column(Float, nullable=False)
    settled_at = Column(DateTime(timezone=True), server_default=func.now())

    from_user = relationship("User", back_populates="settlements_made", foreign_keys="[Settlement.from_user_id]")
    to_user = relationship("User", back_populates="settlements_received", foreign_keys="[Settlement.to_user_id]")
    group = relationship("Group", back_populates="settlements")
