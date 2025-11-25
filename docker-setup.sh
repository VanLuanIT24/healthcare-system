#!/bin/bash

# Healthcare System - Docker Build & Run Script
# =============================================

set -e

echo "🏥 Healthcare System - Docker Setup"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created. Please edit it with your configuration.${NC}"
fi

# Function to display help
show_help() {
    echo -e "${BLUE}Usage: ./docker-setup.sh [command]${NC}"
    echo ""
    echo "Commands:"
    echo "  build       - Build Docker images"
    echo "  up          - Start containers (docker-compose up -d)"
    echo "  down        - Stop containers (docker-compose down)"
    echo "  logs        - View container logs"
    echo "  restart     - Restart containers"
    echo "  clean       - Remove containers, volumes, and images"
    echo "  full-clean  - Remove everything including .env"
    echo ""
    exit 0
}

# Parse command
case "${1:-up}" in
    build)
        echo -e "${BLUE}🔨 Building Docker images...${NC}"
        docker-compose build --no-cache
        echo -e "${GREEN}✅ Build completed!${NC}"
        ;;
    up)
        echo -e "${BLUE}🚀 Starting containers...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✅ Containers started!${NC}"
        echo ""
        echo "Services running:"
        echo "  📱 Frontend:  http://localhost:3000"
        echo "  🔙 Backend:   http://localhost:5000"
        echo "  🌐 Nginx:     http://localhost"
        echo "  🗄️  MongoDB:   localhost:27017"
        echo ""
        docker-compose ps
        ;;
    down)
        echo -e "${BLUE}⛔ Stopping containers...${NC}"
        docker-compose down
        echo -e "${GREEN}✅ Containers stopped!${NC}"
        ;;
    logs)
        echo -e "${BLUE}📋 Container logs:${NC}"
        docker-compose logs -f
        ;;
    restart)
        echo -e "${BLUE}🔄 Restarting containers...${NC}"
        docker-compose restart
        echo -e "${GREEN}✅ Containers restarted!${NC}"
        ;;
    clean)
        echo -e "${YELLOW}🧹 Cleaning up containers and volumes...${NC}"
        docker-compose down -v
        echo -e "${GREEN}✅ Cleanup completed!${NC}"
        ;;
    full-clean)
        echo -e "${YELLOW}⚠️  This will remove everything including .env!${NC}"
        read -p "Are you sure? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            rm -f .env
            echo -e "${GREEN}✅ Full cleanup completed!${NC}"
        else
            echo "Cancelled."
        fi
        ;;
    help)
        show_help
        ;;
    *)
        echo -e "${YELLOW}Unknown command: $1${NC}"
        show_help
        ;;
esac

exit 0
