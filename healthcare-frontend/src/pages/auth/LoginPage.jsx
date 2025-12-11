// 🔐 Login Page
import { LockOutlined, MedicineBoxOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Input, message, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if already authenticated on mount only
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || getDashboardRoute();
      navigate(from, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password);
      
      if (result.success && result.user) {
        message.success('Đăng nhập thành công!');
        
        // Get dashboard route based on user role from login result
        const roleRoutes = {
          'SUPER_ADMIN': '/dashboard/super-admin',
          'HOSPITAL_ADMIN': '/dashboard/hospital-admin',
          'DEPARTMENT_HEAD': '/dashboard/hospital-admin',
          'DOCTOR': '/dashboard/doctor',
          'NURSE': '/dashboard/nurse',
          'PHARMACIST': '/dashboard/pharmacist',
          'LAB_TECHNICIAN': '/dashboard/lab-technician',
          'RECEPTIONIST': '/dashboard/receptionist',
          'BILLING_STAFF': '/dashboard/billing',
          'PATIENT': '/dashboard/patient',
        };
        
        const dashboardRoute = roleRoutes[result.user.role] || '/dashboard/patient';
        const from = location.state?.from?.pathname || dashboardRoute;
        
        // Navigate immediately
        navigate(from, { replace: true });
      } else {
        message.error(result.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (error) {
      message.error(error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card" variant="borderless">
        <div className="login-header">
          <div className="login-icon">
            <MedicineBoxOutlined />
          </div>
          <Title level={2} className="login-title">
            Healthcare System
          </Title>
          <Text type="secondary">Đăng nhập vào hệ thống quản lý bệnh viện</Text>
        </div>

        <Form
          name="login"
          className="login-form"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập email!',
              },
              {
                type: 'email',
                message: 'Email không hợp lệ!',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập mật khẩu!',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <div className="login-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" className="forgot-password-link">
                Quên mật khẩu?
              </Link>
            </div>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text type="secondary">
                Chưa nhận được email xác thực?{' '}
                <Link to="/resend-verification">Gửi lại email</Link>
              </Text>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              loading={loading}
              block
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <Text type="secondary" className="version-text">
            Version 1.0.0
          </Text>
        </div>
      </Card>

      <div className="demo-credentials">
        <Card size="small" title="🎯 Demo Accounts" className="demo-card">
          <div className="demo-list">
            <div><strong>Super Admin:</strong> superadmin@healthcare.vn</div>
            <div><strong>Doctor:</strong> doctor@healthcare.vn</div>
            <div><strong>Nurse:</strong> nurse@healthcare.vn</div>
            <div><strong>Patient:</strong> patient@healthcare.vn</div>
            <div className="demo-password"><em>Password: Healthcare@2024</em></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
