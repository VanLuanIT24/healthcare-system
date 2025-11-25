import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, message, Spin, Tabs } from "antd";
import { UserOutlined, LockOutlined, HeartOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import "./styles/Auth.css";

const UnifiedLogin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("patient");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const userData = await login(values.email, values.password);

      console.log("✅ Login successful, user data:", userData);

      if (!userData) {
        message.error("Lỗi: Không thể lấy dữ liệu người dùng");
        return;
      }

      const userRole = userData?.role;
      console.log("📋 User role:", userRole);

      // Auto-redirect based on user role
      if (userRole === "PATIENT") {
        console.log("🏥 Redirecting to Patient Dashboard");
        message.success("Đăng nhập thành công! Chào mừng bạn.");
        setTimeout(() => {
          navigate("/patient/dashboard", { replace: true });
        }, 100);
      } else if (userRole === "DOCTOR") {
        // Doctors use the patient dashboard but have elevated permissions
        console.log(
          "👨‍⚕️ Doctor login - redirecting to Patient Dashboard with elevated access"
        );
        message.success("Đăng nhập thành công! Chào mừng Bác sĩ.");
        setTimeout(() => {
          navigate("/patient/dashboard", { replace: true });
        }, 100);
      } else if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
        console.log("👨‍💼 Redirecting to Super Admin Dashboard");
        message.success("Đăng nhập thành công! Chào mừng bạn.");
        setTimeout(() => {
          navigate("/superadmin/dashboard", { replace: true });
        }, 100);
      } else {
        // Other roles (NURSE, RECEPTIONIST, etc.) → Super Admin dashboard for now
        console.log("ℹ Other role, redirecting to Super Admin Dashboard");
        message.success("Đăng nhập thành công!");
        setTimeout(() => {
          navigate("/superadmin/dashboard", { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: "patient",
      label: "🏥 Bệnh Nhân",
      children: (
        <div>
          <p
            style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}
          >
            Đăng nhập để truy cập cổng thông tin bệnh nhân
          </p>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            autoComplete="off"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                {
                  type: "email",
                  message: "Email không hợp lệ",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="nhập email của bạn"
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
                placeholder="nhập mật khẩu"
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
        </div>
      ),
    },
    {
      key: "admin",
      label: "👨‍💼 Quản Trị Viên",
      children: (
        <div>
          <p
            style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}
          >
            Đăng nhập để truy cập bảng quản trị hệ thống
          </p>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            autoComplete="off"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                {
                  type: "email",
                  message: "Email không hợp lệ",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="nhập email của bạn"
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
                placeholder="nhập mật khẩu"
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
        </div>
      ),
    },
  ];

  return (
    <div className="auth-container">
      <Spin spinning={loading} size="large">
        <Card className="auth-card" style={{ maxWidth: "450px" }}>
          {/* Header */}
          <div className="text-center" style={{ marginBottom: "30px" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <HeartOutlined style={{ fontSize: "48px", color: "#0F5B8C" }} />
            </div>
            <h1 style={{ marginBottom: "8px", color: "#0F5B8C" }}>
              Healthcare System
            </h1>
            <p style={{ color: "#666" }}>Quản Lý Sức Khỏe Toàn Diện</p>
          </div>

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ marginTop: "24px" }}
          />

          {/* Footer */}
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <p style={{ color: "#666", fontSize: "12px" }}>
              💡 Lựa chọn loại tài khoản của bạn ở trên để đăng nhập
            </p>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default UnifiedLogin;
