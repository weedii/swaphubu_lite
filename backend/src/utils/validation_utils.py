"""
Validation utilities for the SwapHubu platform.
Contains reusable validation functions for various data types.
"""

import re
from typing import Optional, Dict
from sqlalchemy.orm import Session


def validate_phone_number_field(v):
    """
    Validate and normalize phone number input.

    Args:
        v: Phone number value to validate (can be None, empty string, or phone number)

    Returns:
        str or None: Normalized phone number or None if empty/None

    Raises:
        ValueError: If phone number format is invalid

    Example:
        >>> validate_phone_number_field("+1234567890")
        "+1234567890"
        >>> validate_phone_number_field("")
        None
        >>> validate_phone_number_field(None)
        None
    """
    if v is None:
        return v

    # Convert empty string to None
    if v.strip() == "":
        return None

    # Basic phone number validation
    # Accepts formats like: +1234567890, +1-234-567-8900, +1 (234) 567-8900
    phone_pattern = r"^[\+]?[1-9][\d\s\-\(\)]{7,15}$"

    if not re.match(phone_pattern, v.strip()):
        raise ValueError(
            "Invalid phone number format. Use international format like +1234567890"
        )

    return v.strip()


def validate_email_format(email: str) -> str:
    """
    Validate and normalize email format.

    Args:
        email: Email string to validate

    Returns:
        str: Normalized email (lowercase, stripped)

    Raises:
        ValueError: If email format is invalid
    """
    if not email or not email.strip():
        raise ValueError("Email cannot be empty")

    email = email.strip().lower()

    # Basic email validation (more robust than just regex)
    email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

    if not re.match(email_pattern, email):
        raise ValueError("Invalid email format")

    return email


def check_email_availability(
    db: Session, email: str, exclude_user_id: Optional[str] = None
) -> bool:
    """
    Check if an email is available for use.

    Args:
        db: Database session
        email: Email to check
        exclude_user_id: User ID to exclude from the check (for updates)

    Returns:
        bool: True if email is available, False if taken
    """
    from ..repositories.UserRepository import UserRepository

    existing_user = UserRepository.find_by_email(db, email)

    if not existing_user:
        return True

    # If excluding a user ID (for updates), check if it's the same user
    if exclude_user_id and str(existing_user.id) == str(exclude_user_id):
        return True

    return False


def check_phone_availability(
    db: Session, phone: str, exclude_user_id: Optional[str] = None
) -> bool:
    """
    Check if a phone number is available for use.

    Args:
        db: Database session
        phone: Phone number to check
        exclude_user_id: User ID to exclude from the check (for updates)

    Returns:
        bool: True if phone is available, False if taken
    """
    from ..repositories.UserRepository import UserRepository

    if not phone or not phone.strip():
        return True  # Empty phone numbers are always available

    existing_user = UserRepository.find_by_phone(db, phone.strip())

    if not existing_user:
        return True

    # If excluding a user ID (for updates), check if it's the same user
    if exclude_user_id and str(existing_user.id) == str(exclude_user_id):
        return True

    return False


def validate_update_conflicts(
    db: Session, user_id: str, email: Optional[str] = None, phone: Optional[str] = None
) -> None:
    """
    Validate that update data doesn't conflict with existing users.

    Args:
        db: Database session
        user_id: ID of user being updated
        email: New email (if being updated)
        phone: New phone (if being updated)

    Raises:
        ValueError: If conflicts are found
    """
    if email:
        normalized_email = validate_email_format(email)
        if not check_email_availability(db, normalized_email, user_id):
            raise ValueError(f"Email {email} is already registered by another user")

    if phone:
        normalized_phone = validate_phone_number_field(phone)
        if normalized_phone and not check_phone_availability(
            db, normalized_phone, user_id
        ):
            raise ValueError(
                f"Phone number {phone} is already registered by another user"
            )


