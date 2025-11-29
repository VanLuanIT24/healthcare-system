# 🗄️ Healthcare System - Database Connection Analysis

## 1. Current Database Connection Flow

```
┌─────────────────────────────────────────────────────────┐
│ ENVIRONMENT VARIABLE SOURCES                            │
└─────────────────────────────────────────────────────────┘

Development (.env):
  ├─ MONGO_URI (Railway public URL - NOT for local dev!)
  ├─ MONGO_URL (Railway internal URL - NOT for local dev!)
  ├─ MONGO_PUBLIC_URL (duplicate)
  ├─ MONGO_HOST, MONGO_PORT (separate components)
  └─ MONGO_USER, MONGO_PASSWORD

Docker (.env.docker):
  ├─ MONGO_USER
  ├─ MONGO_PASSWORD
  └─ MONGO_DATABASE

Docker Compose (docker-compose.yml):
  ├─ MongoDB service sets:
  │  ├─ MONGO_INITDB_ROOT_USERNAME
  │  ├─ MONGO_INITDB_ROOT_PASSWORD
  │  └─ MONGO_INITDB_DATABASE
  │
  └─ Backend service gets:
     └─ MONGO_URI (auto-generated)

Code (app.config.js → db.config.js → mongoose):
  ├─ Reads MONGO_URI from env
  ├─ Validates with Joi schema
  └─ Passes to mongoose.connect()
```

## 2. Connection String Analysis

### Current Problems:

**Issue 1: Multiple URIs in .env**

```
MONGO_URI=mongodb://mongo:daQyMamACGQtPOWQrJdpRcFjqcLFsKBp@yamanote.proxy.rlwy.net:14024
MONGO_URL=mongodb://mongo:daQyMamACGQtPOWQrJdpRcFjqcLFsKBp@mongodb.railway.internal:27017
MONGO_PUBLIC_URL=mongodb://mongo:daQyMamACGQtPOWQrJdpRcFjqcLFsKBp@yamanote.proxy.rlwy.net:14024
```

**Analysis:**

- MONGO_URI and MONGO_PUBLIC_URL are IDENTICAL → Redundant
- MONGO_URL uses `mongodb.railway.internal` (internal network)
- MONGO_URI uses `yamanote.proxy.rlwy.net` (public Railway tunnel)
- .env file has REAL credentials exposed (SECURITY RISK!)

---

**Issue 2: Development vs Docker Connection**

```
┌──────────────────────────────────────────────────────────┐
│ LOCAL DEVELOPMENT (npm run dev)                          │
├──────────────────────────────────────────────────────────┤
│ Using: .env file (MONGO_URI points to Railway)          │
│ Problem: Requires internet connection to Railway         │
│ Better: Should use local MongoDB at localhost:27017      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ DOCKER CONTAINER (docker-compose up)                    │
├──────────────────────────────────────────────────────────┤
│ Using: docker-compose.yml env variables                 │
│ Creates: mongodb service at mongodb:27017               │
│ Backend gets: mongodb://mongo:password@mongodb:27017    │
│ Problem: .env vars might override in wrong way          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PRODUCTION (Railway, Atlas, etc.)                       │
├──────────────────────────────────────────────────────────┤
│ Using: Environment variables from hosting provider       │
│ Format: mongodb+srv://user:pass@cluster.mongodb.net     │
│ Problem: Not currently handled                          │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Correct Connection Flow (After Fixes)

### Development Environment

**File: `healthcare-backend/.env`**

```bash
# LOCAL DEVELOPMENT - USE LOCAL MONGODB
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/healthcare_dev

# Other configs...
```

**Start local MongoDB:**

```bash
# Option 1: Docker
docker run -d -p 27017:27017 --name healthcare-mongo mongo:6.0

# Option 2: Local installation
mongod --dbpath ~/mongodb_data

# Option 3: Docker Desktop MongoDB image
# (comes pre-installed)
```

**Test connection:**

```javascript
const mongoose = require("mongoose");
await mongoose.connect("mongodb://localhost:27017/healthcare_dev");
console.log("✅ Connected to local MongoDB");
```

---

### Docker Environment

**File: `.env.docker`**

```bash
NODE_ENV=production
MONGO_USER=mongo
MONGO_PASSWORD=secure_password_123
MONGO_DATABASE=healthcare
```

**File: `docker-compose.yml`**

```yaml
services:
  mongodb:
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGO_DATABASE}
    ports:
      - "27017:27017"
    networks:
      - healthcare-network

  backend:
    environment:
      # Constructed connection string
      MONGO_URI: mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017/${MONGO_DATABASE}
    networks:
      - healthcare-network
    depends_on:
      mongodb:
        condition: service_healthy
