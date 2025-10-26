import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Spin, Divider, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, HeartOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import '../styles/Auth.css';

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
          phone: values.phone
        },
        role: 'SUPER_ADMIN'
      };

      await register(userData);
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/superadmin/login');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <Spin spinning={loading} size="large">
          <Card
            className="auth-card w-full max-w-2xl shadow-xl"
            style={{
              borderRadius: '12px',
              background: 'white'
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <HeartOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Healthcare System
              </h1>
              <p className="text-gray-600">Đăng ký tài khoản Super Admin</p>
            </div>

            <Divider />

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
                      { required: true, message: 'Vui lòng nhập họ' },
                      { min: 2, message: 'Họ phải có ít nhất 2 ký tự' }
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
                      { required: true, message: 'Vui lòng nhập tên' },
                      { min: 2, message: 'Tên phải có ít nhất 2 ký tự' }
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
                  { required: true, message: 'Vui lòng nhập email' },
                  {
                    type: 'email',
                    message: 'Email không hợp lệ'
                  }
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
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: 'Số điện thoại phải có 10-11 chữ số'
                  }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="nhập số điện thoại"
                  size="large"
                  disabled={loading}
                />
              </Form.Item>

              {/* Password */}
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  {
                    min: 8,
                    message: 'Mật khẩu phải có ít nhất 8 ký tự'
                  },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt'
                  }
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
                  { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error('Mật khẩu xác nhận không khớp')
                      );
                    }
                  })
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
                  style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff'
                  }}
                >
                  Đăng ký
                </Button>
              </Form.Item>
            </Form>

            <Divider />

            {/* Footer */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Đã có tài khoản?{' '}
                <Link
                  to="/superadmin/login"
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </Card>
        </Spin>
      </div>
    </div>
  );
};

export default SuperAdminRegister;
