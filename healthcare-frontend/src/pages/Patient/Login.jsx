import React, { useState } from "react";
import { Form, Input, Button, Card, message, Spin } from "antd";
import { LockOutlined, MailOutlined, HeartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../styles/Auth.css";

const PatientLogin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      console.log("Patient Login - Starting login...");
      const user = await login(values.email, values.password);
      console.log("Patient Login - User role:", user?.role);

      if (user?.role === "PATIENT") {
        console.log(
          "Patient Login - User is PATIENT, navigating to /patient/dashboard"
        );
        message.success("Đăng nhập thành công!");
        // Use setTimeout to ensure state is updated
        setTimeout(() => {
          navigate("/patient/dashboard", { replace: true });
        }, 100);
      } else {
        console.log("Patient Login - User is not PATIENT, role:", user?.role);
        message.error("Tài khoản này không phải là Patient");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setLoading(false);
      }
    } catch (error) {
      console.error("Patient Login - Error:", error);
      message.error(error.response?.data?.message || "Đăng nhập thất bại");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <Card className="auth-card">
          <div className="auth-header">
            <HeartOutlined className="auth-icon" />
            <h1>Healthcare System</h1>
            <p>Patient Portal - Cổng thông tin bệnh nhân</p>
          </div>

          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
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
                prefix={<MailOutlined />}
                placeholder="Nhập email của bạn"
                size="large"
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
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-footer">
            <p>
              Chưa có tài khoản? <a href="/patient/register">Đăng ký ngay</a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientLogin;