```

**Flow:**

1. Docker Compose reads `.env.docker`
2. Substitutes ${VAR} values into services
3. MongoDB starts with MONGO_INITDB_ROOT_USERNAME=mongo, PASSWORD=secure_password_123
4. Backend gets MONGO_URI=mongodb://mongo:secure_password_123@mongodb:27017/healthcare
5. Connection succeeds because credentials match

---

### Production Environment (MongoDB Atlas)

**File: Production `.env` (in hosting provider)**

```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare?retryWrites=true&w=majority
```

**How it works:**

1. Hosting provider (Railway, Heroku, etc.) sets MONGO_URI
2. App reads MONGO_URI via process.env
3. mongoose.connect(MONGO_URI) connects to Atlas cluster

---

## 4. Detailed Connection String Formats

### MongoDB Local

```
mongodb://localhost:27017/healthcare_dev
mongodb://username:password@localhost:27017/healthcare_dev
```

### MongoDB Docker (Internal)

```
mongodb://mongo:password@mongodb:27017/healthcare
# hostname = mongodb (Docker service name)
# port = 27017 (default)
# database = healthcare
```

### MongoDB Docker (External)

```
mongodb://mongo:password@localhost:27017/healthcare
# When accessing from host machine
# localhost = 127.0.0.1
```

### MongoDB Atlas (Cloud)

```
mongodb+srv://user:password@cluster0.abcd.mongodb.net/healthcare?retryWrites=true&w=majority
# +srv = DNS SRV records (modern)
# cluster0.abcd = cluster identifier
# .mongodb.net = Atlas domain
```

### MongoDB Railway (Current)

```
mongodb://user:password@yamanote.proxy.rlwy.net:14024/healthcare
# Public proxy URL (not for production)
```

---

## 5. Environment-Specific Configuration

### Option A: Single .env per environment

```
Development:  .env (use localhost)
Docker:       .env.docker (use mongodb service name)
Production:   Set MONGO_URI in hosting dashboard
```

### Option B: Environment variable in code

```javascript
// app.config.js
const mongoUri = (() => {
  if (process.env.NODE_ENV === "development") {
    return process.env.MONGO_URI || "mongodb://localhost:27017/healthcare_dev";
  }

  if (process.env.NODE_ENV === "production") {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is required in production");
    }
    return process.env.MONGO_URI;
  }

  // Docker
  return (
    process.env.MONGO_URI || "mongodb://mongo:password@mongodb:27017/healthcare"
  );
})();
```

---

## 6. Security Concerns ⚠️

### Current Issues:

1. **Credentials in .env file**

   ```
   ❌ MONGO_URI=mongodb://mongo:daQyMamACGQtPOWQrJdpRcFjqcLFsKBp@yamanote.proxy.rlwy.net:14024
   // Real password exposed in version control!
   ```

2. **No database authentication in local development**

   ```
   ✓ Local: mongodb://localhost:27017/healthcare_dev (OK, only local)
   ```

3. **Docker credentials visible**
   ```
   ⚠️ In .env.docker: MONGO_PASSWORD=healthcare_secure_password...
      // Should be in secrets, not env file
   ```

### Best Practices:

```
Development:
  ✓ .env with local localhost connection (OK - local only)
  ✓ No authentication needed for localhost:27017

Docker:
  ✓ Use Docker secrets or environment variables
  ✓ Never commit credentials to Git
  ✓ Use .gitignore: .env, .env.docker, .env.*.local

Production:
  ✓ Use hosting provider's secret management
  ✓ Railway Secrets, Heroku Config Vars, AWS Secrets Manager
  ✓ Generate strong random credentials
  ✓ Rotate credentials regularly
  ✓ Use connection pooling
  ✓ Encrypt in transit (TLS)
```

---

## 7. Testing Database Connection

### Test 1: Verify Connection String

```javascript
// test-connection.js
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/healthcare_dev";

console.log("Testing connection to:", uri);

mongoose
  .connect(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
  })
  .then(() => {
    console.log("✅ Connection successful");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  });
```

**Run:**

```bash
# Development
node test-connection.js

# Docker
docker-compose exec backend node test-connection.js

# With env file
MONGO_URI=mongodb://localhost:27017/test node test-connection.js
```

---

### Test 2: MongoDB Shell Connection

```bash
# Local MongoDB
mongosh mongodb://localhost:27017/healthcare_dev

