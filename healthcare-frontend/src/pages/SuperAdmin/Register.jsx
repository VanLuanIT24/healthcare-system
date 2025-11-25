import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Spin,
  Divider,
  Row,
  Col,
  DatePicker,
  Select,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  HeartOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";
import "../styles/Auth.css";

const SuperAdminRegister = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const userData = {
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.toISOString()
            : null,
          gender: values.gender,
        },
        role: "SUPER_ADMIN",
      };

      await register(userData);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/superadmin/login");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Spin spinning={loading} size="large">
        <Card
          className="auth-card"
          style={{ maxWidth: "520px", width: "100%" }}
        >
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <HeartOutlined style={{ fontSize: "56px", color: "#ff6b9d" }} />
            </div>
            <h1>Healthcare System</h1>
            <p>Đăng ký tài khoản Super Admin</p>
          </div>

          <Divider style={{ margin: "20px 0" }} />

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            {/* Name Row */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="firstName"
                  label="Họ"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ" },
                    { min: 2, message: "Họ phải có ít nhất 2 ký tự" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="nhập họ"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="lastName"
                  label="Tên"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên" },
                    { min: 2, message: "Tên phải có ít nhất 2 ký tự" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="nhập tên"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Email */}
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
                prefix={<MailOutlined />}
                placeholder="nhập email"
                size="large"
                type="email"
                disabled={loading}
              />
            </Form.Item>

            {/* Phone */}
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại phải có 10-11 chữ số",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="nhập số điện thoại"
                size="large"
                disabled={loading}
              />
            </Form.Item>

            {/* Date of Birth and Gender Row */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="dateOfBirth"
                  label="Ngày sinh"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%", height: "40px" }}
                    placeholder="chọn ngày sinh"
                    disabled={loading}
                    disabledDate={(current) =>
                      current && current > dayjs().endOf("day")
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[
                    { required: true, message: "Vui lòng chọn giới tính" },
                  ]}
                >
                  <Select
                    placeholder="chọn giới tính"
                    size="large"
                    disabled={loading}
                    options={[
                      { label: "Nam", value: "MALE" },
                      { label: "Nữ", value: "FEMALE" },
                      { label: "Khác", value: "OTHER" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Password */}
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                {
                  min: 8,
                  message: "Mật khẩu phải có ít nhất 8 ký tự",
                },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message:
                    "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="nhập mật khẩu mạnh"
                size="large"
                disabled={loading}
              />
            </Form.Item>

            {/* Confirm Password */}
            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="xác nhận mật khẩu"
                size="large"
                disabled={loading}
              />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item>
              <Button
                type="primary"
                size="large"
                block
                loading={loading}
                htmlType="submit"
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: "20px 0" }} />

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Đã có tài khoản?{" "}
              <Link to="/superadmin/login">Đăng nhập ngay</Link>
            </p>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default SuperAdminRegister;
