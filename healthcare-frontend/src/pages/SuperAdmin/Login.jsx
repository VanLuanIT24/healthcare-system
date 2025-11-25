import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, message, Spin } from "antd";
import { UserOutlined, LockOutlined, HeartOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import "../styles/Auth.css";

const SuperAdminLogin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (values) => {
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

      // 🎯 Auto-redirect based on user role
      if (userRole === "PATIENT") {
        console.log("🏥 Redirecting to Patient Dashboard");
        message.success("Đăng nhập thành công! Chào mừng bạn.");
        setTimeout(() => {
          navigate("/patient/dashboard", { replace: true });
        }, 100);
      } else {
        // Admin / SuperAdmin / Other roles
        console.log("👨‍💼 Redirecting to Super Admin Dashboard");
        message.success("Đăng nhập thành công! Chào mừng bạn.");
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

  return (
    <div className="auth-container">
      <Spin spinning={loading} size="large">
        <Card className="auth-card">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <HeartOutlined style={{ fontSize: "56px", color: "#0F5B8C" }} />
            </div>
            <h1 style={{ color: "#0F5B8C" }}>Healthcare System</h1>
            <p style={{ color: "#666" }}>Đăng nhập hệ thống</p>
          </div>

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
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

          {/* Footer */}
          <div className="text-center space-y-3">
            <p className="text-gray-600 text-sm">
              Chưa có tài khoản? <Link to="/superadmin/register">Đăng ký</Link>
            </p>
            <p className="text-gray-600 text-sm">
              <Link to="/superadmin/forgot-password">Quên mật khẩu?</Link>
            </p>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default SuperAdminLogin;
