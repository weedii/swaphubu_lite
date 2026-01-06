"""
Admin Repository for admin-specific database queries.
Contains specialized queries for user management and admin analytics.

This repository is specifically for admin operations and should only be used
by AdminService and admin-only endpoints.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from datetime import datetime, timedelta, timezone

from ..models.User import User


class AdminRepository:
    """
    Repository for admin-specific database queries.

    This repository contains queries that are specifically designed for admin
    operations such as user management, analytics, and system monitoring.
    """

    @staticmethod
    def get_all_users_paginated(
        db: Session,
        page: int = 1,
        limit: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> Dict[str, Any]:
        """
        Get paginated list of all users for admin user listing.

        Args:
            db: Database session
            page: Page number (1-based)
            limit: Number of users per page
            sort_by: Field to sort by (created_at, email, first_name, last_name)
            sort_order: Sort order (asc, desc)

        Returns:
            Dictionary containing users, pagination info, and total count

        Example:
            result = AdminRepository.get_all_users_paginated(db, page=1, limit=20)
            # Returns: {
            #     "users": [...],
            #     "total": 150,
            #     "page": 1,
            #     "limit": 20,
            #     "total_pages": 8
            # }
        """
        # Calculate offset
        offset = (page - 1) * limit

        # Build base query
        query = db.query(User).filter(User.deleted_at.is_(None))

        # Apply sorting
        sort_column = getattr(User, sort_by, User.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Get total count
        total = query.count()

        # Apply pagination
        users = query.offset(offset).limit(limit).all()

        # Calculate total pages
        total_pages = (total + limit - 1) // limit

        return {
            "users": users,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    def get_user_statistics(db: Session) -> Dict[str, Any]:
        """
        Get comprehensive user statistics for admin analytics using is_admin flag.

        Args:
            db: Database session

        Returns:
            Dictionary with various user statistics

        Example:
            stats = AdminRepository.get_user_statistics(db)
            # Returns: {
            #     "total_users": 1000,
            #     "admin_users": 5,
            #     "regular_users": 995,
            #     "verified_users": 800,
            #     "unverified_users": 200,
            #     "blocked_users": 10,
            #     "users_by_country": {"US": 400, "CA": 200, ...},
            #     "recent_registrations": 50
            # }
        """
        # Base query for active users
        active_users_query = db.query(User).filter(User.deleted_at.is_(None))

        # Total counts
        total_users = active_users_query.count()
        admin_users = active_users_query.filter(User.is_admin == True).count()
        regular_users = active_users_query.filter(User.is_admin == False).count()

        # Verification status
        verified_users = active_users_query.filter(User.is_verified == True).count()
        unverified_users = active_users_query.filter(User.is_verified == False).count()

        # Blocked users
        blocked_users = active_users_query.filter(User.is_blocked == True).count()

        # Users by country
        country_stats = (
            active_users_query.with_entities(
                User.country, func.count(User.id).label("count")
            )
            .group_by(User.country)
            .order_by(desc(func.count(User.id)))
            .all()
        )
        users_by_country = {
            country or "Unknown": count for country, count in country_stats
        }

        # Recent registrations (last 30 days)
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        recent_registrations = active_users_query.filter(
            User.created_at >= thirty_days_ago
        ).count()

        return {
            "total_users": total_users,
            "admin_users": admin_users,
            "regular_users": regular_users,
            "verified_users": verified_users,
            "unverified_users": unverified_users,
            "blocked_users": blocked_users,
            "users_by_country": users_by_country,
            "recent_registrations": recent_registrations,
        }

    @staticmethod
    def search_users_advanced(
        db: Session,
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
            Dictionary with search results and pagination info

        Example:
            results = AdminRepository.search_users_advanced(
                db,
                search_term="john",
                country="US",
                is_verified=True,
                page=1,
                limit=10
            )
        """
        # Build base query
        query = db.query(User).filter(User.deleted_at.is_(None))

        # Apply search term filter
        if search_term:
            search_pattern = f"%{search_term.lower()}%"
            query = query.filter(
                or_(
                    func.lower(User.email).like(search_pattern),
                    func.lower(User.first_name).like(search_pattern),
                    func.lower(User.last_name).like(search_pattern),
                )
            )

        # Apply country filter
        if country:
            query = query.filter(User.country == country.upper())

        # Apply verification status filter
        if is_verified is not None:
            query = query.filter(User.is_verified == is_verified)

        # Apply blocked status filter
        if is_blocked is not None:
            query = query.filter(User.is_blocked == is_blocked)

        # Apply admin status filter
        if is_admin is not None:
            query = query.filter(User.is_admin == is_admin)

        # Apply registration date filters
        if registration_start:
            query = query.filter(User.created_at >= registration_start)

        if registration_end:
            query = query.filter(User.created_at <= registration_end)

        # Order by creation date (newest first)
        query = query.order_by(desc(User.created_at))

        # Get total count before pagination
        total = query.count()

        # Apply pagination
        offset = (page - 1) * limit
        users = query.offset(offset).limit(limit).all()

        # Calculate total pages
        total_pages = (total + limit - 1) // limit

        return {
            "users": users,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    def get_unverified_users(
        db: Session, days_old: int = 7, page: int = 1, limit: int = 20
    ) -> Dict[str, Any]:
        """
        Get unverified users for admin review and management.

        Args:
            db: Database session
            days_old: Minimum days since registration
            page: Page number for pagination
            limit: Results per page

        Returns:
            Dictionary with unverified users and pagination info

        Example:
            unverified = AdminRepository.get_unverified_users(db, days_old=30)
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_old)

        # Build query for unverified users older than specified days
        query = (
            db.query(User)
            .filter(
                User.deleted_at.is_(None),
                User.is_verified == False,
                User.created_at <= cutoff_date,
                User.is_admin == False,
            )
            .order_by(desc(User.created_at))
        )

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (page - 1) * limit
        users = query.offset(offset).limit(limit).all()

        # Calculate total pages
        total_pages = (total + limit - 1) // limit

        return {
            "users": users,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    def get_users_by_country_paginated(
        db: Session, country: str, page: int = 1, limit: int = 20
    ) -> Dict[str, Any]:
        """
        Get users from a specific country with pagination for admin management.

        Args:
            db: Database session
            country: ISO 3166-1 alpha-2 country code
            page: Page number for pagination
            limit: Results per page

        Returns:
            Dictionary with users from country and pagination info

        Example:
            us_users = AdminRepository.get_users_by_country_paginated(db, "US")
        """
        # Build query for users from specific country
        query = (
            db.query(User)
            .filter(
                User.deleted_at.is_(None),
                User.country == country.upper(),
                User.is_admin == False,
            )
            .order_by(desc(User.created_at))
        )

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (page - 1) * limit
        users = query.offset(offset).limit(limit).all()

        # Calculate total pages
        total_pages = (total + limit - 1) // limit

        return {
            "users": users,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    def get_blocked_users(
        db: Session, page: int = 1, limit: int = 20
    ) -> Dict[str, Any]:
        """
        Get blocked users for admin management.

        Args:
            db: Database session
            page: Page number for pagination
            limit: Results per page

        Returns:
            Dictionary with blocked users and pagination info

        Example:
            blocked = AdminRepository.get_blocked_users(db)
        """
        # Build query for blocked users
        query = (
            db.query(User)
            .filter(
                User.deleted_at.is_(None),
                User.is_blocked == True,
                User.is_admin == False,
            )
            .order_by(desc(User.updated_at))
        )

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (page - 1) * limit
        users = query.offset(offset).limit(limit).all()

        # Calculate total pages
        total_pages = (total + limit - 1) // limit

        return {
            "users": users,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    def get_admin_users(db: Session, page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """
        Get all admin users for admin management.

        Args:
            db: Database session
            page: Page number for pagination
            limit: Results per page

        Returns:
            Dictionary with admin users and pagination info

        Example:
            admins = AdminRepository.get_admin_users(db)
        """
        # Build query for admin users
        query = (
            db.query(User)
            .filter(User.deleted_at.is_(None), User.is_admin == True)
            .order_by(desc(User.created_at))
        )

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (page - 1) * limit
        users = query.offset(offset).limit(limit).all()

        # Calculate total pages
        total_pages = (total + limit - 1) // limit

        return {
            "users": users,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    def get_registration_analytics(db: Session, days: int = 30) -> Dict[str, Any]:
        """
        Get user registration analytics for the specified number of days.

        Args:
            db: Database session
            days: Number of days to analyze

        Returns:
            Dictionary with registration analytics

        Example:
            analytics = AdminRepository.get_registration_analytics(db, days=30)
            # Returns: {
            #     "daily_registrations": [{"date": "2024-01-01", "count": 5}, ...],
            #     "total_period": 150,
            #     "average_daily": 5.0
            # }
        """
        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        # Get daily registration counts
        daily_registrations = (
            db.query(
                func.date(User.created_at).label("date"),
                func.count(User.id).label("count"),
            )
            .filter(User.deleted_at.is_(None), User.created_at >= start_date)
            .group_by(func.date(User.created_at))
            .order_by(func.date(User.created_at))
            .all()
        )

        # Convert to list of dictionaries
        daily_data = [
            {"date": str(date), "count": count} for date, count in daily_registrations
        ]

        # Calculate totals
        total_period = sum(item["count"] for item in daily_data)
        average_daily = total_period / days if days > 0 else 0

        return {
            "daily_registrations": daily_data,
            "total_period": total_period,
            "average_daily": round(average_daily, 2),
        }
