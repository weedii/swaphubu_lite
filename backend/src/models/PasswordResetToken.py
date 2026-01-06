"""
Password Reset Token model for the crypto exchange platform.
Handles password reset tokens with verification status and usage tracking.
"""

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from ..db.base import Base
from ..utils import auditable, crud_enabled


@crud_enabled
@auditable
class PasswordResetToken(Base):
    """
    Password Reset Token model for tracking password reset process.

    Stores reset tokens with verification status, expiration, and usage tracking
    for secure password reset flow. Links to User model for reset management.
    """

    __tablename__ = "password_reset_tokens"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign key to User
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Token details
    token_hash = Column(String, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    used_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="password_reset_tokens")

    # Note: created_at, updated_at, and deleted_at are automatically added by @auditable
    # The decorator also adds soft_delete(), restore(), and is_deleted property methods
    #
    # CRUD operations added by @crud_enabled decorator:
    # - PasswordResetToken.create(db, **kwargs) -> PasswordResetToken
    # - PasswordResetToken.get_by_id(db, id) -> PasswordResetToken | None
    # - PasswordResetToken.get_all(db) -> List[PasswordResetToken]
    # - PasswordResetToken.get_paginated(db, page, limit) -> Dict
    # - PasswordResetToken.update(db, id, updates) -> PasswordResetToken | None
    # - PasswordResetToken.delete(db, id) -> bool
    # - PasswordResetToken.count(db) -> int
    # - PasswordResetToken.exists(db, id) -> bool

    def __repr__(self):
        return f"<PasswordResetToken(id={self.id}, user_id={self.user_id}, is_verified={self.is_verified})>"
