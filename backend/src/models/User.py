"""
User model for the crypto exchange platform.
Represents registered users with authentication and profile information.
"""

from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from ..db.base import Base
from ..utils import auditable, crud_enabled



@crud_enabled
@auditable
class User(Base):
    """
    User model representing registered users in the crypto exchange platform.

    Includes authentication fields, profile information, verification status,
    and role-based access control. Uses UUID as primary key for enhanced security.
    """

    __tablename__ = "users"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Profile information
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone_number = Column(String, unique=True, index=True, nullable=True)
    country = Column(String(2), nullable=True, doc="ISO 3166-1 alpha-2 country code")

    # Authentication
    password = Column(String, nullable=False)

    # Status and permissions
    is_verified = Column(Boolean, default=False, nullable=False)
    is_blocked = Column(Boolean, default=False, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)

    # Relationships
    kyc_verifications = relationship("KYCVerification", back_populates="user")
    payment_methods = relationship("UserPaymentMethod", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    tickets = relationship("Ticket", back_populates="user")
    sent_messages = relationship("TicketMessage", back_populates="sender")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user")

    # Note: created_at, updated_at, and deleted_at are automatically added by @auditable
    # The decorator also adds soft_delete(), restore(), and is_deleted property methods
    #
    # CRUD operations added by @crud_enabled decorator:
    # - User.create(db, **kwargs) -> User
    # - User.get_by_id(db, id) -> User | None
    # - User.get_all(db) -> List[User]
    # - User.get_paginated(db, page, limit) -> Dict
    # - User.update(db, id, updates) -> User | None
    # - User.delete(db, id) -> bool
    # - User.count(db) -> int
    # - User.exists(db, id) -> bool

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, is_admin={self.is_admin})>"
