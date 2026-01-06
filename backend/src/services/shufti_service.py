"""
Enhanced Shufti Pro service for KYC verification with proper error handling and logging.
"""

import httpx
import json
import hashlib
import hmac
import base64
import logging
from typing import Dict, Any

from ..config.kyc_config import init_kyc_config, KYCConfig
from .kyc_exceptions import KYCProviderError, KYCConfigurationError, KYCWebhookError

# Configure logger
logger = logging.getLogger(__name__)


class ShuftiService:
    """Enhanced service for Shufti Pro API calls with proper error handling."""

    def __init__(self):
        """Initialize Shufti service with configuration."""
        try:
            self.config: KYCConfig = init_kyc_config()
        except Exception as e:
            logger.error(f"Failed to initialize KYC configuration: {e}")
            raise KYCConfigurationError(f"KYC service configuration failed: {e}")

        # Validate credentials
        if not self.config.shufti_client_id or not self.config.shufti_secret_key:
            raise KYCConfigurationError(
                "Shufti Pro credentials not found in environment variables"
            )

        # Log configuration (safe logging)
        if self.config.debug_mode:
            logger.debug(
                f"KYC Service initialized - Environment: {self.config.environment}, "
                f"CLIENT_ID length: {len(self.config.shufti_client_id)}, "
                f"SECRET_KEY length: {len(self.config.shufti_secret_key)}"
            )

    def _create_signature(self, payload: str) -> str:
        """
        Create signature for webhook validation using ShuftiPro's method.

        ShuftiPro uses HMAC-SHA256 with the raw request body and the secret key.
        """
        try:
            # HMAC-SHA256 using the secret key and payload
            signature = hmac.new(
                self.config.shufti_secret_key.encode("utf-8"),
                payload.encode("utf-8"),
                hashlib.sha256,
            ).hexdigest()

            if self.config.debug_mode:
                logger.debug(f"Payload for signature: {payload}")
                logger.debug(f"Calculated signature: {signature}")

            return signature
        except Exception as e:
            logger.error(f"Failed to create signature: {e}")
            raise KYCProviderError("Failed to create authentication signature")

    def _get_auth_headers(self, payload: str) -> Dict[str, str]:
        """Get authentication headers."""
        try:
            # Use Basic authentication with client_id:secret_key
            auth_string = (
                f"{self.config.shufti_client_id}:{self.config.shufti_secret_key}"
            )

            if self.config.debug_mode:
                logger.debug(f"Auth string (client_id:secret_key): {auth_string}")

            credentials = base64.b64encode(auth_string.encode("utf-8")).decode("utf-8")

            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Basic {credentials}",
            }

            if self.config.debug_mode:
                # Log headers safely (hide full credentials)
                safe_headers = headers.copy()
                if "Authorization" in safe_headers:
                    auth_value = safe_headers["Authorization"]
                    if len(auth_value) > 15:
                        safe_headers["Authorization"] = (
                            f"{auth_value[:10]}...{auth_value[-5:]}"
                        )
                logger.debug(f"Auth headers: {safe_headers}")

            return headers

        except Exception as e:
            logger.error(f"Failed to create auth headers: {e}")
            raise KYCProviderError("Failed to create authentication headers")

    async def start_verification(
        self,
        reference: str,
        user_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Start KYC verification with Shufti Pro.

        Args:
            reference: Unique reference for this verification
            user_data: User information for verification

        Returns:
            Dict containing verification response

        Raises:
            KYCProviderError: If API call fails
            KYCConfigurationError: If service is misconfigured
        """
        logger.info(f"Starting KYC verification for reference: {reference}")

        # Validate user data
        required_fields = [
            "first_name",
            "last_name",
            "email",
            "country",
        ]
        for field in required_fields:
            if field not in user_data or not user_data[field]:
                raise KYCProviderError(f"Missing required field: {field}")

        # Check if country is supported
        if user_data["country"].upper() not in self.config.supported_countries:
            raise KYCProviderError(
                f"Country {user_data['country']} is not supported for KYC verification"
            )

        # Build request payload
        request_data = {
            "reference": reference,
            "callback_url": self.config.callback_url,
            "email": user_data["email"],
            "country": user_data["country"],
            "language": "EN",
            "verification_mode": "any",
            "ttl": self.config.verification_ttl,
            "show_results": "1" if self.config.is_development else "0",
            "document": {
                "supported_types": self.config.supported_document_types,
                "name": {
                    "first_name": user_data["first_name"],
                    "last_name": user_data["last_name"],
                },
            },
            "face": {},  # Basic face verification
            "allow_online": 1,
            "allow_offline": 1,
            "allow_retry": 1,
        }

        payload = json.dumps(request_data, separators=(",", ":"))

        # Debug log the request payload
        if self.config.debug_mode:
            logger.debug(
                f"ShuftiPro request payload: {json.dumps(request_data, indent=2)}"
            )

        # Get authentication headers
        headers = self._get_auth_headers(payload)

        # Handle test/development environment
        if (
            self.config.is_development
            and "test" in self.config.shufti_client_id.lower()
        ):
            logger.warning("Using test mode - returning mock response")
            return {
                "reference": reference,
                "event": "request.pending",
                "verification_url": f"https://shuftipro.com/process/{reference}",
                "status_code": 200,
                "message": "Verification request initiated successfully (TEST MODE)",
            }

        # Make API call
        try:
            async with httpx.AsyncClient(timeout=self.config.webhook_timeout) as client:
                logger.info(
                    f"Sending request to Shufti Pro API: {self.config.shufti_base_url}"
                )

                # Log the full request details in debug mode
                if self.config.debug_mode:
                    safe_headers = headers.copy()
                    if "Authorization" in safe_headers:
                        auth_value = safe_headers["Authorization"]
                        if len(auth_value) > 15:
                            safe_headers["Authorization"] = (
                                f"{auth_value[:10]}...{auth_value[-5:]}"
                            )
                    logger.debug(f"Request headers: {safe_headers}")
                    logger.debug(f"Request URL: {self.config.shufti_base_url}/")

                response = await client.post(
                    f"{self.config.shufti_base_url}/", headers=headers, content=payload
                )

                # Always log the response status
                logger.debug(f"ShuftiPro API response status: {response.status_code}")

                if response.status_code == 200:
                    result = response.json()
                    logger.info(
                        f"KYC verification started successfully for reference: {reference}"
                    )

                    if self.config.debug_mode:
                        logger.debug(f"Shufti Pro response: {result}")

                    return result
                else:
                    try:
                        # Try to parse the response as JSON
                        result = response.json()
                        logger.debug(f"Error response body: {result}")

                        # Extract error details
                        error = result.get("error", {})
                        error_code = error.get("code", "unknown")
                        error_message = error.get("message", "Unknown error")
                        error_service = error.get("service", "")
                        error_key = error.get("key", "")

                        # Log detailed error information
                        logger.error(
                            f"ShuftiPro API error details - Code: {error_code}, Message: {error_message}, Service: {error_service}, Key: {error_key}"
                        )

                        # Map common error codes to more specific messages
                        if error_code == "400":
                            error_msg = f"Bad request: {error_message}"
                        elif error_code == "401":
                            error_msg = f"Authentication failed. Check your API credentials. Details: {error_message}"
                        elif error_code == "403":
                            error_msg = f"Access forbidden. Your account may be restricted. Details: {error_message}"
                        elif error_code == "404":
                            error_msg = f"Resource not found. Details: {error_message}"
                        elif error_code == "409":
                            error_msg = f"Duplicate reference ID. Please use a unique reference. Details: {error_message}"
                        elif error_code == "429":
                            error_msg = f"Rate limit exceeded. Please try again later. Details: {error_message}"
                        elif error_code == "500":
                            error_msg = f"Shufti Pro server error. Please try again later. Details: {error_message}"
                        elif response.status_code == 401:
                            error_msg = f"Authentication failed. Check your API credentials. Details: {error_message}"
                        else:
                            error_msg = f"Shufti Pro API error: {response.status_code}. Details: {error_message}"
                    except json.JSONDecodeError:
                        # If the response is not valid JSON
                        error_msg = f"Shufti Pro API error: {response.status_code}"
                        logger.error(
                            f"Could not parse error response as JSON: {response.text}"
                        )

                    logger.error(f"{error_msg} - Response: {response.text}")

                    raise KYCProviderError(
                        message=error_msg,
                        status_code=response.status_code,
                        provider_response={"error": response.text},
                    )

        except httpx.TimeoutException:
            logger.error(
                f"Timeout while calling Shufti Pro API for reference: {reference}"
            )
            raise KYCProviderError("KYC provider request timed out")

        except httpx.RequestError as e:
            logger.error(f"Request error while calling Shufti Pro API: {e}")
            raise KYCProviderError(f"Failed to connect to KYC provider: {str(e)}")

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON response from Shufti Pro: {e}")
            raise KYCProviderError("Invalid response from KYC provider")

    def verify_webhook(self, payload: bytes, signature: str) -> bool:
        """
        Verify webhook signature using ShuftiPro's official method.

        According to ShuftiPro documentation:
        1. Take SHA256 of the Secret Key string
        2. Concatenate hashed Secret Key at the end of the raw response string
        3. Take SHA256 of concatenated string
        4. Match with signature from header

        Formula: hash('sha256', response . hash('sha256', secret_key))

        Args:
            payload: Raw webhook payload as bytes
            signature: Signature from webhook headers

        Returns:
            bool: True if signature is valid
        """
        try:
            # Validate signature format
            if not signature or not isinstance(signature, str) or len(signature) < 8:
                logger.warning(f"Invalid signature format received: '{signature}'")
                return False

            # Convert payload bytes to string (as ShuftiPro expects)
            payload_str = payload.decode("utf-8")

            # Log the signature calculation steps
            logger.info("=== SIGNATURE CALCULATION STEPS ===")
            logger.info(f"Step 1: Raw payload length: {len(payload)} bytes")
            logger.info(f"Step 2: Secret key: {self.config.shufti_secret_key}")

            # Step 1: Take SHA256 of the Secret Key string
            secret_hash = hashlib.sha256(
                self.config.shufti_secret_key.encode("utf-8")
            ).hexdigest()
            logger.info(f"Step 3: Secret key hash: {secret_hash}")

            # Step 2: Concatenate hashed Secret Key at the end of the raw response string
            # Format: response + hash('sha256', secret_key)
            concatenated = payload_str + secret_hash
            logger.info(f"Step 4: Concatenated string length: {len(concatenated)}")

            # Step 3: Take SHA256 of concatenated string
            calculated_signature = hashlib.sha256(
                concatenated.encode("utf-8")
            ).hexdigest()
            logger.info(f"Step 5: Final calculated signature: {calculated_signature}")
            logger.info("===================================")

            # Debug logging in development mode
            if self.config.debug_mode:
                logger.debug(f"Raw payload length: {len(payload)} bytes")
                logger.debug(
                    f"Payload string (first 100 chars): {payload_str[:100]}..."
                )
                logger.debug(f"Secret key: {self.config.shufti_secret_key}")
                logger.debug(f"Secret hash: {secret_hash}")
                logger.debug(f"Concatenated (first 100 chars): {concatenated[:100]}...")
                logger.debug(f"Calculated signature: {calculated_signature}")
                logger.debug(f"Received signature: {signature}")

            # Compare signatures using constant-time comparison
            is_valid = hmac.compare_digest(
                calculated_signature.lower(), signature.lower()
            )

            # Always log signature comparison for debugging (not just in debug mode)
            logger.info("=== SIGNATURE VERIFICATION ===")
            logger.info(f"✓ OUR CALCULATED SIGNATURE: {calculated_signature}")
            logger.info(f"✓ SHUFTI PRO SIGNATURE:     {signature}")
            logger.info(f"✓ SIGNATURES MATCH:         {is_valid}")
            logger.info("==============================")

            if self.config.debug_mode:
                logger.debug(f"Signature validation result: {is_valid}")
                if not is_valid:
                    logger.debug(f"Signature comparison details:")
                    logger.debug(
                        f"  - Our signature length: {len(calculated_signature)}"
                    )
                    logger.debug(f"  - ShuftiPro signature length: {len(signature)}")
                    logger.debug(
                        f"  - Our signature (lower): {calculated_signature.lower()}"
                    )
                    logger.debug(
                        f"  - ShuftiPro signature (lower): {signature.lower()}"
                    )

                    # Find first difference
                    if len(calculated_signature) == len(signature):
                        for i, (c1, c2) in enumerate(
                            zip(calculated_signature.lower(), signature.lower())
                        ):
                            if c1 != c2:
                                logger.debug(
                                    f"  - First difference at position {i}: '{c1}' vs '{c2}'"
                                )
                                break
                    else:
                        logger.debug(
                            f"  - Length mismatch prevents detailed comparison"
                        )

            # In development mode, log warnings but still accept invalid signatures
            if not is_valid and self.config.is_development:
                logger.warning(
                    "Development mode: Invalid signature but continuing for testing"
                )
                logger.warning("THIS WOULD FAIL IN PRODUCTION MODE!")
                logger.warning(f"Expected: {calculated_signature}")
                logger.warning(f"Received: {signature}")
                return True

            return is_valid

        except Exception as e:
            logger.error(f"Error verifying webhook signature: {e}")
            if self.config.debug_mode:
                logger.debug(f"Exception details: {str(e)}")
            return False
