// 🏥 Super Admin Dashboard - Enhanced Version
import {
    ArrowUpOutlined,
    BankOutlined,
    CalendarOutlined,
    DashboardOutlined,
    DollarOutlined,
    ExperimentOutlined,
    FileTextOutlined,
    HeartOutlined,
    MedicineBoxFilled,
    MedicineBoxOutlined,
    ReloadOutlined,
    SafetyOutlined,
    SettingOutlined,
    TeamOutlined,
    UserAddOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import { Button, Card, Col, Empty, Progress, Row, Space, Statistic, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAPI from '../../services/api/adminAPI';
import designSystem from '../../theme/designSystem';
import './Dashboard.css';

const { colors } = designSystem;

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [patientDistribution, setPatientDistribution] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data in parallel for better performance
      const [
        statsRes,
        revenueRes,
        departmentRes,
        distributionRes,
        activitiesRes,
        healthRes
      ] = await Promise.allSettled([
        adminAPI.getDashboardStats(),
        adminAPI.getRevenueChart(),
        adminAPI.getDepartmentStats(),
        adminAPI.getPatientDistribution(),
        adminAPI.getRecentActivities({ limit: 10 }),
        adminAPI.getSystemHealth()
      ]);

      // Process stats
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.data || statsRes.value.data);
      }

      // Process revenue chart
      if (revenueRes.status === 'fulfilled') {
        const chartData = revenueRes.value.data.data || revenueRes.value.data.chartData || [];
        setRevenueData(Array.isArray(chartData) ? chartData : []);
      }

      // Process department stats
      if (departmentRes.status === 'fulfilled') {
        const deptData = departmentRes.value.data.data || departmentRes.value.data.departments || [];
        setDepartmentStats(Array.isArray(deptData) ? deptData : []);
      }

      // Process patient distribution
      if (distributionRes.status === 'fulfilled') {
        const distData = distributionRes.value.data.data || distributionRes.value.data.distribution || [];
        setPatientDistribution(Array.isArray(distData) ? distData : []);
      }

      // Process recent activities
      if (activitiesRes.status === 'fulfilled') {
        const activities = activitiesRes.value.data.data || activitiesRes.value.data.activities || [];
        setRecentActivities(Array.isArray(activities) ? activities : []);
      }

      // Process system health
      if (healthRes.status === 'fulfilled') {
        setSystemHealth(healthRes.value.data.data || healthRes.value.data);
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      message.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Activity columns with enhanced styling
  const activityColumns = [
    {
      title: 'Người dùng',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <Space>
          <UserOutlined style={{ color: colors.primary[500] }} />
          <span>{text || record.user?.fullName || 'N/A'}</span>
        </Space>
      ),
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (action, record) => {
        const actionType = record.actionType || action;
        let color = 'blue';
        if (actionType?.includes('CREATE') || actionType?.includes('create')) color = 'green';
        if (actionType?.includes('UPDATE') || actionType?.includes('update')) color = 'orange';
        if (actionType?.includes('DELETE') || actionType?.includes('delete')) color = 'red';
        return <Tag color={color}>{action || actionType}</Tag>;
      },
    },
    {
      title: 'Chi tiết',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (text) => <span className="text-secondary">{text || '-'}</span>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time, record) => {
        const date = new Date(time || record.createdAt);
        return <span className="text-secondary">{date.toLocaleString('vi-VN')}</span>;
      },
    },
  ];

  // Revenue chart configuration
  const revenueChartConfig = {
    data: revenueData,
    xField: 'date',
    yField: 'revenue',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    label: {
      position: 'top',
      style: {
        fill: colors.text.secondary,
        opacity: 0.8,
        fontSize: 12,
      },
      formatter: (datum) => {
        if (datum.revenue > 1000000) {
          return `${(datum.revenue / 1000000).toFixed(1)}M`;
        }
        return `${(datum.revenue / 1000).toFixed(0)}K`;
      },
    },
    color: [colors.primary[500], colors.success[500]],
    columnStyle: {
      radius: [6, 6, 0, 0],
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: 'Doanh thu',
          value: formatCurrency(datum.revenue),
        };
      },
    },
  };

  // Patient distribution pie chart
  const distributionChartConfig = {
    data: patientDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'inner',
      offset: '-30%',
      content: '{percentage}',
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    statistic: {
      title: {
        content: 'Tổng',
        style: {
          fontSize: 14,
        },
      },
      content: {
        style: {
          fontSize: 24,
        },
      },
    },
    interactions: [{ type: 'element-active' }],
    color: [
      colors.primary[500],
      colors.success[500],
      colors.warning[500],
      colors.error[500],
      colors.info[500],
    ],
  };

  return (
    <div className="page-container dashboard-container fadeIn">
      {/* Enhanced Header */}
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title" style={{ 
            fontSize: 28, 
            fontWeight: 600,
            color: colors.text.primary,
            marginBottom: 4,
          }}>
            <DashboardOutlined style={{ marginRight: 12, color: colors.primary[500] }} />
            Super Admin Dashboard
          </h1>
          <p className="dashboard-subtitle" style={{ 
            fontSize: 14, 
            color: colors.text.secondary,
            marginBottom: 0,
          }}>
            Tổng quan quản trị hệ thống - Cập nhật: {new Date().toLocaleString('vi-VN')}
          </p>
        </div>
        <Space size="middle">
          <Button 
            icon={<ReloadOutlined spin={refreshing} />} 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Làm mới
          </Button>
          <Button 
            type="primary" 
            size="large" 
            icon={<SettingOutlined />}
            onClick={() => navigate('/admin/settings')}
          >
            Cài đặt
          </Button>
        </Space>
      </div>

      {/* Enhanced Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="stat-card" 
            loading={loading}
            variant="borderless"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
              color: 'white',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng người dùng</span>}
              value={stats?.totalUsers || stats?.totalStaff || 0}
              prefix={<UserOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: 32, fontWeight: 600 }}
            />
            <div className="stat-footer" style={{ marginTop: 12, color: 'rgba(255,255,255,0.8)' }}>
              <Space>
                <ArrowUpOutlined />
                <span>Bác sĩ: {stats?.totalDoctors || 0} | Y tá: {stats?.totalNurses || 0}</span>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="stat-card" 
            loading={loading}
            variant="borderless"
            style={{ 
              background: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
              color: 'white',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng bệnh nhân</span>}
              value={stats?.totalPatients || 0}
              prefix={<MedicineBoxFilled style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: 32, fontWeight: 600 }}
            />
            <div className="stat-footer" style={{ marginTop: 12, color: 'rgba(255,255,255,0.8)' }}>
              <Space>
                <UserAddOutlined />
                <span>Hôm nay: +{stats?.patientsToday || 0}</span>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="stat-card" 
            loading={loading}
            variant="borderless"
            style={{ 
              background: `linear-gradient(135deg, ${colors.warning[500]} 0%, ${colors.warning[600]} 100%)`,
              color: 'white',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Doanh thu hôm nay</span>}
              value={stats?.revenueToday || 0}
              prefix={<DollarOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: 28, fontWeight: 600 }}
              formatter={(value) => {
                if (value > 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value > 1000) return `${(value / 1000).toFixed(0)}K`;
                return value;
              }}
            />
            <div className="stat-footer" style={{ marginTop: 12, color: 'rgba(255,255,255,0.8)' }}>
              <Space>
                <BankOutlined />
                <span>Từ {stats?.revenueTodayCount || 0} hóa đơn</span>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="stat-card" 
            loading={loading}
            variant="borderless"
            style={{ 
              background: `linear-gradient(135deg, ${colors.info[500]} 0%, ${colors.info[600]} 100%)`,
              color: 'white',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Lịch hẹn hôm nay</span>}
              value={stats?.appointmentsToday || 0}
              prefix={<CalendarOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: 32, fontWeight: 600 }}
            />
            <div className="stat-footer" style={{ marginTop: 12, color: 'rgba(255,255,255,0.8)' }}>
              <Space>
                <HeartOutlined />
                <span>Chờ xử lý: {stats?.appointmentsByStatus?.PENDING || 0}</span>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Enhanced Charts & Analytics */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <DollarOutlined style={{ color: colors.warning[500] }} />
                <span>Biểu đồ doanh thu 7 ngày gần đây</span>
              </Space>
            }
            className="content-card"
            variant="borderless"
            loading={loading}
            extra={
              <Tag color="green">
                Tổng: {formatCurrency(revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0))}
              </Tag>
            }
          >
            {revenueData.length > 0 ? (
              <Column {...revenueChartConfig} />
            ) : (
              <Empty description="Chưa có dữ liệu doanh thu" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <TeamOutlined style={{ color: colors.primary[500] }} />
                <span>Phân bố bệnh nhân</span>
              </Space>
            }
            className="content-card"
            variant="borderless"
            loading={loading}
          >
            {patientDistribution.length > 0 ? (
              <Pie {...distributionChartConfig} />
            ) : (
              <Empty description="Chưa có dữ liệu phân bố" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: colors.info[500] }} />
                <span>Hoạt động gần đây</span>
              </Space>
            }
            className="content-card"
            variant="borderless"
            loading={loading}
            extra={
              <Button 
                type="link" 
                icon={<ArrowUpOutlined style={{ transform: 'rotate(45deg)' }} />}
                onClick={() => navigate('/admin/audit-logs')}
              >
                Xem tất cả
              </Button>
            }
          >
            {recentActivities.length > 0 ? (
              <Table
                columns={activityColumns}
                dataSource={recentActivities}
                pagination={false}
                size="middle"
                rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
              />
            ) : (
              <Empty description="Chưa có hoạt động nào" />
            )}
          </Card>
        </Col>
      </Row>

      {/* System Health & Department Stats */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <HeartOutlined style={{ color: colors.error[500] }} />
                <span>Trạng thái hệ thống</span>
              </Space>
            }
            className="content-card"
            variant="borderless"
            loading={loading}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 16px',
                background: colors.background.default,
                borderRadius: 6,
                transition: 'all 0.3s ease',
              }}>
                <Space>
                  <SafetyOutlined style={{ fontSize: 20, color: colors.success[500] }} />
                  <span style={{ fontWeight: 500 }}>Database</span>
                </Space>
                <Tag color="green">{systemHealth?.database?.status || (typeof systemHealth?.database === 'string' ? systemHealth?.database : 'Healthy')}</Tag>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 16px',
                background: colors.background.default,
                borderRadius: 6,
              }}>
                <Space>
                  <SafetyOutlined style={{ fontSize: 20, color: colors.success[500] }} />
                  <span style={{ fontWeight: 500 }}>API Server</span>
                </Space>
                <Tag color="green">{systemHealth?.api?.status || (typeof systemHealth?.api === 'string' ? systemHealth?.api : 'Running')}</Tag>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 16px',
                background: colors.background.default,
                borderRadius: 6,
              }}>
                <Space>
                  <ExperimentOutlined style={{ fontSize: 20, color: colors.warning[500] }} />
                  <span style={{ fontWeight: 500 }}>Storage</span>
                </Space>
                <Tag color="orange">{systemHealth?.storage?.status || (typeof systemHealth?.storage === 'string' ? systemHealth?.storage : '75% Used')}</Tag>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 16px',
                background: colors.background.default,
                borderRadius: 6,
              }}>
                <Space>
                  <DashboardOutlined style={{ fontSize: 20, color: colors.success[500] }} />
                  <span style={{ fontWeight: 500 }}>Memory</span>
                </Space>
                <Tag color="green">{systemHealth?.memory?.status || (typeof systemHealth?.memory === 'string' ? systemHealth?.memory : 'Normal')}</Tag>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <BankOutlined style={{ color: colors.primary[500] }} />
                <span>Thống kê phòng ban</span>
              </Space>
            }
            className="content-card"
            variant="borderless"
            loading={loading}
          >
            {departmentStats.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {departmentStats.slice(0, 4).map((dept, index) => (
                  <div 
                    key={dept.name || index}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: colors.background.default,
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    className="hover-lift"
                  >
                    <Space>
                      <MedicineBoxOutlined style={{ 
                        fontSize: 20, 
                        color: [colors.primary[500], colors.success[500], colors.warning[500], colors.info[500]][index % 4] 
                      }} />
                      <span style={{ fontWeight: 500 }}>{dept.name || dept._id}</span>
                    </Space>
                    <strong style={{ color: colors.primary[600] }}>
                      {dept.count || dept.patientCount || 0} BN
                    </strong>
                  </div>
                ))}
              </Space>
            ) : (
              <Empty description="Chưa có dữ liệu phòng ban" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <SettingOutlined style={{ color: colors.warning[500] }} />
                <span>Thao tác nhanh</span>
              </Space>
            }
            className="content-card"
            variant="borderless"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button 
                type="primary" 
                block 
                size="large"
                icon={<UserAddOutlined />} 
                onClick={() => navigate('/users/create')}
                style={{ height: 48 }}
              >
                Tạo người dùng mới
              </Button>
              <Button 
                block 
                size="large"
                icon={<MedicineBoxOutlined />} 
                onClick={() => navigate('/patients/register')}
                style={{ height: 48 }}
              >
                Đăng ký bệnh nhân
              </Button>
              <Button 
                block 
                size="large"
                icon={<FileTextOutlined />}
                onClick={() => navigate('/admin/audit-logs')}
                style={{ height: 48 }}
              >
                Xem nhật ký hệ thống
              </Button>
              <Button 
                block 
                size="large"
                icon={<SettingOutlined />}
                onClick={() => navigate('/admin/settings')}
                style={{ height: 48 }}
              >
                Cài đặt hệ thống
              </Button>
              <Button 
                danger 
                block 
                size="large"
                icon={<DashboardOutlined />}
                onClick={() => navigate('/admin/monitoring')}
                style={{ height: 48 }}
              >
                Giám sát hệ thống
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Enhanced Resource Usage */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <DashboardOutlined style={{ color: colors.info[500] }} />
                <span>Tài nguyên hệ thống</span>
              </Space>
            }
            className="content-card"
            variant="borderless"
            loading={loading}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ 
                    marginBottom: 16, 
                    fontSize: 16, 
                    fontWeight: 500,
                    color: colors.text.primary,
                  }}>
                    <SafetyOutlined style={{ marginRight: 8, color: colors.success[500] }} />
                    CPU Usage
                  </p>
                  <Progress 
                    type="circle" 
                    percent={systemHealth?.cpu?.percent || (typeof systemHealth?.cpu === 'number' ? systemHealth?.cpu : 45)} 
                    status="active"
                    strokeColor={{
                      '0%': colors.success[500],
                      '100%': colors.success[600],
                    }}
                    format={(percent) => `${percent}%`}
                    size={120}
                  />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ 
                    marginBottom: 16, 
                    fontSize: 16, 
                    fontWeight: 500,
                    color: colors.text.primary,
                  }}>
                    <DashboardOutlined style={{ marginRight: 8, color: colors.warning[500] }} />
                    Memory Usage
                  </p>
                  <Progress 
                    type="circle" 
                    percent={systemHealth?.memory?.heapUsedPercent || systemHealth?.memory?.percent || (typeof systemHealth?.memory === 'number' ? systemHealth?.memory : 68)} 
                    status="active"
                    strokeColor={{
                      '0%': colors.warning[500],
                      '100%': colors.warning[600],
                    }}
                    format={(percent) => `${percent}%`}
                    size={120}
                  />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ 
                    marginBottom: 16, 
                    fontSize: 16, 
                    fontWeight: 500,
                    color: colors.text.primary,
                  }}>
                    <ExperimentOutlined style={{ marginRight: 8, color: colors.error[500] }} />
                    Storage Usage
                  </p>
                  <Progress 
                    type="circle" 
                    percent={systemHealth?.storage?.percent || (typeof systemHealth?.storage === 'number' ? systemHealth?.storage : 45)} 
                    strokeColor={{
                      '0%': colors.error[500],
                      '100%': colors.error[600],
                    }}
                    format={(percent) => `${percent}%`}
                    size={120}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Additional Stats Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card variant="borderless" style={{ background: colors.background.paper }}>
            <Statistic
              title="Tổng giường bệnh"
              value={stats?.totalBeds || 150}
              suffix={`/ ${stats?.occupiedBeds || 112} đang sử dụng`}
              prefix={<MedicineBoxOutlined style={{ color: colors.primary[500] }} />}
            />
            <Progress 
              percent={stats?.bedOccupancyRate || 74.6} 
              strokeColor={colors.primary[500]}
              style={{ marginTop: 12 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ background: colors.background.paper }}>
            <Statistic
              title="Hóa đơn chờ thanh toán"
              value={stats?.pendingBills || 0}
              prefix={<DollarOutlined style={{ color: colors.warning[500] }} />}
              valueStyle={{ color: colors.warning[600] }}
            />
            <div style={{ marginTop: 12, color: colors.text.secondary }}>
              <Space>
                <FileTextOutlined />
                <span>Cần xử lý ngay</span>
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card variant="borderless" style={{ background: colors.background.paper }}>
            <Statistic
              title="Doanh thu tháng này"
              value={stats?.revenueMonth || 0}
              prefix={<BankOutlined style={{ color: colors.success[500] }} />}
              valueStyle={{ color: colors.success[600] }}
              formatter={(value) => {
                if (value > 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                if (value > 1000000) return `${(value / 1000000).toFixed(1)}M`;
                return formatCurrency(value);
              }}
            />
            <div style={{ marginTop: 12, color: colors.text.secondary }}>
              <Space>
                <ArrowUpOutlined style={{ color: colors.success[500] }} />
                <span>Tăng so với tháng trước</span>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuperAdminDashboard;
