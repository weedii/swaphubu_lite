"""
User-related Pydantic schemas for the crypto exchange platform.
Handles request/response serialization for user operations.
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID
import re


from ..utils import validate_phone_number_field, validate_country_code


# Base schema with common fields
class UserBase(BaseModel):
    """Base user schema with common fields."""

    email: EmailStr = Field(..., description="User's email address")
    first_name: str = Field(
        ..., min_length=1, max_length=100, description="User's first name"
    )
    last_name: str = Field(
        ..., min_length=1, max_length=100, description="User's last name"
    )
    phone_number: Optional[str] = Field(
        None, description="User's phone number (E.164 format recommended)"
    )
    country: str = Field(
        ...,
        min_length=2,
        max_length=2,
        description="User's country (ISO 3166-1 alpha-2 country code, e.g., 'US', 'CA', 'GB')",
    )

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v):
        return validate_phone_number_field(v)

    @field_validator("country")
    @classmethod
    def validate_country(cls, v):
        """Validate country code using ISO 3166-1 alpha-2 standard."""
        return validate_country_code(v)


# Schema for creating a new user
class UserCreate(UserBase):
    """Schema for creating a new user.

    Note: is_admin field is not included and defaults to False in the database.
    Only admins can set is_admin=True through UserUpdate schema.
    """

    # password: str = Field(
    #     ..., min_length=8, description="User's password (min 8 characters)"
    # )
    password: str = Field(
        ..., min_length=1, description="User's password (min 1 characters)"
    )


# Schema for updating user information
class UserUpdate(BaseModel):
    """Schema for updating user information."""

    email: Optional[EmailStr] = Field(None, description="User's email address")
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone_number: Optional[str] = None
    country: Optional[str] = Field(
        None,
        min_length=2,
        max_length=2,
        description="User's country (ISO 3166-1 alpha-2 country code, e.g., 'US', 'CA', 'GB')",
    )
    is_verified: Optional[bool] = Field(None, description="User verification status")
    is_admin: Optional[bool] = Field(
        None, description="Admin privileges flag (admin-only update)"
    )

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v):
        return validate_phone_number_field(v)

    @field_validator("country")
    @classmethod
    def validate_country(cls, v):
        """Validate country code using ISO 3166-1 alpha-2 standard."""
        if v is None:
            return v
        return validate_country_code(v)

    @field_validator("is_admin")
    @classmethod
    def validate_is_admin(cls, v):
        """Validate is_admin field - must be explicitly True or False if provided."""
        if v is not None and not isinstance(v, bool):
            raise ValueError("is_admin must be a boolean value")
        return v


# Schema for changing password
class UserPasswordChange(BaseModel):
    """Schema for changing user password."""

    current_password: str = Field(..., description="Current password for verification")
    new_password: str = Field(
        ..., min_length=8, description="New password (min 8 characters)"
    )
    confirm_password: str = Field(..., description="Confirm new password")


# Schema for forgot password request
class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request."""

    email: EmailStr = Field(..., description="Email address to send reset link to")


# Schema for reset code verification
class ResetCodeVerification(BaseModel):
    """Schema for verifying reset code."""

    email: EmailStr = Field(..., description="Email address associated with reset code")
    code: str = Field(..., min_length=6, max_length=6, description="6-digit reset code")


# Schema for password reset (after code verification)
class PasswordResetRequest(BaseModel):
    """Schema for password reset after code verification."""

    email: EmailStr = Field(..., description="Email address for password reset")
    new_password: str = Field(
        ..., min_length=8, description="New password (min 8 characters)"
    )
    confirm_password: str = Field(..., description="Confirm new password")


# Schema for user login
class UserLogin(BaseModel):
    """Schema for user login."""

    email: EmailStr
    password: str


# Schema for returning user data (excludes password)
class User(UserBase):
    """Schema for returning user data."""

    id: UUID
    is_verified: bool = Field(..., description="User email verification status")
    is_admin: bool = Field(..., description="Admin privileges flag")
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    # Override country to be optional for admins
    country: Optional[str] = Field(
        None,
        description="User's country (ISO 3166-1 alpha-2 country code, null for admins)",
    )

    @field_validator("country")
    @classmethod
    def validate_country(cls, v):
        """Validate country code using ISO 3166-1 alpha-2 standard, allowing None."""
        if v is None:
            return v
        return validate_country_code(v)

    model_config = ConfigDict(from_attributes=True)


# Schema for user profile
class UserProfile(BaseModel):
    """Schema for user profile with minimal information."""

    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    is_verified: bool = Field(..., description="User email verification status")
    is_admin: bool = Field(..., description="Admin privileges flag")
    country: Optional[str] = Field(
        None,
        description="User's country (ISO 3166-1 alpha-2 country code, null for admins)",
    )

    @field_validator("country")
    @classmethod
    def validate_country(cls, v):
        """Validate country code using ISO 3166-1 alpha-2 standard."""
        if v is None:
            return v
        return validate_country_code(v)

    model_config = ConfigDict(from_attributes=True)


# Schema for user list/pagination
class UserList(BaseModel):
    """Schema for user list with pagination info."""

    users: List[User]
    total: int
    page: int
    limit: int
    total_pages: int


# Schema for authentication token response
class TokenResponse(BaseModel):
    """Schema for authentication token response."""

    access_token: str
    token_type: str = "bearer"
    user: UserProfile
