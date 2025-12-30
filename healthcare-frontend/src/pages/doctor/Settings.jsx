// src/pages/doctor/Settings.jsx - Cài đặt cá nhân
import { useAuth } from '@/contexts/AuthContext';
import {
  BellOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  BgColorsOutlined,
  SaveOutlined,
  ReloadOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Spin,
  Switch,
  Form,
  Select,
  Divider,
  TimePicker,
  Tag,
  message,
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';

dayjs.locale('vi');

const Settings = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Notification preferences
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminder: true,
    messageNotifications: true,

    // Schedule
    defaultStartTime: '08:00',
    defaultEndTime: '17:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],

    // Language & Theme
    language: 'vi',
    theme: 'light',

    // Other preferences
    showProfile: true,
    allowConsultation: true,
  });

  useEffect(() => {
    // Load settings từ API/localStorage
    setLoading(true);
    setTimeout(() => {
      form.setFieldsValue(settings);
      setLoading(false);
    }, 500);
  }, [form, settings]);

  const handleSaveSettings = async (values) => {
    setSaving(true);
    try {
      // Gửi tới API để lưu settings
      setTimeout(() => {
        setSettings(values);
        message.success('Cài đặt đã được lưu thành công!');
        setSaving(false);
      }, 1000);
    } catch (error) {
      message.error('Lỗi khi lưu cài đặt');
      setSaving(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info('Đã reset lại cài đặt');
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            tip="Đang tải cài đặt..."
          />
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div
        style={{
          padding: '24px',
          maxWidth: '1000px',
          margin: '0 auto',
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: '24px' }}
        >
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            ⚙️ Cài đặt cá nhân
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            Quản lý thông báo, lịch làm việc và tùy chọn hiển thị
          </p>
        </motion.div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveSettings}
        >
          {/* Notification Preferences */}
          <Card
            style={{ marginBottom: '20px', borderRadius: '8px' }}
            title={
              <span>
                <BellOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                Thông báo
              </span>
            }
          >
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="emailNotifications"
                  label="Email notifications"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="✓"
                    unCheckedChildren="✕"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="smsNotifications"
                  label="SMS notifications"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="✓"
                    unCheckedChildren="✕"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="appointmentReminder"
                  label="Nhắc nhở lịch hẹn"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="✓"
                    unCheckedChildren="✕"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="messageNotifications"
                  label="Thông báo tin nhắn"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="✓"
                    unCheckedChildren="✕"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Schedule Preferences */}
          <Card
            style={{ marginBottom: '20px', borderRadius: '8px' }}
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                Lịch làm việc mặc định
              </span>
            }
          >
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="defaultStartTime"
                  label="Giờ bắt đầu"
                >
                  <TimePicker format="HH:mm" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="defaultEndTime"
                  label="Giờ kết thúc"
                >
                  <TimePicker format="HH:mm" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="workingDays"
                  label="Các ngày làm việc"
                >
                  <Select
                    mode="multiple"
                    options={[
                      { label: 'Thứ hai', value: 'Monday' },
                      { label: 'Thứ ba', value: 'Tuesday' },
                      { label: 'Thứ tư', value: 'Wednesday' },
                      { label: 'Thứ năm', value: 'Thursday' },
                      { label: 'Thứ sáu', value: 'Friday' },
                      { label: 'Thứ bảy', value: 'Saturday' },
                      { label: 'Chủ nhật', value: 'Sunday' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Language & Theme */}
          <Card
            style={{ marginBottom: '20px', borderRadius: '8px' }}
            title={
              <span>
                <GlobalOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                Ngôn ngữ & Giao diện
              </span>
            }
          >
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="language"
                  label="Ngôn ngữ"
                >
                  <Select
                    options={[
                      { label: '🇻🇳 Tiếng Việt', value: 'vi' },
                      { label: '🇬🇧 English', value: 'en' },
                      { label: '🇮🇳 日本語', value: 'ja' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="theme"
                  label="Chế độ"
                >
                  <Select
                    options={[
                      { label: '☀️ Sáng', value: 'light' },
                      { label: '🌙 Tối', value: 'dark' },
                      { label: '🔄 Tự động', value: 'auto' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Privacy & Visibility */}
          <Card
            style={{ marginBottom: '20px', borderRadius: '8px' }}
            title={
              <span>
                <BgColorsOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                Quyền riêng tư & Hiển thị
              </span>
            }
          >
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="showProfile"
                  label="Hiển thị hồ sơ công khai"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="✓"
                    unCheckedChildren="✕"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="allowConsultation"
                  label="Cho phép hội chẩn nhanh"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="✓"
                    unCheckedChildren="✕"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Info Box */}
          <Card
            style={{
              marginBottom: '20px',
              borderRadius: '8px',
              backgroundColor: '#f6f8fb',
              border: '1px solid #e1e8ed',
            }}
          >
            <div style={{ fontSize: '13px', color: '#666' }}>
              <div style={{ marginBottom: '8px' }}>
                <Tag color="blue">ℹ️ LƯU Ý</Tag>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Cài đặt này khác với <strong>Hồ sơ cá nhân</strong> - không ảnh hưởng tới thông tin chuyên môn</li>
                <li>Thay đổi sẽ áp dụng ngay lập tức cho tất cả thiết bị</li>
                <li>Bạn có thể thay đổi thông tin hồ sơ trong mục <strong>Hồ sơ cá nhân</strong></li>
              </ul>
            </div>
          </Card>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={saving}
            >
              Reset
            </Button>
            <Button
              type="primary"
              icon={saving ? <LoadingOutlined /> : <SaveOutlined />}
              htmlType="submit"
              loading={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </Button>
          </div>
        </Form>
      </div>
    </DoctorLayout>
  );
};

export default Settings;
