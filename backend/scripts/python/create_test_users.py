#!/usr/bin/env python3
"""
Test users creation script.
Creates multiple test users for development and testing purposes.

Usage:
    python scripts/create_test_users.py
    python scripts/create_test_users.py --count 10
"""

import sys
import os
import argparse
import logging
from pathlib import Path
from faker import Faker
import random

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

from src.db import SessionLocal
from src.models.User import User
from src.repositories.UserRepository import UserRepository
from src.utils.password_utils import hash_password
from src.utils.validation_utils import validate_phone_number_field

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize Faker
fake = Faker()

# Common test countries (ISO 3166-1 alpha-2)
TEST_COUNTRIES = [
    "US",
    "CA",
    "GB",
    "DE",
    "FR",
    "IT",
    "ES",
    "AU",
    "JP",
    "KR",
    "BR",
    "MX",
    "IN",
    "CN",
    "RU",
    "ZA",
    "EG",
    "NG",
    "AR",
    "CL",
]


def generate_valid_phone_number() -> str:
    """
    Generate a valid phone number that passes our validation.

    Returns:
        str: Valid phone number in international format
    """
    # Generate a simple valid international phone number
    country_codes = [
        "+1",
        "+44",
        "+49",
        "+33",
        "+39",
        "+34",
        "+61",
        "+81",
        "+82",
        "+55",
    ]
    country_code = random.choice(country_codes)

    # Generate 7-10 digit number
    digits = "".join([str(random.randint(0, 9)) for _ in range(random.randint(7, 10))])
    phone = f"{country_code}{digits}"

    try:
        # Validate the generated phone number
        validated_phone = validate_phone_number_field(phone)
        return validated_phone if validated_phone else phone
    except ValueError:
        # Fallback to a simple valid format
        return f"+1{random.randint(2000000000, 9999999999)}"


def create_test_user(index: int, password: str = "testpass123") -> dict:
    """
    Create a single test user with fake data.

    Args:
        index: User index for unique identification
        password: Password for all test users

    Returns:
        dict: User data or None if creation failed
    """
    try:
        # Generate fake user data
        first_name = fake.first_name()
        last_name = fake.last_name()
        email = f"testuser{index}@swaphubu.com"
        phone_number = (
            generate_valid_phone_number()
        )  # Use our validation-compliant generator
        country = random.choice(TEST_COUNTRIES)
        is_verified = random.choice([True, False])
        is_admin = False  # Test users are not admins

        user_data = {
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "phone_number": phone_number,
            "country": country,
            "password": password,
            "is_verified": is_verified,
            "is_admin": is_admin,
        }

        return user_data

    except Exception as e:
        logger.error(f"Failed to generate test user data: {str(e)}")
        return None


def create_test_users(count: int = 5, password: str = "testpass123") -> int:
    """
    Create multiple test users.

    Args:
        count: Number of test users to create
        password: Password for all test users

    Returns:
        int: Number of users successfully created
    """
    db = SessionLocal()
    created_count = 0

    try:
        logger.info(f"Creating {count} test users...")

        for i in range(1, count + 1):
            try:
                # Generate user data
                user_data = create_test_user(i, password)
                if not user_data:
                    continue

                # Check if user already exists
                existing_user = UserRepository.find_by_email(db, user_data["email"])
                if existing_user:
                    logger.info(
                        f"⚠️  User {user_data['email']} already exists, skipping..."
                    )
                    continue

                # Hash password
                hashed_password = hash_password(user_data["password"])

                # Create user
                test_user = User(
                    email=user_data["email"],
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"],
                    password=hashed_password,
                    phone_number=user_data["phone_number"],
                    country=user_data["country"],
                    is_verified=user_data["is_verified"],
                    is_admin=user_data["is_admin"],
                )

                db.add(test_user)
                db.commit()
                db.refresh(test_user)

                created_count += 1
                logger.info(
                    f"✅ Created user {i}/{count}: {user_data['email']} ({user_data['first_name']} {user_data['last_name']}) - {user_data['country']}"
                )

            except Exception as e:
                logger.error(f"❌ Failed to create user {i}: {str(e)}")
                db.rollback()
                continue

        logger.info(f"🎉 Successfully created {created_count} test users!")
        return created_count

    except Exception as e:
        logger.error(f"❌ Failed to create test users: {str(e)}")
        db.rollback()
        return 0
    finally:
        db.close()


