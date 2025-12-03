# 📋 Appointment Booking Feature - Test Checklist

## ✅ Pre-Deployment Testing

### 1. Backend API Testing

#### 1.1 GET /api/users/doctors (Public Endpoint)

- **Purpose:** Fetch list of available doctors
- **Request:**
  ```
  GET /api/users/doctors?page=1&limit=10&search=&specialization=
  Headers: Authorization: Bearer {token}
  ```
- **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Danh sách bác sĩ",
    "data": [
      {
        "_id": "doctor-id",
        "email": "doctor@example.com",
        "role": "DOCTOR",
        "isActive": true,
        "personalInfo": {
          "firstName": "Nguyễn",
          "lastName": "Văn A",
          "phone": "0123456789"
        },
        "professionalInfo": {
          "specialization": "Tim Mạch"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
  ```
- **Test Cases:**
  - ✓ Returns empty array if no doctors
  - ✓ Filters by search term
  - ✓ Filters by specialization
  - ✓ Pagination works correctly
  - ✓ Only returns isActive: true doctors

#### 1.2 GET /api/patient-portal/appointments/available-slots/{doctorId}

- **Purpose:** Get available time slots for a specific doctor on a date
- **Request:**
  ```
  GET /api/patient-portal/appointments/available-slots/doctor-id?appointmentDate=2025-12-10
  Headers: Authorization: Bearer {token}
  ```
- **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Available slots retrieved successfully",
    "data": [
      { "time": "09:00", "available": true },
      { "time": "09:30", "available": true },
      { "time": "10:00", "available": true },
      ...
    ]
  }
  ```
- **Test Cases:**
  - ✓ Returns 16 slots per day (30-min intervals, 9 AM - 5 PM)
  - ✓ Excludes already booked slots
  - ✓ Only includes future dates
  - ✓ Handles invalid doctor ID
  - ✓ Handles invalid date format

#### 1.3 POST /api/patient-portal/appointments (Book Appointment)

- **Purpose:** Create a new appointment
- **Request:**

  ```json
  POST /api/patient-portal/appointments
  Headers: Authorization: Bearer {token}

  {
    "doctorId": "doctor-id",
    "appointmentDate": "2025-12-10",
    "appointmentTime": "10:30",
    "reason": "Khám tổng quát",
    "type": "Consultation",
    "notes": "Có dị ứng với Aspirin"
  }
  ```

- **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Appointment booked successfully",
    "data": {
      "_id": "appointment-id",
      "appointmentId": "APT-1733750000000-abc123def",
      "patientId": "patient-id",
      "doctorId": "doctor-id",
      "appointmentDate": "2025-12-10T00:00:00.000Z",
      "appointmentTime": "10:30",
      "reason": "Khám tổng quát",
      "type": "Consultation",
      "status": "SCHEDULED",
      "createdAt": "2025-12-03T10:30:00.000Z"
    }
  }
  ```
- **Test Cases:**
  - ✓ Creates appointment with valid data
  - ✓ Returns 400 if required fields missing
  - ✓ Returns 400 if invalid doctor ID
  - ✓ Returns 400 if time slot already booked
  - ✓ Returns 400 if invalid date format
  - ✓ Returns 400 if invalid time format
  - ✓ Only allows authenticated patients
  - ✓ Generates unique appointmentId

### 2. Frontend Component Testing

#### 2.1 BookingAppointmentModal - Step 1: Doctor Selection

- **Test Cases:**
  - ✓ Modal opens when button clicked
  - ✓ Displays "Bước 1: Chọn Bác Sĩ" alert
  - ✓ Loads doctors on modal open
  - ✓ Shows all available doctors
  - ✓ Displays doctor name, specialization, email, phone
  - ✓ Can select a doctor
  - ✓ Moves to Step 2 after doctor selection
  - ✓ Shows "Không có bác sĩ khả dụng" if no doctors

#### 2.2 BookingAppointmentModal - Step 2: Date & Time Selection

- **Test Cases:**
  - ✓ Displays selected doctor info
  - ✓ Date picker shows and disables past dates
  - ✓ Date picker disables Sundays
  - ✓ Loading state shows while fetching slots
  - ✓ Time slots load after date selection
  - ✓ Can select time slot (turns blue/primary)
  - ✓ Shows "Không có khung giờ khả dụng" if none available
  - ✓ Required fields marked correctly

#### 2.3 BookingAppointmentModal - Form Fields

- **Test Cases:**
  - ✓ Appointment Type dropdown has options: Tư Vấn, Tái Khám, Khám Thường Quy
  - ✓ Reason textarea enforces 500 char limit
  - ✓ Notes textarea enforces 500 char limit
  - ✓ Submit button disabled until time selected
  - ✓ Back button returns to Step 1

#### 2.4 BookingAppointmentModal - Form Submission

- **Test Cases:**
  - ✓ Shows success message "Đặt lịch hẹn thành công!"
  - ✓ Closes modal after successful booking
  - ✓ Refreshes dashboard data (calls onSuccess)
  - ✓ Shows error message on API failure
  - ✓ Shows loading state during submission
  - ✓ Handles network errors gracefully

#### 2.5 BookingAppointmentModal - Integration with Patient Dashboard

- **Test Cases:**
  - ✓ "Đặt Lịch Hẹn" button visible in Appointments tab
  - ✓ Button has PlusOutlined icon
  - ✓ Clicking button opens modal
  - ✓ Modal state isolated from other dashboard tabs
  - ✓ Dashboard appointments list refreshes after booking

### 3. Data Validation Testing

#### 3.1 Frontend Validation

- **Test Cases:**
  - ✓ Cannot submit form without doctor selected
  - ✓ Cannot submit form without date selected
  - ✓ Cannot submit form without time selected
  - ✓ Cannot submit form without reason
  - ✓ Date validation prevents past dates
  - ✓ Date validation prevents Sundays
  - ✓ Reason field shows character count
  - ✓ Reason field prevents > 500 chars

#### 3.2 Backend Validation

- **Test Cases:**
  - ✓ Validates all required fields present
  - ✓ Validates appointmentDate is valid date
  - ✓ Validates appointmentTime matches HH:MM format
  - ✓ Validates doctor exists and has role "DOCTOR"
  - ✓ Validates doctor is isActive: true
  - ✓ Checks appointment slot not already booked
  - ✓ Returns appropriate error messages

### 4. Error Handling Testing

#### 4.1 Network Errors

- **Test Cases:**
  - ✓ Handles network timeout gracefully
  - ✓ Shows error message if doctor list fails to load
  - ✓ Shows error message if slots fail to load
  - ✓ Shows error message if booking fails

#### 4.2 Validation Errors

- **Test Cases:**
  - ✓ Shows "Vui lòng chọn ngày hẹn" if date missing
  - ✓ Shows "Vui lòng chọn thời gian" if time missing
  - ✓ Shows error if time slot becomes unavailable
  - ✓ Shows error if doctor becomes inactive

#### 4.3 Business Logic Errors

- **Test Cases:**
  - ✓ Cannot book slot that's already taken
  - ✓ Cannot book doctor that doesn't exist
  - ✓ Cannot book past appointments
  - ✓ Cannot book on Sundays

### 5. API Integration Testing

#### 5.1 Request/Response Validation

- **Test Cases:**
  - ✓ All requests include Authorization header
  - ✓ Request body matches schema
  - ✓ Response status codes correct (200, 201, 400, 404)
  - ✓ Response data structure matches expected format
  - ✓ Date formats consistent (YYYY-MM-DD for date, HH:MM for time)

#### 5.2 Authentication Testing

- **Test Cases:**
  - ✓ Requires valid JWT token
  - ✓ Rejects expired tokens
  - ✓ Rejects invalid tokens
  - ✓ Only allows authenticated users

### 6. Edge Cases & Boundary Testing

#### 6.1 Date/Time Handling

- **Test Cases:**
  - ✓ Handles appointments at 9:00 AM (first slot)
  - ✓ Handles appointments at 4:30 PM (last slot)
  - ✓ Handles date boundary (midnight transitions)
  - ✓ Handles different timezones correctly
  - ✓ Handles leap year dates

#### 6.2 Data Edge Cases

- **Test Cases:**
  - ✓ Handles empty doctor list
  - ✓ Handles single doctor
  - ✓ Handles doctor with no specialization
  - ✓ Handles very long doctor names
  - ✓ Handles special characters in reason/notes
  - ✓ Handles exactly 500 char reason
  - ✓ Handles empty notes field

#### 6.3 Concurrency & Race Conditions

- **Test Cases:**
  - ✓ Prevents double-booking same slot
  - ✓ Handles rapid clicks correctly
  - ✓ Handles modal opened multiple times

### 7. Browser & Device Compatibility

#### 7.1 Desktop Browsers

- **Test Cases:**
  - ✓ Chrome (latest)
  - ✓ Firefox (latest)
  - ✓ Safari (latest)
  - ✓ Edge (latest)

#### 7.2 Mobile Devices

- **Test Cases:**
  - ✓ iPhone Safari
  - ✓ Android Chrome
  - ✓ Responsive layout adjusts correctly
  - ✓ Touch interactions work (time slot selection)

#### 7.3 Responsiveness

- **Test Cases:**
  - ✓ Modal width adapts to screen size
  - ✓ Doctor cards stack on mobile
  - ✓ Time slot buttons wrap correctly
  - ✓ Form fields fully visible without horizontal scroll

### 8. Performance Testing

#### 8.1 Loading Performance

- **Test Cases:**
  - ✓ Doctor list loads in < 2 seconds
  - ✓ Time slots load in < 1 second
  - ✓ Booking submission completes in < 3 seconds
  - ✓ No unnecessary re-renders

#### 8.2 API Response Times

- **Test Cases:**
  - ✓ GET /doctors responds in < 200ms
  - ✓ GET /available-slots responds in < 200ms
  - ✓ POST /appointments responds in < 500ms

### 9. Security Testing

#### 9.1 Authentication & Authorization

- **Test Cases:**
  - ✓ Only authenticated patients can book
  - ✓ Patients cannot book for other patients
  - ✓ Invalid tokens rejected
  - ✓ Expired tokens rejected

#### 9.2 Input Validation & Sanitization

- **Test Cases:**
  - ✓ SQL injection attempts blocked
  - ✓ XSS attempts blocked
  - ✓ Special characters handled safely
  - ✓ Large inputs truncated appropriately

#### 9.3 CORS & HTTPS

- **Test Cases:**
  - ✓ Proper CORS headers in responses
  - ✓ HTTPS enforced in production
  - ✓ No sensitive data in logs

### 10. Database Testing

#### 10.1 Data Persistence

- **Test Cases:**
  - ✓ Appointments saved to database
  - ✓ appointmentId is unique
  - ✓ patientId matches requesting user
  - ✓ doctorId valid reference
  - ✓ Status defaults to "SCHEDULED"
  - ✓ Timestamps created correctly

#### 10.2 Query Performance

- **Test Cases:**
  - ✓ Conflict detection query efficient
  - ✓ Doctor list query uses index
  - ✓ Available slots query performant

## 🚀 Deployment Checklist

- [ ] All tests passing
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Database connected and initialized
- [ ] Environment variables configured
- [ ] Error logging enabled
- [ ] Performance monitoring enabled
- [ ] Backup created before deployment
- [ ] Rollback plan prepared

## 📝 Test Result Template

```
Date: ___________
Tester: _________
Environment: ____

PASSED: ___/___
FAILED: ___/___

Failed Tests:
1.
2.

Notes:
```

## 🔧 Manual Testing Steps

### Step 1: Open Patient Dashboard

1. Navigate to `/patient-portal/dashboard`
2. Login as a patient user
3. Find "Appointments" tab

### Step 2: Click "Đặt Lịch Hẹn" Button

1. Look for button with PlusOutlined icon
2. Click button
3. Verify modal opens

### Step 3: Test Step 1 - Doctor Selection

1. Verify "Bước 1: Chọn Bác Sĩ" alert shows
2. Verify doctors load from API
3. Click on a doctor card
4. Verify Step 2 appears

### Step 4: Test Step 2 - Date Selection

1. Verify doctor info displays
2. Click on date picker
3. Select a date (not past, not Sunday)
4. Verify time slots load

### Step 5: Test Time Slot Selection

1. Click on an available time slot
2. Verify slot turns blue/primary
3. Verify "Đặt Lịch Hẹn" button becomes enabled

### Step 6: Test Form Submission

1. Fill in Appointment Type (Tư Vấn)
2. Fill in Reason: "Khám tổng quát"
3. (Optional) Add notes
4. Click "Đặt Lịch Hẹn" button
5. Verify success message
6. Verify modal closes
7. Verify new appointment appears in list

### Step 7: Test Error Handling

1. Try to book same time slot twice
2. Verify error message shows
3. Try invalid date
4. Verify error handling

## 📞 Support & Troubleshooting

### Common Issues

**Issue: "Không có bác sĩ khả dụng"**

- Check if any doctors exist in database
- Check if doctors have isActive: true
- Check if doctors have role: "DOCTOR"

**Issue: "Không có khung giờ khả dụng"**

- Check if all slots are already booked
- Check date is not Sunday
- Check date is in future

**Issue: Modal doesn't open**

- Check Console for JavaScript errors
- Verify BookingAppointmentModal component imported
- Check if bookingModalVisible state works

**Issue: API returns 401**

- Check token is valid and not expired
- Check Authorization header sent
- Verify user is authenticated

**Issue: Time slots not loading**

- Check doctorId is valid
- Check appointmentDate format (YYYY-MM-DD)
- Check API endpoint accessible
