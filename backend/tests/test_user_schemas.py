"""
Tests for user Pydantic schemas with country field validation.
"""

import pytest
from pydantic import ValidationError
from uuid import uuid4
from datetime import datetime

from src.schemas.user_schemas import (
    UserBase,
    UserCreate,
    UserUpdate,
    User,
    UserProfile,
)
from src.enums import UserRole


class TestUserSchemas:
    """Test user schemas with country field validation."""

    def test_user_base_valid_country(self):
        """Test UserBase with valid country codes."""
        valid_data = {
            "email": "test@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "phone_number": "+1234567890",
            "country": "US",
        }

        user = UserBase(**valid_data)
        assert user.country == "US"
        assert user.email == "test@example.com"

    def test_user_base_invalid_country(self):
        """Test UserBase with invalid country codes."""
        invalid_data = {
            "email": "test@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "phone_number": "+1234567890",
            "country": "XX",  # XX is not a valid ISO country code
        }

        with pytest.raises(ValidationError) as exc_info:
            UserBase(**invalid_data)

        assert "Invalid country code" in str(exc_info.value)

    def test_user_base_lowercase_country(self):
        """Test UserBase normalizes lowercase country codes."""
        valid_data = {
            "email": "test@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "phone_number": "+1234567890",
            "country": "ca",  # lowercase
        }

        user = UserBase(**valid_data)
        assert user.country == "CA"  # should be normalized to uppercase

    def test_user_base_missing_country(self):
        """Test UserBase requires country field."""
        invalid_data = {
            "email": "test@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "phone_number": "+1234567890",
            # missing country
        }

        with pytest.raises(ValidationError) as exc_info:
            UserBase(**invalid_data)

        assert "country" in str(exc_info.value)

    def test_user_create_with_country(self):
        """Test UserCreate schema includes country validation."""
        valid_data = {
            "email": "test@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "phone_number": "+1234567890",
            "country": "GB",
            "password": "password123",
        }

        user = UserCreate(**valid_data)
        assert user.country == "GB"
        assert user.password == "password123"

    def test_user_update_optional_country(self):
        """Test UserUpdate schema with optional country field."""
        # Test with country
        update_data = {
            "first_name": "Jane",
            "country": "FR",
        }

        user_update = UserUpdate(**update_data)
        assert user_update.country == "FR"
        assert user_update.first_name == "Jane"

        # Test without country
        update_data_no_country = {
            "first_name": "Jane",
        }

        user_update_no_country = UserUpdate(**update_data_no_country)
        assert user_update_no_country.country is None
        assert user_update_no_country.first_name == "Jane"

    def test_user_update_invalid_country(self):
        """Test UserUpdate validation with invalid country."""
        invalid_data = {
            "first_name": "Jane",
            "country": "XX",  # invalid country code
        }

        with pytest.raises(ValidationError) as exc_info:
            UserUpdate(**invalid_data)

        assert "Invalid country code" in str(exc_info.value)

    def test_user_schema_with_country(self):
        """Test User schema includes country field."""
        user_data = {
            "id": uuid4(),
            "email": "test@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "phone_number": "+1234567890",
            "country": "DE",
            "is_verified": True,
            "role": UserRole.USER,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        }

        user = User(**user_data)
        assert user.country == "DE"
        assert user.role == UserRole.USER

    def test_user_profile_with_country(self):
        """Test UserProfile schema includes country field."""
        profile_data = {
            "id": uuid4(),
            "email": "test@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "is_verified": True,
            "role": UserRole.USER,
            "country": "JP",
        }

        profile = UserProfile(**profile_data)
        assert profile.country == "JP"
        assert profile.email == "test@example.com"

    def test_user_profile_invalid_country(self):
        """Test UserProfile validation with invalid country."""
        invalid_profile_data = {
            "id": uuid4(),
            "email": "test@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "is_verified": True,
            "role": UserRole.USER,
            "country": "XX",  # invalid country code
        }

        with pytest.raises(ValidationError) as exc_info:
            UserProfile(**invalid_profile_data)

        assert "Invalid country code" in str(exc_info.value)

    def test_various_valid_country_codes(self):
        """Test various valid country codes across different schemas."""
        valid_countries = ["US", "CA", "GB", "DE", "FR", "JP", "AU", "BR", "IN", "CN"]

        for country in valid_countries:
            # Test UserBase
            user_base_data = {
                "email": "test@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "country": country,
            }
            user_base = UserBase(**user_base_data)
            assert user_base.country == country

            # Test UserUpdate
            user_update_data = {"country": country}
            user_update = UserUpdate(**user_update_data)
            assert user_update.country == country

    def test_country_field_documentation(self):
        """Test that country field has proper documentation."""
        # Check that the field has description
        user_base_fields = UserBase.model_fields
        country_field = user_base_fields["country"]

        assert country_field.description is not None
        assert "ISO 3166-1 alpha-2" in country_field.description
        assert country_field.annotation == str

        # Check that field has metadata (constraints in Pydantic v2)
        assert hasattr(country_field, "metadata")
        assert len(country_field.metadata) > 0