# Docker MongoDB
docker-compose exec mongodb mongosh -u mongo -p healthcare_secure_password
# or
mongosh mongodb://mongo:password@localhost:27017/healthcare

# Atlas MongoDB
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/healthcare"
```

---

### Test 3: Docker Compose Connection Test

```bash
# Start services
docker-compose up -d

# Wait for MongoDB to be ready
docker-compose logs mongodb

# Test backend connection
docker-compose logs backend | grep -i "mongodb\|connected\|error"

# Exec into backend container
docker-compose exec backend node test-connection.js

# Test from host machine
curl http://localhost:5000/health
# Should show: "status": "healthy", "database": { "connected": true }
```

---

## 8. Connection Pool Configuration

### Current Settings (src/config/db.config.js)

```javascript
await mongoose.connect(appConfig.db.uri, {
  maxPoolSize: appConfig.db.maxPoolSize, // default 20
  minPoolSize: appConfig.db.minPoolSize, // default 5
  serverSelectionTimeoutMS: 5000, // 5 seconds
  socketTimeoutMS: 45000, // 45 seconds
  autoIndex: appConfig.isDev,
});
```

### Recommended Values

```javascript
Development: maxPoolSize: 5;
minPoolSize: 1;
serverSelectionTimeoutMS: 10000;
socketTimeoutMS: 60000;

Production: maxPoolSize: 50;
minPoolSize: 10;
serverSelectionTimeoutMS: 5000;
socketTimeoutMS: 45000;
```

---

## 9. Database Selection & Naming

### Database Name Strategy

```
mongodb://user:pass@host:port/DATABASE_NAME
                                 ^^^^^^^^^^^^^^

Current situation:
- MONGO_URI has no database name specified!
- MongoDB defaults to 'admin' or creates implicit db
- No guarantees which database is being used
```

### Recommended:

```bash
# Development
MONGO_URI=mongodb://localhost:27017/healthcare_dev

# Docker
# In docker-compose.yml backend service:
MONGO_URI=mongodb://mongo:password@mongodb:27017/healthcare

# Production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/healthcare?...
```

### Verify Database Name:

```javascript
console.log("Database Name:", mongoose.connection.name);
// Output: healthcare_dev, healthcare, etc.
```

---

## 10. Migration from Current Setup

### Step 1: Update .env Files

```bash
# Step 1: Delete old/redundant URIs
# Remove: MONGO_URL, MONGO_PUBLIC_URL, MONGO_HOST, MONGO_PORT
# Keep only: MONGO_URI

# Step 2: Create clean .env.docker
cat > .env.docker << 'EOF'
NODE_ENV=production
MONGO_USER=mongo
MONGO_PASSWORD=healthcare_secure_pass_123
MONGO_DATABASE=healthcare
# ... other vars ...
EOF

# Step 3: Create .env for development
cat > .env << 'EOF'
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/healthcare_dev
# ... other vars ...
EOF

# Step 4: Add to .gitignore
echo ".env" >> .gitignore
echo ".env.*.local" >> .gitignore
```

### Step 2: Update Code

```javascript
// No changes needed in app.config.js
// Already expects MONGO_URI
// Just ensure defaults are good

const mongoUri = env.MONGO_URI || "mongodb://localhost:27017/healthcare_dev";
```

### Step 3: Test Locally

```bash
# Start local MongoDB
docker run -d -p 27017:27017 mongo:6.0

# Run backend
cd healthcare-backend
npm install
npm run dev

# Should see:
# ✅ Kết nối MongoDB thành công
```

### Step 4: Test Docker

```bash
# Build and run
docker-compose up --build

# Monitor logs
docker-compose logs -f backend

# Should see:
# backend_1  | ✅ Kết nối MongoDB thành công
# backend_1  | ✅ ỨNG DỤNG ĐÃ SẴN SÀNG
```

---

## Summary Checklist

- [ ] .env contains MONGO_URI pointing to local MongoDB
- [ ] .env.docker contains MONGO_USER, MONGO_PASSWORD, MONGO_DATABASE
- [ ] docker-compose.yml constructs MONGO_URI correctly
- [ ] Database name is explicit in all connection strings (not implicit)
- [ ] All credentials removed from .env before Git commit
- [ ] .gitignore includes .env files
- [ ] Connection tested locally with `npm run dev`
- [ ] Connection tested in Docker with `docker-compose up`
- [ ] Health check endpoint returns database connection status
- [ ] Production MongoDB URI method decided (Atlas, Railway, etc.)

---

**Last Updated:** 2025-11-29
