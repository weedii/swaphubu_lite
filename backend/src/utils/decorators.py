from sqlalchemy import Column, DateTime, event
from datetime import datetime, timezone
from typing import Type, Any


def timestamped(cls: Type[Any]) -> Type[Any]:
    """
    Decorator to add created_at and updated_at fields to a SQLAlchemy model.

    Usage:
        @timestamped
        class MyModel(Base):
            __tablename__ = "my_table"
            # your fields here
    """

    # Add created_at and updated_at columns
    cls.created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    cls.updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    return cls


def soft_deletable(cls: Type[Any]) -> Type[Any]:
    """
    Decorator to add soft delete functionality with deleted_at field.

    Usage:
        @soft_deletable
        class MyModel(Base):
            __tablename__ = "my_table"
            # your fields here
    """

    # Add deleted_at column
    cls.deleted_at = Column(DateTime, nullable=True)

    # Add soft delete method
    def soft_delete(self):
        """Soft delete the record by setting deleted_at to current timestamp"""
        self.deleted_at = datetime.now(timezone.utc)

    # Add is_deleted property
    @property
    def is_deleted(self) -> bool:
        """Check if the record is soft deleted"""
        return self.deleted_at is not None

    # Add restore method
    def restore(self):
        """Restore a soft deleted record by setting deleted_at to None"""
        self.deleted_at = None

    # Bind methods to the class
    cls.soft_delete = soft_delete
    cls.is_deleted = is_deleted
    cls.restore = restore

    return cls


def auditable(cls: Type[Any]) -> Type[Any]:
    """
    Decorator to add full audit trail with created_at, updated_at, and deleted_at fields.
    Combines both timestamped and soft_deletable decorators.

    Usage:
        @auditable
        class MyModel(Base):
            __tablename__ = "my_table"
            # your fields here
    """

    # Apply both decorators
    cls = timestamped(cls)
    cls = soft_deletable(cls)

    return cls


def auto_updated(cls: Type[Any]) -> Type[Any]:
    """
    Enhanced decorator that automatically updates the updated_at field
    whenever any field in the model is changed.

    Usage:
        @auto_updated
        class MyModel(Base):
            __tablename__ = "my_table"
            # your fields here
    """

    # First apply timestamped decorator
    cls = timestamped(cls)

    # Add event listener for automatic updated_at updates
    @event.listens_for(cls, "before_update")
    def receive_before_update(mapper, connection, target):
        target.updated_at = datetime.now(timezone.utc)

    return cls


def creation_tracked(cls: Type[Any]) -> Type[Any]:
    """
    Decorator to add only created_at field for read-only/immutable records.

    Usage:
        @creation_tracked
        class MyModel(Base):
            __tablename__ = "my_table"
            # your fields here
    """

    # Add only created_at column
    cls.created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    return cls
