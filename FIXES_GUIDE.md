# 🔧 Healthcare System - Detailed Fix Guide

## Critical Issues - Fix Instructions

### 1️⃣ Fix Environment Variables Inconsistency

#### Problem:

- `.env` có credentials thực, `.env.docker` không complete
- `app.config.js` reference fields không tồn tại

#### Solution A: Create Complete .env.docker

**File:** `.env.docker`

Replace with:

```bash
# ============================================
# 🐳 DOCKER ENVIRONMENT CONFIGURATION
# ============================================

# ============================================
# 🗄️ MONGODB CONFIGURATION
# ============================================
# All services use same credentials
MONGO_USER=mongo
MONGO_PASSWORD=healthcare_secure_pass_123  # Change in production!
MONGO_DATABASE=healthcare

# ============================================
# 🌍 SERVER CONFIG
# ============================================
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173,http://frontend:3000

# ============================================
# 🔐 JWT CONFIGURATION
# ============================================
# IMPORTANT: Generate new secrets for production
# Command: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_SECRET=change_this_to_random_32_character_hex_string_1234567890abcdef
JWT_REFRESH_SECRET=change_this_to_random_32_character_hex_string_abcdef1234567890
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# ============================================
# 🧂 PASSWORD HASHING
# ============================================
SALT_ROUNDS=12

# ============================================
# 📧 EMAIL CONFIGURATION
# ============================================
EMAIL_FROM=noreply@healthcare.com
EMAIL_FROM_NAME=Healthcare System
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

# ============================================
# 🔒 SECURITY SETTINGS
# ============================================
CSRF_COOKIE_NAME=XSRF-TOKEN
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=15m

# ============================================
# 📊 RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=900000     # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100     # requests per window

# ============================================
# 👑 SUPER ADMIN CREDENTIALS
# ============================================
# IMPORTANT: Change these immediately after first login!
SUPER_ADMIN_EMAIL=admin@healthcare.com
SUPER_ADMIN_PASSWORD=@Admin123456
SUPER_ADMIN_NAME=System Administrator
SUPER_ADMIN_PHONE=+84-28-3829-8149

# ============================================
# 🏥 HOSPITAL INFORMATION
# ============================================
HOSPITAL_NAME=Healthcare System Hospital
SUPPORT_EMAIL=support@healthcare.com
SUPPORT_PHONE=+84-28-3829-8149

# ============================================
# 🧾 LOGGING & AUDIT
# ============================================
LOG_LEVEL=info
ENABLE_AUDIT_LOG=true
AUDIT_LOG_RETENTION_DAYS=90

# ============================================
# 🎨 FRONTEND CONFIGURATION
# ============================================
VITE_API_URL=http://localhost:5000/api

# ============================================
# 📱 APPLICATION SETTINGS
# ============================================
ENABLE_PATIENT_PORTAL=true
ENABLE_SUPER_ADMIN_DASHBOARD=true
```

#### Solution B: Fix app.config.js - Add Default Values

**File:** `healthcare-backend/src/config/app.config.js`

Find (around line 69-80):

```javascript
  // SUPER ADMIN
  SUPER_ADMIN_EMAIL: Joi.string().email().required(),
  SUPER_ADMIN_PASSWORD: Joi.string().required(),
  SUPER_ADMIN_NAME: Joi.string().default("System Root Admin"),

  // HOSPITAL INFO
  HOSPITAL_NAME: Joi.string().default("Healthcare System Hospital"),
  SUPPORT_EMAIL: Joi.string().email().default("support@healthcare.vn"),
  SUPPORT_PHONE: Joi.string().default("+84-28-3829-8149"),
```

Change to:

