"""
Authentication service - business logic for auth operations.
"""

from typing import Dict, Any
from fastapi import HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import logging

from ..models.User import User
from ..repositories.UserRepository import UserRepository
from ..schemas.user_schemas import (
    UserCreate,
    UserLogin,
    UserProfile,
    UserPasswordChange,
    ForgotPasswordRequest,
    PasswordResetRequest,
    ResetCodeVerification,
)
from ..utils.auth import create_access_token, check_user_active
from ..utils.password_utils import hash_password, verify_password
from ..constants import AuthErrors, AuthMessages

# Import specialized service functions
from .email_service import (
    send_welcome_email,
    send_password_reset_email,
    send_password_reset_success_email,
)

# Configure logging
logger = logging.getLogger(__name__)

# Additional imports for consolidated functions
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from ..models.PasswordResetToken import PasswordResetToken
from ..repositories.PasswordResetTokenRepository import PasswordResetTokenRepository
from ..constants.auth_constants import AuthConfig


def register_user(
    user_data: UserCreate, db: Session, background_tasks: BackgroundTasks = None
) -> Dict[str, Any]:
    """
    Register a new user with validation and welcome email.
    """
    # Check if user exists
    if UserRepository.find_by_email(db, user_data.email):
        raise HTTPException(status_code=400, detail=AuthErrors.EMAIL_ALREADY_EXISTS)

    # Check if phone number is already taken (if provided and not empty)
    if user_data.phone_number and user_data.phone_number.strip():
        if UserRepository.find_by_phone(db, user_data.phone_number.strip()):
            raise HTTPException(status_code=400, detail=AuthErrors.PHONE_ALREADY_EXISTS)

    try:
        # Hash the password and sanitize phone number
        hashed_password = hash_password(user_data.password)
        phone_to_store = (
            user_data.phone_number.strip()
            if user_data.phone_number and user_data.phone_number.strip()
            else None
        )

        # Create user
        user = User.create(
            db,
            email=user_data.email,
            password=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone_number=phone_to_store,
            country=user_data.country,
        )

        # Send welcome email asynchronously
        if background_tasks:
            send_welcome_email(user, background_tasks)

        # Create token and return response
        token = create_access_token(user.id)
        return {"access_token": token, "user": UserProfile.model_validate(user)}

    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")


def authenticate_user(login_data: UserLogin, db: Session) -> Dict[str, Any]:
    """
    Authenticate user login and return token response.
    """
    # Find user by email
    user = UserRepository.find_by_email(db, login_data.email)
    if not user:
        raise HTTPException(status_code=401, detail=AuthErrors.USER_NOT_FOUND)

    # Verify password
    if not verify_password(login_data.password, user.password):
        raise HTTPException(status_code=401, detail=AuthErrors.INVALID_CREDENTIALS)

    # Check user status
    check_user_active(user)

    # Create token and return response
    token = create_access_token(user.id)
    return {"access_token": token, "user": UserProfile.model_validate(user)}


def forgot_password(
    request_data: ForgotPasswordRequest,
    db: Session,
    background_tasks: BackgroundTasks = None,
) -> Dict[str, str]:
    """
    Generate password reset token and send email.
    Returns error if email doesn't exist for better UX.
    """
    user = UserRepository.find_by_email(db, request_data.email)

    # Check if user exists and is not deleted
    if not user or user.is_deleted:
        logger.warning(
            f"Password reset attempted for invalid email: {request_data.email}"
        )
        raise HTTPException(status_code=404, detail=AuthErrors.EMAIL_NOT_FOUND)

    try:
        # Generate and store reset token
        reset_token = generate_reset_token(user, db)

        # Send email
        if background_tasks:
            send_password_reset_email(user, reset_token, background_tasks)

        logger.info(f"Password reset processed for: {user.email}")
        return {"message": AuthMessages.RESET_CODE_SENT}

    except Exception as e:
        logger.error(f"Failed to process password reset for {user.email}: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to send reset code. Please try again."
        )


def reset_password(
    reset_data: PasswordResetRequest,
    db: Session,
    background_tasks: BackgroundTasks = None,
) -> Dict[str, str]:
    """
    Reset user password using verified reset token.
    """
    # Validate password confirmation
    if reset_data.new_password != reset_data.confirm_password:
        raise HTTPException(status_code=400, detail=AuthErrors.PASSWORD_MISMATCH)

    # Reset password using verification
    result = reset_user_password_with_verification(
        reset_data.email, reset_data.new_password, db
    )

    # Get user for success email
    user = UserRepository.find_by_email(db, reset_data.email)
    if user and background_tasks:
        send_password_reset_success_email(user, background_tasks)

    return result


# ============================================================================
# CONSOLIDATED TOKEN AND PASSWORD FUNCTIONS
# ============================================================================


# Function moved to PasswordResetTokenRepository.delete_all_for_user


