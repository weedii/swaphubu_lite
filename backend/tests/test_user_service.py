"""
Unit tests for UserService functionality.
Tests business logic for regular user operations including authorization and country handling.
"""

import pytest
from unittest.mock import Mock, patch
from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.services.user_service import UserService
from src.schemas.user_schemas import UserUpdate, UserProfile
from src.models.User import User


class TestUpdateUserProfile:
    """Test cases for UserService.update_user_profile method."""

    def test_update_user_profile_with_country_success(self):
        """Test successful user profile update including country field."""
        # Arrange
        user_id = "test-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (same as target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = False

        # Mock existing user
        mock_user = Mock(spec=User)
        mock_user.id = user_id
        mock_user.email = "test@example.com"
        mock_user.is_deleted = False
        mock_user.is_verified = True

        # Mock updated user
        mock_updated_user = Mock(spec=User)
        mock_updated_user.id = user_id
        mock_updated_user.email = "newemail@example.com"
        mock_updated_user.first_name = "John"
        mock_updated_user.last_name = "Doe"
        mock_updated_user.phone_number = "+1234567890"
        mock_updated_user.country = "US"
        mock_updated_user.is_verified = True
        mock_updated_user.is_admin = False

        # Create update data with country
        user_data = UserUpdate(
            email="newemail@example.com",
            first_name="John",
            last_name="Doe",
            phone_number="+1234567890",
            country="US",
        )

        with patch("src.services.user_service.User") as mock_user_model, patch(
            "src.services.user_service.check_user_active"
        ) as mock_check_active, patch(
            "src.services.user_service.validate_update_conflicts"
        ) as mock_validate, patch(
            "src.services.user_service.UserRepository"
        ) as mock_repo, patch(
            "src.services.user_service.UserProfile"
        ) as mock_user_profile:

            # Setup mocks
            mock_user_model.get_by_id.return_value = mock_user
            mock_repo.update_user_data.return_value = mock_updated_user
            mock_user_profile.model_validate.return_value = Mock()

            # Act
            result = UserService.update_user_profile(
                user_id, user_data, mock_current_user, mock_db
            )

            # Assert
            mock_user_model.get_by_id.assert_called_once_with(mock_db, user_id)
            mock_check_active.assert_called_once_with(mock_user)
            mock_validate.assert_called_once_with(
                mock_db, user_id, "newemail@example.com", "+1234567890"
            )

            # Verify UserRepository.update_user_data was called
            mock_repo.update_user_data.assert_called_once()
            update_call_args = mock_repo.update_user_data.call_args
            update_data = update_call_args[0][2]  # Third argument is the update data

            assert update_data["email"] == "newemail@example.com"
            assert update_data["first_name"] == "John"
            assert update_data["last_name"] == "Doe"
            assert update_data["phone_number"] == "+1234567890"
            assert update_data["country"] == "US"

            assert result["message"] == "Profile updated successfully"

    def test_update_user_profile_country_only(self):
        """Test updating only the country field."""
        # Arrange
        user_id = "test-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (same as target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id
        mock_user.is_deleted = False
        mock_user.is_verified = True

        mock_updated_user = Mock(spec=User)
        mock_updated_user.country = "CA"

        # Create update data with only country
        user_data = UserUpdate(country="CA")

        with patch("src.services.user_service.User") as mock_user_model, patch(
            "src.services.user_service.check_user_active"
        ), patch("src.services.user_service.validate_update_conflicts"), patch(
            "src.services.user_service.UserRepository"
        ) as mock_repo, patch(
            "src.services.user_service.UserProfile"
        ) as mock_user_profile:

            mock_user_model.get_by_id.return_value = mock_user
            mock_repo.update_user_data.return_value = mock_updated_user
            mock_user_profile.model_validate.return_value = Mock()

            # Act
            result = UserService.update_user_profile(
                user_id, user_data, mock_current_user, mock_db
            )

            # Assert
            update_call_args = mock_repo.update_user_data.call_args
            update_data = update_call_args[0][2]

            # Should only contain country field
            assert "country" in update_data
            assert update_data["country"] == "CA"
            assert len(update_data) == 1  # Only country field should be present

    def test_update_user_profile_user_not_found(self):
        """Test update when user doesn't exist."""
        # Arrange
        user_id = "nonexistent-user"
        mock_db = Mock(spec=Session)
        user_data = UserUpdate(country="US")

        # Mock current user
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = False

        with patch("src.services.user_service.User") as mock_user_model:
            mock_user_model.get_by_id.return_value = None

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                UserService.update_user_profile(
                    user_id, user_data, mock_current_user, mock_db
                )

            assert exc_info.value.status_code == 404
            assert "User not found" in str(exc_info.value.detail)

    def test_update_user_profile_validation_conflict(self):
        """Test update with validation conflicts."""
        # Arrange
        user_id = "test-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (same as target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id
        mock_user.is_deleted = False
        mock_user.is_verified = True

        user_data = UserUpdate(email="existing@example.com", country="US")

        with patch("src.services.user_service.User") as mock_user_model, patch(
            "src.services.user_service.check_user_active"
        ), patch(
            "src.services.user_service.validate_update_conflicts"
        ) as mock_validate:

            mock_user_model.get_by_id.return_value = mock_user
            mock_validate.side_effect = ValueError("Email already exists")

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                UserService.update_user_profile(
                    user_id, user_data, mock_current_user, mock_db
                )

            assert exc_info.value.status_code == 400
            assert "Email already exists" in str(exc_info.value.detail)

    def test_update_user_profile_partial_update(self):
        """Test partial update with some fields including country."""
        # Arrange
        user_id = "test-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (same as target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id
        mock_user.is_deleted = False
        mock_user.is_verified = True

        mock_updated_user = Mock(spec=User)

        # Update only first name and country
        user_data = UserUpdate(first_name="Jane", country="GB")

        with patch("src.services.user_service.User") as mock_user_model, patch(
            "src.services.user_service.check_user_active"
        ), patch("src.services.user_service.validate_update_conflicts"), patch(
            "src.services.user_service.UserRepository"
        ) as mock_repo, patch(
            "src.services.user_service.UserProfile"
        ) as mock_user_profile:

            mock_user_model.get_by_id.return_value = mock_user
            mock_repo.update_user_data.return_value = mock_updated_user
            mock_user_profile.model_validate.return_value = Mock()

            # Act
            result = UserService.update_user_profile(
                user_id, user_data, mock_current_user, mock_db
            )

            # Assert
            update_call_args = mock_repo.update_user_data.call_args
            update_data = update_call_args[0][2]

            assert "first_name" in update_data
            assert update_data["first_name"] == "Jane"
            assert "country" in update_data
            assert update_data["country"] == "GB"
            assert len(update_data) == 2  # Only first_name and country

    def test_update_user_profile_unauthorized_different_user(self):
        """Test that regular users cannot update other users' profiles."""
        # Arrange
        user_id = "target-user-id"
        current_user_id = "current-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (different from target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = current_user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id

        user_data = UserUpdate(first_name="Jane")

        with patch("src.services.user_service.User") as mock_user_model:
            mock_user_model.get_by_id.return_value = mock_user

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                UserService.update_user_profile(
                    user_id, user_data, mock_current_user, mock_db
                )

            assert exc_info.value.status_code == 403
            assert "You can only update your own profile" in str(exc_info.value.detail)

    def test_update_user_profile_admin_field_blocked_for_regular_user(self):
        """Test that regular users cannot update admin-specific fields."""
        # Arrange
        user_id = "test-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (same as target user, but not admin)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id
        mock_user.is_deleted = False
        mock_user.is_verified = True

        # Try to update admin-only field
        user_data = UserUpdate(is_verified=True)

        with patch("src.services.user_service.User") as mock_user_model, patch(
            "src.services.user_service.check_user_active"
        ):
            mock_user_model.get_by_id.return_value = mock_user

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                UserService.update_user_profile(
                    user_id, user_data, mock_current_user, mock_db
                )

            assert exc_info.value.status_code == 403
            assert "Only administrators can update is_verified field" in str(
                exc_info.value.detail
            )


