"""
Simple password utility functions for secure password hashing and verification.
Uses bcrypt for industry-standard password security.
"""

import bcrypt
from typing import Tuple, List


def hash_password(password: str, rounds: int = 12) -> str:
    """
    Hash a password using bcrypt with salt generation.

    Args:
        password: Plain text password to hash
        rounds: Number of bcrypt rounds (default: 12)

    Returns:
        Bcrypt hash string

    Example:
        hashed = hash_password("my_secure_password")
    """
    if not password:
        raise ValueError("Password cannot be empty")

    salt = bcrypt.gensalt(rounds=rounds)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)

    return hashed.decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against its bcrypt hash.

    Args:
        password: Plain text password to verify
        hashed_password: Bcrypt hash to verify against

    Returns:
        True if password matches hash, False otherwise

    Example:
        is_valid = verify_password("my_password", stored_hash)
    """
    if not password or not hashed_password:
        return False

    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def is_password_strong(password: str) -> Tuple[bool, List[str]]:
    """
    Check if a password meets basic security requirements.

    Requirements:
    - At least 8 characters long
    - Contains uppercase letter
    - Contains lowercase letter
    - Contains digit
    - Contains special character

    Args:
        password: Password to validate

    Returns:
        Tuple of (is_strong: bool, issues: List[str])

    Example:
        is_strong, issues = is_password_strong("WeakPass")
        if not is_strong:
            print("Issues:", issues)
    """
    issues = []

    if len(password) < 8:
        issues.append("Password must be at least 8 characters long")

    if not any(c.isupper() for c in password):
        issues.append("Password must contain at least one uppercase letter")

    if not any(c.islower() for c in password):
        issues.append("Password must contain at least one lowercase letter")

    if not any(c.isdigit() for c in password):
        issues.append("Password must contain at least one number")

    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        issues.append("Password must contain at least one special character")

    return len(issues) == 0, issues
