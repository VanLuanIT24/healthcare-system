import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Form, Input, Button, Card, message, Tabs, Alert, Spin } from "antd";
import { UserOutlined, LockOutlined, HeartOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { getDashboardRoute, getRoleGroup } from "../../utils/roleUtils";

const UnifiedLogin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("patient");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Set active tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['patient', 'medical', 'admin'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      
      console.log("🔐 Attempting login...");
      const userData = await login(values.email, values.password);

      if (!userData) {
        message.error("Lỗi: Không thể lấy dữ liệu người dùng");
        return;
      }

      const userRole = userData?.role;
      console.log("✅ Login successful, user role:", userRole);

      // Lấy route dashboard dựa trên role
      const dashboardRoute = getDashboardRoute(userRole);
      
      message.success(`Đăng nhập thành công! Chào mừng ${getRoleDisplayName(userRole)}`);
      
      // Redirect đến dashboard tương ứng
      setTimeout(() => {
        navigate(dashboardRoute, { replace: true });
      }, 100);

    } catch (err) {
      console.error("❌ Login error:", err);
      const errorMsg = err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'PATIENT': 'Bệnh nhân',
      'DOCTOR': 'Bác sĩ',
      'NURSE': 'Y tá/Điều dưỡng',
      'PHARMACIST': 'Dược sĩ',
      'LAB_TECHNICIAN': 'Kỹ thuật viên xét nghiệm',
      'SUPER_ADMIN': 'Quản trị viên cao cấp',
      'HOSPITAL_ADMIN': 'Quản lý bệnh viện',
      'DEPARTMENT_HEAD': 'Trưởng khoa',
      'RECEPTIONIST': 'Lễ tân',
      'BILLING_STAFF': 'Nhân viên kế toán',
      'GUEST': 'Khách'
    };
    return roleNames[role] || 'Người dùng';
  };

  const tabItems = [
    {
      key: "patient",
      label: "🏥 Bệnh Nhân & Người Dùng",
      children: (
        <div>
          <Alert 
            message="Dành cho bệnh nhân và người dùng hệ thống"
            description="Truy cập cổng thông tin cá nhân, đặt lịch khám và theo dõi sức khỏe"
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />
          <LoginForm onLogin={handleLogin} loading={loading} />
        </div>
      ),
    },
    {
      key: "medical",
      label: "👨‍⚕️ Nhân Viên Y Tế",
      children: (
        <div>
          <Alert 
            message="Dành cho nhân viên y tế"
            description="Truy cập hệ thống làm việc, quản lý bệnh nhân và xử lý nghiệp vụ chuyên môn"
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />
          <LoginForm onLogin={handleLogin} loading={loading} />
        </div>
      ),
    },
    {
      key: "admin",
      label: "👨‍💼 Quản Trị & Hành Chính",
      children: (
        <div>
          <Alert 
            message="Dành cho quản trị viên và nhân viên hành chính"
            description="Truy cập hệ thống quản lý, giám sát hoạt động và xử lý nghiệp vụ hành chính"
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />
          <LoginForm onLogin={handleLogin} loading={loading} />
        </div>
      ),
    },
  ];

  return (
    <div className="auth-container">
      <Spin spinning={loading} size="large">
        <Card className="auth-card" style={{ maxWidth: 500 }}>
          {/* Header */}
          <div className="text-center" style={{ marginBottom: 30 }}>
            <HeartOutlined style={{ fontSize: 48, color: "#0F5B8C", marginBottom: 16 }} />
            <h1 style={{ marginBottom: 8, color: "#0F5B8C" }}>Healthcare System</h1>
            <p style={{ color: "#666" }}>Hệ Thống Quản Lý Y Tế Toàn Diện</p>
          </div>

          {/* Login Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            centered
          />

          {/* Footer */}
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <p style={{ color: "#666", fontSize: 12 }}>
              💡 Chọn nhóm phù hợp với vai trò của bạn để đăng nhập
            </p>
            <div style={{ marginTop: 16 }}>
              <Link to="/register">Chưa có tài khoản? Đăng ký ngay</Link>
              <span style={{ margin: "0 12px" }}>•</span>
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

// Component Form đăng nhập tái sử dụng
const LoginForm = ({ onLogin, loading }) => (
  <Form
    layout="vertical"
    onFinish={onLogin}
    autoComplete="off"
  >
    <Form.Item
      name="email"
      label="Email"
      rules={[
        { required: true, message: "Vui lòng nhập email" },
        { type: "email", message: "Email không hợp lệ" },
      ]}
    >
      <Input
        prefix={<UserOutlined />}
        placeholder="Nhập email của bạn"
        size="large"
        disabled={loading}
      />
    </Form.Item>

    <Form.Item
      name="password"
      label="Mật khẩu"
      rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
    >
      <Input.Password
        prefix={<LockOutlined />}
        placeholder="Nhập mật khẩu"
        size="large"
        disabled={loading}
      />
    </Form.Item>

    <Form.Item>
      <Button
        type="primary"
        size="large"
        block
        loading={loading}
        htmlType="submit"
      >
        Đăng nhập
      </Button>
    </Form.Item>
  </Form>
);

export default UnifiedLogin;