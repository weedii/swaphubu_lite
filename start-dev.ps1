# =============================================================================
# SwapHubu Development Environment Startup Script
# =============================================================================
# This script checks for required environment variables and starts all containers
# Usage: .\start-dev.ps1 [-Rebuild]
#        .\start-dev.ps1 -Rebuild  # Force rebuild of all containers
#        .\start-dev.ps1 -CleanAll # Clean all containers, images, and volumes

param(
    [switch]$Rebuild,
    [switch]$CleanAll,
    [switch]$Help
)

# Show help if requested
if ($Help) {
    Write-Host "SwapHubu Development Environment Startup Script" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\start-dev.ps1           # Normal startup (uses cached images)" -ForegroundColor Cyan
    Write-Host "  .\start-dev.ps1 -Rebuild  # Force rebuild all containers" -ForegroundColor Cyan
    Write-Host "  .\start-dev.ps1 -CleanAll # Clean all containers, images, and volumes" -ForegroundColor Cyan
    Write-Host "  .\start-dev.ps1 -Help     # Show this help message" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Rebuild    Force rebuild of all Docker images (use when requirements change)" -ForegroundColor Cyan
    Write-Host "  -CleanAll   Remove all containers, images, and volumes (WARNING: deletes all data!)" -ForegroundColor Cyan
    Write-Host "  -Help       Show this help message" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

if ($CleanAll) {
    Write-Host "Cleaning SwapHubu Development Environment..." -ForegroundColor Yellow
    Write-Host "WARNING: This will remove all containers, images, and volumes!" -ForegroundColor Red
    Write-Host "All data will be lost!" -ForegroundColor Red
    
    $confirmation = Read-Host "Are you sure you want to proceed? (y/n)"
    if ($confirmation -ne "y") {
        Write-Host "Operation cancelled." -ForegroundColor Green
        exit 0
    }
    
    Write-Host "Removing all containers, images, and volumes..." -ForegroundColor Yellow
    docker-compose down -v --rmi all --remove-orphans
    
    Write-Host "Clean completed. Run the script again without parameters to start fresh." -ForegroundColor Green
    exit 0
}

if ($Rebuild) {
    Write-Host "Starting SwapHubu Development Environment (REBUILD MODE)..." -ForegroundColor Green
    Write-Host "This will rebuild all containers from scratch..." -ForegroundColor Yellow
} else {
    Write-Host "Starting SwapHubu Development Environment..." -ForegroundColor Green
}
Write-Host "=" * 60 -ForegroundColor Gray

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if .env file exists
function Test-EnvFile {
    return Test-Path ".env"
}

# Function to load and validate environment variables
function Test-EnvironmentVariables {
    Write-Host "Checking environment variables..." -ForegroundColor Yellow
    
    # Load .env file if it exists
    if (Test-EnvFile) {
        Write-Host "Found .env file" -ForegroundColor Green
        
        Write-Host "== Loading Env =====================================================" -ForegroundColor Cyan
        
        # Read .env file and set environment variables
        $missingVars = @()
        
        foreach ($line in (Get-Content .env)) {
            if ($line -match '^\s*#') { continue }  # Skip comments
            if ($line -match '^\s*$') { continue }  # Skip empty lines
            if ($line -match '^([^=]+)=(.*)$') {    # Match any key=value format
                $key = $matches[1].Trim()
                $value = $matches[2].Trim('"').Trim("'").Trim()  # Remove quotes if present
                
                # Set the environment variable if value is not empty
                if ($value) {
                    [Environment]::SetEnvironmentVariable($key, $value, "Process")
                    Write-Host "Loaded $key = $value" -ForegroundColor Green
                } else {
                    $missingVars += $key
                    Write-Host "MISSING VALUE: $key" -ForegroundColor Red
                }
            }
        }
        
        Write-Host "==================================================================" -ForegroundColor Cyan
        
        # Check if any required variables are missing
        if ($missingVars.Count -gt 0) {
            Write-Host "`nMissing required environment variables:" -ForegroundColor Red
            $missingVars | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
            Write-Host "`nPlease ensure all variables in the .env file have values." -ForegroundColor Yellow
            return $false
        }
        
        Write-Host "All environment variables are present!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "ERROR: .env file not found!" -ForegroundColor Red
        Write-Host "`nPlease create a .env file with the required variables." -ForegroundColor Yellow
        return $false
    }
}

# Function to start Docker containers
function Start-Containers {
    param([bool]$ForceRebuild = $false)
    
    if ($ForceRebuild) {
        Write-Host "`nStarting Docker containers with FULL REBUILD..." -ForegroundColor Yellow
    } else {
        Write-Host "`nStarting Docker containers..." -ForegroundColor Yellow
    }
    
    try {
        # Stop any existing containers and remove volumes
        Write-Host "Stopping existing containers and removing volumes..." -ForegroundColor Yellow
        docker-compose down --remove-orphans -v 2>$null
        
        if ($ForceRebuild) {
            # Remove existing images to force complete rebuild
            Write-Host "Removing existing images for complete rebuild..." -ForegroundColor Yellow
            docker-compose down -v --rmi all --remove-orphans 2>$null
            
            # Build and start containers with no cache
            Write-Host "Building containers from scratch (no cache)..." -ForegroundColor Yellow
            docker-compose build --no-cache
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Starting rebuilt containers..." -ForegroundColor Yellow
                docker-compose up -d
            }
        } else {
            # Build and start containers (with cache)
            Write-Host "Building and starting containers..." -ForegroundColor Yellow
            docker-compose up --build -d
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Containers started successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Failed to start containers!" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "Error starting containers: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to show service URLs
function Show-ServiceUrls {
    Write-Host "`nYour services are available at:" -ForegroundColor Green
    Write-Host "   FastAPI Backend:    http://localhost:8000" -ForegroundColor Cyan
    Write-Host "   API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host "   pgAdmin Interface: http://localhost:5050" -ForegroundColor Cyan
    Write-Host "   PostgreSQL:        localhost:5432" -ForegroundColor Cyan
}

# Function to show container status
function Show-ContainerStatus {
    Write-Host "`nContainer Status:" -ForegroundColor Yellow
    docker-compose ps
}

# Function to show logs option
function Show-LogsInfo {
    Write-Host "`nTo view logs, use:" -ForegroundColor Yellow
    Write-Host "   docker-compose logs -f          # All services" -ForegroundColor Cyan
    Write-Host "   docker-compose logs -f backend  # Backend only" -ForegroundColor Cyan
    Write-Host "   docker-compose logs -f postgres # Database only" -ForegroundColor Cyan
    Write-Host "   docker-compose logs -f pgadmin  # pgAdmin only" -ForegroundColor Cyan
    
    Write-Host "`nTo generate migrations:" -ForegroundColor Yellow
    Write-Host "   .\backend\scripts\generate-migration.ps1" -ForegroundColor Cyan
    
    Write-Host "`nTo rebuild containers (when requirements change):" -ForegroundColor Yellow
    Write-Host "   .\start-dev.ps1 -Rebuild" -ForegroundColor Cyan
}

# Function to show stop command
function Show-StopInfo {
    Write-Host "`nTo stop all services:" -ForegroundColor Yellow
    Write-Host "   docker-compose down --remove-orphans -v  # Removes containers and volumes" -ForegroundColor Cyan
    Write-Host "   .\start-dev.ps1 -CleanAll  # Clean everything including images and volumes" -ForegroundColor Cyan
}

# Main execution
try {
    # Check environment variables first
    if (-not (Test-EnvironmentVariables)) {
        Write-Host "`nEnvironment check failed!" -ForegroundColor Red
        exit 1
    }
    
    # Check if Docker is running
    Write-Host "Checking Docker..." -ForegroundColor Yellow
    if (-not (Test-DockerRunning)) {
        Write-Host "ERROR: Docker is not running! Please start Docker Desktop first." -ForegroundColor Red
        exit 1
    }
    Write-Host "Docker is running!" -ForegroundColor Green
    
    # Start containers
    if (-not (Start-Containers -ForceRebuild $Rebuild)) {
        Write-Host "`nFailed to start containers!" -ForegroundColor Red
        exit 1
    }
    
    # Apply migrations
    Write-Host "`nApplying database migrations..." -ForegroundColor Yellow
    try {
        docker-compose exec -T backend python scripts/apply_migrations.py
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Migrations applied successfully!" -ForegroundColor Green
        } else {
            Write-Host "Migration check completed with warnings" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "Could not run migration check: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Wait a moment for containers to fully start
    Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Show success information
    Write-Host "`nSwapHubu Development Environment Started Successfully!" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Gray
    
    Show-ServiceUrls
    Show-ContainerStatus
    Show-LogsInfo
    Show-StopInfo
    
    Write-Host "`nHappy coding!" -ForegroundColor Green
    
} catch {
    Write-Host "`nAn error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 