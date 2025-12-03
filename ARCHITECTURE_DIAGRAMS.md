# 📊 APPOINTMENT BOOKING - Architecture & Flow Diagrams

## 1️⃣ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Patient Dashboard Component                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  [Lịch hẹn Tab]                                         │  │
│  │  ├─ [Làm tươi Button]                                  │  │
│  │  └─ [➕ Đặt Lịch Hẹn Button] ◄─────┐                  │  │
│  │      │                              │                  │  │
│  │      │                              │                  │  │
│  │      ▼                              │                  │  │
│  │  ┌────────────────────────────────┐│                  │  │
│  │  │ BookingAppointmentModal        ││                  │  │
│  │  ├────────────────────────────────┤│                  │  │
│  │  │                                ││                  │  │
│  │  │ Step 1: Select Doctor          ││                  │  │
│  │  │ ├─ [Doctor 1] [Doctor 2]      ││                  │  │
│  │  │ └─ [→ Next]                    ││                  │  │
│  │  │                                ││                  │  │
│  │  │ Step 2: Book Appointment       ││                  │  │
│  │  │ ├─ DatePicker                  ││                  │  │
│  │  │ ├─ Time Slots                  ││                  │  │
│  │  │ ├─ Appointment Type            ││                  │  │
│  │  │ ├─ Reason                      ││                  │  │
│  │  │ ├─ Notes                       ││                  │  │
│  │  │ └─ [Đặt Lịch]                  ││                  │  │
│  │  │                                ││                  │  │
│  │  └────────────────────────────────┘│                  │  │
│  │                                    │                  │  │
│  │  [Table: Existing Appointments]    │                  │  │
│  │  ├─ Doctor | Date | Reason | Status                  │  │
│  │  └─ (Updated after booking)                           │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │ (API Calls)
                            │
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │ Routes              │  │ Controllers         │              │
│  ├─────────────────────┤  ├─────────────────────┤              │
│  │ GET /users/doctors  │──▶│ user.controller.js  │              │
│  │                     │  │ ▶ getDoctors()      │              │
│  │ GET /appointments/  │  │                     │              │
│  │  available-slots    │──▶│ appointments.       │              │
│  │  :doctorId          │  │ controller.js       │              │
│  │                     │  │ ▶ getAvailableSlots │              │
│  │ POST /appointments  │  │                     │              │
│  │                     │──▶│ ▶ bookAppointment() │              │
│  └─────────────────────┘  └─────────────────────┘              │
│           ▲                        │                           │
│           │                        ▼                           │
│           │              ┌──────────────────┐                 │
│           │              │ Services         │                 │
│           │              ├──────────────────┤                 │
│           └──────────────▶│ user.service.js  │                 │
│                           │ appointment.     │                 │
│                           │ service.js       │                 │
│                           └──────────────────┘                 │
│                                    │                           │
│                                    ▼                           │
│                           ┌──────────────────┐                 │
│                           │ Database         │                 │
│                           ├──────────────────┤                 │
│                           │ MongoDB:         │                 │
│                           │ ├─ User (Doctor) │                 │
│                           │ └─ Appointment   │                 │
│                           └──────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Request/Response Flow

```
SEQUENCE DIAGRAM: Patient Books Appointment

Patient                 Frontend              Backend              Database
  │                       │                     │                    │
  │ Click "Đặt Lịch Hẹn"  │                     │                    │
  ├──────────────────────▶│                     │                    │
  │                       │                     │                    │
  │                       │ GET /users/doctors  │                    │
  │                       ├────────────────────▶│                    │
  │                       │                     │ Query Users        │
  │                       │                     │ (role="DOCTOR")    │
  │                       │                     ├───────────────────▶│
  │                       │                     │◀───────────────────┤
  │                       │◀────────────────────┤ [Doctor Array]     │
  │                       │ [Doctor Array]      │                    │
  │ Display Doctors       │                     │                    │
  │◀──────────────────────┤                     │                    │
  │ Select Doctor         │                     │                    │
  ├──────────────────────▶│                     │                    │
  │                       │ GET /available-     │                    │
  │                       │ slots/:doctorId     │                    │
  │                       ├────────────────────▶│                    │
  │                       │                     │ Query Appointments │
  │                       │                     │ (doctor, date)     │
  │                       │                     ├───────────────────▶│
  │                       │                     │◀───────────────────┤
  │                       │◀────────────────────┤ [Time Slots]       │
  │                       │ [Time Slots]        │                    │
  │ Display Time Slots    │                     │                    │
  │◀──────────────────────┤                     │                    │
  │ Select Date & Time    │                     │                    │
  │ Fill Form             │                     │                    │
  ├──────────────────────▶│                     │                    │
  │                       │ POST /appointments  │                    │
  │                       ├────────────────────▶│                    │
  │                       │                     │ Validate Data      │
  │                       │                     │ Check Conflict     │
  │                       │                     │ Create Record      │
  │                       │                     ├───────────────────▶│
  │                       │                     │ INSERT Appointment │
  │                       │                     │◀───────────────────┤
  │                       │◀────────────────────┤ Success            │
  │                       │ {appointmentId}     │                    │
  │ Success Message       │                     │                    │
  │◀──────────────────────┤                     │                    │
  │ Modal Closes          │                     │                    │
  │ Dashboard Refresh     │                     │                    │
  ├──────────────────────▶│                     │                    │
  │                       │ GET /appointments   │                    │
  │                       ├────────────────────▶│                    │
  │                       │                     │ Query Appointments │
  │                       │                     │ (patient)          │
  │                       │                     ├───────────────────▶│
  │                       │                     │◀───────────────────┤
  │                       │◀────────────────────┤ [Appointments]     │
  │                       │ [Appointments]      │                    │
  │ View New Booking      │                     │                    │
  │◀──────────────────────┤                     │                    │
  │                       │                     │                    │
```

