// src/pages/admin/doctors/DoctorStats.jsx
import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, message } from 'antd';
import { LoadingOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { doctorAPI } from '@/services/api/doctorAPI';
import { motion } from 'framer-motion';

const DoctorStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await doctorAPI.getAllDoctorsStats();
        if (res.data?.data) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        message.error('Lỗi khi tải thống kê');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ padding: '24px' }}
      >
        <h1 style={{ marginBottom: '24px' }}>📊 Thống kê hiệu suất bác sĩ</h1>

        {/* Top Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng bác sĩ"
                value={stats?.totalDoctors || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Hoạt động"
                value={stats?.activeDoctors || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng lịch hẹn"
                value={stats?.totalAppointments || 0}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đánh giá trung bình"
                value={stats?.averageRating || 0}
                precision={1}
                suffix="/ 5"
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Top 5 bác sĩ theo lịch hẹn">
              {/* Chart component would go here */}
              <p>Top doctors chart placeholder</p>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Phân bố lịch hẹn theo trạng thái">
              {/* Chart component would go here */}
              <p>Appointment distribution chart placeholder</p>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </AdminLayout>
  );
};

export default DoctorStats;
