"""
User management endpoints - clean HTTP layer only.
Business logic handled in UserService for regular user operations.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import User
from ..schemas.user_schemas import UserUpdate, UserProfile, UserPasswordChange
from ..services.user_service import UserService
from ..utils.auth import get_current_user

router = APIRouter()


@router.get("/profile", response_model=UserProfile)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user profile endpoint."""
    result = UserService.get_user_profile(str(current_user.id), current_user, db)
    return result["user"]


@router.put("/update", response_model=UserProfile)
def update_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user profile endpoint."""
    result = UserService.update_user_profile(
        str(current_user.id), user_data, current_user, db
    )
    return result["user"]


@router.delete("/delete")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete user account endpoint (soft delete)."""
    result = UserService.delete_user_account(str(current_user.id), current_user, db)
    return result


@router.post("/change-password")
def change_user_password(
    password_data: UserPasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change user password endpoint."""
    result = UserService.change_password(
        str(current_user.id), password_data, current_user, db
    )
    return result
