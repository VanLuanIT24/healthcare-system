# 🏥 Healthcare System - Docker Production Guide

## Quick Start

### Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- Git
- 4GB RAM minimum, 2GB disk space

### Installation

**Windows (PowerShell):**

```powershell
# 1. Build images
.\docker-manage.ps1 build

# 2. Start services
.\docker-manage.ps1 up

# 3. Check status
.\docker-manage.ps1 status
```

**Linux/Mac (Bash):**

```bash
# 1. Build images
bash docker-setup.sh build

# 2. Start services
bash docker-setup.sh up

# 3. Check status
bash docker-setup.sh status
```

## Access Points

| Service     | URL                                      | Port  |
| ----------- | ---------------------------------------- | ----- |
| Frontend    | http://localhost:3000                    | 3000  |
| Backend API | http://localhost:5000                    | 5000  |
| MongoDB     | mongodb://mongo:password@localhost:27017 | 27017 |
| Nginx Proxy | http://localhost:80                      | 80    |

## Default Credentials

```
Super Admin Email: admin@healthcare.com
Super Admin Password: @Admin123
```

⚠️ **IMPORTANT:** Change these credentials immediately after first login!

## Configuration

### Environment Variables

Copy `.env.example` to `.env.docker` and configure:

```env
# MongoDB
MONGO_USER=mongo
MONGO_PASSWORD=your_secure_password

# JWT Secrets (generate new ones!)
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Super Admin
SUPER_ADMIN_EMAIL=admin@healthcare.com
SUPER_ADMIN_PASSWORD=@Admin123
```

**Generate secure JWT secrets:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### File Structure

```
healthcare-system/
├── docker-compose.yml          # Service orchestration
├── .env.docker                 # Environment configuration
├── .env.example                # Example configuration
├── docker-manage.ps1           # Windows management script
├── docker-setup.sh             # Linux/Mac management script
├── nginx.conf                  # Reverse proxy config
├── DOCKER_PRODUCTION.md        # This file
├── healthcare-backend/
│   ├── Dockerfile              # Backend image
│   ├── package.json            # Dependencies
│   └── src/                    # Source code
└── healthcare-frontend/
    ├── Dockerfile              # Frontend image
    ├── package.json            # Dependencies
    └── src/                    # React source code
```

## Management Commands

### Windows (PowerShell)

```powershell
# View help
.\docker-manage.ps1 help

# Build images
.\docker-manage.ps1 build

# Start all services
.\docker-manage.ps1 up

# Check status
.\docker-manage.ps1 status

# View logs
.\docker-manage.ps1 logs              # All services
.\docker-manage.ps1 logs backend      # Backend only
.\docker-manage.ps1 logs frontend     # Frontend only

# Access container shell
.\docker-manage.ps1 shell backend

# Restart services
.\docker-manage.ps1 restart           # All services
.\docker-manage.ps1 restart backend   # Backend only

# Stop all services
.\docker-manage.ps1 down

# Clean up stopped containers
.\docker-manage.ps1 clean

# Full cleanup (removes everything)
.\docker-manage.ps1 fullclean

# Run tests
.\docker-manage.ps1 test
```

### Linux/Mac (Bash)

```bash
# View help
bash docker-setup.sh help

# Build images
bash docker-setup.sh build

# Start all services
bash docker-setup.sh up

# Check status
bash docker-setup.sh status

# View logs
bash docker-setup.sh logs
bash docker-setup.sh logs backend

# Access container shell
bash docker-setup.sh shell backend

# And so on...
```

## Typical Workflow

### First Time Setup

```powershell
# 1. Set execution policy (Windows only)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 2. Build all images
.\docker-manage.ps1 build

# 3. Start all services
.\docker-manage.ps1 up

# 4. Wait for MongoDB to initialize (~10 seconds)
Start-Sleep -Seconds 10

# 5. Check status
.\docker-manage.ps1 status

# 6. View logs to verify startup
.\docker-manage.ps1 logs

# 7. Test the system
.\docker-manage.ps1 test
```

### Daily Usage

```powershell
# Start
.\docker-manage.ps1 up

# Check status
.\docker-manage.ps1 status

# Work...

# Stop
.\docker-manage.ps1 down
```

### Debugging

```powershell
# Check if containers are running
.\docker-manage.ps1 status

# View all logs
.\docker-manage.ps1 logs

# View specific service logs
.\docker-manage.ps1 logs backend

# Access container shell
.\docker-manage.ps1 shell backend

# Check container resource usage
docker stats

# Inspect container
docker inspect healthcare_backend
```

## Production Deployment

### Pre-Deployment Checklist

- [x] Update `.env.docker` with production values
- [x] Change all default passwords
- [x] Generate new JWT secrets
- [x] Update MongoDB credentials
- [x] Set up SSL/TLS certificates
- [x] Configure firewall rules
- [x] Set up monitoring and logging
- [x] Test backup and restore procedures
- [x] Verify audit logging is enabled
- [x] Configure email notifications

