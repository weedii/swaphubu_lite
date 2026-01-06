#!/usr/bin/env python3
"""
Migration Application Script
Applies pending Alembic migrations before app startup
"""

import os
import sys
from alembic.config import Config
from alembic import command
from sqlalchemy import create_engine, text
from dotenv import load_dotenv


def load_environment():
    """Load environment variables"""
    load_dotenv()

    # Check required environment variables
    required_vars = [
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
        "POSTGRES_HOST",
        "POSTGRES_PORT",
        "POSTGRES_DB",
    ]
    missing_vars = []

    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)

    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        sys.exit(1)

    return f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"


def check_database_connection(database_url):
    """Check if database is accessible"""
    try:
        engine = create_engine(database_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


def apply_migrations():
    """Apply pending migrations"""
    print("🔍 Checking for pending migrations...")

    try:
        # Load environment and check database
        database_url = load_environment()

        if not check_database_connection(database_url):
            print("❌ Cannot connect to database. Exiting.")
            sys.exit(1)

        # Apply migrations - let Alembic handle the logic
        print("Applying migrations...")
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")

        print("✅ Migrations applied successfully!")
        return True

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False


if __name__ == "__main__":
    print("🔧 Starting migration check...")

    if apply_migrations():
        print("✅ Migration process completed successfully")
        sys.exit(0)
    else:
        print("❌ Migration process failed")
        sys.exit(1)
