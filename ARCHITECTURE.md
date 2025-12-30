# 📊 APPOINTMENT SYSTEM - ARCHITECTURE & DIAGRAMS

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEALTHCARE SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   USER INTERFACE LAYER                     │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  Patient Portal          Admin Portal        Doctor Portal│   │
│  │  ├─ Appointments    ├─ Appointments List    ├─ Schedule │   │
│  │  ├─ Create Appt     ├─ Today Appts         ├─ Appts   │   │
│  │  ├─ View Details    ├─ Upcoming Appts      └─ Complete│   │
│  │  ├─ Reschedule      ├─ Available Slots       Appointments│   │
│  │  └─ Request Cancel  ├─ Statistics                       │   │
│  │                     ├─ Schedule Mgmt                     │   │
│  │                     ├─ Reminders                         │   │
│  │                     ├─ Export Data                       │   │
│  │                     └─ Audit Logs                        │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ▲                                      │
│                            │                                      │
│                  API Calls (REST/HTTP)                            │
│                            │                                      │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   API LAYER                               │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  appointmentAPI.js (API Integration)                      │   │
│  │  ├─ CRUD Operations                                       │   │
│  │  ├─ Status Management                                    │   │
│  │  ├─ Schedule Management                                  │   │
│  │  ├─ Filtering & Search                                   │   │
│  │  ├─ Reminders                                            │   │
│  │  ├─ Statistics                                           │   │
│  │  └─ Export & Audit                                       │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ▲                                      │
│                            │                                      │
│                  axios (HTTP Client)                              │
│                            │                                      │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 BACKEND API SERVER                         │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  appointmentController.js / appointmentService.js         │   │
│  │  appointmentModel.js (MongoDB)                            │   │
│  │                                                            │   │
│  │  Endpoints: GET, POST, PUT, PATCH, DELETE                │   │
│  │  + Filtering, Statistics, Export, Audit Logging          │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ▲                                      │
│                            │                                      │
│                         SQL/ORM                                   │
│                            │                                      │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   DATABASE LAYER                           │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  MongoDB Collections:                                      │   │
│  │  ├─ appointments                                          │   │
│  │  ├─ users (patients, doctors)                            │   │
│  │  ├─ doctor_schedules                                      │   │
│  │  ├─ audit_logs                                           │   │
│  │  └─ notifications                                         │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 DATA FLOW

### Creating an Appointment

```
┌──────────────┐
│ Patient      │
│ Clicks       │
│ Create Appt  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│ CreateAppointmentPage Component   │
│ - Form Validation                 │
│ - Load Departments & Doctors      │
│ - Fetch Available Slots           │
└──────┬───────────────────────────┘
       │
       ├──▶ GET /doctors
       │
       ├──▶ GET /available-slots
       │
       ▼
┌──────────────────────────────────┐
│ User Reviews & Selects            │
│ - Department                       │
│ - Doctor                          │
│ - Date & Time                     │
│ - Reason for visit                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ POST /appointments                │
│ {                                 │
│   doctorId,                       │
│   appointmentDate,                │
│   reason,                         │
│   patientId                       │
│ }                                 │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Backend Validation                │
│ - User exists                     │
│ - Doctor exists                   │
│ - Time slot available             │
│ - No conflicts                    │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Save to Database                  │
│ - Create appointment record       │
│ - Log audit trail                 │
│ - Set status: PENDING             │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Response to Frontend               │
│ {                                 │
│   success: true,                  │
│   appointmentId: "xxx",           │
│   status: "PENDING"               │
│ }                                 │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Show Success Message               │
│ Redirect to:                      │
│ /patient/appointments             │
└──────────────────────────────────┘
```

---

## 🔀 PAGE RELATIONSHIPS

```
APPOINTMENT MANAGEMENT SYSTEM
│
├─ /admin/appointments (Main List)
│  │
│  ├─ /admin/appointments/today (Quick Access)
│  │  ├─ Check-in ─────┐
│  │  ├─ Complete ─────┤
│  │  └─ No-show ──────┤
│  │                   │
│  ├─ /admin/appointments/upcoming (Planning)
│  │  ├─ Send Reminder
│  │  ├─ Reschedule
│  │  └─ View Detail
│  │
│  ├─ /admin/appointments/available-slots (Booking)
│  │  └─ Create Appointment ──┐
│  │                          │
│  ├─ /admin/appointments/:id (Detail View)
│  │  ├─ Confirm ────────────┘
│  │  ├─ Cancel
│  │  ├─ Reschedule ─────┐
│  │  ├─ View Logs       │
│  │  └─ Edit            │
│  │                     │
│  ├─ /admin/appointments/:id/reschedule ─┘
│  │  └─ Update appointment
│  │
│  ├─ /admin/appointments/:id/logs (Audit)
│  │  └─ View access history
│  │
│  ├─ /admin/appointments/stats (Analytics)
│  │  └─ View charts & metrics
│  │
│  ├─ /admin/appointments/schedule-management (Config)
│  │  └─ Manage doctor work schedules
│  │
│  ├─ /admin/appointments/reminders (Communication)
│  │  └─ Send bulk reminders
│  │
│  └─ /admin/appointments/export (Reporting)
│     └─ Export to PDF/Excel
│
└─ PATIENT PORTAL
   ├─ /patient/appointments (My Appointments)
   │  ├─ View
   │  ├─ Cancel Request
   │  └─ View Details
   │
   ├─ /patient/create-appointment (Booking)
   │  └─ New appointment
   │
   └─ /doctor/appointments (Doctor's View)
      ├─ View Today
      ├─ View Upcoming
      └─ Complete with Diagnosis
```

