"""
Admin Service - Business logic for admin-specific operations.

This service handles all admin-related operations including user management,
analytics, and system monitoring. It should only be used by admin users
and admin-only endpoints.
"""

from typing import Dict, Any, Optional, List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime
import logging

from ..models.User import User
from ..repositories.AdminRepository import AdminRepository
from ..schemas.user_schemas import UserProfile, User as UserSchema, UserList
from ..utils.auth import check_user_active
from ..utils import validate_update_conflicts
from ..constants import AuthErrors

# Configure logging
logger = logging.getLogger(__name__)


class AdminService:
    """
    Service class for admin-specific operations and user management.

    This service provides business logic for admin operations including:
    - User management (listing, updating, blocking)
    - Admin analytics and statistics
    - Advanced user search and filtering
    - System reports and monitoring

    All methods require admin privileges and should only be called
    from admin-only endpoints.
    """

    @staticmethod
    def _check_admin_authorization(current_admin: User, operation: str) -> None:
        """
        Check if the current user has admin privileges for the requested operation.

        Args:
            current_admin: Current user attempting the operation
            operation: Description of the operation being attempted (for logging)

        Raises:
            HTTPException: If user is not an admin (403 Forbidden)
        """
        if not current_admin.is_admin:
            logger.warning(
                f"Non-admin user {current_admin.id} attempted to {operation}"
            )
            raise HTTPException(
                status_code=403, detail=f"Admin privileges required to {operation}"
            )

    @staticmethod
    def get_all_users(
        db: Session,
        current_admin: User,
        page: int = 1,
        limit: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> Dict[str, Any]:
        """
        Get paginated list of all users for admin user listing.

        Args:
            db: Database session
            current_admin: Current admin user (for authorization)
            page: Page number (1-based)
            limit: Number of users per page
            sort_by: Field to sort by
            sort_order: Sort order (asc, desc)

        Returns:
            Dictionary containing users, pagination info, and total count

        Raises:
            HTTPException: If user is not admin or other errors occur
        """
        # Authorization check
        AdminService._check_admin_authorization(current_admin, "access user list")

        try:
            # Get paginated users from repository
            result = AdminRepository.get_all_users_paginated(
                db, page=page, limit=limit, sort_by=sort_by, sort_order=sort_order
            )

            # Convert users to schema format
            users_data = [UserSchema.model_validate(user) for user in result["users"]]

            logger.info(
                f"Admin {current_admin.id} retrieved user list (page {page}, {len(users_data)} users)"
            )

            return {
                "users": users_data,
                "total": result["total"],
                "page": result["page"],
                "limit": result["limit"],
                "total_pages": result["total_pages"],
            }

        except Exception as e:
            logger.error(
                f"Error retrieving user list for admin {current_admin.id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500, detail="An error occurred while retrieving user list"
            )

    @staticmethod
    def get_user_by_id(
        db: Session,
        current_admin: User,
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Get specific user details for admin view.

        Args:
            db: Database session
            current_admin: Current admin user (for authorization)
            user_id: ID of user to retrieve

        Returns:
            Dictionary containing user data

        Raises:
            HTTPException: If user is not admin, user not found, or other errors
        """
        # Authorization check
        AdminService._check_admin_authorization(current_admin, "access user details")

        try:
            # Get user by ID
            user = User.get_by_id(db, user_id)
            if not user:
                raise HTTPException(status_code=404, detail=AuthErrors.USER_NOT_FOUND)

            # Convert to schema format
            user_data = UserSchema.model_validate(user)

            logger.info(
                f"Admin {current_admin.id} retrieved details for user {user_id}"
            )

            return {"user": user_data, "message": "User details retrieved successfully"}

        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            logger.error(
                f"Error retrieving user {user_id} for admin {current_admin.id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500,
                detail="An error occurred while retrieving user details",
            )

    @staticmethod
    def update_user_admin_fields(
        db: Session,
        current_admin: User,
        user_id: str,
        update_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Update admin-specific fields for a user (is_admin, is_blocked).

        Args:
            db: Database session
            current_admin: Current admin user (for authorization)
            user_id: ID of user to update
            update_data: Dictionary containing fields to update

        Returns:
            Dictionary containing updated user data and success message

        Raises:
            HTTPException: If user is not admin, user not found, or validation errors
        """
        # Authorization check
        AdminService._check_admin_authorization(
            current_admin, "update user admin fields"
        )

        try:
            # Get and validate target user
            user = User.get_by_id(db, user_id)
            if not user:
                raise HTTPException(status_code=404, detail=AuthErrors.USER_NOT_FOUND)

            # Prepare admin-specific update data
            admin_update_data = {}

            # Only allow admin-specific fields
            allowed_admin_fields = ["is_admin", "is_blocked"]

            for field, value in update_data.items():
                if field in allowed_admin_fields:
                    admin_update_data[field] = value
                else:
                    logger.error(
                        f"Admin {current_admin.id} attempted to update non-admin field {field}"
                    )

            if not admin_update_data:
                raise HTTPException(
                    status_code=400, detail="No valid admin fields provided for update"
                )

            # Prevent admin from removing their own admin status
            if (
                user_id == str(current_admin.id)
                and "is_admin" in admin_update_data
                and not admin_update_data["is_admin"]
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Cannot remove admin privileges from your own account",
                )

            # Update user with admin fields
            updated_user = User.update(db, user_id, admin_update_data)

            if not updated_user:
                raise HTTPException(status_code=500, detail="User update failed")

            # Convert to schema format
            user_data = UserSchema.model_validate(updated_user)

            logger.info(
                f"Admin {current_admin.id} updated admin fields for user {user_id}: {admin_update_data}"
            )

            return {
                "user": user_data,
                "message": "User admin fields updated successfully",
                "updated_fields": list(admin_update_data.keys()),
            }

        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except IntegrityError as e:
            logger.error(
                f"Database constraint violation updating user {user_id}: {str(e)}"
            )
            raise HTTPException(
                status_code=400, detail="Data conflict occurred while updating user"
            )
        except Exception as e:
            logger.error(
                f"Error updating user {user_id} by admin {current_admin.id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500,
                detail="An error occurred while updating user admin fields",
            )

    @staticmethod
    def block_user(
        db: Session,
        current_admin: User,
        user_id: str,
        block_status: bool,
    ) -> Dict[str, Any]:
        """
        Block or unblock a user account.

        Args:
            db: Database session
            current_admin: Current admin user (for authorization)
            user_id: ID of user to block/unblock
            block_status: True to block, False to unblock

        Returns:
            Dictionary containing updated user data and success message

        Raises:
            HTTPException: If user is not admin, user not found, or other errors
        """
        # Authorization check
        AdminService._check_admin_authorization(current_admin, "block/unblock users")

        try:
            # Get and validate target user
            user = User.get_by_id(db, user_id)
            if not user:
                raise HTTPException(status_code=404, detail=AuthErrors.USER_NOT_FOUND)

            # Prevent admin from blocking themselves
            if user_id == str(current_admin.id):
                raise HTTPException(
                    status_code=400, detail="Cannot block your own account"
                )

            # Update block status
            updated_user = User.update(db, user_id, {"is_blocked": block_status})

            if not updated_user:
                raise HTTPException(
                    status_code=500, detail="User block status update failed"
                )

            # Convert to schema format
            user_data = UserSchema.model_validate(updated_user)

            action = "blocked" if block_status else "unblocked"
            logger.info(f"Admin {current_admin.id} {action} user {user_id}")

            return {
                "user": user_data,
                "message": f"User {action} successfully",
                "is_blocked": block_status,
            }

        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            logger.error(
                f"Error blocking/unblocking user {user_id} by admin {current_admin.id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500,
                detail="An error occurred while updating user block status",
            )

    @staticmethod
    def get_user_statistics(
        db: Session,
        current_admin: User,
    ) -> Dict[str, Any]:
        """
        Get comprehensive user statistics for admin analytics.

        Args:
            db: Database session
            current_admin: Current admin user (for authorization)

        Returns:
            Dictionary containing various user statistics

        Raises:
            HTTPException: If user is not admin or other errors occur
        """
        # Authorization check
        AdminService._check_admin_authorization(current_admin, "access user statistics")

        try:
            # Get statistics from repository
            stats = AdminRepository.get_user_statistics(db)

            logger.info(f"Admin {current_admin.id} retrieved user statistics")

            return {
                "statistics": stats,
                "message": "User statistics retrieved successfully",
            }

        except Exception as e:
            logger.error(
                f"Error retrieving user statistics for admin {current_admin.id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500,
                detail="An error occurred while retrieving user statistics",
            )

    @staticmethod
    def get_system_reports(
        db: Session,
        current_admin: User,
        days: int = 30,
    ) -> Dict[str, Any]:
        """
        Get system reports including registration analytics and user trends.

        Args:
            db: Database session
            current_admin: Current admin user (for authorization)
            days: Number of days for analytics (default 30)

        Returns:
            Dictionary containing system reports and analytics

        Raises:
            HTTPException: If user is not admin or other errors occur
        """
        # Authorization check
        AdminService._check_admin_authorization(current_admin, "access system reports")

        try:
            # Get registration analytics
            registration_analytics = AdminRepository.get_registration_analytics(
                db, days
            )

            # Get current user statistics
            user_stats = AdminRepository.get_user_statistics(db)

            logger.info(
                f"Admin {current_admin.id} retrieved system reports for {days} days"
            )

            return {
                "registration_analytics": registration_analytics,
                "user_statistics": user_stats,
                "period_days": days,
                "message": "System reports retrieved successfully",
            }

        except Exception as e:
            logger.error(
                f"Error retrieving system reports for admin {current_admin.id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500,
                detail="An error occurred while retrieving system reports",
            )

    @staticmethod
    def search_users(
        db: Session,
        current_admin: User,
        search_term: Optional[str] = None,
        country: Optional[str] = None,
        is_verified: Optional[bool] = None,
        is_blocked: Optional[bool] = None,
        is_admin: Optional[bool] = None,
        registration_start: Optional[datetime] = None,
        registration_end: Optional[datetime] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """
        Advanced user search with admin-specific filters.

        Args:
            db: Database session
            current_admin: Current admin user (for authorization)
            search_term: Search in email, first_name, last_name
            country: ISO 3166-1 alpha-2 country code filter
            is_verified: Filter by verification status
            is_blocked: Filter by blocked status
            is_admin: Filter by admin status
            registration_start: Filter by registration date start
            registration_end: Filter by registration date end
            page: Page number for pagination
            limit: Results per page

        Returns:
            Dictionary containing search results and pagination info

        Raises:
            HTTPException: If user is not admin or other errors occur
        """
        # Authorization check
        AdminService._check_admin_authorization(current_admin, "search users")

        try:
            # Perform advanced search using repository
            result = AdminRepository.search_users_advanced(
                db=db,
                search_term=search_term,
                country=country,
                is_verified=is_verified,
                is_blocked=is_blocked,
                is_admin=is_admin,
                registration_start=registration_start,
                registration_end=registration_end,
                page=page,
                limit=limit,
            )

            # Convert users to schema format
            users_data = [UserSchema.model_validate(user) for user in result["users"]]

            logger.info(
                f"Admin {current_admin.id} performed user search (page {page}, {len(users_data)} results)"
            )

            return {
                "users": users_data,
                "total": result["total"],
                "page": result["page"],
                "limit": result["limit"],
                "total_pages": result["total_pages"],
                "search_filters": {
                    "search_term": search_term,
                    "country": country,
                    "is_verified": is_verified,
                    "is_blocked": is_blocked,
                    "is_admin": is_admin,
                    "registration_start": registration_start,
                    "registration_end": registration_end,
                },
            }

        except Exception as e:
            logger.error(
                f"Error searching users for admin {current_admin.id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500, detail="An error occurred while searching users"
            )

    @staticmethod
    def get_unverified_users(
        db: Session,
        current_admin: User,
        days_old: int = 7,
        page: int = 1,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """
        Get unverified users for admin review and management.

        Args:
            db: Database session
            current_admin: Current admin user (for authorization)
            days_old: Minimum days since registration
            page: Page number for pagination
            limit: Results per page

        Returns:
            Dictionary containing unverified users and pagination info

        Raises:
            HTTPException: If user is not admin or other errors occur
        """
        # Authorization check
        AdminService._check_admin_authorization(
            current_admin, "access unverified users"
        )

        try:
            # Get unverified users from repository
            result = AdminRepository.get_unverified_users(
                db, days_old=days_old, page=page, limit=limit
            )

            # Convert users to schema format
            users_data = [UserSchema.model_validate(user) for user in result["users"]]

            logger.info(
                f"Admin {current_admin.id} retrieved unverified users (page {page}, {len(users_data)} users)"
            )

            return {
                "users": users_data,
                "total": result["total"],
                "page": result["page"],
                "limit": result["limit"],
                "total_pages": result["total_pages"],
                "days_old": days_old,
                "message": f"Retrieved unverified users older than {days_old} days",
            }

        except Exception as e:
            logger.error(
                f"Error retrieving unverified users for admin {current_admin.id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500,
                detail="An error occurred while retrieving unverified users",
            )

    @staticmethod
    def get_blocked_users(
        db: Session,
        current_admin: User,
        page: int = 1,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """
        Get blocked users for admin management.

        Args:
            db: Database session
            current_admin: Current admin user (for authorization)
            page: Page number for pagination
            limit: Results per page

        Returns:
            Dictionary containing blocked users and pagination info

        Raises:
            HTTPException: If user is not admin or other errors occur
        """
        # Authorization check
        AdminService._check_admin_authorization(current_admin, "access blocked users")

        try:
            # Get blocked users from repository
            result = AdminRepository.get_blocked_users(db, page=page, limit=limit)

            # Convert users to schema format
            users_data = [UserSchema.model_validate(user) for user in result["users"]]

            logger.info(
                f"Admin {current_admin.id} retrieved blocked users (page {page}, {len(users_data)} users)"
            )

            return {
                "users": users_data,
                "total": result["total"],
                "page": result["page"],
                "limit": result["limit"],
                "total_pages": result["total_pages"],
                "message": "Retrieved blocked users successfully",
            }

        except Exception as e:
            logger.error(
                f"Error retrieving blocked users for admin {current_admin.id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500,
                detail="An error occurred while retrieving blocked users",
            )

    @staticmethod
    def get_admin_users(
        db: Session,
        current_admin: User,
        page: int = 1,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """
        Get all admin users for admin management.

        Args:
            db: Database session
            current_admin: Current admin user (for authorization)
            page: Page number for pagination
            limit: Results per page

        Returns:
            Dictionary containing admin users and pagination info

        Raises:
            HTTPException: If user is not admin or other errors occur
        """
        # Authorization check
        AdminService._check_admin_authorization(current_admin, "access admin users")

        try:
            # Get admin users from repository
            result = AdminRepository.get_admin_users(db, page=page, limit=limit)

            # Convert users to schema format
            users_data = [UserSchema.model_validate(user) for user in result["users"]]

            logger.info(
                f"Admin {current_admin.id} retrieved admin users (page {page}, {len(users_data)} users)"
            )

            return {
                "users": users_data,
                "total": result["total"],
                "page": result["page"],
                "limit": result["limit"],
                "total_pages": result["total_pages"],
                "message": "Retrieved admin users successfully",
            }

        except Exception as e:
            logger.error(
                f"Error retrieving admin users for admin {current_admin.id}: {str(e)}"
            )
            raise HTTPException(
                status_code=500, detail="An error occurred while retrieving admin users"
            )
