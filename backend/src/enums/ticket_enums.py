"""
Ticket and support system related enumeration types.
"""

import enum


class TicketType(enum.Enum):
    """Ticket type for support system categorization."""

    ORDER = "order"
    SUPPORT = "support"


class TicketStatus(enum.Enum):
    """Ticket status for tracking support ticket lifecycle."""

    RESOLVED = "resolved"
    PENDING = "pending"


class SenderRole(enum.Enum):
    """Sender role for ticket messages to identify message sender type."""

    ADMIN = "admin"
    USER = "user"
