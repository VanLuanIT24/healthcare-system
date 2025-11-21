import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Spin, Row, Col, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';

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
      
      // Navigate based on role
      setTimeout(() => {
        if (userData.role === 'PATIENT') {
          navigate('/patient/dashboard');
        } else if (userData.role === 'DOCTOR') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/superadmin/dashboard');
        }
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fdfb 0%, #f5f8ff 50%, #f8fdfb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 20px 40px'
    }}>
      <Row gutter={32} style={{ maxWidth: '1200px', width: '100%', alignItems: 'center' }}>
        {/* Left side - Brand info */}
        <Col xs={24} lg={12}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
              borderRadius: '20px',
              padding: '40px',
              marginBottom: '30px'
            }}>
              <Logo size="large" showText={false} />
            </div>
            <h1 style={{
              fontSize: '40px',
              fontWeight: '800',
              color: '#0099cc',
              marginBottom: '16px'
            }}>
              Healthcare System
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#0077aa',
              marginBottom: '30px'
            }}>
              Nền tảng quản lý y tế hiện đại
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0099cc' }}>
                  5000+
                </div>
                <div style={{ color: '#0077aa', fontSize: '14px' }}>
                  Bệnh Nhân
                </div>
              </div>
              <Divider type="vertical" style={{ height: '60px', borderColor: '#a5f3fc' }} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0077aa' }}>
                  150+
                </div>
                <div style={{ color: '#0077aa', fontSize: '14px' }}>
                  Bác Sĩ
                </div>
              </div>
              <Divider type="vertical" style={{ height: '60px', borderColor: '#a5f3fc' }} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0099cc' }}>
                  25+
                </div>
                <div style={{ color: '#0077aa', fontSize: '14px' }}>
                  Bệnh Viện
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Right side - Login form */}
        <Col xs={24} lg={12}>
          <Spin spinning={loading} size="large">
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 8px 32px rgba(0, 153, 204, 0.08)',
              border: '1px solid #e0f2fe'
            }}>
              {/* Header */}
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#0099cc',
                  marginBottom: '8px'
                }}>
                  Đăng Nhập
                </h2>
                <p style={{
                  color: '#0077aa',
                  fontSize: '14px'
                }}>
                  Đăng nhập để tiếp tục quản lý hệ thống
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
                    prefix={<UserOutlined style={{ color: '#0099cc' }} />}
                    placeholder="example@email.com"
                    size="large"
                    disabled={loading}
                    style={{
                      borderColor: '#a5f3fc',
                      borderRadius: '8px'
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span style={{ color: '#0099cc', fontWeight: '500' }}>Mật khẩu</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#0099cc' }} />}
                    placeholder="Nhập mật khẩu của bạn"
                    size="large"
                    disabled={loading}
                    style={{
                      borderColor: '#a5f3fc',
                      borderRadius: '8px'
                    }}
                  />
                </Form.Item>

                {/* Remember & Forgot Password */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <label style={{ color: '#0077aa', cursor: 'pointer' }}>
                    <input type="checkbox" /> Nhớ mật khẩu
                  </label>
                  <Link
                    to="/superadmin/forgot-password"
                    style={{
                      color: '#0099cc',
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

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
                    Đăng Nhập <ArrowRightOutlined />
                  </Button>
                </Form.Item>
              </Form>

              {/* Divider */}
              <Divider style={{ borderColor: '#e0f2fe', margin: '24px 0' }}>
                hoặc
              </Divider>

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
                  Chưa có tài khoản?{' '}
                  <Link
                    to="/superadmin/register"
                    style={{
                      color: '#0099cc',
                      fontWeight: '600',
                      textDecoration: 'none'
                    }}
                  >
                    Đăng ký ngay
                  </Link>
                </p>
                <p style={{
                  color: '#64748b',
                  fontSize: '12px',
                  margin: 0
                }}>
                  Hoặc quay lại <Link
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
        </Col>
      </Row>
    </div>
  );
};

export default SuperAdminLogin;
