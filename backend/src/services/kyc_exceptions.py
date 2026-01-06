"""
Custom exceptions for KYC verification services.
Provides structured error handling for different KYC scenarios.
"""


class KYCError(Exception):
    """Base exception class for KYC-related errors."""

    def __init__(self, message: str, error_code: str = None, details: dict = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class KYCProviderError(KYCError):
    """Exception raised when KYC provider (Shufti Pro) returns an error."""

    def __init__(
        self, message: str, status_code: int = None, provider_response: dict = None
    ):
        self.status_code = status_code
        self.provider_response = provider_response or {}
        super().__init__(
            message=message,
            error_code="KYC_PROVIDER_ERROR",
            details={
                "status_code": status_code,
                "provider_response": provider_response,
            },
        )


class KYCConfigurationError(KYCError):
    """Exception raised when KYC service is misconfigured."""

    def __init__(self, message: str):
        super().__init__(message=message, error_code="KYC_CONFIGURATION_ERROR")


class KYCVerificationNotFoundError(KYCError):
    """Exception raised when a KYC verification is not found."""

    def __init__(self, verification_id: str):
        super().__init__(
            message=f"KYC verification with ID {verification_id} not found",
            error_code="KYC_VERIFICATION_NOT_FOUND",
            details={"verification_id": verification_id},
        )


class KYCInvalidStateError(KYCError):
    """Exception raised when trying to perform an invalid operation on a KYC verification."""

    def __init__(self, message: str, current_status: str = None):
        super().__init__(
            message=message,
            error_code="KYC_INVALID_STATE",
            details={"current_status": current_status},
        )


class KYCWebhookError(KYCError):
    """Exception raised when webhook processing fails."""

    def __init__(self, message: str, webhook_data: dict = None):
        super().__init__(
            message=message,
            error_code="KYC_WEBHOOK_ERROR",
            details={"webhook_data": webhook_data},
        )
