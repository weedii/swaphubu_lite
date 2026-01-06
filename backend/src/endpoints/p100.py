"""
P100 endpoints - clean HTTP layer only.
Business logic handled in P100 service.
"""

from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session

from ..services.p100_service import P100Service
from ..schemas.p100_schemas import (
    P100HealthResponse,
    P100WebhookResponse,
)
from ..db.base import get_db
import logging
import json

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(tags=["P100"])


@router.get("/webhook/health", response_model=P100HealthResponse)
async def p100_health_check():
    """Health check endpoint for P100 service."""

    result = await P100Service.get_health_status()
    return P100HealthResponse(**result)


@router.post("/webhook", response_model=P100WebhookResponse)
async def handle_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle P100 webhook endpoint.
    This endpoint is public and doesn't require authentication.
    """

    logger.info("Received P100 webhook request")

    try:
        # Get signature from headers
        signature = request.headers.get("signature", "")

        # Log headers for debugging (excluding sensitive info)
        safe_headers = {
            k: v
            for k, v in request.headers.items()
            if k.lower() not in ["authorization"]
        }
        logger.info(f"P100 webhook headers: {safe_headers}")

        # Get raw payload as bytes - DO NOT decode or modify it
        # This preserves the exact bytes for signature validation
        payload = await request.body()

        if not payload:
            logger.error("Empty P100 webhook payload received")
            raise HTTPException(status_code=400, detail="Empty payload")

        # Log payload size for debugging
        logger.info(f"P100 webhook payload size: {len(payload)} bytes")

        # For debugging purposes, log the payload content (as JSON)
        # But still pass the raw bytes to the service layer
        try:
            payload_json = json.loads(payload)
            logger.info(f"P100 webhook payload: {payload_json}")

        except json.JSONDecodeError:
            logger.error("Could not parse P100 webhook payload as JSON for logging")
            # Continue processing - we'll let the service layer handle this error

        # Delegate to service layer with raw payload bytes
        result = P100Service.process_webhook_request(payload, signature, db)

        logger.info("P100 webhook processed successfully")
        return P100WebhookResponse(
            message=result["message"], status=result.get("status")
        )

    except HTTPException as http_ex:
        # Log HTTP exceptions and re-raise
        logger.error(f"HTTP exception processing P100 webhook: {http_ex.detail}")
        raise
    except Exception as e:
        # Log unexpected errors
        logger.error(f"Unexpected error processing P100 webhook: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Internal server error processing P100 webhook"
        )
