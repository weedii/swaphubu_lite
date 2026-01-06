"""
KYC Verification model for the crypto exchange platform.
Handles Know Your Customer verification process with external providers like Sumsub.
"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from ..db.base import Base
from ..utils import crud_enabled


@crud_enabled
class KYCVerification(Base):
    """
    KYC Verification model for tracking user identity verification process.

    Stores verification status, provider responses, and timestamps for compliance
    and audit purposes. Links to User model for verification tracking.
    """

    __tablename__ = "kyc_verifications"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign key to User
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Verification details
    reference = Column(String, nullable=False, index=True, unique=True)
    status = Column(String, nullable=False)
    provider_response = Column(Text, nullable=True)

    # Timestamps
    submitted_at = Column(DateTime, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="kyc_verifications")

    # Note: Custom timestamps (submitted_at, reviewed_at) are defined above
    # CRUD operations added by @crud_enabled decorator:
    # - KYCVerification.create(), get_by_id(), get_all(), get_paginated(), etc.

    def __repr__(self):
        return f"<KYCVerification(id={self.id}, user_id={self.user_id}, status={self.status}, reference={self.reference})>"
