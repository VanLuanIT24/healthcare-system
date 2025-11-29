# 🏗️ Healthcare System - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐        ┌──────────────────────────┐   │
│  │   React 18 App      │        │   Patient Portal App     │   │
│  │  (Vite + TypeScript)│   →    │  (Role-based UI)         │   │
│  └─────────────────────┘        └──────────────────────────┘   │
│         :3000                              :3000                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                      NGINX REVERSE PROXY                         │
├─────────────────────────────────────────────────────────────────┤
│  - Forwards /api requests to backend                            │
│  - Serves static frontend files                                 │
│  - Handles HTTPS (future)                                       │
│  :80 / :443                                                      │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Express.js Application                      │   │
│  │  - CORS, Helmet, Rate Limiting, Morgan Logging         │   │
│  │  - Request validation & sanitization                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  :5000                                                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Auth Middleware  │→ │ JWT Verification │                    │
│  │ (Public/Private) │  │ & Token Decode   │                    │
│  └──────────────────┘  └──────────────────┘                    │
│           ↓                                                      │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ RBAC Middleware  │→ │ Permission Check │                    │
│  │ (Role Validate)  │  │ (Authorization)  │                    │
│  └──────────────────┘  └──────────────────┘                    │
│           ↓                                                      │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Validation       │→ │ Input Sanitize   │                    │
│  │ Middleware       │  │ Prevent XSS      │                    │
│  └──────────────────┘  └──────────────────┘                    │
│           ↓                                                      │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Audit Logging    │→ │ Track Actions    │                    │
│  │ Middleware       │  │ Compliance       │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                   ROUTE HANDLER LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Routes  │  │ User Routes  │  │ Super Admin  │          │
│  │ (login,      │  │ (CRUD,       │  │ (System      │          │
│  │  register)   │  │  profile)    │  │  management) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│           ↓               ↓                   ↓                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Patient      │  │ Appointment  │  │ Medical      │          │
│  │ Portal       │  │ Routes       │  │ Record       │          │
│  │ Routes       │  │ (Scheduling) │  │ Routes       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│               CONTROLLER LAYER (HTTP Handlers)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  AuthController → Handles login, register, password reset       │
│  UserController → User CRUD, profile management                 │
│  PatientController → Patient CRUD, admission, discharge         │
│  AppointmentController → Scheduling & management                │
│  MedicalRecordController → Medical data management              │
│                                                                   │
│  Controllers:                                                    │
│  1. Accept HTTP request                                          │
│  2. Parse & validate input                                       │
│  3. Call service layer                                           │
│  4. Format & return response                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                SERVICE LAYER (Business Logic)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  AuthService:                 PatientService:                   │
│  ├─ login()                   ├─ registerPatient()              │
│  ├─ register()                ├─ searchPatients()               │
│  ├─ refreshToken()            ├─ getDemographics()              │
│  ├─ logout()                  ├─ admitPatient()                 │
│  └─ resetPassword()           └─ dischargePatient()             │
│                                                                   │
│  UserService:                 SuperAdminService:                │
│  ├─ createUser()              ├─ createSuperAdmin()             │
│  ├─ listUsers()               ├─ getSuperAdminStatus()          │
│  ├─ updateUser()              ├─ generateAdminToken()           │
│  └─ deleteUser()              └─ resetSuperAdmin()              │
│                                                                   │
│  Services implement:                                             │
│  1. Data validation                                              │
│  2. Business rules                                               │
│  3. Model operations                                             │
│  4. Error handling                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│               DATA ACCESS LAYER (Mongoose Models)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Core Models:           Medical Models:                         │
│  ├─ User                ├─ MedicalRecord                        │
│  ├─ Patient             ├─ Appointment                          │
│  ├─ AuditLog            ├─ Prescription                         │
│  └─ Settings            ├─ LabOrder                             │
│                         └─ Consultation                          │
│                                                                   │
│  Support Models:                                                │
│  ├─ Demographics        ├─ Insurance                            │
│  ├─ Admission           ├─ Bill/Billing                         │
│  ├─ Allergy             ├─ Vaccination                          │
│  ├─ Diagnosis           ├─ Communication                        │
│  ├─ EmergencyContact    ├─ MedicalHistory                       │
│  └─ Visit               └─ Labresults                           │
│                                                                   │
│  Models:                                                         │
│  1. Define schema structure                                      │
│  2. Validate data types                                          │
│  3. Create indexes for queries                                   │
│  4. Define relationships (populate)                              │
│  5. Add helper methods (BMI, etc.)                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER (MongoDB)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  MongoDB Collections:                                            │
│  ├─ users (indexes: email, role, status)                        │
│  ├─ patients (indexes: patientId, userId)                       │
│  ├─ medicalrecords (indexes: patientId, createdAt)              │
│  ├─ appointments (indexes: patientId, doctorId, date)           │
│  ├─ prescriptions (indexes: patientId, doctorId)                │
│  ├─ auditlogs (indexes: userId, action, createdAt)             │
│  ├─ bills (indexes: patientId, createdAt)                       │
│  └─ ... (16 more collections)                                   │
│                                                                   │
│  Connection:                                                     │
│  Development: mongodb://localhost:27017/healthcare_dev          │
│  Docker:      mongodb://mongo:pass@mongodb:27017/healthcare     │
│  Production:  mongodb+srv://user:pass@cluster.mongodb.net       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagram

