# # backend/app/services/group_service.py
from fastapi import status, HTTPException
# from http.client import HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from app.db.models import Group, User, Expense, Settlement, group_members_association_table,GroupExpense, GroupExpenseShare
from app.schemas.group import GroupCreate,AddGroupMember,GroupDetailResponse,LeaveGroupResponse, GroupExpenseCreate, GroupExpenseResponse, ShareResponse, GroupExpenseListResponse
from typing import List, Optional, Dict, Any
from app.core.exceptions import GroupNotFoundException
from app.services import user
from app.services import group as group_1
from app.db import crud # Import crud functions


def create_group(db: Session, group_in: GroupCreate, user_id: int) -> Group:
    """
    Creates a new group and adds the creating user as a member.
    """
 # 1. Prepare the data for the new group
    group_data = group_in.model_dump(exclude={"members"})
    group_data["created_by_user_id"] = user_id
    
    # 2. Create the group record in the database
    db_group = crud.create_item(db, Group, group_data)

    # 3. Add the creator as the first member of the group
    creator_user = db.query(User).filter(User.id == user_id).first()
    if creator_user:
        db_group.members.append(creator_user)

    # 4. Iterate through the list of members from the request and add them
    #    to the group. This is the new, corrected logic.
    for member_email in group_in.members:
        # Check if the member email is the same as the creator to avoid duplicates
        if member_email != creator_user.email:
            member_user = db.query(User).filter(User.email == member_email).first()
            if member_user:
                # Add the found user to the group's members list
                db_group.members.append(member_user)
            # You might also want to log or handle cases where a user email doesn't exist

    # 5. Commit all changes to the database and refresh the object
    db.commit()
    db.refresh(db_group)
    
    return db_group


def create_group_expense(db: Session, group_id: int, expense_in: GroupExpenseCreate, user_id: int) -> GroupExpenseResponse:
    # Step 1: insert group_expenses row
    new_expense = GroupExpense(
        description=expense_in.description,
        amount=expense_in.amount,
        group_id=group_id,
        paid_by_user_id=user_id  # ✅ authenticated user who paid
    )
    db.add(new_expense)
    db.flush()  # to get new_expense.id before inserting shares

    # Step 2: insert expense shares
    for share in expense_in.shares:
        db.add(GroupExpenseShare(
            expense_id=new_expense.id,
            user_id=share.user_id,
            share_amount=share.share_amount
        ))

    db.commit()
    db.refresh(new_expense)

    # Step 3: return response
    return GroupExpenseResponse(
        id=new_expense.id,
        description=new_expense.description,
        amount=new_expense.amount,
        group_id=new_expense.group_id,
        paid_by_user_id=new_expense.paid_by_user_id,
        created_at=new_expense.created_at,
        shares=expense_in.shares
    )

def get_list_group_expenses(group_id:int , db:Session, user_id:int)-> List[GroupExpenseListResponse]:
    expenses = (
        db.query(GroupExpense)
        .options(joinedload(GroupExpense.expense_shares))  # fetch related
        .filter(GroupExpense.group_id == group_id)
        .order_by(GroupExpense.created_at.asc())
        .all()
    )
    return expenses


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

def add_group_member(db:Session, addMember:AddGroupMember,user_id: int ) -> Group:
    """
    Add member to group
    """
    # 1. Find the group by ID
    group = group_1.get_group_by_id(db, addMember.id)
    if not group:
        # A custom exception is better than raising HTTPException directly in a service
        raise GroupNotFoundException()

    # 2. Check if the current user has permission to add members
    # You can decide on the policy (e.g., only creator, or any member)
    # The current logic allows any member to add
    current_user = user.get_user_by_id(db, user_id)
    if current_user not in group.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to add members to this group."
        )

    # 3. Find the user to be added by email
    user_to_add = user.get_user_by_email(db, addMember.email)
    if not user_to_add:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email not found."
        )

    # 4. Check if the user is already a member of the group
    if user_to_add in group.members:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This user is already a member of the group."
        )

    # 5. Add the user to the group's members list and save
    group.members.append(user_to_add)
    db.commit()
    db.refresh(group)
    return group

def get_group_detail(db:Session,id: int,user_id: int) -> GroupDetailResponse:
    """
    Gets the specific group and usernames of group members
    """
    group = db.query(Group).filter(Group.id == id).first()

    if not group:
        raise ValueError(f"Group with id {id} not found")

    # Collect member usernames
    members = [member for member in group.members]

    # Return using your schema
    return GroupDetailResponse(
        name=group.name,
        description=group.description or "",
        users=members
    )


