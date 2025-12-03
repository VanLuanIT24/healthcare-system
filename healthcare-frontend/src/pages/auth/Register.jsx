import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Row,
  Col,
  DatePicker,
  Select,
  Divider,
} from "antd";
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  PhoneOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const registerData = {
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
          gender: values.gender,
        },
        role: "PATIENT", // Mặc định đăng ký là PATIENT
      };

      await register(registerData);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      console.error("Register Error:", error);
      message.error(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" style={{ maxWidth: "520px", width: "100%" }}>
        <div className="text-center">
          <HeartOutlined style={{ fontSize: "56px", color: "#0F5B8C", marginBottom: "16px" }} />
          <h1>Healthcare System</h1>
          <p>Đăng ký tài khoản bệnh nhân</p>
        </div>

        <Divider style={{ margin: "20px 0" }} />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
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
                  placeholder="Nhập họ"
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
                  placeholder="Nhập tên"
                  size="large"
                  disabled={loading}
                />
              </Form.Item>
            </Col>
          </Row>

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
              placeholder="Nhập email"
              size="large"
              type="email"
              disabled={loading}
            />
          </Form.Item>

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
              placeholder="Nhập số điện thoại"
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker
                  style={{ width: "100%", height: "40px" }}
                  placeholder="Chọn ngày sinh"
                  disabled={loading}
                  disabledDate={(current) => current && current > dayjs().endOf("day")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select
                  placeholder="Chọn giới tính"
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

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu mạnh"
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu"
              size="large"
              disabled={loading}
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
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: "20px 0" }} />

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;