---

## 📊 STATE MANAGEMENT FLOW

```
Component State:
┌────────────────────────────────────────────┐
│                                             │
│  appointments: []        ◄──── API Calls    │
│  loading: boolean                           │
│  filters: {                                │
│    status: string,                         │
│    doctorId: string,                       │
│    search: string                          │
│  }                                          │
│  pagination: {                             │
│    current: number,                        │
│    pageSize: number,                       │
│    total: number                           │
│  }                                          │
│                                             │
└────────────────────────────────────────────┘
        │
        ├─ onChange ─────▶ API Call ─────▶ Update State
        │
        ├─ onFilter ─────▶ API Call ─────▶ Update State
        │
        └─ onPaginate ───▶ API Call ─────▶ Update State
```

---

## 🔐 AUTHORIZATION FLOW

```
┌─────────────────────┐
│  User Logs In       │
│  (JWT Token)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│ Token stored in:            │
│ - localStorage              │
│ - axios default headers     │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ User navigates to page:     │
│ /admin/appointments         │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ ProtectedRoute checks:      │
│ - Token valid?              │
│ - Role allowed?             │
└──────┬─────────────┬────────┘
       │ YES         │ NO
       │             │
       ▼             ▼
   Access       Redirect to
   Granted      /login
       │
       ▼
┌─────────────────────────────┐
│ API Call with token:        │
│ GET /appointments           │
│ Headers: {                  │
│   Authorization: "Bearer xxx"
│ }                           │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Backend validates token:    │
│ - Decode token              │
│ - Verify signature          │
│ - Check expiration          │
└──────┬─────────────┬────────┘
       │ Valid       │ Invalid
       │             │
       ▼             ▼
   Process       Return 401
   Request       Unauthorized
       │
       ▼
┌─────────────────────────────┐
│ Backend checks permission:  │
│ - User role vs API role     │
│ - User owns data?           │
│ - Audit log access          │
└──────┬─────────────┬────────┘
       │ Allowed     │ Denied
       │             │
       ▼             ▼
   Return       Return 403
   Data         Forbidden
```

---

## 🎬 APPOINTMENT LIFECYCLE

```
┌──────────────┐
│   PENDING    │ ◄── Created by Patient/Receptionist
└──────┬───────┘
       │
       │ Receptionist confirms
       ▼
┌──────────────┐
│ CONFIRMED    │ ◄── Ready for appointment
└──────┬───────┘
       │
       ├─────────────────────┬──────────────────┐
       │                     │                  │
    Check-in             Cancel            Reschedule
       │                     │                  │
       ▼                     ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ CHECKED_IN   │ │   CANCELLED  │ │ RESCHEDULED  │
└──────┬───────┘ └──────────────┘ └──┬───────────┘
       │                               │
       │ Doctor starts exam            │ Back to CONFIRMED
       ▼                               ▼
┌──────────────┐                  ┌──────────────┐
│ IN_PROGRESS  │                  │ CONFIRMED    │
└──────┬───────┘                  └──────────────┘
       │
       ├──────────────┬─────────────┐
       │              │             │
    Complete      No-show       Cancel
       │              │             │
       ▼              ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ COMPLETED    │ │   NO_SHOW    │ │   CANCELLED  │
└──────────────┘ └──────────────┘ └──────────────┘
       │              │             │
       └──────────────┴─────────────┘
              │
              ▼
    ┌──────────────────┐
    │  END OF LIFECYCLE │
    │  In history/past  │
    └──────────────────┘
```

---

## 📈 SCALABILITY ARCHITECTURE

```
CURRENT ARCHITECTURE
┌─────────────────────────────────┐
│      React Frontend (SPA)        │ 1 Instance
├─────────────────────────────────┤
│  API Server (Node.js/Express)   │ 1 Instance
├─────────────────────────────────┤
│  MongoDB Database               │ 1 Instance
└─────────────────────────────────┘

FUTURE SCALABLE ARCHITECTURE
┌─────────────────────────────────┐
│   CDN (Static assets)           │
├─────────────────────────────────┤
│   Load Balancer                 │
├─────────────────────────────────┤
│   React Frontend                │ Multiple
│   (Distributed)                 │ Instances
├─────────────────────────────────┤
│   API Server                    │ Multiple
│   (Cluster)                     │ Instances
├─────────────────────────────────┤
│   Cache Layer (Redis)           │
├─────────────────────────────────┤
│   MongoDB Replica Set           │ Multiple
│                                 │ Instances
├─────────────────────────────────┤
│   Message Queue (RabbitMQ)      │ For async
│                                 │ operations
└─────────────────────────────────┘
```

