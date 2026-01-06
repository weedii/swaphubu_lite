"""
Authentication middleware for FastAPI.
This middleware checks for authentication on protected routes.
"""

from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from jose import JWTError, jwt
import logging
from typing import List, Callable, Optional

from .auth import SECRET_KEY, ALGORITHM, clear_auth_cookie
from ..models.User import User
from ..db.base import SessionLocal

# Configure logging
logger = logging.getLogger(__name__)


def is_localhost_request(request: Request) -> bool:
    """
    Check if the request is coming from localhost.

    Args:
        request: FastAPI request object

    Returns:
        bool: True if request is from localhost, False otherwise
    """
    # Check the Host header first (most reliable for localhost detection)
    host_header = request.headers.get("host", "").lower()

    # Check if host header contains localhost patterns
    localhost_host_patterns = ["localhost"]

    # Check if any localhost pattern is in the host header
    for pattern in localhost_host_patterns:
        if host_header.split(":")[0] == pattern:
            logger.info(f"Localhost access detected via Host header: {host_header}")
            return True

    logger.info(f"Non-localhost access detected. Host header: {host_header}")
    return False


def is_localhost_only_route(path: str) -> bool:
    """
    Check if a route should only be accessible from localhost.

    Args:
        path: Request path

    Returns:
        bool: True if route should be localhost-only, False otherwise
    """
    localhost_only_routes = ["/docs", "/openapi.json", "/redoc"]

    return path in localhost_only_routes


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware for handling authentication on protected routes.
    Checks for JWT token in cookies and validates it.
    """

    def __init__(
        self,
        app,
        public_paths: List[str] = None,
        exclude_paths: List[str] = None,
        auth_callback: Optional[Callable] = None,
    ):
        """
        Initialize the middleware.

        Args:
            app: FastAPI application
            public_paths: List of paths that don't require authentication
            exclude_paths: List of paths to exclude from middleware processing
            auth_callback: Optional callback function to run after successful authentication
        """
        super().__init__(app)
        # Public paths that don't require authentication
        self.public_paths = public_paths or [
            "/auth/login",
            "/auth/register",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/logout",
            "/",
            "/health",
            "/docs",
            "/openapi.json",
            "/redoc",
            "/kyc/webhook",  # Allow webhook without auth
        ]

        # Create exact path matchers to avoid partial matches
        self.exact_public_paths = set(self.public_paths)

        self.exclude_paths = exclude_paths or []
        self.auth_callback = auth_callback
        logger.info(
            f"AuthMiddleware initialized with public paths: {self.public_paths}"
        )

    def is_public_path(self, path: str) -> bool:
        """
        Check if a path is public using exact matching.

        Args:
            path: Request path

        Returns:
            bool: True if path is public, False otherwise
        """
        # Exact match only
        return path in self.exact_public_paths

    def create_unauthorized_response(
        self, message: str = "Authentication required"
    ) -> JSONResponse:
        """
        Create a JSONResponse with 401 status and clear the auth cookie.

        Args:
            message: Error message to include in response

        Returns:
            JSONResponse: Response with cleared auth cookie
        """
        response = JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED, content={"detail": message}
        )
        # Clear the auth cookie in the response
        clear_auth_cookie(response)
        logger.info(f"Created unauthorized response with message: {message}")
        logger.info(f"Response headers after clearing cookie: {dict(response.headers)}")
        return response

    async def dispatch(self, request: Request, call_next):
        """
        Process the request through the middleware.

        Args:
            request: FastAPI request object
            call_next: Next middleware in the chain

        Returns:
            Response: FastAPI response object
        """
        path = request.url.path
        method = request.method
        logger.info(f"Processing {method} request to {path}")

        # Skip middleware for OPTIONS requests (preflight requests)
        if method == "OPTIONS":
            logger.info(f"Skipping auth middleware for OPTIONS request to {path}")
            return await call_next(request)

        # Skip middleware for excluded paths
        if any(path.startswith(excluded) for excluded in self.exclude_paths):
            logger.info(f"Path {path} is excluded from auth middleware")
            return await call_next(request)

        # Check if this is a localhost-only route
        if is_localhost_only_route(path):
            if not is_localhost_request(request):
                logger.warning(f"Non-localhost access denied to {path}")
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={
                        "detail": "Access denied: This endpoint is not accessible!!"
                    },
                )
            logger.info(f"Localhost access granted to {path}")

        # Skip authentication for public paths - EXACT MATCH ONLY
        if self.is_public_path(path):
            logger.info(f"Path {path} is public, skipping authentication")
            return await call_next(request)

        # All other paths require authentication
        logger.info(f"Path {path} requires authentication")

        # Check for authentication
        try:
            # Get token from cookie
            token = request.cookies.get("access_token")
            if token is None:
                logger.warning(f"No access token found for request to {path}")
                return self.create_unauthorized_response("Authentication required")

            # Decode and validate token
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                user_id = payload.get("sub")
                if user_id is None:
                    logger.warning(f"Invalid token (no sub) for request to {path}")
                    return self.create_unauthorized_response("Invalid authentication")
            except JWTError as jwt_error:
                logger.error(
                    f"JWT validation error for request to {path}: {str(jwt_error)}"
                )
                return self.create_unauthorized_response("Invalid authentication token")

            # Get user from database
            db = SessionLocal()
            try:
                user = User.get_by_id(db, user_id)
                if user is None:
                    logger.warning(
                        f"User not found for ID {user_id} on request to {path}"
                    )
                    return self.create_unauthorized_response("User not found")

                if hasattr(user, "is_deleted") and user.is_deleted:
                    logger.warning(
                        f"Deactivated user {user_id} attempted access to {path}"
                    )
                    return self.create_unauthorized_response(
                        "User account is deactivated"
                    )

                # Set the user in request state for access in endpoints
                request.state.user = user
                logger.info(f"Authenticated user {user_id} for request to {path}")

                # Run auth callback if provided
                if self.auth_callback:
                    self.auth_callback(request, user)

            finally:
                db.close()

            # Continue processing the request with the authenticated user
            response = await call_next(request)
            return response

        except Exception as e:
            logger.error(
                f"Authentication middleware error for request to {path}: {str(e)}"
            )
            return self.create_unauthorized_response("Authentication error")
