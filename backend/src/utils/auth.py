"""
Authentication utilities for the SwapHubu platform.
Contains JWT token management and authentication helper functions.
"""

import os
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends, Request, Response
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import User
from ..constants.auth_constants import AuthErrors, AuthMessages

# JWT setup
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# JWT Token Functions
def create_access_token(user_id: str) -> str:
    """Create JWT token for user."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def set_auth_cookie(response: Response, token: str) -> None:
    """
    Set authentication token as HTTP-only secure cookie.

    Args:
        response: FastAPI Response object
        token: JWT token to set as cookie
    """
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert minutes to seconds
        httponly=True,
        secure=False,  # Set to False for HTTP
        samesite="lax",  # Change from 'strict' to 'lax'
        domain=None, # Don't set domain for IP addresses
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    """
    Clear authentication cookie.

    Args:
        response: FastAPI Response object
    """
    response.delete_cookie(
        key="access_token", httponly=True, secure=False, samesite="lax"
    )


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """
    Get current user from JWT token stored in cookies.
    Uses @crud_enabled decorator's User.get_by_id() method.
    """
    try:
        # Get token from cookie
        token = request.cookies.get("access_token")
        if token is None:
            clear_auth_cookie(request.response)
            raise HTTPException(status_code=401, detail="Authentication required")

        # Decode and validate token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")

        user = User.get_by_id(db, user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        if hasattr(user, "is_deleted") and user.is_deleted:
            raise HTTPException(status_code=401, detail="User account is deactivated")

        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")


def get_current_user_from_state(request: Request) -> User:
    """
    Get the current authenticated user from the request state.
    This is automatically set by the AuthMiddleware for protected routes.

    Args:
        request: FastAPI Request object

    Returns:
        User: Authenticated user object from request state

    Raises:
        HTTPException: If no authenticated user in request state
    """
    if not hasattr(request.state, "user"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authenticated user found",
        )
    return request.state.user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Get current admin user - requires admin role.

    Args:
        current_user: Current authenticated user

    Returns:
        User: Admin user object

    Raises:
        HTTPException: If user is not an admin
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required"
        )
    return current_user


# Authentication Helper Functions
def check_user_active(user) -> None:
    """
    Check if user exists and is not deleted/deactivated.

    Args:
        user: User object to check

    Raises:
        HTTPException: If user not found or deactivated
    """
    if not user:
        raise HTTPException(status_code=404, detail=AuthErrors.USER_NOT_FOUND)
    if hasattr(user, "is_deleted") and user.is_deleted:
        raise HTTPException(status_code=400, detail=AuthErrors.ACCOUNT_DEACTIVATED)


def format_reset_response() -> dict:
    """
    Format the standard password reset response.
    Always returns success for security (prevents email enumeration).

    Returns:
        dict: Standard reset response
    """
    return {
        "message": AuthMessages.RESET_LINK_SENT,
        "note": AuthMessages.DEV_CHECK_LOGS,
    }
