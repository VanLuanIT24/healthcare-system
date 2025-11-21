import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Spin, Divider, Row, Col, Select, DatePicker } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';
import dayjs from 'dayjs';

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
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : '1990-01-01',
          gender: values.gender || 'OTHER'
        },
        role: 'PATIENT'
      };

      console.log('Register payload:', JSON.stringify(userData, null, 2));

      await register(userData);
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/superadmin/login');
    } catch (err) {
      console.log('Register error response:', err.response?.data);
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fdfb 0%, #f5f8ff 50%, #f8fdfb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 20px 40px'
    }}>
      <Spin spinning={loading} size="large">
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 153, 204, 0.08)',
          border: '1px solid #e0f2fe',
          maxWidth: '700px',
          width: '100%'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              display: 'inline-flex',
              marginBottom: '16px'
            }}>
              <Logo size="medium" showText={false} />
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#0099cc',
              marginBottom: '8px'
            }}>
              Đăng Ký Tài Khoản
            </h1>
            <p style={{
              color: '#0077aa',
              fontSize: '14px'
            }}>
              Tạo tài khoản mới để sử dụng Healthcare System
            </p>
          </div>

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            requiredMark="optional"
          >
            {/* Name Row */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="firstName"
                  label={<span style={{ color: '#0099cc', fontWeight: '500' }}>Họ</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ' },
                    { min: 2, message: 'Họ phải có ít nhất 2 ký tự' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#0099cc' }} />}
                    placeholder="Ví dụ: Nguyễn"
                    size="large"
                    disabled={loading}
                    style={{ borderColor: '#a5f3fc', borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="lastName"
                  label={<span style={{ color: '#0099cc', fontWeight: '500' }}>Tên</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên' },
                    { min: 2, message: 'Tên phải có ít nhất 2 ký tự' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#0099cc' }} />}
                    placeholder="Ví dụ: Văn A"
                    size="large"
                    disabled={loading}
                    style={{ borderColor: '#a5f3fc', borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Email */}
            <Form.Item
              name="email"
              label={<span style={{ color: '#0099cc', fontWeight: '500' }}>Email</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                {
                  type: 'email',
                  message: 'Email không hợp lệ'
                }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#0099cc' }} />}
                placeholder="example@email.com"
                size="large"
                type="email"
                disabled={loading}
                style={{ borderColor: '#a5f3fc', borderRadius: '8px' }}
              />
            </Form.Item>

            {/* Phone */}
            <Form.Item
              name="phone"
              label={<span style={{ color: '#0099cc', fontWeight: '500' }}>Số điện thoại</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: 'Số điện thoại phải có 10-11 chữ số'
                }
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#0099cc' }} />}
                placeholder="0901234567"
                size="large"
                disabled={loading}
                style={{ borderColor: '#a5f3fc', borderRadius: '8px' }}
              />
            </Form.Item>

            {/* Date of Birth & Gender Row */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="dateOfBirth"
                  label={<span style={{ color: '#0099cc', fontWeight: '500' }}>Ngày sinh</span>}
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày sinh' }
                  ]}
                >
                  <DatePicker
                    placeholder="Chọn ngày sinh"
                    size="large"
                    style={{ width: '100%', borderColor: '#a5f3fc', borderRadius: '8px' }}
                    disabled={loading}
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      if (!current) return false;
                      return current.isAfter(dayjs(), 'day');
                    }}
                    maxDate={dayjs()}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="gender"
                  label={<span style={{ color: '#0099cc', fontWeight: '500' }}>Giới tính</span>}
                  rules={[
                    { required: true, message: 'Vui lòng chọn giới tính' }
                  ]}
                >
                  <Select
                    placeholder="Chọn giới tính"
                    size="large"
                    disabled={loading}
                    style={{ borderColor: '#a5f3fc' }}
                  >
                    <Select.Option value="MALE">Nam</Select.Option>
                    <Select.Option value="FEMALE">Nữ</Select.Option>
                    <Select.Option value="OTHER">Khác</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Password */}
            <Form.Item
              name="password"
              label={<span style={{ color: '#0099cc', fontWeight: '500' }}>Mật khẩu</span>}
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
                prefix={<LockOutlined style={{ color: '#0099cc' }} />}
                placeholder="Ít nhất 8 ký tự (A, a, 0-9, @$!%*?&)"
                size="large"
                disabled={loading}
                style={{ borderColor: '#a5f3fc', borderRadius: '8px' }}
              />
            </Form.Item>

            {/* Confirm Password */}
            <Form.Item
              name="confirmPassword"
              label={<span style={{ color: '#0099cc', fontWeight: '500' }}>Xác nhận mật khẩu</span>}
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
                prefix={<LockOutlined style={{ color: '#0099cc' }} />}
                placeholder="Nhập lại mật khẩu"
                size="large"
                disabled={loading}
                style={{ borderColor: '#a5f3fc', borderRadius: '8px' }}
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
                  background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
                  border: 'none',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(0, 153, 204, 0.3)'
                }}
              >
                Đăng Ký <ArrowRightOutlined />
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ borderColor: '#e0f2fe', margin: '24px 0' }} />

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <p style={{
              color: '#0077aa',
              fontSize: '14px',
              margin: 0
            }}>
              Đã có tài khoản?{' '}
              <Link
                to="/superadmin/login"
                style={{
                  color: '#0099cc',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                Đăng nhập ngay
              </Link>
            </p>
            <p style={{
              color: '#64748b',
              fontSize: '12px',
              margin: 0
            }}>
              Quay lại <Link
                to="/"
                style={{
                  color: '#0099cc',
                  textDecoration: 'none'
                }}
              >
                trang chủ
              </Link>
            </p>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default SuperAdminRegister;
