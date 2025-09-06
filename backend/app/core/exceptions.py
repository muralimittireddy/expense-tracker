# backend/app/core/exceptions.py
from fastapi import HTTPException, status

class CustomException(HTTPException):
    """Base custom exception for the application."""
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)

class UserNotFoundException(CustomException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

class EmailNotFoundException(CustomException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")

class UserAlreadyExistsException(CustomException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail="User with this username or email already exists")

class ExpenseNotFoundException(CustomException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

class BudgetNotFoundException(CustomException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found for the specified month/year")

class GroupNotFoundException(CustomException): # NEW: Added GroupNotFoundException
    def __init__(self):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or you do not have access to it")
