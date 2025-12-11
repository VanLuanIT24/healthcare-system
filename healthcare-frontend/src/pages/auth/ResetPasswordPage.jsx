// 🔐 Reset Password Page
import { CheckCircleOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Progress, Result, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import authAPI from '../../services/api/authAPI';
import './ResetPasswordPage.css';

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { token } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setPasswordStrength(checkPasswordStrength(password));
  };

  const getStrengthStatus = () => {
    if (passwordStrength < 25) return 'exception';
    if (passwordStrength < 50) return 'normal';
    if (passwordStrength < 75) return 'active';
    return 'success';
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authAPI.resetPassword(token, values.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      // Error handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="reset-password-card" variant="borderless">
        <Result
          icon={<CheckCircleOutlined />}
          status="success"
          title="Mật khẩu đã được đặt lại thành công!"
          subTitle="Đang chuyển hướng đến trang đăng nhập..."
          extra={[
            <Button type="primary" key="login">
              <Link to="/login">Đăng nhập ngay</Link>
            </Button>,
          ]}
        />
      </Card>
    );
  }

  return (
    <Card className="reset-password-card" variant="borderless">
      <div className="reset-password-header">
        <Title level={2}>Đặt mật khẩu mới</Title>
        <Text type="secondary">
          Vui lòng nhập mật khẩu mới của bạn
        </Text>
      </div>

      <Form
        form={form}
        name="reset-password"
        onFinish={onFinish}
        size="large"
        layout="vertical"
      >
        <Form.Item
          name="password"
          label="Mật khẩu mới"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập mật khẩu mới!',
            },
            {
              min: 8,
              message: 'Mật khẩu phải có ít nhất 8 ký tự!',
            },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Mật khẩu phải chứa chữ hoa, chữ thường và số!',
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Mật khẩu mới"
            onChange={handlePasswordChange}
          />
        </Form.Item>

        {passwordStrength > 0 && (
          <div className="password-strength">
            <Progress
              percent={passwordStrength}
              status={getStrengthStatus()}
              showInfo={false}
              strokeWidth={6}
            />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
              Độ mạnh: {passwordStrength < 50 ? 'Yếu' : passwordStrength < 75 ? 'Trung bình' : 'Mạnh'}
            </Text>
          </div>
        )}

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: 'Vui lòng xác nhận mật khẩu!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Xác nhận mật khẩu"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="submit-button"
          >
            Đặt lại mật khẩu
          </Button>
        </Form.Item>

        <div className="back-to-login">
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </Form>
    </Card>
  );
};

export default ResetPasswordPage;
