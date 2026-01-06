# Design Document

## Overview

This design document outlines the implementation of a country field for user accounts in the SwapHubu platform. The feature will add country selection during registration and allow users to update their country information in their profile. The implementation follows the existing architecture patterns and maintains consistency with the current codebase structure.

## Architecture

The implementation follows the established layered architecture:

- **Database Layer**: Add country column to users table
- **Model Layer**: Update User model with country field
- **Schema Layer**: Update Pydantic schemas for request/response handling
- **Repository Layer**: Add country-related query methods
- **Service Layer**: Update user service for country operations
- **API Layer**: Update endpoints to handle country data
- **Frontend State**: Update Redux user slice with country field
- **Frontend Components**: Add country selection to forms and profile views and signup page

## Components and Interfaces

### Backend Components

#### Database Schema

- Add `country` column to `users` table
- Type: VARCHAR(2) to store ISO 3166-1 alpha-2 country codes
- Nullable: CANNOT be NULL required for all registrations

#### User Model (`backend/src/models/User.py`)

- Add `country` field as String column
- Update model documentation and relationships

#### User Schemas (`backend/src/schemas/user_schemas.py`)

- Update `UserBase` schema with country field
- Add country validation using ISO 3166-1 alpha-2 codes
- Update all derived schemas (UserCreate, UserUpdate, User, UserProfile)

#### User Repository (`backend/src/repositories/UserRepository.py`)

- Add method to find users by country
- Add method to get country statistics
- Update search functionality to include country

#### User Service (`backend/src/services/user_service.py`)

- Update user creation logic to handle country
- Update user update logic for country changes
- Add country validation logic

#### API Endpoints (`backend/src/endpoints/users.py`)

- Update user registration endpoint
- Update user profile update endpoint
- Ensure country data is returned in user responses

### Frontend Components

#### Redux State (`frontend/src/redux/slices/userSlice.ts`)

- Add `country` field to UserProfile interface
- Update all user-related actions to handle country
- Add country to user state management

#### User Actions (`frontend/src/actions/users.ts`)

- Update UpdateUserProfileRequest interface with country field
- Ensure country is included in API requests

#### Registration Form (`frontend/src/components/auth/signup-form.tsx`)

- Add country selection dropdown
- Implement country validation
- Update form submission to include country
- Follow existing design and structure
- Use existing libraries and check if any of them can provide us a country select(like shadcn, etc...), if not you can look or find another solution

#### Profile Components

- Add country display to profile views
- Add country editing capability
- Update profile forms with country selection

## Data Models

### Country Data Structure

```typescript
// Country interface for frontend
interface Country {
  code: string; // ISO 3166-1 alpha-2 (e.g., "US", "CA", "GB")
  name: string; // Human-readable name (e.g., "United States", "Canada")
}
```

### Updated User Interfaces

```typescript
// Backend Pydantic Schema
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: Optional[str]
    country: str  # ISO 3166-1 alpha-2 country code

// Frontend Redux Interface
interface UserProfile {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    role: string;
    country: string;  // ISO 3166-1 alpha-2 country code
    kyc_status?: KYCStatus;
}
```

### Database Schema Update

```sql
-- Add country column to users table
ALTER TABLE users ADD COLUMN country VARCHAR(2);
-- Note: Migration will be handled separately by the user
```

## Error Handling

### Backend Validation

- Validate country codes against ISO 3166-1 alpha-2 standard
- Return appropriate error messages for invalid country codes
- Handle NULL country values for existing users gracefully

### Frontend Validation

- Client-side validation for country selection
- Display user-friendly error messages
- Handle API errors gracefully with toast notifications

### Edge Cases

- Existing users without country data
- Invalid country codes in database
- Country dropdown loading states
- Network errors during country data fetching

## Testing Strategy

### Backend Tests

- Unit tests for country validation logic
- Repository tests for country-related queries
- API endpoint tests for country data handling
- Schema validation tests for country field

### Frontend Tests

- Component tests for country selection dropdown
- Redux state tests for country field updates
- Form validation tests for country requirements
- Integration tests for registration with country

### Data Migration Tests

- Test country data integrity after updates
- Test backward compatibility

## Implementation Considerations

### Country Data Source

- Use a static list of ISO 3166-1 alpha-2 country codes
- Include common countries at the top of dropdown for better UX
- Consider future internationalization needs

### Performance

- Country dropdown should load quickly
- Consider caching country list in frontend
- Optimize database queries with country filters

### User Experience

- Make country selection intuitive during registration
- Provide search functionality in country dropdown
- Show country flags for better visual identification (optional)

### Backward Compatibility

## Security Considerations

- Validate country codes server-side to prevent injection
- Sanitize country input data
- Ensure country data doesn't expose sensitive information
- Follow existing authentication and authorization patterns