```javascript
  // SUPER ADMIN
  SUPER_ADMIN_EMAIL: Joi.string().email().required(),
  SUPER_ADMIN_PASSWORD: Joi.string().required(),
  SUPER_ADMIN_NAME: Joi.string().default("System Root Admin"),
  SUPER_ADMIN_PHONE: Joi.string().default(""),  // ✅ ADD THIS

  // HOSPITAL INFO
  HOSPITAL_NAME: Joi.string().default("Healthcare System Hospital"),
  SUPPORT_EMAIL: Joi.string().email().default("support@healthcare.vn"),
  SUPPORT_PHONE: Joi.string().default("+84-28-3829-8149"),
```

And ensure the appConfig object includes:

```javascript
superAdmin: {
  email: env.SUPER_ADMIN_EMAIL,
  password: env.SUPER_ADMIN_PASSWORD,
  name: env.SUPER_ADMIN_NAME,
  phone: env.SUPER_ADMIN_PHONE,  // ✅ Make sure this is here
},
```

---

### 2️⃣ Fix MongoDB Connection Strings

#### Problem:

- Multiple URI formats causing confusion
- Docker Compose URI mismatch

#### Solution: Standardize Everywhere

**File:** `healthcare-backend/.env`

Replace all MongoDB vars with:

```bash
# ============================================
# 🗄️ MONGODB - LOCAL DEVELOPMENT
# ============================================
MONGO_URI=mongodb://localhost:27017/healthcare_dev
```

**File:** `.env.docker`

Already fixed above:

```bash
# MongoDB connection is auto-generated in docker-compose.yml
# Format: mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${SERVICE}:${PORT}/${DATABASE}
```

**File:** `docker-compose.yml`

Keep as is (auto-generates from variables):

```yaml
backend:
  environment:
    MONGO_URI: mongodb://${MONGO_USER:-mongo}:${MONGO_PASSWORD:-password}@mongodb:27017/healthcare
```

**File:** `healthcare-backend/src/config/app.config.js`

Change (line 28):

```javascript
  MONGO_URI: Joi.string()
    .uri()
    .default("mongodb://localhost:27017/healthcare_dev"),
```

To:

```javascript
  MONGO_URI: Joi.string()
    .uri()
    .required()
    .error((errors) => ({
      message: 'MONGO_URI is required. Format: mongodb://user:pass@host:port/database'
    })),
```

---

### 3️⃣ Fix Docker Compose MongoDB Credentials Sync

#### Problem:

```yaml
# MongoDB service initialized with:
MONGO_INITDB_ROOT_USERNAME: mongo
MONGO_INITDB_ROOT_PASSWORD: password_A

# Backend expects:
MONGO_URI: mongodb://mongo:password_B@mongodb:27017/healthcare
# (password_B from environment variables)
```

#### Solution: Update docker-compose.yml

**File:** `docker-compose.yml`

Find the MongoDB service (around line 7-31) and ensure consistency:

```yaml
services:
  mongodb:
    image: mongo:6.0-alpine
    container_name: healthcare_mongodb
    ports:
      - "27017:27017"
    environment:
      # Use same credentials everywhere
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER:-mongo}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-password}
      MONGO_INITDB_DATABASE: ${MONGO_DATABASE:-healthcare}
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - healthcare-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  backend:
    # ... other config ...
    environment:
      # Construct URI from components
      MONGO_URI: mongodb://${MONGO_USER:-mongo}:${MONGO_PASSWORD:-password}@mongodb:27017/${MONGO_DATABASE:-healthcare}
      # ... other env vars ...
```

---

### 4️⃣ Fix Frontend Vite Proxy Configuration

#### Problem:

```javascript
rewrite: (path) => path.replace(/^\/api/, "");
// /api/auth/login → /auth/login (WRONG!)
```

#### Solution: Fix vite.config.ts

**File:** `healthcare-frontend/vite.config.ts`

Change:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    open: false,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // ❌ REMOVE THIS
      },
    },
  },
  // ...
});
```

To:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    open: false,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        // Don't rewrite the path - keep /api intact
      },
    },
  },
  // ...
});
```

---

### 5️⃣ Fix Frontend Dockerfile - Add API URL to Build

#### Problem:

