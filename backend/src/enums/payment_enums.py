"""
Payment-related enumeration types.
"""

import enum


class PaymentMethodType(enum.Enum):
    """Payment method type for user payment methods."""
    
    FIAT = "fiat"
    CRYPTO = "crypto" 