def leave_group(db: Session, group_id: int, user_id: int) -> LeaveGroupResponse:
    """
    Allow a user to leave a group. If the admin leaves, assign new admin.
    """
    group = db.query(Group).filter(Group.id == group_id).first()

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    user_to_remove = user.get_user_by_id(db, user_id)
    if user_to_remove not in group.members:
        raise HTTPException(status_code=400, detail="You are not a member of this group")

    # Case 1: User is the only member
    if len(group.members) == 1:
        db.delete(group)
        db.commit()
        return LeaveGroupResponse(
            group_id=group.id,
            message="You left the group. Since you were the only member, the group has been deleted.",
            remaining_members=[],
            new_admin=None
        )
    # Case 2: Normal member leaving
    if group.created_by_user_id != user_id:
        group.members.remove(user_to_remove)
        db.commit()
        db.refresh(group)
        return LeaveGroupResponse(
            group_id=group.id,
            message="You left the group.",
            remaining_members=[m.username for m in group.members],
            new_admin=None
        )

    # Case 3: Admin leaving → assign new admin
    new_admin_username = None
    if group.created_by_user_id == user_id:
        # Pick the first remaining member as new admin
        for m in group.members:
            if m.id != user_id:
                group.created_by_user_id = m.id
                new_admin_username = m.username
                break

    # Remove user from group
    group.members.remove(user_to_remove)
    db.commit()
    db.refresh(group)

    return LeaveGroupResponse(
        group_id=group.id,
        message="You have left the group." + (f" Admin rights transferred to {new_admin_username}." if new_admin_username else ""),
        remaining_members=[m.username for m in group.members],
        new_admin=new_admin_username
    )

# def get_user_group_by_id(db: Session, group_id: int, user_id: int) -> Optional[Group]:
#     """
#     Retrieves a single group by ID, ensuring the user is a member or creator.
#     Includes eager loading of members.
#     """
#     group = db.query(Group).options(joinedload(Group.members)).filter(
#         Group.id == group_id,
#         or_(
#             Group.created_by_user_id == user_id,
#             Group.members.any(User.id == user_id)
#         )
#     ).first()
    
#     if not group:
#         raise GroupNotFoundException()
#     return group

# def get_group_balances(db: Session, group_id: int, current_user_id: int) -> GroupBalancesResponse:
#     """
#     Calculates the net balances for all members within a specific group.
#     """
#     group = get_user_group_by_id(db, group_id, current_user_id) # Ensure user has access to the group
#     if not group:
#         raise GroupNotFoundException()

#     # Initialize balances for all group members
#     balances: Dict[int, float] = {member.id: 0.0 for member in group.members}
#     member_usernames: Dict[int, str] = {member.id: member.username for member in group.members}

#     # 1. Process Expenses
#     expenses = db.query(Expense).options(joinedload(Expense.expense_shares)).filter(
#         Expense.group_id == group_id
#     ).all()

#     for expense in expenses:
#         payer_id = expense.paid_by_user_id
#         amount = expense.amount

#         # The payer initially "paid" the full amount, so their balance increases
#         if payer_id in balances:
#             balances[payer_id] += amount
#         # else: Handle cases where payer might not be a direct group member (unlikely with current setup but good for robustness)

#         # Distribute the expense amount among members
#         if expense.expense_shares:
#             # If explicit shares exist, use them
#             for share in expense.expense_shares:
#                 if share.user_id in balances:
#                     balances[share.user_id] -= share.share_amount
#         else:
#             # If no explicit shares, assume equal split among all group members
#             # For simplicity here, we assume all current 'group.members' are involved in an equal split
#             num_members_for_split = len(group.members)
#             if num_members_for_split > 0:
#                 share_per_member = amount / num_members_for_split
#                 for member_id in balances: # Iterate through all members of the group
#                     balances[member_id] -= share_per_member

#     # 2. Process Settlements
#     settlements = db.query(Settlement).filter(Settlement.group_id == group_id).all()

#     for settlement in settlements:
#         from_user_id = settlement.from_user_id
#         to_user_id = settlement.to_user_id
#         amount = settlement.amount

#         if from_user_id in balances:
#             balances[from_user_id] -= amount # User who paid (from_user) reduces their balance
#         if to_user_id in balances:
#             balances[to_user_id] += amount   # User who received (to_user) increases their balance

#     # Format balances into a list of UserBalance objects
#     individual_balances_list: List[UserBalance] = []
    
#     # Calculate summary totals for the current user
#     total_owed_by_you = 0.0
#     total_owed_to_you = 0.0

#     for user_id, net_balance in balances.items():
#         # Create UserBalance objects for all members with non-zero balances
#         if net_balance != 0:
#             individual_balances_list.append(
#                 UserBalance(
#                     user_id=user_id,
#                     username=member_usernames.get(user_id, f"User {user_id}"),
#                     net_balance=net_balance
#                 )
#             )
        
#         # Calculate summary for the current user
#         if user_id == current_user_id:
#             if net_balance < 0: # Current user has a negative balance, meaning they owe others
#                 total_owed_by_you = abs(net_balance)
#             elif net_balance > 0: # Current user has a positive balance, meaning others owe them
#                 total_owed_to_you = net_balance

#     # Return the structured response
#     return GroupBalancesResponse(
#         group_id=group_id,
#         total_owed_by_you=total_owed_by_you,
#         total_owed_to_you=total_owed_to_you,
#         individual_balances=individual_balances_list
#     )
