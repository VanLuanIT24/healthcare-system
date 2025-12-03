import { useState } from "react";
import { Form, Input, Button, Alert, Card, Result } from "antd";
import {
  MailOutlined,
  ArrowLeftOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState("");

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        { email: values.email }
      );

      if (response.data.success) {
        setSuccess(true);
        setEmailSent(values.email);
        form.resetFields();
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Có lỗi xảy ra. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <Card className="auth-card">
          <Result
            status="success"
            title={<h2 style={{ color: "#16a34a" }}>Email đã được gửi!</h2>}
            subTitle={
              <>
                <p>Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến:</p>
                <p style={{ fontWeight: "bold", color: "#4a90e2", margin: "12px 0" }}>
                  {emailSent}
                </p>
                <p>Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.</p>
                <p style={{ fontSize: "12px", color: "#888", marginTop: "16px" }}>
                  Link đặt lại mật khẩu sẽ hết hạn sau 1 giờ.
                </p>
              </>
            }
            extra={[
              <Link to="/login" key="login">
                <Button type="primary" size="large">
                  <ArrowLeftOutlined /> Quay lại đăng nhập
                </Button>
              </Link>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <HeartOutlined style={{ fontSize: "56px", color: "#0F5B8C" }} />
          </div>
          <h1>Quên mật khẩu?</h1>
          <p>Nhập email để nhận hướng dẫn đặt lại mật khẩu</p>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginBottom: "20px", borderRadius: "12px" }}
          />
        )}

        <Form
          form={form}
          name="forgot-password"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          style={{ marginTop: "28px" }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email của bạn"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Gửi email đặt lại mật khẩu
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e0e7ff" }}>
            <Link to="/login">
              <ArrowLeftOutlined /> Quay lại đăng nhập
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;