class TestDeleteUserAccount:
    """Test cases for UserService.delete_user_account method."""

    def test_delete_user_account_success(self):
        """Test successful user account deletion."""
        # Arrange
        user_id = "test-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (same as target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id
        mock_user.email = "test@example.com"
        mock_user.is_deleted = False
        mock_user.is_verified = True
        mock_user.is_admin = False

        with patch("src.services.user_service.User") as mock_user_model, patch(
            "src.services.user_service.check_user_active"
        ) as mock_check_active:

            mock_user_model.get_by_id.return_value = mock_user
            mock_user_model.delete.return_value = True

            # Act
            result = UserService.delete_user_account(
                user_id, mock_current_user, mock_db
            )

            # Assert
            mock_user_model.get_by_id.assert_called_once_with(mock_db, user_id)
            mock_check_active.assert_called_once_with(mock_user)
            mock_user_model.delete.assert_called_once_with(mock_db, user_id)

            assert result["message"] == "Account deleted successfully"

    def test_delete_user_account_user_not_found(self):
        """Test deletion when user doesn't exist."""
        # Arrange
        user_id = "nonexistent-user"
        mock_db = Mock(spec=Session)

        # Mock current user
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = False

        with patch("src.services.user_service.User") as mock_user_model:
            mock_user_model.get_by_id.return_value = None

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                UserService.delete_user_account(user_id, mock_current_user, mock_db)

            assert exc_info.value.status_code == 404

    def test_delete_user_account_deletion_failed(self):
        """Test deletion failure."""
        # Arrange
        user_id = "test-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (same as target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id
        mock_user.is_deleted = False
        mock_user.is_verified = True
        mock_user.is_admin = False

        with patch("src.services.user_service.User") as mock_user_model, patch(
            "src.services.user_service.check_user_active"
        ):

            mock_user_model.get_by_id.return_value = mock_user
            mock_user_model.delete.return_value = False  # Deletion failed

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                UserService.delete_user_account(user_id, mock_current_user, mock_db)

            assert exc_info.value.status_code == 500
            assert "Failed to delete user account" in str(exc_info.value.detail)

    def test_delete_user_account_unauthorized_different_user(self):
        """Test that regular users cannot delete other users' accounts."""
        # Arrange
        user_id = "target-user-id"
        current_user_id = "current-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (different from target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = current_user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id

        with patch("src.services.user_service.User") as mock_user_model:
            mock_user_model.get_by_id.return_value = mock_user

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                UserService.delete_user_account(user_id, mock_current_user, mock_db)

            assert exc_info.value.status_code == 403
            assert "You can only delete your own account" in str(exc_info.value.detail)

    def test_delete_user_account_admin_blocked(self):
        """Test that admin users cannot delete their account through UserService."""
        # Arrange
        user_id = "admin-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (admin)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = True

        mock_user = Mock(spec=User)
        mock_user.id = user_id
        mock_user.is_admin = True

        with patch("src.services.user_service.User") as mock_user_model, patch(
            "src.services.user_service.check_user_active"
        ):
            mock_user_model.get_by_id.return_value = mock_user

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                UserService.delete_user_account(user_id, mock_current_user, mock_db)

            assert exc_info.value.status_code == 400
            assert "Admin accounts cannot be deleted through this endpoint" in str(
                exc_info.value.detail
            )


