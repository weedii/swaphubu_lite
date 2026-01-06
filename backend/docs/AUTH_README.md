# SwapHubu Authentication System

This document provides an overview of the middleware-based authentication system used in the SwapHubu platform.

## Authentication Flow

1. **User Registration/Login**:

   - User registers or logs in through `/auth/register` or `/auth/login` endpoints
   - Backend validates credentials and generates a JWT token
   - Token is set as an HTTP-only secure cookie

2. **Authentication Middleware**:

   - All routes (except public ones) are protected by `AuthMiddleware`
   - Middleware checks for the presence of a valid JWT token in cookies
   - If token is valid, user is automatically added to `request.state.user`
   - If token is invalid or missing, returns 401 Unauthorized and clears the cookie
   - **OPTIONS requests are automatically skipped** (CORS preflight support)

3. **Route-level Authentication**:

   - Routes can access the authenticated user directly via `request.state.user`
   - No need to add authentication dependencies to each endpoint
   - Authentication is handled automatically by the middleware

4. **Automatic Logout**:
   - When authentication fails, the auth cookie is automatically cleared
   - Frontend intercepts 401 responses and redirects to login page
   - This ensures users are properly logged out when their session expires

## Key Features

- **Fully Automatic**: No need to add authentication checks to each endpoint
- **Centralized Configuration**: Public paths are configured in one place
- **Clean Endpoints**: Endpoints don't need to handle authentication logic
- **Automatic Logout**: Invalid tokens are automatically cleared
- **User Access**: Authenticated user is available in `request.state.user`
- **Exact Path Matching**: Public paths are matched exactly to avoid false positives
- **CORS Support**: OPTIONS requests are automatically handled for cross-origin requests

## Components

### Auth Middleware (`auth_middleware.py`)

Global middleware that checks authentication for all non-public routes.

```python
# Usage in main.py
app.add_middleware(
    AuthMiddleware,
    public_paths=["/auth/login", "/auth/register", ...],
    exclude_paths=["/static", ...]
)
```

**Key Features:**

- Skips OPTIONS requests (CORS preflight support)
- Uses exact path matching for public routes
- Automatically clears auth cookies on authentication failures
- Provides detailed logging for debugging

### Auth Utilities (`auth.py`)

Helper functions for authentication:

- `create_access_token(user_id)`: Creates JWT token
- `set_auth_cookie(response, token)`: Sets token as cookie
- `clear_auth_cookie(response)`: Clears auth cookie
- `get_current_user_from_state(request)`: Gets user from request state (for special cases)

### Frontend Integration

The frontend API client includes a response interceptor that:

1. Detects 401 Unauthorized responses
2. Clears the auth token from client-side storage
3. Redirects to the login page

## Public Routes

The following routes are public and don't require authentication:

- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/logout`
- `/`
- `/health`
- `/docs`
- `/openapi.json`
- `/redoc`
- `/kyc/webhook`

## Usage Examples

### Accessing Authenticated User in Route

```python
@router.get("/example")
def example_route(request: Request):
    # The authenticated user is automatically available in request.state.user
    user = request.state.user
    return {"message": f"Hello, {user.first_name}!"}
```

### Safe Access with Error Handling

```python
@router.get("/example")
def example_route(request: Request, response: Response):
    # Safely access the authenticated user from request state
    if not hasattr(request.state, "user"):
        clear_auth_cookie(response)
        raise HTTPException(status_code=401, detail="Authentication required")

    user = request.state.user
    return {"message": f"Hello, {user.first_name}!"}
```

### Admin-only Route

For admin-only routes, you can still use the `get_current_admin` dependency:

```python
from ..utils.auth import get_current_admin

@router.get("/admin-only")
def admin_route(request: Request, admin: User = Depends(get_current_admin)):
    return {"message": "You have admin access!"}
```

## Security Considerations

- JWT tokens are stored in HTTP-only secure cookies
- CSRF protection with SameSite=strict
- Tokens expire after 30 minutes
- Invalid tokens are automatically cleared
- Password reset tokens expire after 1 hour
- Exact path matching prevents unintended public access
- OPTIONS requests are safely skipped (they don't execute business logic)

## How It Works

1. The middleware intercepts all incoming requests
2. **OPTIONS requests are automatically skipped** (CORS preflight support)
3. For protected routes, it checks for a valid JWT token in cookies
4. If the token is valid, it retrieves the user from the database
5. The user is added to `request.state.user` for easy access in endpoints
6. If the token is invalid, it returns a 401 Unauthorized response and clears the cookie
7. The frontend intercepts 401 responses and redirects to the login page

## CORS Integration

The middleware works seamlessly with CORS:

- **CORS middleware is added before auth middleware** in the stack
- **OPTIONS requests are skipped** by auth middleware to allow CORS headers
- **Actual requests (GET/POST/PUT/DELETE)** are authenticated normally
- **Cross-origin requests work properly** with authentication

This approach ensures consistent authentication handling across the application and automatically logs out users with invalid tokens, all without requiring any authentication code in the endpoints themselves.
