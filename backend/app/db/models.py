from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Table, Text, Boolean, UniqueConstraint
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
    Column("group_id", Integer, ForeignKey("groups.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("joined_at", DateTime(timezone=True), server_default=func.now())
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    expenses = relationship("Expense", back_populates="owner", foreign_keys="[Expense.owner_id]")
    budgets = relationship("Budget", back_populates="owner")
    created_groups = relationship("Group", back_populates="creator")
    member_of_groups = relationship(
        "Group",
        secondary=group_members_association_table,
        back_populates="members"
    )
    # New relationships for split-wise
    paid_expenses = relationship(
        "GroupExpense",
        back_populates="payer",
        foreign_keys="[GroupExpense.paid_by_user_id]"
    )
    expense_shares_owed = relationship("GroupExpenseShare", back_populates="user_owing")
    settlements_made = relationship("Settlement", back_populates="payer", foreign_keys="[Settlement.payer_id]")
    settlements_received = relationship("Settlement", back_populates="receiver", foreign_keys="[Settlement.receiver_id]")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(255), index=True)
    amount = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    category = Column(
        Enum(ExpenseCategory, values_callable=lambda x: [e.value for e in x]),
        default=ExpenseCategory.OTHER,
        nullable=False
    )
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="expenses")


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (UniqueConstraint("owner_id", "month", "year"),)

    # Relationships
    owner = relationship("User", back_populates="budgets")


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True) # Matches the SQL
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="created_groups")
    members = relationship(
        "User",
        secondary=group_members_association_table,
        back_populates="member_of_groups"
    )
    expenses = relationship("GroupExpense", back_populates="group")
    settlements = relationship("Settlement", back_populates="group")


class GroupExpense(Base):
    __tablename__ = "group_expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(255), index=True)
    amount = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="SET NULL"), nullable=True) # Matches SQL ON DELETE SET NULL
    paid_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    group = relationship("Group", back_populates="expenses")
    payer = relationship("User", back_populates="paid_expenses", foreign_keys="[GroupExpense.paid_by_user_id]")
    expense_shares = relationship("GroupExpenseShare", back_populates="expense", cascade="all, delete-orphan")


class GroupExpenseShare(Base):
    __tablename__ = "group_expense_shares" # Matches SQL table name

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("group_expenses.id", ondelete="CASCADE"), nullable=False) # Matches SQL FK
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    share_amount = Column(Float, nullable=False)
    is_paid = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (UniqueConstraint("expense_id", "user_id"),) # Matches SQL UNIQUE constraint

    # Relationships
    expense = relationship("GroupExpense", back_populates="expense_shares")
    user_owing = relationship("User", back_populates="expense_shares_owed")


class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)
    payer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False) # Matches SQL column name
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False) # Matches SQL column name
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    settled_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships (Updated to match SQL column names)
    payer = relationship("User", back_populates="settlements_made", foreign_keys="[Settlement.payer_id]")
    receiver = relationship("User", back_populates="settlements_received", foreign_keys="[Settlement.receiver_id]")
    group = relationship("Group", back_populates="settlements")