def generate_reset_token(user: User, db: Session) -> str:
    """
    Generate and store a secure reset token for the user.
    Checks for existing non-expired tokens first.
    Returns the plain token for email sending.
    """
    try:
        current_time = datetime.now(timezone.utc)

        # Check for existing non-expired, unused tokens using repository
        existing_tokens = PasswordResetTokenRepository.find_active_tokens_for_user(
            db, str(user.id)
        )

        # If we have existing tokens, hard delete them
        if existing_tokens:
            logger.info(
                f"Hard deleting {len(existing_tokens)} existing reset tokens for user: {user.email}"
            )
            # Use repository method to delete all tokens for this user
            deleted_count = PasswordResetTokenRepository.delete_all_for_user(
                db, str(user.id)
            )
            logger.info(f"Deleted {deleted_count} tokens for user {user.email}")

        # Generate new 6-digit numeric reset token
        reset_token = f"{secrets.randbelow(900000) + 100000:06d}"
        token_hash = hashlib.sha256(reset_token.encode()).hexdigest()

        # Set token expiration
        expires_at = current_time + timedelta(hours=AuthConfig.RESET_TOKEN_EXPIRE_HOURS)

        # Create new reset token record
        reset_token_record = PasswordResetToken.create(
            db,
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_verified=False,
        )

        if not reset_token_record:
            raise Exception("Failed to save reset token")

        logger.info(f"New reset token generated for user: {user.email}")
        logger.info(
            f"Reset token for testing: {reset_token}"
        )  # For development/testing only
        return reset_token

    except Exception as e:
        logger.error(f"Failed to generate reset token for {user.email}: {str(e)}")
        raise e


def verify_reset_code(email: str, code: str, db: Session) -> Dict[str, str]:
    """
    Verify reset code and mark as verified.
    """
    try:
        # First check if user exists
        user = UserRepository.find_by_email(db, email)
        if not user or user.is_deleted:
            logger.warning(
                f"Reset code verification attempted for invalid email: {email}"
            )
            raise HTTPException(status_code=404, detail=AuthErrors.EMAIL_NOT_FOUND)

        # Hash the provided code
        code_hash = hashlib.sha256(code.encode()).hexdigest()

        # Find reset token by email and code hash
        reset_token = PasswordResetTokenRepository.find_by_user_email_and_token(
            db, email, code_hash
        )

        if not reset_token:
            logger.warning(f"Invalid reset code attempt for email: {email}")
            raise HTTPException(status_code=400, detail=AuthErrors.INVALID_RESET_CODE)

        # Check if already used
        if reset_token.used_at:
            raise HTTPException(
                status_code=400, detail=AuthErrors.RESET_CODE_ALREADY_USED
            )

        # Mark as verified
        updated_token = PasswordResetTokenRepository.mark_as_verified(
            db, str(reset_token.id)
        )

        if not updated_token:
            raise HTTPException(status_code=500, detail=AuthErrors.UPDATE_FAILED)

        logger.info(f"Reset code verified for user: {email}")
        return {"message": AuthMessages.RESET_CODE_VERIFIED}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying reset code for {email}: {str(e)}")
        raise HTTPException(status_code=400, detail=AuthErrors.INVALID_RESET_CODE)


def change_user_password(
    user: User, password_data: UserPasswordChange, db: Session
) -> Dict[str, str]:
    """
    Change user password with current password verification.
    """
    # Verify current password
    if not verify_password(password_data.current_password, user.password):
        raise HTTPException(status_code=400, detail=AuthErrors.WRONG_CURRENT_PASSWORD)

    # Check if new password is different from current
    if verify_password(password_data.new_password, user.password):
        raise HTTPException(status_code=400, detail=AuthErrors.SAME_PASSWORD)

    # Validate password confirmation
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(status_code=400, detail=AuthErrors.PASSWORD_MISMATCH)

    try:
        # Hash and update password
        new_hashed_password = hash_password(password_data.new_password)
        updated_user = User.update(db, str(user.id), {"password": new_hashed_password})

        if not updated_user:
            raise HTTPException(status_code=500, detail=AuthErrors.UPDATE_FAILED)

        # Clean up any existing reset tokens after password change
        deleted_count = PasswordResetTokenRepository.delete_all_for_user(
            db, str(user.id)
        )
        if deleted_count > 0:
            logger.info(
                f"Cleaned up {deleted_count} reset tokens for user: {user.email}"
            )

        logger.info(f"Password changed successfully for user: {user.email}")
        return {"message": AuthMessages.PASSWORD_CHANGED}

    except Exception as e:
        logger.error(f"Password change failed for user {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail=AuthErrors.RESET_FAILED)


def reset_user_password_with_verification(
    email: str, new_password: str, db: Session
) -> Dict[str, str]:
    """
    Reset user password using verified reset token.
    """
    try:
        # First check if user exists
        user = UserRepository.find_by_email(db, email)
        if not user or user.is_deleted:
            logger.warning(f"Password reset attempted for invalid email: {email}")
            raise HTTPException(status_code=404, detail=AuthErrors.EMAIL_NOT_FOUND)

        # Find verified reset token
        reset_token = PasswordResetTokenRepository.find_verified_token_by_user_email(
            db, email
        )

        if not reset_token:
            raise HTTPException(
                status_code=400, detail=AuthErrors.RESET_CODE_NOT_VERIFIED
            )

        # Hash the new password
        new_hashed_password = hash_password(new_password)

        # Update password
        updated_user = User.update(db, str(user.id), {"password": new_hashed_password})

        if not updated_user:
            raise HTTPException(status_code=500, detail=AuthErrors.RESET_FAILED)

        # Clean up all reset tokens after successful password reset
        deleted_count = PasswordResetTokenRepository.delete_all_for_user(
            db, str(user.id)
        )
        if deleted_count > 0:
            logger.info(
                f"Cleaned up {deleted_count} reset tokens for user: {user.email}"
            )

        logger.info(f"Password reset successful for user: {user.email}")
        return {"message": AuthMessages.PASSWORD_RESET_SUCCESS}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset failed for user {email}: {str(e)}")
        raise HTTPException(status_code=500, detail=AuthErrors.RESET_FAILED)


# Function removed - using PasswordResetTokenRepository.delete_all_for_user instead