---

## 3️⃣ Component State Management

```
Patient Dashboard Component State
│
├─ collapsed: boolean
│  └─ Controls sidebar collapse
│
├─ loading: boolean
│  └─ Global loading state
│
├─ selectedKey: string
│  └─ Current selected tab
│
├─ appointments: Array
│  ├─ Fetched from API
│  └─ Displayed in table
│
├─ prescriptions: Array
│  └─ Fetched from API
│
├─ labResults: Array
│  └─ Fetched from API
│
├─ stats: Object
│  ├─ upcomingAppointments
│  ├─ completedAppointments
│  ├─ activePrescriptions
│  └─ pendingLabResults
│
├─ appointmentPagination: Object
│  ├─ current: number
│  ├─ pageSize: number
│  └─ total: number
│
├─ prescriptionPagination: Object
│  └─ Similar to appointmentPagination
│
└─ bookingModalVisible: boolean ✨ NEW
   └─ Controls BookingAppointmentModal visibility


BookingAppointmentModal Component State
│
├─ form: FormInstance (Ant Design)
│  └─ Form data & validation
│
├─ loading: boolean
│  └─ API call loading state
│
├─ doctors: Array
│  ├─ Fetched from GET /users/doctors
│  └─ Displayed in step 1
│
├─ selectedDoctor: Object
│  └─ Currently selected doctor
│
├─ availableSlots: Array
│  ├─ Fetched from GET /available-slots/:doctorId
│  └─ Displayed as buttons in step 2
│
├─ selectedDate: Date
│  └─ Currently selected date
│
├─ loadingSlots: boolean
│  └─ Loading state for slots
│
└─ step: number (1 or 2)
   ├─ Step 1: Doctor selection
   └─ Step 2: Appointment details
```

---

## 4️⃣ API Call Sequence

```
TIMELINE: API Calls During Booking

┌──────────────────────────────────────────────────────────────────┐
│                         Time                                     │
│ ────────────────────────────────────────────────────────────────▶ │
└──────────────────────────────────────────────────────────────────┘

T0: Modal Opens
├─ GET /api/users/doctors
│  └─ Response: [Doctor1, Doctor2, Doctor3]
│     ⏱️ 500ms

T1: User Selects Doctor & Date
├─ GET /api/patient-portal/appointments/available-slots/:doctorId
│  ├─ Query: ?appointmentDate=2024-12-10
│  └─ Response: [{time: "09:00"}, {time: "09:30"}, ...]
│     ⏱️ 300ms

T2: User Fills Form & Submits
├─ POST /api/patient-portal/appointments
│  ├─ Body: {doctorId, appointmentDate, appointmentTime, reason, ...}
│  └─ Response: {_id, appointmentId, status: "SCHEDULED"}
│     ⏱️ 400ms

T3: Success + Modal Close + Refresh
├─ Modal closes (Client side)
├─ Call loadDashboardData()
│  ├─ GET /api/patient-portal/appointments
│  │  └─ Response: [Updated appointments list]
│  ├─ GET /api/patient-portal/prescriptions
│  └─ GET /api/patient-portal/lab-results
│     ⏱️ 800ms total

Total Time: ~2-3 seconds
```

---

## 5️⃣ Database Schema Relationships

