"""
Unit tests for auth service functionality.
Tests business logic for authentication operations including country handling in registration.
"""

import pytest
from unittest.mock import Mock, patch
from fastapi import HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from src.services.auth_service import register_user, authenticate_user
from src.schemas.user_schemas import UserCreate, UserLogin, UserProfile
from src.models.User import User
from src.enums import UserRole


class TestRegisterUser:
    """Test cases for register_user function."""

    def test_register_user_with_country_success(self):
        """Test successful user registration including country field."""
        # Arrange
        mock_db = Mock(spec=Session)
        mock_background_tasks = Mock(spec=BackgroundTasks)

        user_data = UserCreate(
            email="test@example.com",
            password="testpassword123",
            first_name="John",
            last_name="Doe",
            phone_number="+1234567890",
            country="US",
        )

        mock_created_user = Mock(spec=User)
        mock_created_user.id = "test-user-id"
        mock_created_user.email = "test@example.com"
        mock_created_user.first_name = "John"
        mock_created_user.last_name = "Doe"
        mock_created_user.phone_number = "+1234567890"
        mock_created_user.country = "US"
        mock_created_user.is_verified = False
        mock_created_user.role = UserRole.USER

        with patch("src.services.auth_service.UserRepository") as mock_repo, patch(
            "src.services.auth_service.User"
        ) as mock_user_model, patch(
            "src.services.auth_service.hash_password"
        ) as mock_hash, patch(
            "src.services.auth_service.create_access_token"
        ) as mock_token, patch(
            "src.services.auth_service.send_welcome_email"
        ) as mock_email, patch(
            "src.services.auth_service.UserProfile"
        ) as mock_user_profile:

            # Setup mocks
            mock_repo.find_by_email.return_value = None  # User doesn't exist
            mock_repo.find_by_phone.return_value = None  # Phone not taken
            mock_hash.return_value = "hashed_password"
            mock_user_model.create.return_value = mock_created_user
            mock_token.return_value = "test_token"
            mock_user_profile.model_validate.return_value = Mock()

            # Act
            result = register_user(user_data, mock_db, mock_background_tasks)

            # Assert
            mock_repo.find_by_email.assert_called_once_with(mock_db, "test@example.com")
            mock_repo.find_by_phone.assert_called_once_with(mock_db, "+1234567890")
            mock_hash.assert_called_once_with("testpassword123")

            # Verify User.create was called with correct parameters including country
            mock_user_model.create.assert_called_once_with(
                mock_db,
                email="test@example.com",
                password="hashed_password",
                first_name="John",
                last_name="Doe",
                phone_number="+1234567890",
                country="US",
            )

            mock_token.assert_called_once_with(mock_created_user.id)
            mock_email.assert_called_once_with(mock_created_user, mock_background_tasks)

            assert result["access_token"] == "test_token"
            assert "user" in result

    def test_register_user_without_phone_with_country(self):
        """Test user registration with country but without phone number."""
        # Arrange
        mock_db = Mock(spec=Session)

        user_data = UserCreate(
            email="test@example.com",
            password="testpassword123",
            first_name="John",
            last_name="Doe",
            phone_number=None,  # No phone number
            country="CA",
        )

        mock_created_user = Mock(spec=User)
        mock_created_user.id = "test-user-id"
        mock_created_user.country = "CA"

        with patch("src.services.auth_service.UserRepository") as mock_repo, patch(
            "src.services.auth_service.User"
        ) as mock_user_model, patch(
            "src.services.auth_service.hash_password"
        ) as mock_hash, patch(
            "src.services.auth_service.create_access_token"
        ) as mock_token, patch(
            "src.services.auth_service.UserProfile"
        ) as mock_user_profile:

            mock_repo.find_by_email.return_value = None
            mock_hash.return_value = "hashed_password"
            mock_user_model.create.return_value = mock_created_user
            mock_token.return_value = "test_token"
            mock_user_profile.model_validate.return_value = Mock()

            # Act
            result = register_user(user_data, mock_db)

            # Assert
            # Should not check phone availability when phone is None
            mock_repo.find_by_phone.assert_not_called()

            # Verify User.create was called with country and None phone
            mock_user_model.create.assert_called_once_with(
                mock_db,
                email="test@example.com",
                password="hashed_password",
                first_name="John",
                last_name="Doe",
                phone_number=None,
                country="CA",
            )

    def test_register_user_empty_phone_with_country(self):
        """Test user registration with country and empty phone number."""
        # Arrange
        mock_db = Mock(spec=Session)

        user_data = UserCreate(
            email="test@example.com",
            password="testpassword123",
            first_name="John",
            last_name="Doe",
            phone_number="   ",  # Empty/whitespace phone
            country="GB",
        )

        mock_created_user = Mock(spec=User)
        mock_created_user.id = "test-user-id"
        mock_created_user.country = "GB"

        with patch("src.services.auth_service.UserRepository") as mock_repo, patch(
            "src.services.auth_service.User"
        ) as mock_user_model, patch(
            "src.services.auth_service.hash_password"
        ) as mock_hash, patch(
            "src.services.auth_service.create_access_token"
        ) as mock_token, patch(
            "src.services.auth_service.UserProfile"
        ) as mock_user_profile:

            mock_repo.find_by_email.return_value = None
            mock_hash.return_value = "hashed_password"
            mock_user_model.create.return_value = mock_created_user
            mock_token.return_value = "test_token"
            mock_user_profile.model_validate.return_value = Mock()

            # Act
            result = register_user(user_data, mock_db)

            # Assert
            # Should not check phone availability when phone is empty
            mock_repo.find_by_phone.assert_not_called()

            # Verify User.create was called with country and None phone
            mock_user_model.create.assert_called_once_with(
                mock_db,
                email="test@example.com",
                password="hashed_password",
                first_name="John",
                last_name="Doe",
                phone_number=None,  # Empty phone should become None
                country="GB",
            )

    def test_register_user_email_already_exists(self):
        """Test registration with existing email."""
        # Arrange
        mock_db = Mock(spec=Session)

        user_data = UserCreate(
            email="existing@example.com",
            password="testpassword123",
            first_name="John",
            last_name="Doe",
            country="US",
        )

        mock_existing_user = Mock(spec=User)

        with patch("src.services.auth_service.UserRepository") as mock_repo:
            mock_repo.find_by_email.return_value = mock_existing_user

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                register_user(user_data, mock_db)

            assert exc_info.value.status_code == 400
            assert "already registered" in str(exc_info.value.detail).lower()

    def test_register_user_phone_already_exists(self):
        """Test registration with existing phone number."""
        # Arrange
        mock_db = Mock(spec=Session)

        user_data = UserCreate(
            email="test@example.com",
            password="testpassword123",
            first_name="John",
            last_name="Doe",
            phone_number="+1234567890",
            country="US",
        )

        mock_existing_user = Mock(spec=User)

        with patch("src.services.auth_service.UserRepository") as mock_repo:
            mock_repo.find_by_email.return_value = None  # Email is available
            mock_repo.find_by_phone.return_value = mock_existing_user  # Phone taken

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                register_user(user_data, mock_db)

            assert exc_info.value.status_code == 400
            assert "phone" in str(exc_info.value.detail).lower()


