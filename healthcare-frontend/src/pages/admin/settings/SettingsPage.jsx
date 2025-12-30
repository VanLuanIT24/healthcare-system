// src/pages/admin/settings/SettingsPage.jsx - Cài đặt hệ thống
import AdminLayout from '@/components/layout/admin/AdminLayout';
import settingsAPI from '@/services/api/settingsAPI';
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Empty,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import {
  CloudDownloadOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  HeartOutlined,
  LockOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const SettingsPage = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('hospital');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [roles, setRoles] = useState(null);
  const [auditLogs, setAuditLogs] = useState(null);
  const [backups, setBackups] = useState(null);
  const [health, setHealth] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, 'days'),
    dayjs(),
  ]);

  // Lấy tất cả cài đặt
  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      const [settingsRes, rolesRes] = await Promise.all([
        settingsAPI.getSystemSettings(),
        settingsAPI.getRoles(),
      ]);

      setSettings(settingsRes?.data?.data);
      setRoles(rolesRes?.data?.data);

      if (settingsRes?.data?.data?.hospital) {
        form.setFieldsValue({
          hospitalName: settingsRes.data.data.hospital.name,
          hospitalAddress: settingsRes.data.data.hospital.address,
          hospitalPhone: settingsRes.data.data.hospital.phone,
          hospitalEmail: settingsRes.data.data.hospital.email,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      message.error('Lỗi tải cài đặt hệ thống');
    } finally {
      setLoading(false);
    }
  };

  // Lấy audit logs
  const fetchAuditLogs = async () => {
    try {
      const response = await settingsAPI.getAuditLogs({
        limit: 50,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      });
      setAuditLogs(response?.data?.data?.logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      message.error('Lỗi tải nhật ký hoạt động');
    }
  };

  // Lấy danh sách backups
  const fetchBackups = async () => {
    try {
      const response = await settingsAPI.listBackups();
      setBackups(response?.data?.data);
    } catch (error) {
      console.error('Error fetching backups:', error);
      message.error('Lỗi tải danh sách sao lưu');
    }
  };

  // Lấy sức khỏe hệ thống
  const fetchSystemHealth = async () => {
    try {
      const response = await settingsAPI.getSystemHealth();
      setHealth(response?.data?.data);
    } catch (error) {
      console.error('Error fetching system health:', error);
      message.error('Lỗi kiểm tra sức khỏe hệ thống');
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  // Cập nhật cài đặt hệ thống
  const handleUpdateSettings = async (values) => {
    try {
      setLoading(true);
      const data = {
        hospital: {
          name: values.hospitalName,
          address: values.hospitalAddress,
          phone: values.hospitalPhone,
          email: values.hospitalEmail,
        },
      };

      await settingsAPI.updateSystemSettings(data);
      message.success('Cài đặt hệ thống đã cập nhật');
      fetchAllSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      message.error('Lỗi cập nhật cài đặt');
    } finally {
      setLoading(false);
    }
  };

  // Tạo backup
  const handleCreateBackup = async () => {
    try {
      await settingsAPI.createBackup();
      message.success('Sao lưu database thành công');
      fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      message.error('Lỗi tạo sao lưu');
    }
  };

  // Phục hồi backup
  const handleRestoreBackup = async (backupId) => {
    try {
      await settingsAPI.restoreBackup(backupId);
      message.success('Phục hồi database thành công');
      fetchBackups();
    } catch (error) {
      console.error('Error restoring backup:', error);
      message.error('Lỗi phục hồi sao lưu');
    }
  };

  // ===== TAB 1: THÔNG TIN BỆN VIỆN =====
  const HospitalTab = () => (
    <div className="space-y-6">
      <Card title="Thông tin bệnh viện" loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateSettings}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tên bệnh viện"
                name="hospitalName"
                rules={[{ required: true, message: 'Vui lòng nhập tên bệnh viện' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Địa chỉ"
                name="hospitalAddress"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Số điện thoại"
                name="hospitalPhone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="hospitalEmail"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu cài đặt
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Cấu hình hệ thống">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Max Login Attempts"
              value={settings?.system?.maxLoginAttempts || 5}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Session Timeout"
              value={`${(settings?.system?.sessionTimeout / 60) || 60} min`}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="MFA"
              value={settings?.system?.enableMFA ? 'Bật' : 'Tắt'}
              valueStyle={{ color: settings?.system?.enableMFA ? '#52c41a' : '#f5222d' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Audit Log"
              value={settings?.system?.enableAuditLog ? 'Bật' : 'Tắt'}
              valueStyle={{ color: settings?.system?.enableAuditLog ? '#52c41a' : '#f5222d' }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );

  // ===== TAB 2: NGƯỜI DÙNG & QUYỀN =====
  const RBACTab = () => (
    <div className="space-y-6">
      <Card title="Vai trò (Roles) & Quyền (Permissions)">
        {roles ? (
          <div>
            <h3 className="text-lg font-bold mb-4">Danh sách vai trò</h3>
            {roles.roles?.map((role) => (
              <Card key={role.id} className="mb-4" size="small">
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <h4>{role.display || role.name}</h4>
                    <p className="text-gray-600 text-sm">{role.description}</p>
                  </Col>
                  <Col xs={24} md={16}>
                    <div>
                      <p className="text-sm font-bold mb-2">Quyền:</p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions?.length > 0 ? (
                          role.permissions.map((perm) => (
                            <Tag key={perm} color="blue">
                              {perm}
                            </Tag>
                          ))
                        ) : (
                          <Tag>Chưa có quyền</Tag>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        ) : (
          <Spin />
        )}
      </Card>
    </div>
  );

  // ===== TAB 3: THÔNG BÁO =====
  const NotificationTab = () => (
    <div className="space-y-6">
      <Card title="Cấu hình thông báo">
        <Form layout="vertical">
          <Form.Item>
            <Checkbox defaultChecked={settings?.notification?.enableEmailNotifications}>
              Cho phép thông báo qua Email
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <Checkbox defaultChecked={settings?.notification?.enableSmsNotifications}>
              Cho phép thông báo qua SMS
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <Checkbox defaultChecked={settings?.notification?.enablePushNotifications}>
              Cho phép thông báo Push
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary">Lưu cấu hình</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );

  // ===== TAB 4: SAO LƯU & PHỤC HỒI =====
  const BackupTab = () => (
    <div className="space-y-6">
      <Card title="Sao lưu (Backup)">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={handleCreateBackup}
              loading={loading}
            >
              Tạo sao lưu ngay
            </Button>
          </div>

          {backups ? (
            <Table
              columns={[
                {
                  title: 'Tên file',
                  dataIndex: 'filename',
                  key: 'filename',
                },
                {
                  title: 'Kích thước',
                  dataIndex: 'size',
                  key: 'size',
                },
                {
                  title: 'Thời gian tạo',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                },
                {
                  title: 'Hành động',
                  key: 'action',
                  render: (_, record) => (
                    <Space>
                      <Tooltip title="Tải về">
                        <Button
                          type="link"
                          size="small"
                          icon={<DownloadOutlined />}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="Phục hồi sao lưu"
                        description="Bạn chắc chắn muốn phục hồi từ sao lưu này? Dữ liệu hiện tại sẽ bị ghi đè."
                        onConfirm={() => handleRestoreBackup(record.id)}
                        okText="Có"
                        cancelText="Không"
                      >
                        <Button
                          type="link"
                          size="small"
                          icon={<CloudDownloadOutlined />}
                          danger
                        />
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
              dataSource={backups}
              pagination={false}
            />
          ) : (
            <Spin />
          )}
        </Space>
      </Card>
    </div>
  );

  // ===== TAB 5: NHẬT KÝ HOẠT ĐỘNG =====
  const AuditLogTab = () => (
    <div className="space-y-6">
      <Card
        title="Nhật ký hoạt động"
        extra={
          <Button type="primary" onClick={fetchAuditLogs} loading={loading}>
            Tải lại
          </Button>
        }
      >
        <Space className="mb-4" direction="vertical" style={{ width: '100%' }}>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            format="YYYY-MM-DD"
          />
        </Space>

        {auditLogs ? (
          <Table
            columns={[
              {
                title: 'Hành động',
                dataIndex: 'action',
                key: 'action',
                render: (action) => <Tag color="blue">{action}</Tag>,
              },
              {
                title: 'Người dùng',
                dataIndex: ['userId', 'personalInfo', 'firstName'],
                key: 'user',
              },
              {
                title: 'Mô tả',
                dataIndex: 'description',
                key: 'description',
              },
              {
                title: 'Thời gian',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
              },
            ]}
            dataSource={auditLogs}
            pagination={{ pageSize: 20 }}
          />
        ) : (
          <Spin />
        )}
      </Card>
    </div>
  );

  // ===== TAB 6: KIỂM TRA SỨC KHỎE =====
  const HealthTab = () => (
    <div className="space-y-6">
      <Card
        title="Kiểm tra sức khỏe hệ thống"
        extra={
          <Button type="primary" onClick={fetchSystemHealth} loading={loading}>
            Kiểm tra ngay
          </Button>
        }
      >
        {health ? (
          <>
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Trạng thái"
                    value={health.status === 'healthy' ? 'Bình thường' : 'Lỗi'}
                    valueStyle={{ color: health.status === 'healthy' ? '#52c41a' : '#f5222d' }}
                    prefix={<HeartOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Uptime"
                    value={Math.round(health.uptime / 3600)}
                    suffix="h"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Heap Used"
                    value={health.memory?.heapUsed}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Database"
                    value={health.database?.connected ? 'Kết nối' : 'Ngắt'}
                    valueStyle={{ color: health.database?.connected ? '#52c41a' : '#f5222d' }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            <div>
              <h3 className="text-lg font-bold mb-4">Chi tiết</h3>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Bộ nhớ">
                    <ul className="text-sm space-y-2">
                      <li><strong>Heap Used:</strong> {health.memory?.heapUsed}</li>
                      <li><strong>Heap Total:</strong> {health.memory?.heapTotal}</li>
                      <li><strong>RSS:</strong> {health.memory?.rss}</li>
                    </ul>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" title="Dịch vụ">
                    <ul className="text-sm space-y-2">
                      <li><strong>Email:</strong> {health.services?.email}</li>
                      <li><strong>SMS:</strong> {health.services?.sms}</li>
                      <li><strong>Audit Log:</strong> {health.services?.auditLog}</li>
                    </ul>
                  </Card>
                </Col>
              </Row>
            </div>
          </>
        ) : (
          <Spin />
        )}
      </Card>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>
          <p className="text-gray-600">Quản lý cấu hình, bảo mật, sao lưu & phục hồi</p>
        </div>

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'hospital',
                label: '🏥 Thông tin bệnh viện',
                children: <HospitalTab />,
              },
              {
                key: 'rbac',
                label: '🔐 Vai trò & Quyền',
                children: <RBACTab />,
              },
              {
                key: 'notification',
                label: '📧 Thông báo',
                children: <NotificationTab />,
              },
              {
                key: 'backup',
                label: '💾 Sao lưu & Phục hồi',
                children: <BackupTab />,
              },
              {
                key: 'audit',
                label: '📊 Nhật ký hoạt động',
                children: <AuditLogTab />,
              },
              {
                key: 'health',
                label: '❤️ Sức khỏe hệ thống',
                children: <HealthTab />,
              },
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;