```
┌────────────────────────────────────┐
│          User Collection           │
├────────────────────────────────────┤
│ _id: ObjectId                      │
│ name: String                       │
│ email: String                      │
│ role: String  ◄─────┐              │
│ ├─ "DOCTOR"        │              │
│ ├─ "PATIENT"       │              │
│ └─ ...             │              │
│ isActive: Boolean  │              │
│ specialization: String             │
└────────────────────────────────────┘
            ▲                    ▲
            │                    │
    ┌───────┘                    │
    │                    ┌───────┘
    │                    │
┌─────────────────────────────────────────────────────┐
│         Appointment Collection                      │
├─────────────────────────────────────────────────────┤
│ _id: ObjectId                                       │
│ appointmentId: String                              │
│ patientId: ObjectId  (References User)             │
│ doctorId: ObjectId   (References User)             │
│ appointmentDate: Date                              │
│ appointmentTime: String                            │
│ duration: Number (minutes)                         │
│ type: String (CONSULTATION, FOLLOW_UP, ...)        │
│ mode: String (IN_PERSON, TELEMEDICINE, PHONE)      │
│ location: String                                    │
│ room: String                                        │
│ reason: String                                      │
│ description: String                                 │
│ symptoms: [String]                                 │
│ status: String ┐                                    │
│  ├─ SCHEDULED  │                                    │
│  ├─ CONFIRMED  │ ─┐                                 │
│  ├─ COMPLETED  │  │ State Machine                   │
│  ├─ CANCELLED  │  │                                 │
│  └─ NO_SHOW    │ ─┘                                 │
│ createdAt: Date                                     │
│ updatedAt: Date                                     │
│ createdBy: ObjectId (References User)              │
└─────────────────────────────────────────────────────┘
```

---

## 6️⃣ Validation Flow

```
VALIDATION PIPELINE

User Input (Frontend)
│
├─1️⃣ Form Field Validation (Ant Design)
│   ├─ Required checks
│   ├─ Date validation (future dates only)
│   ├─ Time pattern validation
│   └─ Max length validation
│   
│   If Invalid ❌
│   └─ Show error message under field
│   
│   If Valid ✅
│   ▼
│
├─2️⃣ Modal-Level Validation
│   ├─ Doctor selected?
│   ├─ Date selected?
│   ├─ Time selected?
│   └─ Enable/disable submit button
│   
│   ▼
│
├─3️⃣ API Request (Backend)
│   │
│   ├─4️⃣ Authentication Check
│   │   └─ JWT token valid?
│   │
│   ├─5️⃣ Joi Schema Validation
│   │   ├─ doctorId: required string
│   │   ├─ appointmentDate: required date
│   │   ├─ appointmentTime: required pattern
│   │   ├─ reason: required, max 500 chars
│   │   └─ type: valid enum value
│   │
│   │   If Invalid ❌
│   │   └─ Return 400 Validation Error
│   │
│   │   If Valid ✅
│   │   ▼
│   │
│   ├─6️⃣ Business Logic Validation
│   │   ├─ Doctor exists & active?
│   │   ├─ Doctor role is DOCTOR?
│   │   ├─ Patient exists & active?
│   │   ├─ Appointment date > now?
│   │   ├─ Time slot available?
│   │   └─ No conflicting appointments?
│   │
│   │   If Any Check Fails ❌
│   │   └─ Return 400 AppError with message
│   │
│   │   If All Checks Pass ✅
│   │   ▼
│   │
│   └─7️⃣ Create Appointment
│       └─ Save to database
│
│   Response
│   ├─ Success ✅: {appointmentId, status: "SCHEDULED"}
│   └─ Error ❌: {error: "Description"}
│
│   ▼
│
└─8️⃣ Frontend Response Handling
    ├─ Success ✅
    │  ├─ Show success message
    │  ├─ Close modal
    │  └─ Refresh dashboard
    │
    └─ Error ❌
       └─ Show error message to user
```

---

## 7️⃣ Time Slot Generation Algorithm

```
ALGORITHM: Generate Available Time Slots

Input:
  - doctorId: String
  - appointmentDate: String (YYYY-MM-DD)

Process:

1. Define Constants
   ├─ workStartHour = 9    // 9 AM
   ├─ workEndHour = 17     // 5 PM
   └─ slotDuration = 30    // 30 minutes

2. Generate All Possible Slots
   ├─ For hour = 9 to 16:
   │  └─ For minute = 0, 30:
   │     └─ Add time "HH:MM" to allSlots
   └─ Result: 16 slots total (9:00, 9:30, ..., 16:30)

3. Query Database
   ├─ Find all appointments where:
   │  ├─ doctorId = input doctorId
   │  ├─ appointmentDate = input date
   │  └─ status ∈ [SCHEDULED, CONFIRMED]
   └─ Get booked times from results

4. Filter Available Slots
   ├─ For each slot in allSlots:
   │  └─ If slot NOT in bookedTimes:
   │     └─ Add to availableSlots
   └─ Result: Array of available time slots

5. Return Response
   └─ availableSlots array

Example Output:
[
  { time: "09:00", available: true },
  { time: "09:30", available: true },
  { time: "10:30", available: true },  // 10:00 is booked
  ...
]
```

