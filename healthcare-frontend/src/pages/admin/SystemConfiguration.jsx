// ⚙️ System Configuration
import {
    CheckOutlined,
    CloseOutlined,
    ReloadOutlined,
    SaveOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Row,
    Select,
    Space,
    Switch,
    Tabs,
    Tag
} from 'antd';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import adminExtendedAPI from '../../services/api/adminExtendedAPI';
import './Admin.css';

const { Option } = Select;

const SystemConfiguration = () => {
  const [config, setConfig] = useState(null);
  const [rateLimits, setRateLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [rateLimitForm] = Form.useForm();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const [configRes, rateLimitRes] = await Promise.all([
        adminExtendedAPI.getSystemConfiguration(),
        adminExtendedAPI.getApiRateLimits(),
      ]);

      setConfig(configRes.data);
      setRateLimits(rateLimitRes.data);

      form.setFieldsValue(configRes.data);
      rateLimitForm.setFieldsValue(rateLimitRes.data);
    } catch (error) {
      message.error('Không thể tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (values) => {
    try {
      setSaving(true);
      await adminExtendedAPI.updateSystemConfiguration(values);
      message.success('Cấu hình đã được lưu thành công');
      loadConfiguration();
    } catch (error) {
      message.error('Lưu cấu hình thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRateLimits = async (values) => {
    try {
      setSaving(true);
      await adminExtendedAPI.updateApiRateLimits(values);
      message.success('Giới hạn tỉ lệ đã được cập nhật');
      loadConfiguration();
    } catch (error) {
      message.error('Cập nhật giới hạn tỉ lệ thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfig = () => {
    Modal.confirm({
      title: 'Đặt lại cấu hình',
      content: 'Bạn có chắc chắn muốn đặt lại tất cả cấu hình thành mặc định?',
      okText: 'Đặt lại',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        // Implementation for reset
        message.info('Chức năng đặt lại đang được phát triển');
      },
    });
  };

  if (loading) {
    return <div className="page-container">Đang tải...</div>;
  }

  return (
    <div className="page-container system-configuration-container">
      <PageHeader
        title="Cấu hình hệ thống"
        subtitle="Quản lý các thiết lập chung của hệ thống"
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadConfiguration}>
            Làm mới
          </Button>
        }
      />

      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: 'general',
            label: '⚙️ Cài đặt chung',
            children: (
              <Card>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSaveConfig}
                  className="system-config-form"
                >
                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="appName"
                        label="Tên ứng dụng"
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng nhập tên ứng dụng',
                          },
                        ]}
                      >
                        <Input placeholder="Healthcare Management System" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="version"
                        label="Phiên bản"
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng nhập phiên bản',
                          },
                        ]}
                      >
                        <Input placeholder="1.0.0" disabled />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="timezone"
                        label="Múi giờ"
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng chọn múi giờ',
                          },
                        ]}
                      >
                        <Select>
                          <Option value="UTC+7">UTC+7 (Giờ Đông Dương)</Option>
                          <Option value="UTC+8">UTC+8 (Giờ Singapore)</Option>
                          <Option value="UTC">UTC (Giờ phối hợp thế giới)</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="language"
                        label="Ngôn ngữ mặc định"
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng chọn ngôn ngữ',
                          },
                        ]}
                      >
                        <Select>
                          <Option value="vi">Tiếng Việt</Option>
                          <Option value="en">English</Option>
                          <Option value="zh">中文</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item name="maintenanceMode" label="Chế độ bảo trì">
                        <Switch
                          checkedChildren={<CheckOutlined />}
                          unCheckedChildren={<CloseOutlined />}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item name="debugMode" label="Chế độ gỡ lỗi">
                        <Switch
                          checkedChildren={<CheckOutlined />}
                          unCheckedChildren={<CloseOutlined />}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24}>
                      <Form.Item
                        name="supportEmail"
                        label="Email hỗ trợ"
                        rules={[
                          { type: 'email', message: 'Email không hợp lệ' },
                        ]}
                      >
                        <Input placeholder="support@example.com" />
                      </Form.Item>
                    </Col>

                    <Col xs={24}>
                      <Form.Item
                        name="description"
                        label="Mô tả hệ thống"
                      >
                        <Input.TextArea
                          rows={4}
                          placeholder="Mô tả ngắn gọn về hệ thống..."
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24}>
                      <Space>
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          htmlType="submit"
                          loading={saving}
                        >
                          Lưu cấu hình
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={() => form.resetFields()}>
                          Hoàn tác
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Form>
              </Card>
            ),
          },
          {
            key: 'rateLimits',
            label: '⚡ Giới hạn tỉ lệ API',
            children: (
              <Card>
                <Form
                  form={rateLimitForm}
                  layout="vertical"
                  onFinish={handleSaveRateLimits}
                >
                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="defaultLimit"
                        label="Giới hạn mặc định (yêu cầu/phút)"
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng nhập giới hạn',
                          },
                        ]}
                      >
                        <InputNumber min={1} placeholder="60" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="windowSize"
                        label="Kích thước cửa sổ (giây)"
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng nhập kích thước cửa sổ',
                          },
                        ]}
                      >
                        <InputNumber min={1} placeholder="60" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="authLimit"
                        label="Giới hạn xác thực (yêu cầu/5 phút)"
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng nhập giới hạn',
                          },
                        ]}
                      >
                        <InputNumber min={1} placeholder="5" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="uploadLimit"
                        label="Giới hạn tải lên (MB)"
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng nhập giới hạn',
                          },
                        ]}
                      >
                        <InputNumber min={1} placeholder="50" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="enableBurstAllowance"
                        label="Cho phép vượt quá tạm thời"
                      >
                        <Switch
                          checkedChildren={<CheckOutlined />}
                          unCheckedChildren={<CloseOutlined />}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="whitelist"
                        label="IP Whitelist (phân cách bằng dấu phẩy)"
                      >
                        <Input placeholder="192.168.1.1, 10.0.0.1" />
                      </Form.Item>
                    </Col>

                    <Col xs={24}>
                      <Space>
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          htmlType="submit"
                          loading={saving}
                        >
                          Lưu giới hạn tỉ lệ
                        </Button>
                        <Button
                          icon={<ReloadOutlined />}
                          onClick={() => rateLimitForm.resetFields()}
                        >
                          Hoàn tác
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Form>
              </Card>
            ),
          },
          {
            key: 'security',
            label: '🔒 Bảo mật',
            children: (
              <Card>
                <Row gutter={[24, 24]}>
                  <Col xs={24}>
                    <h4>Thiết lập bảo mật</h4>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card
                      type="inner"
                      title="Mã hóa HTTPS"
                      extra={<Tag color="green">Bật</Tag>}
                    >
                      <p>Các yêu cầu API được mã hóa bằng HTTPS</p>
                      <Button size="small">Cấu hình chứng chỉ</Button>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card
                      type="inner"
                      title="CORS"
                      extra={<Tag color="blue">Cấu hình</Tag>}
                    >
                      <p>Kiểm soát các yêu cầu từ miền khác</p>
                      <Button size="small">Cấu hình CORS</Button>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card
                      type="inner"
                      title="JWT Token"
                      extra={<Tag color="blue">Cấu hình</Tag>}
                    >
                      <p>Quản lý hết hạn và khóa JWT</p>
                      <Button size="small">Cấu hình Token</Button>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card
                      type="inner"
                      title="2FA (Xác thực 2 yếu tố)"
                      extra={<Tag color="orange">Tùy chọn</Tag>}
                    >
                      <p>Bảo vệ tài khoản quản trị với 2FA</p>
                      <Button size="small">Bật 2FA</Button>
                    </Card>
                  </Col>

                  <Col xs={24}>
                    <Button danger size="large" onClick={handleResetConfig}>
                      Đặt lại cấu hình về mặc định
                    </Button>
                  </Col>
                </Row>
              </Card>
            ),
          },
          {
            key: 'notifications',
            label: '📢 Thông báo',
            children: (
              <Card>
                <Form layout="vertical">
                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Email thông báo"
                        name="notificationEmail"
                      >
                        <Switch
                          checkedChildren={<CheckOutlined />}
                          unCheckedChildren={<CloseOutlined />}
                          defaultChecked
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Thông báo SMS"
                        name="smsNotification"
                      >
                        <Switch
                          checkedChildren={<CheckOutlined />}
                          unCheckedChildren={<CloseOutlined />}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Thông báo lỗi hệ thống"
                        name="errorNotification"
                      >
                        <Switch
                          checkedChildren={<CheckOutlined />}
                          unCheckedChildren={<CloseOutlined />}
                          defaultChecked
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Thông báo bảo mật"
                        name="securityNotification"
                      >
                        <Switch
                          checkedChildren={<CheckOutlined />}
                          unCheckedChildren={<CloseOutlined />}
                          defaultChecked
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24}>
                      <Button type="primary" onClick={() => message.info('Thử gửi email thông báo')}>
                        Gửi email thử nghiệm
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default SystemConfiguration;
