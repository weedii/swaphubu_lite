"""
KYC service - business logic for KYC verification operations.
"""

import logging
import json
import uuid
import os
from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models.KYCVerification import KYCVerification
from ..models.User import User
from ..repositories.KYCRepository import KYCRepository
from ..services.shufti_service import ShuftiService
from ..services.kyc_exceptions import (
    KYCError,
    KYCProviderError,
    KYCConfigurationError,
    KYCVerificationNotFoundError,
    KYCWebhookError,
)
from ..config.kyc_config import init_kyc_config
from ..schemas.kyc_schemas import KYCRequest, KYCStartResponse, KYCStatusResponse

# Configure logging
logger = logging.getLogger(__name__)


class KYCService:
    """
    KYC service for handling all KYC verification business logic.
    """

    @staticmethod
    def _update_user_verification_status(
        user_id: str, kyc_status: str, db: Session
    ) -> bool:
        """
        Update user verification status based on KYC verification result.

        Args:
            user_id: User's ID
            kyc_status: KYC verification status
            db: Database session

        Returns:
            bool: True if user status was updated, False otherwise
        """
        logger.info(
            f"Updating user {user_id} verification status based on KYC status: {kyc_status}"
        )

        try:
            # Get user
            user = User.get_by_id(db, user_id)
            if not user:
                logger.warning(f"User {user_id} not found")
                return False

            # Determine if user should be verified
            should_be_verified = kyc_status == "verified"

            # Update user verification status if needed
            if user.is_verified != should_be_verified:
                updated_user = User.update(
                    db, user_id, {"is_verified": should_be_verified}
                )

                if updated_user:
                    logger.info(
                        f"User {user_id} verification status updated to: {should_be_verified}"
                    )
                    return True
                else:
                    logger.error(f"Failed to update user {user_id} verification status")
                    return False
            else:
                logger.info(
                    f"User {user_id} verification status already correct: {should_be_verified}"
                )
                return True

        except Exception as e:
            logger.error(f"Error updating user verification status: {str(e)}")
            return False

    @staticmethod
    def _get_user_kyc_status(user_id: str, db: Session) -> Optional[str]:
        """
        Get the latest KYC verification status for a user.

        Args:
            user_id: User's ID
            db: Database session

        Returns:
            str: Latest KYC status or None if no verification exists
        """
        try:
            verifications = KYCRepository.get_user_verifications(db, user_id)

            if not verifications:
                return None

            # Return the latest verification status
            latest_verification = verifications[
                0
            ]  # Already ordered by submitted_at desc
            return latest_verification.status

        except Exception as e:
            logger.error(f"Error getting user KYC status: {str(e)}")
            return None

    @staticmethod
    def is_user_kyc_verified(user_id: str, db: Session) -> bool:
        """
        Check if user has completed KYC verification.

        Args:
            user_id: User's ID
            db: Database session

        Returns:
            bool: True if user has verified KYC, False otherwise
        """
        kyc_status = KYCService._get_user_kyc_status(user_id, db)
        return kyc_status == "verified"

    @staticmethod
    def is_user_blocked_from_kyc(user_id: str, db: Session) -> bool:
        """
        Check if user is blocked from KYC verification due to exhausted retries.

        Args:
            user_id: User's ID
            db: Database session

        Returns:
            bool: True if user is blocked from KYC, False otherwise
        """
        try:
            user = User.get_by_id(db, user_id)
            return user.is_blocked if user else False
        except Exception as e:
            logger.error(f"Error checking if user is blocked: {str(e)}")
            return False

    @staticmethod
    async def start_retry_verification(user_id: str, db: Session) -> Dict[str, Any]:
        """
        Start a retry verification for a user who has a retry_pending verification.

        Args:
            user_id: User ID to start retry for
            db: Database session

        Returns:
            Dict containing verification response or error
        """
        try:
            # Check if user is blocked from KYC verification
            if KYCService.is_user_blocked_from_kyc(user_id, db):
                logger.warning(f"Blocked user {user_id} attempted to start retry verification")
                return {
                    "success": False,
                    "message": "KYC verification is blocked for this user due to exhausted retry attempts. Please contact support.",
                }

            # Find retry_pending verification for this user
            retry_verification = (
                db.query(KYCVerification)
                .filter(
                    KYCVerification.user_id == user_id,
                    KYCVerification.status == "retry_pending",
                )
                .first()
            )

            if not retry_verification:
                return {
                    "success": False,
                    "message": "No retry verification found for this user",
                }

            # Get user details
            user = User.get_by_id(db, user_id)
            if not user:
                return {"success": False, "message": "User not found"}

            logger.info(f"Starting retry verification for user {user.email}")
            logger.info(f"Retry reference: {retry_verification.reference}")

            # Start Shufti Pro verification
            shufti = ShuftiService()
            result = await shufti.start_verification(
                reference=retry_verification.reference,
                user_data={
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "country": "US",  # You might want to get this from user profile
                },
            )

            # Update verification status and store Shufti result
            retry_verification.status = "pending"
            retry_verification.provider_response = json.dumps(
                {
                    "retry_info": json.loads(
                        retry_verification.provider_response or "{}"
                    ).get("retry_info", {}),
                    "shufti_result": result,
                    "verification_url": result.get(
                        "verification_url"
                    ),  # Store at top level for easy access
                }
            )
            db.commit()

            logger.info(f"🚀 Retry verification started successfully!")
            logger.info(
                f"📧 User {user.email} verification URL: {result.get('verification_url')}"
            )

            return {
                "success": True,
                "verification_id": str(retry_verification.id),
                "reference": retry_verification.reference,
                "verification_url": result.get("verification_url"),
                "message": "Retry verification started successfully",
            }

        except Exception as e:
            logger.error(f"Error starting retry verification: {e}")
            return {
                "success": False,
                "message": f"Failed to start retry verification: {str(e)}",
            }

    @staticmethod
    async def start_verification(
        request: KYCRequest, current_user: User, db: Session
    ) -> KYCStartResponse:
        """
        Start KYC verification with Shufti Pro.

        Args:
            request: KYC verification request data
            current_user: Current authenticated user
            db: Database session

        Returns:
            KYCStartResponse with verification details

        Raises:
            HTTPException: If verification cannot be started
        """
        logger.info(f"KYC verification start requested by user: {current_user.id}")

        # Check if user is blocked from KYC verification
        if KYCService.is_user_blocked_from_kyc(str(current_user.id), db):
            logger.warning(f"Blocked user {current_user.id} attempted to start KYC verification")
            raise HTTPException(
                status_code=403, 
                detail="KYC verification is blocked for this user due to exhausted retry attempts. Please contact support."
            )

        try:
            # Generate unique reference
            reference = f"KYC_{current_user.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"

            # Initialize Shufti service and start verification
            shufti = ShuftiService()
            result = await shufti.start_verification(
                reference=reference,
                user_data={
                    "first_name": request.first_name,
                    "last_name": request.last_name,
                    "email": request.email,
                    "country": request.country,
                },
            )

            logger.info(f"Shufti verification result: {result}")

            # Save to database using CRUD decorator
            kyc_verification = KYCVerification.create(
                db,
                user_id=current_user.id,
                reference=reference,
                status=KYCService._get_status_from_result(result),
                provider_response=json.dumps(result),
                submitted_at=datetime.utcnow(),
            )

            logger.info(f"KYC verification created successfully: {kyc_verification.id}")

            return KYCStartResponse(
                verification_id=str(kyc_verification.id),
                reference=reference,
                verification_url=result.get("verification_url"),
            )

        except KYCError as e:
            logger.error(f"KYC provider error: {e.message}")
            raise HTTPException(
                status_code=400, detail=f"KYC verification failed: {e.message}"
            )

        except Exception as e:
            logger.error(f"Unexpected error starting KYC verification: {str(e)}")
            raise HTTPException(
                status_code=500, detail="Failed to start KYC verification"
            )

    @staticmethod
    def _get_status_from_result(result: Dict[str, Any]) -> str:
        """
        Extract status from Shufti Pro API result.

        Args:
            result: API response from Shufti Pro

        Returns:
            String status for database storage
        """
        # Get event from result
        event = result.get("event", "")

        # If event exists and has a format like "request.pending"
        if event and "." in event:
            try:
                return event.split(".")[1]  # Extract "pending" from "request.pending"
            except (IndexError, AttributeError):
                pass

        # Default fallback status
        return "initiated"

    @staticmethod
    async def start_verification_by_user_id(
        user_id: str, db: Session
    ) -> KYCStartResponse:
        """
        Start KYC verification using user ID to get user data from database.

        Args:
            user_id: User's ID
            db: Database session

        Returns:
            KYCStartResponse with verification details

        Raises:
            HTTPException: If verification cannot be started
        """
        logger.info(f"KYC verification start requested for user: {user_id}")

        try:
            # Get user from database
            user = User.get_by_id(db, user_id)
            if not user:
                logger.warning(f"User {user_id} not found")
                raise HTTPException(status_code=404, detail="User not found")

            # Check if user is blocked from KYC verification
            if KYCService.is_user_blocked_from_kyc(user_id, db):
                logger.warning(f"Blocked user {user_id} attempted to start KYC verification")
                raise HTTPException(
                    status_code=403, 
                    detail="KYC verification is blocked for this user due to exhausted retry attempts. Please contact support."
                )

            # Check if user has required data for KYC
            if not user.first_name or not user.last_name or not user.email:
                raise HTTPException(
                    status_code=400,
                    detail="User profile incomplete. First name, last name, and email are required.",
                )

            # Check if user already has a pending verification
            existing_verification = KYCRepository.find_pending_verification_by_user(
                db, str(user_id)
            )

            if existing_verification:
                logger.warning(
                    f"User {user_id} already has pending verification: {existing_verification.id}"
                )
                return KYCStartResponse(
                    verification_id=str(existing_verification.id),
                    reference=existing_verification.reference,
                    verification_url=existing_verification.provider_response.get(
                        "verification_url"
                    ),
                )

            # Create KYC request when user has no pending verification
            kyc_request = KYCRequest(
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                country=user.country,
            )

            # Use existing start_verification method
            return await KYCService.start_verification(kyc_request, user, db)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                f"Unexpected error starting KYC verification by user ID: {str(e)}"
            )
            raise HTTPException(
                status_code=500, detail="Failed to start KYC verification"
            )

    @staticmethod
    def process_webhook(
        webhook_data: Dict[str, Any], signature: str, db: Session
    ) -> Dict[str, str]:
        """
        Process Shufti Pro webhook with enhanced security and error handling.

        Args:
            webhook_data: Webhook payload data
            signature: Webhook signature for verification
            db: Database session

        Returns:
            Success response dictionary

        Raises:
            HTTPException: If webhook processing fails
        """
        logger.info("Processing KYC webhook")

        try:
            # Verify signature if not already verified
            if signature:  # Skip if signature is empty (already verified)
                shufti = ShuftiService()
                try:
                    payload_str = json.dumps(webhook_data)
                    if not shufti.verify_webhook(payload_str, signature):
                        logger.error("Invalid webhook signature received")
                        logger.error(f"Payload: {payload_str}")
                        logger.error(f"Signature: {signature}")
                        raise HTTPException(
                            status_code=400, detail="Invalid webhook signature"
                        )
                except Exception as e:
                    logger.error(f"Error verifying webhook signature: {str(e)}")
                    raise HTTPException(
                        status_code=400,
                        detail=f"Webhook signature verification error: {str(e)}",
                    )

            # Find verification by reference (SECURE LOOKUP)
            reference = webhook_data.get("reference", "")
            if not reference:
                logger.error("Webhook received without reference")
                raise HTTPException(
                    status_code=400, detail="Missing reference in webhook data"
                )

            verification = KYCRepository.find_by_reference(db, reference)

            if not verification:
                logger.error(f"Verification not found for reference: {reference}")
                raise HTTPException(status_code=404, detail="Verification not found")
            # Extract event type from webhook data
            event_type = webhook_data.get("event", "")
            logger.info(f"Processing webhook event: {event_type}")

            # Update status based on Shufti Pro response
            status_map = {
                "1": "verified",
                "0": "declined",
                "2": "pending",
                "3": "cancelled",
            }

            webhook_status = webhook_data.get("verification_status", "")

            # Determine status based on event type and verification_status
            if event_type == "verification.accepted":
                new_status = "verified"
            elif event_type == "verification.declined":
                new_status = "declined"
            elif event_type == "verification.cancelled":
                new_status = "cancelled"
            elif event_type.startswith("verification."):
                new_status = "pending"
            elif event_type == "request.pending":
                new_status = "pending"
            elif event_type.startswith("request."):
                new_status = "pending"
            else:
                # Fall back to status code if event type is not recognized
                new_status = status_map.get(webhook_status, "error")

            logger.info(
                f"Updating verification {verification.id} from {verification.status} to {new_status}"
            )

            # Update verification record using CRUD decorator
            try:
                existing_data = json.loads(verification.provider_response or "{}")
            except json.JSONDecodeError:
                existing_data = {}

            existing_data["webhook_data"] = webhook_data

            # Extract verification details if available
            if "verification_data" in webhook_data:
                existing_data["verification_details"] = webhook_data[
                    "verification_data"
                ]

            # Extract decline reasons if available and check for auto-retry
            if (event_type == "verification.declined" or new_status == "declined") and (
                "declined_reason" in webhook_data or "declined_codes" in webhook_data
            ):
                # Handle both declined_reason (string) and declined_codes (list) formats
                decline_reasons_raw = webhook_data.get("declined_reason", "")
                decline_codes = webhook_data.get("declined_codes", [])

                # Convert decline_reasons to proper format (list or None)
                if decline_reasons_raw and decline_reasons_raw.strip():
                    decline_reasons = [decline_reasons_raw]
                else:
                    decline_reasons = None

                logger.info(f"Verification declined. Reason: {decline_reasons}")
                logger.info(f"Verification declined. Codes: {decline_codes}")

                existing_data["decline_reasons"] = decline_reasons
                existing_data["decline_codes"] = decline_codes

                # Auto-retry logic for eligible decline codes
                retry_eligible_codes = {
                    # Document issues
                    "SPDR03": "Document appears to be tampered",
                    "SPDR48": "Document appears to be photoshopped",
                    "SPDR89": "Document appears to be fake/forged",
                    "SPDR04": "Document appears to be a photocopy",
                    "SPDR05": "Document appears to be a screenshot",
                    "SPDR06": "Document appears to be digitally altered",
                    "SPDR07": "Document quality is too poor",
                    "SPDR08": "Document is blurry or unclear",
                    "SPDR19": "Face could not be detected in image",
                    "SPDR15": "Face on document doesn't match camera image",  # Added for retry
                    # Face issues (technical/quality)
                    "SPFR01": "Face not clearly visible",
                    "SPFR02": "Face is blurry or unclear",
                    "SPFR03": "Face lighting is insufficient",
                    "SPDR278": "Face proof is altered or photoshopped",
                    "SPDR01": "Name on document does not match provided name",
                    "SPDR02": "Date of birth does not match",
                    "SPFR10": "Face does not match document photo",
                }

                retry_blocked_codes = {
                    # "SPDR01": "Name on document does not match provided name",
                    # "SPDR02": "Date of birth does not match",
                    # "SPFR10": "Face does not match document photo"
                }

                # Check if any decline code is retry-eligible
                should_retry = False
                retry_blocked = False

                # Check decline codes list
                for code in decline_codes:
                    if code in retry_blocked_codes:
                        retry_blocked = True
                        logger.info(f"Retry blocked due to code: {code}")
                        break
                    elif code in retry_eligible_codes:
                        should_retry = True
                        logger.info(f"Retry eligible code found: {code}")

                # Only retry if eligible and not blocked
                if should_retry and not retry_blocked:
                    # Check retry count (max 3 attempts)
                    user_verifications = KYCRepository.get_user_verifications(
                        db, str(verification.user_id)
                    )
                    retry_count = sum(
                        1 for v in user_verifications if v.status == "declined"
                    )

                    if retry_count < 2:
                        logger.info(
                            f"Initiating auto-retry for user {verification.user_id} (attempt {retry_count + 1})"
                        )
                        try:
                            # Extract user data from original verification
                            original_data = json.loads(
                                verification.provider_response or "{}"
                            )

                            # Generate new reference for retry
                            retry_reference = f"RETRY_{retry_count + 1}_{verification.reference}_{uuid.uuid4().hex[:8]}"

                            # Get user for retry
                            user = User.get_by_id(db, str(verification.user_id))
                            if user:
                                # Get user for retry
                                user = User.get_by_id(db, str(verification.user_id))
                                if user:
                                    logger.info(
                                        f"Starting automatic retry for user {user.email}"
                                    )

                                    # Create new verification record for retry
                                    retry_verification = KYCVerification.create(
                                        db,
                                        user_id=verification.user_id,
                                        reference=retry_reference,
                                        status="retry_pending",
                                        provider_response=json.dumps(
                                            {
                                                "retry_info": {
                                                    "is_retry": True,
                                                    "attempt_number": retry_count + 1,
                                                    "original_reference": verification.reference,
                                                    "decline_reasons": decline_codes,
                                                }
                                            }
                                        ),
                                        submitted_at=datetime.utcnow(),
                                    )

                                    logger.info(
                                        f"✅ Auto-retry verification created: {retry_verification.id}"
                                    )

                                    logger.info(
                                        f"🎯 Auto-retry verification ready for user {user.email}"
                                    )
                                    logger.info(
                                        f"📧 User can start new verification with reference: {retry_reference}"
                                    )
                                    logger.info(
                                        f"💡 Use your existing /kyc/start endpoint with this user to create new Shufti session"
                                    )

                                    retry_result = {
                                        "retry_initiated": True,
                                        "new_verification_id": retry_verification.id,
                                        "reference": retry_reference,
                                        "user_email": user.email,
                                        "ready_for_start": True,
                                    }
                                else:
                                    logger.error(
                                        f"User not found for retry: {verification.user_id}"
                                    )
                                    retry_result = {
                                        "retry_initiated": False,
                                        "error": "User not found",
                                    }

                                # Mark that retry is needed (actual retry can be handled separately)
                                existing_data["auto_retry"] = {
                                    "needed": True,
                                    "retry_reference": retry_reference,
                                    "attempt_number": retry_count + 1,
                                    "user_id": str(
                                        verification.user_id
                                    ),  # Convert UUID to string
                                    "decline_reasons": decline_reasons,
                                }

                                logger.info(
                                    f"Auto-retry marked as needed for user {verification.user_id}"
                                )
                                logger.info(f"Retry reference: {retry_reference}")
                                logger.info(f"Attempt number: {retry_count + 1}")

                                # Auto-retry system fully implemented:
                                # 1. Detection and database record creation (automatic)
                                # 2. Shufti Pro session initiation via /kyc/retry/{user_id} endpoint

                        except Exception as retry_error:
                            logger.error(f"Auto-retry failed: {retry_error}")
                            existing_data["auto_retry"] = {
                                "initiated": False,
                                "error": str(retry_error),
                            }
                    else:
                        logger.info(
                            f"Max retry attempts (3) reached for user {verification.user_id}"
                        )
                        existing_data["auto_retry"] = {
                            "initiated": False,
                            "reason": "Maximum retry attempts reached",
                        }
                        
                        # Block the user after exhausting all retries
                        try:
                            user = User.get_by_id(db, str(verification.user_id))
                            if user and not user.is_blocked:
                                User.update(db, user.id, {"is_blocked": True})
                                logger.info(f"User {verification.user_id} has been blocked after exhausting all 3 KYC retry attempts")
                            elif user and user.is_blocked:
                                logger.info(f"User {verification.user_id} is already blocked")
                        except Exception as block_error:
                            logger.error(f"Failed to block user {verification.user_id}: {block_error}")
                else:
                    if retry_blocked:
                        logger.info(
                            "Auto-retry blocked due to legitimate decline reasons"
                        )
                    else:
                        logger.info("No retry-eligible decline codes found")

            # Extract service and info if available
            if "service" in webhook_data:
                existing_data["service"] = webhook_data["service"]

            if "info" in webhook_data:
                existing_data["info"] = webhook_data["info"]

            updated_verification = KYCVerification.update(
                db,
                verification.id,
                {
                    "status": new_status,
                    "reviewed_at": datetime.utcnow(),
                    "provider_response": json.dumps(existing_data),
                },
            )

            if not updated_verification:
                logger.error(f"Failed to update verification {verification.id}")
                raise HTTPException(
                    status_code=500, detail="Failed to update verification"
                )

            logger.info(
                f"Verification {verification.id} successfully updated to status: {new_status}"
            )

            # Update user verification status if KYC is completed
            if new_status in ["verified", "declined"]:
                user_updated = KYCService._update_user_verification_status(
                    str(verification.user_id), new_status, db
                )

                if user_updated:
                    logger.info(
                        f"User {verification.user_id} verification status updated based on KYC result"
                    )
                else:
                    logger.warning(
                        f"Failed to update user {verification.user_id} verification status"
                    )

            return {"status": "success", "message": "Webhook processed successfully"}

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in webhook payload: {e}")
            raise HTTPException(
                status_code=400, detail="Invalid JSON in webhook payload"
            )

        except KYCWebhookError as e:
            logger.error(f"Webhook verification error: {e.message}")
            raise HTTPException(status_code=400, detail=f"Webhook error: {e.message}")

        except Exception as e:
            logger.error(f"Unexpected error processing webhook: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to process webhook")

    @staticmethod
    def process_webhook_request(
        payload: bytes, signature: str, db: Session
    ) -> Dict[str, str]:
        """
        Process webhook request with proper validation.

        Args:
            payload: Raw webhook payload
            signature: Webhook signature from headers
            db: Database session

        Returns:
            Success response dictionary

        Raises:
            HTTPException: If webhook processing fails
        """
        logger.info("Processing webhook request")

        # Validate payload
        if not payload:
            logger.error("Empty webhook payload")
            raise HTTPException(status_code=400, detail="Empty webhook payload")

        # Get environment setting from config rather than directly from env vars
        config = init_kyc_config()
        is_development = config.is_development

        # Log config details in debug mode
        if config.debug_mode:
            logger.debug(
                f"KYC config - Client ID length: {len(config.shufti_client_id)}"
            )
            logger.debug(
                f"KYC config - Secret key length: {len(config.shufti_secret_key)}"
            )
            logger.debug(f"KYC config - Environment: {config.environment}")
            logger.debug(f"KYC config - Debug mode: {config.debug_mode}")

        # Handle signature validation
        if not signature:
            if is_development:
                signature = "test_signature"  # Use default test signature
                logger.warning("Using default test signature for development")
            else:
                logger.error("Missing webhook signature")
                raise HTTPException(status_code=400, detail="Missing webhook signature")

        try:
            # First verify signature using raw payload bytes
            shufti = ShuftiService()

            # Log the raw payload and signature for debugging
            if config.debug_mode:
                logger.debug(
                    f"Raw payload for signature validation: {len(payload)} bytes"
                )
                logger.debug(f"Raw payload preview: {payload[:100]}...")
                logger.debug(f"Signature for validation: {signature}")

            # Log signature verification start
            logger.info("Starting webhook signature verification...")

            # Verify the signature using the raw payload bytes
            signature_valid = shufti.verify_webhook(payload, signature)

            # Log signature verification result
            if signature_valid:
                logger.info("✅ Webhook signature verification: PASSED")
            else:
                logger.error("❌ Webhook signature verification: FAILED")

            # In production, fail if signature is invalid
            if not signature_valid and not is_development:
                logger.error(
                    "Invalid webhook signature - rejecting webhook in production mode"
                )
                raise HTTPException(status_code=400, detail="Invalid webhook signature")
            elif not signature_valid:
                logger.warning("Invalid signature but continuing in development mode")

            # Then parse JSON for processing
            webhook_data = json.loads(payload.decode("utf-8"))

            # Debug logging in development mode
            if config.debug_mode:
                logger.debug(f"Webhook data: {webhook_data}")

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in webhook payload: {e}")
            raise HTTPException(
                status_code=400, detail="Invalid JSON in webhook payload"
            )
        except Exception as e:
            logger.error(f"Error processing webhook: {str(e)}")
            if is_development:
                logger.warning(f"Development mode: continuing despite error: {str(e)}")
                try:
                    webhook_data = json.loads(payload.decode("utf-8"))
                except Exception as json_e:
                    logger.error(f"Failed to parse payload as JSON: {json_e}")
                    raise HTTPException(
                        status_code=400, detail="Invalid webhook payload format"
                    )
            else:
                raise HTTPException(
                    status_code=400, detail=f"Webhook processing error: {str(e)}"
                )

        # Process webhook using existing method - pass empty signature since we already verified
        return KYCService.process_webhook(webhook_data, "", db)

    @staticmethod
    def get_verification_status_by_user_id(
        user_id: str, db: Session
    ) -> KYCStatusResponse:
        """
        Get KYC verification status using user ID to find the latest verification.

        Args:
            user_id: User's ID
            db: Database session

        Returns:
            KYCStatusResponse with verification status

        Raises:
            HTTPException: If verification not found or invalid
        """
        logger.info(f"KYC status requested for user: {user_id}")

        try:
            # Get user from database
            user = User.get_by_id(db, user_id)
            if not user:
                logger.warning(f"User {user_id} not found")
                raise HTTPException(status_code=404, detail="User not found")

            # Get user's verifications
            verifications = KYCRepository.get_user_verifications(db, user_id)

            if not verifications:
                logger.warning(f"No verifications found for user {user_id}")
                return None

            # Get the latest verification
            latest_verification = verifications[
                0
            ]  # Already ordered by submitted_at desc

            # Extract verification details from provider response
            verification_url = None
            decline_reasons = None
            verification_details = None
            message = None

            try:
                provider_response = json.loads(
                    latest_verification.provider_response or "{}"
                )
                logger.info(f"Provider response: {provider_response}")

                # Extract verification URL - check multiple locations
                verification_url = provider_response.get("verification_url")

                # If not found at top level, check inside shufti_result (for retry verifications)
                if not verification_url:
                    shufti_result = provider_response.get("shufti_result", {})
                    verification_url = shufti_result.get("verification_url")

                # Extract webhook data if available
                webhook_data = provider_response.get("webhook_data", {})

                # Extract decline reasons if available
                if latest_verification.status == "declined":
                    decline_reasons_raw = provider_response.get("decline_reasons")
                    if not decline_reasons_raw and webhook_data:
                        decline_reasons_raw = webhook_data.get("declined_reason")

                    # Convert decline_reasons to proper format for schema
                    if decline_reasons_raw:
                        if isinstance(decline_reasons_raw, str):
                            # If it's a string, convert to list
                            decline_reasons = (
                                [decline_reasons_raw]
                                if decline_reasons_raw.strip()
                                else None
                            )
                        elif isinstance(decline_reasons_raw, list):
                            # If it's already a list, use it
                            decline_reasons = (
                                decline_reasons_raw if decline_reasons_raw else None
                            )
                        else:
                            decline_reasons = None
                    else:
                        decline_reasons = None

                    # Set a user-friendly message
                    if decline_reasons:
                        message = "Verification was declined. Please try again with valid documents."

                # Extract verification details
                verification_details = provider_response.get("verification_details")
                if not verification_details and webhook_data:
                    verification_details = webhook_data.get("verification_data")

                # Set status-specific messages
                if latest_verification.status == "verified":
                    message = "Verification completed successfully."
                elif latest_verification.status == "initiated":
                    message = "Verification initiated. Please complete the verification process."
                elif latest_verification.status == "pending":
                    message = "Verification is being processed. Please wait."
                elif latest_verification.status == "cancelled":
                    message = "Verification was cancelled."
                elif latest_verification.status == "error":
                    message = "An error occurred during verification."

            except json.JSONDecodeError:
                logger.warning(
                    f"Could not parse provider_response for verification {latest_verification.id}"
                )

            logger.info(
                f"Returning status {latest_verification.status} for user {user_id}"
            )

            return KYCStatusResponse(
                verification_id=str(latest_verification.id),
                status=latest_verification.status,
                submitted_at=latest_verification.submitted_at,
                reviewed_at=latest_verification.reviewed_at,
                is_completed=latest_verification.reviewed_at is not None,
                verification_url=verification_url,
                decline_reasons=decline_reasons,
                verification_details=verification_details,
                message=message,
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error getting KYC status by user ID: {str(e)}")
            raise HTTPException(
                status_code=500, detail="Failed to retrieve verification status"
            )

    @staticmethod
    async def get_health_status() -> Dict[str, Any]:
        """
        Get KYC service health status.

        Returns:
            Dictionary with health status information
        """
        logger.info("KYC health check requested")

        try:
            # Check configuration
            config = init_kyc_config()

            # Simple health check - just verify configuration is loaded
            return {
                "status": "healthy",
                "environment": config.environment,
                "timestamp": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
            }