class TestAuthenticateUser:
    """Test cases for authenticate_user function."""

    def test_authenticate_user_success(self):
        """Test successful user authentication."""
        # Arrange
        mock_db = Mock(spec=Session)

        login_data = UserLogin(email="test@example.com", password="testpassword123")

        mock_user = Mock(spec=User)
        mock_user.id = "test-user-id"
        mock_user.email = "test@example.com"
        mock_user.password = "hashed_password"
        mock_user.is_deleted = False
        mock_user.is_verified = True
        mock_user.country = "US"

        with patch("src.services.auth_service.UserRepository") as mock_repo, patch(
            "src.services.auth_service.verify_password"
        ) as mock_verify, patch(
            "src.services.auth_service.check_user_active"
        ) as mock_check, patch(
            "src.services.auth_service.create_access_token"
        ) as mock_token, patch(
            "src.services.auth_service.UserProfile"
        ) as mock_user_profile:

            mock_repo.find_by_email.return_value = mock_user
            mock_verify.return_value = True
            mock_token.return_value = "test_token"
            mock_user_profile.model_validate.return_value = Mock()

            # Act
            result = authenticate_user(login_data, mock_db)

            # Assert
            mock_repo.find_by_email.assert_called_once_with(mock_db, "test@example.com")
            mock_verify.assert_called_once_with("testpassword123", "hashed_password")
            mock_check.assert_called_once_with(mock_user)
            mock_token.assert_called_once_with(mock_user.id)

            assert result["access_token"] == "test_token"
            assert "user" in result

    def test_authenticate_user_not_found(self):
        """Test authentication with non-existent user."""
        # Arrange
        mock_db = Mock(spec=Session)

        login_data = UserLogin(
            email="nonexistent@example.com", password="testpassword123"
        )

        with patch("src.services.auth_service.UserRepository") as mock_repo:
            mock_repo.find_by_email.return_value = None

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                authenticate_user(login_data, mock_db)

            assert exc_info.value.status_code == 401
            assert "not found" in str(exc_info.value.detail).lower()

    def test_authenticate_user_wrong_password(self):
        """Test authentication with wrong password."""
        # Arrange
        mock_db = Mock(spec=Session)

        login_data = UserLogin(email="test@example.com", password="wrongpassword")

        mock_user = Mock(spec=User)
        mock_user.password = "hashed_password"

        with patch("src.services.auth_service.UserRepository") as mock_repo, patch(
            "src.services.auth_service.verify_password"
        ) as mock_verify:

            mock_repo.find_by_email.return_value = mock_user
            mock_verify.return_value = False  # Wrong password

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                authenticate_user(login_data, mock_db)

            assert exc_info.value.status_code == 401
            assert "credentials" in str(exc_info.value.detail).lower()


