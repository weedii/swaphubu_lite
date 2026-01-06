"""
KYC configuration settings for the SwapHubu platform.
Manages environment variables and configuration for KYC verification services.
"""

import os
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict
import logging
from dotenv import load_dotenv
from ..utils.env_utils import get_required_env, get_boolean_env

load_dotenv()
logger = logging.getLogger(__name__)


class KYCConfig(BaseModel):
    """KYC configuration settings."""

    # Shufti Pro API settings
    shufti_client_id: str = Field(..., description="Shufti Pro client ID")
    shufti_secret_key: str = Field(..., description="Shufti Pro secret key")

    shufti_base_url: str = Field(..., description="Shufti Pro API base URL")

    callback_url: str = Field(..., description="Callback URL")

    # Verification settings
    verification_ttl: int = Field(..., description="Verification TTL in seconds")
    webhook_timeout: int = Field(..., description="Webhook timeout in seconds")
    max_verification_attempts: int = Field(
        ..., description="Maximum verification attempts per user"
    )

    # Environment settings
    environment: str = Field(..., description="Environment (development/production)")
    debug_mode: bool = Field(..., description="Enable debug logging (true/false)")

    # Supported verification types
    supported_document_types: list = Field(
        default=["passport", "id_card", "driving_license"],
        description="Supported document types for verification",
    )

    # Supported countries (ISO 2-letter codes)
    supported_countries: list = Field(
        default=[
            "AF",
            "AL",
            "DZ",
            "AS",
            "AD",
            "AO",
            "AI",
            "AQ",
            "AG",
            "AR",
            "AM",
            "AW",
            "AU",
            "AT",
            "AZ",
            "BS",
            "BH",
            "BD",
            "BB",
            "BY",
            "BE",
            "BZ",
            "BJ",
            "BM",
            "BT",
            "BO",
            "BA",
            "BW",
            "BV",
            "BR",
            "IO",
            "BN",
            "BG",
            "BF",
            "BI",
            "KH",
            "CM",
            "CA",
            "CV",
            "KY",
            "CF",
            "TD",
            "CL",
            "CN",
            "CX",
            "CC",
            "CO",
            "KM",
            "CG",
            "CD",
            "CK",
            "CR",
            "CI",
            "HR",
            "CU",
            "CY",
            "CZ",
            "DK",
            "DJ",
            "DM",
            "DO",
            "EC",
            "EG",
            "SV",
            "GQ",
            "ER",
            "EE",
            "ET",
            "FK",
            "FO",
            "FJ",
            "FI",
            "FR",
            "GF",
            "PF",
            "TF",
            "GA",
            "GM",
            "GE",
            "DE",
            "GH",
            "GI",
            "GR",
            "GL",
            "GD",
            "GP",
            "GU",
            "GT",
            "GN",
            "GW",
            "GY",
            "HT",
            "HM",
            "VA",
            "HN",
            "HK",
            "HU",
            "IS",
            "IN",
            "ID",
            "IR",
            "IQ",
            "IE",
            "IL",
            "IT",
            "JM",
            "JP",
            "JO",
            "KZ",
            "KE",
            "KI",
            "KP",
            "KR",
            "KW",
            "KG",
            "LA",
            "LV",
            "LB",
            "LS",
            "LR",
            "LY",
            "LI",
            "LT",
            "LU",
            "MO",
            "MK",
            "MG",
            "MW",
            "MY",
            "MV",
            "ML",
            "MT",
            "MH",
            "MQ",
            "MR",
            "MU",
            "YT",
            "MX",
            "FM",
            "MD",
            "MC",
            "MN",
            "MS",
            "MA",
            "MZ",
            "MM",
            "NA",
            "NR",
            "NP",
            "NL",
            "NC",
            "NZ",
            "NI",
            "NE",
            "NG",
            "NU",
            "NF",
            "MP",
            "NO",
            "OM",
            "PK",
            "PW",
            "PS",
            "PA",
            "PG",
            "PY",
            "PE",
            "PH",
            "PN",
            "PL",
            "PT",
            "PR",
            "QA",
            "RE",
            "RO",
            "RU",
            "RW",
            "SH",
            "KN",
            "LC",
            "PM",
            "VC",
            "WS",
            "SM",
            "ST",
            "SA",
            "SN",
            "SC",
            "SL",
            "SG",
            "SK",
            "SI",
            "SB",
            "SO",
            "ZA",
            "GS",
            "ES",
            "LK",
            "SD",
            "SR",
            "SJ",
            "SZ",
            "SE",
            "CH",
            "SY",
            "TW",
            "TJ",
            "TZ",
            "TH",
            "TL",
            "TG",
            "TK",
            "TO",
            "TT",
            "TN",
            "TR",
            "TM",
            "TC",
            "TV",
            "UG",
            "UA",
            "AE",
            "GB",
            "US",
            "UM",
            "UY",
            "UZ",
            "VU",
            "VE",
            "VN",
            "VG",
            "VI",
            "WF",
            "EH",
            "YE",
            "ZM",
            "ZW",
        ],
        description="Supported countries for KYC verification",
    )

    @field_validator("environment")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        """Validate environment value."""
        valid_environments = ["development", "production"]
        if v not in valid_environments:
            raise ValueError(f"Environment must be one of: {valid_environments}")
        return v

    @field_validator("verification_ttl")
    @classmethod
    def validate_ttl(cls, v: int) -> int:
        """Validate TTL is within Shufti Pro's limits."""
        if v < 3600:  # 1 hour minimum
            raise ValueError("Verification TTL must be at least 1 hour (3600 seconds)")
        if v > 43200:  # 12 hours maximum (Shufti Pro limit)
            raise ValueError("Verification TTL cannot exceed 12 hours (43200 seconds)")
        return v

    @field_validator("max_verification_attempts")
    @classmethod
    def validate_max_attempts(cls, v: int) -> int:
        """Validate maximum attempts is reasonable."""
        if v < 1:
            raise ValueError("Maximum verification attempts must be at least 1")
        if v > 10:
            raise ValueError("Maximum verification attempts cannot exceed 10")
        return v

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment == "development"

    # Pydantic v2 configuration
    model_config = ConfigDict(case_sensitive=False)