def create_specific_test_users() -> int:
    """
    Create specific test users with known credentials for testing.

    Returns:
        int: Number of users successfully created
    """
    db = SessionLocal()
    created_count = 0

    # Predefined test users
    specific_users = [
        {
            "email": "john.doe@swaphubu.com",
            "first_name": "John",
            "last_name": "Doe",
            "phone_number": "+1234567890",
            "country": "US",
            "is_verified": True,
            "is_admin": False,
        },
        {
            "email": "jane.smith@swaphubu.com",
            "first_name": "Jane",
            "last_name": "Smith",
            "phone_number": "+1987654321",
            "country": "CA",
            "is_verified": False,
            "is_admin": False,
        },
        {
            "email": "blocked.user@swaphubu.com",
            "first_name": "Blocked",
            "last_name": "User",
            "phone_number": "+1555666777",
            "country": "GB",
            "is_verified": True,
            "is_admin": False,
            "is_blocked": True,
        },
    ]

    try:
        logger.info("Creating specific test users...")

        for user_data in specific_users:
            try:
                # Check if user already exists
                existing_user = UserRepository.find_by_email(db, user_data["email"])
                if existing_user:
                    logger.info(
                        f"⚠️  User {user_data['email']} already exists, skipping..."
                    )
                    continue

                # Hash password
                hashed_password = hash_password("testpass123")

                # Create user
                test_user = User(
                    email=user_data["email"],
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"],
                    password=hashed_password,
                    phone_number=user_data["phone_number"],
                    country=user_data["country"],
                    is_verified=user_data["is_verified"],
                    is_admin=user_data["is_admin"],
                    is_blocked=user_data.get("is_blocked", False),
                )

                db.add(test_user)
                db.commit()
                db.refresh(test_user)

                created_count += 1
                status = (
                    "BLOCKED"
                    if user_data.get("is_blocked")
                    else ("VERIFIED" if user_data["is_verified"] else "UNVERIFIED")
                )
                logger.info(
                    f"✅ Created specific user: {user_data['email']} - {status}"
                )

            except Exception as e:
                logger.error(
                    f"❌ Failed to create specific user {user_data['email']}: {str(e)}"
                )
                db.rollback()
                continue

        return created_count

    except Exception as e:
        logger.error(f"❌ Failed to create specific test users: {str(e)}")
        db.rollback()
        return 0
    finally:
        db.close()


def main():
    """Main function to handle command line arguments and create test users."""
    parser = argparse.ArgumentParser(description="Create test users for SwapHubu")
    parser.add_argument(
        "--count",
        type=int,
        default=5,
        help="Number of random test users to create (default: 5)",
    )
    parser.add_argument(
        "--password",
        default="testpass123",
        help="Password for all test users (default: testpass123)",
    )
    parser.add_argument(
        "--specific-only",
        action="store_true",
        help="Create only specific test users (john.doe, jane.smith, blocked.user)",
    )

    args = parser.parse_args()

    total_created = 0

    if args.specific_only:
        logger.info("🚀 Creating specific test users only...")
        total_created = create_specific_test_users()
    else:
        logger.info("🚀 Creating test users...")

        # Create specific users first
        specific_count = create_specific_test_users()
        total_created += specific_count

        # Create random users
        random_count = create_test_users(args.count, args.password)
        total_created += random_count

    if total_created > 0:
        logger.info(
            f"🎉 Test user creation completed! Created {total_created} users total."
        )
        logger.info(f"All test users can login with password: {args.password}")
        logger.info("Specific test users created:")
        logger.info("  - john.doe@swaphubu.com (verified)")
        logger.info("  - jane.smith@swaphubu.com (unverified)")
        logger.info("  - blocked.user@swaphubu.com (blocked)")
    else:
        logger.error("💥 No test users were created!")
        sys.exit(1)


if __name__ == "__main__":
    main()