```dockerfile
RUN npm run build
# Builds without VITE_API_URL, uses default
```

#### Solution: Update Dockerfile

**File:** `healthcare-frontend/Dockerfile`

Change Stage 1:

```dockerfile
# Stage 1: Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# ✅ ADD BUILD ARGS
ARG VITE_API_URL=http://localhost:5000/api

# ✅ BUILD WITH API URL
RUN VITE_API_URL=$VITE_API_URL npm run build
```

And update docker-compose.yml for frontend:

```yaml
frontend:
  build:
    context: ./healthcare-frontend
    dockerfile: Dockerfile
    args:
      VITE_API_URL: http://localhost:5000/api # ✅ ADD THIS
  environment:
    VITE_API_URL: http://localhost:5000/api
```

---

### 6️⃣ Add Database Health Check

#### Problem:

```javascript
app.get("/health", (req, res) => {
  // Only checks if app is running, not DB
  res.status(200).json({ status: "healthy" });
});
```

#### Solution: Add DB Check

**File:** `healthcare-backend/app.js`

Find the health check endpoint (around line 179):

```javascript
// 🏥 HEALTH CHECK ENDPOINT - CẢI THIỆN
app.get("/health", async (req, res) => {
  try {
    // ✅ Check MongoDB connection
    const mongooseConnection = require("mongoose").connection;
    const dbHealthy = mongooseConnection.readyState === 1;

    const healthCheck = {
      status: dbHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: appConfig.env,
      version: process.env.npm_package_version || "1.0.0",
      database: {
        connected: dbHealthy,
        status:
          mongooseConnection.readyState === 1 ? "connected" : "disconnected",
      },
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    };

    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});
```

---

### 7️⃣ Fix SuperAdmin Phone Field Validation

#### Problem in src/config/app.config.js:

- Schema validates SUPER_ADMIN_PHONE nhưng không required

#### Solution: Already covered in Issue #1 fix above

Just ensure .env.docker has:

```bash
SUPER_ADMIN_PHONE=+84-28-3829-8149
```

---

## Verification Steps

After applying all fixes, verify with:

```bash
# 1. Check environment variables
node -e "require('dotenv').config(); console.log(process.env.MONGO_URI)"

# 2. Test MongoDB connection locally
cd healthcare-backend
npm install
npm run dev
# Should see: ✅ Kết nối MongoDB thành công

# 3. Test Docker Compose
docker-compose up --build
# Watch logs for:
# - ✓ MongoDB is ready
# - ✅ Kết nối MongoDB thành công
# - 200 response from /health endpoint

# 4. Test API endpoints
curl http://localhost:5000/health
curl http://localhost:3000  # Frontend

# 5. Test Frontend API Call
# In browser console:
fetch('/api/auth/health').then(r => r.json()).then(console.log)
```

---

## Deployment Checklist

- [ ] All .env variables standardized
- [ ] MONGO_URI format consistent across all files
- [ ] Docker Compose credentials match
- [ ] Frontend proxy configured correctly
- [ ] Frontend build includes API URL
- [ ] Health check includes DB status
- [ ] All console.log cleaned up for production
- [ ] .env file added to .gitignore
- [ ] .env.example created with dummy values only
- [ ] SMTP credentials changed for production
- [ ] JWT secrets regenerated for production
- [ ] Docker images tested locally
- [ ] API endpoints tested with curl/Postman
- [ ] Frontend API calls tested in browser

---

## Quick Start After Fixes

```bash
# 1. Copy env file
cp .env.docker .env

# 2. Edit .env with real values
vim .env  # Update SMTP, JWT_SECRETS, etc.

# 3. Build & start
docker-compose up --build

# 4. Wait for all services ready (~30 seconds)
docker-compose ps

# 5. Test
curl http://localhost:5000/health
open http://localhost:3000

# 6. Login with default super admin
# Email: admin@healthcare.com
# Password: @Admin123456

# 7. Change password immediately!
```

---

**Last Updated:** 2025-11-29
