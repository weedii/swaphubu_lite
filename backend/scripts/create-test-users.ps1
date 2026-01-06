# Script to create test users using Docker
# Usage: .\scripts\create-test-users.ps1 [args...]

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$ScriptArgs
)

# Function to check if database is running
function Test-DatabaseRunning {
    try {
        $result = docker-compose ps postgres 2>$null
        return $result -match "Up"
    }
    catch {
        return $false
    }
}

# Function to start database
function Start-Database {
    Write-Host "[INFO] Starting database..." -ForegroundColor Yellow
    docker-compose up -d postgres
    Write-Host "[INFO] Waiting for database to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Function to run create test users script in Docker
function Invoke-CreateTestUsers {
    param($Args)
    
    Write-Host "[EXEC] Running create test users script..." -ForegroundColor Cyan
    
    if ($Args) {
        docker-compose exec -T -w /app backend python "scripts/python/create_test_users.py" @Args
    } else {
        docker-compose exec -T -w /app backend python "scripts/python/create_test_users.py"
    }
}

# Main execution
try {
    Write-Host "[CHECK] Checking if database is running..." -ForegroundColor Blue
    
    if (-not (Test-DatabaseRunning)) {
        Start-Database
    } else {
        Write-Host "[OK] Database is already running" -ForegroundColor Green
    }
    
    # Run the create test users script
    Invoke-CreateTestUsers -Args $ScriptArgs
    
    Write-Host "[SUCCESS] Test users creation script completed!" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
