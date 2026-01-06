"""
Ticket-related Pydantic schemas for the crypto exchange platform.
Handles request/response serialization for support ticket operations.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from uuid import UUID

from ..enums import TicketType, TicketStatus

if TYPE_CHECKING:
    from .user_schemas import UserProfile
    from .transaction_schemas import Transaction


# Base schema with common fields
class TicketBase(BaseModel):
    """Base ticket schema with common fields."""

    subject: str = Field(
        ..., min_length=5, max_length=200, description="Ticket subject"
    )
    type: TicketType = Field(..., description="Ticket type (order or support)")


# Schema for creating a new ticket
class TicketCreate(TicketBase):
    """Schema for creating a new ticket."""

    transaction_id: Optional[UUID] = Field(
        None, description="Associated transaction ID (for order tickets)"
    )


# Schema for updating ticket
class TicketUpdate(BaseModel):
    """Schema for updating ticket."""

    subject: Optional[str] = Field(None, min_length=5, max_length=200)
    status: Optional[TicketStatus] = None


# Schema for returning ticket data
class Ticket(TicketBase):
    """Schema for returning ticket data."""

    id: UUID
    user_id: UUID
    transaction_id: Optional[UUID] = None
    status: TicketStatus
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# Schema for ticket with user info
class TicketWithUser(Ticket):
    """Schema for ticket with user information."""

    user: "UserProfile"

    model_config = ConfigDict(from_attributes=True)


# Schema for ticket with transaction info
class TicketWithTransaction(Ticket):
    """Schema for ticket with transaction information."""

    transaction: Optional["Transaction"] = None

    model_config = ConfigDict(from_attributes=True)


# Schema for ticket list/pagination
class TicketList(BaseModel):
    """Schema for ticket list with pagination info."""

    tickets: List[Ticket]
    total: int
    page: int
    limit: int
    total_pages: int


# Schema for ticket statistics
class TicketStats(BaseModel):
    """Schema for ticket statistics."""

    total_tickets: int
    pending_tickets: int
    resolved_tickets: int
    order_tickets: int
    support_tickets: int


# Alias for backward compatibility
TicketSummary = TicketStats
