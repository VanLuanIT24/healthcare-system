# 🚀 QUICK START - Chức Năng Đặt Lịch Hẹn

## ⚡ 5 Phút Setup

### 1️⃣ Backend Setup

```bash
# Đảm bảo đã thêm 2 phương thức vào controllers:

# ✅ user.controller.js (dòng 160-192)
async getDoctors(req, res, next) { ... }

# ✅ appointments.controller.js (dòng 372-420)
static async getAvailableSlots(req, res, next) { ... }
```

### 2️⃣ Frontend Setup

```bash
# ✅ Tạo component: BookingAppointmentModal.jsx
src/components/BookingAppointmentModal.jsx

# ✅ Update Patient/Dashboard.jsx
- Import component
- Add state
- Add button
- Add modal JSX
```

### 3️⃣ Verify Routes

```javascript
// ✅ Backend Routes Setup

// user.routes.js (dòng ~75)
router.get("/doctors", userController.getDoctors);

// patientPortal/appointments.routes.js (dòng ~58)
router.get(
  "/available-slots/:doctorId",
  verifyAuth,
  AppointmentsController.getAvailableSlots
);

// patientPortal/appointments.routes.js (dòng ~71)
router.post(
  "/",
  verifyAuth,
  validateRequest(bookAppointmentSchema),
  AppointmentsController.bookAppointment
);
```

---

## 📂 File Changes Overview

### NEW FILES (2)

```
✅ healthcare-frontend/src/components/BookingAppointmentModal.jsx
✅ APPOINTMENT_BOOKING_GUIDE.md
✅ CHANGES_SUMMARY.md
```

### MODIFIED FILES (3)

```
✅ healthcare-frontend/src/pages/Patient/Dashboard.jsx
✅ healthcare-backend/src/controllers/user.controller.js
✅ healthcare-backend/src/routes/user.routes.js
✅ healthcare-backend/src/routes/patientPortal/appointments.routes.js
```

---

## 🧪 Quick Test

```bash
# Terminal 1: Backend
cd healthcare-backend
npm run dev

# Terminal 2: Frontend
cd healthcare-frontend
npm run dev

# Browser: http://localhost:3000
# 1. Login as patient
# 2. Go to Dashboard → Lịch hẹn tab
# 3. Click "Đặt Lịch Hẹn"
# 4. Select doctor → Select date → Select time
# 5. Fill form → Submit
# 6. See success message
```

---

## 🔗 API Endpoints

| Method | Endpoint                                                                          | Purpose          |
| ------ | --------------------------------------------------------------------------------- | ---------------- |
| GET    | `/api/users/doctors`                                                              | Get doctors list |
| GET    | `/api/patient-portal/appointments/available-slots/:doctorId?appointmentDate=DATE` | Get time slots   |
| POST   | `/api/patient-portal/appointments`                                                | Book appointment |

---

## 📝 Request/Response Examples

### Get Doctors

```bash
curl -X GET "http://localhost:5000/api/users/doctors" \
  -H "Authorization: Bearer TOKEN"
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "65a4b2c...",
      "name": "Dr. Nguyễn Văn A",
      "email": "doctor@example.com",
      "specialization": "Nội khoa"
    }
  ]
}
```

### Get Available Slots

```bash
curl -X GET "http://localhost:5000/api/patient-portal/appointments/available-slots/65a4b2c...?appointmentDate=2024-12-10" \
  -H "Authorization: Bearer TOKEN"
```

Response:

```json
{
  "success": true,
  "data": [
    { "time": "09:00", "available": true },
    { "time": "09:30", "available": true }
  ]
}
```

### Book Appointment

```bash
curl -X POST "http://localhost:5000/api/patient-portal/appointments" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "65a4b2c...",
    "appointmentDate": "2024-12-10",
    "appointmentTime": "09:30",
    "reason": "Khám thường quy",
    "type": "Consultation"
  }'
```

Response:

```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "65a5d3e...",
    "appointmentId": "AP12345678",
    "status": "SCHEDULED"
  }
}
```

---

## 🎯 Component Usage

