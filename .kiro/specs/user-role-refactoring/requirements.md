# Requirements Document

## Introduction

This feature involves refactoring the user role system from an enum-based approach (ADMIN, USER, MODERATOR) to a boolean-based approach using `is_admin` flag. The refactoring includes consolidating database migrations, separating admin and user logic into distinct services and repositories, and ensuring all related code is updated to work with the new boolean-based role system.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to consolidate the three separate database migrations into a single migration, so that the database schema changes are properly organized and the migration history is clean.

#### Acceptance Criteria

1. WHEN the migration consolidation is performed THEN the three separate migration files ("5a513a84aa03*make_country_column_nullable_for_admin*.py", "40f2c63c7db0_replace_role_enum_with_is_admin_boolean.py", "e4bcdcc6ae3e_remove_moderator_role_from_enums.py") SHALL be combined into a single migration file
2. WHEN the new consolidated migration is created THEN it SHALL have "68761158c19f" as its down_revision
3. WHEN the consolidation is complete THEN the three original migration files SHALL be deleted
4. WHEN the migration is applied THEN it SHALL properly convert role enum values to is_admin boolean values
5. WHEN the migration is applied THEN it SHALL make the country column nullable for admin users
6. WHEN the migration is applied THEN it SHALL remove the MODERATOR role from all enum types

### Requirement 2

**User Story:** As a developer, I want to separate user and admin functionality into distinct services and repositories, so that the code is better organized and role-specific logic is clearly separated.

#### Acceptance Criteria

1. WHEN the refactoring is complete THEN there SHALL be separate UserService and AdminService classes
2. WHEN the refactoring is complete THEN there SHALL be separate UserRepository and AdminRepository classes
3. WHEN admin-specific operations are performed THEN they SHALL use the AdminService and AdminRepository
4. WHEN regular user operations are performed THEN they SHALL use the UserService and UserRepository
5. WHEN services are created THEN they SHALL contain only role-appropriate business logic
6. WHEN repositories are created THEN they SHALL contain only role-appropriate database queries

### Requirement 3

**User Story:** As a developer, I want all database queries and business logic to properly check the is_admin flag, so that access control is correctly enforced throughout the application.

#### Acceptance Criteria

1. WHEN database queries are executed THEN they SHALL properly filter based on the is_admin flag where appropriate
2. WHEN user operations are performed THEN they SHALL check the is_admin flag for authorization
3. WHEN admin operations are performed THEN they SHALL require is_admin to be true
4. WHEN role-based filtering is needed THEN it SHALL use the is_admin boolean instead of role enum
5. WHEN user statistics are generated THEN they SHALL group by admin status (is_admin true/false)

### Requirement 4

**User Story:** As a developer, I want all endpoints to be updated to use the new role system, so that API access control works correctly with the boolean-based roles.

#### Acceptance Criteria

1. WHEN admin endpoints are accessed THEN they SHALL require is_admin to be true
2. WHEN user endpoints are accessed THEN they SHALL work for both admin and regular users as appropriate
3. WHEN role-based authorization is needed THEN it SHALL use the get_current_admin dependency for admin-only endpoints
4. WHEN endpoints return user data THEN they SHALL include the is_admin field in responses
5. WHEN endpoints accept user updates THEN they SHALL properly handle is_admin field updates

### Requirement 5

**User Story:** As a developer, I want all schemas to be updated to reflect the new role system, so that API request/response validation works correctly.

#### Acceptance Criteria

1. WHEN user schemas are used THEN they SHALL include is_admin boolean field instead of role enum
2. WHEN user creation schemas are used THEN they SHALL not include is_admin field (defaults to false)
3. WHEN user update schemas are used THEN they SHALL allow updating is_admin field for admin operations
4. WHEN user response schemas are used THEN they SHALL include is_admin field in the response
5. WHEN ticket message schemas are used THEN they SHALL use SenderRole enum with ADMIN/USER values only

### Requirement 6

**User Story:** As a developer, I want all utility functions and middleware to work with the new role system, so that authentication and authorization work correctly throughout the application.

#### Acceptance Criteria

1. WHEN authentication utilities are used THEN they SHALL work with the is_admin boolean field
2. WHEN the get_current_admin dependency is used THEN it SHALL check is_admin flag
3. WHEN user validation functions are used THEN they SHALL work with the is_admin field
4. WHEN role-based checks are performed THEN they SHALL use the is_admin boolean
5. WHEN user status checks are performed THEN they SHALL consider both is_admin and other status fields

### Requirement 7

**User Story:** As a developer, I want the ticket system to work correctly with the new role system, so that admin and user messages are properly identified.

#### Acceptance Criteria

1. WHEN ticket messages are created THEN they SHALL use SenderRole enum with ADMIN/USER values
2. WHEN admin users send ticket messages THEN the sender_role SHALL be set to ADMIN
3. WHEN regular users send ticket messages THEN the sender_role SHALL be set to USER
4. WHEN ticket messages are queried THEN they SHALL properly identify sender roles
5. WHEN ticket statistics are generated THEN they SHALL work with the new role system