### Example: Patient Login Flow

```
CLIENT                    MIDDLEWARE              SERVICE              DATABASE
  │                          │                       │                    │
  ├─ POST /api/auth/login    │                       │                    │
  │──────────────────────────→│                       │                    │
  │  { email, password }      │                       │                    │
  │                           │                       │                    │
  │                      (Rate Limit)                │                    │
  │                           │                       │                    │
  │                      (Input Validation)          │                    │
  │                           │                       │                    │
  │                           ├─ Call loginService    │                    │
  │                           │──────────────────────→│                    │
  │                           │                       ├─ Find user         │
  │                           │                       │───────────────────→│
  │                           │                       │←───────────────────│
  │                           │                       │ User object        │
  │                           │                       │                    │
  │                           │                       ├─ Compare password  │
  │                           │                       │                    │
  │                           │                       ├─ Check account     │
  │                           │                       │    status          │
  │                           │                       │                    │
  │                           │                       ├─ Generate JWT      │
  │                           │                       │    tokens          │
  │                           │                       │                    │
  │                           │←──────────────────────┤ Return tokens      │
  │                           │                       │                    │
  │                      (Format response)           │                    │
  │←──────────────────────────│                       │                    │
  │ 200 OK                    │                       │                    │
  │ { accessToken, refresh... }                      │                    │
  │                           │                       │                    │
```

---

## Authentication & Authorization Flow

```
REQUEST ARRIVES
      │
      ├─→ Is it a public route? (marked with markPublic)
      │   ├─ YES: Skip to Route Handler
      │   └─ NO: Continue...
      │
      ├─→ Extract Authorization Header
      │   └─ Bearer <token>
      │
      ├─→ Verify JWT Token
      │   ├─ Invalid: Return 401 Unauthorized
      │   ├─ Expired: Return 401 Token Expired
      │   └─ Valid: Continue...
      │
      ├─→ Decode Token → Get User ID
      │   └─ Load User from Database
      │
      ├─→ Check User Status
      │   ├─ ACTIVE: Continue...
      │   ├─ SUSPENDED: Return 403 Forbidden
      │   ├─ LOCKED: Return 423 Locked
      │   └─ PENDING: Return 403 Pending Approval
      │
      ├─→ Check Route requires RBAC?
      │   ├─ NO: Call Route Handler
      │   └─ YES: Check Permissions...
      │
      ├─→ Verify User Role Permission
      │   ├─ SUPER_ADMIN: All permissions
      │   ├─ Role in ROLE_PERMISSIONS: Check specific permissions
      │   └─ Permission denied: Return 403 Forbidden
      │
      └─→ Execute Route Handler
          └─ Success: Return 200 + Data
```

---

## Role-Based Access Control (RBAC) Hierarchy

```
┌──────────────────────────────────────────────────────┐
│              SUPER_ADMIN (Level 10)                  │
│  - All permissions                                   │
│  - Cannot be deleted or modified                     │
│  - System-level access                               │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│            HOSPITAL_ADMIN (Level 9)                  │
│  - User management (create, update, disable)         │
│  - Report generation                                 │
│  - System configuration                              │
│  - Audit log access                                  │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│           DEPARTMENT_HEAD (Level 8)                  │
│  - Staff management (doctor, nurse, lab tech)        │
│  - Medical records access                            │
│  - Report generation for department                  │
│  - Approval authority                                │
└──────────────────────────────────────────────────────┘
           ↓
        ┌──┴──┬──────────────┬──────────────┐
        │     │              │              │
    DOCTOR  NURSE       PHARMACIST    LAB_TECHNICIAN
    (Level 7) (Level 6)  (Level 5)        (Level 4)
        │     │              │              │
        └──┬──┴──┬───────────┴──────────────┘
           │     │
      ┌────┴─┬───┴─────┐
      │      │         │
  RECEPTIONIST  BILLING_STAFF  PATIENT
    (Level 3)    (Level 2)     (Level 1)
```

