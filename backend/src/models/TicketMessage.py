"""
Ticket Message model for the crypto exchange platform.
Stores individual messages within support tickets for conversation tracking.
"""

from sqlalchemy import Column, String, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from ..db.base import Base
from ..utils import creation_tracked, crud_enabled
from ..enums import SenderRole


@crud_enabled
@creation_tracked
class TicketMessage(Base):
    """
    Ticket Message model for support conversation tracking.

    Stores individual messages within support tickets including sender
    information and role identification. Messages are immutable once created
    to maintain conversation integrity and audit trail.
    """

    __tablename__ = "ticket_messages"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign key to Ticket
    ticket_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Foreign key to User (sender)
    sender_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Message details
    sender_role = Column(Enum(SenderRole), nullable=False)
    message = Column(Text, nullable=False)

    # Relationships
    ticket = relationship("Ticket", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages")

    # Note: created_at is automatically added by @creation_tracked
    # Messages are immutable once sent, so no updated_at needed
    # Note: CRUD operations added by @crud_enabled decorator:
    #       - TicketMessage.create(), get_by_id(), get_all(), get_paginated(), etc.

    def __repr__(self):
        return f"<TicketMessage(id={self.id}, ticket_id={self.ticket_id}, sender_role={self.sender_role.value})>"
