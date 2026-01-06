"""
Transaction-related Pydantic schemas for the crypto exchange platform.
Handles request/response serialization for transaction operations.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from uuid import UUID
from decimal import Decimal

from ..enums import TransactionType, TransactionStatus

if TYPE_CHECKING:
    from .user_schemas import UserProfile


# Base schema with common fields
class TransactionBase(BaseModel):
    """Base transaction schema with common fields."""

    type: TransactionType = Field(
        ..., description="Transaction type (fiat_to_crypto or crypto_to_fiat)"
    )
    from_currency: str = Field(
        ..., min_length=3, max_length=10, description="Source currency code"
    )
    to_currency: str = Field(
        ..., min_length=3, max_length=10, description="Target currency code"
    )
    from_amount: Decimal = Field(..., gt=0, description="Amount to convert from")
    to_amount: Decimal = Field(..., gt=0, description="Amount to convert to")
    margin_applied: Decimal = Field(..., description="Margin percentage applied")


# Schema for creating a new transaction
class TransactionCreate(TransactionBase):
    """Schema for creating a new transaction."""

    pass


# Schema for updating transaction
class TransactionUpdate(BaseModel):
    """Schema for updating transaction."""

    status: Optional[TransactionStatus] = None
    manually_overridden: Optional[bool] = None
    p100_status: Optional[str] = None


# Schema for returning transaction data
class Transaction(TransactionBase):
    """Schema for returning transaction data."""

    id: UUID
    user_id: UUID
    status: TransactionStatus
    manually_overridden: bool
    p100_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# Schema for transaction with user info
class TransactionWithUser(Transaction):
    """Schema for transaction with user information."""

    user: "UserProfile"

    model_config = ConfigDict(from_attributes=True)


# Schema for transaction list/pagination
class TransactionList(BaseModel):
    """Schema for transaction list with pagination info."""

    transactions: List[Transaction]
    total: int
    page: int
    limit: int
    total_pages: int


# Schema for transaction statistics
class TransactionStats(BaseModel):
    """Schema for transaction statistics."""

    total_transactions: int
    completed_transactions: int
    pending_transactions: int
    failed_transactions: int
    total_volume: Decimal
    completed_volume: Decimal
