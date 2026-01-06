"""
Encryption Decorator Usage Examples
Demonstrates how to use the @encrypted_field decorator for securing sensitive data.

This file shows practical examples of using automatic field encryption/decryption
in a crypto exchange context.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

# Imports (these would be your actual imports)
from ..db.base import get_db
from ..models.UserPaymentMethod import UserPaymentMethod
from ..utils import encrypt_field_value, decrypt_field_value

# Example router
router = APIRouter(prefix="/payment-methods", tags=["payment-methods"])


# ============================================================================
# AUTOMATIC ENCRYPTION USING @encrypted_field DECORATOR
# ============================================================================


@router.post("/")
async def create_payment_method(
    user_id: UUID,
    payment_type: str,  # "fiat" or "crypto"
    currency: str,
    value: str,  # IBAN, wallet address, etc.
    db: Session = Depends(get_db),
):
    """
    Create a payment method with automatic encryption of sensitive data.

    The 'value' field is automatically encrypted before storing in database.
    """

    # Create payment method - encryption happens automatically!
    payment_method = UserPaymentMethod.create(
        db,
        user_id=user_id,
        type=payment_type,
        currency=currency,
        value=value,  # This will be encrypted automatically in the database
    )

    return {
        "message": "Payment method created successfully",
        "id": str(payment_method.id),
        "currency": payment_method.currency,
        "value": payment_method.value,  # This will be decrypted automatically
        "type": payment_method.type.value,
    }


@router.get("/{payment_method_id}")
async def get_payment_method(payment_method_id: UUID, db: Session = Depends(get_db)):
    """
    Get a payment method with automatic decryption of sensitive data.

    The 'value' field is automatically decrypted when accessed.
    """

    # Get payment method - decryption happens automatically!
    payment_method = UserPaymentMethod.get_by_id(db, payment_method_id)

    if not payment_method:
        raise HTTPException(status_code=404, detail="Payment method not found")

    return {
        "id": str(payment_method.id),
        "user_id": str(payment_method.user_id),
        "type": payment_method.type.value,
        "currency": payment_method.currency,
        "value": payment_method.value,  # Automatically decrypted!
        "created_at": payment_method.created_at,
    }


@router.get("/user/{user_id}")
async def get_user_payment_methods(user_id: UUID, db: Session = Depends(get_db)):
    """
    Get all payment methods for a user with automatic decryption.
    """

    # Query all payment methods for user
    payment_methods = (
        db.query(UserPaymentMethod).filter(UserPaymentMethod.user_id == user_id).is_deleted(False).all()
    )

    return {
        "user_id": str(user_id),
        "payment_methods": [
            {
                "id": str(pm.id),
                "type": pm.type.value,
                "currency": pm.currency,
                "value": pm.value,  # Automatically decrypted for each one!
                "created_at": pm.created_at,
            }
            for pm in payment_methods
        ],
    }


@router.patch("/{payment_method_id}")
async def update_payment_method(
    payment_method_id: UUID,
    value: str = None,
    currency: str = None,
    db: Session = Depends(get_db),
):
    """
    Update a payment method with automatic encryption of new sensitive data.
    """

    updates = {}
    if value is not None:
        updates["value"] = value  # Will be encrypted automatically
    if currency is not None:
        updates["currency"] = currency

    # Update payment method - encryption happens automatically!
    payment_method = UserPaymentMethod.update(db, payment_method_id, updates)

    if not payment_method:
        raise HTTPException(status_code=404, detail="Payment method not found")

    return {
        "message": "Payment method updated successfully",
        "id": str(payment_method.id),
        "value": payment_method.value,  # Automatically decrypted
        "currency": payment_method.currency,
    }


# ============================================================================
# MANUAL ENCRYPTION/DECRYPTION FUNCTIONS
# ============================================================================


@router.post("/encrypt")
async def manually_encrypt_value(value: str):
    """
    Manually encrypt a value using the encryption utilities.

    Useful for testing or when you need to encrypt data outside of models.
    """

    encrypted_value = encrypt_field_value(value)

    return {
        "original_value": value,
        "encrypted_value": encrypted_value,
        "message": "Value encrypted successfully",
    }


@router.post("/decrypt")
async def manually_decrypt_value(encrypted_value: str):
    """
    Manually decrypt a value using the encryption utilities.

    Useful for testing or debugging encryption.
    """

    try:
        decrypted_value = decrypt_field_value(encrypted_value)

        return {
            "encrypted_value": encrypted_value,
            "decrypted_value": decrypted_value,
            "message": "Value decrypted successfully",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Decryption failed: {str(e)}")


# ============================================================================
# REAL-WORLD EXAMPLES FOR CRYPTO EXCHANGE
# ============================================================================


@router.post("/crypto-wallet")
async def add_crypto_wallet(
    user_id: UUID,
    currency: str,  # BTC, ETH, etc.
    wallet_address: str,  # Will be encrypted
    db: Session = Depends(get_db),
):
    """
    Add a crypto wallet for a user.

    The wallet address is automatically encrypted for security.
    """

    # Example wallet addresses that will be encrypted:
    # Bitcoin: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
    # Ethereum: 0x742B2A1FE69b3e9b0f0E8e3F8F1F9E8F0E8F1F9E

    wallet = UserPaymentMethod.create(
        db,
        user_id=user_id,
        type="crypto",
        currency=currency.upper(),
        value=wallet_address,  # Encrypted automatically!
    )

    return {
        "message": f"{currency} wallet added successfully",
        "wallet_id": str(wallet.id),
        "currency": wallet.currency,
        "wallet_address": wallet.value,  # Decrypted automatically for response
        "masked_address": f"{wallet.value[:6]}...{wallet.value[-4:]}",  # Masked for UI
    }


@router.post("/bank-account")
async def add_bank_account(
    user_id: UUID,
    currency: str,  # USD, EUR, GBP, etc.
    iban: str,  # Will be encrypted
    db: Session = Depends(get_db),
):
    """
    Add a bank account for a user.

    The IBAN is automatically encrypted for security.
    """

    # Example IBANs that will be encrypted:
    # GB82 WEST 1234 5698 7654 32
    # DE89 3704 0044 0532 0130 00

    bank_account = UserPaymentMethod.create(
        db,
        user_id=user_id,
        type="fiat",
        currency=currency.upper(),
        value=iban,  # Encrypted automatically!
    )

    return {
        "message": f"{currency} bank account added successfully",
        "account_id": str(bank_account.id),
        "currency": bank_account.currency,
        "iban": bank_account.value,  # Decrypted automatically for response
        "masked_iban": f"{bank_account.value[:4]} **** **** **** {bank_account.value[-4:]}",  # Masked for UI
    }


# ============================================================================
# SECURITY DEMONSTRATION
# ============================================================================

"""
ENCRYPTION SECURITY DEMONSTRATION:

1. When you store sensitive data:
   payment_method = UserPaymentMethod.create(
       db, 
       value="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"  # Plain text wallet address
   )
   
   # In database: "gAAAAABhZ8X5K3..." (encrypted)
   # In your code: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" (decrypted)

2. Database contains only encrypted values:
   SELECT value FROM user_payment_methods;
   -- Returns: "gAAAAABhZ8X5K3Q2..." (encrypted, unreadable)

3. Your code always sees decrypted values:
   print(payment_method.value)
   -- Prints: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" (decrypted)

4. Encryption key management:
   - Set ENCRYPTION_KEY environment variable for production
   - Uses secure Fernet encryption (AES 128 in CBC mode)
   - Automatic key derivation from password if needed

5. Benefits:
   ✅ Database breaches expose only encrypted data
   ✅ Transparent encryption/decryption in your code
   ✅ Works with all CRUD operations automatically
   ✅ Secure key management through environment variables
   ✅ Backward compatible with existing data
"""
