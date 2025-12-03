# 🔧 Railway Deployment Troubleshooting Guide

**Last Updated:** December 3, 2025

---

## 🚨 Common Issues & Solutions

### 1. ❌ Frontend Won't Load (Blank Page / 404)

**Symptoms:**
- Frontend URL shows blank page
- Browser console shows 404 errors
- CSS and JS files not loading

**Solutions:**

#### A) Check Build Command
```
1. Railway Dashboard → Frontend Service → Settings
2. Verify Build Command: npm install && npm run build
3. Check build logs for errors
4. Redeploy if needed
```

#### B) Check Start Command
```
1. Railway Dashboard → Frontend Service → Settings
2. Verify Start Command: npm run preview
3. If using npm run dev, change to: npm run preview
```

#### C) Check VITE_API_URL
```
1. Go to Frontend Service → Variables
2. Check VITE_API_URL format:
   ✓ VITE_API_URL=https://backend-url.railway.app/api
   ✗ VITE_API_URL=https://backend-url.railway.app (missing /api)
3. Redeploy after change
```

---

### 2. ❌ Login Fails (401 / 403 Errors)

**Symptoms:**
- Can access login page
- Error message when trying to login
- Browser console shows 401/403 errors

**Solutions:**

#### A) Verify Backend is Running
```bash
# Test backend health
curl https://your-backend-url.railway.app/health

# Should return: { "status": "ok" }
```

#### B) Check MongoDB Connection
```
1. Railway Dashboard → Backend Service → Logs
2. Search for "Database" or "MongoDB"
3. Look for connection errors:
   - ✓ "Connected to MongoDB"
   - ✗ "Cannot connect to MongoDB"
   - ✗ "ENOTFOUND" (DNS error)
```

#### C) Verify JWT Secrets
```
1. Backend Service → Variables
2. Check JWT_ACCESS_SECRET is set
3. Check JWT_REFRESH_SECRET is set
4. If empty, add random 32-char strings:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
4. Redeploy backend
```

#### D) Check Admin Credentials
```
1. Backend Service → Variables
2. Verify SUPER_ADMIN_EMAIL = admin@healthcare.com
3. Verify SUPER_ADMIN_PASSWORD is set
4. Try default password: @Admin123
   (or whatever you set in variables)
```

---

### 3. ❌ CORS Errors (Cross-Origin Errors)

**Symptoms:**
- Browser console shows "Access-Control-Allow-Origin" error
- API requests are blocked
- Error: "No 'Access-Control-Allow-Origin' header"

**Solutions:**

#### A) Update CORS_ORIGIN
```
1. Backend Service → Variables
2. Find CORS_ORIGIN variable
3. Update to exact frontend URL:

   OLD: CORS_ORIGIN=http://localhost:3000
   NEW: CORS_ORIGIN=https://your-frontend.railway.app

4. Redeploy backend
```

#### B) Verify Frontend URL
```
1. Frontend Service → Deployments
2. Copy the exact URL from deployment
3. Paste into CORS_ORIGIN
4. Make sure there's no trailing slash

   ✓ https://healthcare-frontend-xyz.railway.app
   ✗ https://healthcare-frontend-xyz.railway.app/
```

#### C) Clear Browser Cache
```
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty cache and hard refresh"
4. Or use Ctrl+Shift+R
```

---

### 4. ❌ Database Connection Error

**Symptoms:**
- Backend logs show "Cannot connect to MongoDB"
- Appointments won't load
- Error: "ECONNREFUSED" or "ENOTFOUND"

**Solutions:**

#### A) Verify MongoDB is Deployed
```
1. Railway Dashboard → Check Services
2. Should see MongoDB service with green status
3. If red, click service and check logs
4. Restart service if needed
```

#### B) Check MONGO_URI
```
Backend Service → Variables → MONGO_URI

Should be one of:
1. ${{ MONGODB_URL }}  (if using Railway MongoDB)
2. mongodb+srv://user:pass@cluster.mongodb.net/healthcare
   (if using MongoDB Atlas)

NOT empty or undefined!
```

