// src/pages/public/Content/ContactPage.jsx
import { PageHeader } from '@/components/common';
import {
    ClockCircleOutlined,
    EnvironmentOutlined,
    FacebookOutlined,
    MailOutlined,
    PhoneOutlined,
    SendOutlined,
    YoutubeOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Row } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';

const { TextArea } = Input;

const ContactPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Contact form:', values);
      message.success('Tin nhắn đã được gửi! Chúng tôi sẽ liên hệ lại sớm nhất.');
      form.resetFields();
      setLoading(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: <PhoneOutlined />,
      title: 'Hotline',
      content: '1800-XXXX (Miễn phí)',
      subContent: '028-1234-5678',
      color: '#1890ff',
    },
    {
      icon: <MailOutlined />,
      title: 'Email',
      content: 'info@healthcare.vn',
      subContent: 'support@healthcare.vn',
      color: '#52c41a',
    },
    {
      icon: <EnvironmentOutlined />,
      title: 'Địa chỉ',
      content: '123 Nguyễn Văn Linh, Quận 7',
      subContent: 'TP. Hồ Chí Minh',
      color: '#eb2f96',
    },
    {
      icon: <ClockCircleOutlined />,
      title: 'Giờ làm việc',
      content: 'Thứ 2 - Chủ nhật',
      subContent: '7:00 - 20:00',
      color: '#faad14',
    },
  ];

  const departments = [
    { name: 'Cấp cứu', phone: '028-1234-1111' },
    { name: 'Khám bệnh', phone: '028-1234-2222' },
    { name: 'Xét nghiệm', phone: '028-1234-3333' },
    { name: 'Chăm sóc khách hàng', phone: '028-1234-4444' },
  ];

  return (
    <div>
      <PageHeader
        title="Liên hệ"
        subtitle="Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn"
        backgroundImage="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1920"
      />

      <div className="container mx-auto px-4 py-12">
        <Row gutter={[48, 48]}>
          {/* Contact Form */}
          <Col xs={24} lg={14}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Gửi tin nhắn cho chúng tôi
                </h2>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="name"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                      >
                        <Input size="large" placeholder="Nguyễn Văn A" className="rounded-lg" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
                      >
                        <Input size="large" placeholder="0912345678" className="rounded-lg" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' },
                    ]}
                  >
                    <Input size="large" placeholder="email@example.com" className="rounded-lg" />
                  </Form.Item>

                  <Form.Item
                    name="subject"
                    label="Tiêu đề"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                  >
                    <Input size="large" placeholder="Tôi muốn hỏi về..." className="rounded-lg" />
                  </Form.Item>

                  <Form.Item
                    name="message"
                    label="Nội dung"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                  >
                    <TextArea
                      rows={5}
                      placeholder="Nội dung tin nhắn của bạn..."
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={loading}
                      icon={<SendOutlined />}
                      className="rounded-lg px-8"
                    >
                      Gửi tin nhắn
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </motion.div>
          </Col>

          {/* Contact Info */}
          <Col xs={24} lg={10}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Info Cards */}
              <Row gutter={[16, 16]}>
                {contactInfo.map((info, index) => (
                  <Col xs={24} sm={12} key={index}>
                    <Card className="h-full rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: `${info.color}20`, color: info.color }}
                        >
                          {info.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{info.title}</div>
                          <div className="text-gray-600">{info.content}</div>
                          <div className="text-sm text-gray-500">{info.subContent}</div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Department Contacts */}
              <Card className="rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Liên hệ theo bộ phận</h3>
                <div className="space-y-3">
                  {departments.map((dept, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="text-gray-600">{dept.name}</span>
                      <a href={`tel:${dept.phone.replace(/-/g, '')}`} className="text-blue-600 font-medium">
                        {dept.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Social */}
              <Card className="rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Kết nối với chúng tôi</h3>
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center text-xl hover:bg-blue-600 transition-colors"
                  >
                    <FacebookOutlined />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center text-xl hover:bg-red-600 transition-colors"
                  >
                    <YoutubeOutlined />
                  </a>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          <Card className="rounded-xl overflow-hidden">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Vị trí bệnh viện</h2>
            <div className="rounded-xl overflow-hidden h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0!2d106.7!3d10.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQyJzAwLjAiTiAxMDbCsDQyJzAwLjAiRQ!5e0!3m2!1svi!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="HealthCare Location"
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
