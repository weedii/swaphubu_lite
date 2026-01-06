"""
Admin management endpoints - clean HTTP layer only.
Business logic handled in AdminService for admin-specific operations.
All endpoints require admin privileges via get_current_admin dependency.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from ..db import get_db
from ..models import User
from ..schemas.user_schemas import UserProfile, User as UserSchema, UserList, UserUpdate
from ..schemas.admin_schemas import GetUserByIdRequest, BlockUserRequest
from ..services.admin_service import AdminService
from ..utils.auth import get_current_admin

router = APIRouter()


@router.get("/users", response_model=UserList)
def get_all_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get paginated list of all users (admin only)."""
    result = AdminService.get_all_users(
        db=db,
        current_admin=current_admin,
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return UserList(**result)


@router.get("/users/search", response_model=UserList)
def search_users(
    search_term: Optional[str] = Query(None, description="Search in email, first_name, last_name"),
    country: Optional[str] = Query(None, description="ISO 3166-1 alpha-2 country code"),
    is_verified: Optional[bool] = Query(None, description="Filter by verification status"),
    is_blocked: Optional[bool] = Query(None, description="Filter by blocked status"),
    is_admin: Optional[bool] = Query(None, description="Filter by admin status"),
    registration_start: Optional[datetime] = Query(None, description="Registration date start filter"),
    registration_end: Optional[datetime] = Query(None, description="Registration date end filter"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Advanced user search with admin-specific filters (admin only)."""
    result = AdminService.search_users(
        db=db,
        current_admin=current_admin,
        search_term=search_term,
        country=country,
        is_verified=is_verified,
        is_blocked=is_blocked,
        is_admin=is_admin,
        registration_start=registration_start,
        registration_end=registration_end,
        page=page,
        limit=limit,
    )
    return UserList(**result)


@router.put("/users/get-by-id", response_model=UserSchema)
def get_user_by_id(
    request: GetUserByIdRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get specific user details by ID (admin only)."""
    result = AdminService.get_user_by_id(
        db=db, current_admin=current_admin, user_id=request.user_id
    )
    return result["user"]


@router.put("/users/{user_id}", response_model=UserSchema)
def update_user_admin_fields(
    user_id: str,
    user_data: UserUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update admin-specific fields for a user (admin only)."""
    # Convert Pydantic model to dict, excluding None values
    update_data = user_data.model_dump(exclude_unset=True)
    
    result = AdminService.update_user_admin_fields(
        db=db, current_admin=current_admin, user_id=user_id, update_data=update_data
    )
    return result["user"]


@router.post("/users/block")
def block_user(
    request: BlockUserRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Block a user account (admin only)."""
    result = AdminService.block_user(
        db=db, current_admin=current_admin, user_id=request.user_id, block_status=True
    )
    return result


@router.post("/users/unblock")
def unblock_user(
    request: BlockUserRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Unblock a user account (admin only)."""
    result = AdminService.block_user(
        db=db, current_admin=current_admin, user_id=request.user_id, block_status=False
    )
    return result


@router.get("/statistics")
def get_user_statistics(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get comprehensive user statistics (admin only)."""
    result = AdminService.get_user_statistics(db=db, current_admin=current_admin)
    return result


@router.get("/reports")
def get_system_reports(
    days: int = Query(30, ge=1, le=365, description="Number of days for analytics"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get system reports and analytics (admin only)."""
    result = AdminService.get_system_reports(
        db=db, current_admin=current_admin, days=days
    )
    return result


@router.get("/users/unverified", response_model=UserList)
def get_unverified_users(
    days_old: int = Query(7, ge=1, description="Minimum days since registration"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get unverified users for admin review (admin only)."""
    result = AdminService.get_unverified_users(
        db=db, current_admin=current_admin, days_old=days_old, page=page, limit=limit
    )
    return UserList(**result)


@router.get("/users/blocked", response_model=UserList)
def get_blocked_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get blocked users for admin management (admin only)."""
    result = AdminService.get_blocked_users(
        db=db, current_admin=current_admin, page=page, limit=limit
    )
    return UserList(**result)


@router.get("/users/admins", response_model=UserList)
def get_admin_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get all admin users for admin management (admin only)."""
    result = AdminService.get_admin_users(
        db=db, current_admin=current_admin, page=page, limit=limit
    )
    return UserList(**result)