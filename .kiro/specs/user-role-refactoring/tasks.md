# Implementation Plan

- [x] 1. Consolidate database migrations

  - Create a single migration file that combines all three role-related migrations
  - Just generate the new migration file that combines the 3 files and I will take care of the rest
  - Delete the three original migration files after consolidation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Create AdminRepository with admin-specific database queries

  - Implement AdminRepository class with methods for user management operations
  - Add get_all_users_paginated() method for admin user listing
  - Add get_user_statistics() method for admin analytics using is_admin flag
  - Add search_users_advanced() method with admin-specific filters
  - Add get_unverified_users() and other admin management queries
  - _Requirements: 2.1, 2.2, 2.6, 3.1, 3.4, 3.5_

- [x] 3. Update existing UserRepository to focus on regular user operations

  - Review and update existing UserRepository methods to be user-focused
  - Ensure all queries properly use is_admin flag for filtering where appropriate
  - Remove or move admin-specific methods to AdminRepository
  - Update method documentation to reflect user-focused purpose
  - _Requirements: 2.1, 2.2, 2.6, 3.1, 3.2, 3.4_

- [x] 4. Create AdminService with admin business logic

  - Implement AdminService class for admin-specific operations
  - Add user management methods (get_all_users, update_user_admin_fields, block_user)
  - Add admin analytics methods (get_user_statistics, get_system_reports)
  - Add user search and filtering methods for admin interface
  - Implement proper authorization checks using is_admin flag
  - _Requirements: 2.1, 2.3, 2.5, 3.2, 3.3, 3.4_

- [x] 5. Update existing UserService to focus on regular user operations

  - Review existing UserService methods and remove admin-specific logic
  - Update user profile operations to work with is_admin boolean field
  - Fix the role field reference in update_user_profile method
  - Ensure all user operations properly check is_admin for authorization
  - Update error handling and validation for user-focused operations
  - _Requirements: 2.1, 2.4, 2.5, 3.2, 3.3, 3.4_

- [x] 6. Update user schemas to use is_admin boolean field

  - Update UserUpdate schema to properly handle is_admin field
  - Ensure UserCreate schema doesn't include is_admin (defaults to false)
  - Update User and UserProfile schemas to include is_admin in responses
  - Remove any remaining references to role enum in schemas
  - Add proper validation for is_admin field updates
  - Don't create, update or run any unit tests
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Create admin-specific endpoints and update existing endpoints

  - Create new admin endpoints that use AdminService and require admin privileges
  - Update existing user endpoints to use the refactored UserService
  - Ensure proper use of get_current_admin dependency for admin-only endpoints
  - Update endpoint responses to include is_admin field
  - Don't create, update or run any unit tests
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Update authentication utilities for is_admin boolean system






  - Verify get_current_admin dependency works with is_admin field
  - Update any role-based validation functions to use is_admin
  - Ensure check_user_active and other auth utilities work with new system
  - Update authentication middleware if needed for role checks
  - Don't create, update or run any unit tests
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9. Update ticket system to work with new role system

  - Ensure SenderRole enum only contains ADMIN and USER values
  - Update ticket message creation logic to set sender_role based on is_admin
  - Update ticket-related queries to work with new role system
  - Ensure ticket message schemas use updated SenderRole enum
  - Don't create, update or run any unit tests
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. Update imports and dependencies across the codebase

  - Update all import statements to use new AdminService and AdminRepository
  - Fix any remaining imports of removed role enum classes
  - Update dependency injection for new service classes
  - Ensure all modules properly import and use is_admin field
  - Clean up any unused imports from role enum system
  - Don't create, update or run any unit tests
  - _Requirements: 2.1, 2.2, 3.1, 4.1_

- [ ] 11. Perform final validation and cleanup
  - Verify all database queries work correctly with is_admin field
  - Validate that all requirements are met and working correctly
  - Clean up any remaining unused code or imports
  - Ensure proper error handling throughout the refactored system
  - Don't create, update or run any unit tests
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 6.1, 7.1_
