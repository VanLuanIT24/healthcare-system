import { useState } from 'react';
import { Form, Input, Button, Alert, Card, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

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
      <div className="auth-container">
        <Card className="auth-card" bordered={false}>
          <Result
            status="success"
            title="Email đã được gửi!"
            subTitle={
              <>
                <p>Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến:</p>
                <p style={{ fontWeight: 'bold', color: '#1890ff' }}>{emailSent}</p>
                <p>Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.</p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                  Link đặt lại mật khẩu sẽ hết hạn sau 1 giờ.
                </p>
              </>
            }
            extra={[
              <Link to="/superadmin/login" key="login">
                <Button type="primary">
                  <ArrowLeftOutlined /> Quay lại đăng nhập
                </Button>
              </Link>
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Card className="auth-card" bordered={false}>
        <div className="auth-header">
          <h1>Quên mật khẩu</h1>
          <p>Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu</p>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          form={form}
          name="forgot-password"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email của bạn"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Gửi email đặt lại mật khẩu
            </Button>
          </Form.Item>

          <div className="auth-footer">
            <Link to="/superadmin/login">
              <ArrowLeftOutlined /> Quay lại đăng nhập
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