#### C) Verify Network Access
```
If using MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. Network Access → IP Whitelist
3. Add Railway IP: 0.0.0.0/0 (allows all IPs)
4. Wait 2-3 minutes for changes to apply
```

#### D) Test Connection
```bash
# In Railway backend logs, should see:
"✅ Connected to MongoDB"
"📊 Database: Connected"

If not, restart backend service or redeploy
```

---

### 5. ❌ Appointment Booking Fails

**Symptoms:**
- Can log in and see dashboard
- Click "Đặt Lịch Hẹn" (Book Appointment)
- Form submits but shows error
- Appointment not created

**Solutions:**

#### A) Check Backend Logs
```
1. Backend Service → Logs tab
2. Look for error messages
3. Check for validation errors
4. Search for "appointment" keyword
```

#### B) Verify Doctors Exist
```bash
# Test doctors endpoint
curl https://your-backend-url.railway.app/api/users/doctors \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return array with at least 1 doctor
```

#### C) Check Form Validation
```
Frontend validation checklist:
✓ Doctor selected
✓ Date selected (not in past)
✓ Time slot selected
✓ Appointment Type filled
✓ Reason filled (not empty)

If form shows validation error, fix before submitting
```

#### D) Check Database Permissions
```
1. Backend Service → Logs
2. Look for "write" or "insert" errors
3. Verify MongoDB has write permissions
4. Check MONGO_URI allows write access
```

---

### 6. ❌ Build Fails on Railway

**Symptoms:**
- Deployment shows "Build Failed" (red status)
- Error in build logs
- Can't see the deployed service

**Solutions:**

#### A) Check Build Command Logs
```
1. Service → Deployments tab
2. Click failed deployment
3. Expand logs to see full error
4. Common errors:
   - "npm ERR! missing script"
   - "ERR! code ENOMEM" (out of memory)
   - "cannot find module"
```

#### B) Verify Root Directory
```
Backend: healthcare-backend ✓
Frontend: healthcare-frontend ✓

NOT:
- /healthcare-backend (leading slash)
- root (correct is full path)
```

#### C) Verify Build Command
```
Backend: npm install ✓
Frontend: npm install && npm run build ✓

NOT:
- npm install --production (will skip devDependencies)
- npm ci (works but slower)
```

#### D) Check for Syntax Errors
```
1. Run locally first:
   npm install
   npm run build  (for frontend)
   
2. Fix any errors before committing
3. Push to GitHub
4. Redeploy from Railway
```

#### E) Clear Railway Cache
```
1. Service → Settings → Redeploy
2. Click "Clear Cache and Redeploy"
3. Wait for fresh build
```

---

### 7. ❌ High Memory Usage / Crashes

**Symptoms:**
- Service keeps restarting
- Memory usage shows 100%+
- "Out of memory" errors
- Service becomes unresponsive

**Solutions:**

#### A) Check Memory Limits
```
1. Service → Settings → Resources
2. Current plan might need upgrade
3. Free plan has 512MB memory
4. Consider upgrading to paid plan
```

#### B) Optimize Code
```
Backend optimizations:
- Close database connections properly
- Limit array sizes returned from API
- Add pagination to list endpoints
- Monitor query performance

Frontend optimizations:
- Tree-shake unused dependencies
- Lazy load routes
- Optimize images
- Remove debug logging
```

#### C) Monitor Metrics
```
1. Service → Metrics tab
2. Watch CPU and Memory graphs
3. Identify spike patterns
4. Check logs during spikes
5. Find which operations cause issues
```

---

### 8. ❌ Deployment Takes Too Long

**Symptoms:**
- Build step takes 10+ minutes
- Stuck on "Building..."
- Deployment never completes

**Solutions:**

#### A) Check for Large Dependencies
```
Frontend (package.json):
- Avoid large UI libraries if not using all features
- Use tree-shaking to remove unused code

Backend (package.json):
- Remove unused dependencies
- Use lean versions of libraries
```