# ISO 3166-1 alpha-2 country codes mapping
COUNTRY_CODES: Dict[str, str] = {
    "AD": "Andorra",
    "AE": "United Arab Emirates",
    "AF": "Afghanistan",
    "AG": "Antigua and Barbuda",
    "AI": "Anguilla",
    "AL": "Albania",
    "AM": "Armenia",
    "AO": "Angola",
    "AQ": "Antarctica",
    "AR": "Argentina",
    "AS": "American Samoa",
    "AT": "Austria",
    "AU": "Australia",
    "AW": "Aruba",
    "AX": "Åland Islands",
    "AZ": "Azerbaijan",
    "BA": "Bosnia and Herzegovina",
    "BB": "Barbados",
    "BD": "Bangladesh",
    "BE": "Belgium",
    "BF": "Burkina Faso",
    "BG": "Bulgaria",
    "BH": "Bahrain",
    "BI": "Burundi",
    "BJ": "Benin",
    "BL": "Saint Barthélemy",
    "BM": "Bermuda",
    "BN": "Brunei Darussalam",
    "BO": "Bolivia",
    "BQ": "Bonaire, Sint Eustatius and Saba",
    "BR": "Brazil",
    "BS": "Bahamas",
    "BT": "Bhutan",
    "BV": "Bouvet Island",
    "BW": "Botswana",
    "BY": "Belarus",
    "BZ": "Belize",
    "CA": "Canada",
    "CC": "Cocos (Keeling) Islands",
    "CD": "Congo, Democratic Republic of the",
    "CF": "Central African Republic",
    "CG": "Congo",
    "CH": "Switzerland",
    "CI": "Côte d'Ivoire",
    "CK": "Cook Islands",
    "CL": "Chile",
    "CM": "Cameroon",
    "CN": "China",
    "CO": "Colombia",
    "CR": "Costa Rica",
    "CU": "Cuba",
    "CV": "Cabo Verde",
    "CW": "Curaçao",
    "CX": "Christmas Island",
    "CY": "Cyprus",
    "CZ": "Czechia",
    "DE": "Germany",
    "DJ": "Djibouti",
    "DK": "Denmark",
    "DM": "Dominica",
    "DO": "Dominican Republic",
    "DZ": "Algeria",
    "EC": "Ecuador",
    "EE": "Estonia",
    "EG": "Egypt",
    "EH": "Western Sahara",
    "ER": "Eritrea",
    "ES": "Spain",
    "ET": "Ethiopia",
    "FI": "Finland",
    "FJ": "Fiji",
    "FK": "Falkland Islands (Malvinas)",
    "FM": "Micronesia, Federated States of",
    "FO": "Faroe Islands",
    "FR": "France",
    "GA": "Gabon",
    "GB": "United Kingdom",
    "GD": "Grenada",
    "GE": "Georgia",
    "GF": "French Guiana",
    "GG": "Guernsey",
    "GH": "Ghana",
    "GI": "Gibraltar",
    "GL": "Greenland",
    "GM": "Gambia",
    "GN": "Guinea",
    "GP": "Guadeloupe",
    "GQ": "Equatorial Guinea",
    "GR": "Greece",
    "GS": "South Georgia and the South Sandwich Islands",
    "GT": "Guatemala",
    "GU": "Guam",
    "GW": "Guinea-Bissau",
    "GY": "Guyana",
    "HK": "Hong Kong",
    "HM": "Heard Island and McDonald Islands",
    "HN": "Honduras",
    "HR": "Croatia",
    "HT": "Haiti",
    "HU": "Hungary",
    "ID": "Indonesia",
    "IE": "Ireland",
    "IL": "Israel",
    "IM": "Isle of Man",
    "IN": "India",
    "IO": "British Indian Ocean Territory",
    "IQ": "Iraq",
    "IR": "Iran, Islamic Republic of",
    "IS": "Iceland",
    "IT": "Italy",
    "JE": "Jersey",
    "JM": "Jamaica",
    "JO": "Jordan",
    "JP": "Japan",
    "KE": "Kenya",
    "KG": "Kyrgyzstan",
    "KH": "Cambodia",
    "KI": "Kiribati",
    "KM": "Comoros",
    "KN": "Saint Kitts and Nevis",
    "KP": "Korea, Democratic People's Republic of",
    "KR": "Korea, Republic of",
    "KW": "Kuwait",
    "KY": "Cayman Islands",
    "KZ": "Kazakhstan",
    "LA": "Lao People's Democratic Republic",
    "LB": "Lebanon",
    "LC": "Saint Lucia",
    "LI": "Liechtenstein",
    "LK": "Sri Lanka",
    "LR": "Liberia",
    "LS": "Lesotho",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "LV": "Latvia",
    "LY": "Libya",
    "MA": "Morocco",
    "MC": "Monaco",
    "MD": "Moldova, Republic of",
    "ME": "Montenegro",
    "MF": "Saint Martin (French part)",
    "MG": "Madagascar",
    "MH": "Marshall Islands",
    "MK": "North Macedonia",
    "ML": "Mali",
    "MM": "Myanmar",
    "MN": "Mongolia",
    "MO": "Macao",
    "MP": "Northern Mariana Islands",
    "MQ": "Martinique",
    "MR": "Mauritania",
    "MS": "Montserrat",
    "MT": "Malta",
    "MU": "Mauritius",
    "MV": "Maldives",
    "MW": "Malawi",
    "MX": "Mexico",
    "MY": "Malaysia",
    "MZ": "Mozambique",
    "NA": "Namibia",
    "NC": "New Caledonia",
    "NE": "Niger",
    "NF": "Norfolk Island",
    "NG": "Nigeria",
    "NI": "Nicaragua",
    "NL": "Netherlands",
    "NO": "Norway",
    "NP": "Nepal",
    "NR": "Nauru",
    "NU": "Niue",
    "NZ": "New Zealand",
    "OM": "Oman",
    "PA": "Panama",
    "PE": "Peru",
    "PF": "French Polynesia",
    "PG": "Papua New Guinea",
    "PH": "Philippines",
    "PK": "Pakistan",
    "PL": "Poland",
    "PM": "Saint Pierre and Miquelon",
    "PN": "Pitcairn",
    "PR": "Puerto Rico",
    "PS": "Palestine, State of",
    "PT": "Portugal",
    "PW": "Palau",
    "PY": "Paraguay",
    "QA": "Qatar",
    "RE": "Réunion",
    "RO": "Romania",
    "RS": "Serbia",
    "RU": "Russian Federation",
    "RW": "Rwanda",
    "SA": "Saudi Arabia",
    "SB": "Solomon Islands",
    "SC": "Seychelles",
    "SD": "Sudan",
    "SE": "Sweden",
    "SG": "Singapore",
    "SH": "Saint Helena, Ascension and Tristan da Cunha",
    "SI": "Slovenia",
    "SJ": "Svalbard and Jan Mayen",
    "SK": "Slovakia",
    "SL": "Sierra Leone",
    "SM": "San Marino",
    "SN": "Senegal",
    "SO": "Somalia",
    "SR": "Suriname",
    "SS": "South Sudan",
    "ST": "Sao Tome and Principe",
    "SV": "El Salvador",
    "SX": "Sint Maarten (Dutch part)",
    "SY": "Syrian Arab Republic",
    "SZ": "Eswatini",
    "TC": "Turks and Caicos Islands",
    "TD": "Chad",
    "TF": "French Southern Territories",
    "TG": "Togo",
    "TH": "Thailand",
    "TJ": "Tajikistan",
    "TK": "Tokelau",
    "TL": "Timor-Leste",
    "TM": "Turkmenistan",
    "TN": "Tunisia",
    "TO": "Tonga",
    "TR": "Turkey",
    "TT": "Trinidad and Tobago",
    "TV": "Tuvalu",
    "TW": "Taiwan, Province of China",
    "TZ": "Tanzania, United Republic of",
    "UA": "Ukraine",
    "UG": "Uganda",
    "UM": "United States Minor Outlying Islands",
    "US": "United States",
    "UY": "Uruguay",
    "UZ": "Uzbekistan",
    "VA": "Holy See (Vatican City State)",
    "VC": "Saint Vincent and the Grenadines",
    "VE": "Venezuela, Bolivarian Republic of",
    "VG": "Virgin Islands, British",
    "VI": "Virgin Islands, U.S.",
    "VN": "Viet Nam",
    "VU": "Vanuatu",
    "WF": "Wallis and Futuna",
    "WS": "Samoa",
    "YE": "Yemen",
    "YT": "Mayotte",
    "ZA": "South Africa",
    "ZM": "Zambia",
    "ZW": "Zimbabwe",
}


