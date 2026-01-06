"""
CRUD Decorator Usage Examples
Demonstrates how to use the @crud_enabled decorator in real FastAPI endpoints.

This file shows practical examples of using the automated CRUD operations
and custom repositories in a crypto exchange context.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

# Imports (these would be your actual imports)
from ..db.base import get_db
from ..models.User import User
from ..repositories.UserRepository import UserRepository
from ..repositories.AdminRepository import AdminRepository

# UserRole removed - using is_admin boolean instead

# Example router
router = APIRouter(prefix="/users", tags=["users"])


# ============================================================================
# BASIC CRUD OPERATIONS USING @crud_enabled DECORATOR
# ============================================================================


@router.post("/", response_model=dict)
async def create_user(
    email: str,
    first_name: str,
    last_name: str,
    phone_number: str = None,
    db: Session = Depends(get_db),
):
    """Create a new user using the automatic CRUD method."""

    # Using the @crud_enabled decorator method - ONE LINE!
    user = User.create(
        db,
        email=email,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        password="hashed_password_here",  # In real app, hash the password
    )

    return {
        "message": "User created successfully",
        "user_id": str(user.id),
        "email": user.email,
    }


@router.get("/{user_id}")
async def get_user(user_id: UUID, db: Session = Depends(get_db)):
    """Get a user by ID using the automatic CRUD method."""

    # Using the @crud_enabled decorator method - ONE LINE!
    user = User.get_by_id(db, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user.id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_verified": user.is_verified,
        "role": user.role.value,
        "created_at": user.created_at,
    }


@router.get("/")
async def get_users_paginated(
    page: int = 1, limit: int = 10, db: Session = Depends(get_db)
):
    """Get paginated users using the automatic CRUD method."""

    # Using the @crud_enabled decorator method - ONE LINE!
    result = User.get_paginated(db, page=page, limit=limit)

    return {
        "users": [
            {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role.value,
            }
            for user in result["items"]
        ],
        "pagination": {
            "total": result["total"],
            "page": result["page"],
            "limit": result["limit"],
            "pages": result["pages"],
        },
    }


@router.patch("/{user_id}")
async def update_user(
    user_id: UUID,
    first_name: str = None,
    last_name: str = None,
    is_verified: bool = None,
    db: Session = Depends(get_db),
):
    """Update a user using the automatic CRUD method."""

    # Prepare updates dict (exclude None values)
    updates = {}
    if first_name is not None:
        updates["first_name"] = first_name
    if last_name is not None:
        updates["last_name"] = last_name
    if is_verified is not None:
        updates["is_verified"] = is_verified

    # Using the @crud_enabled decorator method - ONE LINE!
    user = User.update(db, user_id, updates)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "message": "User updated successfully",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "updated_at": user.updated_at,
        },
    }


@router.delete("/{user_id}")
async def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    """Delete a user using the automatic CRUD method (soft delete)."""

    # Using the @crud_enabled decorator method - ONE LINE!
    success = User.delete(db, user_id)

    if not success:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted successfully"}


@router.get("/stats/count")
async def get_user_count(db: Session = Depends(get_db)):
    """Get total user count using the automatic CRUD method."""

    # Using the @crud_enabled decorator method - ONE LINE!
    count = User.count(db)

    return {"total_users": count}


# ============================================================================
# CUSTOM QUERIES USING REPOSITORY PATTERN
# ============================================================================


@router.get("/search/email/{email}")
async def find_user_by_email(email: str, db: Session = Depends(get_db)):
    """Find user by email using custom repository method."""

    # Using custom repository for specialized query
    user = UserRepository.find_by_email(db, email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user.id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }


@router.get("/admins")
async def get_verified_admins(db: Session = Depends(get_db)):
    """Get verified admin users using AdminRepository."""

    # Using AdminRepository for admin-specific query
    result = AdminRepository.get_admin_users(db, page=1, limit=100)
    users = result["users"]

    return {
        "role": "admin",
        "count": len(users),
        "users": [
            {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
            for user in users
        ],
    }


@router.get("/search/{search_term}")
async def search_users(search_term: str, db: Session = Depends(get_db)):
    """Search users by name or email using UserRepository for basic search."""

    # Using UserRepository for basic user search
    users = UserRepository.search_users_basic(db, search_term, limit=20)

    return {
        "search_term": search_term,
        "count": len(users),
        "users": [
            {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
            for user in users
        ],
    }


@router.get("/stats/by-role")
async def get_user_stats_by_role(db: Session = Depends(get_db)):
    """Get user statistics by role using AdminRepository."""

    # Using AdminRepository for admin analytics query
    stats = AdminRepository.get_user_statistics(db)

    return {
        "statistics": {"admin": stats["admin_users"], "user": stats["regular_users"]},
        "total": stats["total_users"],
    }


# ============================================================================
# COMPARISON: WITH vs WITHOUT @crud_enabled
# ============================================================================

"""
BEFORE @crud_enabled decorator:

@router.post("/users/old-way")
async def create_user_old_way(user_data: dict, db: Session = Depends(get_db)):
    # Manual CRUD - 6 lines of boilerplate code
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/users/{user_id}/old-way")  
async def get_user_old_way(user_id: UUID, db: Session = Depends(get_db)):
    # Manual query with soft delete handling - 4 lines
    user = db.query(User).filter(
        User.id == user_id,
        User.deleted_at.is_(None)
    ).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user

AFTER @crud_enabled decorator:

@router.post("/users/new-way")
async def create_user_new_way(user_data: dict, db: Session = Depends(get_db)):
    # Automatic CRUD - 1 line!
    return User.create(db, **user_data)

@router.get("/users/{user_id}/new-way")
async def get_user_new_way(user_id: UUID, db: Session = Depends(get_db)):
    # Automatic query with soft delete handling - 1 line!
    user = User.get_by_id(db, user_id)
    if not user:
        raise HTTPException(404, "User not found") 
    return user

RESULT: 90% less boilerplate code!
"""
