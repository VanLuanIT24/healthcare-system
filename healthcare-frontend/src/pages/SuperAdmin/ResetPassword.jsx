import { useState, useEffect } from "react";
import { Form, Input, Button, Alert, Card, Result } from "antd";
import {
  LockOutlined,
  CheckCircleOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");

    if (!tokenFromUrl) {
      setInvalidToken(true);
      setError("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          token: token,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/superadmin/login");
        }, 3000);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Có lỗi xảy ra. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <div className="auth-container">
        <Card className="auth-card">
          <Result
            status="error"
            title={<h2 style={{ color: "#ef5350" }}>Link không hợp lệ</h2>}
            subTitle={error}
            extra={[
              <Link to="/superadmin/forgot-password" key="forgot">
                <Button type="primary" size="large">
                  Yêu cầu link mới
                </Button>
              </Link>,
              <Link to="/superadmin/login" key="login">
                <Button size="large">Quay lại đăng nhập</Button>
              </Link>,
            ]}
          />
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-container">
        <Card className="auth-card">
          <Result
            status="success"
            title={
              <h2 style={{ color: "#16a34a" }}>Đặt lại mật khẩu thành công!</h2>
            }
            subTitle="Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bây giờ."
            icon={
              <CheckCircleOutlined
                style={{ color: "#16a34a", fontSize: "56px" }}
              />
            }
            extra={[
              <Link to="/superadmin/login" key="login">
                <Button type="primary" size="large">
                  Đăng nhập ngay
                </Button>
              </Link>,
            ]}
          />
          <p
            style={{
              textAlign: "center",
              color: "#888",
              marginTop: "16px",
              fontSize: "13px",
            }}
          >
            Đang chuyển hướng... (3s)
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <HeartOutlined style={{ fontSize: "56px", color: "#ff6b9d" }} />
          </div>
          <h1>Đặt lại mật khẩu</h1>
          <p>Nhập mật khẩu mới của bạn</p>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            style={{
              marginBottom: "20px",
              borderRadius: "12px",
              marginTop: "20px",
            }}
          />
        )}

        <Form
          form={form}
          name="reset-password"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          style={{ marginTop: "28px" }}
        >
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
              {
                pattern:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message:
                  "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu mới"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu mới"
              autoComplete="new-password"
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
              Đặt lại mật khẩu
            </Button>
          </Form.Item>

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid #e0e7ff",
            }}
          >
            <Link to="/superadmin/login">Quay lại đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;
