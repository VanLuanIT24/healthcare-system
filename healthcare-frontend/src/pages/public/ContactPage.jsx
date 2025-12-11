// 📞 Contact Page
import {
    ClockCircleOutlined,
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Row, Space, Typography } from 'antd';
import { useState } from 'react';
import './PublicPages.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const ContactPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      message.success('Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      form.resetFields();
    } catch (error) {
      message.error('Gửi tin nhắn thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <EnvironmentOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      title: 'Địa chỉ',
      content: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
    },
    {
      icon: <PhoneOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      title: 'Điện thoại',
      content: 'Hotline: 1900-xxxx\nĐiện thoại: (028) 1234 5678',
    },
    {
      icon: <MailOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      title: 'Email',
      content: 'support@healthcare.vn\ninfo@healthcare.vn',
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      title: 'Giờ làm việc',
      content: 'Phục vụ 24/7\nKể cả ngày lễ, Tết',
    },
  ];

  return (
    <div className="public-page contact-page">
      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <Title level={1} style={{ color: 'white', textAlign: 'center' }}>
            Liên hệ với chúng tôi
          </Title>
          <Paragraph style={{ color: 'white', textAlign: 'center', fontSize: 18 }}>
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </Paragraph>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="section">
        <div className="container">
          <Row gutter={[24, 24]}>
            {contactInfo.map((info, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card className="contact-info-card" hoverable style={{ textAlign: 'center', height: '100%' }}>
                  {info.icon}
                  <Title level={4} style={{ marginTop: 16, marginBottom: 12 }}>
                    {info.title}
                  </Title>
                  <Text style={{ whiteSpace: 'pre-line', color: '#666' }}>
                    {info.content}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="section" style={{ background: '#f5f5f5' }}>
        <div className="container">
          <Row gutter={[48, 48]}>
            {/* Contact Form */}
            <Col xs={24} md={12}>
              <Card title="Gửi tin nhắn cho chúng tôi" variant="borderless">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Form.Item
                    name="name"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                  >
                    <Input placeholder="Nguyễn Văn A" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' },
                    ]}
                  >
                    <Input placeholder="example@email.com" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                  >
                    <Input placeholder="0901234567" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="subject"
                    label="Chủ đề"
                    rules={[{ required: true, message: 'Vui lòng nhập chủ đề' }]}
                  >
                    <Input placeholder="Tôi muốn tư vấn về..." size="large" />
                  </Form.Item>

                  <Form.Item
                    name="message"
                    label="Nội dung"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      block
                    >
                      Gửi tin nhắn
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            {/* Map & Additional Info */}
            <Col xs={24} md={12}>
              <Card title="Bản đồ" variant="borderless" style={{ marginBottom: 24 }}>
                <div style={{ width: '100%', height: 300, background: '#f0f0f0', borderRadius: 8 }}>
                  <iframe
                    title="Google Maps"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4968814688983!2d106.69522631533429!3d10.776107062175185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0xb2b7d81875357e3!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6puIC0gxJDEg2kgaOG7jWMgUXXhu5FjIGdpYSBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmg!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: 8 }}
                    allowFullScreen=""
                    loading="lazy"
                  />
                </div>
              </Card>

              <Card variant="borderless">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Title level={4}>📍 Cơ sở chính</Title>
                    <Paragraph>
                      123 Đường ABC, Phường 1, Quận 1<br />
                      TP. Hồ Chí Minh, Việt Nam
                    </Paragraph>
                  </div>

                  <div>
                    <Title level={4}>🏥 Chi nhánh</Title>
                    <Paragraph>
                      <strong>Chi nhánh 1:</strong> 456 Đường XYZ, Quận 3<br />
                      <strong>Chi nhánh 2:</strong> 789 Đường DEF, Quận 7
                    </Paragraph>
                  </div>

                  <div>
                    <Title level={4}>📞 Tổng đài hỗ trợ</Title>
                    <Paragraph>
                      <strong>Hotline 24/7:</strong> 1900-xxxx<br />
                      <strong>Khẩn cấp:</strong> 0901-xxx-xxx<br />
                      <strong>Email:</strong> support@healthcare.vn
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
