"""
Payment Method-related Pydantic schemas for the crypto exchange platform.
Handles request/response serialization for payment method operations.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from uuid import UUID

from ..enums import PaymentMethodType

if TYPE_CHECKING:
    from .user_schemas import UserProfile


# Base schema with common fields
class PaymentMethodBase(BaseModel):
    """Base payment method schema with common fields."""

    type: PaymentMethodType = Field(
        ..., description="Payment method type (fiat or crypto)"
    )
    currency: str = Field(..., min_length=3, max_length=10, description="Currency code")
    value: str = Field(
        ...,
        min_length=1,
        description="Payment method value (IBAN, wallet address, etc.)",
    )


# Schema for creating a new payment method
class PaymentMethodCreate(PaymentMethodBase):
    """Schema for creating a new payment method."""

    pass


# Schema for updating payment method
class PaymentMethodUpdate(BaseModel):
    """Schema for updating payment method."""

    currency: Optional[str] = Field(None, min_length=3, max_length=10)
    value: Optional[str] = Field(None, min_length=1)


# Schema for returning payment method data
class PaymentMethod(PaymentMethodBase):
    """Schema for returning payment method data."""

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Schema for payment method with user info
class PaymentMethodWithUser(PaymentMethod):
    """Schema for payment method with user information."""

    user: "UserProfile"

    model_config = ConfigDict(from_attributes=True)


# Schema for payment method summary (without sensitive data)
class PaymentMethodSummary(BaseModel):
    """Schema for payment method summary without sensitive data."""

    id: UUID
    type: PaymentMethodType
    currency: str
    value_masked: str = Field(..., description="Masked payment method value")
    created_at: datetime

    def __init__(self, **data):
        # Mask the payment method value for security
        value = data.get("value", "")
        if len(value) > 8:
            data["value_masked"] = value[:4] + "*" * (len(value) - 8) + value[-4:]
        else:
            data["value_masked"] = "*" * len(value)
        super().__init__(**data)

    model_config = ConfigDict(from_attributes=True)


# Schema for payment method list/pagination
class PaymentMethodList(BaseModel):
    """Schema for payment method list with pagination info."""

    payment_methods: List[PaymentMethod]
    total: int
    page: int
    limit: int
    total_pages: int


# Schema for payment method statistics
class PaymentMethodStats(BaseModel):
    """Schema for payment method statistics."""

    total_methods: int
    fiat_methods: int
    crypto_methods: int
    unique_currencies: int
    most_used_currency: Optional[str] = None
