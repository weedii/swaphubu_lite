"""
KYC endpoints - clean HTTP layer only.
Business logic handled in KYC service.
"""

from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session

from ..services.kyc_service import KYCService
from ..schemas.kyc_schemas import (
    KYCUserRequest,
    KYCStartResponse,
    KYCStatusResponse,
    KYCHealthResponse,
    KYCWebhookResponse,
)
from ..db.base import get_db
import logging
import json

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(tags=["KYC"])


@router.post("/start", response_model=KYCStartResponse)
async def start_kyc(
    request: Request,
    kyc_request: KYCUserRequest,
    db: Session = Depends(get_db),
):
    """
    Start KYC verification endpoint with user ID.

    Authentication is automatically handled by the middleware.
    The authenticated user is available in request.state.user
    """
    # Access the authenticated user from request state
    user = request.state.user
    logger.info(
        f"Starting KYC verification for user: {kyc_request.user_id} by {user.id}"
    )

    return await KYCService.start_verification_by_user_id(kyc_request.user_id, db)


@router.post("/webhook", response_model=KYCWebhookResponse)
async def handle_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Shufti Pro webhook endpoint.
    This endpoint is public and doesn't require authentication.
    """
    logger.info("Received KYC webhook request")

    try:
        # Get signature from headers (ShuftiPro sends both signature and sp_signature)
        # Try all possible header names and log which one was found
        signature = None
        signature_header_names = [
            "signature",
            "sp_signature",
            "X-Signature",
            "x-signature",
        ]

        for header_name in signature_header_names:
            if header_name in request.headers:
                signature = request.headers.get(header_name)
                logger.info(f"Found signature in header: {header_name}")
                break

        if not signature:
            logger.warning("No signature header found in request")
            signature = ""  # Empty string will be handled by the service layer

        # Log headers for debugging (excluding sensitive info)
        safe_headers = {
            k: v
            for k, v in request.headers.items()
            if k.lower() not in ["authorization"]
        }
        logger.info(f"Webhook headers: {safe_headers}")

        # Get raw payload as bytes - DO NOT decode or modify it
        # This preserves the exact bytes for signature validation
        payload = await request.body()

        if not payload:
            logger.error("Empty webhook payload received")
            raise HTTPException(status_code=400, detail="Empty payload")

        # Log payload size for debugging
        logger.info(f"Webhook payload size: {len(payload)} bytes")

        # For debugging purposes, log the payload content (as JSON)
        # But still pass the raw bytes to the service layer
        try:
            payload_json = json.loads(payload)
            logger.info(f"Webhook payload: {payload_json}")

            # Log the reference ID for easier tracking
            if "reference" in payload_json:
                logger.info(f"Webhook reference ID: {payload_json['reference']}")

        except json.JSONDecodeError:
            logger.error("Could not parse webhook payload as JSON for logging")
            # Continue processing - we'll let the service layer handle this error

        # Delegate to service layer with raw payload bytes
        # This ensures the exact bytes are used for signature validation
        result = KYCService.process_webhook_request(payload, signature, db)

        logger.info("Webhook processed successfully")
        return KYCWebhookResponse(message=result["message"])

    except HTTPException as http_ex:
        # Log HTTP exceptions and re-raise
        logger.error(f"HTTP exception processing webhook: {http_ex.detail}")
        raise
    except Exception as e:
        # Log unexpected errors
        logger.error(f"Unexpected error processing webhook: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Internal server error processing webhook"
        )


@router.get("/status/{user_id}", response_model=KYCStatusResponse | None)
def get_status(
    request: Request,
    user_id: str,
    db: Session = Depends(get_db),
):
    """
    Get KYC verification status endpoint with user ID.

    Authentication is automatically handled by the middleware.
    The authenticated user is available in request.state.user
    """
    # Access the authenticated user from request state
    user = request.state.user
    logger.info(f"Getting KYC status for user: {user_id} by {user.id}")

    return KYCService.get_verification_status_by_user_id(user_id, db)


@router.post("/retry/{user_id}")
async def start_retry(
    user_id: str,
    db: Session = Depends(get_db),
):
    """Start retry verification for a user who has a retry_pending verification."""
    logger.info(f"Retry verification requested for user: {user_id}")
    
    try:
        result = await KYCService.start_retry_verification(user_id, db)
        
        if result["success"]:
            return {
                "status": "success",
                "message": result["message"],
                "data": {
                    "verification_id": result["verification_id"],
                    "reference": result["reference"],
                    "verification_url": result["verification_url"]
                }
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in retry endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start retry: {str(e)}")


@router.get("/health", response_model=KYCHealthResponse)
async def kyc_health_check():
    """Health check endpoint for KYC service."""
    result = await KYCService.get_health_status()
    return KYCHealthResponse(**result)
