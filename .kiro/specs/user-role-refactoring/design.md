# Design Document

## Overview

This design outlines the refactoring of the user role system from an enum-based approach (ADMIN, USER, MODERATOR) to a boolean-based approach using the `is_admin` flag. The refactoring involves consolidating database migrations, separating admin and user logic into distinct services and repositories, and updating all related code to work with the new boolean-based role system.

The current system has already partially implemented the `is_admin` boolean field in the User model, but the codebase needs comprehensive updates to fully utilize this new approach and remove dependencies on the old role enum system.

## Architecture

### Database Layer Changes

The database migration consolidation will combine three separate migrations into a single, clean migration that:

- Removes the MODERATOR role from all enum types
- Replaces the role enum column with an `is_admin` boolean column
- Makes the country column nullable for admin users
- Properly converts existing data during the migration

### Service Layer Separation

The current monolithic user service will be split into two distinct services:

1. **UserService**: Handles operations for regular users
2. **AdminService**: Handles operations specific to admin users

This separation provides better code organization and clearer boundaries between user and admin functionality.

### Repository Layer Separation

Similar to services, the repository layer will be split:

1. **UserRepository**: Contains queries for regular user operations
2. **AdminRepository**: Contains queries specific to admin operations and user management

### Authentication and Authorization Updates

The authentication system will be updated to work with the `is_admin` boolean field instead of role enums, maintaining the existing `get_current_admin` dependency for admin-only endpoints.

## Components and Interfaces

### Database Migration Component

**Consolidated Migration File**

- **Purpose**: Single migration that combines all role-related changes
- **Input**: Current database state with role enum
- **Output**: Database with `is_admin` boolean field
- **Key Operations**:
  - Add `is_admin` boolean column with default false
  - Convert existing role data: ADMIN → true, USER → false
  - Remove MODERATOR role from all enums
  - Drop the role column
  - Make country column nullable

### Service Layer Components

**UserService**

- **Purpose**: Business logic for regular user operations
- **Methods**:
  - `update_user_profile()`: Update user profile information
  - `delete_user_account()`: Soft delete user account
  - `change_password()`: Change user password
  - `get_user_profile()`: Get user profile information

**AdminService**

- **Purpose**: Business logic for admin operations and user management
- **Methods**:
  - `get_all_users()`: Get paginated list of all users
  - `get_user_by_id()`: Get specific user details for admin view
  - `update_user_admin_fields()`: Update admin-specific fields (is_admin, is_verified, etc.)
  - `block_user()`: Block/unblock user accounts
  - `get_user_statistics()`: Get user statistics and analytics
  - `search_users()`: Search users with admin filters

### Repository Layer Components

**UserRepository**

- **Purpose**: Database queries for regular user operations
- **Methods**:
  - `find_by_email()`: Find user by email
  - `find_by_phone()`: Find user by phone number
  - `get_user_profile_data()`: Get user profile information
  - `update_user_data()`: Update user information

**AdminRepository**

- **Purpose**: Database queries for admin operations and user management
- **Methods**:
  - `get_all_users_paginated()`: Get paginated list of all users
  - `get_user_statistics()`: Get user count statistics
  - `search_users_advanced()`: Advanced user search with filters
  - `get_users_by_country()`: Get users filtered by country
  - `get_unverified_users()`: Get unverified users for admin review
  - `get_users_registered_between()`: Get users by registration date range

### Authentication Component Updates

**Auth Utilities**

- **get_current_admin()**: Updated to check `is_admin` boolean field
- **check_user_permissions()**: New utility for role-based permission checks
- **Role validation**: Updated to work with boolean flags

## Data Models

### User Model Updates

The User model already includes the `is_admin` boolean field, but needs to ensure all related logic uses this field:

```python
class User(Base):
    # ... existing fields ...
    is_admin = Column(Boolean, default=False, nullable=False)
    # country is already nullable for admin users
    country = Column(String(2), nullable=True)
```

### Ticket Message Model

The TicketMessage model uses SenderRole enum which needs to be updated to only include ADMIN and USER values (MODERATOR already removed):

```python
class SenderRole(enum.Enum):
    ADMIN = "admin"
    USER = "user"
```

### Schema Updates

**User Schemas**

- Update all user schemas to include `is_admin` field
- Remove any references to role enum
- Ensure proper validation for admin field updates

**Ticket Schemas**

- Ensure SenderRole enum only includes ADMIN/USER values
- Update ticket message creation logic to set sender_role based on `is_admin`

## Error Handling

### Migration Error Handling

- **Data Conversion Errors**: Handle cases where role enum values don't map cleanly
- **Constraint Violations**: Handle foreign key constraints during enum type changes
- **Rollback Strategy**: Ensure clean rollback to previous state if migration fails

### Service Layer Error Handling

- **Permission Errors**: Clear error messages for insufficient permissions
- **Data Validation Errors**: Proper validation of admin field updates
- **Consistency Errors**: Handle cases where user data becomes inconsistent

### Repository Layer Error Handling

- **Query Errors**: Handle database query failures gracefully
- **Data Integrity**: Ensure data consistency during role-based operations
- **Performance**: Optimize queries for role-based filtering

## Testing Strategy

### Migration Testing

1. **Data Migration Tests**

   - Test conversion of existing role data to `is_admin` boolean
   - Verify MODERATOR role removal and conversion to ADMIN
   - Test country column nullability changes

2. **Rollback Tests**
   - Test migration rollback functionality
   - Verify data integrity after rollback

### Service Layer Testing

1. **UserService Tests**

   - Test all user operations with regular user accounts
   - Test permission boundaries (users can't access admin functions)
   - Test data validation and error handling

2. **AdminService Tests**
   - Test admin operations with admin accounts
   - Test user management functions
   - Test statistics and reporting functions

### Repository Layer Testing

1. **UserRepository Tests**

   - Test user-specific queries
   - Test data filtering and search functionality
   - Test performance with large datasets

2. **AdminRepository Tests**
   - Test admin-specific queries
   - Test user management queries
   - Test statistical queries and aggregations

### Integration Testing

1. **Authentication Tests**

   - Test `get_current_admin` dependency with `is_admin` field
   - Test role-based access control across endpoints
   - Test token validation with new role system

2. **Endpoint Tests**

   - Test all user endpoints with regular users
   - Test all admin endpoints with admin users
   - Test permission boundaries and error responses

3. **End-to-End Tests**
   - Test complete user workflows with new role system
   - Test admin workflows and user management
   - Test ticket system with new sender role logic
