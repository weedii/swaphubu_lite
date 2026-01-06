"""
KYC Verification schemas for the SwapHubu platform.
Simple and secure schemas for KYC verification with Shufti Pro.
"""

from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
import re


# Basic KYC verification schema (used by existing system)
class KYCVerification(BaseModel):
    """Schema for KYC verification data."""

    id: UUID
    user_id: UUID
    status: str
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Simple and secure KYC request schema
class KYCRequest(BaseModel):
    """Secure schema for KYC request."""

    first_name: str = Field(
        ..., min_length=1, max_length=50, description="User's first name"
    )
    last_name: str = Field(
        ..., min_length=1, max_length=50, description="User's last name"
    )
    email: EmailStr = Field(..., description="User's email address")
    country: str = Field(
        default="US",
        min_length=2,
        max_length=2,
        description="ISO 2-letter country code",
    )

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_names(cls, v: str) -> str:
        """Validate name fields - only letters, spaces, hyphens, apostrophes."""
        if not re.match(r"^[a-zA-Z\s\-']+$", v):
            raise ValueError(
                "Name can only contain letters, spaces, hyphens, and apostrophes"
            )
        return v.strip()

    @field_validator("country")
    @classmethod
    def validate_country(cls, v: str) -> str:
        """Validate country code format and support."""
        from ..config.kyc_config import get_kyc_config

        country_code = v.upper()

        config = get_kyc_config()
        if country_code not in config.supported_countries:
            supported = ", ".join(config.supported_countries)
            raise ValueError(
                f"Country {country_code} is not supported for KYC verification. "
                f"Supported countries: {supported}"
            )

        return country_code


# Simple response schema
class KYCStartResponse(BaseModel):
    """Response schema for starting KYC verification."""

    verification_id: str
    reference: str
    verification_url: Optional[str] = None
    message: str = "KYC verification initiated successfully"


# Simple status response schema
class KYCStatusResponse(BaseModel):
    """Response schema for KYC status check."""

    verification_id: str
    status: str  # initiated, pending, verified, declined, cancelled, error
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    is_completed: bool
    verification_url: Optional[str] = None
    decline_reasons: Optional[List[str]] = None
    verification_details: Optional[Dict[str, Any]] = None
    message: Optional[str] = None


class KYCHealthResponse(BaseModel):
    """Response schema for KYC health check."""

    status: str
    environment: Optional[str] = None
    timestamp: str
    error: Optional[str] = None


class KYCWebhookResponse(BaseModel):
    """Response schema for webhook processing."""

    message: str
    status: str = "success"


# Simple schema for user ID input
class KYCUserRequest(BaseModel):
    """Simple schema for KYC request with just user ID."""

    user_id: str = Field(..., description="User's ID for KYC verification")
