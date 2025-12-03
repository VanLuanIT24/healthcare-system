# 🚂 Railway Deployment - Quick Reference Card

**Print this page or bookmark it for easy reference during deployment**

---

## 🎯 Three Paths to Deployment

### Path 1️⃣: I'm Experienced (5 min)
```
1. Go to railway.app
2. Create project → GitHub repo
3. Create MongoDB service
4. Create Backend service:
   - Root: healthcare-backend
   - Build: npm install
   - Start: npm start
5. Create Frontend service:
   - Root: healthcare-frontend
   - Build: npm install && npm run build
   - Start: npm run preview
6. Add environment variables (see below)
7. Get URLs and test
```

### Path 2️⃣: I Want to Verify (20 min)
→ Read `DEPLOYMENT_CHECKLIST.md`

### Path 3️⃣: I Want to Understand (30 min)
→ Read `RAILWAY_DEPLOYMENT.md`

---

## 🔑 Environment Variables Cheat Sheet

### Backend Variables (Copy to Railway)

```
NODE_ENV = production
PORT = 5000

MONGO_URI = ${{ MONGODB_URL }}

JWT_ACCESS_SECRET = [GENERATE NEW - 32 chars]
JWT_REFRESH_SECRET = [GENERATE NEW - 32 chars]

ACCESS_TOKEN_EXPIRES_IN = 15m
REFRESH_TOKEN_EXPIRES_IN = 7d

SALT_ROUNDS = 12

CORS_ORIGIN = https://your-frontend.railway.app

SUPER_ADMIN_EMAIL = admin@healthcare.com
SUPER_ADMIN_PASSWORD = @Admin123 [CHANGE AFTER LOGIN!]

LOG_LEVEL = info
```

**Generate Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Variables (Copy to Railway)

```
VITE_API_URL = https://your-backend.railway.app/api
```

---

## 📋 Deployment Steps

### Step 1: Create Project
```
railway.app → Dashboard → Create Project
→ Deploy from GitHub → Select healthcare-system → Deploy
```

### Step 2: Add MongoDB
```
Create Service → Database → MongoDB → Deploy
(Wait 2-3 minutes for green checkmark)
```

### Step 3: Deploy Backend
```
Create Service → GitHub Repo → healthcare-system
→ Add Service

Settings:
- Root Directory: healthcare-backend
- Build Command: npm install
- Start Command: npm start

Variables: (copy from above)
- NODE_ENV, PORT, MONGO_URI, JWT_*, etc.
```

### Step 4: Deploy Frontend
```
Create Service → GitHub Repo → healthcare-system
→ Add Service

Settings:
- Root Directory: healthcare-frontend
- Build Command: npm install && npm run build
- Start Command: npm run preview

Variables:
- VITE_API_URL = https://[BACKEND_URL].railway.app/api
```

### Step 5: Update Backend CORS
```
Backend Service → Variables
→ Update CORS_ORIGIN = https://[FRONTEND_URL].railway.app
→ Deploy
```

---

## ✅ Testing Checklist

```
[ ] Frontend loads without errors
[ ] Can see login page
[ ] Can log in with admin@healthcare.com / @Admin123
[ ] Can see dashboard
[ ] Can click "Đặt Lịch Hẹn"
[ ] Can select doctor
[ ] Can select date and time
[ ] Can submit appointment
[ ] Appointment appears in list
[ ] No errors in logs
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **Frontend blank** | Check VITE_API_URL in variables |
| **Login fails** | Check backend logs, verify MONGO_URI |
| **CORS error** | Update CORS_ORIGIN to exact frontend URL |
| **Appointment fails** | Check backend logs for errors |
| **Build fails** | Verify Root Directory path and build command |
| **Can't access backend** | Check health endpoint: https://url/health |

**Detailed troubleshooting:** See `RAILWAY_TROUBLESHOOTING.md`

---

## 🎯 URLs After Deployment

```
Frontend: https://[unique-id].railway.app
Backend: https://[unique-id].railway.app
Login: admin@healthcare.com / @Admin123
```

---

## 📞 Documentation Files

| Situation | File | Time |
|-----------|------|------|
| **Quick deploy** | RAILWAY_QUICK_START.md | 5 min |
| **Verify all steps** | DEPLOYMENT_CHECKLIST.md | 20 min |
| **Something broken** | RAILWAY_TROUBLESHOOTING.md | As needed |
| **Learn everything** | RAILWAY_DEPLOYMENT.md | 30 min |
| **Navigate docs** | RAILWAY_DEPLOYMENT_INDEX.md | 5 min |

---

## 🔐 Security Reminders

✅ Generate new JWT secrets (use command above)  
✅ Change SUPER_ADMIN_PASSWORD after first login  
✅ Update CORS_ORIGIN with exact frontend URL  
✅ Don't commit .env files with secrets  
✅ Use HTTPS (Railway provides automatically)

---

## 📊 Performance Tips

- Frontend loads: <3 seconds
- API response: <500ms
- Database query: <100ms
- Free plan works for testing
- Scale up if needed

---

## 🎊 Done!

After testing passes:
1. Share frontend URL with team
2. Change admin password
3. Monitor logs for 24 hours
4. Plan next steps

---

**Last Updated:** December 3, 2025  
**Questions?** See detailed documentation files above
