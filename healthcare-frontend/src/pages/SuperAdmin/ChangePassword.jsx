import { useState } from 'react';
import { Form, Input, Button, Alert, Card, message } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const ChangePassword = () => {
  const [form] = Form.useForm();
  const { logout } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        form.resetFields();
        
        // Đăng xuất sau 2 giây
        setTimeout(() => {
          logout();
        }, 2000);
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

  return (
    <Card 
      title={
        <span>
          <LockOutlined /> Đổi mật khẩu
        </span>
      }
      style={{ maxWidth: 600, margin: '0 auto' }}
    >
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

      <Alert
        message="Lưu ý"
        description="Sau khi đổi mật khẩu thành công, bạn sẽ được đăng xuất và cần đăng nhập lại với mật khẩu mới."
        type="info"
        showIcon
        icon={<CheckCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        name="change-password"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
      >
        <Form.Item
          label="Mật khẩu hiện tại"
          name="currentPassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu hiện tại"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
              message: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt!'
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('currentPassword') !== value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu mới không được trùng với mật khẩu hiện tại!'));
              }
            })
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu mới"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
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
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePassword;
