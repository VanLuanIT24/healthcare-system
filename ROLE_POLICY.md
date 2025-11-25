# 🔐 Healthcare System - Role & Registration Policy

**Date**: November 25, 2025  
**Status**: ✅ IMPLEMENTED

---

## 📋 Chính Sách Đăng Ký & Vai Trò

### 1️⃣ **Đăng Ký Tự Động (Self Registration)**

#### Patient Portal (`/patient/register`)

```
✅ CÓ THỂ: Bất kỳ ai
❌ KHÔNG: Không thể chọn role
📝 KẾT QUẢ: Tài khoản được tạo với role = "PATIENT"
```

#### Super Admin Portal (`/superadmin/register`)

```
✅ CÓ THỂ: Bất kỳ ai
❌ KHÔNG: Không thể chọn role khác
📝 KẾT QUẢ: Tài khoản được tạo với role = "SUPER_ADMIN"
⚠️ LƯU Ý: Route này cần được disabled hoặc giới hạn trong production
```

---

### 2️⃣ **Quản Lý Người Dùng (Admin Only)**

#### Admin Dashboard User Management (`/superadmin/dashboard`)

```
✅ CÓ THỂ: Super Admin / Admin user
🎯 CHỨC NĂNG:
  1. Tạo người dùng mới với role bất kỳ
  2. Đổi role người dùng hiện tại
  3. Khoá/Mở khóa tài khoản
  4. Xóa tài khoản

📝 AVAILABLE ROLES:
  - PATIENT (Bệnh nhân)
  - DOCTOR (Bác sĩ)
  - NURSE (Y tá)
  - RECEPTIONIST (Lễ tân)
  - PHARMACIST (Dược sĩ)
  - LAB_TECHNICIAN (Kỹ thuật viên lab)
  - BILLING_STAFF (Nhân viên thanh toán)
  - SUPER_ADMIN (Super Admin - Cấp quyền cực kỳ hạn chế)
```

---

## 🔄 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   NEW USER REGISTRATION                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
         ┌────────────────┴────────────────┐
         ↓                                  ↓
   PATIENT PORTAL            SUPERADMIN PORTAL
   (/patient/register)       (/superadmin/register)
         ↓                                  ↓
   Role = PATIENT            Role = SUPER_ADMIN
   (auto set)                 (auto set)
         ↓                                  ↓
      Login OK                 ❌ WARNING: Disable in production!
         ↓
   Access Patient Portal

┌─────────────────────────────────────────────────────────────┐
│            CHANGE ROLE (ADMIN ONLY)                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
   Admin Dashboard → User Management
                           ↓
              SELECT USER → EDIT ROLE
                           ↓
   Role changed to: DOCTOR / NURSE / etc.
                           ↓
      User must re-login to see new permissions
```

---

## 💾 Backend Implementation

### File: `src/services/auth.service.js`

```javascript
async registerUser(userData, ipAddress = "0.0.0.0") {
  // ✅ Line 220-221: Force role to PATIENT (ignore input)
  const { email, password, personalInfo } = userData;
  const role = "PATIENT"; // ← FORCE PATIENT

  // Rest of registration logic...
}
```

### File: `src/validations/auth.validation.js`

```javascript
registerUser: {
  body: Joi.object({
    // ... other fields ...
    // ✅ Removed role field - users CANNOT choose role
  });
}
```

---

## 🖥️ Frontend Implementation

### Patient Register (`src/pages/Patient/Register.jsx`)

```javascript
const registerData = {
  email: values.email,
  password: values.password,
  personalInfo: {
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phoneNumber,
    dateOfBirth: values.dateOfBirth.toISOString(),
    gender: values.gender,
    // ✅ NO role field - backend forces PATIENT
  },
};
```

### Super Admin Register (`src/pages/SuperAdmin/Register.jsx`)

```javascript
const userData = {
  email: values.email,
  password: values.password,
  personalInfo: { ... },
  role: "SUPER_ADMIN", // ← Hard-coded
};
```

### User Management - Create User (`src/components/UserManagement.jsx`)

```javascript
// Admin can create users with ANY role
const createUser = async (userData) => {
  // Form allows selecting: DOCTOR, NURSE, RECEPTIONIST, etc.
  const response = await axios.post(`${API_BASE_URL}/users`, userData);
  // ✅ No restrictions - admin can create any role
};
```

---

## 🔐 Security Considerations

### What's Protected?

```
✅ Self-registration users → Always PATIENT
✅ Only admin can promote to DOCTOR/NURSE
✅ Only admin can demote roles
✅ Role changes logged in audit trail
```

### What Needs Production Fixes?

```
⚠️ SuperAdmin self-registration route should be:
   1. Disabled in production
   2. Or protected with additional authentication
   3. Or limited to initial setup only

RECOMMENDATION:
  - Use environment variable to enable/disable
  - Or create separate endpoint with API key auth
```

---

## 📝 Testing Checklist

### Test Case 1: Patient Registration

```
1. Go to /patient/register
2. Fill form (firstName, lastName, email, phone, DOB, gender, password)
3. Submit
4. Result: User created with role = "PATIENT" ✅
5. Can login to /patient/dashboard ✅
```

### Test Case 2: Change Role (Admin)

```
1. Login as SUPER_ADMIN to /superadmin/dashboard
2. Go to User Management
3. Edit a user (created in Test Case 1)
4. Change role from PATIENT → DOCTOR
5. Result: Role updated ✅
6. User must re-login to see new permissions ✅
```

### Test Case 3: Admin Create Doctor

```
1. Login as SUPER_ADMIN
2. Click "Create New User"
3. Fill form with role = "DOCTOR"
4. Submit
5. Result: User created with role = "DOCTOR" ✅
6. User can login with doctor permissions ✅
```

---

## 🚀 API Endpoints Summary

### Public

- `POST /auth/register` → Role forced to PATIENT (or SUPER_ADMIN for superadmin route)
- `POST /auth/login` → Works for all roles

### Admin Only (Protected by RBAC)

- `POST /users` → Create user with custom role
- `PUT /users/:id` → Update user role
- `DELETE /users/:id` → Delete user
- `PATCH /users/:id/role` → Change role

---

## ✅ Implementation Status

| Feature                     | Status  | Notes                       |
| --------------------------- | ------- | --------------------------- |
| Force PATIENT on self-reg   | ✅ Done | Backend & Frontend aligned  |
| Remove role from validation | ✅ Done | Validation schema updated   |
| Patient Register form       | ✅ Done | Requires full personal info |
| Admin User Create           | ✅ Done | Allows role selection       |
| Admin Role Change           | ✅ Done | PUT /users/:id endpoint     |
| Documentation               | ✅ Done | This file                   |

---

## 📚 Related Files

1. **Backend**

   - `src/services/auth.service.js` (Line 220-221)
   - `src/validations/auth.validation.js` (Role field removed)

2. **Frontend**

   - `src/pages/Patient/Register.jsx` (Updated form)
   - `src/pages/SuperAdmin/Register.jsx` (No changes needed)
   - `src/components/UserManagement.jsx` (Admin create/edit)

3. **Documentation**
   - This file: `ROLE_POLICY.md`