def validate_country_code(country_code: str) -> str:
    """
    Validate and normalize ISO 3166-1 alpha-2 country code.

    Args:
        country_code: Country code to validate (e.g., "US", "CA", "GB")

    Returns:
        str: Normalized country code (uppercase, stripped)

    Raises:
        ValueError: If country code is invalid or not found

    Example:
        >>> validate_country_code("us")
        "US"
        >>> validate_country_code("CA")
        "CA"
        >>> validate_country_code("invalid")
        ValueError: Invalid country code 'INVALID'. Must be a valid ISO 3166-1 alpha-2 code.
    """
    if not country_code or not country_code.strip():
        raise ValueError("Country code cannot be empty")

    # Normalize to uppercase and strip whitespace
    normalized_code = country_code.strip().upper()

    # Validate format (exactly 2 alphabetic characters)
    if not re.match(r"^[A-Z]{2}$", normalized_code):
        raise ValueError(
            f"Invalid country code format '{country_code}'. Must be exactly 2 alphabetic characters."
        )

    # Check if code exists in ISO 3166-1 alpha-2 standard
    if normalized_code not in COUNTRY_CODES:
        raise ValueError(
            f"Invalid country code '{normalized_code}'. Must be a valid ISO 3166-1 alpha-2 code."
        )

    return normalized_code


