"""
Centralized API router configuration.
Includes all individual routers with their prefixes and tags.
Updated to include admin endpoints with proper admin-only access.
"""

from fastapi import APIRouter

# Import all routers
from .auth import router as auth_router
from .kyc import router as kyc_router
from .users import router as users_router
from .p100 import router as p100_router
from .admin import router as admin_router

# Create the main API router
api_router = APIRouter()

# Include all routers with their prefixes and tags
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(kyc_router, prefix="/kyc", tags=["KYC"])
api_router.include_router(users_router, prefix="/users", tags=["User Management"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin Management"])
api_router.include_router(p100_router, prefix="/p100", tags=["P100"])