class TestCountryIntegration:
    """Test cases for country field integration in auth operations."""

    def test_registration_preserves_country_case(self):
        """Test that country codes are properly handled during registration."""
        # This test ensures that the country validation from Pydantic schemas
        # works correctly with the auth service

        # Arrange
        mock_db = Mock(spec=Session)

        user_data = UserCreate(
            email="test@example.com",
            password="testpassword123",
            first_name="John",
            last_name="Doe",
            country="us",  # lowercase - should be normalized to "US"
        )

        mock_created_user = Mock(spec=User)
        mock_created_user.id = "test-user-id"
        mock_created_user.country = "US"  # Should be normalized

        with patch("src.services.auth_service.UserRepository") as mock_repo, patch(
            "src.services.auth_service.User"
        ) as mock_user_model, patch(
            "src.services.auth_service.hash_password"
        ) as mock_hash, patch(
            "src.services.auth_service.create_access_token"
        ) as mock_token, patch(
            "src.services.auth_service.UserProfile"
        ) as mock_user_profile:

            mock_repo.find_by_email.return_value = None
            mock_hash.return_value = "hashed_password"
            mock_user_model.create.return_value = mock_created_user
            mock_token.return_value = "test_token"
            mock_user_profile.model_validate.return_value = Mock()

            # Act
            result = register_user(user_data, mock_db)

            # Assert
            # The country should be normalized to uppercase by Pydantic validation
            create_call_args = mock_user_model.create.call_args
            assert create_call_args[1]["country"] == "US"  # Should be normalized

    def test_registration_with_various_countries(self):
        """Test registration with different valid country codes."""
        # Arrange
        mock_db = Mock(spec=Session)

        countries_to_test = ["US", "CA", "GB", "DE", "FR", "JP", "AU"]

        for country in countries_to_test:
            user_data = UserCreate(
                email=f"test-{country.lower()}@example.com",
                password="testpassword123",
                first_name="John",
                last_name="Doe",
                country=country,
            )

            mock_created_user = Mock(spec=User)
            mock_created_user.id = f"test-user-{country}"
            mock_created_user.country = country

            with patch("src.services.auth_service.UserRepository") as mock_repo, patch(
                "src.services.auth_service.User"
            ) as mock_user_model, patch(
                "src.services.auth_service.hash_password"
            ) as mock_hash, patch(
                "src.services.auth_service.create_access_token"
            ) as mock_token, patch(
                "src.services.auth_service.UserProfile"
            ) as mock_user_profile:

                mock_repo.find_by_email.return_value = None
                mock_hash.return_value = "hashed_password"
                mock_user_model.create.return_value = mock_created_user
                mock_token.return_value = "test_token"
                mock_user_profile.model_validate.return_value = Mock()

                # Act
                result = register_user(user_data, mock_db)

                # Assert
                create_call_args = mock_user_model.create.call_args
                assert create_call_args[1]["country"] == country
                assert result["access_token"] == "test_token"
