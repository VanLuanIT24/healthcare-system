# 🚂 Railway Deployment Checklist

**Status:** Pre-Deployment Preparation  
**Date:** December 3, 2025

---

## ✅ Pre-Deployment Phase (Do This First!)

### 1. Repository Preparation

- [ ] Code is committed and pushed to GitHub
- [ ] No uncommitted changes in working directory
- [ ] Branch is clean and ready to deploy

**Action:**

```powershell
cd d:\training-code\healthcare-system
git status  # Should show clean working directory
git log --oneline -5  # Check recent commits
```

### 2. Secrets & Credentials

- [ ] Generated new JWT_ACCESS_SECRET
- [ ] Generated new JWT_REFRESH_SECRET
- [ ] Changed SUPER_ADMIN_PASSWORD from default
- [ ] Prepared SMTP credentials (if needed)

**Action:**

```powershell
# Generate secure secrets
node -e "console.log('JWT_ACCESS:', require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH:', require('crypto').randomBytes(32).toString('hex'))"
```

**Keep these values safe! You'll need them in Railway Dashboard.**

### 3. Verify package.json Scripts

Backend:

```bash
cd healthcare-backend
npm run start  # Should work without errors
```

Frontend:

```bash
cd healthcare-frontend
npm run build  # Should complete successfully
npm run preview  # Should start server
```

---

## 🚀 Deployment Phase (In Railway Dashboard)

### Step 1: Create Railway Project

- [ ] Logged into https://railway.app
- [ ] Created new project
- [ ] Connected GitHub repository

**Expected Time:** 2 minutes

---

### Step 2: Deploy MongoDB

- [ ] Created MongoDB service in Railway
- [ ] Database is running (green status)
- [ ] Connection URL obtained

**Expected Time:** 2 minutes

**Action in Railway:**

```
1. Dashboard → Create Service
2. Select Database → MongoDB
3. Wait for deployment (green checkmark appears)
```

---

### Step 3: Deploy Backend

- [ ] Created backend service
- [ ] Set Root Directory: `healthcare-backend`
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Environment variables added (see list below)
- [ ] Deployment successful (green status)
- [ ] Backend URL obtained

**Expected Time:** 3 minutes

**Environment Variables for Backend:**

```
✓ NODE_ENV = production
✓ PORT = 5000
✓ MONGO_URI = (from MongoDB service)
✓ JWT_ACCESS_SECRET = (your generated secret)
✓ JWT_REFRESH_SECRET = (your generated secret)
✓ ACCESS_TOKEN_EXPIRES_IN = 15m
✓ REFRESH_TOKEN_EXPIRES_IN = 7d
✓ SALT_ROUNDS = 12
✓ CORS_ORIGIN = https://your-frontend-url.railway.app
✓ SUPER_ADMIN_EMAIL = admin@healthcare.com
✓ SUPER_ADMIN_PASSWORD = (your new password)
✓ LOG_LEVEL = info
```

---

### Step 4: Deploy Frontend

- [ ] Created frontend service
- [ ] Set Root Directory: `healthcare-frontend`
- [ ] Set Build Command: `npm install && npm run build`
- [ ] Set Start Command: `npm run preview`
- [ ] Environment variables added:
  - `VITE_API_URL = https://your-backend-url.railway.app/api`
- [ ] Deployment successful (green status)
- [ ] Frontend URL obtained

**Expected Time:** 3 minutes

---

### Step 5: Update Backend CORS

- [ ] Updated Backend CORS_ORIGIN with frontend URL

**Action in Railway:**

```
1. Go to Backend Service
2. Variables tab
3. Update CORS_ORIGIN = https://your-frontend-url.railway.app
4. Redeploy (click deploy button)
```

---

## 🧪 Testing Phase

### Test 1: Backend Health Check

- [ ] Backend responds to health check
- [ ] Database connection successful
- [ ] No error logs

**Action:**

```bash
# Replace with your actual backend URL
curl https://your-backend-url.railway.app/health

# Expected response: { "status": "ok" }
```

---

### Test 2: Frontend Load

- [ ] Frontend loads without errors
- [ ] Login page displays
- [ ] No 404 or CORS errors in console

**Action:**

```
1. Open https://your-frontend-url.railway.app in browser
2. Open DevTools (F12)
3. Check Console tab for errors
4. Should see login form
```

---

### Test 3: Login Functionality

- [ ] Login page loads
- [ ] Can enter credentials
- [ ] Submit works (calls API)
- [ ] Success/error messages display

**Action:**

```
1. Email: admin@healthcare.com
2. Password: (your new password)
3. Click Login
4. Should redirect to dashboard
```

---