#### B) Optimize Build
```
Frontend:
- Remove source maps in production
- Minify code
- Split code chunks

Backend:
- Skip devDependencies in production
- Remove test files from build
```

#### C) Check Network
```
If installation is slow:
1. It might be Railway's temporary network issue
2. Try "Clear Cache and Redeploy"
3. Check if npm registry is responding
4. Consider using npm ci instead of npm install
```

---

### 9. ❌ Can't Access Backend Health Check

**Symptoms:**
- Can't curl backend health endpoint
- Returns 404 or connection refused
- Backend service shows green but won't respond

**Solutions:**

#### A) Verify Backend URL
```
1. Backend Service → Deployments
2. Copy the deployment URL
3. Test with curl:
   curl https://your-backend-url.railway.app/health

Should return: { "status": "ok" }
```

#### B) Check App is Running
```
1. Backend Service → Logs
2. Search for "listening" or "✅"
3. Should see startup message
4. If not, restart service
```

#### C) Verify Health Endpoint Exists
```
healthcare-backend/src/app.js or server.js

Should have:
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

---

### 10. ❌ Frontend Shows "Cannot GET /"

**Symptoms:**
- Frontend URL returns plain text error
- Error: "Cannot GET /"
- No HTML page loads

**Solutions:**

#### A) Verify Start Command
```
Frontend Service → Settings:

Current: npm run preview
Alternative: npm start (if package.json has start script)

NOT: npm run dev (dev server, won't work on Railway)
```

#### B) Add Fallback Index.html
```
Vite config should serve index.html for all routes:

In vite.config.ts:
{
  appType: 'spa',  // Single Page App
  // This makes all routes serve index.html
}
```

#### C) Check public/index.html
```
healthcare-frontend/index.html should exist
Content should start with:
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    ...
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.jsx"></script>
  </body>
</html>
```

---

## 📋 Debugging Steps (General)

### Step 1: Check Service Status
```
1. Railway Dashboard
2. All services should be green
3. If any red, click and view logs
```

### Step 2: View Recent Logs
```
1. Service → Logs tab
2. Look for ERROR or WARN level messages
3. Search for keywords from error message
4. Check last 50 lines for context
```

### Step 3: Check Environment Variables
```
1. Service → Variables tab
2. Verify all required variables are set
3. Check for typos in variable names
4. Compare with .env.example
```

### Step 4: Test Connectivity
```bash
# From your terminal (not Railway):

# Test frontend
curl https://your-frontend-url.railway.app

# Test backend health
curl https://your-backend-url.railway.app/health

# Test with auth header
curl https://your-backend-url.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@healthcare.com","password":"password"}'
```

### Step 5: Redeploy Services
```
1. Service → Deployments tab
2. Click "Deploy" button for latest commit
3. Wait for deployment to complete
4. Check if issue is resolved
```

---

## 🆘 When All Else Fails

### Get Help

1. **Check Railway Status:** https://status.railway.app
2. **Review Logs:** Export full logs from Railway
3. **Check GitHub Issues:** Look for similar problems
4. **Ask on Railway Discord:** https://railway.app/discord
5. **Review Healthcare System GitHub:** https://github.com/VanLuanIT24/healthcare-system/issues

### Create Support Ticket

Include:
- Error messages from logs
- Environment variables (without secrets)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots

---

## 📞 Quick Reference

| Problem | Quick Fix |
|---------|-----------|
| Frontend won't load | Check VITE_API_URL, redeploy |
| Login fails | Check MongoDB, verify JWT secrets |
| CORS error | Update CORS_ORIGIN to frontend URL |
| Appointment booking fails | Check backend logs, verify data format |
| High memory | Upgrade plan or optimize code |
| Build fails | Check build command, verify Root Directory |
| Can't access backend | Check health endpoint, verify URL |

---

**Last Updated:** December 3, 2025
**Questions?** Check Railway documentation or GitHub issues
