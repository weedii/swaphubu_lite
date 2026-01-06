"""
Unit tests for UserRepository with country-related methods.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone, timedelta
from uuid import uuid4

from src.db.base import Base
from src.models.User import User
from src.repositories.UserRepository import UserRepository
from src.enums import UserRole


class TestUserRepository:
    """Test UserRepository country-related methods."""

    @pytest.fixture
    def db_session(self):
        """Create an in-memory SQLite database for testing."""
        # Create in-memory SQLite database
        engine = create_engine("sqlite:///:memory:", echo=False)

        # Create all tables
        Base.metadata.create_all(bind=engine)

        # Create session
        TestingSessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=engine
        )
        session = TestingSessionLocal()

        yield session

        session.close()

    @pytest.fixture
    def sample_users(self, db_session):
        """Create sample users with different countries for testing."""
        users = [
            User(
                id=uuid4(),
                email="user1@example.com",
                first_name="John",
                last_name="Doe",
                phone_number="+1234567890",
                country="US",
                password="hashed_password",
                is_verified=True,
                role=UserRole.USER,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            ),
            User(
                id=uuid4(),
                email="user2@example.com",
                first_name="Jane",
                last_name="Smith",
                phone_number="+1234567891",
                country="US",
                password="hashed_password",
                is_verified=True,
                role=UserRole.USER,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            ),
            User(
                id=uuid4(),
                email="user3@example.com",
                first_name="Pierre",
                last_name="Dubois",
                phone_number="+33123456789",
                country="FR",
                password="hashed_password",
                is_verified=False,
                role=UserRole.USER,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            ),
            User(
                id=uuid4(),
                email="user4@example.com",
                first_name="Hans",
                last_name="Mueller",
                phone_number="+49123456789",
                country="DE",
                password="hashed_password",
                is_verified=True,
                role=UserRole.ADMIN,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            ),
            User(
                id=uuid4(),
                email="user5@example.com",
                first_name="Maria",
                last_name="Garcia",
                phone_number="+34123456789",
                country="ES",
                password="hashed_password",
                is_verified=True,
                role=UserRole.USER,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            ),
            # Soft deleted user
            User(
                id=uuid4(),
                email="deleted@example.com",
                first_name="Deleted",
                last_name="User",
                phone_number="+1234567892",
                country="US",
                password="hashed_password",
                is_verified=True,
                role=UserRole.USER,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                deleted_at=datetime.now(timezone.utc),
            ),
        ]

        for user in users:
            db_session.add(user)
        db_session.commit()

        return users

    def test_find_users_by_country_valid_country(self, db_session, sample_users):
        """Test finding users by a valid country code."""
        # Test finding US users
        us_users = UserRepository.find_users_by_country(db_session, "US")

        assert len(us_users) == 2  # Should not include soft-deleted user
        assert all(user.country == "US" for user in us_users)
        assert all(user.deleted_at is None for user in us_users)

        # Verify specific users
        emails = [user.email for user in us_users]
        assert "user1@example.com" in emails
        assert "user2@example.com" in emails
        assert "deleted@example.com" not in emails

    def test_find_users_by_country_single_user(self, db_session, sample_users):
        """Test finding users by country with single result."""
        # Test finding French users
        fr_users = UserRepository.find_users_by_country(db_session, "FR")

        assert len(fr_users) == 1
        assert fr_users[0].country == "FR"
        assert fr_users[0].email == "user3@example.com"
        assert fr_users[0].first_name == "Pierre"

    def test_find_users_by_country_no_results(self, db_session, sample_users):
        """Test finding users by country with no results."""
        # Test finding users from a country with no users
        jp_users = UserRepository.find_users_by_country(db_session, "JP")

        assert len(jp_users) == 0
        assert jp_users == []

    def test_find_users_by_country_case_insensitive(self, db_session, sample_users):
        """Test that country search is case insensitive."""
        # Test lowercase input
        us_users_lower = UserRepository.find_users_by_country(db_session, "us")
        us_users_upper = UserRepository.find_users_by_country(db_session, "US")

        assert len(us_users_lower) == len(us_users_upper)
        assert len(us_users_lower) == 2

    def test_find_users_by_country_ordered_by_created_at(
        self, db_session, sample_users
    ):
        """Test that results are ordered by created_at descending."""
        us_users = UserRepository.find_users_by_country(db_session, "US")

        # Should be ordered by created_at desc (most recent first)
        if len(us_users) > 1:
            for i in range(len(us_users) - 1):
                assert us_users[i].created_at >= us_users[i + 1].created_at

    def test_get_country_statistics(self, db_session, sample_users):
        """Test getting country statistics."""
        stats = UserRepository.get_country_statistics(db_session)

        # Should return dictionary with country codes and counts
        assert isinstance(stats, dict)

        # Check expected counts (excluding soft-deleted users)
        assert stats["US"] == 2  # user1, user2 (not deleted user)
        assert stats["FR"] == 1  # user3
        assert stats["DE"] == 1  # user4
        assert stats["ES"] == 1  # user5

        # Should not include deleted users
        assert sum(stats.values()) == 5  # Total active users

    def test_get_country_statistics_empty_database(self, db_session):
        """Test getting country statistics with empty database."""
        stats = UserRepository.get_country_statistics(db_session)

        assert isinstance(stats, dict)
        assert len(stats) == 0

    def test_get_country_statistics_ordered_by_count(self, db_session, sample_users):
        """Test that country statistics are ordered by count descending."""
        stats = UserRepository.get_country_statistics(db_session)

        # Convert to list of tuples to check ordering
        stats_items = list(stats.items())

        # Should be ordered by count descending
        for i in range(len(stats_items) - 1):
            assert stats_items[i][1] >= stats_items[i + 1][1]

    def test_search_users_with_country_filter(self, db_session, sample_users):
        """Test searching users with country filter."""
        # Search for "user" in US
        us_users = UserRepository.search_users(db_session, "user", country="US")

        assert len(us_users) == 2
        assert all(user.country == "US" for user in us_users)
        assert all("user" in user.email.lower() for user in us_users)

    def test_search_users_with_country_filter_no_results(
        self, db_session, sample_users
    ):
        """Test searching users with country filter that yields no results."""
        # Search for "Pierre" in US (Pierre is in FR)
        results = UserRepository.search_users(db_session, "Pierre", country="US")

        assert len(results) == 0

    def test_search_users_without_country_filter(self, db_session, sample_users):
        """Test searching users without country filter (existing functionality)."""
        # Search for "user" without country filter
        all_users = UserRepository.search_users(db_session, "user")

        # Should find users from all countries
        assert len(all_users) == 5  # All active users have "user" in email
        countries = {user.country for user in all_users}
        assert "US" in countries
        assert "FR" in countries
        assert "DE" in countries
        assert "ES" in countries

    def test_search_users_country_case_insensitive(self, db_session, sample_users):
        """Test that country filter is case insensitive."""
        # Test with lowercase country code
        us_users_lower = UserRepository.search_users(db_session, "user", country="us")
        us_users_upper = UserRepository.search_users(db_session, "user", country="US")

        assert len(us_users_lower) == len(us_users_upper)
        assert len(us_users_lower) == 2

    def test_search_users_by_name_with_country(self, db_session, sample_users):
        """Test searching users by name with country filter."""
        # Search for "Pierre" in FR
        fr_users = UserRepository.search_users(db_session, "Pierre", country="FR")

        assert len(fr_users) == 1
        assert fr_users[0].first_name == "Pierre"
        assert fr_users[0].country == "FR"

    def test_search_users_excludes_deleted(self, db_session, sample_users):
        """Test that search excludes soft-deleted users."""
        # Search in US should not include deleted user
        us_users = UserRepository.search_users(db_session, "example", country="US")

        emails = [user.email for user in us_users]
        assert "deleted@example.com" not in emails
        assert len(us_users) == 2  # Only active US users

    def test_find_users_by_country_excludes_deleted(self, db_session, sample_users):
        """Test that find_users_by_country excludes soft-deleted users."""
        us_users = UserRepository.find_users_by_country(db_session, "US")

        emails = [user.email for user in us_users]
        assert "deleted@example.com" not in emails
        assert len(us_users) == 2  # Only active US users

    def test_get_country_statistics_excludes_deleted(self, db_session, sample_users):
        """Test that country statistics exclude soft-deleted users."""
        stats = UserRepository.get_country_statistics(db_session)

        # US should have 2 users, not 3 (excluding deleted user)
        assert stats["US"] == 2

        # Total should be 5, not 6
        assert sum(stats.values()) == 5
