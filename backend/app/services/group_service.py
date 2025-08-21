# backend/app/services/group_service.py
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from app.db.models import Group, User, Expense, ExpenseShare, Settlement, group_members_association_table
from app.schemas.group import GroupCreate, GroupBalancesResponse, UserBalance
from typing import List, Optional, Dict, Any
from app.core.exceptions import GroupNotFoundException
from app.db import crud # Import crud functions

def create_group(db: Session, group_in: GroupCreate, user_id: int) -> Group:
    """
    Creates a new group and adds the creating user as a member.
    """
    group_data = group_in.model_dump()
    group_data["created_by_user_id"] = user_id
    
    db_group = crud.create_item(db, Group, group_data)

    # Add the creator as the first member of the group
    creator_user = db.query(User).filter(User.id == user_id).first()
    if creator_user:
        db_group.members.append(creator_user)
        db.commit()
        db.refresh(db_group)
    return db_group

def get_user_groups(db: Session, user_id: int) -> List[Group]:
    """
    Retrieves all groups that a user is a member of or has created.
    Includes eager loading of members.
    """
    all_groups = db.query(Group).options(joinedload(Group.members)).filter(
        or_(
            Group.created_by_user_id == user_id,
            Group.members.any(User.id == user_id)
        )
    ).all()
    
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

def get_group_balances(db: Session, group_id: int, current_user_id: int) -> GroupBalancesResponse:
    """
    Calculates the net balances for all members within a specific group.
    """
    group = get_user_group_by_id(db, group_id, current_user_id) # Ensure user has access to the group
    if not group:
        raise GroupNotFoundException()

    # Initialize balances for all group members
    balances: Dict[int, float] = {member.id: 0.0 for member in group.members}
    member_usernames: Dict[int, str] = {member.id: member.username for member in group.members}

    # 1. Process Expenses
    expenses = db.query(Expense).options(joinedload(Expense.expense_shares)).filter(
        Expense.group_id == group_id
    ).all()

    for expense in expenses:
        payer_id = expense.paid_by_user_id
        amount = expense.amount

        # The payer initially "paid" the full amount, so their balance increases
        if payer_id in balances:
            balances[payer_id] += amount
        # else: Handle cases where payer might not be a direct group member (unlikely with current setup but good for robustness)

        # Distribute the expense amount among members
        if expense.expense_shares:
            # If explicit shares exist, use them
            for share in expense.expense_shares:
                if share.user_id in balances:
                    balances[share.user_id] -= share.share_amount
        else:
            # If no explicit shares, assume equal split among all group members
            # For simplicity here, we assume all current 'group.members' are involved in an equal split
            num_members_for_split = len(group.members)
            if num_members_for_split > 0:
                share_per_member = amount / num_members_for_split
                for member_id in balances: # Iterate through all members of the group
                    balances[member_id] -= share_per_member

    # 2. Process Settlements
    settlements = db.query(Settlement).filter(Settlement.group_id == group_id).all()

    for settlement in settlements:
        from_user_id = settlement.from_user_id
        to_user_id = settlement.to_user_id
        amount = settlement.amount

        if from_user_id in balances:
            balances[from_user_id] -= amount # User who paid (from_user) reduces their balance
        if to_user_id in balances:
            balances[to_user_id] += amount   # User who received (to_user) increases their balance

    # Format balances into a list of UserBalance objects
    individual_balances_list: List[UserBalance] = []
    
    # Calculate summary totals for the current user
    total_owed_by_you = 0.0
    total_owed_to_you = 0.0

    for user_id, net_balance in balances.items():
        # Create UserBalance objects for all members with non-zero balances
        if net_balance != 0:
            individual_balances_list.append(
                UserBalance(
                    user_id=user_id,
                    username=member_usernames.get(user_id, f"User {user_id}"),
                    net_balance=net_balance
                )
            )
        
        # Calculate summary for the current user
        if user_id == current_user_id:
            if net_balance < 0: # Current user has a negative balance, meaning they owe others
                total_owed_by_you = abs(net_balance)
            elif net_balance > 0: # Current user has a positive balance, meaning others owe them
                total_owed_to_you = net_balance

    # Return the structured response
    return GroupBalancesResponse(
        group_id=group_id,
        total_owed_by_you=total_owed_by_you,
        total_owed_to_you=total_owed_to_you,
        individual_balances=individual_balances_list
    )
