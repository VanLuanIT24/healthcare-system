import { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Card, Result } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

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
    // Lấy token từ URL query params
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
        // Chuyển về trang login sau 3 giây
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
      <div className="auth-container">
        <Card className="auth-card" bordered={false}>
          <Result
            status="error"
            title="Link không hợp lệ"
            subTitle={error}
            extra={[
              <Link to="/superadmin/forgot-password" key="forgot">
                <Button type="primary">Yêu cầu link mới</Button>
              </Link>,
              <Link to="/superadmin/login" key="login">
                <Button>Quay lại đăng nhập</Button>
              </Link>
            ]}
          />
        </Card>
      </div>
    );
  }

  // Nếu đặt lại mật khẩu thành công
  if (success) {
    return (
      <div className="auth-container">
        <Card className="auth-card" bordered={false}>
          <Result
            status="success"
            title="Đặt lại mật khẩu thành công!"
            subTitle="Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bây giờ."
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            extra={[
              <Link to="/superadmin/login" key="login">
                <Button type="primary">Đăng nhập ngay</Button>
              </Link>
            ]}
          />
          <p style={{ textAlign: 'center', color: '#999', marginTop: '16px' }}>
            Đang chuyển hướng... (3s)
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Card className="auth-card" bordered={false}>
        <div className="auth-header">
          <h1>Đặt lại mật khẩu</h1>
          <p>Nhập mật khẩu mới của bạn</p>
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
          name="reset-password"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Mật khẩu mới"
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
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu mới"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
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
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu mới"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Đặt lại mật khẩu
            </Button>
          </Form.Item>

          <div className="auth-footer">
            <Link to="/superadmin/login">
              Quay lại đăng nhập
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;