class TestCountryBusinessLogic:
    """Test cases for country-specific business logic."""

    def test_country_validation_in_update(self):
        """Test that country validation is properly handled during updates."""
        # This test ensures that the Pydantic schema validation for country
        # is working correctly in the service layer

        # Arrange
        user_id = "test-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (same as target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id
        mock_user.is_deleted = False
        mock_user.is_verified = True

        # Test with valid country code
        user_data = UserUpdate(country="US")

        with patch("src.services.user_service.User") as mock_user_model, patch(
            "src.services.user_service.check_user_active"
        ), patch("src.services.user_service.validate_update_conflicts"), patch(
            "src.services.user_service.UserRepository"
        ) as mock_repo, patch(
            "src.services.user_service.UserProfile"
        ) as mock_user_profile:

            mock_user_model.get_by_id.return_value = mock_user
            mock_repo.update_user_data.return_value = mock_user
            mock_user_profile.model_validate.return_value = Mock()

            # Act
            result = UserService.update_user_profile(
                user_id, user_data, mock_current_user, mock_db
            )

            # Assert - should succeed without validation errors
            assert result["message"] == "Profile updated successfully"

    def test_empty_country_handling(self):
        """Test handling of empty/None country values."""
        # Arrange
        user_id = "test-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (same as target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id
        mock_user.is_deleted = False
        mock_user.is_verified = True

        # Test with None country (should not be included in update)
        user_data = UserUpdate(first_name="John")  # No country field

        with patch("src.services.user_service.User") as mock_user_model, patch(
            "src.services.user_service.check_user_active"
        ), patch("src.services.user_service.validate_update_conflicts"), patch(
            "src.services.user_service.UserRepository"
        ) as mock_repo, patch(
            "src.services.user_service.UserProfile"
        ) as mock_user_profile:

            mock_user_model.get_by_id.return_value = mock_user
            mock_repo.update_user_data.return_value = mock_user
            mock_user_profile.model_validate.return_value = Mock()

            # Act
            result = UserService.update_user_profile(
                user_id, user_data, mock_current_user, mock_db
            )

            # Assert
            update_call_args = mock_repo.update_user_data.call_args
            update_data = update_call_args[0][2]

            # Country should not be in update data
            assert "country" not in update_data
            assert "first_name" in update_data
            assert update_data["first_name"] == "John"


