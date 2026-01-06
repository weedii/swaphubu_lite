"""
Unit tests for validation utilities.
"""

import pytest
from src.utils.validation_utils import (
    validate_country_code,
    get_country_name,
    get_all_countries,
    is_valid_country_code,
    COUNTRY_CODES,
)


class TestCountryValidation:
    """Test cases for country validation functions."""

    def test_validate_country_code_valid_codes(self):
        """Test validation with valid country codes."""
        # Test common country codes
        assert validate_country_code("US") == "US"
        assert validate_country_code("CA") == "CA"
        assert validate_country_code("GB") == "GB"
        assert validate_country_code("DE") == "DE"
        assert validate_country_code("FR") == "FR"

        # Test lowercase input (should be normalized to uppercase)
        assert validate_country_code("us") == "US"
        assert validate_country_code("ca") == "CA"
        assert validate_country_code("gb") == "GB"

        # Test with whitespace (should be stripped)
        assert validate_country_code(" US ") == "US"
        assert validate_country_code("\tCA\n") == "CA"

    def test_validate_country_code_invalid_codes(self):
        """Test validation with invalid country codes."""
        # Test invalid codes
        with pytest.raises(ValueError, match="Invalid country code 'XX'"):
            validate_country_code("XX")

        with pytest.raises(ValueError, match="Invalid country code 'ZZ'"):
            validate_country_code("ZZ")

        # Test invalid format
        with pytest.raises(ValueError, match="Invalid country code format"):
            validate_country_code("USA")  # Too long

        with pytest.raises(ValueError, match="Invalid country code format"):
            validate_country_code("U")  # Too short

        with pytest.raises(ValueError, match="Invalid country code format"):
            validate_country_code("U1")  # Contains number

        with pytest.raises(ValueError, match="Invalid country code format"):
            validate_country_code("U@")  # Contains special character

    def test_validate_country_code_empty_input(self):
        """Test validation with empty or None input."""
        with pytest.raises(ValueError, match="Country code cannot be empty"):
            validate_country_code("")

        with pytest.raises(ValueError, match="Country code cannot be empty"):
            validate_country_code("   ")

        with pytest.raises(ValueError, match="Country code cannot be empty"):
            validate_country_code(None)

    def test_get_country_name_valid_codes(self):
        """Test getting country names for valid codes."""
        assert get_country_name("US") == "United States"
        assert get_country_name("CA") == "Canada"
        assert get_country_name("GB") == "United Kingdom"
        assert get_country_name("DE") == "Germany"
        assert get_country_name("FR") == "France"

        # Test lowercase input
        assert get_country_name("us") == "United States"
        assert get_country_name("ca") == "Canada"

        # Test with whitespace
        assert get_country_name(" US ") == "United States"

    def test_get_country_name_invalid_codes(self):
        """Test getting country names for invalid codes."""
        with pytest.raises(ValueError, match="Invalid country code 'XX'"):
            get_country_name("XX")

        with pytest.raises(ValueError, match="Invalid country code format"):
            get_country_name("USA")

    def test_get_all_countries(self):
        """Test getting all countries."""
        countries = get_all_countries()

        # Should return a dictionary
        assert isinstance(countries, dict)

        # Should contain expected countries
        assert "US" in countries
        assert "CA" in countries
        assert "GB" in countries

        # Should have correct values
        assert countries["US"] == "United States"
        assert countries["CA"] == "Canada"
        assert countries["GB"] == "United Kingdom"

        # Should have a reasonable number of countries (ISO 3166-1 has ~250 codes)
        assert len(countries) > 200

        # Should be a copy (modifying returned dict shouldn't affect original)
        countries["TEST"] = "Test Country"
        assert "TEST" not in COUNTRY_CODES

    def test_is_valid_country_code_valid_codes(self):
        """Test is_valid_country_code with valid codes."""
        assert is_valid_country_code("US") is True
        assert is_valid_country_code("CA") is True
        assert is_valid_country_code("GB") is True

        # Test lowercase
        assert is_valid_country_code("us") is True
        assert is_valid_country_code("ca") is True

        # Test with whitespace
        assert is_valid_country_code(" US ") is True

    def test_is_valid_country_code_invalid_codes(self):
        """Test is_valid_country_code with invalid codes."""
        assert is_valid_country_code("XX") is False
        assert is_valid_country_code("ZZ") is False
        assert is_valid_country_code("USA") is False
        assert is_valid_country_code("U") is False
        assert is_valid_country_code("U1") is False
        assert is_valid_country_code("") is False
        assert is_valid_country_code("   ") is False
        assert is_valid_country_code(None) is False

    def test_country_codes_constant(self):
        """Test the COUNTRY_CODES constant."""
        # Should be a dictionary
        assert isinstance(COUNTRY_CODES, dict)

        # Should contain expected entries
        assert COUNTRY_CODES["US"] == "United States"
        assert COUNTRY_CODES["CA"] == "Canada"
        assert COUNTRY_CODES["GB"] == "United Kingdom"
        assert COUNTRY_CODES["DE"] == "Germany"
        assert COUNTRY_CODES["FR"] == "France"

        # All keys should be 2-character uppercase strings
        for code in COUNTRY_CODES.keys():
            assert len(code) == 2
            assert code.isupper()
            assert code.isalpha()

        # All values should be non-empty strings
        for name in COUNTRY_CODES.values():
            assert isinstance(name, str)
            assert len(name.strip()) > 0

    def test_comprehensive_iso_codes(self):
        """Test that we have comprehensive ISO 3166-1 alpha-2 coverage."""
        # Test some specific countries that should be included
        expected_countries = {
            "AD": "Andorra",
            "AE": "United Arab Emirates",
            "AF": "Afghanistan",
            "AG": "Antigua and Barbuda",
            "AU": "Australia",
            "BR": "Brazil",
            "CN": "China",
            "IN": "India",
            "JP": "Japan",
            "RU": "Russian Federation",
            "ZA": "South Africa",
            "ZW": "Zimbabwe",
        }

        for code, name in expected_countries.items():
            assert code in COUNTRY_CODES
            assert COUNTRY_CODES[code] == name
            assert is_valid_country_code(code) is True
            assert get_country_name(code) == name