---

## Data Model Relationships

```
┌─────────────┐
│    USER     │ (Core authentication & identification)
├─────────────┤
│ _id         │
│ email       │
│ password    │
│ role        │
│ status      │
│ ... (many) fields
└──────┬──────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ↓              ↓              ↓              ↓
    PATIENT      APPOINTMENT    MEDICAL_RECORD    AUDIT_LOG
    (Profile)    (Scheduling)   (Clinical data)   (Tracking)
       │              │              │
       ├──────────┬───┘              │
       │          │                  │
       ↓          ↓                  ↓
    ALLERGY   VISIT          PRESCRIPTION
    INSURANCE  ADMISSION      DIAGNOSIS
    DEMO       DISCHARGE      LAB_ORDER
    EMRG_CONT  REMINDER       CONSULTATION

Relationships:
- Patient → 1:1 with User (userId)
- Appointment → N:1 with User (patientId, doctorId)
- MedicalRecord → N:1 with User (patientId, doctorId)
- Prescription → N:1 with User (patientId, doctorId)
- AuditLog → N:1 with User (userId)
```

---

## Data Flow for Medical Record Creation

```
DOCTOR/NURSE                    REQUEST
      │                            │
      ├─ Click "Create Record"    │
      │                            │
      └─ Fill form with:          │
         - Patient ID              │
         - Chief complaint         │
         - Vital signs             │
         - Diagnosis               │
         - Treatment plan          │
                                   │
                                   ├─ POST /api/medical-records
                                   │
                                   ├─ BACKEND PROCESSING:
                                   │  1. Extract data from request body
                                   │  2. Validate all required fields
                                   │  3. Check user permissions
                                   │  4. Verify patient exists
                                   │  5. Create record ID
                                   │  6. Generate timestamps
                                   │
                                   ├─ SAVE TO DATABASE
                                   │  db.medicalrecords.insertOne({
                                   │    recordId: "MR-2025-001",
                                   │    patientId: ObjectId(...),
                                   │    doctorId: ObjectId(...),
                                   │    visitDate: Date.now(),
                                   │    symptoms: [...],
                                   │    diagnoses: [...],
                                   │    treatmentPlan: {...},
                                   │    createdAt: Date.now(),
                                   │  })
                                   │
                                   ├─ LOG AUDIT EVENT
                                   │  db.auditlogs.insertOne({
                                   │    userId: ObjectId(...),
                                   │    action: "MEDICAL_RECORD_CREATE",
                                   │    resourceId: "MR-2025-001",
                                   │    timestamp: Date.now(),
                                   │  })
                                   │
                                   └─ RETURN RESPONSE
                                      201 Created
                                      { success: true, data: {...} }
                                   │
                                   ↓
DOCTOR/NURSE ←────────────────────┤
      │                            │
      └─ Show success message      │
         Display new record        │
```

---

## Security Layers

```
Request → Layer 1: Input Validation
            ├─ Check required fields
            ├─ Type validation
            ├─ Length validation
            ├─ Format validation (email, etc.)
            └─ Reject if invalid

Request → Layer 2: Sanitization
            ├─ Remove XSS attempts
            ├─ Escape special characters
            ├─ Normalize input
            └─ Safe for database

Request → Layer 3: Authentication
            ├─ Verify JWT token exists
            ├─ Validate token signature
            ├─ Check token expiry
            ├─ Extract user identity
            └─ Reject if invalid

Request → Layer 4: Authorization (RBAC)
            ├─ Load user role
            ├─ Load user permissions
            ├─ Check required permission
            ├─ Verify resource access
            └─ Reject if unauthorized

Request → Layer 5: Rate Limiting
            ├─ Count requests per IP
            ├─ Check against limits
            ├─ Block if exceeded
            └─ Allow otherwise

Request → Layer 6: Audit Logging
            ├─ Log who did what
            ├─ Log when it happened
            ├─ Log what changed
            ├─ Store securely
            └─ Maintain compliance

Request → Layer 7: Business Logic
            ├─ Execute service
            ├─ Update database
            ├─ Return result
            └─ Success!
```

---

## Docker Compose Architecture

