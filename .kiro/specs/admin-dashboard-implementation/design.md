# Design Document

## Overview

The admin dashboard implementation will transform the existing static admin interface into a fully functional, data-driven dashboard by integrating with the existing backend AdminService and admin endpoints. The design maintains the current layout structure while adding real data integration, user management capabilities, and proper error handling throughout the interface.

## Architecture

### Frontend Architecture

The implementation follows the existing SwapHubu frontend architecture patterns:

- **Component Structure**: Reuse existing admin components in `/frontend/src/components/admin/` and create new ones only when necessary
- **API Layer**: All backend communication through dedicated action files in `/frontend/src/actions/admin/`
- **State Management**: Local component state for UI interactions, with Redux integration where needed for global admin state
- **Routing**: Maintain existing Next.js App Router structure in `/frontend/src/app/admin/`

### Backend Integration

The design leverages existing backend infrastructure:

- **Admin Endpoints**: Full utilization of `/backend/src/endpoints/admin.py` endpoints
- **Admin Service**: Direct integration with `AdminService` business logic
- **Authentication**: Use existing `get_current_admin` dependency for all admin operations
- **Data Models**: Utilize existing user schemas and admin-specific request/response models

## Components and Interfaces

### Core Admin Action Files

#### `/frontend/src/actions/admin/users.ts`

```typescript
// User management actions
-getAllUsers(page, limit, sortBy, sortOrder) -
  searchUsers(filters, pagination) -
  getUserById(userId) -
  updateUserAdminFields(userId, updateData) -
  blockUser(userId) -
  unblockUser(userId) -
  getUnverifiedUsers(daysOld, pagination) -
  getBlockedUsers(pagination) -
  getAdminUsers(pagination);
```

#### `/frontend/src/actions/admin/analytics.ts`

```typescript
// Analytics and reporting actions
-getUserStatistics() - getSystemReports(days);
```

### Enhanced Admin Components

#### Dashboard Statistics Component

- **Location**: `/frontend/src/components/admin/dashboard/StatsCards.tsx`
- **Purpose**: Display real-time user statistics from backend
- **Data Source**: `getUserStatistics()` and `getSystemReports()` actions
- **Features**: Loading states, error handling, auto-refresh capability

#### User Management Table Component

- **Location**: `/frontend/src/components/admin/users/UserTable.tsx`
- **Purpose**: Comprehensive user listing with search, filter, and pagination
- **Data Source**: `getAllUsers()` and `searchUsers()` actions
- **Features**: Sortable columns, advanced filtering, bulk actions, user detail modals

#### User Actions Component

- **Location**: `/frontend/src/components/admin/users/UserActions.tsx`
- **Purpose**: User-specific actions (block/unblock, edit admin fields)
- **Data Source**: `blockUser()`, `unblockUser()`, `updateUserAdminFields()` actions
- **Features**: Confirmation dialogs, optimistic updates, error handling

### Page Implementations

#### Admin Dashboard (`/admin/page.tsx`)

- Real-time statistics cards
- Recent activity feed (using existing data)
- Quick action buttons linking to specific admin functions
- System health indicators

#### User Management (`/admin/users/page.tsx`)

- Comprehensive user table with all user data
- Advanced search and filtering interface
- Pagination controls
- User statistics summary

#### Specialized User Views

- **KYC Verifications** (`/admin/users/kyc/page.tsx`): Users with KYC status filtering
- **Blocked Users** (`/admin/users/blocked/page.tsx`): Only blocked users
- **Admin Users** (`/admin/users/roles/page.tsx`): Only admin users

#### Reports and Analytics (`/admin/reports/page.tsx`)

- Registration analytics charts
- User growth trends
- System usage statistics
- Exportable reports

## Data Models

### Frontend Type Definitions

#### User Interface Types

```typescript
interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  is_admin: boolean;
  is_blocked: boolean;
  country: string;
  created_at: string;
  kyc_status?: string;
}

interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface UserStatistics {
  total_users: number;
  verified_users: number;
  blocked_users: number;
  admin_users: number;
  recent_registrations: number;
}
```

#### Search and Filter Types

```typescript
interface UserSearchFilters {
  search_term?: string;
  country?: string;
  is_verified?: boolean;
  is_blocked?: boolean;
  is_admin?: boolean;
  registration_start?: string;
  registration_end?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
```

### API Integration Patterns

#### Request/Response Handling

- Consistent error handling across all admin actions
- Loading state management for all async operations
- Optimistic updates for user actions (block/unblock)
- Automatic retry logic for failed requests

#### Data Transformation

- Convert backend datetime strings to frontend-friendly formats
- Handle optional fields and null values gracefully
- Normalize user data for consistent display

## Error Handling

### API Error Management

- **Network Errors**: Display retry options with exponential backoff
- **Authentication Errors**: Redirect to login with appropriate messaging
- **Authorization Errors**: Show access denied messages for non-admin users
- **Validation Errors**: Display field-specific error messages
- **Server Errors**: Show generic error messages with support contact information

### User Feedback Systems

- **Toast Notifications**: Success/error messages for user actions
- **Loading Indicators**: Skeleton loaders for data fetching
- **Empty States**: Informative messages when no data is available
- **Confirmation Dialogs**: For destructive actions like blocking users

### Error Recovery

- **Automatic Retry**: For transient network failures
- **Manual Refresh**: User-initiated data refresh options
- **Graceful Degradation**: Show cached data when real-time updates fail
- **Fallback UI**: Basic functionality when advanced features fail

## Testing Strategy

### Component Testing

- Unit tests for all admin action functions
- Component tests for user management interfaces
- Integration tests for API communication
- Error handling scenario testing

### User Experience Testing

- Admin workflow testing (user management, blocking, searching)
- Performance testing with large user datasets
- Accessibility testing for admin interface compliance
- Cross-browser compatibility testing

### API Integration Testing

- Mock API responses for development and testing
- Error scenario simulation
- Authentication and authorization testing
- Data consistency validation

## Implementation Approach

### Phase 1: Core Infrastructure

1. Create admin action files with all backend integrations
2. Implement error handling and loading state patterns
3. Set up type definitions and interfaces

### Phase 2: Dashboard Enhancement

1. Replace static dashboard data with real backend data
2. Implement statistics cards with live data
3. Add auto-refresh capabilities

### Phase 3: User Management

1. Build comprehensive user table with real data
2. Implement search and filtering functionality
3. Add user action capabilities (block/unblock, edit)

### Phase 4: Specialized Views

1. Create KYC verification management interface
2. Implement blocked users management
3. Build admin users management interface

### Phase 5: Analytics and Reporting

1. Integrate system reports and analytics
2. Add data visualization components
3. Implement export functionality

### Development Guidelines

- Maintain existing design system and component patterns
- Follow established code organization and naming conventions
- Ensure all new components are responsive and accessible
- Implement proper TypeScript typing throughout
- Add comprehensive error handling and loading states
- Write unit tests for all new functionality
