import { useState } from 'react';
import { Form, Input, Button, Alert, Result, Row, Col, Divider, Space } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../../components/Logo';

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState('');

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

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
        err.response?.data?.error || 
        'Có lỗi xảy ra. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

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
            Email đã được gửi!
          </h2>

          <p style={{
            color: '#0077aa',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến:
          </p>

          <div style={{
            background: '#f0f9ff',
            border: '1px solid #a5f3fc',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <p style={{
              fontWeight: '600',
              color: '#0099cc',
              margin: 0
            }}>
              {emailSent}
            </p>
          </div>

          <p style={{
            color: '#0077aa',
            fontSize: '14px',
            marginBottom: '12px'
          }}>
            Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
          </p>

          <p style={{
            fontSize: '12px',
            color: '#64748b',
            marginBottom: '28px'
          }}>
            💡 Link đặt lại mật khẩu sẽ hết hạn sau 1 giờ. Nếu không nhận được email, hãy kiểm tra thư mục spam.
          </p>

          <Divider style={{ borderColor: '#a5f3fc', margin: '20px 0' }} />

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              size="large"
              block
              onClick={() => window.location.href = '/superadmin/login'}
              style={{
                background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
                border: 'none',
                height: '48px',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(0, 153, 204, 0.3)'
              }}
            >
              <ArrowLeftOutlined /> Quay lại đăng nhập
            </Button>
            <Link to="/" style={{ textDecoration: 'none' }}>
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
                Về trang chủ
              </Button>
            </Link>
          </Space>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
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
              Quên Mật Khẩu?
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#0077aa',
              marginBottom: '20px'
            }}>
              Đừng lo lắng, chúng tôi sẽ giúp bạn khôi phục quyền truy cập.
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
                ✓ Nhập email của bạn
              </p>
              <p style={{
                color: '#0077aa',
                fontSize: '14px',
                margin: '8px 0'
              }}>
                ✓ Nhận email hướng dẫn
              </p>
              <p style={{
                color: '#0077aa',
                fontSize: '14px',
                margin: '8px 0'
              }}>
                ✓ Đặt lại mật khẩu mới
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
                Quên Mật Khẩu
              </h2>
              <p style={{
                color: '#0077aa',
                fontSize: '14px'
              }}>
                Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
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
              name="forgot-password"
              onFinish={handleSubmit}
              layout="vertical"
              requiredMark="optional"
            >
              <Form.Item
                label={<span style={{ color: '#0099cc', fontWeight: '500' }}>Email</span>}
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#0099cc' }} />}
                  placeholder="example@email.com"
                  size="large"
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
                  Gửi Email Đặt Lại Mật Khẩu
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ borderColor: '#a5f3fc', margin: '24px 0' }} />

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
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
              <Link
                to="/"
                style={{
                  color: '#0099cc',
                  textDecoration: 'none',
                  fontSize: '12px'
                }}
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ForgotPassword;
