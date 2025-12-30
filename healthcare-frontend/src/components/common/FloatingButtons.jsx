// src/components/common/FloatingButtons.jsx
import {
    ArrowUpOutlined,
    CalendarOutlined,
    CustomerServiceOutlined,
    MessageOutlined,
    PhoneOutlined,
    WhatsAppOutlined
} from '@ant-design/icons';
import { Button, FloatButton, Form, Input, message, Modal } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingButtons = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleQuickChat = async (values) => {
    console.log('Quick chat:', values);
    message.success('Tin nhắn đã được gửi! Chúng tôi sẽ liên hệ lại sớm nhất.');
    form.resetFields();
    setChatOpen(false);
  };

  return (
    <>
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24, bottom: 24 }}
        icon={<CustomerServiceOutlined />}
        tooltip="Hỗ trợ"
      >
        {/* Đặt lịch nhanh */}
        <FloatButton
          icon={<CalendarOutlined />}
          tooltip="Đặt lịch khám"
          onClick={() => navigate('/booking')}
          style={{ backgroundColor: '#52c41a' }}
        />

        {/* Chat nhanh */}
        <FloatButton
          icon={<MessageOutlined />}
          tooltip="Chat với chúng tôi"
          onClick={() => setChatOpen(true)}
        />

        {/* Hotline */}
        <FloatButton
          icon={<PhoneOutlined />}
          tooltip="Hotline: 1800-XXXX"
          onClick={() => window.location.href = 'tel:1800xxxx'}
        />

        {/* Zalo */}
        <FloatButton
          icon={<WhatsAppOutlined />}
          tooltip="Chat Zalo"
          onClick={() => window.open('https://zalo.me/your-id', '_blank')}
          style={{ backgroundColor: '#0068ff' }}
        />
      </FloatButton.Group>

      {/* Back to top */}
      <FloatButton.BackTop
        style={{ right: 24, bottom: 100 }}
        icon={<ArrowUpOutlined />}
        tooltip="Lên đầu trang"
        visibilityHeight={400}
      />

      {/* Quick Chat Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <MessageOutlined className="text-blue-500" />
            <span>Chat nhanh với HealthCare</span>
          </div>
        }
        open={chatOpen}
        onCancel={() => setChatOpen(false)}
        footer={null}
        width={400}
      >
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Gửi tin nhắn cho chúng tôi, nhân viên tư vấn sẽ liên hệ lại trong vòng 5 phút!
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleQuickChat}
        >
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập SĐT' },
              { pattern: /^[0-9]{10}$/, message: 'SĐT không hợp lệ' },
            ]}
          >
            <Input placeholder="0912345678" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Tôi muốn đặt lịch khám tim mạch..." 
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block size="large">
              Gửi tin nhắn
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-4 text-center text-sm text-gray-500">
          Hoặc gọi ngay{' '}
          <a href="tel:1800xxxx" className="text-blue-500 font-semibold">
            1800-XXXX
          </a>{' '}
          (Miễn phí)
        </div>
      </Modal>
    </>
  );
};

export default FloatingButtons;
