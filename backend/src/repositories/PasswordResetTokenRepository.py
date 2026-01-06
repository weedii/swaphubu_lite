"""
Password Reset Token Repository for custom database queries.
Contains specialized queries for password reset token management.

Basic CRUD operations are handled by the @crud_enabled decorator on the PasswordResetToken model.
This repository is only for complex, custom queries.
"""

import logging
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timezone

from ..models.PasswordResetToken import PasswordResetToken
from ..models.User import User

# Configure logging
logger = logging.getLogger(__name__)


class PasswordResetTokenRepository:
    """
    Repository for custom PasswordResetToken database queries.

    Use this for complex queries that can't be handled by the basic CRUD operations
    provided by the @crud_enabled decorator on the PasswordResetToken model.

    Basic operations like PasswordResetToken.create(), PasswordResetToken.get_by_id(), etc.
    are available directly on the PasswordResetToken model and don't need to be duplicated here.
    """

    @staticmethod
    def find_by_token_hash(
        db: Session, token_hash: str
    ) -> Optional[PasswordResetToken]:
        """
        Find a password reset token by token hash that hasn't expired.

        Args:
            db: Database session
            token_hash: SHA256 hash of the reset token

        Returns:
            PasswordResetToken instance or None if not found/expired
        """
        current_time = datetime.now(timezone.utc)
        return (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.token_hash == token_hash,
                PasswordResetToken.expires_at > current_time,
                PasswordResetToken.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def find_by_user_and_token(
        db: Session, user_id: str, token_hash: str
    ) -> Optional[PasswordResetToken]:
        """
        Find a password reset token by user ID and token hash that hasn't expired.

        Args:
            db: Database session
            user_id: User's UUID
            token_hash: SHA256 hash of the reset token

        Returns:
            PasswordResetToken instance or None if not found/expired
        """
        current_time = datetime.now(timezone.utc)
        return (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.user_id == user_id,
                PasswordResetToken.token_hash == token_hash,
                PasswordResetToken.expires_at > current_time,
                PasswordResetToken.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def find_verified_token_by_user(
        db: Session, user_id: str
    ) -> Optional[PasswordResetToken]:
        """
        Find a verified password reset token by user ID that hasn't expired or been used.

        Args:
            db: Database session
            user_id: User's UUID

        Returns:
            PasswordResetToken instance or None if not found/expired/used
        """
        current_time = datetime.now(timezone.utc)
        return (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.user_id == user_id,
                PasswordResetToken.is_verified == True,
                PasswordResetToken.used_at.is_(None),
                PasswordResetToken.expires_at > current_time,
                PasswordResetToken.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def find_by_user_email_and_token(
        db: Session, email: str, token_hash: str
    ) -> Optional[PasswordResetToken]:
        """
        Find a password reset token by user email and token hash that hasn't expired.

        Args:
            db: Database session
            email: User's email address
            token_hash: SHA256 hash of the reset token

        Returns:
            PasswordResetToken instance or None if not found/expired
        """
        current_time = datetime.now(timezone.utc)
        return (
            db.query(PasswordResetToken)
            .join(User)
            .filter(
                User.email == email,
                PasswordResetToken.token_hash == token_hash,
                PasswordResetToken.expires_at > current_time,
                PasswordResetToken.deleted_at.is_(None),
                User.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def find_verified_token_by_user_email(
        db: Session, email: str
    ) -> Optional[PasswordResetToken]:
        """
        Find a verified password reset token by user email that hasn't expired or been used.

        Args:
            db: Database session
            email: User's email address

        Returns:
            PasswordResetToken instance or None if not found/expired/used
        """
        current_time = datetime.now(timezone.utc)
        return (
            db.query(PasswordResetToken)
            .join(User)
            .filter(
                User.email == email,
                PasswordResetToken.is_verified == True,
                PasswordResetToken.used_at.is_(None),
                PasswordResetToken.expires_at > current_time,
                PasswordResetToken.deleted_at.is_(None),
                User.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def mark_as_verified(db: Session, token_id: str) -> Optional[PasswordResetToken]:
        """
        Mark a password reset token as verified.

        Args:
            db: Database session
            token_id: Token's UUID

        Returns:
            Updated PasswordResetToken instance or None if not found
        """
        return PasswordResetToken.update(db, token_id, {"is_verified": True})

    @staticmethod
    def mark_as_used(db: Session, token_id: str) -> Optional[PasswordResetToken]:
        """
        Mark a password reset token as used.

        Args:
            db: Database session
            token_id: Token's UUID

        Returns:
            Updated PasswordResetToken instance or None if not found
        """
        current_time = datetime.now(timezone.utc)
        return PasswordResetToken.update(db, token_id, {"used_at": current_time})

    @staticmethod
    def cleanup_expired_tokens(db: Session) -> int:
        """
        Clean up expired password reset tokens.

        Args:
            db: Database session

        Returns:
            Number of tokens cleaned up
        """
        current_time = datetime.now(timezone.utc)
        expired_tokens = (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.expires_at <= current_time,
                PasswordResetToken.deleted_at.is_(None),
            )
            .all()
        )

        count = 0
        for token in expired_tokens:
            if PasswordResetToken.delete(db, str(token.id)):
                count += 1

        return count

    @staticmethod
    def delete_all_for_user(db: Session, user_id: str) -> int:
        """
        Delete all reset tokens for a specific user.
        Used when password is changed or new tokens are created.

        Args:
            db: Database session
            user_id: User's UUID

        Returns:
            Number of tokens deleted
        """
        try:
            # Use direct query for bulk delete operation
            result = (
                db.query(PasswordResetToken)
                .filter(PasswordResetToken.user_id == user_id)
                .delete(synchronize_session=False)
            )

            db.commit()

            return result
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete reset tokens for user {user_id}: {str(e)}")
            return 0

    @staticmethod
    def find_active_tokens_for_user(
        db: Session, user_id: str
    ) -> List[PasswordResetToken]:
        """
        Find all active (non-expired, unused) reset tokens for a user.

        Args:
            db: Database session
            user_id: User's UUID

        Returns:
            List of active PasswordResetToken instances
        """
        current_time = datetime.now(timezone.utc)
        return (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.user_id == user_id,
                PasswordResetToken.expires_at > current_time,
                PasswordResetToken.used_at.is_(None),
                PasswordResetToken.deleted_at.is_(None),
            )
            .all()
        )
