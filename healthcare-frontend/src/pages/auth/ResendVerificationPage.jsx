import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    Divider,
    Form,
    Input,
    Result,
    Space,
    Typography
} from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authAPI from '../../services/api/authAPI';

const { Title, Text, Paragraph } = Typography;

const ResendVerificationPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authAPI.resendVerification(values.email);
      
      if (response.success) {
        setSubmitted(true);
      } else {
        setError(response.error || 'Gửi lại email xác thực thất bại');
      }
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      setError(error.response?.data?.error || error.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const resendAgain = () => {
    setSubmitted(false);
    form.resetFields();
  };

  if (submitted) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5'
      }}>
        <Card style={{ width: '100%', maxWidth: '500px' }}>
          <Result
            status="success"
            title="Email đã được gửi!"
            subTitle="Vui lòng kiểm tra hộp thư đến của bạn và làm theo hướng dẫn để xác thực email."
            extra={[
              <Button type="primary" key="resend" onClick={resendAgain}>
                Gửi lại email khác
              </Button>,
              <Button key="login" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>,
              <Button key="home" onClick={() => navigate('/home')}>
                Về trang chủ
              </Button>
            ]}
          />
          
          <Divider />
          
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
              <Link to="/contact">liên hệ hỗ trợ</Link>
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f2f5'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '500px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            style={{ padding: 0 }}
          >
            Quay lại
          </Button>

          <div style={{ textAlign: 'center' }}>
            <MailOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <Title level={2} style={{ marginTop: '16px', marginBottom: '8px' }}>
              Gửi lại Email Xác thực
            </Title>
            <Paragraph type="secondary">
              Nhập email của bạn để nhận liên kết xác thực mới
            </Paragraph>
          </div>

          {error && (
            <Alert
              message="Lỗi"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark="optional"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input 
                size="large" 
                placeholder="Nhập email của bạn" 
                prefix={<MailOutlined />}
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
                Gửi Email Xác thực
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical" size="small">
              <Text type="secondary">
                Đã có tài khoản?{' '}
                <Link to="/login">Đăng nhập ngay</Link>
              </Text>
              <Text type="secondary">
                Chưa có tài khoản?{' '}
                <Link to="/register">Đăng ký tại đây</Link>
              </Text>
              <Text type="secondary">
                Cần hỗ trợ?{' '}
                <Link to="/contact">Liên hệ chúng tôi</Link>
              </Text>
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ResendVerificationPage;