class TestChangePassword:
    """Test cases for UserService.change_password method."""

    def test_change_password_success(self):
        """Test successful password change."""
        # Arrange
        user_id = "test-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (same as target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id
        mock_user.email = "test@example.com"
        mock_user.password = "hashed_old_password"
        mock_user.is_deleted = False
        mock_user.is_verified = True

        mock_updated_user = Mock(spec=User)

        from src.schemas.user_schemas import UserPasswordChange

        password_data = UserPasswordChange(
            current_password="old_password",
            new_password="new_password",
            confirm_password="new_password",
        )

        with patch("src.services.user_service.User") as mock_user_model, patch(
            "src.services.user_service.check_user_active"
        ), patch("src.services.user_service.verify_password") as mock_verify, patch(
            "src.services.user_service.hash_password"
        ) as mock_hash:

            mock_user_model.get_by_id.return_value = mock_user
            mock_user_model.update.return_value = mock_updated_user
            mock_verify.side_effect = [
                True,
                False,
            ]  # Current password correct, new password different
            mock_hash.return_value = "hashed_new_password"

            # Act
            result = UserService.change_password(
                user_id, password_data, mock_current_user, mock_db
            )

            # Assert
            mock_user_model.get_by_id.assert_called_once_with(mock_db, user_id)
            mock_verify.assert_any_call("old_password", "hashed_old_password")
            mock_verify.assert_any_call("new_password", "hashed_old_password")
            mock_hash.assert_called_once_with("new_password")
            mock_user_model.update.assert_called_once_with(
                mock_db, user_id, {"password": "hashed_new_password"}
            )

            assert result["message"] == "Password changed successfully"

    def test_change_password_unauthorized_different_user(self):
        """Test that regular users cannot change other users' passwords."""
        # Arrange
        user_id = "target-user-id"
        current_user_id = "current-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (different from target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = current_user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id

        from src.schemas.user_schemas import UserPasswordChange

        password_data = UserPasswordChange(
            current_password="old_password",
            new_password="new_password",
            confirm_password="new_password",
        )

        with patch("src.services.user_service.User") as mock_user_model:
            mock_user_model.get_by_id.return_value = mock_user

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                UserService.change_password(
                    user_id, password_data, mock_current_user, mock_db
                )

            assert exc_info.value.status_code == 403
            assert "You can only change your own password" in str(exc_info.value.detail)


class TestGetUserProfile:
    """Test cases for UserService.get_user_profile method."""

    def test_get_user_profile_success(self):
        """Test successful user profile retrieval."""
        # Arrange
        user_id = "test-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (same as target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id
        mock_user.email = "test@example.com"
        mock_user.is_deleted = False
        mock_user.is_verified = True

        with patch("src.services.user_service.User") as mock_user_model, patch(
            "src.services.user_service.check_user_active"
        ), patch("src.services.user_service.UserRepository") as mock_repo, patch(
            "src.services.user_service.UserProfile"
        ) as mock_user_profile:

            mock_user_model.get_by_id.return_value = mock_user
            mock_repo.get_user_profile_data.return_value = mock_user
            mock_user_profile.model_validate.return_value = Mock()

            # Act
            result = UserService.get_user_profile(user_id, mock_current_user, mock_db)

            # Assert
            mock_user_model.get_by_id.assert_called_once_with(mock_db, user_id)
            mock_repo.get_user_profile_data.assert_called_once_with(
                mock_db, int(user_id)
            )
            assert result["message"] == "Profile retrieved successfully"

    def test_get_user_profile_unauthorized_different_user(self):
        """Test that regular users cannot access other users' profiles."""
        # Arrange
        user_id = "target-user-id"
        current_user_id = "current-user-id"
        mock_db = Mock(spec=Session)

        # Mock current user (different from target user)
        mock_current_user = Mock(spec=User)
        mock_current_user.id = current_user_id
        mock_current_user.is_admin = False

        mock_user = Mock(spec=User)
        mock_user.id = user_id

        with patch("src.services.user_service.User") as mock_user_model:
            mock_user_model.get_by_id.return_value = mock_user

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                UserService.get_user_profile(user_id, mock_current_user, mock_db)

            assert exc_info.value.status_code == 403
            assert "You can only access your own profile" in str(exc_info.value.detail)
