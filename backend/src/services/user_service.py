"""
User Service - Business logic for regular user operations.

This service handles operations for regular users including profile management,
password changes, and account operations. Admin-specific operations should
use AdminService instead.

This service focuses on user-centric operations and ensures proper authorization
checks using the is_admin boolean field.
"""

from typing import Dict, Any
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import logging

from ..models.User import User
from ..repositories.UserRepository import UserRepository
from ..schemas.user_schemas import UserUpdate, UserProfile, UserPasswordChange
from ..utils.auth import check_user_active
from ..utils.password_utils import hash_password, verify_password
from ..utils import validate_update_conflicts
from ..utils.validation_utils import validate_country_code
from ..constants import AuthErrors

# Configure logging
logger = logging.getLogger(__name__)


class UserService:
    """
    Service class for regular user operations.

    This service provides business logic for regular user operations including:
    - User profile management
    - Password changes
    - Account deletion
    - User-specific data retrieval

    Admin-specific operations should use AdminService instead.
    All methods ensure proper authorization using the is_admin boolean field.
    """

    @staticmethod
    def update_user_profile(
        user_id: str, user_data: UserUpdate, current_user: User, db: Session
    ) -> Dict[str, Any]:
        """
        Update user profile information for regular users.

        Regular users can only update their own profile and cannot modify
        admin-specific fields like is_admin, is_verified, or is_blocked.

        Args:
            user_id: ID of the user to update
            user_data: User update data
            current_user: Currently authenticated user
            db: Database session

        Returns:
            Dictionary containing success message and updated user profile

        Raises:
            HTTPException: If user not found, unauthorized, or validation errors
        """

        # Get and validate target user
        user = User.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail=AuthErrors.USER_NOT_FOUND)

        # Authorization check: Users can only update their own profile
        # unless they are admin (but admin operations should use AdminService)
        if str(current_user.id) != user_id and not current_user.is_admin:
            logger.error(
                f"User {current_user.id} attempted to update profile of user {user_id}"
            )
            raise HTTPException(
                status_code=403, detail="You can only update your own profile"
            )

        # Check user status
        check_user_active(user)

        # Validate uniqueness constraints using utility function
        try:
            email_to_validate = (
                user_data.email if "email" in user_data.model_fields_set else None
            )
            phone_to_validate = (
                user_data.phone_number
                if "phone_number" in user_data.model_fields_set
                else None
            )

            validate_update_conflicts(
                db, str(user.id), email_to_validate, phone_to_validate
            )

        except ValueError as e:
            logger.error(f"Validation conflict for user {user.id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

        try:
            # Prepare update data (only include fields that were actually provided)
            update_data = {}

            # Check which fields were actually provided in the request
            fields_set = user_data.model_fields_set

            # Regular user profile fields
            if "first_name" in fields_set:
                update_data["first_name"] = user_data.first_name
            if "last_name" in fields_set:
                update_data["last_name"] = user_data.last_name
            if "phone_number" in fields_set:
                update_data["phone_number"] = (
                    user_data.phone_number.strip() if user_data.phone_number else None
                )
            if "email" in fields_set:
                update_data["email"] = user_data.email
            if "country" in fields_set:
                # Country validation is already handled by Pydantic schema validator
                update_data["country"] = user_data.country

            # Admin-specific fields should not be updated through UserService
            # These should be handled by AdminService for proper authorization
            admin_only_fields = ["is_verified", "is_admin", "is_blocked"]
            for field in admin_only_fields:
                if field in fields_set:
                    if not current_user.is_admin:
                        logger.error(
                            f"Non-admin user {current_user.id} attempted to update admin field {field}"
                        )
                        raise HTTPException(
                            status_code=403,
                            detail=f"Only administrators can update {field} field",
                        )
                    # If current user is admin, they should use AdminService instead
                    logger.info(
                        f"Admin user {current_user.id} attempted to update {field} via UserService. "
                        "Consider using AdminService for admin operations."
                    )

            if not update_data:
                raise HTTPException(
                    status_code=400, detail="No valid fields provided for update"
                )

            # Update user using UserRepository for better validation and filtering
            updated_user = UserRepository.update_user_data(db, user_id, update_data)

            # If UserRepository returned None, fall back to basic update
            if not updated_user:
                updated_user = User.update(db, user_id, update_data)

            if not updated_user:
                raise HTTPException(status_code=500, detail="Update failed")

            logger.info(f"User profile updated successfully for: {updated_user.email}")
            return {
                "message": "Profile updated successfully",
                "user": UserProfile.model_validate(updated_user),
            }

        except IntegrityError as e:
            # Handle database constraint violations
            error_msg = str(e.orig) if hasattr(e, "orig") else str(e)

            if (
                "ix_users_email" in error_msg
                or "unique constraint" in error_msg.lower()
            ):
                logger.error(
                    f"Email constraint violation for user {user_id}: {error_msg}"
                )
                raise HTTPException(
                    status_code=400,
                    detail="Email address is already registered by another user",
                )
            elif "ix_users_phone_number" in error_msg:
                logger.error(
                    f"Phone constraint violation for user {user_id}: {error_msg}"
                )
                raise HTTPException(
                    status_code=400,
                    detail="Phone number is already registered by another user",
                )
            else:
                logger.error(
                    f"Database constraint violation for user {user_id}: {error_msg}"
                )
                raise HTTPException(
                    status_code=400,
                    detail="Data conflict - the information you're trying to update already exists",
                )

        except HTTPException:
            # Re-raise HTTP exceptions (these are our validation errors)
            raise

        except Exception as e:
            logger.error(
                f"Unexpected error during profile update for user {user_id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500,
                detail="An unexpected error occurred while updating your profile. Please try again.",
            )

    @staticmethod
    def delete_user_account(
        user_id: str, current_user: User, db: Session
    ) -> Dict[str, str]:
        """
        Delete user account (soft delete) for regular users.

        Regular users can only delete their own account.
        Admin users should use AdminService for user management operations.

        Args:
            user_id: ID of the user account to delete
            current_user: Currently authenticated user
            db: Database session

        Returns:
            Dictionary containing success message

        Raises:
            HTTPException: If user not found, unauthorized, or deletion fails
        """

        # Get and validate target user
        user = User.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail=AuthErrors.USER_NOT_FOUND)

        # Authorization check: Users can only delete their own account
        if str(current_user.id) != user_id and not current_user.is_admin:
            logger.error(
                f"User {current_user.id} attempted to delete account of user {user_id}"
            )
            raise HTTPException(
                status_code=403, detail="You can only delete your own account"
            )

        # Prevent admin users from deleting their account through UserService
        # They should use AdminService for proper admin account management
        if user.is_admin:
            logger.error(
                f"Admin user {user_id} attempted account deletion via UserService"
            )
            raise HTTPException(
                status_code=400,
                detail="Admin accounts cannot be deleted through this endpoint. Please contact support.",
            )

        # Check user status
        check_user_active(user)

        try:
            # Soft delete user (using the @auditable decorator functionality)
            success = User.delete(db, user_id)

            if not success:
                logger.error(f"User deletion returned False for user {user_id}")
                raise HTTPException(
                    status_code=500, detail="Failed to delete user account"
                )

            logger.info(f"User account deleted successfully for: {user.email}")
            return {"message": "Account deleted successfully"}

        except HTTPException:
            # Re-raise HTTP exceptions (these are our validation errors)
            raise

        except IntegrityError as e:
            # Handle database constraint violations during deletion
            error_msg = str(e.orig) if hasattr(e, "orig") else str(e)
            logger.error(
                f"Database constraint violation during deletion for user {user_id}: {error_msg}"
            )
            raise HTTPException(
                status_code=400,
                detail="Cannot delete account due to existing dependencies. Please contact support.",
            )

        except Exception as e:
            logger.error(
                f"Unexpected error during account deletion for user {user_id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500,
                detail="An unexpected error occurred while deleting your account. Please try again.",
            )

    @staticmethod
    def change_password(
        user_id: str, password_data: UserPasswordChange, current_user: User, db: Session
    ) -> Dict[str, str]:
        """
        Change user password with current password verification.

        Regular users can only change their own password.

        Args:
            user_id: ID of the user whose password to change
            password_data: Password change data with current and new passwords
            current_user: Currently authenticated user
            db: Database session

        Returns:
            Dictionary containing success message

        Raises:
            HTTPException: If user not found, unauthorized, or password validation fails
        """

        # Get and validate target user
        user = User.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail=AuthErrors.USER_NOT_FOUND)

        # Authorization check: Users can only change their own password
        if str(current_user.id) != user_id and not current_user.is_admin:
            logger.error(
                f"User {current_user.id} attempted to change password of user {user_id}"
            )
            raise HTTPException(
                status_code=403, detail="You can only change your own password"
            )

        # Check user status
        check_user_active(user)

        # Validate password confirmation
        if password_data.new_password != password_data.confirm_password:
            raise HTTPException(status_code=400, detail="New passwords do not match")

        # Verify current password
        if not verify_password(password_data.current_password, user.password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        # Prevent setting the same password
        if verify_password(password_data.new_password, user.password):
            raise HTTPException(
                status_code=400,
                detail="New password must be different from current password",
            )

        try:
            # Hash the new password
            hashed_password = hash_password(password_data.new_password)

            # Update user password
            updated_user = User.update(db, user_id, {"password": hashed_password})

            if not updated_user:
                raise HTTPException(status_code=500, detail="Password update failed")

            logger.info(f"Password changed successfully for user: {user.email}")
            return {"message": "Password changed successfully"}

        except HTTPException:
            # Re-raise HTTP exceptions (these are our validation errors)
            raise

        except Exception as e:
            logger.error(
                f"Unexpected error during password change for user {user_id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500,
                detail="An unexpected error occurred while changing your password. Please try again.",
            )

    @staticmethod
    def get_user_profile(
        user_id: str, current_user: User, db: Session
    ) -> Dict[str, Any]:
        """
        Get user profile information for regular users.

        Regular users can only access their own profile unless they are admin.

        Args:
            user_id: ID of the user whose profile to retrieve
            current_user: Currently authenticated user
            db: Database session

        Returns:
            Dictionary containing user profile data

        Raises:
            HTTPException: If user not found or unauthorized
        """

        # Get and validate target user
        user = User.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail=AuthErrors.USER_NOT_FOUND)

        # Authorization check: Users can only access their own profile
        # unless they are admin (but admin operations should use AdminService)
        if str(current_user.id) != user_id and not current_user.is_admin:
            logger.error(
                f"User {current_user.id} attempted to access profile of user {user_id}"
            )
            raise HTTPException(
                status_code=403, detail="You can only access your own profile"
            )

        # Check user status
        check_user_active(user)

        try:
            # Use UserRepository for better data filtering
            profile_data = UserRepository.get_user_profile_data(db, user_id)

            if not profile_data:
                # Fall back to direct model access if repository returns None
                profile_data = user

            logger.info(f"User profile retrieved for: {user.email}")
            return {
                "user": UserProfile.model_validate(profile_data),
                "message": "Profile retrieved successfully",
            }

        except Exception as e:
            logger.error(
                f"Unexpected error retrieving profile for user {user_id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500,
                detail="An unexpected error occurred while retrieving your profile. Please try again.",
            )
