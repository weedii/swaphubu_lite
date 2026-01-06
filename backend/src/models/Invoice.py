"""
Invoice model for the crypto exchange platform.
Generates payment instructions for transactions including IBAN and wallet addresses.
"""

from sqlalchemy import Column, String, ForeignKey, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.base import Base
from ..utils import creation_tracked, crud_enabled, encrypted_field


@crud_enabled
@creation_tracked
@encrypted_field("iban", "wallet_address")
class Invoice(Base):
    """
    Invoice model for transaction payment instructions.

    Contains payment details including IBAN for bank transfers and wallet
    addresses for crypto payments. Generated automatically for each transaction
    with unique reference codes for payment tracking.

    Also stores file information when invoices are hosted on external storage
    providers like Cloudinary, AWS S3, etc.
    """

    __tablename__ = "invoices"

    # Primary key and Foreign key to Transaction (One-to-One relationship)
    transaction_id = Column(
        UUID(as_uuid=True), ForeignKey("transactions.id"), primary_key=True, index=True
    )

    # Payment instructions
    iban = Column(String, nullable=True)  # For fiat payments
    wallet_address = Column(String, nullable=True)  # For crypto payments
    reference_code = Column(String, nullable=False, unique=True)  # e.g., "G5-52264"

    # File storage information for hosted invoices
    file_url = Column(String, nullable=True)  # Direct URL to access the invoice file
    file_storage_id = Column(
        String, nullable=True
    )  # Unique ID/key from the storage provider
    file_size = Column(BigInteger, nullable=True)  # File size in bytes
    file_type = Column(
        String, nullable=True
    )  # MIME type, e.g., "application/pdf", "image/png"

    # Relationships
    transaction = relationship("Transaction", back_populates="invoice")

    # Note: created_at is automatically added by @creation_tracked
    # Invoices are immutable once created, so no updated_at needed
    # Note: CRUD operations added by @crud_enabled decorator:
    #       - Invoice.create(), get_by_id(), get_all(), get_paginated(), etc.

    def __repr__(self):
        return f"<Invoice(transaction_id={self.transaction_id}, reference_code={self.reference_code}, file_url={self.file_url})>"
