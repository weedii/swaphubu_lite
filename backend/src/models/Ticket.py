"""
Ticket model for the crypto exchange platform.
Handles support tickets and order-related inquiries between users and admins.
"""

from sqlalchemy import Column, String, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from ..db.base import Base
from ..utils import auditable, crud_enabled
from ..enums import TicketType, TicketStatus


@crud_enabled
@auditable
class Ticket(Base):
    """
    Ticket model for support system.

    Manages support tickets between users and admins.
    Can be linked to specific transactions for order-related support.
    Tracks ticket status and provides audit trail for support interactions.
    """

    __tablename__ = "tickets"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign key to User
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Optional foreign key to Transaction (SET NULL when transaction is deleted)
    transaction_id = Column(
        UUID(as_uuid=True),
        ForeignKey("transactions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Ticket details
    subject = Column(String, nullable=False)
    type = Column(Enum(TicketType), nullable=False)
    status = Column(Enum(TicketStatus), nullable=False, default=TicketStatus.PENDING)

    # Relationships
    user = relationship("User", back_populates="tickets")
    transaction = relationship("Transaction", back_populates="tickets")
    messages = relationship("TicketMessage", back_populates="ticket")

    # Note: created_at, updated_at, and deleted_at are automatically added by @auditable
    # The decorator also adds soft_delete(), restore(), and is_deleted property methods
    # Note: CRUD operations added by @crud_enabled decorator:
    #       - Ticket.create(), get_by_id(), get_all(), get_paginated(), etc.

    def __repr__(self):
        return f"<Ticket(id={self.id}, user_id={self.user_id}, type={self.type.value}, status={self.status.value})>"
