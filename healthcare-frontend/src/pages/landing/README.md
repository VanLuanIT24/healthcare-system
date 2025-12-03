# Landing Pages

Thư mục này chứa các trang công khai và trang quản lý tài khoản của ứng dụng Healthcare.

## 📄 Danh Sách Pages

### Public Pages (Không cần đăng nhập)
- `HomePage.jsx` - Trang chủ
- `AboutPage.jsx` - Giới thiệu về hệ thống
- `ServicesPage.jsx` - Danh sách dịch vụ y tế
- `DoctorsPage.jsx` - Danh sách bác sĩ
- `NewsPage.jsx` - Tin tức y tế
- `ConsultationPage.jsx` - Đặt lịch tư vấn
- `ContactPage.jsx` - Liên hệ
- `CareersPage.jsx` - Tuyển dụng
- `FAQPage.jsx` - Câu hỏi thường gặp
- `PrivacyPolicyPage.jsx` - Chính sách bảo mật
- `TermsOfServicePage.jsx` - Điều khoản sử dụng
- `UserGuidePage.jsx` - Hướng dẫn sử dụng
- `PaymentPolicyPage.jsx` - Chính sách thanh toán

### Account Management (Yêu cầu đăng nhập) ⭐ NEW
- **`AccountPage.jsx`** - Trang quản lý tài khoản hoàn chỉnh

## 🌟 AccountPage.jsx - Trang Quản Lý Tài Khoản

### Mô tả
Trang quản lý tài khoản toàn diện cho phép người dùng quản lý thông tin cá nhân, bảo mật, cài đặt và phiên đăng nhập.

### Tính năng chính
1. **Thông tin cá nhân**: Xem/Sửa profile, upload avatar
2. **Bảo mật**: Đổi mật khẩu, xác thực email, quản lý phiên
3. **Cài đặt**: Thông báo, ngôn ngữ, chủ đề, múi giờ
4. **Phiên đăng nhập**: Xem và quản lý tất cả thiết bị

### Route
```jsx
/account
```

### Usage trong App.jsx
```jsx
import AccountPage from "./pages/landing/AccountPage";

<Route path="/account" element={<AccountPage />} />
```

### Dependencies
- `moment` - Date formatting
- `axios` - API calls
- `antd` - UI components
- `@ant-design/icons` - Icons
- `react-router-dom` - Navigation

### Props
Không có props, trang tự động lấy user từ `useAuth()` context.

### State Management
```javascript
- profileData: User profile từ API
- sessions: Danh sách phiên đăng nhập
- loading: Loading state
- editing: Edit mode
- activeTab: Active tab key
```

### API Endpoints
```
GET    /api/users/profile
PUT    /api/users/profile
POST   /api/users/profile/picture
POST   /api/users/profile/resend-verification
POST   /api/auth/change-password
GET    /api/auth/sessions
POST   /api/auth/sessions/revoke
POST   /api/auth/sessions/logout-all
```

### Screenshots
(Xem file QUICK_START.md để xem screenshots chi tiết)

### Code Size
- **Lines**: ~1,100+
- **Size**: ~45KB
- **Components**: 4 main tabs + multiple sub-components

### Author
Healthcare Development Team

### Created
November 27, 2025

### Status
✅ Production Ready

---

## 🚀 Development

### Adding new landing page
1. Create new file: `NewPage.jsx`
2. Import components: `LandingHeader`, `LandingFooter`
3. Add route in `App.jsx`
4. Update navigation menus if needed

### File structure
```jsx
import { Layout } from "antd";
import LandingHeader from "../../components/landing/LandingHeader";
import LandingFooter from "../../components/landing/LandingFooter";

const { Content } = Layout;

const NewPage = () => {
  return (
    <Layout>
      <LandingHeader />
      <Content>
        {/* Your content here */}
      </Content>
      <LandingFooter />
    </Layout>
  );
};

export default NewPage;
```

## 📝 Notes

- Tất cả landing pages sử dụng `LandingHeader` và `LandingFooter`
- Public pages không yêu cầu authentication
- Account page yêu cầu user đã đăng nhập
- Responsive design cho mọi thiết bị
