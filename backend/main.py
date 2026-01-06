from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from datetime import datetime
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import logging
from src.utils.env_utils import get_required_env

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(filename)s:%(lineno)d - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],  # Output logs to console
)

# Load environment variables
load_dotenv()

# Import database components
from src.db import get_db

# Import models
from src.models import User

# Import the centralized API router
from src.endpoints.api_router import api_router

# Import auth middleware
from src.utils.auth_middleware import AuthMiddleware

# Load frontend URL from environment variables
frontend_url = get_required_env("FRONTEND_URL")

# FastAPI app
app = FastAPI(title="Swaphubu API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Add authentication middleware
app.add_middleware(
    AuthMiddleware,
    public_paths=[
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
        "/api/auth/verify-reset-code",
        "/api/auth/logout",
        "/",
        "/health",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/api/kyc/webhook",  # Allow webhook without auth
        "/api/p100/webhook",  # Allow P100 webhook without auth
        "/api/p100/webhook/health",  # Allow P100 health webhook without auth
    ],
    exclude_paths=["/static", "/favicon.ico"],
)

# Include the main API router with /api prefix
app.include_router(api_router, prefix="/api")


@app.get("/", response_class=HTMLResponse)
async def root():
    with open("templates/index.html", "r", encoding="utf-8") as file:
        return file.read()


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)