```jsx
// In any component
import BookingAppointmentModal from "./components/BookingAppointmentModal";

export default function MyComponent() {
  const [visible, setVisible] = useState(false);

  const handleRefresh = async () => {
    // Your refresh logic
    await loadAppointments();
  };

  return (
    <>
      <button onClick={() => setVisible(true)}>Đặt Lịch Hẹn</button>

      <BookingAppointmentModal
        visible={visible}
        onClose={() => setVisible(false)}
        onSuccess={handleRefresh}
      />
    </>
  );
}
```

---

## ⚠️ Common Issues

### 1. "Modal không mở"

```
Fix: Kiểm tra state bookingModalVisible được set đúng
- Đã import component?
- Đã pass visible prop?
- Đã bind onClick handler?
```

### 2. "Không có bác sĩ nào"

```
Fix:
- Check database có doctor nào không
- Doctor phải có role = "DOCTOR"
- Doctor phải có isActive = true
- API /users/doctors có response?
```

### 3. "Error khi chọn ngày"

```
Fix:
- Check date format (YYYY-MM-DD)
- Check API /available-slots trả về data
- Check browser console for errors
```

### 4. "Không submit được"

```
Fix:
- Check form validation (all required fields filled)
- Check API response
- Check network tab for errors
- Check backend logs
```

---

## 🔒 Security Notes

✅ **Implemented:**

- Authentication required (JWT)
- Input validation
- Doctor verification
- Patient data isolation

⚠️ **Remember:**

- Never expose sensitive data
- Always validate on backend
- Check user permissions
- Log all transactions

---

## 📚 Documentation

For detailed information, see:

- 📄 `APPOINTMENT_BOOKING_GUIDE.md` - Complete guide
- 📄 `CHANGES_SUMMARY.md` - All changes made
- 📄 `QUICK_START.md` - This file

---

## 🎓 Key Concepts

### 1. Two-Step Modal

- Step 1: Doctor selection
- Step 2: Date/Time & details

### 2. Time Slot Generation

- 30-minute intervals
- 9 AM - 5 PM
- Excludes already booked times
- Excludes breaks

### 3. Data Flow

```
Button Click → Modal Opens → Load Doctors →
User Selects Doctor → Load Available Slots →
User Fills Form → Submit → Create Appointment →
Modal Closes → Dashboard Refreshes
```

### 4. Validation

- Frontend: Form validation
- Backend: Joi schema validation
- Database: Unique constraints

---

## 💡 Tips

1. **Test with Browser DevTools**

   - Network tab to see API calls
   - Console to see errors
   - Elements to inspect components

2. **Use Postman for API Testing**

   - Test endpoints before frontend integration
   - Save requests for reuse
   - Automate testing

3. **Check Logs**

   - Backend console: npm run dev output
   - Frontend console: Browser DevTools
   - Database: MongoDB logs

4. **Mobile Testing**
   - Use Chrome DevTools device emulation
   - Test all screen sizes
   - Check touch interactions

---

## 🚀 Next Steps

1. ✅ Implement appointment reminders
2. ✅ Add doctor schedule management
3. ✅ Support rescheduling
4. ✅ Add cancellation feature
5. ✅ Send confirmation emails
6. ✅ Add ratings/reviews after appointment
7. ✅ Telemedicine integration
8. ✅ Analytics dashboard

---

## 📞 Need Help?

1. **Check Documentation**

   - APPOINTMENT_BOOKING_GUIDE.md
   - CHANGES_SUMMARY.md

2. **Debug with Console**

   - Browser DevTools
   - Backend logs
   - Network tab

3. **Test with Postman**

   - Import and run API calls
   - Check request/response

4. **Review Code**
   - BookingAppointmentModal.jsx
   - Patient/Dashboard.jsx
   - appointments.routes.js

---

## ✨ Summary

**What was added:**

- ✅ Booking modal component
- ✅ Doctor listing endpoint
- ✅ Available slots endpoint
- ✅ Appointment booking endpoint
- ✅ Dashboard integration

**What works:**

- ✅ Patient can book appointments
- ✅ Doctor availability checking
- ✅ Conflict prevention
- ✅ Form validation
- ✅ Success notifications

**Status:** 🟢 **READY TO USE**

---

_Last Updated: 2024-12-03_
