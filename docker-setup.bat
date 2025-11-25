@echo off
REM Healthcare System - Docker Build & Run Script (Windows)
REM =====================================================

setlocal enabledelayedexpansion

echo 🏥 Healthcare System - Docker Setup
echo ====================================

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo ✅ .env file created. Please edit it with your configuration.
)

REM Parse command
if "%1%"=="" (
    set COMMAND=up
) else (
    set COMMAND=%1%
)

if "%COMMAND%"=="build" (
    echo 🔨 Building Docker images...
    docker-compose build --no-cache
    echo ✅ Build completed!
    goto end
)

if "%COMMAND%"=="up" (
    echo 🚀 Starting containers...
    docker-compose up -d
    echo ✅ Containers started!
    echo.
    echo Services running:
    echo   📱 Frontend:  http://localhost:3000
    echo   🔙 Backend:   http://localhost:5000
    echo   🌐 Nginx:     http://localhost
    echo   🗄️  MongoDB:   localhost:27017
    echo.
    docker-compose ps
    goto end
)

if "%COMMAND%"=="down" (
    echo ⛔ Stopping containers...
    docker-compose down
    echo ✅ Containers stopped!
    goto end
)

if "%COMMAND%"=="logs" (
    echo 📋 Container logs:
    docker-compose logs -f
    goto end
)

if "%COMMAND%"=="restart" (
    echo 🔄 Restarting containers...
    docker-compose restart
    echo ✅ Containers restarted!
    goto end
)

if "%COMMAND%"=="clean" (
    echo 🧹 Cleaning up containers and volumes...
    docker-compose down -v
    echo ✅ Cleanup completed!
    goto end
)

if "%COMMAND%"=="full-clean" (
    echo ⚠️  This will remove everything including .env!
    set /p confirm=Are you sure? (y/n): 
    if /i "!confirm!"=="y" (
        docker-compose down -v
        del .env
        echo ✅ Full cleanup completed!
    ) else (
        echo Cancelled.
    )
    goto end
)

if "%COMMAND%"=="help" (
    echo Usage: docker-setup.bat [command]
    echo.
    echo Commands:
    echo   build       - Build Docker images
    echo   up          - Start containers (docker-compose up -d)
    echo   down        - Stop containers (docker-compose down)
    echo   logs        - View container logs
    echo   restart     - Restart containers
    echo   clean       - Remove containers, volumes, and images
    echo   full-clean  - Remove everything including .env
    echo   help        - Show this help message
    goto end
)

echo Unknown command: %COMMAND%
echo Use "docker-setup.bat help" for usage information.

:end
endlocal