def get_kyc_config() -> KYCConfig:
    """
    Get KYC configuration from environment variables.

    Returns:
        KYCConfig instance with settings loaded from environment

    Raises:
        ValueError: If required environment variables are missing
    """
    try:
        # Build configuration using validated env vars
        config = KYCConfig(
            shufti_client_id=get_required_env("SHUFTI_CLIENT_ID"),
            shufti_secret_key=get_required_env("SHUFTI_SECRET_KEY"),
            shufti_base_url=get_required_env("SHUFTI_BASE_URL"),
            callback_url=get_required_env("CALLBACK_URL"),
            verification_ttl=int(get_required_env("VERIFICATION_TTL")),
            webhook_timeout=int(get_required_env("WEBHOOK_TIMEOUT")),
            max_verification_attempts=int(
                get_required_env("MAX_VERIFICATION_ATTEMPTS")
            ),
            environment=get_required_env("ENVIRONMENT"),
            debug_mode=get_boolean_env("DEBUG_MODE", False),
        )

        # Log all configuration values for verification
        for key, value in config.model_dump().items():
            logger.info("KYCConfig - %s: %s", key, value)

        return config
    except Exception as e:
        logger.exception("Failed to load KYC configuration")
        raise ValueError(f"Failed to load KYC configuration: {e}")


# Global configuration instance
kyc_config: Optional[KYCConfig] = None


def init_kyc_config() -> KYCConfig:
    """
    Initialize global KYC configuration.

    Returns:
        KYCConfig instance
    """
    global kyc_config
    if kyc_config is None:
        kyc_config = get_kyc_config()
    return kyc_config