---

## 8️⃣ Error Handling Flow

```
ERROR HANDLING HIERARCHY

┌─────────────────────────────┐
│ Frontend Error              │
├─────────────────────────────┤
│                             │
│ Try/Catch Block             │
│   │                         │
│   ├─ Network Error          │
│   │  └─ "Không kết nối tới server"
│   │                         │
│   ├─ Validation Error       │
│   │  └─ "Vui lòng điền tất cả thông tin"
│   │                         │
│   ├─ API Error (4xx, 5xx)   │
│   │  └─ Display response.data.message
│   │                         │
│   └─ Timeout Error          │
│      └─ "Yêu cầu hết hạn"
│                             │
│ Display to User via message │
│   ├─ message.error(msg)     │
│   ├─ message.warning(msg)   │
│   └─ message.info(msg)      │
│                             │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Backend Error               │
├─────────────────────────────┤
│                             │
│ Try/Catch Block             │
│   │                         │
│   ├─ Auth Error             │
│   │  └─ throw 401 Unauthorized
│   │                         │
│   ├─ Validation Error       │
│   │  └─ throw 400 AppError
│   │                         │
│   ├─ Doctor Not Found       │
│   │  └─ throw 404 AppError
│   │                         │
│   ├─ Conflict              │
│   │  └─ throw 400 AppError
│   │                         │
│   ├─ Database Error         │
│   │  └─ throw 500 Server Error
│   │                         │
│   └─ Unexpected Error       │
│      └─ throw 500 Server Error
│                             │
│ Middleware catches error    │
│ and sends error response    │
│                             │
└─────────────────────────────┘
```

---

## 9️⃣ State Transitions (Appointment Status)

```
APPOINTMENT STATUS STATE MACHINE

       ┌─────────────┐
       │  SCHEDULED  │  (Initial state when booked)
       └──────┬──────┘
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
 ┌──────────┐  ┌──────────┐
 │CONFIRMED │  │CANCELLED │  (Patient or doctor cancel)
 └─────┬────┘  └──────────┘
       │
       ▼
 ┌──────────────┐
 │ IN_PROGRESS  │  (Doctor starts appointment)
 └─────┬────────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
 ┌──────────┐         ┌────────┐
 │COMPLETED │         │NO_SHOW │  (Patient didn't show up)
 └──────────┘         └────────┘

Legend:
✓ SCHEDULED  = Booking confirmed, waiting for appointment
✓ CONFIRMED  = Doctor confirmed availability
✓ IN_PROGRESS = Appointment is ongoing
✓ COMPLETED  = Appointment finished
✓ CANCELLED  = Appointment cancelled
✓ NO_SHOW    = Patient didn't attend
```

---

## 🔟 Module Dependencies

```
DEPENDENCY GRAPH

BookingAppointmentModal.jsx
├─ antd components
│  ├─ Modal, Form, Input, DatePicker, Select, Button
│  └─ Tag, Card, Empty, Alert, Row, Col, Spin
│
├─ axios (HTTP client)
│
├─ dayjs (Date manipulation)
│
└─ API Endpoints
   ├─ GET /api/users/doctors
   ├─ GET /api/patient-portal/appointments/available-slots/:doctorId
   └─ POST /api/patient-portal/appointments


Patient/Dashboard.jsx
├─ BookingAppointmentModal (imported)
├─ axios
├─ antd components
├─ react-router-dom
└─ AuthContext (for user & token)


Backend Routes
├─ user.routes.js
│  └─ GET /doctors ──▶ user.controller.getDoctors()
│
└─ patientPortal/appointments.routes.js
   ├─ GET /available-slots/:doctorId ──▶ getAvailableSlots()
   └─ POST / ──▶ bookAppointment()


Backend Controllers
├─ user.controller.getDoctors()
│  └─ user.service.listUsers() ──▶ User.find()
│
└─ appointments.controller.bookAppointment()
   ├─ Appointment.create()
   └─ appointmentService.bookAppointment()
```

---

**End of Architecture Documentation**

*For implementation details, refer to APPOINTMENT_BOOKING_GUIDE.md*
