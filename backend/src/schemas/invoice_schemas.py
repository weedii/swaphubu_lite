"""
Invoice-related Pydantic schemas for the crypto exchange platform.
Handles request/response serialization for invoice operations.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# Base schema with common fields
class InvoiceBase(BaseModel):
    """Base invoice schema with common fields."""

    iban: Optional[str] = Field(None, description="IBAN for fiat payments")
    wallet_address: Optional[str] = Field(
        None, description="Wallet address for crypto payments"
    )
    reference_code: str = Field(
        ..., min_length=3, description="Unique reference code for payment tracking"
    )


# Schema for creating a new invoice
class InvoiceCreate(InvoiceBase):
    """Schema for creating a new invoice."""

    transaction_id: UUID = Field(..., description="Associated transaction ID")
    file_url: Optional[str] = Field(None, description="URL to access the invoice file")
    file_storage_id: Optional[str] = Field(None, description="Storage provider ID/key")
    file_size: Optional[int] = Field(None, ge=0, description="File size in bytes")
    file_type: Optional[str] = Field(None, description="MIME type of the file")


# Schema for updating invoice
class InvoiceUpdate(BaseModel):
    """Schema for updating invoice file information."""

    file_url: Optional[str] = None
    file_storage_id: Optional[str] = None
    file_size: Optional[int] = Field(None, ge=0)
    file_type: Optional[str] = None


# Schema for returning invoice data
class Invoice(InvoiceBase):
    """Schema for returning invoice data."""

    transaction_id: UUID
    file_url: Optional[str] = None
    file_storage_id: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Schema for invoice list/pagination
class InvoiceList(BaseModel):
    """Schema for invoice list with pagination info."""

    invoices: List[Invoice]
    total: int
    page: int
    limit: int
    total_pages: int
