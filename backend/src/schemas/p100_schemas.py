"""
P100 schemas for the SwapHubu platform.
Schemas for P100 API integration endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class P100HealthResponse(BaseModel):
    """Schema for P100 health check response."""

    status: str = Field(..., description="Health status (healthy/unhealthy)")
    service: str = Field(..., description="Service name")
    message: str = Field(..., description="Health status message")


class P100WebhookResponse(BaseModel):
    """Schema for P100 webhook response."""

    message: str = Field(..., description="Webhook processing result message")
    status: Optional[str] = Field(None, description="Processing status")
