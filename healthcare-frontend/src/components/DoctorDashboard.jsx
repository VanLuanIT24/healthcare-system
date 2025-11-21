import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout, Menu, Button, Card, Row, Col, Statistic, message, Spin, Avatar, Drawer,
  Table, Tabs, Tag, Space, Modal, Form, Input, Select, Empty, Badge
} from 'antd';
import {
  LogoutOutlined, HomeOutlined, UserOutlined, CalendarOutlined, FileTextOutlined,
  HeartOutlined, BellOutlined, SettingOutlined, PlusOutlined, EyeOutlined, CheckOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0
  });
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedKey]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      switch (selectedKey) {
        case '1':
          await fetchStats();
          break;
        case '2':
          await fetchPatients();
          break;
        case '3':
          await fetchAppointments();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [patientsRes, appointmentsRes] = await Promise.all([
        apiClient.get('/patients/search', { params: { limit: 1 } }),
        apiClient.get('/appointments/doctor/' + user._id, { params: { limit: 1 } })
      ]);

      const patientCount = patientsRes.data.data?.total || 0;
      const appointmentData = appointmentsRes.data.data?.appointments || [];
      const completed = appointmentData.filter(a => a.status === 'COMPLETED').length;
      const pending = appointmentData.filter(a => a.status === 'SCHEDULED').length;

      setStats({
        totalPatients: patientCount,
        totalAppointments: appointmentData.length,
        completedAppointments: completed,
        pendingAppointments: pending
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await apiClient.get('/patients/search', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize
        }
      });

      if (response.data.success) {
        setPatients(response.data.data.patients || []);
        setPagination({
          ...pagination,
          total: response.data.data.total || 0
        });
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      message.error('Không thể tải danh sách bệnh nhân');
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await apiClient.get(`/appointments/doctor/${user._id}`, {
        params: {
          page: pagination.current,
          limit: pagination.pageSize
        }
      });

      if (response.data.success) {
        setAppointments(response.data.data.appointments || response.data.data || []);
        setPagination({
          ...pagination,
          total: response.data.data.total || 0
        });
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      message.error('Không thể tải danh sách lịch hẹn');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      message.success('Đã đăng xuất');
      navigate('/superadmin/login');
    } catch (err) {
      message.error('Lỗi khi đăng xuất');
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setDetailDrawerVisible(true);
  };

  const patientColumns = [
    {
      title: 'Mã bệnh nhân',
      dataIndex: 'patientId',
      key: 'patientId'
    },
    {
      title: 'Tên',
      key: 'name',
      render: (_, record) => (
        `${record.personalInfo?.firstName} ${record.personalInfo?.lastName}`
      )
    },
    {
      title: 'Ngày sinh',
      dataIndex: ['personalInfo', 'dateOfBirth'],
      key: 'dob',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Số điện thoại',
      dataIndex: ['personalInfo', 'phone'],
      key: 'phone'
    },
    {
      title: 'Giới tính',
      dataIndex: ['personalInfo', 'gender'],
      key: 'gender'
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleViewPatient(record)} />
        </Space>
      )
    }
  ];

  const appointmentColumn = [
    {
      title: 'Bệnh nhân',
      dataIndex: ['patientId', 'patientId'],
      key: 'patient'
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'appointmentDate',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      render: (text) => <span>{text?.substring(0, 30)}...</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          'SCHEDULED': 'blue',
          'COMPLETED': 'green',
          'CANCELLED': 'red',
          'NO_SHOW': 'orange'
        };
        const labels = {
          'SCHEDULED': 'Đã lên lịch',
          'COMPLETED': 'Hoàn tất',
          'CANCELLED': 'Đã hủy',
          'NO_SHOW': 'Không tới'
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<CheckOutlined />} onClick={() => markCompleted(record._id)} />
          <Button danger onClick={() => cancelAppointment(record._id)} />
        </Space>
      )
    }
  ];

  const markCompleted = async (appointmentId) => {
    Modal.confirm({
      title: 'Xác nhận',
      content: 'Bạn có chắc chắn muốn đánh dấu hoàn tất?',
      onOk: async () => {
        try {
          await apiClient.put(`/appointments/${appointmentId}`, { status: 'COMPLETED' });
          message.success('Cập nhật thành công');
          fetchAppointments();
        } catch (err) {
          message.error('Cập nhật thất bại');
        }
      }
    });
  };

  const cancelAppointment = async (appointmentId) => {
    Modal.confirm({
      title: 'Hủy lịch hẹn',
      content: 'Bạn có chắc chắn muốn hủy?',
      okText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.post(`/appointments/${appointmentId}/cancel`, {
            reason: 'Bác sĩ hủy'
          });
          message.success('Đã hủy');
          fetchAppointments();
        } catch (err) {
          message.error('Hủy thất bại');
        }
      }
    });
  };

  const menuItems = [
    { key: '1', icon: <HomeOutlined />, label: 'Tổng Quan' },
    { key: '2', icon: <UserOutlined />, label: 'Bệnh Nhân' },
    { key: '3', icon: <CalendarOutlined />, label: 'Lịch Hẹn' },
    { key: '4', icon: <FileTextOutlined />, label: 'Hồ Sơ Y Tế' }
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return (
          <Spin spinning={loading}>
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tổng Bệnh Nhân"
                    value={stats.totalPatients}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Lịch Hẹn"
                    value={stats.totalAppointments}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Hoàn Tất"
                    value={stats.completedAppointments}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Chờ Xử Lý"
                    value={stats.pendingAppointments}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<BellOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </Spin>
        );
      case '2':
        return (
          <Card title="Danh Sách Bệnh Nhân">
            <Table
              columns={patientColumns}
              dataSource={patients}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize, total: pagination.total });
                  fetchPatients();
                }
              }}
              rowKey="_id"
            />
          </Card>
        );
      case '3':
        return (
          <Card title="Lịch Hẹn">
            <Table
              columns={appointmentColumn}
              dataSource={appointments}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize, total: pagination.total });
                  fetchAppointments();
                }
              }}
              rowKey="_id"
            />
          </Card>
        );
      default:
        return <Empty description="Chọn một mục từ menu" />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ padding: '20px', color: 'white', textAlign: 'center', marginBottom: '20px' }}>
          <HeartOutlined style={{ fontSize: '24px' }} />
          <div style={{ marginTop: '10px', fontWeight: 'bold' }}>Healthcare System</div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Button
            type="text"
            icon={collapsed ? '☰' : '✕'}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px' }}
          />
          <Space>
            <Avatar icon={<UserOutlined />} />
            <span>{user?.email}</span>
            <Button danger onClick={handleLogout} icon={<LogoutOutlined />}>
              Đăng Xuất
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {renderContent()}
        </Content>
      </Layout>

      <Drawer
        title="Chi Tiết Bệnh Nhân"
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
        width={600}
      >
        {selectedPatient && (
          <div>
            <Card title="Thông Tin Cá Nhân">
              <Row gutter={16}>
                <Col span={12}>
                  <div>
                    <strong>Mã bệnh nhân:</strong> {selectedPatient.patientId}
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <strong>Email:</strong> {selectedPatient.user?.email}
                  </div>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '16px' }}>
                <Col span={12}>
                  <div>
                    <strong>Họ tên:</strong> {selectedPatient.personalInfo?.firstName} {selectedPatient.personalInfo?.lastName}
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <strong>Ngày sinh:</strong> {dayjs(selectedPatient.personalInfo?.dateOfBirth).format('DD/MM/YYYY')}
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Drawer>
    </Layout>
  );
};

export default DoctorDashboard;
