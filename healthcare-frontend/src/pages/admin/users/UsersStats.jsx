// src/pages/admin/users/UsersStats.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import adminAPI from '@/services/api/admin/adminAPI';
import { CheckCircleOutlined, CloseCircleOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import { Card, Col, Row, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';

const UsersStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getUsersStats();
        const data = response?.data?.data;
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const roleData = stats?.roleStats?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const departmentData = [
    { name: 'Tim Mạch', users: 12, value: 12 },
    { name: 'Thần Kinh', users: 8, value: 8 },
    { name: 'Xương Khớp', users: 15, value: 15 },
    { name: 'Nhi Khoa', users: 10, value: 10 },
    { name: 'Da Liễu', users: 6, value: 6 }
  ];

  // Màu sắc cho Pie Chart - cân bằng và hài hòa
  const PIE_COLORS = [
    '#667eea', // Tím xanh
    '#4facfe', // Xanh dương
    '#00bcd4', // Xanh lơn
    '#2ecc71', // Xanh lá
    '#ffc107', // Vàng cam
    '#ff9800', // Cam
    '#e91e63', // Hồng
    '#9c27b0', // Tím
    '#3f51b5', // Indigo
    '#ff5722'  // Cam đỏ
  ];
  
  // Màu sắc cho Bar Chart - cân bằng
  const BAR_COLORS = [
    '#ff4757', // Đỏ (nóng)
    '#ffa502', // Cam (nóng)
    '#ffd93d', // Vàng (nóng)
    '#2ecc71', // Xanh lá (lạnh)
    '#4facfe'  // Xanh dương (lạnh)
  ];

  const StatCard = ({ title, value, icon, gradient }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        style={{
          background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
          height: '100%'
        }}
      >
        <div style={{ color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>{title}</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{value}</div>
            </div>
            <div style={{ fontSize: '48px', opacity: 0.3 }}>{icon}</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '32px'
          }}>
            📊 Thống kê người dùng
          </h1>
        </motion.div>

        {/* Summary Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Skeleton loading={loading} active>
              <StatCard
                title="👥 Tổng người dùng"
                value={stats?.totalUsers || 0}
                icon={<TeamOutlined />}
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </Skeleton>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Skeleton loading={loading} active>
              <StatCard
                title="✅ Hoạt động"
                value={stats?.activeUsers || 0}
                icon={<CheckCircleOutlined />}
                gradient="linear-gradient(135deg, #51cf66 0%, #37b24d 100%)"
              />
            </Skeleton>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Skeleton loading={loading} active>
              <StatCard
                title="⏸️ Không hoạt động"
                value={stats?.inactiveUsers || 0}
                icon={<CloseCircleOutlined />}
                gradient="linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)"
              />
            </Skeleton>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Skeleton loading={loading} active>
              <StatCard
                title="👤 Bệnh nhân"
                value={stats?.patientCount || 0}
                icon={<UserAddOutlined />}
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
            </Skeleton>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} lg={12}>
            <Skeleton loading={loading} active paragraph={{ rows: 10 }}>
              <Card
                title="🥧 Phân bố Role"
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  borderTop: '4px solid #667eea'
                }}
              >
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={roleData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={100}
                        label={({ value }) => value}
                      >
                        {roleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                        formatter={(value) => [`${value} người dùng`, 'Số lượng']}
                      />
                      <Legend 
                        layout="horizontal"
                        verticalAlign="bottom"
                        height={36}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
            </Skeleton>
          </Col>
          <Col xs={24} lg={12}>
            <Skeleton loading={loading} active paragraph={{ rows: 10 }}>
              <Card
                title="📈 Người dùng theo Khoa"
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  borderTop: '4px solid #4facfe'
                }}
              >
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={departmentData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#999" fontSize={12} />
                      <YAxis stroke="#999" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                        formatter={(value) => [`${value} người dùng`, 'Số lượng']}
                      />
                      <Bar
                        dataKey="users"
                        name="Số người dùng"
                        radius={[8, 8, 0, 0]}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
            </Skeleton>
          </Col>
        </Row>

        {/* Role Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Skeleton loading={loading} active>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(245, 87, 108, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>👨‍⚕️ Bác sĩ</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats?.doctorCount || 0}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Skeleton>
          </Col>
          <Col xs={24} lg={8}>
            <Skeleton loading={loading} active>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Card
                  style={{
                    background: 'linear-gradient(135deg, #00d2fc 0%, #3a47d5 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(58, 71, 213, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>👩‍⚕️ Y tá</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats?.nurseCount || 0}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Skeleton>
          </Col>
          <Col xs={24} lg={8}>
            <Skeleton loading={loading} active>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Card
                  style={{
                    background: 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(255, 167, 81, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>👤 Admin</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats?.adminCount || 0}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Skeleton>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default UsersStats;
