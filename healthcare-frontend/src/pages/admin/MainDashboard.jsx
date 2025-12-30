// src/pages/admin/MainDashboard.jsx
import adminAPI from '@/services/api/admin/adminAPI';
import { CalendarOutlined, DollarOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Row, Skeleton, Statistic, Table } from 'antd';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AdminLayout from '../../components/layout/admin/AdminLayout';

const MainDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [usersStats, setUsersStats] = useState(null);
  const [appointmentsStats, setAppointmentsStats] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [departmentsStats, setDepartmentsStats] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [users, appointments, reports, departments] = await Promise.all([
          adminAPI.getUsersStats(),
          adminAPI.getAppointmentsStats(),
          adminAPI.getReportsOverview(),
          adminAPI.getDepartmentsStats(),
        ]);

        setUsersStats(users?.data?.data);
        setAppointmentsStats(appointments?.data?.data);
        setReportsData(reports?.data?.data);
        setDepartmentsStats(departments?.data?.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: 'Tổng người dùng',
      value: usersStats?.totalUsers || 0,
      icon: <TeamOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      color: '#1890ff',
    },
    {
      title: 'Lịch khám hôm nay',
      value: appointmentsStats?.todayAppointments || 0,
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      color: '#52c41a',
    },
    {
      title: 'Doanh thu hôm nay',
      value: `${appointmentsStats?.todayRevenue || 0}₫`,
      icon: <DollarOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
      color: '#faad14',
    },
    {
      title: 'Bác sĩ trực',
      value: departmentsStats?.activeDoctors || 0,
      icon: <UserOutlined style={{ fontSize: '24px', color: '#eb2f96' }} />,
      color: '#eb2f96',
    },
  ];

  const revenueData = [
    { date: 'T2', revenue: 2400 },
    { date: 'T3', revenue: 1398 },
    { date: 'T4', revenue: 9800 },
    { date: 'T5', revenue: 3908 },
    { date: 'T6', revenue: 4800 },
    { date: 'T7', revenue: 3800 },
    { date: 'CN', revenue: 4300 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <Row gutter={[16, 16]}>
          {stats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Skeleton loading={loading} active>
                <Card className="rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-sm mb-1">{stat.title}</div>
                      <Statistic value={stat.value} />
                    </div>
                    <div style={{ fontSize: '32px', opacity: 0.1 }}>
                      {stat.icon}
                    </div>
                  </div>
                </Card>
              </Skeleton>
            </Col>
          ))}
        </Row>

        {/* Charts */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Skeleton loading={loading} active paragraph={{ rows: 10 }}>
              <Card title="💰 Doanh thu 7 ngày gần nhất" className="rounded-lg">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#1890ff" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Skeleton>
          </Col>

          <Col xs={24} lg={12}>
            <Skeleton loading={loading} active paragraph={{ rows: 10 }}>
              <Card title="📊 Lịch khám theo khoa" className="rounded-lg">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentsStats?.departmentAppointments || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="appointments" fill="#52c41a" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Skeleton>
          </Col>
        </Row>

        {/* Recent Appointments */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Skeleton loading={loading} active paragraph={{ rows: 8 }}>
              <Card title="📅 Lịch khám gần đây" className="rounded-lg">
                <Table
                  columns={[
                    { title: 'Bệnh nhân', dataIndex: 'patientName', key: 'patientName' },
                    { title: 'Bác sĩ', dataIndex: 'doctorName', key: 'doctorName' },
                    { title: 'Khoa', dataIndex: 'department', key: 'department' },
                    { title: 'Thời gian', dataIndex: 'datetime', key: 'datetime' },
                    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
                  ]}
                  dataSource={appointmentsStats?.recentAppointments || []}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Skeleton>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default MainDashboard;
