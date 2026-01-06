FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]




















# =============================================================================
# PRODUCTION DOCKERFILE - UNCOMMENT AND USE FOR DEPLOYMENT
# =============================================================================
# 
# # Multi-stage build for smaller production image
# FROM python:3.11-slim as builder
# 
# # Install build dependencies
# RUN apt-get update && apt-get install -y \
#     gcc \
#     postgresql-client \
#     && rm -rf /var/lib/apt/lists/*
# 
# # Set working directory
# WORKDIR /app
# 
# # Copy and install Python dependencies
# COPY requirements.txt .
# RUN pip install --user --no-cache-dir -r requirements.txt
# 
# # Production stage
# FROM python:3.11-slim as production
# 
# # Create non-root user for security
# RUN groupadd -r appuser && useradd -r -g appuser appuser
# 
# # Install only runtime dependencies (no gcc needed)
# RUN apt-get update && apt-get install -y \
#     postgresql-client \
#     curl \
#     && rm -rf /var/lib/apt/lists/*
# 
# # Set working directory
# WORKDIR /app
# 
# # Copy Python packages from builder stage
# COPY --from=builder /root/.local /home/appuser/.local
# 
# # Copy application code
# COPY . .
# 
# # Change ownership to non-root user
# RUN chown -R appuser:appuser /app
# 
# # Switch to non-root user
# USER appuser
# 
# # Make sure scripts in .local are usable
# ENV PATH=/home/appuser/.local/bin:$PATH
# 
# # Expose port
# EXPOSE 8000
# 
# # Health check
# HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:8000/health || exit 1
# 
# # Production command (no --reload, optimized settings)
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--access-log"] 