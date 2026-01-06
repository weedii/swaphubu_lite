#!/usr/bin/env python3
"""
Setup Test Script
Tests if all imports and basic setup work correctly
"""

import sys
import os

# Add backend to path
sys.path.append("backend")


def test_imports():
    """Test all critical imports"""
    print("🔍 Testing imports...")

    try:
        # Test database imports
        from src.db import Base, engine, SessionLocal, get_db

        print("✅ Database imports successful")

        # Test model imports
        from src.models import User

        print("✅ Model imports successful")

        # Test FastAPI imports
        from fastapi import FastAPI
        from sqlalchemy.orm import Session

        print("✅ FastAPI imports successful")

        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False


def test_model_structure():
    """Test model structure"""
    print("\n🔍 Testing model structure...")

    try:
        from src.models import User
        from src.db import Base

        # Check if User is properly defined
        assert hasattr(User, "__tablename__")
        assert User.__tablename__ == "users"
        assert hasattr(User, "id")
        assert hasattr(User, "name")
        assert hasattr(User, "email")
        assert hasattr(User, "password")
        assert hasattr(User, "created_at")

        print("✅ User model structure is correct")
        return True
    except Exception as e:
        print(f"❌ Model structure error: {e}")
        return False


def test_alembic_config():
    """Test if alembic configuration exists"""
    print("\n🔍 Testing Alembic configuration...")

    try:
        alembic_ini = "backend/alembic.ini"
        alembic_env = "backend/alembic/env.py"

        assert os.path.exists(alembic_ini), "alembic.ini not found"
        assert os.path.exists(alembic_env), "alembic/env.py not found"

        print("✅ Alembic configuration files exist")
        return True
    except Exception as e:
        print(f"❌ Alembic configuration error: {e}")
        return False


def test_scripts():
    """Test if migration scripts exist"""
    print("\n🔍 Testing migration scripts...")

    try:
        apply_script = "backend/scripts/apply_migrations.py"
        generate_script = "backend/scripts/generate-migration.ps1"

        assert os.path.exists(apply_script), "apply_migrations.py not found"
        assert os.path.exists(generate_script), "generate-migration.ps1 not found"

        print("✅ Migration scripts exist")
        return True
    except Exception as e:
        print(f"❌ Migration scripts error: {e}")
        return False


def test_docker_files():
    """Test if Docker files exist"""
    print("\n🔍 Testing Docker configuration...")

    try:
        dockerfile = "backend/Dockerfile"
        compose_file = "docker-compose.yml"

        assert os.path.exists(dockerfile), "Dockerfile not found"
        assert os.path.exists(compose_file), "docker-compose.yml not found"

        print("✅ Docker configuration files exist")
        return True
    except Exception as e:
        print(f"❌ Docker configuration error: {e}")
        return False


def main():
    """Run all tests"""
    print("🚀 Running Setup Verification Tests...")
    print("=" * 50)

    tests = [
        test_imports,
        test_model_structure,
        test_alembic_config,
        test_scripts,
        test_docker_files,
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1

    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! Your setup is ready to go!")
        print("\n📋 Next steps:")
        print("1. Create .env file with database credentials")
        print("2. Run: .\\start-dev.ps1")
        print(
            "3. Generate initial migration: .\\backend\\scripts\\generate-migration.ps1"
        )
        return True
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
