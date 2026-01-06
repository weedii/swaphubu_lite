"""
Authentication endpoints - clean HTTP layer only.
Business logic handled in auth service.
"""

from fastapi import APIRouter, Depends, BackgroundTasks, Response
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import User
from ..schemas.user_schemas import (
    UserLogin,
    UserCreate,
    UserProfile,
    UserPasswordChange,
    ForgotPasswordRequest,
    PasswordResetRequest,
    ResetCodeVerification,
)
from ..services.auth_service import (
    register_user,
    authenticate_user,
    forgot_password,
    reset_password,
    verify_reset_code,
)
from ..utils.auth import get_current_user, set_auth_cookie, clear_auth_cookie
from ..constants import AuthMessages

router = APIRouter()


@router.post("/register", response_model=UserProfile)
def register(
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    response: Response,
    db: Session = Depends(get_db),
):
    """Register new user endpoint - includes welcome email."""
    result = register_user(user_data, db, background_tasks)

    # Set token as cookie (HTTP layer concern)
    set_auth_cookie(response, result["access_token"])

    return result["user"]


@router.post("/login", response_model=UserProfile)
def login(login_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """Login user endpoint."""
    result = authenticate_user(login_data, db)

    # Set token as cookie (HTTP layer concern)
    set_auth_cookie(response, result["access_token"])

    return result["user"]


@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile endpoint."""
    return UserProfile.model_validate(current_user)


@router.post("/forgot-password")
def forgot_user_password(
    request_data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Request password reset code endpoint - includes reset email."""
    result = forgot_password(request_data, db, background_tasks)
    return result


@router.post("/verify-reset-code")
def verify_user_reset_code(
    code_data: ResetCodeVerification,
    db: Session = Depends(get_db),
):
    """Verify reset code endpoint - validates 6-digit code."""
    result = verify_reset_code(code_data.email, code_data.code, db)
    return result


@router.post("/reset-password")
def reset_user_password(
    reset_data: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Reset password using verified code endpoint - includes confirmation email."""
    result = reset_password(reset_data, db, background_tasks)
    return result


@router.get("/logout")
def logout(response: Response):
    """Logout endpoint - clears the access token cookie."""
    clear_auth_cookie(response)
    return {"message": AuthMessages.LOGOUT_SUCCESS}
