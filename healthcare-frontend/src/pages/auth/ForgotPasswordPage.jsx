// 🔐 Forgot Password Page
import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Result, Typography } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import authAPI from '../../services/api/authAPI';
import './ForgotPasswordPage.css';

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(values.email);
      setEmailSent(true);
    } catch (error) {
      // Error is handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="forgot-password-card" variant="borderless">
        <Result
          status="success"
          title="Email đã được gửi!"
          subTitle="Vui lòng kiểm tra email để reset mật khẩu. Link sẽ hết hạn sau 1 giờ."
          extra={[
            <Button type="primary" key="back">
              <Link to="/login">Quay lại đăng nhập</Link>
            </Button>,
          ]}
        />
      </Card>
    );
  }

  return (
    <Card className="forgot-password-card" variant="borderless">
      <div className="forgot-password-header">
        <Title level={2}>Quên mật khẩu?</Title>
        <Text type="secondary">
          Nhập email của bạn và chúng tôi sẽ gửi link để reset mật khẩu
        </Text>
      </div>

      <Form
        form={form}
        name="forgot-password"
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
          <Input prefix={<MailOutlined />} placeholder="Email của bạn" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="submit-button"
          >
            Gửi link reset mật khẩu
          </Button>
        </Form.Item>

        <div className="back-to-login">
          <Link to="/login">
            <ArrowLeftOutlined /> Quay lại đăng nhập
          </Link>
        </div>
      </Form>
    </Card>
  );
};

export default ForgotPasswordPage;
