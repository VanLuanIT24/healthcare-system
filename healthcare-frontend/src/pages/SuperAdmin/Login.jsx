import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Spin, Space } from 'antd';
import { UserOutlined, LockOutlined, HeartOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import '../styles/Auth.css';

const SuperAdminLogin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const userData = await login(values.email, values.password);
      
      console.log('Login successful, user data:', userData);
      
      message.success('Đăng nhập thành công!');
      
      // Navigate immediately
      setTimeout(() => {
        navigate('/superadmin/dashboard');
      }, 100);
      
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Spin spinning={loading} size="large">
          <Card
            className="auth-card w-full max-w-md shadow-xl"
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
              <p className="text-gray-600">Đăng nhập Super Admin</p>
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
                  { required: true, message: 'Vui lòng nhập email' },
                  {
                    type: 'email',
                    message: 'Email không hợp lệ'
                  }
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
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' }
                ]}
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
                  style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff'
                  }}
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            {/* Footer */}
            <div className="text-center space-y-3">
              <p className="text-gray-600 text-sm">
                Chưa có tài khoản?{' '}
                <Link
                  to="/superadmin/register"
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Đăng ký
                </Link>
              </p>
              <p className="text-gray-600 text-sm">
                <Link
                  to="/superadmin/forgot-password"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Quên mật khẩu?
                </Link>
              </p>
            </div>
          </Card>
        </Spin>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
