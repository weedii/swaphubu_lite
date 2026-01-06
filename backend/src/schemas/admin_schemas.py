"""
Admin-specific Pydantic schemas for the SwapHubu platform.
Handles request/response serialization for admin operations.
"""

from pydantic import BaseModel, Field
from uuid import UUID


class GetUserByIdRequest(BaseModel):
    """Schema for getting user by ID request body."""
    
    user_id: str = Field(
        ..., 
        description="The user's unique identifier (UUID)"
    )


class BlockUserRequest(BaseModel):
    """Schema for blocking/unblocking user request body."""
    
    user_id: str = Field(
        ..., 
        description="The user's unique identifier (UUID)"
    )


class AdminActionResponse(BaseModel):
    """Schema for admin action responses."""
    
    success: bool = Field(..., description="Whether the action was successful")
    message: str = Field(..., description="Response message")
    data: dict = Field(default_factory=dict, description="Additional response data")