"""
Ticket Message-related Pydantic schemas for the crypto exchange platform.
Handles request/response serialization for ticket message operations.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, TYPE_CHECKING
from datetime import datetime
from uuid import UUID

from ..enums import SenderRole

if TYPE_CHECKING:
    from .user_schemas import UserProfile


# Base schema with common fields
class TicketMessageBase(BaseModel):
    """Base ticket message schema with common fields."""

    message: str = Field(
        ..., min_length=1, max_length=5000, description="Message content"
    )


# Schema for creating a new ticket message
class TicketMessageCreate(TicketMessageBase):
    """Schema for creating a new ticket message."""

    ticket_id: UUID = Field(..., description="Associated ticket ID")
    sender_role: SenderRole = Field(..., description="Role of the message sender")


# Schema for returning ticket message data
class TicketMessage(TicketMessageBase):
    """Schema for returning ticket message data."""

    id: UUID
    ticket_id: UUID
    sender_id: UUID
    sender_role: SenderRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Schema for ticket message with sender info
class TicketMessageWithSender(TicketMessage):
    """Schema for ticket message with sender information."""

    sender: "UserProfile"

    model_config = ConfigDict(from_attributes=True)


# Schema for ticket message summary
class TicketMessageSummary(BaseModel):
    """Schema for ticket message summary."""

    id: UUID
    sender_role: SenderRole
    message_preview: str = Field(..., description="First 100 characters of the message")
    created_at: datetime

    def __init__(self, **data):
        if "message" in data and len(data["message"]) > 100:
            data["message_preview"] = data["message"][:100] + "..."
        else:
            data["message_preview"] = data.get("message", "")
        super().__init__(**data)

    model_config = ConfigDict(from_attributes=True)


# Schema for ticket conversation (list of messages)
class TicketConversation(BaseModel):
    """Schema for ticket conversation with all messages."""

    ticket_id: UUID
    messages: List[TicketMessage]
    total_messages: int

    model_config = ConfigDict(from_attributes=True)


# Schema for ticket message list/pagination
class TicketMessageList(BaseModel):
    """Schema for ticket message list with pagination info."""

    messages: List[TicketMessage]
    total: int
    page: int
    limit: int
    total_pages: int
