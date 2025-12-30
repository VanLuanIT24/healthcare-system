// src/pages/admin/appointments/AppointmentStats.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import { CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, DatePicker, Divider, Row, Skeleton, Statistic, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const AppointmentStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [department, setDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadStats();
    loadDepartments();
  }, [dateRange, department]);

  const loadDepartments = async () => {
    try {
      // Lấy danh sách khoa từ API
      // Tạm thời bỏ qua nếu không có endpoint
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointmentStats({
        dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
        dateTo: dateRange[1]?.format('YYYY-MM-DD'),
        departmentId: department || undefined
      });

      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
      message.error('Lỗi tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#eb2f96'];

  if (loading || !stats) {
    return (
      <AdminLayout>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </AdminLayout>
    );
  }

  // Dữ liệu mẫu nếu API chưa trả về
  const appointmentsByDay = stats?.appointmentsByDay || [
    { date: '2024-01-01', count: 5 },
    { date: '2024-01-02', count: 8 },
    { date: '2024-01-03', count: 6 }
  ];

  const appointmentsByStatus = stats?.appointmentsByStatus || [
    { name: 'Hoàn thành', value: 45 },
    { name: 'Chờ xác nhận', value: 12 },
    { name: 'Đã hủy', value: 8 },
    { name: 'Vắng mặt', value: 5 }
  ];

  const topDoctors = stats?.topDoctors || [
    { name: 'Bác sĩ A', appointments: 15 },
    { name: 'Bác sĩ B', appointments: 12 },
    { name: 'Bác sĩ C', appointments: 10 }
  ];

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          <CalendarOutlined style={{ marginRight: '8px' }} />
          Thống kê lịch hẹn
        </h1>

        {/* Filter */}
        <Card style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Khoảng thời gian</label>
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange(dates);
                  }
                }}
              />
            </Col>
          </Row>
        </Card>

        {/* Key Metrics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng lịch hẹn"
                value={stats?.totalAppointments || 0}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Hoàn thành"
                value={stats?.completedAppointments || 0}
                suffix={`/${stats?.totalAppointments || 0}`}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Hủy"
                value={stats?.cancelledAppointments || 0}
                suffix={`/${stats?.totalAppointments || 0}`}
                valueStyle={{ color: '#f5222d' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Vắng mặt"
                value={stats?.noShowAppointments || 0}
                suffix={`/${stats?.totalAppointments || 0}`}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Charts */}
        <Row gutter={[16, 16]}>
          {/* Lịch hẹn theo ngày */}
          <Col xs={24} lg={12}>
            <Card title="Lịch hẹn theo ngày" style={{ minHeight: '400px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={appointmentsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1890ff"
                    name="Số lịch"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Lịch hẹn theo trạng thái */}
          <Col xs={24} lg={12}>
            <Card title="Lịch hẹn theo trạng thái" style={{ minHeight: '400px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={appointmentsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {appointmentsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Top bác sĩ */}
          <Col xs={24}>
            <Card title="Top 10 bác sĩ">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topDoctors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="appointments" fill="#1890ff" name="Số lịch khám" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default AppointmentStats;
