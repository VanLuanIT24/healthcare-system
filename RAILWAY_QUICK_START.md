# 🚂 Railway Quick Start - 5 Minute Setup

## Before You Start

Make sure you have:

- [ ] GitHub account with your healthcare-system repository
- [ ] Railroad account (sign up at railway.app)
- [ ] This checklist open

---

## Step 1: Login to Railway (1 min)

```
1. Go to https://railway.app
2. Click "Login"
3. Sign in with GitHub
4. Authorize Railway to access your repos
```

---

## Step 2: Create Project & Add Services (3 min)

```
1. Click "Dashboard"
2. Click "Create New Project"
3. Select "Deploy from GitHub"
4. Search for "healthcare-system"
5. Select your fork
6. Click "Deploy"
```

**Now Railway will auto-detect your project structure**

---

## Step 3: Add MongoDB (1 min)

```
In Railway Dashboard:
1. Click "Create Service"
2. Select "Database"
3. Choose "MongoDB"
4. Click "Deploy"
5. Wait for green checkmark
```

---

## Step 4: Configure Backend (1 min)

### Create Backend Service

```
1. Click "Create Service"
2. Select "GitHub Repo"
3. Choose "healthcare-system" repo
4. Click "Add Service"
```

### Set Root Directory

```
1. Click new service → Settings
2. Root Directory: healthcare-backend
3. Build Command: npm install
4. Start Command: npm start
```

### Add Environment Variables

Click "Variables" tab and add:

```
NODE_ENV=production
PORT=5000
MONGO_URI=${{ MONGODB_URL }}
JWT_ACCESS_SECRET=your_super_secret_key_1234567890abcdef
JWT_REFRESH_SECRET=your_super_secret_key_0987654321fedcba
CORS_ORIGIN=https://FRONTEND_URL.railway.app
SUPER_ADMIN_EMAIL=admin@healthcare.com
SUPER_ADMIN_PASSWORD=@Admin123
LOG_LEVEL=info
```

**Replace with:**

- `JWT_ACCESS_SECRET` - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `JWT_REFRESH_SECRET` - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `FRONTEND_URL` - You'll get this after frontend deploy

---

## Step 5: Configure Frontend (1 min)

### Create Frontend Service

```
1. Click "Create Service"
2. Select "GitHub Repo"
3. Choose "healthcare-system" repo again
4. Click "Add Service"
```

### Set Root Directory

```
1. Click new service → Settings
2. Root Directory: healthcare-frontend
3. Build Command: npm install && npm run build
4. Start Command: npm run preview
```

### Add Environment Variables

Click "Variables" tab and add:

```
VITE_API_URL=https://BACKEND_URL.railway.app/api
```

**Replace `BACKEND_URL` with your actual backend deployment URL from the Backend service**

---

## Step 6: Get Your URLs

```
1. Backend Service → Deployments
2. Copy URL: https://healthcare-backend-xxx.railway.app

3. Frontend Service → Deployments
4. Copy URL: https://healthcare-frontend-xxx.railway.app
```

---

## Step 7: Update CORS in Backend

```
1. Backend Service → Variables
2. Update CORS_ORIGIN:
   https://healthcare-frontend-xxx.railway.app
3. Click "Deploy" to redeploy
```

---

## Step 8: Test Deployment

### Test 1: Open Frontend

```
1. Paste your frontend URL in browser
2. Should see login page
3. No error messages
```

### Test 2: Login

```
Email: admin@healthcare.com
Password: @Admin123 (or what you set)

Should see dashboard
```

### Test 3: Book Appointment

```
1. Go to Lịch hẹn (Appointments) tab
2. Click "Đặt Lịch Hẹn"
3. Select doctor
4. Select date and time
5. Click Submit
```

---

## 🎉 You're Done!

Your healthcare system is now deployed on Railway!

### What's Next?

1. **Change Admin Password**

   - Log in to dashboard
   - Go to Settings
   - Change password

2. **Setup Custom Domain** (Optional)

   - Frontend Service → Settings → Domains
   - Add your domain
   - Update DNS records

3. **Monitor Performance**

   - Check Logs tab regularly
   - Monitor Metrics for CPU/Memory
   - Watch for errors

4. **Share with Team**
   - Frontend URL: `https://your-frontend.railway.app`
   - Login: `admin@healthcare.com / password`

---

## 🆘 Quick Help

| Issue          | Solution                               |
| -------------- | -------------------------------------- |
| Frontend blank | Check VITE_API_URL matches backend     |
| Login fails    | Check backend logs, verify MONGO_URI   |
| CORS error     | Update CORS_ORIGIN to frontend URL     |
| Build fails    | Check Root Directory and build command |

See `RAILWAY_TROUBLESHOOTING.md` for detailed help

---

**Time Invested:** 10 minutes  
**System Status:** ✅ Live and Running  
**Next Step:** Celebrate! 🎊
