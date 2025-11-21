import { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Result, Row, Col, Divider, Space } from 'antd';
import { LockOutlined, CheckCircleOutlined, CloseCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../../components/Logo';

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    
    if (!tokenFromUrl) {
      setInvalidToken(true);
      setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          token: token,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/superadmin/login');
        }, 3000);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Có lỗi xảy ra. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Nếu token không hợp lệ
  if (invalidToken) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fdfb 0%, #f5f8ff 50%, #f8fdfb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '60px 40px',
          boxShadow: '0 8px 32px rgba(0, 153, 204, 0.08)',
          border: '1px solid #e0f2fe',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <CloseCircleOutlined style={{
              fontSize: '48px',
              color: '#ffffff'
            }} />
          </div>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#ef4444',
            marginBottom: '12px'
          }}>
            Link không hợp lệ
          </h2>

          <p style={{
            color: '#0077aa',
            fontSize: '14px',
            marginBottom: '28px'
          }}>
            {error}
          </p>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              size="large"
              block
              onClick={() => navigate('/superadmin/forgot-password')}
              style={{
                background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
                border: 'none',
                height: '48px',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(0, 153, 204, 0.3)'
              }}
            >
              Yêu cầu Link Mới
            </Button>
            <Link to="/superadmin/login" style={{ textDecoration: 'none' }}>
              <Button
                size="large"
                block
                style={{
                  borderColor: '#a5f3fc',
                  color: '#0099cc',
                  height: '48px',
                  fontSize: '16px'
                }}
              >
                <ArrowLeftOutlined /> Quay lại đăng nhập
              </Button>
            </Link>
          </Space>
        </div>
      </div>
    );
  }

  // Nếu đặt lại mật khẩu thành công
  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fdfb 0%, #f5f8ff 50%, #f8fdfb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '60px 40px',
          boxShadow: '0 8px 32px rgba(0, 153, 204, 0.08)',
          border: '1px solid #e0f2fe',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <CheckCircleOutlined style={{
              fontSize: '48px',
              color: '#ffffff'
            }} />
          </div>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#0099cc',
            marginBottom: '12px'
          }}>
            Đặt Lại Mật Khẩu Thành Công!
          </h2>

          <p style={{
            color: '#0077aa',
            fontSize: '14px',
            marginBottom: '28px'
          }}>
            Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể đăng nhập ngay bây giờ.
          </p>

          <Button
            type="primary"
            size="large"
            block
            onClick={() => navigate('/superadmin/login')}
            style={{
              background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
              border: 'none',
              height: '48px',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(0, 153, 204, 0.3)'
            }}
          >
            Đăng Nhập Ngay
          </Button>

          <p style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: '12px',
            margin: 0
          }}>
            Đang chuyển hướng trong 3 giây...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fdfb 0%, #f5f8ff 50%, #f8fdfb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row gutter={32} style={{ maxWidth: '1200px', width: '100%', alignItems: 'center' }}>
        {/* Left side - Info */}
        <Col xs={24} lg={12} style={{ display: { xs: 'none', lg: 'block' } }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
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
              Đặt Lại Mật Khẩu
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#0077aa',
              marginBottom: '20px'
            }}>
              Tạo mật khẩu mạnh mới cho tài khoản của bạn.
            </p>
            <div style={{
              background: 'rgba(0, 153, 204, 0.03)',
              borderLeft: '4px solid #0099cc',
              padding: '16px',
              borderRadius: '4px'
            }}>
              <p style={{
                color: '#0077aa',
                fontSize: '14px',
                margin: '8px 0'
              }}>
                ✓ Mật khẩu ít nhất 8 ký tự
              </p>
              <p style={{
                color: '#0077aa',
                fontSize: '14px',
                margin: '8px 0'
              }}>
                ✓ Chứa chữ hoa, chữ thường
              </p>
              <p style={{
                color: '#0077aa',
                fontSize: '14px',
                margin: '8px 0'
              }}>
                ✓ Chứa số và ký tự đặc biệt
              </p>
            </div>
          </div>
        </Col>

        {/* Right side - Form */}
        <Col xs={24} lg={12}>
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
                Đặt Lại Mật Khẩu
              </h2>
              <p style={{
                color: '#0077aa',
                fontSize: '14px'
              }}>
                Nhập mật khẩu mới của bạn
              </p>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError('')}
                style={{
                  marginBottom: '20px',
                  borderColor: '#ef4444',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b'
                }}
              />
            )}

            <Form
              form={form}
              name="reset-password"
              onFinish={handleSubmit}
              layout="vertical"
              requiredMark="optional"
            >
              <Form.Item
                label={<span style={{ color: '#0099cc', fontWeight: '500' }}>Mật khẩu mới</span>}
                name="newPassword"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt!'
                  }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#0099cc' }} />}
                  placeholder="Nhập mật khẩu mới"
                  size="large"
                  autoComplete="new-password"
                  style={{
                    borderColor: '#a5f3fc',
                    borderRadius: '8px'
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: '#0099cc', fontWeight: '500' }}>Xác nhận mật khẩu</span>}
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    }
                  })
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#0099cc' }} />}
                  placeholder="Xác nhận mật khẩu mới"
                  size="large"
                  autoComplete="new-password"
                  style={{
                    borderColor: '#a5f3fc',
                    borderRadius: '8px'
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: '20px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
                    border: 'none',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(0, 153, 204, 0.3)'
                  }}
                >
                  Đặt Lại Mật Khẩu
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ borderColor: '#a5f3fc', margin: '24px 0' }} />

            {/* Footer */}
            <div style={{
              textAlign: 'center'
            }}>
              <Link
                to="/superadmin/login"
                style={{
                  color: '#0099cc',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                <ArrowLeftOutlined /> Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ResetPassword;
