# Implementation Plan

- [x] 1. Update backend User model with country field

  - Add country column to User model in `backend/src/models/User.py`
  - Set column type as String with length constraint for ISO country codes
  - Add appropriate documentation and constraints
  - _Requirements: 4.1, 4.2_

- [x] 2. Create country validation utilities

  - Create country validation function in `backend/src/utils/validation_utils.py`
  - Implement ISO 3166-1 alpha-2 country code validation
  - Add country code to name mapping functionality
  - Write unit tests for country validation functions
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Update user Pydantic schemas with country field

  - Modify `UserBase` schema in `backend/src/schemas/user_schemas.py` to include country field
  - Add country field validation using the new validation utility
  - Update `UserCreate`, `UserUpdate`, `User`, and `UserProfile` schemas
  - Ensure country field is properly validated and documented
  - _Requirements: 1.1, 1.3, 2.2, 2.3, 4.1, 4.2_

- [x] 4. Enhance UserRepository with country-related methods

  - Add `find_users_by_country` method to `backend/src/repositories/UserRepository.py`
  - Add `get_country_statistics` method for admin analytics
  - Update `search_users` method to include country in search criteria
  - Write unit tests for new repository methods
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Update user service to handle country operations

  - Modify user creation logic in `backend/src/services/user_service.py` to handle country
  - Update user profile update logic to validate and save country changes
  - Add country-specific business logic if needed
  - Write unit tests for updated service methods
  - _Requirements: 1.1, 1.3, 2.2, 2.3_

- [x] 6. Update user API endpoints to support country field

  - Modify user registration endpoint in `backend/src/endpoints/users.py` to accept country
  - Update user profile endpoints to return and accept country data
  - Ensure proper validation and error handling for country field
  - Write API tests for country field handling
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [x] 7. Update frontend user interfaces and types

  - Add country field to `UserProfile` interface in `frontend/src/redux/slices/userSlice.ts`
  - Update all user-related Redux actions to handle country field
  - Modify `UpdateUserProfileRequest` in `frontend/src/actions/users.ts`
  - _Requirements: 1.4, 2.4_

- [x] 8. Create country selection component and utilities

  - Create country data utility with ISO country codes and names
  - Build reusable CountrySelect component for forms
  - Implement search functionality within country dropdown
  - Add proper loading and error states
  - _Requirements: 1.1, 2.2, 4.3, 4.4_

- [x] 9. Update user registration form with country selection

  - Add country field to signup form in `frontend/src/components/auth/signup-form.tsx`
  - Implement country validation in form submission
  - Add proper error handling and user feedback
  - Update form styling to accommodate country field
  - Test registration flow with country selection
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 10. Update user profile components to display and edit country

  - Add country display to profile view components
  - Implement country editing in profile update forms
  - Add country field to profile management interfaces
  - Ensure proper validation and error handling
  - Test profile update flow with country changes
  - _Requirements: 2.1, 2.2, 2.3, 2.4_
