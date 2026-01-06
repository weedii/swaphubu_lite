"""
User Repository for regular user-focused database queries.
Contains specialized queries for regular user operations and profile management.

This repository is focused on regular user operations and should not contain
admin-specific queries. Admin operations should use AdminRepository instead.

Basic CRUD operations are handled by the @crud_enabled decorator on the User model.
This repository is only for complex, user-focused queries.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta, timezone

from ..models.User import User


class UserRepository:
    """
    Repository for regular user-focused database queries.

    This repository contains queries that are specifically designed for regular
    user operations such as profile management, authentication, and user-specific
    data retrieval. Admin-specific queries should use AdminRepository instead.

    Basic operations like User.create(), User.get_by_id(), etc. are available
    directly on the User model and don't need to be duplicated here.
    """

    @staticmethod
    def find_by_email(db: Session, email: str) -> Optional[User]:
        """
        Find a user by email address.

        Args:
            db: Database session
            email: User's email address

        Returns:
            User instance or None if not found

        Example:
            user = UserRepository.find_by_email(db, "john@example.com")
        """
        return (
            db.query(User).filter(User.email == email).first()
        )

    @staticmethod
    def find_by_phone(db: Session, phone_number: str) -> Optional[User]:
        """
        Find a user by phone number.

        Args:
            db: Database session
            phone_number: User's phone number

        Returns:
            User instance or None if not found
        """
        return (
            db.query(User)
            .filter(User.phone_number == phone_number)
            .first()
        )

    @staticmethod
    def search_users_basic(
        db: Session, search_term: str, country: Optional[str] = None, limit: int = 10
    ) -> List[User]:
        """
        Basic user search for regular user operations (e.g., finding friends, contacts).
        This is a limited search for user-facing features, not admin management.

        Args:
            db: Database session
            search_term: Term to search for
            country: Optional ISO 3166-1 alpha-2 country code to filter by
            limit: Maximum number of results to return (default 10)

        Returns:
            List of users matching the search term and country filter

        Example:
            users = UserRepository.search_users_basic(db, "john", limit=5)
            us_users = UserRepository.search_users_basic(db, "john", country="US")
        """
        search_pattern = f"%{search_term.lower()}%"

        query = db.query(User).filter(
            or_(
                func.lower(User.email).like(search_pattern),
                func.lower(User.first_name).like(search_pattern),
                func.lower(User.last_name).like(search_pattern),
            ),
            User.deleted_at.is_(None),
            User.is_verified == True,  # Only show verified users in basic search
            User.is_blocked == False,  # Don't show blocked users
            User.is_admin == False,  # Don't include admin users
        )

        if country:
            query = query.filter(User.country == country.upper())

        return query.limit(limit).all()

    @staticmethod
    def get_user_profile_data(db: Session, user_id: str) -> Optional[User]:
        """
        Get user profile data for regular user operations.
        Only returns data if the user is not deleted and not blocked.

        Args:
            db: Database session
            user_id: UUID string of the user

        Returns:
            User instance or None if not found or blocked

        Example:
            profile = UserRepository.get_user_profile_data(db, user_id="c9d98eda-19a7-43fe-9e15-5f258e6163a3")
        """
        return (
            db.query(User)
            .filter(
                User.id == user_id,
                User.deleted_at.is_(None),
                User.is_blocked == False,
            )
            .first()
        )

    @staticmethod
    def update_user_data(
        db: Session, user_id: str, update_data: dict
    ) -> Optional[User]:
        """
        Update user data for regular user profile operations.
        Only allows updates to non-admin fields.

        Args:
            db: Database session
            user_id: UUID string of the user to update
            update_data: Dictionary of fields to update

        Returns:
            Updated User instance or None if not found

        Example:
            updated_user = UserRepository.update_user_data(
                db,
                user_id="c9d98eda-19a7-43fe-9e15-5f258e6163a3",
                {"first_name": "John", "last_name": "Doe"}
            )
        """
        # Filter out admin-only fields that regular users shouldn't be able to update
        allowed_fields = {
            "first_name",
            "last_name",
            "phone_number",
            "country",
            "date_of_birth",
            "updated_at",
        }

        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}

        if not filtered_data:
            return None

        # Add updated_at timestamp
        filtered_data["updated_at"] = datetime.now(timezone.utc)

        user = (
            db.query(User)
            .filter(
                User.id == user_id,
                User.deleted_at.is_(None),
                User.is_blocked == False,
            )
            .first()
        )

        if user:
            for key, value in filtered_data.items():
                setattr(user, key, value)
            db.commit()
            db.refresh(user)

        return user
