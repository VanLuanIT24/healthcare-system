#!/usr/bin/env powershell

<#
.SYNOPSIS
Healthcare System Docker Management Script (Windows)

.DESCRIPTION
Complete Docker management for Healthcare System with easy commands.

.EXAMPLE
.\docker-manage.ps1 build
.\docker-manage.ps1 up
.\docker-manage.ps1 logs backend
#>

param(
    [Parameter(Position = 0)]
    [ValidateSet('build', 'up', 'down', 'status', 'logs', 'restart', 'clean', 'fullclean', 'shell', 'test', 'help')]
    [string]$Command = 'help',
    
    [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
)

# ============================================
# Configuration
# ============================================
$Colors = @{
    Success = [ConsoleColor]::Green
    Error   = [ConsoleColor]::Red
    Warning = [ConsoleColor]::Yellow
    Info    = [ConsoleColor]::Cyan
}

$Env:COMPOSE_FILE = 'docker-compose.yml'
$Env:COMPOSE_PROJECT_NAME = 'healthcare-system'

# ============================================
# Helper Functions
# ============================================

function Write-Header {
    param([string]$Message)
    Write-Host "`n" -NoNewline
    Write-Host ("=" * 50) -ForegroundColor $Colors.Info
    Write-Host $Message -ForegroundColor $Colors.Info
    Write-Host ("=" * 50) -ForegroundColor $Colors.Info
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ " -ForegroundColor $Colors.Success -NoNewline
    Write-Host $Message
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ " -ForegroundColor $Colors.Error -NoNewline
    Write-Host $Message
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ " -ForegroundColor $Colors.Warning -NoNewline
    Write-Host $Message
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ " -ForegroundColor $Colors.Info -NoNewline
    Write-Host $Message
}

function Check-Docker {
    try {
        $version = docker --version
        Write-Success "Docker found: $version"
        return $true
    } catch {
        Write-Error-Custom "Docker not found or not running"
        return $false
    }
}

function Check-DockerCompose {
    try {
        $version = docker-compose --version
        Write-Success "Docker Compose found: $version"
        return $true
    } catch {
        Write-Error-Custom "Docker Compose not found"
        return $false
    }
}

function Check-EnvFile {
    if (-not (Test-Path '.env.docker')) {
        Write-Warning-Custom ".env.docker not found"
        Write-Info "Creating .env.docker from template..."
        Copy-Item '.env.example' '.env.docker' -ErrorAction SilentlyContinue
        Write-Info "Please update .env.docker with your settings"
    } else {
        Write-Success ".env.docker found"
    }
}

# ============================================
# Commands
# ============================================

function Invoke-Build {
    Write-Header "Building Docker Images"
    
    if (-not (Check-Docker -and Check-DockerCompose)) { return }
    
    Check-EnvFile
    
    Write-Info "Building backend image..."
    $env:COMPOSE_FILE = 'docker-compose.yml'
    docker-compose build backend --no-cache
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Backend build failed"
        return
    }
    
    Write-Success "Backend built successfully"
    
    Write-Info "Building frontend image..."
    docker-compose build frontend --no-cache
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Frontend build failed"
        return
    }
    
    Write-Success "Frontend built successfully"
    Write-Success "All images built successfully!"
}

function Invoke-Up {
    Write-Header "Starting Containers"
    
    if (-not (Check-Docker -and Check-DockerCompose)) { return }
    
    Check-EnvFile
    
    Write-Info "Starting all services (this may take a minute)..."
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All containers started!"
        Start-Sleep -Seconds 3
        Invoke-Status
        
        Write-Host ""
        Write-Info "Services:"
        Write-Host "  Frontend:  http://localhost:3000"
        Write-Host "  Backend:   http://localhost:5000"
        Write-Host "  MongoDB:   mongodb://mongo:password@localhost:27017"
    } else {
        Write-Error-Custom "Failed to start containers"
    }
}

function Invoke-Down {
    Write-Header "Stopping Containers"
    
    if (-not (Check-Docker -and Check-DockerCompose)) { return }
    
    Write-Info "Stopping all services..."
    docker-compose down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All containers stopped!"
    } else {
        Write-Error-Custom "Failed to stop containers"
    }
}

function Invoke-Status {
    Write-Header "Container Status"
    
    if (-not (Check-Docker -and Check-DockerCompose)) { return }
    
    docker-compose ps
}

function Invoke-Logs {
    param([string]$Service = $Arguments[0])
    
    Write-Header "Docker Logs"
    
    if (-not (Check-Docker -and Check-DockerCompose)) { return }
    
    if ($Service) {
        Write-Info "Showing logs for: $Service (Ctrl+C to stop)"
        docker-compose logs -f $Service
    } else {
        Write-Info "Showing logs for all services (Ctrl+C to stop)"
        docker-compose logs -f
    }
}

function Invoke-Restart {
    param([string]$Service = $Arguments[0])
    
    Write-Header "Restarting Services"
    
    if (-not (Check-Docker -and Check-DockerCompose)) { return }
    
    if ($Service) {
        Write-Info "Restarting: $Service"
        docker-compose restart $Service
        Write-Success "Service restarted!"
    } else {
        Write-Info "Restarting all services..."
        docker-compose restart
        Write-Success "All services restarted!"
    }
}

