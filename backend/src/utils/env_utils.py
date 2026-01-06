"""
Environment utility functions for the SwapHubu platform.
Provides helper functions for working with environment variables.
"""

import os
import logging

logger = logging.getLogger(__name__)


def get_required_env(name: str) -> str:
    """
    Get a required environment variable with clear error handling.

    This function retrieves an environment variable by name and ensures
    it has a non-empty value. If the variable is missing or empty, it
    raises a ValueError with a descriptive message.

    Args:
        name: The name of the environment variable to retrieve

    Returns:
        The value of the environment variable as a string

    Raises:
        ValueError: If the environment variable is missing or empty
    """
    value = os.getenv(name)
    if value is None or value == "":
        logger.error(f"Environment variable '{name}' is required but missing")
        raise ValueError(f"Environment variable '{name}' is required but missing")
    return value


def get_env(name: str, default: str = "") -> str:
    """
    Get an environment variable with a default value.

    This function retrieves an environment variable by name and returns
    the default value if the variable is not set or empty.

    Args:
        name: The name of the environment variable to retrieve
        default: The default value to return if the variable is not set

    Returns:
        The value of the environment variable or the default value
    """
    value = os.getenv(name)
    if value is None or value == "":
        return default
    return value


def get_boolean_env(name: str, default: bool = False) -> bool:
    """
    Get a boolean environment variable with default value.

    This function retrieves an environment variable by name and converts
    it to a boolean value. It accepts "1", "true", "yes" (case-insensitive)
    as True values, and anything else as False.

    Args:
        name: The name of the environment variable to retrieve
        default: The default value to return if the variable is not set

    Returns:
        The boolean value of the environment variable
    """
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in ("1", "true", "yes")
