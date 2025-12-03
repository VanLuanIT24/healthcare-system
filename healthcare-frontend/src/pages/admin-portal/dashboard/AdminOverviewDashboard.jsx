import {
  BellOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Bar, Line, Pie } from '@ant-design/plots';
import {
  Avatar,
  Button,
  Card,
  Col,
  List,
  Progress,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  message
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { dashboardApi } from '../../../services/adminApi';

const { Title, Text } = Typography;

const AdminOverviewDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patientsToday: 0,
    appointmentsToday: 0,
    revenueToday: 0,
    bedsAvailable: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [patientDistribution, setPatientDistribution] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // SỬ DỤNG API SERVICE
      // Fetch stats
      const statsResponse = await dashboardApi.getStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Fetch revenue data
      const revenueResponse = await dashboardApi.getRevenueChart();
      if (revenueResponse.success && revenueResponse.data) {
        // Transform data for chart
        const chartData = revenueResponse.data.map(item => ({
          date: item.date,
          revenue: item.revenue,
          count: item.count,
          avgAmount: item.avgAmount
        }));
        setRevenueData(chartData);
      }

      // Fetch department statistics
      const deptResponse = await dashboardApi.getDepartmentStats();
      if (deptResponse.success && deptResponse.data) {
        // Transform for bar chart
        const chartData = deptResponse.data.map(dept => ({
          department: dept.department,
          count: dept.count,
          patients: dept.currentPatients,
          doctors: dept.doctorCount
        }));
        setDepartmentData(chartData);
      }

      // Fetch patient distribution
      const patientDistResponse = await dashboardApi.getPatientDistribution('admission');
      if (patientDistResponse.success && patientDistResponse.data) {
        setPatientDistribution(patientDistResponse.data);
      }

      // Fetch recent activities
      const activitiesResponse = await dashboardApi.getRecentActivities(10);
      if (activitiesResponse.success && activitiesResponse.data) {
        setRecentActivities(activitiesResponse.data);
      }

      // Fetch system health
      try {
        const healthResponse = await dashboardApi.getSystemHealth();
        if (healthResponse.success && healthResponse.data) {
          setSystemHealth(healthResponse.data);
        }
      } catch (err) {
        console.warn('⚠️ [DASHBOARD] System health not available:', err.message);
      }

    } catch (error) {
      console.error('❌ [DASHBOARD] Fetch error:', error);
      message.error(
        error.response?.data?.message || error.message || 'Không thể tải dữ liệu dashboard'
      );
      // Use mock data as fallback
      setStats(getMockStats());
      setRevenueData(getMockRevenueData());
      setDepartmentData(getMockDepartmentData());
      setPatientDistribution(getMockPatientDistribution());
      setRecentActivities(getMockRecentActivities());
    } finally {
      setLoading(false);
    }
  };

  // Mock data functions
  const getMockStats = () => ({
    patientsToday: 45,
    appointmentsToday: 32,
    revenueToday: 15000000,
    bedsAvailable: 28
  });

  const getMockRevenueData = () => [
    { date: '2025-11-21', revenue: 12000000 },
    { date: '2025-11-22', revenue: 15000000 },
    { date: '2025-11-23', revenue: 13500000 },
    { date: '2025-11-24', revenue: 18000000 },
    { date: '2025-11-25', revenue: 16500000 },
    { date: '2025-11-26', revenue: 14000000 },
    { date: '2025-11-27', revenue: 15000000 }
  ];

  const getMockDepartmentData = () => [
    { department: 'Tim mạch', patients: 45 },
    { department: 'Nội khoa', patients: 38 },
    { department: 'Ngoại khoa', patients: 32 },
    { department: 'Nhi khoa', patients: 28 },
    { department: 'Sản khoa', patients: 25 }
  ];

  const getMockPatientDistribution = () => [
    { type: 'Nội trú', value: 120 },
    { type: 'Ngoại trú', value: 85 },
    { type: 'Cấp cứu', value: 35 }
  ];

  const getMockRecentActivities = () => ([
    {
      _id: '1',
      type: 'appointment',
      description: 'Bệnh nhân Nguyễn Văn A đã đặt lịch khám',
      time: '10 phút trước'
    },
    {
      _id: '2',
      type: 'admission',
      description: 'Bệnh nhân Trần Thị B nhập viện khoa Tim mạch',
      time: '25 phút trước'
    },
    {
      _id: '3',
      type: 'billing',
      description: 'Hóa đơn #HD001 đã được thanh toán',
      time: '1 giờ trước'
    },
    {
      _id: '4',
      type: 'lab',
      description: 'Kết quả xét nghiệm cho bệnh nhân Lê Văn C đã có',
      time: '2 giờ trước'
    }
  ]);

  // Quick Stats Section - ENHANCED WITH REAL DATA
  const QuickStats = () => {
    const totalBeds = (stats.bedsAvailable || 0) + (stats.occupiedBeds || 0);
    const occupancyRate = stats.bedOccupancyRate || 0;

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Bệnh nhân hôm nay"
              value={stats.patientsToday || 0}
              prefix={<UserOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tổng: {stats.totalPatients || 0} bệnh nhân
            </Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Lịch hẹn hôm nay"
              value={stats.appointmentsToday?.total || 0}
              prefix={<CalendarOutlined />}
            />
            {stats.appointmentsToday && (
              <Space size="small" style={{ marginTop: 8 }}>
                <Tag color="green">Hoàn thành: {stats.appointmentsToday.completed || 0}</Tag>
                <Tag color="orange">Chờ: {stats.appointmentsToday.scheduled || 0}</Tag>
              </Space>
            )}
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Doanh thu hôm nay"
              value={stats.revenueToday || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
              precision={0}
              formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tháng này: {(stats.revenueMonth || 0).toLocaleString('vi-VN')} VNĐ
            </Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tình trạng giường bệnh"
              value={stats.bedsAvailable || 0}
              suffix={`/ ${totalBeds} trống`}
              prefix={<MedicineBoxOutlined />}
            />
            <Progress 
              percent={parseFloat(occupancyRate)} 
              size="small" 
              status={occupancyRate > 90 ? 'exception' : 'active'}
              style={{ marginTop: 8 }}
              format={(percent) => `${percent}% đã sử dụng`}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // Revenue Chart (Last 7 days)
  const RevenueChart = () => {
    const config = {
      data: revenueData,
      xField: 'date',
      yField: 'revenue',
      point: {
        size: 5,
        shape: 'diamond',
      },
      label: {
        style: {
          fill: '#aaa',
        },
      },
      smooth: true,
      color: '#1890ff',
    };

    return (
      <Card 
        title={<Title level={5}>Doanh thu 7 ngày qua</Title>}
        extra={<Button size="small">Xem chi tiết</Button>}
      >
        {revenueData.length > 0 ? (
          <Line {...config} height={250} />
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Text type="secondary">Chưa có dữ liệu</Text>
          </div>
        )}
      </Card>
    );
  };

  // Department Statistics - ENHANCED WITH COMBINED DATA
  const DepartmentChart = () => {
    const config = {
      data: departmentData,
      xField: 'count',
      yField: 'department',
      seriesField: 'department',
      legend: false,
      color: ['#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1'],
      label: {
        position: 'right',
        style: {
          fill: '#000',
          fontSize: 12
        }
      },
      tooltip: {
        customContent: (title, items) => {
          if (!items || items.length === 0) return '';
          const item = items[0];
          const data = item.data;
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${data.department}</div>
              <div>Lượt khám: ${data.count}</div>
              ${data.patients ? `<div>Bệnh nhân hiện tại: ${data.patients}</div>` : ''}
              ${data.doctors ? `<div>Số bác sĩ: ${data.doctors}</div>` : ''}
            </div>
          `;
        }
      }
    };

    return (
      <Card 
        title={<Title level={5}>Thống kê theo khoa</Title>}
        extra={<Button size="small" onClick={() => navigate('/admin/departments')}>Xem chi tiết</Button>}
      >
        {departmentData.length > 0 ? (
          <Bar {...config} height={300} />
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Text type="secondary">Chưa có dữ liệu</Text>
          </div>
        )}
      </Card>
    );
  };

  // Patient Distribution
  const PatientDistChart = () => {
    const config = {
      data: patientDistribution,
      angleField: 'value',
      colorField: 'type',
      radius: 0.8,
      interactions: [{ type: 'element-active' }],
    };

    return (
      <Card 
        title={<Title level={5}>Phân bố bệnh nhân</Title>}
        extra={<Button size="small">Xem chi tiết</Button>}
      >
        {patientDistribution.length > 0 ? (
          <Pie {...config} height={250} />
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Text type="secondary">Chưa có dữ liệu</Text>
          </div>
        )}
      </Card>
    );
  };

  // Recent Activities - ENHANCED WITH CATEGORIES
  const RecentActivity = () => {
    const getActivityIcon = (category) => {
      switch (category) {
        case 'APPOINTMENT':
          return <CalendarOutlined style={{ color: '#1890ff' }} />;
        case 'PATIENT':
          return <UserOutlined style={{ color: '#52c41a' }} />;
        case 'BILLING':
          return <DollarOutlined style={{ color: '#fa8c16' }} />;
        case 'MEDICAL':
          return <FileTextOutlined style={{ color: '#eb2f96' }} />;
        case 'LABORATORY':
          return <MedicineBoxOutlined style={{ color: '#722ed1' }} />;
        case 'PHARMACY':
          return <MedicineBoxOutlined style={{ color: '#13c2c2' }} />;
        case 'USER':
          return <TeamOutlined style={{ color: '#faad14' }} />;
        default:
          return <BellOutlined />;
      }
    };

    const getCategoryColor = (category) => {
      const colors = {
        'APPOINTMENT': 'blue',
        'PATIENT': 'green',
        'BILLING': 'orange',
        'MEDICAL': 'magenta',
        'LABORATORY': 'purple',
        'PHARMACY': 'cyan',
        'USER': 'gold',
        'SYSTEM': 'default'
      };
      return colors[category] || 'default';
    };

    return (
      <Card 
        title={<Title level={5}>Hoạt động gần đây</Title>}
        extra={<Button size="small" onClick={() => navigate('/admin/audit-logs')}>Xem tất cả</Button>}
      >
        <List
          dataSource={recentActivities}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={getActivityIcon(item.category)} />}
                title={
                  <Space>
                    <span>{item.message}</span>
                    <Tag color={getCategoryColor(item.category)} size="small">
                      {item.category}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.time}
                    </Text>
                    {item.userName && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Người thực hiện: {item.userName}
                      </Text>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: 'Không có hoạt động nào' }}
        />
      </Card>
    );
  };

  // Quick Actions
  const QuickActions = () => {
    const actions = [
      {
        icon: <UserOutlined />,
        label: 'Thêm bệnh nhân',
        link: '/admin/patients/create',
        color: '#1890ff'
      },
      {
        icon: <CalendarOutlined />,
        label: 'Tạo lịch hẹn',
        link: '/admin/appointments/create',
        color: '#52c41a'
      },
      {
        icon: <FileTextOutlined />,
        label: 'Tạo hóa đơn',
        link: '/admin/billing/create',
        color: '#fa8c16'
      },
      {
        icon: <TeamOutlined />,
        label: 'Quản lý nhân viên',
        link: '/admin/staff',
        color: '#eb2f96'
      }
    ];

    return (
      <Card title={<Title level={5}>Thao tác nhanh</Title>}>
        <Row gutter={[16, 16]}>
          {actions.map((action, index) => (
            <Col xs={12} sm={6} key={index}>
              <Button
                type="dashed"
                block
                icon={action.icon}
                style={{ 
                  height: 80, 
                  borderColor: action.color,
                  color: action.color
                }}
                onClick={() => navigate(action.link)}
              >
                {action.label}
              </Button>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  // System Health Card
  const SystemHealthCard = () => {
    if (!systemHealth) return null;

    const getStatusColor = (status) => {
      return status === 'healthy' ? 'success' : status === 'warning' ? 'warning' : 'error';
    };

    const getDbStatusColor = (status) => {
      return status === 'connected' ? 'green' : 'red';
    };

    return (
      <Card 
        title={<Title level={5}>Tình trạng hệ thống</Title>}
        extra={
          <Tag color={getStatusColor(systemHealth.status)}>
            {systemHealth.status === 'healthy' ? '✓ Hoạt động tốt' : '⚠ Cần kiểm tra'}
          </Tag>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Cơ sở dữ liệu</Text>
              <Space>
                <Tag color={getDbStatusColor(systemHealth.database?.status)}>
                  {systemHealth.database?.status}
                </Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {systemHealth.database?.name}
                </Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Collections: {systemHealth.database?.collectionsCount || 0}
              </Text>
            </Space>
          </Col>
          
          <Col xs={24} sm={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Bộ nhớ</Text>
              <Progress 
                percent={systemHealth.memory?.heapUsedPercent || 0}
                size="small"
                status={systemHealth.memory?.heapUsedPercent > 80 ? 'exception' : 'active'}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {systemHealth.memory?.heapUsed} MB / {systemHealth.memory?.heapTotal} MB
              </Text>
            </Space>
          </Col>
          
          <Col xs={24}>
            <Space split={<span>•</span>}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Uptime: {systemHealth.uptime?.formatted}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Node: {systemHealth.server?.nodeVersion}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Platform: {systemHealth.server?.platform}
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Tổng quan Bệnh viện</Title>
        <Text type="secondary">
          Xin chào, {user?.personalInfo?.firstName} {user?.personalInfo?.lastName} - 
          Bệnh viện Đa khoa Quốc tế
        </Text>
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Quick Stats */}
        <QuickStats />

        {/* Charts Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <RevenueChart />
          </Col>
          <Col xs={24} lg={12}>
            <DepartmentChart />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <PatientDistChart />
          </Col>
          <Col xs={24} lg={12}>
            <RecentActivity />
          </Col>
        </Row>

        {/* System Health and Quick Actions */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <SystemHealthCard />
          </Col>
          <Col xs={24} lg={12}>
            <QuickActions />
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default AdminOverviewDashboard;
