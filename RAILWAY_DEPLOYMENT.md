# 🚀 Railway Deployment Guide - Healthcare System

**Last Updated:** December 3, 2025  
**Status:** 📖 Complete Setup Instructions  
**Platform:** Railway.app

---

## 📋 Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Environment Variables](#environment-variables)
5. [Monitoring & Logs](#monitoring--logs)
6. [Troubleshooting](#troubleshooting)
7. [Custom Domain Setup](#custom-domain-setup)

---

## 🚀 Quick Start

### What You'll Deploy

- **Backend:** Node.js + Express API on Railway
- **Frontend:** React app on Railway
- **Database:** MongoDB on Railway
- **Domain:** Auto-generated Railway domain or custom domain

### Timeline

- **Database Setup:** 2 minutes
- **Backend Deploy:** 3 minutes
- **Frontend Deploy:** 3 minutes
- **Testing:** 2 minutes

**Total: ~10 minutes**

---

## ✅ Prerequisites

### 1. Railroad Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account (recommended)
3. Authorize Railway to access your repositories

### 2. GitHub Repository

- Fork or clone to your GitHub: `https://github.com/VanLuanIT24/healthcare-system`
- Ensure your repository is **public** or Railway has access

### 3. Required Information (Keep Handy)

```
- GitHub username
- Healthcare system repository URL
- MongoDB Atlas credentials (optional - use Railway's MongoDB)
- Admin email: admin@healthcare.com
- Admin password: @Admin123 (change in production!)
```

---

## 📊 Step-by-Step Setup

### Step 1: Create Railway Project

```
1. Go to https://railway.app/dashboard
2. Click "Create New Project"
3. Select "Deploy from GitHub"
4. Search for "healthcare-system" repository
5. Click "Deploy"
```

**Expected Result:**

- New Railway project created
- Git repository connected

---

### Step 2: Add MongoDB Database

Railway will automatically detect `docker-compose.yml` and services.

**Option A: Railway's MongoDB (Recommended)**

```
1. In Railway Dashboard → "Create Service"
2. Select "Database"
3. Choose "MongoDB"
4. Click "Deploy"
5. Wait 2-3 minutes for MongoDB to be ready
```

**Option B: MongoDB Atlas**

```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string: mongodb+srv://username:password@...
4. Save for Step 3 (Backend setup)
```

---

### Step 3: Deploy Backend

#### 3.1 Create Backend Service

```
1. Railway Dashboard → "Create Service"
2. Select "GitHub Repo"
3. Choose "healthcare-system" repo
4. Click "Add Service"
```

#### 3.2 Configure Backend Service

```
1. Click the new "healthcare-system" service
2. Go to "Settings"
3. Set these:

   - Root Directory: healthcare-backend
   - Build Command: npm install
   - Start Command: npm start
```

#### 3.3 Add Environment Variables

Click "Variables" tab and add:

```env
# Core Settings
NODE_ENV=production
PORT=5000

# Database (Railway's MongoDB)
MONGO_URI=${{ MONGODB_URL }}

# Database (MongoDB Atlas alternative)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare

# JWT Secrets (CHANGE THESE!)
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key_railway_production_12345
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_railway_production_67890

# Token Expiration
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Password Hashing
SALT_ROUNDS=12

# CORS (Update with your domain)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,https://your-railway-domain.railway.app

# Super Admin
SUPER_ADMIN_EMAIL=admin@healthcare.com
SUPER_ADMIN_PASSWORD=@Admin123

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@healthcare.com

# Logging
LOG_LEVEL=info
```

**Important:**

- Replace `your_super_secret_*` with random strong strings
- Generate secrets:
  ```javascript
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

#### 3.4 Get Backend URL

```
1. Go to Backend Service
2. Click "Deployments" tab
3. Click on latest deployment
4. Copy the URL (e.g., https://healthcare-backend-prod.railway.app)
5. Save this for Step 4
```

---

### Step 4: Deploy Frontend

#### 4.1 Create Frontend Service

```
1. Railway Dashboard → "Create Service"
2. Select "GitHub Repo"
3. Choose "healthcare-system" repo again
4. Click "Add Service"
```

#### 4.2 Configure Frontend Service

```
1. Click the new "healthcare-system" service (frontend)
2. Go to "Settings"
3. Set these:

   - Root Directory: healthcare-frontend
   - Build Command: npm install && npm run build
   - Start Command: npm run preview
```

#### 4.3 Add Environment Variables

Click "Variables" tab and add:

```env
# API URL (from Step 3.4)
VITE_API_URL=https://healthcare-backend-prod.railway.app/api

# Example (replace with actual URL):
# VITE_API_URL=https://healthcare-backend-prod-xyz.railway.app/api
```

#### 4.4 Get Frontend URL

```
1. Go to Frontend Service
2. Click "Deployments" tab
3. Click on latest deployment
4. Copy the URL (e.g., https://healthcare-frontend-prod.railway.app)
5. This is your app URL! 🎉
```

---

### Step 5: Update CORS in Backend

Backend needs to know the frontend URL.

```
1. Go to Backend Service
2. Click "Variables"
3. Update CORS_ORIGIN:

   CORS_ORIGIN=https://your-frontend-url.railway.app
```

---

### Step 6: Test the Deployment

#### 6.1 Check Backend Status

```bash
# Replace with your backend URL
curl https://healthcare-backend-prod-xyz.railway.app/health
```

Expected response:

```json
{ "status": "ok" }
```

#### 6.2 Open Frontend in Browser

```
1. Go to your frontend URL
2. You should see the login page
3. Login with:
   - Email: admin@healthcare.com
   - Password: @Admin123
```

#### 6.3 Test Appointment Booking

```
1. Login as admin
2. Go to "Patient" dashboard
3. Try booking an appointment
4. Should create successfully
```

---

## 🔑 Environment Variables Reference

### Backend Variables

| Variable                  | Example                                          | Required | Notes                            |
| ------------------------- | ------------------------------------------------ | -------- | -------------------------------- |
| `NODE_ENV`                | `production`                                     | Yes      | Must be "production" for Railway |
| `PORT`                    | `5000`                                           | Yes      | Railway manages this             |
| `MONGO_URI`               | `mongodb+srv://user:pass@cluster.mongodb.net/db` | Yes      | Use Railway's MongoDB or Atlas   |
| `JWT_ACCESS_SECRET`       | `random_32_char_string`                          | Yes      | Generate: `node -e "..."` above  |
| `JWT_REFRESH_SECRET`      | `random_32_char_string`                          | Yes      | Generate: `node -e "..."` above  |
| `ACCESS_TOKEN_EXPIRES_IN` | `15m`                                            | No       | Default: 15 minutes              |
| `CORS_ORIGIN`             | `https://your-frontend.railway.app`              | Yes      | Exact frontend URL               |
| `SUPER_ADMIN_EMAIL`       | `admin@healthcare.com`                           | Yes      | Default admin email              |
| `SUPER_ADMIN_PASSWORD`    | `@Admin123`                                      | Yes      | Change after first login!        |
| `SMTP_HOST`               | `smtp.gmail.com`                                 | No       | For email notifications          |
| `SMTP_PORT`               | `587`                                            | No       | SMTP port                        |
| `SMTP_USER`               | `your_email@gmail.com`                           | No       | Your SMTP user                   |
| `SMTP_PASSWORD`           | `app_password`                                   | No       | Gmail app password (not pwd)     |
| `LOG_LEVEL`               | `info`                                           | No       | Logging level                    |

### Frontend Variables

| Variable       | Example                                               | Required | Notes                    |
| -------------- | ----------------------------------------------------- | -------- | ------------------------ |
| `VITE_API_URL` | `https://healthcare-backend-prod-xyz.railway.app/api` | Yes      | Backend API endpoint URL |

---

## 📊 Monitoring & Logs

### View Logs

```
1. Railway Dashboard → Select Service
2. Click "Logs" tab
3. See real-time logs
```

### Monitor Performance

```
1. Click "Metrics" tab
2. View CPU, Memory, Network usage
3. Check deployment history
```

### View Deployments

```
1. Click "Deployments" tab
2. See all deployment attempts
3. Rollback if needed
```

---

## 🔧 Troubleshooting

### Issue: Frontend shows 404 errors

**Solution:**

```
1. Check VITE_API_URL environment variable
2. Ensure it matches backend URL
3. Redeploy frontend
```

### Issue: Login fails

**Solution:**

```
1. Check MongoDB is running
2. View backend logs for errors
3. Verify JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are set
```

### Issue: Database connection error

**Solution:**

```
1. Check MONGO_URI is correct
2. Verify MongoDB is deployed and running
3. Check network access (Railway to MongoDB)
```

### Issue: CORS error in browser console

**Solution:**

```
1. Go to Backend service → Variables
2. Update CORS_ORIGIN to exact frontend URL
3. Redeploy backend
4. Clear browser cache
```

### Issue: Build fails on Railway

**Solution:**

```
1. Check build logs for specific error
2. Ensure Root Directory is set correctly:
   - Backend: healthcare-backend
   - Frontend: healthcare-frontend
3. Verify package.json exists in root directory
4. Check for syntax errors in code
```

---

## 🌐 Custom Domain Setup

### Add Custom Domain (Optional)

```
1. Railway Dashboard → Select Frontend Service
2. Click "Settings" → "Domains"
3. Click "Add Custom Domain"
4. Enter your domain: example.com
5. Railway provides DNS records to add to your domain
6. Wait 5-10 minutes for DNS propagation
```

### Update Backend CORS for Custom Domain

```
1. Go to Backend Service → Variables
2. Add your domain to CORS_ORIGIN:

   CORS_ORIGIN=https://example.com,https://www.example.com
```

---

## 📝 Deployment Checklist

Before deploying to production:

- [ ] Generate new JWT secrets (don't use examples)
- [ ] Change SUPER_ADMIN_PASSWORD
- [ ] Set up email (SMTP) configuration
- [ ] Update CORS_ORIGIN with correct frontend URL
- [ ] Test login functionality
- [ ] Test appointment booking
- [ ] Check error logs for warnings
- [ ] Set up custom domain (optional)
- [ ] Monitor first 24 hours for issues
- [ ] Change admin password after first login

---

## 🎯 Next Steps

### After Deployment

1. **Monitor Logs**

   - Check for errors in first few minutes
   - Monitor database connections

2. **Test Features**

   - Login with admin account
   - Create test appointment
   - Verify data persistence

3. **Set Up CI/CD** (Optional)

   - Railway auto-deploys on git push
   - Ensure CI/CD workflows are enabled
   - Monitor GitHub Actions tab

4. **Security Hardening**
   - Change admin password immediately
   - Set up email notifications
   - Monitor access logs
   - Consider adding 2FA

---

## 📞 Support & Resources

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://railway.app/discord
- **Healthcare System GitHub:** https://github.com/VanLuanIT24/healthcare-system
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas

---

## 🎉 Congratulations!

Your healthcare system is now deployed on Railway!

**Next Steps:**

1. Bookmark your frontend URL
2. Share with team members
3. Set up backup strategy for MongoDB
4. Monitor performance metrics
5. Plan feature updates

---

**Questions?** Check the troubleshooting section above or review Railway documentation.
