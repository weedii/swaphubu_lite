"""
CRUD Decorators for SQLAlchemy models.
Provides automatic CRUD operations without complex architecture overhead.
"""

from typing import Type, Any, List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone


def crud_enabled(cls: Type[Any]) -> Type[Any]:
    """
    Decorator that adds basic CRUD operations to SQLAlchemy models.

    Automatically adds the following methods to your model:
    - create(db, **kwargs) -> Model
    - get_by_id(db, id) -> Model | None
    - get_all(db) -> List[Model]
    - get_paginated(db, page, limit) -> Dict
    - update(db, id, updates) -> Model | None
    - delete(db, id) -> bool
    - count(db) -> int
    - exists(db, id) -> bool

    Features:
    - Automatically respects soft deletes (deleted_at field)
    - Auto-updates updated_at field on updates
    - Built-in pagination support
    - Type-safe operations
    - Simple and direct database access

    Usage:
        @crud_enabled
        @auditable
        class User(Base):
            __tablename__ = "users"
            # your fields here

        # Usage:
        user = await User.create(db, email="test@test.com")
        user = await User.get_by_id(db, user_id)
        users = await User.get_paginated(db, page=1, limit=10)
    """

    def _has_soft_delete() -> bool:
        """Check if model has soft delete capability (deleted_at field)."""
        return hasattr(cls, "deleted_at")

    def _apply_soft_delete_filter(query):
        """Apply soft delete filter to query if model supports it."""
        if _has_soft_delete():
            return query.filter(cls.deleted_at.is_(None))
        return query

    # CREATE OPERATION
    @classmethod
    def create(cls, db: Session, **kwargs) -> cls:
        """
        Create a new record in the database.

        Args:
            db: Database session
            **kwargs: Field values for the new record

        Returns:
            Created model instance

        Example:
            user = User.create(db, email="test@test.com", first_name="John")
        """
        obj = cls(**kwargs)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    # READ OPERATIONS
    @classmethod
    def get_by_id(cls, db: Session, id: Any) -> Optional[cls]:
        """
        Get a record by its ID (respects soft deletes).

        Args:
            db: Database session
            id: Primary key value

        Returns:
            Model instance or None if not found

        Example:
            user = User.get_by_id(db, user_id)
        """
        query = db.query(cls).filter(cls.id == id)
        query = _apply_soft_delete_filter(query)
        return query.first()

    @classmethod
    def get_all(cls, db: Session) -> List[cls]:
        """
        Get all records (respects soft deletes).

        Args:
            db: Database session

        Returns:
            List of all model instances

        Example:
            users = User.get_all(db)
        """
        query = db.query(cls)
        query = _apply_soft_delete_filter(query)
        return query.all()

    @classmethod
    def get_paginated(
        cls, db: Session, page: int = 1, limit: int = 10
    ) -> Dict[str, Any]:
        """
        Get paginated records with metadata.

        Args:
            db: Database session
            page: Page number (1-based)
            limit: Number of records per page

        Returns:
            Dictionary with 'items', 'total', 'page', 'limit', 'pages'

        Example:
            result = User.get_paginated(db, page=2, limit=20)
            users = result['items']
            total_pages = result['pages']
        """
        if page < 1:
            page = 1
        if limit < 1:
            limit = 10

        offset = (page - 1) * limit
        query = db.query(cls)
        query = _apply_soft_delete_filter(query)

        total = query.count()
        items = query.offset(offset).limit(limit).all()

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit if total > 0 else 0,
        }

    # UPDATE OPERATION
    @classmethod
    def update(cls, db: Session, id: Any, updates: Dict[str, Any]) -> Optional[cls]:
        """
        Update a record by ID.

        Args:
            db: Database session
            id: Primary key value
            updates: Dictionary of field updates

        Returns:
            Updated model instance or None if not found

        Example:
            user = User.update(db, user_id, {"first_name": "Jane", "is_verified": True})
        """
        obj = cls.get_by_id(db, id)
        if not obj:
            return None

        # Apply updates
        for field, value in updates.items():
            if hasattr(obj, field):
                setattr(obj, field, value)

        # Auto-update updated_at timestamp if field exists
        if hasattr(obj, "updated_at"):
            obj.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(obj)
        return obj

    # DELETE OPERATION
    @classmethod
    def delete(cls, db: Session, id: Any) -> bool:
        """
        Delete a record by ID (soft delete if supported, otherwise hard delete).

        Args:
            db: Database session
            id: Primary key value

        Returns:
            True if deleted successfully, False if not found

        Example:
            success = User.delete(db, user_id)
        """
        obj = cls.get_by_id(db, id)
        if not obj:
            return False

        if _has_soft_delete():
            # Soft delete: set deleted_at timestamp
            obj.deleted_at = datetime.now(timezone.utc)
            db.commit()
        else:
            # Hard delete: remove from database
            db.delete(obj)
            db.commit()

        return True

    # UTILITY OPERATIONS
    @classmethod
    def count(cls, db: Session) -> int:
        """
        Count all records (respects soft deletes).

        Args:
            db: Database session

        Returns:
            Total count of records

        Example:
            total_users = User.count(db)
        """
        query = db.query(func.count(cls.id))
        if _has_soft_delete():
            query = query.filter(cls.deleted_at.is_(None))
        return query.scalar()

    @classmethod
    def exists(cls, db: Session, id: Any) -> bool:
        """
        Check if a record exists by ID.

        Args:
            db: Database session
            id: Primary key value

        Returns:
            True if record exists, False otherwise

        Example:
            if User.exists(db, user_id):
                print("User found!")
        """
        return cls.get_by_id(db, id) is not None

    # Bind all methods to the class
    cls.create = create
    cls.get_by_id = get_by_id
    cls.get_all = get_all
    cls.get_paginated = get_paginated
    cls.update = update
    cls.delete = delete
    cls.count = count
    cls.exists = exists

    return cls
