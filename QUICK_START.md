# 🚀 Quick Start Guide - Healthcare System

## What's Been Done ✅

```
✅ Fixed patient dashboard logout crash (antd v5 Menu issue)
✅ Improved authentication and state management
✅ Pushed code to GitHub (feature-phai branch)
✅ Created complete Docker setup (images, compose, scripts)
✅ Generated production deployment guide
✅ Set up environment configuration templates
✅ Created management scripts for Windows/Linux/Mac
```

## What You Need To Do Now 🎯

### Step 1: Review the Code (5 minutes)

```bash
# See what changed
git log --oneline -3

# Switch to feature branch to review
git checkout feature-phai

# Check the latest changes
git diff main..feature-phai --stat
```

### Step 2: Understand Docker Setup (10 minutes)

Read these files in order:

1. `DOCKER_PRODUCTION.md` - Complete deployment guide
2. `docker-compose.yml` - Service configuration
3. `.env.docker` - Environment variables

### Step 3: Try Docker Locally (30 minutes)

**Windows (PowerShell):**

```powershell
# 1. Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 2. Build images (first time only, ~3-5 minutes)
.\docker-manage.ps1 build

# 3. Start services
.\docker-manage.ps1 up

# 4. Wait ~30 seconds for MongoDB to initialize

# 5. Check status
.\docker-manage.ps1 status

# 6. View logs (verify no errors)
.\docker-manage.ps1 logs

# 7. Test the system
.\docker-manage.ps1 test
```

**Linux/Mac:**

```bash
# Build images
bash docker-setup.sh build

# Start services
bash docker-setup.sh up

# Check status
bash docker-setup.sh status
```

### Step 4: Test the Application (15 minutes)

**Frontend:**

- Open http://localhost:3000
- Should see login page

**Admin Login:**

- Email: `admin@healthcare.com`
- Password: `@Admin123`
- Should see admin dashboard

**Backend API:**

- Visit http://localhost:5000/api/health
- Should see {"status": "OK"}

### Step 5: Stop Services (2 minutes)

```powershell
# Stop all containers
.\docker-manage.ps1 down

# Or remove everything (clean slate)
.\docker-manage.ps1 fullclean
```

---

## 📁 Key Files to Review

| File                   | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `DOCKER_PRODUCTION.md` | Complete production deployment guide           |
| `DOCKER.md`            | Docker troubleshooting guide                   |
| `docker-compose.yml`   | All 5 services configuration                   |
| `.env.docker`          | Environment variables (change for production!) |
| `docker-manage.ps1`    | Windows management script                      |
| `docker-setup.sh`      | Linux/Mac management script                    |
| `PROJECT_SUMMARY.md`   | Complete project summary                       |

---

## 🎯 Common Commands

### Windows PowerShell

```powershell
# Help
.\docker-manage.ps1 help

# Build
.\docker-manage.ps1 build

# Start
.\docker-manage.ps1 up

# Status
.\docker-manage.ps1 status

# Logs
.\docker-manage.ps1 logs
.\docker-manage.ps1 logs backend
.\docker-manage.ps1 logs frontend

# Stop
.\docker-manage.ps1 down

# Restart a service
.\docker-manage.ps1 restart backend

# Access container shell
.\docker-manage.ps1 shell backend

# Run tests
.\docker-manage.ps1 test

# Full cleanup
.\docker-manage.ps1 fullclean
```

### Linux/Mac

```bash
bash docker-setup.sh build
bash docker-setup.sh up
bash docker-setup.sh status
bash docker-setup.sh logs
bash docker-setup.sh down
```

---

## 🔧 Troubleshooting

### Docker not running?

```powershell
# Windows: Start Docker Desktop from Start Menu or:
Start-Process "C:\Program Files\Docker\Docker\Docker.exe"
```

### Port already in use?

```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

### Container won't start?

```powershell
# Check logs
.\docker-manage.ps1 logs backend

# Rebuild
.\docker-manage.ps1 fullclean
.\docker-manage.ps1 build
.\docker-manage.ps1 up
```

### MongoDB connection error?

```powershell
# Restart MongoDB
.\docker-manage.ps1 restart mongodb

# Check MongoDB logs
.\docker-manage.ps1 logs mongodb
```

---

## 📊 What's Running?

When you run `.\docker-manage.ps1 up`, you get:

| Service  | Port  | Purpose           |
| -------- | ----- | ----------------- |
| Frontend | 3000  | React application |
| Backend  | 5000  | Node.js API       |
| MongoDB  | 27017 | Database          |
| Nginx    | 80    | Reverse proxy     |

---

## 🔐 Important: Change Passwords!

Before production:

1. Change `SUPER_ADMIN_PASSWORD` in `.env.docker`
2. Generate new JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
4. Change `MONGO_PASSWORD`

---

## ✨ Next Steps

### For Development

- Use `npm start` in each folder for local development
- Use `docker-manage.ps1` only for testing containerized version

### For Production

1. ✅ Review code on `feature-phai` branch
2. ✅ Test locally with Docker
3. ⏳ Merge `feature-phai` → `main`
4. ⏳ Deploy to production server
5. ⏳ Configure SSL/HTTPS
6. ⏳ Set up monitoring and backups

---

## 📞 Questions?

See `DOCKER_PRODUCTION.md` for:

- FAQ section
- Troubleshooting guide
- Production deployment checklist
- Security best practices
- Performance optimization

---

## 🎉 You're All Set!

Everything is configured and ready. Just:

1. Start Docker Desktop
2. Run `.\docker-manage.ps1 up`
3. Visit http://localhost:3000
4. Login with admin@healthcare.com / @Admin123

Enjoy! 🏥

---

**Git Branch:** `feature-phai`  
**Status:** Ready for production deployment  
**Latest Update:** December 2024
