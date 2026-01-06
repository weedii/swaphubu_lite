"""
Transaction model for the crypto exchange platform.
Handles all crypto exchange transactions including fiat-to-crypto and crypto-to-fiat trades.
"""

from sqlalchemy import Column, String, Enum, ForeignKey, Boolean, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from ..db.base import Base
from ..utils import auditable, crud_enabled
from ..enums import TransactionType, TransactionStatus


@crud_enabled
@auditable
class Transaction(Base):
    """
    Transaction model for crypto exchange operations.

    Tracks all exchange transactions including amounts, currencies, margins,
    and processing status. Supports both fiat-to-crypto and crypto-to-fiat
    conversions with manual override capabilities for admin management.
    """

    __tablename__ = "transactions"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign key to User
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Transaction details
    type = Column(Enum(TransactionType), nullable=False)
    from_currency = Column(String, nullable=False)
    to_currency = Column(String, nullable=False)
    from_amount = Column(DECIMAL(precision=18, scale=8), nullable=False)
    to_amount = Column(DECIMAL(precision=18, scale=8), nullable=False)
    margin_applied = Column(DECIMAL(precision=5, scale=2), nullable=False)

    # Status and processing
    status = Column(
        Enum(TransactionStatus), nullable=False, default=TransactionStatus.PENDING
    )
    manually_overridden = Column(Boolean, default=False, nullable=False)
    p100_status = Column(String, nullable=True)  # External processing status

    # Relationships
    user = relationship("User", back_populates="transactions")
    invoice = relationship("Invoice", back_populates="transaction", uselist=False)
    tickets = relationship("Ticket", back_populates="transaction")

    # Note: created_at, updated_at, and deleted_at are automatically added by @auditable
    # The decorator also adds soft_delete(), restore(), and is_deleted property methods
    # Note: CRUD operations added by @crud_enabled decorator:
    #       - Transaction.create(), get_by_id(), get_all(), get_paginated(), etc.

    def __repr__(self):
        return f"<Transaction(id={self.id}, user_id={self.user_id}, type={self.type.value}, status={self.status.value})>"