### Test 4: Appointment Booking

- [ ] Dashboard loads
- [ ] Can click "Đặt Lịch Hẹn"
- [ ] Modal opens with doctor list
- [ ] Can select doctor, date, time
- [ ] Can submit form
- [ ] Appointment created successfully

**Action:**

```
1. Navigate to Lịch hẹn (Appointments) tab
2. Click "Đặt Lịch Hẹn"
3. Select doctor
4. Select date (tomorrow or later)
5. Select time slot
6. Fill in reason and notes
7. Click Submit
8. Should show success message
```

---

### Test 5: Data Persistence

- [ ] Created appointments appear in list
- [ ] Data persists after page refresh
- [ ] Dashboard data loads correctly

**Action:**

```
1. After booking appointment
2. Refresh page (F5)
3. Appointment should still be visible
4. No database errors in logs
```

---

## 📊 Monitoring Phase

### Monitor Logs

- [ ] Check Backend logs for errors
- [ ] Check Frontend logs for warnings
- [ ] No database connection errors
- [ ] No JWT token errors

**Action in Railway:**

```
1. Go to Backend Service → Logs tab
2. Go to Frontend Service → Logs tab
3. Monitor for first 5 minutes
4. Look for ERROR, WARN levels
```

---

### Monitor Metrics

- [ ] Backend CPU usage normal (< 50%)
- [ ] Memory usage stable (< 256MB)
- [ ] Response times acceptable (< 500ms)
- [ ] No failed deployments

**Action in Railway:**

```
1. Go to Service → Metrics tab
2. Review CPU, Memory, Network graphs
3. Deployments should show all green
```

---

## 🔐 Security Phase

### Security Checklist

- [ ] Admin password changed from default
- [ ] JWT secrets are cryptographically strong
- [ ] CORS_ORIGIN is set to exact frontend URL
- [ ] Environment variables are not exposed
- [ ] HTTPS enabled (Railway does this by default)
- [ ] Database backups enabled

**Action:**

```
1. Change admin password immediately after first login
2. Set up email notifications for alerts
3. Monitor access logs for suspicious activity
4. Consider setting rate limits
```

---

## 📝 Post-Deployment

### Documentation

- [ ] Documented backend URL
- [ ] Documented frontend URL
- [ ] Documented admin credentials (stored safely!)
- [ ] Created deployment runbook

**Action:**

```
Keep this information safe:
- Backend URL: https://...
- Frontend URL: https://...
- Admin Email: admin@healthcare.com
- Admin Password: (stored in password manager)
- MongoDB Connection: (Railway provides)
```

---

### Team Communication

- [ ] Notified team of deployment
- [ ] Shared frontend URL
- [ ] Provided login credentials
- [ ] Shared access guidelines

**Message Template:**

```
🎉 Healthcare System is now live on Railway!

Frontend: https://your-frontend-url.railway.app
Admin Email: admin@healthcare.com
Password: (shared separately)

Please test the following:
1. Can you log in?
2. Can you book an appointment?
3. Can you see dashboard data?

Report any issues in #healthcare-deployment
```

---

## 🚨 Rollback Plan (If Issues Occur)

- [ ] Have previous commit hash saved
- [ ] Know how to redeploy previous version
- [ ] Have database backup accessible
- [ ] Have communication plan for outage

**Rollback Action:**

```
1. Railway Dashboard → Deployments tab
2. Find previous successful deployment
3. Click "Redeploy" on that version
4. Wait for deployment to complete
5. Verify system is working
```

---

## ✨ Final Checklist Items

- [ ] All tests passed
- [ ] Logs show no errors
- [ ] Performance metrics are good
- [ ] Admin password changed
- [ ] Team notified
- [ ] Documentation complete
- [ ] Monitoring set up
- [ ] Backup strategy planned

---

## 📞 Quick Support

| Issue                         | Action                                    |
| ----------------------------- | ----------------------------------------- |
| **Frontend won't load**       | Check VITE_API_URL in frontend variables  |
| **Login fails**               | Check backend logs, verify MONGO_URI      |
| **CORS errors**               | Update CORS_ORIGIN in backend variables   |
| **Appointment booking fails** | Check database connection, verify MongoDB |
| **Deployment failed**         | Check Root Directory and build commands   |

---

## 🎯 Success Criteria

✅ **Deployment is successful when:**

1. Frontend loads without errors
2. Can log in with admin credentials
3. Can book an appointment
4. Appointments appear in dashboard
5. Data persists after page refresh
6. No error logs in Railway dashboard
7. Performance metrics are normal

---

**Estimated Total Time:** 15-20 minutes  
**Last Updated:** December 3, 2025
