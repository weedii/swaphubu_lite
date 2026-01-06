# =============================================================================
# Generate Migration Script
# =============================================================================
# This script generates a new Alembic migration based on model changes
# Usage: .\backend\scripts\generate-migration.ps1

param(
    [string]$Message = ""
)

Write-Host "Generating Alembic Migration..." -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray

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

# Function to check if containers are running
function Test-ContainersRunning {
    try {
        $containers = docker-compose ps -q
        return $containers.Count -gt 0
    }
    catch {
        return $false
    }
}

# Function to get migration message
function Get-MigrationMessage {
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $Message = Read-Host "Enter migration message (e.g., 'Add user table')"
        if ([string]::IsNullOrWhiteSpace($Message)) {
            $Message = "Auto-generated migration"
        }
    }
    return $Message
}

# Function to generate migration
function New-Migration {
    param([string]$MigrationMessage)
    
    try {
        Write-Host "Generating migration: '$MigrationMessage'" -ForegroundColor Yellow
        
        # Run alembic revision command in the backend container
        $result = docker-compose exec -T backend alembic revision --autogenerate -m $MigrationMessage
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCCESS: Migration generated successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "ERROR: Failed to generate migration!" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "ERROR: Error generating migration: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to show migration files
function Show-MigrationFiles {
    Write-Host "`nRecent migration files:" -ForegroundColor Yellow
    try {
        docker-compose exec -T backend ls -la alembic/versions/ | Select-Object -Last 5
    }
    catch {
        Write-Host "Could not list migration files" -ForegroundColor Red
    }
}

# Function to show next steps
function Show-NextSteps {
    Write-Host "`nNext Steps:" -ForegroundColor Green
    Write-Host "1. Review the generated migration file in backend/alembic/versions/" -ForegroundColor Cyan
    Write-Host "2. Make any necessary manual adjustments" -ForegroundColor Cyan
    Write-Host "3. Restart your app to apply the migration:" -ForegroundColor Cyan
    Write-Host "   .\start-dev.ps1" -ForegroundColor White
}

# Main execution
try {
    # Check if Docker is running
    Write-Host "Checking Docker..." -ForegroundColor Yellow
    if (-not (Test-DockerRunning)) {
        Write-Host "ERROR: Docker is not running! Please start Docker Desktop first." -ForegroundColor Red
        exit 1
    }
    Write-Host "SUCCESS: Docker is running!" -ForegroundColor Green
    
    # Check if containers are running
    Write-Host "Checking containers..." -ForegroundColor Yellow
    if (-not (Test-ContainersRunning)) {
        Write-Host "ERROR: Containers are not running! Please start them first:" -ForegroundColor Red
        Write-Host "   .\start-dev.ps1" -ForegroundColor Cyan
        exit 1
    }
    Write-Host "SUCCESS: Containers are running!" -ForegroundColor Green
    
    # Get migration message
    $migrationMessage = Get-MigrationMessage
    
    # Generate migration
    if (New-Migration -MigrationMessage $migrationMessage) {
        Show-MigrationFiles
        Show-NextSteps
        Write-Host "`nMigration generation completed!" -ForegroundColor Green
    } else {
        Write-Host "`nERROR: Migration generation failed!" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "`nERROR: An error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 