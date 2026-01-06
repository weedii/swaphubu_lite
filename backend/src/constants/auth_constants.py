"""
Authentication constants for the SwapHubu platform.
Contains error messages, configuration values, and other auth-related constants.
"""


class AuthErrors:
    """Centralized authentication error messages."""

    EMAIL_ALREADY_EXISTS = "Email already registered"
    PHONE_ALREADY_EXISTS = "Phone number already registered"
    INVALID_CREDENTIALS = "Invalid credentials"
    ACCOUNT_DEACTIVATED = "Account is deactivated"
    USER_NOT_FOUND = "User not found"
    EMAIL_NOT_FOUND = "No account found with this email address"
    WRONG_CURRENT_PASSWORD = "Current password is incorrect"
    SAME_PASSWORD = "New password must be different from current password"
    PASSWORD_MISMATCH = "New password and confirmation do not match"
    INVALID_RESET_TOKEN = "Invalid or expired reset token"
    INVALID_RESET_CODE = "Invalid or expired reset code"
    RESET_CODE_NOT_VERIFIED = "Reset code must be verified first"
    RESET_CODE_ALREADY_USED = "Reset code has already been used"
    UPDATE_FAILED = "Failed to update password"
    RESET_FAILED = "Password reset failed"
    SEND_CODE_FAILED = "Failed to send reset code. Please try again."


class AuthConfig:
    """Authentication configuration constants."""

    RESET_TOKEN_EXPIRE_HOURS = 1
    TOKEN_LENGTH = 32


class AuthMessages:
    """Success and informational messages."""

    PASSWORD_CHANGED = "Password successfully changed"
    PASSWORD_RESET_SUCCESS = (
        "Password successfully reset. You can now login with your new password."
    )
    RESET_CODE_SENT = (
        "If an account with that email exists, a password reset code has been sent."
    )
    RESET_CODE_VERIFIED = "Reset code verified successfully"
    LOGOUT_SUCCESS = "Successfully logged out"

    # Development messages
    DEV_CHECK_LOGS = "For development: Check server console logs for reset code (email sending not implemented)"
