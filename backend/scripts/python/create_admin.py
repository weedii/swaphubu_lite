#!/usr/bin/env python3
"""
Manual admin user creation script.
Run this script when you need to create an admin user.

Usage:
    python scripts/create_admin.py
    python scripts/create_admin.py --email admin@example.com --password mypassword
"""

import sys
import os
import argparse
import logging
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

from src.db import SessionLocal
from src.models.User import User
from src.repositories.UserRepository import UserRepository
from src.utils.password_utils import hash_password

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def create_admin_user(
    email: str, password: str, first_name: str = "Admin", last_name: str = "User"
) -> bool:
    """
    Create an admin user with the specified credentials.

    Args:
        email: Admin email address
        password: Admin password
        first_name: Admin first name (default: "Admin")
        last_name: Admin last name (default: "User")

    Returns:
        bool: True if admin created successfully, False otherwise
    """
    db = SessionLocal()
    try:
        # Check if admin user already exists
        existing_admin = UserRepository.find_by_email(db, email)

        if existing_admin:
            if existing_admin.is_admin:
                logger.info(f"✅ Admin user already exists: {email}")
                return True
            else:
                # Update existing user to admin
                existing_admin.is_admin = True
                db.commit()
                logger.info(f"✅ Updated existing user {email} to admin status")
                return True

        # Create new admin user
        hashed_password = hash_password(password)

        admin_user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=hashed_password,
            country=None,  # Admin users don't need country
            is_verified=True,
            is_admin=True,
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        logger.info(f"✅ Admin user created successfully: {email}")
        logger.info(f"   - ID: {admin_user.id}")
        logger.info(f"   - Name: {first_name} {last_name}")
        logger.info(f"   - Email: {email}")
        logger.info(f"   - Is Admin: {admin_user.is_admin}")
        logger.info(f"   - Is Verified: {admin_user.is_verified}")

        return True

    except Exception as e:
        logger.error(f"❌ Failed to create admin user: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()


def main():
    """Main function to handle command line arguments and create admin user."""
    parser = argparse.ArgumentParser(description="Create an admin user for SwapHubu")
    parser.add_argument(
        "--email",
        default=os.getenv("DEFAULT_ADMIN_EMAIL", "admin@swaphubu.com"),
        help="Admin email address (default: admin@swaphubu.com)",
    )
    parser.add_argument(
        "--password",
        default=os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123"),
        help="Admin password (default: admin123)",
    )
    parser.add_argument(
        "--first-name", default="Admin", help="Admin first name (default: Admin)"
    )
    parser.add_argument(
        "--last-name", default="User", help="Admin last name (default: User)"
    )

    args = parser.parse_args()

    logger.info("🚀 Creating admin user...")
    logger.info(f"   Email: {args.email}")
    logger.info(f"   Name: {args.first_name} {args.last_name}")

    success = create_admin_user(
        email=args.email,
        password=args.password,
        first_name=args.first_name,
        last_name=args.last_name,
    )

    if success:
        logger.info("🎉 Admin creation completed successfully!")
        logger.info(f"You can now login with: {args.email} / {args.password}")
    else:
        logger.error("💥 Admin creation failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
