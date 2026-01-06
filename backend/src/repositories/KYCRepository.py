"""
KYC Repository for custom database queries.
Contains specialized queries that go beyond basic CRUD operations.

Basic CRUD operations are handled by the @crud_enabled decorator on the KYCVerification model.
This repository is only for complex, custom queries.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..models.KYCVerification import KYCVerification


class KYCRepository:
    """
    Repository for custom KYC database queries.

    Use this for complex queries that can't be handled by the basic CRUD operations
    provided by the @crud_enabled decorator on the KYCVerification model.

    Basic operations like KYCVerification.create(), KYCVerification.get_by_id(), etc.
    are available directly on the KYCVerification model and don't need to be duplicated here.
    """

    @staticmethod
    def find_pending_verification_by_user(
        db: Session, user_id: str
    ) -> Optional[KYCVerification]:
        """
        Find a pending KYC verification for a specific user.

        Args:
            db: Database session
            user_id: User's ID

        Returns:
            KYCVerification instance or None if not found

        Example:
            verification = KYCRepository.find_pending_verification_by_user(db, user_id)
        """
        return (
            db.query(KYCVerification)
            .filter(
                KYCVerification.user_id == user_id,
                KYCVerification.status.in_(["initiated", "pending"]),
            )
            .first()
        )

    @staticmethod
    def find_by_reference(db: Session, reference: str) -> Optional[KYCVerification]:
        """
        Find a KYC verification by reference number.

        Args:
            db: Database session
            reference: Verification reference number

        Returns:
            KYCVerification instance or None if not found

        Example:
            verification = KYCRepository.find_by_reference(db, "KYC_123_20240101_abc123")
        """
        return (
            db.query(KYCVerification)
            .filter(KYCVerification.reference == reference)
            .first()
        )

    @staticmethod
    def find_by_user_and_verification_id(
        db: Session, user_id: str, verification_id: str
    ) -> Optional[KYCVerification]:
        """
        Find a KYC verification by user ID and verification ID (for security).

        Args:
            db: Database session
            user_id: User's ID
            verification_id: Verification ID

        Returns:
            KYCVerification instance or None if not found

        Example:
            verification = KYCRepository.find_by_user_and_verification_id(db, user_id, verification_id)
        """
        return (
            db.query(KYCVerification)
            .filter(
                KYCVerification.id == verification_id,
                KYCVerification.user_id == user_id,
            )
            .first()
        )

    @staticmethod
    def get_verifications_by_status(db: Session, status: str) -> List[KYCVerification]:
        """
        Get all KYC verifications with a specific status.

        Args:
            db: Database session
            status: Verification status

        Returns:
            List of KYCVerification instances

        Example:
            pending_verifications = KYCRepository.get_verifications_by_status(db, "pending")
        """
        return (
            db.query(KYCVerification)
            .filter(KYCVerification.status == status)
            .order_by(KYCVerification.submitted_at.desc())
            .all()
        )

    @staticmethod
    def get_user_verifications(db: Session, user_id: str) -> List[KYCVerification]:
        """
        Get all KYC verifications for a specific user.

        Args:
            db: Database session
            user_id: User's ID

        Returns:
            List of KYCVerification instances ordered by submission date

        Example:
            user_verifications = KYCRepository.get_user_verifications(db, user_id)
        """
        return (
            db.query(KYCVerification)
            .filter(KYCVerification.user_id == user_id)
            .order_by(KYCVerification.submitted_at.desc())
            .all()
        )

    @staticmethod
    def get_recent_user_verifications(
        db: Session, user_id: str, time_window: timedelta
    ) -> List[KYCVerification]:
        """
        Get KYC verifications for a specific user within a recent time window.
        Used for rate limiting verification requests.

        Args:
            db: Database session
            user_id: User's ID
            time_window: Time window to look back from now

        Returns:
            List of KYCVerification instances within the time window

        Example:
            recent_verifications = KYCRepository.get_recent_user_verifications(
                db, user_id, timedelta(hours=24)
            )
        """
        cutoff_time = datetime.utcnow() - time_window
        return (
            db.query(KYCVerification)
            .filter(
                KYCVerification.user_id == user_id,
                KYCVerification.submitted_at >= cutoff_time,
            )
            .order_by(KYCVerification.submitted_at.desc())
            .all()
        )

    @staticmethod
    def get_verifications_by_date_range(
        db: Session, start_date: datetime, end_date: datetime
    ) -> List[KYCVerification]:
        """
        Get KYC verifications submitted within a specific date range.

        Args:
            db: Database session
            start_date: Start of date range
            end_date: End of date range

        Returns:
            List of KYCVerification instances

        Example:
            recent_verifications = KYCRepository.get_verifications_by_date_range(
                db, datetime(2024, 1, 1), datetime(2024, 1, 31)
            )
        """
        return (
            db.query(KYCVerification)
            .filter(KYCVerification.submitted_at.between(start_date, end_date))
            .order_by(KYCVerification.submitted_at.desc())
            .all()
        )
