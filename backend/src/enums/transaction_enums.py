"""
Transaction-related enumeration types.
"""

import enum


class TransactionType(enum.Enum):
    """Transaction type for crypto exchange operations."""
    
    FIAT_TO_CRYPTO = "fiat_to_crypto"
    CRYPTO_TO_FIAT = "crypto_to_fiat"


class TransactionStatus(enum.Enum):
    """Transaction status for tracking transaction lifecycle."""
    
    RECEIVED = "received"
    COMPLETED = "completed"
    PENDING = "pending"
    CANCELLED = "cancelled"
    FAILED = "failed" 