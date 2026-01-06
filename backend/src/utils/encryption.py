"""
Encryption utilities for securing sensitive data in the database.
Used by the @encrypted_field decorator to automatically encrypt/decrypt sensitive fields.
"""

import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from typing import Optional


class EncryptionManager:
    """
    Manages encryption and decryption of sensitive data.

    Uses Fernet symmetric encryption (AES 128 in CBC mode) which is secure
    and suitable for database field encryption.
    """

    _instance = None
    _cipher = None

    def __new__(cls):
        """Singleton pattern to ensure one encryption key across the app."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize the encryption manager with key from environment."""
        if self._cipher is None:
            self._cipher = self._get_cipher()

    def _get_cipher(self) -> Fernet:
        """
        Create encryption cipher from environment variables.

        Returns:
            Fernet cipher instance

        Raises:
            ValueError: If encryption key is not properly configured
        """
        # Try to get encryption key from environment
        encryption_key = os.getenv("ENCRYPTION_KEY")

        if encryption_key:
            # Use provided key
            try:
                key = base64.urlsafe_b64decode(encryption_key.encode())
                return Fernet(base64.urlsafe_b64encode(key))
            except Exception:
                # If key is not base64, treat as password and derive key
                return self._derive_key_from_password(encryption_key)
        else:
            # Generate a key from app secret (fallback)
            app_secret = os.getenv("APP_SECRET", "your-secret-key-change-in-production")
            return self._derive_key_from_password(app_secret)

    def _derive_key_from_password(self, password: str) -> Fernet:
        """
        Derive encryption key from a password using PBKDF2.

        Args:
            password: Password to derive key from

        Returns:
            Fernet cipher instance
        """
        # Use a fixed salt (in production, consider storing this securely)
        salt = b"swaphubu_crypto_exchange_salt_2024"

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )

        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return Fernet(key)

    def encrypt(self, value: str) -> str:
        """
        Encrypt a string value.

        Args:
            value: Plain text string to encrypt

        Returns:
            Base64 encoded encrypted string

        Example:
            encrypted = encryption_manager.encrypt("sensitive_data")
        """
        if value is None or value == "":
            return value

        try:
            encrypted_bytes = self._cipher.encrypt(value.encode("utf-8"))
            return base64.urlsafe_b64encode(encrypted_bytes).decode("utf-8")
        except Exception as e:
            raise ValueError(f"Encryption failed: {str(e)}")

    def decrypt(self, encrypted_value: str) -> str:
        """
        Decrypt an encrypted string value.

        Args:
            encrypted_value: Base64 encoded encrypted string

        Returns:
            Plain text string

        Example:
            decrypted = encryption_manager.decrypt(encrypted_value)
        """
        if encrypted_value is None or encrypted_value == "":
            return encrypted_value

        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_value.encode("utf-8"))
            decrypted_bytes = self._cipher.decrypt(encrypted_bytes)
            return decrypted_bytes.decode("utf-8")
        except Exception as e:
            # If decryption fails, it might be plain text (for backward compatibility)
            return encrypted_value

    def is_encrypted(self, value: str) -> bool:
        """
        Check if a value appears to be encrypted.

        Args:
            value: String to check

        Returns:
            True if value appears to be encrypted, False otherwise
        """
        if not value or len(value) < 32:
            return False

        try:
            # Try to decode as base64 and decrypt
            base64.urlsafe_b64decode(value.encode("utf-8"))
            return True
        except Exception:
            return False


# Global encryption manager instance
encryption_manager = EncryptionManager()


def encrypt_value(value: Optional[str]) -> Optional[str]:
    """
    Encrypt a value using the global encryption manager.

    Args:
        value: Value to encrypt

    Returns:
        Encrypted value or None if input was None
    """
    if value is None:
        return None
    return encryption_manager.encrypt(value)


def decrypt_value(encrypted_value: Optional[str]) -> Optional[str]:
    """
    Decrypt a value using the global encryption manager.

    Args:
        encrypted_value: Encrypted value to decrypt

    Returns:
        Decrypted value or None if input was None
    """
    if encrypted_value is None:
        return None
    return encryption_manager.decrypt(encrypted_value)
