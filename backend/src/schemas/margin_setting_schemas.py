"""
Margin Setting-related Pydantic schemas for the crypto exchange platform.
Handles request/response serialization for margin setting operations.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List
from datetime import datetime
from uuid import UUID
from decimal import Decimal


# Base schema with common fields
class MarginSettingBase(BaseModel):
    """Base margin setting schema with common fields."""

    from_currency: str = Field(
        ..., min_length=3, max_length=10, description="Source currency code"
    )
    to_currency: str = Field(
        ..., min_length=3, max_length=10, description="Target currency code"
    )
    margin_percent: Decimal = Field(
        ..., ge=0, le=100, description="Margin percentage (0-100)"
    )


# Schema for creating a new margin setting
class MarginSettingCreate(MarginSettingBase):
    """Schema for creating a new margin setting."""

    pass


# Schema for updating margin setting
class MarginSettingUpdate(BaseModel):
    """Schema for updating margin setting."""

    margin_percent: Decimal = Field(
        ..., ge=0, le=100, description="New margin percentage"
    )


# Schema for returning margin setting data
class MarginSetting(MarginSettingBase):
    """Schema for returning margin setting data."""

    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Schema for margin setting list/pagination
class MarginSettingList(BaseModel):
    """Schema for margin setting list with pagination info."""

    margin_settings: List[MarginSetting]
    total: int
    page: int
    limit: int
    total_pages: int



# Schema for margin setting statistics
class MarginSettingStats(BaseModel):
    """Schema for margin setting statistics."""

    total_settings: int
    unique_from_currencies: int
    unique_to_currencies: int
    average_margin: Decimal
    highest_margin: Decimal
    lowest_margin: Decimal


# Schema for currency pair lookup
class CurrencyPairMargin(BaseModel):
    """Schema for looking up margin for a specific currency pair."""

    from_currency: str
    to_currency: str
    margin_percent: Decimal
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)