### SSL/HTTPS Setup

1. **Obtain SSL Certificate:**

   ```bash
   # Using Let's Encrypt with Certbot
   certbot certonly --standalone -d yourdomain.com
   ```

2. **Update nginx.conf:**

   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

       # ... rest of config
   }
   ```

3. **Restart nginx:**
   ```powershell
   .\docker-manage.ps1 restart nginx
   ```

### Scaling

**Run multiple backend instances:**

```yaml
backend:
  # ... config
  deploy:
    replicas: 3
```

Then use docker stack deploy for swarm mode.

## Troubleshooting

### Docker not running

**Error:** `Cannot connect to Docker daemon`

**Solution:**

- Windows: Start Docker Desktop
- Linux: `sudo systemctl start docker`
- Mac: Open Docker Desktop from Applications

### MongoDB won't start

**Error:** `MongooseServerSelectionError`

**Solution:**

```powershell
# Check MongoDB logs
.\docker-manage.ps1 logs mongodb

# Restart MongoDB
.\docker-manage.ps1 restart mongodb

# Or full restart
.\docker-manage.ps1 down
.\docker-manage.ps1 up
```

### Frontend can't connect to backend

**Error:** `ERR_CONNECTION_REFUSED` or `CORS error`

**Solution:**

1. Check backend is running: `.\docker-manage.ps1 status`
2. Check CORS configuration in `.env.docker`
3. Verify VITE_API_URL is correct
4. Check network: `docker network ls`

### Port already in use

**Error:** `Port 5000 is already allocated`

**Solution:**

```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Out of disk space

**Solution:**

```powershell
# Clean up unused images
docker image prune -a

# Clean up volumes
docker volume prune

# Full cleanup
.\docker-manage.ps1 fullclean
```

### Container crashes on startup

**Error:** Container exits immediately

**Solution:**

```powershell
# Check logs
.\docker-manage.ps1 logs backend

# Check if dependencies are installed
.\docker-manage.ps1 shell backend
npm list

# Rebuild from scratch
.\docker-manage.ps1 fullclean
.\docker-manage.ps1 build
```

## Performance Optimization

### Memory Limit

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    # ...
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### CPU Limit

```yaml
deploy:
  resources:
    limits:
      cpus: "1.0"
    reservations:
      cpus: "0.5"
```

### Volume Performance (Docker Desktop)

For Mac/Windows with volumes:

```yaml
volumes:
  - ./healthcare-backend:/app:delegated # Improve performance
```

## Backup & Recovery

### Backup MongoDB

```bash
docker-compose exec -T mongodb mongodump --out /backup
```

### Restore MongoDB

```bash
docker-compose exec -T mongodb mongorestore /backup
```

### Backup Complete System

```bash
# Backup volumes
docker run --rm -v healthcare-system_mongodb_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/mongodb_data.tar.gz -C /data .

# Backup configuration
cp .env.docker ./backups/.env.docker.backup
```

## Monitoring

### Health Checks

Health check endpoints are configured in docker-compose.yml:

```bash
# Check backend health
curl http://localhost:5000/health

# Check frontend health
curl http://localhost:3000
```

### Logs & Auditing

```bash
# View real-time logs
docker-compose logs -f

# View logs from last hour
docker-compose logs --since 1h

# Save logs to file
docker-compose logs > logs.txt
```

## Security Best Practices

✅ **DO:**

- [x] Change default passwords immediately
- [x] Use strong, unique JWT secrets
- [x] Enable HTTPS/SSL in production
- [x] Keep Docker images updated
- [x] Use environment variables for secrets
- [x] Enable audit logging
- [x] Regular backups
- [x] Monitor access logs
- [x] Use firewall rules
- [x] Limit network exposure

❌ **DON'T:**

- [x] Don't expose MongoDB directly to internet
- [x] Don't store secrets in code
- [x] Don't use default credentials
- [x] Don't run as root in containers
- [x] Don't disable security middleware
- [x] Don't expose debug logs in production
- [x] Don't skip SSL/TLS
- [x] Don't ignore container updates

## Support & Documentation

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## FAQ

**Q: How do I update the application?**

```powershell
git pull origin main
.\docker-manage.ps1 build
.\docker-manage.ps1 restart
```

**Q: How do I add a new npm package?**

```powershell
# Edit package.json, then:
.\docker-manage.ps1 build --no-cache
```

**Q: Can I use external MongoDB?**
Yes, update `MONGO_URI` in `.env.docker` to point to your MongoDB instance.

**Q: How do I enable debug logging?**
Update `LOG_LEVEL=debug` in `.env.docker` and restart:

```powershell
.\docker-manage.ps1 restart backend
```

**Q: Is there a way to view the database?**
Yes, use MongoDB Compass:

```
mongodb://mongo:password@localhost:27017
```

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Maintainer:** Healthcare System Team
