import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Menu,
  Button,
  message,
  Spin,
  Drawer,
  Descriptions,
  Badge,
  Tag,
  Table,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select
} from 'antd';
import {
  LogoutOutlined,
  HomeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CreditCardOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPatientData();
  }, [selectedKey]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // Fetch patient demographics
      const demoResponse = await apiClient.get(`/patients/${user._id}/demographics`);
      setPatientData(demoResponse.data.data);

      // Fetch medical records
      if (selectedKey === '2') {
        const recordsResponse = await apiClient.get(`/patients/${user._id}/medical-records`);
        setMedicalRecords(recordsResponse.data.data?.records || []);
      }

      // Fetch appointments
      if (selectedKey === '3') {
        const appointmentsResponse = await apiClient.get(`/patients/${user._id}/appointments`);
        setAppointments(appointmentsResponse.data.data?.appointments || []);
      }

      // Fetch prescriptions
      if (selectedKey === '4') {
        const prescriptionsResponse = await apiClient.get(`/patients/${user._id}/prescriptions`);
        setPrescriptions(prescriptionsResponse.data.data?.prescriptions || []);
      }

      // Fetch bills/invoices
      if (selectedKey === '5.5') {
        const billsResponse = await apiClient.get(`/bills?patientId=${user._id}`);
        setBills(billsResponse.data.data?.bills || []);
      }
    } catch (err) {
      console.error('Error fetching patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/superadmin/login');
  };

  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: 'Trang chủ'
    },
    {
      key: '2',
      icon: <FileTextOutlined />,
      label: 'Hồ sơ y tế'
    },
    {
      key: '3',
      icon: <CalendarOutlined />,
      label: 'Lịch hẹn'
    },
    {
      key: '4',
      icon: <MedicineBoxOutlined />,
      label: 'Đơn thuốc'
    },
    {
      key: '5',
      icon: <CreditCardOutlined />,
      label: 'Bảo hiểm'
    },
    {
      key: '5.5',
      icon: <HistoryOutlined />,
      label: 'Hóa đơn'
    },
    {
      key: '6',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân'
    }
  ];

  const medicalRecordsColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description'
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'doctorName'
    },
    {
      title: 'Hành động',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setSelectedRecord(record);
            setDrawerVisible(true);
          }}
        >
          Xem chi tiết
        </Button>
      )
    }
  ];

  const appointmentsColumns = [
    {
      title: 'Ngày giờ',
      dataIndex: 'appointmentDate',
      render: (date) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'doctorName'
    },
    {
      title: 'Phòng',
      dataIndex: 'room'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => {
        const statusMap = {
          SCHEDULED: { color: 'blue', text: 'Đã đặt' },
          COMPLETED: { color: 'success', text: 'Hoàn thành' },
          CANCELLED: { color: 'error', text: 'Hủy' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    }
  ];

  const prescriptionsColumns = [
    {
      title: 'Tên thuốc',
      dataIndex: 'medicineName'
    },
    {
      title: 'Liều lượng',
      dataIndex: 'dosage'
    },
    {
      title: 'Cách dùng',
      dataIndex: 'instruction'
    },
    {
      title: 'Ngày cấp',
      dataIndex: 'prescriptionDate',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => {
        const statusMap = {
          ACTIVE: { color: 'success', text: 'Hoạt động' },
          EXPIRED: { color: 'error', text: 'Hết hiệu lực' },
          COMPLETED: { color: 'default', text: 'Hoàn thành' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    }
  ];

  const billsColumns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'invoiceNumber'
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      render: (amount) => `${amount?.toLocaleString('vi-VN')} ₫`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => {
        const statusMap = {
          PENDING: { color: 'orange', text: 'Chưa thanh toán' },
          PAID: { color: 'green', text: 'Đã thanh toán' },
          OVERDUE: { color: 'red', text: 'Quá hạn' },
          CANCELLED: { color: 'gray', text: 'Hủy' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Hành động',
      render: (_, record) => (
        <Button type="primary" size="small">
          Xem chi tiết
        </Button>
      )
    }
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ background: '#fff' }}
      >
        <div style={{ padding: '16px', textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>🏥</div>
          {!collapsed && <div style={{ fontSize: '12px', color: '#666' }}>Healthcare</div>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(e) => setSelectedKey(e.key)}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={collapsed ? '☰' : '✕'}
              onClick={() => setCollapsed(!collapsed)}
            />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Bệnh nhân - {user?.personalInfo?.firstName} {user?.personalInfo?.lastName}</span>
          </div>
          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </Header>

        <Content style={{ margin: '24px 16px', padding: '24px', background: '#f0f2f5' }}>
          <Spin spinning={loading}>
            {/* Home */}
            {selectedKey === '1' && (
              <div>
                <h2 style={{ marginBottom: '24px' }}>Chào mừng, {user?.personalInfo?.firstName}!</h2>
                <Row gutter={16}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Lịch hẹn sắp tới"
                        value={appointments.filter(a => a.status === 'SCHEDULED').length}
                        prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Đơn thuốc hoạt động"
                        value={prescriptions.filter(p => p.status === 'ACTIVE').length}
                        prefix={<MedicineBoxOutlined style={{ color: '#52c41a' }} />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Hồ sơ y tế"
                        value={medicalRecords.length}
                        prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Trạng thái"
                        value={user?.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                        valueStyle={{ color: user?.status === 'ACTIVE' ? '#52c41a' : '#f5222d', fontSize: '14px' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {patientData && (
                  <Card style={{ marginTop: '24px' }} title="📋 Thông tin sơ lược">
                    <Descriptions column={1}>
                      <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">{patientData.phone}</Descriptions.Item>
                      <Descriptions.Item label="Ngày sinh">
                        {new Date(patientData.dateOfBirth).toLocaleDateString('vi-VN')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giới tính">{patientData.gender}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                )}
              </div>
            )}

            {/* Medical Records */}
            {selectedKey === '2' && (
              <Card title="📄 Hồ sơ y tế">
                <Table
                  columns={medicalRecordsColumns}
                  dataSource={medicalRecords}
                  pagination={{ pageSize: 10 }}
                  rowKey="_id"
                />
              </Card>
            )}

            {/* Appointments */}
            {selectedKey === '3' && (
              <Card title="📅 Lịch hẹn">
                <Table
                  columns={appointmentsColumns}
                  dataSource={appointments}
                  pagination={{ pageSize: 10 }}
                  rowKey="_id"
                />
              </Card>
            )}

            {/* Prescriptions */}
            {selectedKey === '4' && (
              <Card title="💊 Đơn thuốc">
                <Table
                  columns={prescriptionsColumns}
                  dataSource={prescriptions}
                  pagination={{ pageSize: 10 }}
                  rowKey="_id"
                />
              </Card>
            )}

            {/* Insurance */}
            {selectedKey === '5' && (
              <Card title="🛡️ Bảo hiểm">
                {patientData?.insurance ? (
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Công ty bảo hiểm">
                      {patientData.insurance.provider}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số bảo hiểm">
                      {patientData.insurance.policyNumber}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày hiệu lực">
                      {new Date(patientData.insurance.effectiveDate).toLocaleDateString('vi-VN')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày hết hạn">
                      {new Date(patientData.insurance.expiryDate).toLocaleDateString('vi-VN')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Badge
                        status={patientData.insurance.status === 'ACTIVE' ? 'success' : 'error'}
                        text={patientData.insurance.status === 'ACTIVE' ? 'Hoạt động' : 'Hết hạn'}
                      />
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty description="Chưa có thông tin bảo hiểm" />
                )}
              </Card>
            )}

            {/* Bills/Invoices */}
            {selectedKey === '5.5' && (
              <Card title="💳 Hóa đơn">
                <Table
                  columns={billsColumns}
                  dataSource={bills}
                  pagination={{ pageSize: 10 }}
                  rowKey="_id"
                />
              </Card>
            )}

            {/* Profile */}
            {selectedKey === '6' && (
              <Card title="👤 Thông tin cá nhân">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
                  <Descriptions.Item label="Họ">
                    {user?.personalInfo?.firstName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên">
                    {user?.personalInfo?.lastName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {user?.personalInfo?.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày sinh">
                    {user?.personalInfo?.dateOfBirth
                      ? new Date(user.personalInfo.dateOfBirth).toLocaleDateString('vi-VN')
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giới tính">
                    {user?.personalInfo?.gender}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleString('vi-VN')
                      : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </Spin>
        </Content>
      </Layout>

      {/* Medical Record Detail Drawer */}
      <Drawer
        title="Chi tiết hồ sơ y tế"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedRecord && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Ngày">
              {new Date(selectedRecord.date).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Loại">{selectedRecord.type}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{selectedRecord.description}</Descriptions.Item>
            <Descriptions.Item label="Bác sĩ">{selectedRecord.doctorName}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{selectedRecord.notes || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </Layout>
  );
};

export default PatientDashboard;
