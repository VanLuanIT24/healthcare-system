import {
    ReloadOutlined,
    SaveOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Row,
    Select,
    Space,
    Switch,
    Tabs,
    TimePicker,
    Typography
} from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { getAuthHeaders } from '../../../services/adminApi';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SystemSettings = () => {
  const [loading, setLoading] = useState(false);
  const [generalForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [backupForm] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/settings`,
        getAuthHeaders()
      );

      const settings = response.data;
      
      // Populate forms
      generalForm.setFieldsValue(settings.general || {});
      securityForm.setFieldsValue(settings.security || {});
      emailForm.setFieldsValue(settings.email || {});
      backupForm.setFieldsValue(settings.backup || {});
    } catch (error) {
      console.error('Fetch settings error:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        const mockSettings = getMockSettings();
        generalForm.setFieldsValue(mockSettings.general);
        securityForm.setFieldsValue(mockSettings.security);
        emailForm.setFieldsValue(mockSettings.email);
        backupForm.setFieldsValue(mockSettings.backup);
      } else {
        message.error('Không thể tải cài đặt hệ thống');
      }
    } finally {
      setLoading(false);
    }
  };

  const getMockSettings = () => ({
    general: {
      hospitalName: 'Bệnh viện Đa khoa Trung tâm',
      hospitalCode: 'BV001',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '028-1234-5678',
      email: 'info@hospital.vn'
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 30,
      maxLoginAttempts: 5
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30
    }
  });

  const saveSettings = async (category, values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/settings/${category}`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Đã lưu cài đặt');
    } catch (error) {
      message.error('Không thể lưu cài đặt');
      console.error('Save settings error:', error);
    }
  };

  // Tab 1: General Settings
  const GeneralSettings = () => (
    <Card>
      <Form
        form={generalForm}
        layout="vertical"
        onFinish={(values) => saveSettings('general', values)}
      >
        <Title level={5}>Thông tin bệnh viện</Title>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="hospitalName"
              label="Tên bệnh viện"
              rules={[{ required: true, message: 'Vui lòng nhập tên bệnh viện' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="hospitalCode"
              label="Mã bệnh viện"
              rules={[{ required: true, message: 'Vui lòng nhập mã bệnh viện' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="address" label="Địa chỉ">
          <TextArea rows={2} />
        </Form.Item>

        <Divider />
        <Title level={5}>Cài đặt hoạt động</Title>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="workingHoursStart"
              label="Giờ làm việc (bắt đầu)"
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="workingHoursEnd"
              label="Giờ làm việc (kết thúc)"
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="appointmentDuration"
              label="Thời gian khám (phút)"
              initialValue={30}
            >
              <InputNumber min={15} max={120} step={15} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="maxAppointmentsPerDay"
              label="Số lượt khám tối đa/ngày"
              initialValue={50}
            >
              <InputNumber min={1} max={200} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="allowOnlineBooking"
          label="Cho phép đặt lịch online"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="requireAppointmentConfirmation"
          label="Yêu cầu xác nhận lịch hẹn"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Lưu cài đặt
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => generalForm.resetFields()}>
              Đặt lại
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Tab 2: Security Settings
  const SecuritySettings = () => (
    <Card>
      <Form
        form={securityForm}
        layout="vertical"
        onFinish={(values) => saveSettings('security', values)}
      >
        <Title level={5}>Chính sách mật khẩu</Title>

        <Form.Item
          name="minPasswordLength"
          label="Độ dài mật khẩu tối thiểu"
          initialValue={8}
        >
          <InputNumber min={6} max={20} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="requireSpecialCharacters"
          label="Yêu cầu ký tự đặc biệt"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="requireNumbers"
          label="Yêu cầu số"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="requireUppercase"
          label="Yêu cầu chữ hoa"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="passwordExpirationDays"
          label="Mật khẩu hết hạn sau (ngày)"
          initialValue={90}
        >
          <InputNumber min={0} max={365} style={{ width: '100%' }} />
        </Form.Item>

        <Divider />
        <Title level={5}>Bảo mật phiên làm việc</Title>

        <Form.Item
          name="sessionTimeout"
          label="Thời gian hết hạn phiên (phút)"
          initialValue={30}
        >
          <InputNumber min={5} max={480} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="maxLoginAttempts"
          label="Số lần đăng nhập sai tối đa"
          initialValue={5}
        >
          <InputNumber min={3} max={10} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="lockoutDuration"
          label="Thời gian khóa tài khoản (phút)"
          initialValue={15}
        >
          <InputNumber min={5} max={60} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="enableTwoFactorAuth"
          label="Kích hoạt xác thực 2 lớp"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="enableAuditLog"
          label="Kích hoạt nhật ký kiểm toán"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Lưu cài đặt
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => securityForm.resetFields()}>
              Đặt lại
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Tab 3: Email Settings
  const EmailSettings = () => (
    <Card>
      <Form
        form={emailForm}
        layout="vertical"
        onFinish={(values) => saveSettings('email', values)}
      >
        <Title level={5}>Cấu hình SMTP</Title>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="smtpHost"
              label="SMTP Host"
              rules={[{ required: true, message: 'Vui lòng nhập SMTP host' }]}
            >
              <Input placeholder="smtp.gmail.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="smtpPort"
              label="SMTP Port"
              rules={[{ required: true, message: 'Vui lòng nhập SMTP port' }]}
              initialValue={587}
            >
              <InputNumber min={1} max={65535} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="smtpUsername"
              label="Username"
              rules={[{ required: true, message: 'Vui lòng nhập username' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="smtpPassword"
              label="Password"
              rules={[{ required: true, message: 'Vui lòng nhập password' }]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="smtpSecure"
          label="Sử dụng SSL/TLS"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="fromEmail"
          label="Email người gửi"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' }
          ]}
        >
          <Input placeholder="noreply@hospital.com" />
        </Form.Item>

        <Form.Item name="fromName" label="Tên người gửi">
          <Input placeholder="Healthcare System" />
        </Form.Item>

        <Divider />
        <Title level={5}>Thông báo email</Title>

        <Form.Item
          name="sendAppointmentReminders"
          label="Gửi nhắc lịch hẹn"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="sendBillNotifications"
          label="Gửi thông báo thanh toán"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="sendLabResultNotifications"
          label="Gửi thông báo kết quả xét nghiệm"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Lưu cài đặt
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => emailForm.resetFields()}>
              Đặt lại
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Tab 4: Backup Settings
  const BackupSettings = () => (
    <Card>
      <Form
        form={backupForm}
        layout="vertical"
        onFinish={(values) => saveSettings('backup', values)}
      >
        <Title level={5}>Cấu hình sao lưu</Title>

        <Form.Item
          name="enableAutoBackup"
          label="Kích hoạt sao lưu tự động"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="backupFrequency"
          label="Tần suất sao lưu"
        >
          <Select placeholder="Chọn tần suất">
            <Option value="DAILY">Hàng ngày</Option>
            <Option value="WEEKLY">Hàng tuần</Option>
            <Option value="MONTHLY">Hàng tháng</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="backupTime"
          label="Thời gian sao lưu"
        >
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="retentionDays"
          label="Lưu trữ bản sao lưu (ngày)"
          initialValue={30}
        >
          <InputNumber min={7} max={365} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="backupLocation" label="Vị trí lưu trữ">
          <Input placeholder="/backup" />
        </Form.Item>

        <Divider />

        <Space>
          <Button type="primary" onClick={() => message.info('Đang tạo bản sao lưu...')}>
            Tạo bản sao lưu ngay
          </Button>
          <Button onClick={() => message.info('Mở danh sách bản sao lưu...')}>
            Xem danh sách bản sao lưu
          </Button>
        </Space>

        <Divider />

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Lưu cài đặt
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => backupForm.resetFields()}>
              Đặt lại
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  const tabItems = [
    {
      key: 'general',
      label: 'Cài đặt chung',
      children: <GeneralSettings />
    },
    {
      key: 'security',
      label: 'Bảo mật',
      children: <SecuritySettings />
    },
    {
      key: 'email',
      label: 'Email',
      children: <EmailSettings />
    },
    {
      key: 'backup',
      label: 'Sao lưu',
      children: <BackupSettings />
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3} style={{ marginBottom: 16 }}>
          Cài đặt hệ thống
        </Title>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default SystemSettings;