function Invoke-Clean {
    Write-Header "Cleaning Stopped Containers"
    
    if (-not (Check-Docker -and Check-DockerCompose)) { return }
    
    Write-Warning-Custom "Removing stopped containers..."
    docker container prune -f
    
    Write-Success "Cleanup complete!"
}

function Invoke-FullClean {
    Write-Header "Full System Cleanup"
    
    if (-not (Check-Docker -and Check-DockerCompose)) { return }
    
    Write-Warning-Custom "This will remove ALL containers, images, and volumes!"
    
    $response = Read-Host "Continue? (yes/no)"
    
    if ($response -eq "yes") {
        Write-Info "Stopping containers..."
        docker-compose down -v
        
        Write-Warning-Custom "Removing containers..."
        docker container prune -af
        
        Write-Warning-Custom "Removing images..."
        docker image prune -af
        
        Write-Warning-Custom "Removing volumes..."
        docker volume prune -f
        
        Write-Success "Full cleanup complete!"
    } else {
        Write-Info "Cleanup cancelled"
    }
}

function Invoke-Shell {
    param([string]$Service = $Arguments[0])
    
    if (-not $Service) { $Service = "backend" }
    
    Write-Header "Shell Access: $Service"
    
    if (-not (Check-Docker -and Check-DockerCompose)) { return }
    
    Write-Info "Connecting to $Service..."
    docker-compose exec $Service sh
}

function Invoke-Test {
    Write-Header "Testing Healthcare System"
    
    if (-not (Check-Docker -and Check-DockerCompose)) { return }
    
    Write-Info "Testing services..."
    
    # Check MongoDB
    Write-Info "Checking MongoDB..."
    $mongoDB = docker-compose exec -T mongodb mongosh --eval "db.version()" 2>&1
    if ($?) {
        Write-Success "MongoDB is running"
    } else {
        Write-Error-Custom "MongoDB test failed"
    }
    
    # Check Backend
    Write-Info "Checking Backend API..."
    $backend = Invoke-WebRequest -Uri "http://localhost:5000/health" -ErrorAction SilentlyContinue
    if ($backend.StatusCode -eq 200) {
        Write-Success "Backend API is responding"
    } else {
        Write-Error-Custom "Backend API test failed"
    }
    
    # Check Frontend
    Write-Info "Checking Frontend..."
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -ErrorAction SilentlyContinue
    if ($frontend.StatusCode -eq 200) {
        Write-Success "Frontend is serving"
    } else {
        Write-Error-Custom "Frontend test failed"
    }
    
    Write-Info "Testing login credentials..."
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body '{"email":"admin@healthcare.com","password":"@Admin123"}' `
        -ErrorAction SilentlyContinue
    
    if ($loginResponse.StatusCode -eq 200) {
        Write-Success "Login endpoint is working"
    } else {
        Write-Error-Custom "Login test failed"
    }
}

function Invoke-Help {
    Write-Header "Healthcare System Docker Management"
    
    Write-Host "Usage: .\docker-manage.ps1 <command> [options]`n"
    
    Write-Host "Commands:" -ForegroundColor $Colors.Info
    Write-Host "  build             Build all Docker images"
    Write-Host "  up                Start all containers"
    Write-Host "  down              Stop all containers"
    Write-Host "  status            Show container status"
    Write-Host "  logs [service]    Show logs (backend|frontend|mongodb|nginx)"
    Write-Host "  restart [service] Restart services"
    Write-Host "  clean             Remove stopped containers"
    Write-Host "  fullclean         Remove all containers/images/volumes (⚠️  destructive)"
    Write-Host "  shell [service]   Open shell in container"
    Write-Host "  test              Test all services"
    Write-Host "  help              Show this help message"
    
    Write-Host "`nExamples:" -ForegroundColor $Colors.Info
    Write-Host "  .\docker-manage.ps1 build"
    Write-Host "  .\docker-manage.ps1 up"
    Write-Host "  .\docker-manage.ps1 logs backend"
    Write-Host "  .\docker-manage.ps1 shell backend"
    Write-Host "  .\docker-manage.ps1 test"
    
    Write-Host "`nURLs:" -ForegroundColor $Colors.Info
    Write-Host "  Frontend:   http://localhost:3000"
    Write-Host "  Backend:    http://localhost:5000/api"
    Write-Host "  MongoDB:    mongodb://mongo:password@localhost:27017"
    
    Write-Host "`nDebug:" -ForegroundColor $Colors.Info
    Write-Host "  Check status:      .\docker-manage.ps1 status"
    Write-Host "  View logs:         .\docker-manage.ps1 logs"
    Write-Host "  Access shell:      .\docker-manage.ps1 shell backend"
    Write-Host "  Run tests:         .\docker-manage.ps1 test"
}

# ============================================
# Main
# ============================================

switch ($Command) {
    'build'     { Invoke-Build }
    'up'        { Invoke-Up }
    'down'      { Invoke-Down }
    'status'    { Invoke-Status }
    'logs'      { Invoke-Logs }
    'restart'   { Invoke-Restart }
    'clean'     { Invoke-Clean }
    'fullclean' { Invoke-FullClean }
    'shell'     { Invoke-Shell }
    'test'      { Invoke-Test }
    'help'      { Invoke-Help }
    default {
        Write-Error-Custom "Unknown command: $Command"
        Invoke-Help
    }
}