```
┌────────────────────────────────────────────────────────┐
│           DOCKER COMPOSE NETWORK                       │
│        (healthcare-network, Bridge Mode)               │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐                                  │
│  │    MONGODB       │  (mongo:6.0-alpine)             │
│  ├──────────────────┤                                  │
│  │ Container:       │                                  │
│  │  healthcare_     │                                  │
│  │  mongodb         │                                  │
│  │                  │                                  │
│  │ Network:         │                                  │
│  │  mongodb:27017   │ (only accessible within network) │
│  │                  │                                  │
│  │ Host Port:       │                                  │
│  │  localhost:27017 │ (accessible from host machine)  │
│  │                  │                                  │
│  │ Volumes:         │                                  │
│  │  /data/db        │ (persistent data)               │
│  │  /data/configdb  │ (config data)                   │
│  │                  │                                  │
│  │ Health Check:    │                                  │
│  │  mongosh ping    │ (checks connection)             │
│  │                  │                                  │
│  └──────────────────┘                                  │
│         ▲                                               │
│         │ mongodb:27017                                │
│         │                                               │
│  ┌──────┴──────────┐                                   │
│  │    BACKEND      │  (node:18-alpine)                │
│  ├─────────────────┤                                   │
│  │ Container:      │                                   │
│  │  healthcare_    │                                   │
│  │  backend        │                                   │
│  │                 │                                   │
│  │ Port :5000      │ (API server)                      │
│  │                 │                                   │
│  │ Env Vars:       │                                   │
│  │  MONGO_URI=     │ mongodb://mongo:pw@mongodb:...   │
│  │  NODE_ENV=prod  │                                   │
│  │  PORT=5000      │                                   │
│  │                 │                                   │
│  │ Health Check:   │                                   │
│  │  /health        │ (HTTP check)                      │
│  │                 │                                   │
│  └─────┬───────────┘                                   │
│        │                                               │
│        ├─ localhost:5000 (accessible from host)        │
│        │                                               │
│        └──────────────┐                                │
│                       │                                │
│  ┌────────────────────┴───┐                            │
│  │     FRONTEND        │  (node:18-alpine)             │
│  ├─────────────────────┤                               │
│  │ Container:          │                               │
│  │  healthcare_        │                               │
│  │  frontend           │                               │
│  │                     │                               │
│  │ Port :3000          │ (Web app)                      │
│  │                     │                               │
│  │ Env Vars:           │                               │
│  │  VITE_API_URL=      │ http://localhost:5000/api    │
│  │                     │                               │
│  │ Health Check:       │                               │
│  │  HTTP :3000         │ (checks if running)           │
│  │                     │                               │
│  └─────┬───────────────┘                               │
│        │                                               │
│        └─ localhost:3000 (accessible from host)        │
│                       │                                │
│  ┌────────────────────┴───┐                            │
│  │      NGINX         │  (nginx:alpine)                │
│  ├─────────────────────┤                               │
│  │ Container:          │                               │
│  │  healthcare_        │                               │
│  │  nginx              │                               │
│  │                     │                               │
│  │ Port :80            │ (HTTP)                        │
│  │ Port :443           │ (HTTPS future)                │
│  │                     │                               │
│  │ Config:             │                               │
│  │  /api → backend     │ (proxy pass)                  │
│  │  / → frontend       │ (static files)                │
│  │                     │                               │
│  │ Health Check:       │                               │
│  │  HTTP :80           │ (checks status)               │
│  │                     │                               │
│  └─────────────────────┘                               │
│        │                                               │
│        └─ localhost:80 (accessible from host)          │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## Common Data Flows

### Flow 1: Patient Schedules Appointment

```
1. Patient navigates to "Book Appointment"
2. Selects doctor and date/time
3. Submits form → POST /api/appointments
4. Backend:
   - Validates appointment data
   - Checks doctor availability
   - Creates appointment record
   - Sends email notification
   - Logs action (audit)
5. Returns appointment confirmation
6. Frontend shows confirmation
7. Appointment appears in both calendars
```

### Flow 2: Doctor Creates Medical Record

```
1. Doctor selects patient
2. Fills in:
   - Chief complaint
   - Vital signs
   - Physical exam findings
   - Diagnosis
   - Treatment plan
3. Submits → POST /api/medical-records
4. Backend:
   - Validates all data
   - Generates record ID
   - Saves to database
   - Creates audit log
   - Updates patient timeline
5. Medical record saved
6. Patient can view in portal
7. Generates compliance report
```

### Flow 3: Pharmacist Dispenses Medication

```
1. Pharmacist views pending prescriptions
2. Receives request for medication
3. Verifies:
   - Patient identity
   - Prescription validity
   - Drug interactions
   - Allergies
4. Updates → PUT /api/prescriptions/:id
5. Backend:
   - Logs dispense action
   - Updates inventory
   - Records timestamp
   - Sends notification
6. Medication dispensed
7. Patient receives with instructions
```

---

**Last Updated:** 2025-11-29  
**Diagrams Generated:** Complete Architecture Visualization