def get_country_name(country_code: str) -> str:
    """
    Get the country name for a given ISO 3166-1 alpha-2 country code.

    Args:
        country_code: ISO 3166-1 alpha-2 country code (e.g., "US", "CA", "GB")

    Returns:
        str: Country name (e.g., "United States", "Canada", "United Kingdom")

    Raises:
        ValueError: If country code is invalid

    Example:
        >>> get_country_name("US")
        "United States"
        >>> get_country_name("ca")
        "Canada"
        >>> get_country_name("invalid")
        ValueError: Invalid country code 'INVALID'. Must be a valid ISO 3166-1 alpha-2 code.
    """
    # Validate the country code first
    validated_code = validate_country_code(country_code)

    # Return the country name
    return COUNTRY_CODES[validated_code]


def get_all_countries() -> Dict[str, str]:
    """
    Get all available country codes and their names.

    Returns:
        Dict[str, str]: Dictionary mapping country codes to country names

    Example:
        >>> countries = get_all_countries()
        >>> countries["US"]
        "United States"
        >>> len(countries) > 200
        True
    """
    return COUNTRY_CODES.copy()


def is_valid_country_code(country_code: str) -> bool:
    """
    Check if a country code is valid without raising an exception.

    Args:
        country_code: Country code to check

    Returns:
        bool: True if valid, False otherwise

    Example:
        >>> is_valid_country_code("US")
        True
        >>> is_valid_country_code("invalid")
        False
        >>> is_valid_country_code("")
        False
    """
    try:
        validate_country_code(country_code)
        return True
    except ValueError:
        return False
