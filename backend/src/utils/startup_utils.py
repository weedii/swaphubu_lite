"""
Startup utilities for application initialization.
"""

import os
import logging
from sqlalchemy.orm import Session
from ..models.User import User
from ..repositories.UserRepository import UserRepository
from ..utils.password_utils import hash_password

logger = logging.getLogger(__name__)


def create_default_admin(db: Session) -> None:
    """
    Create default admin user if it doesn't exist.
    
    Args:
        db: Database session
    """
    try:
        # Get admin credentials from environment variables
        admin_email = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@swaphubu.com")
        admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
        
        # Check if admin user already exists
        existing_admin = UserRepository.find_by_email(db, admin_email)
        
        if existing_admin:
            logger.info(f"Admin user already exists: {admin_email}")
            # Ensure the existing user is marked as admin
            if not existing_admin.is_admin:
                existing_admin.is_admin = True
                db.commit()
                logger.info(f"Updated existing user {admin_email} to admin status")
            return
        
        # Create new admin user
        hashed_password = hash_password(admin_password)
        
        admin_user = User(
            email=admin_email,
            first_name="Admin",
            last_name="User",
            password=hashed_password,
            country=None,
            is_verified=True,
            is_admin=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        logger.info(f"✅ Default admin user created successfully: {admin_email}")
        
    except Exception as e:
        logger.error(f"❌ Failed to create default admin user: {str(e)}")
        db.rollback()
        raise


def initialize_application(db: Session) -> None:
    """
    Initialize application with default data.
    
    Args:
        db: Database session
    """
    logger.info("🚀 Initializing application...")
    
    try:
        # Create default admin user
        create_default_admin(db)
        
        logger.info("✅ Application initialization completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Application initialization failed: {str(e)}")
        raise