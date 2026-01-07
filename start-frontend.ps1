# =============================================================================
# SwapHubu Frontend Development Startup Script
# =============================================================================
# This script starts the Next.js frontend application
# Usage: .\start-frontend.ps1

param(
    [switch]$Help
)

# Show help if requested
if ($Help) {
    Write-Host "SwapHubu Frontend Development Startup Script" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\start-frontend.ps1        # Start the frontend development server" -ForegroundColor Cyan
    Write-Host "  .\start-frontend.ps1 -Help  # Show this help message" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This script will:" -ForegroundColor Yellow
    Write-Host "  1. Navigate to the frontend directory" -ForegroundColor Cyan
    Write-Host "  2. Install dependencies if needed" -ForegroundColor Cyan
    Write-Host "  3. Start the Next.js development server" -ForegroundColor Cyan
    Write-Host "  4. Open the application in your browser" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

Write-Host "Starting SwapHubu Frontend Development Server..." -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Function to check if Node.js is installed
function Test-NodeJS {
    try {
        $nodeVersion = node --version
        Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if npm is installed
function Test-NPM {
    try {
        $npmVersion = npm --version
        Write-Host "npm version: $npmVersion" -ForegroundColor Green
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if dependencies are installed
function Test-Dependencies {
    return Test-Path "frontend/node_modules"
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    try {
        Set-Location frontend
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Dependencies installed successfully!" -ForegroundColor Green
            Set-Location ..
            return $true
        } else {
            Write-Host "Failed to install dependencies!" -ForegroundColor Red
            Set-Location ..
            return $false
        }
    }
    catch {
        Write-Host "Error installing dependencies: $($_.Exception.Message)" -ForegroundColor Red
        Set-Location ..
        return $false
    }
}

# Function to start the development server
function Start-DevServer {
    Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
    try {
        Set-Location frontend
        
        # Start the development server
        Write-Host "Running 'npm run dev'..." -ForegroundColor Cyan
        npm run dev
        
    }
    catch {
        Write-Host "Error starting development server: $($_.Exception.Message)" -ForegroundColor Red
        Set-Location ..
        return $false
    }
}

# Function to show service information
function Show-ServiceInfo {
    Write-Host ""
    Write-Host "SwapHubu Frontend is now running!" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host ""
    Write-Host "Your application is available at:" -ForegroundColor Green
    Write-Host "   Frontend Application: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   Landing Page:         http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   Admin Dashboard:      http://localhost:3000/admin" -ForegroundColor Cyan
    Write-Host "   Admin Sign In:        http://localhost:3000/signin" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Default Admin Credentials:" -ForegroundColor Yellow
    Write-Host "   Email:    admin@swaphubu.com" -ForegroundColor Cyan
    Write-Host "   Password: admin123" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To stop the server, press Ctrl+C" -ForegroundColor Yellow
    Write-Host ""
}

# Main execution
try {
    # Check if Node.js is installed
    Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
    if (-not (Test-NodeJS)) {
        Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
        Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }

    # Check if npm is installed
    Write-Host "Checking npm installation..." -ForegroundColor Yellow
    if (-not (Test-NPM)) {
        Write-Host "ERROR: npm is not installed!" -ForegroundColor Red
        Write-Host "Please install npm (usually comes with Node.js)" -ForegroundColor Yellow
        exit 1
    }

    # Check if frontend directory exists
    if (-not (Test-Path "frontend")) {
        Write-Host "ERROR: Frontend directory not found!" -ForegroundColor Red
        Write-Host "Please make sure you're running this script from the project root directory." -ForegroundColor Yellow
        exit 1
    }

    # Check if dependencies are installed
    Write-Host "Checking dependencies..." -ForegroundColor Yellow
    if (-not (Test-Dependencies)) {
        Write-Host "Dependencies not found. Installing..." -ForegroundColor Yellow
        if (-not (Install-Dependencies)) {
            Write-Host "Failed to install dependencies!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Dependencies are already installed!" -ForegroundColor Green
    }

    # Show service information
    Show-ServiceInfo

    # Start the development server
    Start-DevServer

} catch {
    Write-Host ""
    Write-Host "An error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Make sure we're back in the original directory
    if (Get-Location | Select-Object -ExpandProperty Path | Select-String "frontend") {
        Set-Location ..
    }
}