"""
User Payment Method model for the crypto exchange platform.
Stores user's payment methods including fiat and crypto payment options.
"""

from sqlalchemy import Column, String, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from ..db.base import Base
from ..utils import timestamped, encrypted_field, crud_enabled
from ..enums import PaymentMethodType


@encrypted_field("value")  # Encrypt the 'value' field (IBAN, wallet address, etc.)
@crud_enabled
@timestamped
class UserPaymentMethod(Base):
    """
    User Payment Method model for storing user payment information.

    Handles both fiat (bank accounts, cards) and crypto (wallet addresses)
    payment methods. Links to User model for ownership tracking.
    """

    __tablename__ = "user_payment_methods"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign key to User
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Payment method details
    type = Column(Enum(PaymentMethodType), nullable=False)
    currency = Column(String, nullable=False)
    value = Column(String, nullable=False)  # IBAN, card number, wallet address, etc.

    # Relationships
    user = relationship("User", back_populates="payment_methods")

    # Note: created_at and updated_at are automatically added by @timestamped
    # Note: 'value' field is automatically encrypted/decrypted by @encrypted_field
    #       - Stored encrypted in database for security
    #       - Automatically decrypted when accessed in code
    #       - Transparent encryption/decryption for IBAN, wallet addresses, etc.
    # Note: CRUD operations added by @crud_enabled decorator:
    #       - UserPaymentMethod.create(), get_by_id(), get_all(), get_paginated(), etc.

    def __repr__(self):
        return f"<UserPaymentMethod(id={self.id}, user_id={self.user_id}, type={self.type.value}, currency={self.currency})>"