---

## 🧬 COMPONENT COMPOSITION

```
AppointmentsList.jsx
├─ AdminLayout
├─ Components
│  ├─ Table (Ant Design)
│  ├─ Select (Filter)
│  ├─ Input (Search)
│  ├─ Button (Actions)
│  ├─ Modal (Confirm dialogs)
│  ├─ Message (Toast notifications)
│  └─ Skeleton (Loading)
└─ Data
   ├─ State: appointments, filters, pagination
   ├─ API: getAppointments, cancelAppointment, etc.
   └─ Handlers: handleFilter, handleCancel, etc.

AppointmentCard.jsx (Reusable)
├─ Tag (Status indicator)
├─ Card (Container)
├─ Row/Col (Layout)
├─ Button (Actions)
├─ Divider (Separator)
└─ Props
   ├─ appointment (data)
   ├─ onDetail (click handler)
   ├─ actionButtons (array)
   └─ loading (boolean)

AppointmentForm.jsx (Reusable)
├─ Form (Ant Design)
├─ Inputs
│  ├─ Select (Doctor)
│  ├─ DatePicker (Date)
│  ├─ Select (Time)
│  └─ TextArea (Reason)
├─ Validations
│  ├─ Required fields
│  ├─ Date validation
│  └─ Reason length check
└─ Props
   ├─ form (FormInstance)
   ├─ initialData (for edit)
   ├─ mode (create/edit/reschedule)
   └─ onSubmit (callback)
```

---

## 🔌 API INTEGRATION PATTERN

```
Component.jsx
    │
    ├─ useEffect() {
    │   fetchData()
    │ }
    │
    ▼
appointmentAPI.js
    │
    ├─ getAppointments(params)
    │   └─ axios.get('/api/appointments', { params })
    │
    ├─ createAppointment(data)
    │   └─ axios.post('/api/appointments', data)
    │
    ├─ updateAppointment(id, data)
    │   └─ axios.put(`/api/appointments/${id}`, data)
    │
    └─ ... other endpoints
    │
    ▼
axios instance
    │
    ├─ Base URL configuration
    ├─ Default headers (Auth token)
    ├─ Interceptors (request/response)
    └─ Error handling
    │
    ▼
HTTP Request
    │
    ├─ GET /api/appointments
    ├─ POST /api/appointments
    ├─ PUT /api/appointments/:id
    ├─ PATCH /api/appointments/:id/...
    └─ DELETE /api/appointments/:id
    │
    ▼
Backend API Server
    │
    ├─ Route middleware
    ├─ Authentication check
    ├─ Authorization check
    ├─ Request validation
    ├─ Business logic
    ├─ Database operations
    ├─ Audit logging
    └─ Response formatting
    │
    ▼
Response (JSON)
    │
    ├─ status: 200/400/401/403/500
    ├─ data: { ... }
    └─ message: "..."
    │
    ▼
Component.jsx
    │
    ├─ setData(response.data)
    ├─ Show success message
    └─ Update UI
```

---

## 🌐 RESPONSIVE BREAKPOINTS

```
MOBILE (320px - 767px)
└─ Stacked layout
└─ Full-width inputs
└─ Touch-friendly buttons
└─ Horizontal scroll tables

TABLET (768px - 1023px)
└─ 2-column layout
└─ Optimized grid
└─ Horizontal scroll tables
└─ Sticky headers

DESKTOP (1024px+)
└─ Multi-column layout
└─ Full tables visible
└─ Hover effects
└─ Side panels
```

---

## 💾 DATABASE SCHEMA (MongoDB)

```
appointments
├─ _id: ObjectId
├─ patientId: ObjectId (ref: users)
├─ doctorId: ObjectId (ref: users)
├─ appointmentDate: DateTime
├─ status: Enum [PENDING, CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
├─ reason: String
├─ notes: String (optional)
├─ diagnosis: String (optional, after completion)
├─ prescription: ObjectId (ref: prescriptions, optional)
├─ createdAt: DateTime
├─ updatedAt: DateTime
└─ createdBy: ObjectId (ref: users)

doctor_schedules
├─ _id: ObjectId
├─ doctorId: ObjectId (ref: users)
├─ dayOfWeek: Enum [MONDAY, TUESDAY, ..., SUNDAY]
├─ startTime: Time
├─ endTime: Time
├─ createdAt: DateTime
└─ updatedAt: DateTime

audit_logs
├─ _id: ObjectId
├─ entityType: String (appointment)
├─ entityId: ObjectId
├─ action: String (CREATE, VIEW, UPDATE, DELETE)
├─ userId: ObjectId (ref: users)
├─ userName: String
├─ userRole: String
├─ metadata: Object
├─ ipAddress: String
├─ timestamp: DateTime
└─ changes: Array (fields changed)
```

---

**Version: 1.0.0**  
**Last Updated: 2024-12-30**
