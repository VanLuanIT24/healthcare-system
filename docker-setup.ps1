# ============================================
# 🐳 Healthcare System Docker Management
# ============================================
# PowerShell Script for Docker Operations
# Usage: .\docker-setup.ps1 <command>

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Color codes for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Check-Docker {
    try {
        $version = docker --version
        Write-Host "${Green}✓ Docker found: $version${Reset}"
        return $true
    } catch {
        Write-Host "${Red}✗ Docker is not installed or not running${Reset}"
        Write-Host "Please install Docker Desktop or start Docker service"
        return $false
    }
}

function Build {
    Write-Header "Building Docker Images"
    
    if (-not (Check-Docker)) { return }
    
    Write-Host "${Blue}Building backend image...${Reset}"
    docker-compose build backend --no-cache
    if ($LASTEXITCODE -ne 0) { Write-Host "${Red}Backend build failed${Reset}"; return }
    
    Write-Host "${Green}✓ Backend built successfully${Reset}"
    
    Write-Host "${Blue}Building frontend image...${Reset}"
    docker-compose build frontend --no-cache
    if ($LASTEXITCODE -ne 0) { Write-Host "${Red}Frontend build failed${Reset}"; return }
    
    Write-Host "${Green}✓ Frontend built successfully${Reset}"
    
    Write-Host "${Green}✓ All images built successfully!${Reset}"
}

function Up {
    Write-Header "Starting Containers"
    
    if (-not (Check-Docker)) { return }
    
    Write-Host "${Blue}Starting all services...${Reset}"
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "${Green}✓ All containers started!${Reset}"
        Start-Sleep -Seconds 3
        Status
    } else {
        Write-Host "${Red}✗ Failed to start containers${Reset}"
    }
}

function Down {
    Write-Header "Stopping Containers"
    
    if (-not (Check-Docker)) { return }
    
    Write-Host "${Blue}Stopping all services...${Reset}"
    docker-compose down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "${Green}✓ All containers stopped!${Reset}"
    } else {
        Write-Host "${Red}✗ Failed to stop containers${Reset}"
    }
}

function Status {
    Write-Header "Container Status"
    
    if (-not (Check-Docker)) { return }
    
    docker-compose ps
}

function Logs {
    param([string]$Service = "")
    
    Write-Header "Docker Logs"
    
    if (-not (Check-Docker)) { return }
    
    if ($Service) {
        Write-Host "${Blue}Showing logs for: $Service${Reset}"
        docker-compose logs -f $Service
    } else {
        Write-Host "${Blue}Showing logs for all services (Ctrl+C to stop)...${Reset}"
        docker-compose logs -f
    }
}

function Restart {
    param([string]$Service = "")
    
    Write-Header "Restarting Services"
    
    if (-not (Check-Docker)) { return }
    
    if ($Service) {
        Write-Host "${Blue}Restarting: $Service${Reset}"
        docker-compose restart $Service
        Write-Host "${Green}✓ Service restarted!${Reset}"
    } else {
        Write-Host "${Blue}Restarting all services...${Reset}"
        docker-compose restart
        Write-Host "${Green}✓ All services restarted!${Reset}"
    }
}

function Clean {
    Write-Header "Cleaning Stopped Containers"
    
    if (-not (Check-Docker)) { return }
    
    Write-Host "${Yellow}Removing stopped containers...${Reset}"
    docker container prune -f
    
    Write-Host "${Green}✓ Cleanup complete!${Reset}"
}

function FullClean {
    Write-Header "Full System Cleanup"
    
    if (-not (Check-Docker)) { return }
    
    Write-Host "${Yellow}⚠️  This will remove all containers and images!${Reset}"
    $confirm = Read-Host "Continue? (yes/no)"
    
    if ($confirm -eq "yes") {
        Write-Host "${Blue}Stopping containers...${Reset}"
        docker-compose down
        
        Write-Host "${Yellow}Removing containers...${Reset}"
        docker container prune -af
        
        Write-Host "${Yellow}Removing images...${Reset}"
        docker image prune -af
        
        Write-Host "${Green}✓ Full cleanup complete!${Reset}"
    } else {
        Write-Host "${Blue}Cleanup cancelled${Reset}"
    }
}

function Shell {
    param([string]$Service = "backend")
    
    Write-Header "Shell Access: $Service"
    
    if (-not (Check-Docker)) { return }
    
    Write-Host "${Blue}Connecting to $Service...${Reset}"
    docker-compose exec $Service sh
}

function Help {
    Write-Header "Healthcare System Docker Commands"
    
    Write-Host "${Green}Usage:${Reset} .\docker-setup.ps1 <command> [options]"
    Write-Host ""
    Write-Host "${Green}Commands:${Reset}"
    Write-Host "  ${Blue}build${Reset}           - Build all Docker images"
    Write-Host "  ${Blue}up${Reset}              - Start all containers"
    Write-Host "  ${Blue}down${Reset}            - Stop all containers"
    Write-Host "  ${Blue}status${Reset}          - Show container status"
    Write-Host "  ${Blue}logs [service]${Reset}  - Show logs (service: backend, frontend, mongodb, nginx)"
    Write-Host "  ${Blue}restart [service]${Reset} - Restart services"
    Write-Host "  ${Blue}clean${Reset}           - Remove stopped containers"
    Write-Host "  ${Blue}fullclean${Reset}       - Remove all containers and images (⚠️  destructive)"
    Write-Host "  ${Blue}shell [service]${Reset} - Open shell in container"
    Write-Host "  ${Blue}help${Reset}            - Show this help message"
    Write-Host ""
    Write-Host "${Green}Examples:${Reset}"
    Write-Host "  .\docker-setup.ps1 build"
    Write-Host "  .\docker-setup.ps1 up"
    Write-Host "  .\docker-setup.ps1 logs backend"
    Write-Host "  .\docker-setup.ps1 shell backend"
    Write-Host ""
    Write-Host "${Green}URLs:${Reset}"
    Write-Host "  Frontend:   http://localhost:3000"
    Write-Host "  Backend:    http://localhost:5000"
    Write-Host "  MongoDB:    mongodb://mongo:password@localhost:27017"
    Write-Host ""
}

# Execute command
switch ($Command.ToLower()) {
    "build"      { Build }
    "up"         { Up }
    "down"       { Down }
    "status"     { Status }
    "logs"       { Logs -Service $args[0] }
    "restart"    { Restart -Service $args[0] }
    "clean"      { Clean }
    "fullclean"  { FullClean }
    "shell"      { Shell -Service $args[0] }
    "help"       { Help }
    default      { Write-Host "${Red}Unknown command: $Command${Reset}"; Help }
}
