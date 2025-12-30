// src/pages/patient/Dashboard.jsx
import appointmentAPI from '@/services/api/appointmentAPI';
import patientAPI from '@/services/api/patientAPI';
import userAPI from '@/services/api/userAPI';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileOutlined,
    HeartOutlined,
    PlusOutlined,
    RightOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Col, Empty, List, Row, Skeleton, Tabs, Tag } from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProfilePageContent from './ProfilePageContent';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [stats, setStats] = useState([
    { icon: <CalendarOutlined />, title: 'Lịch hẹn', value: 0, color: '#1890ff' },
    { icon: <FileOutlined />, title: 'Hồ sơ', value: 0, color: '#52c41a' },
    { icon: <HeartOutlined />, title: 'Đơn thuốc', value: 0, color: '#eb2f96' },
    { icon: <CheckCircleOutlined />, title: 'Kết quả xét nghiệm', value: 0, color: '#faad14' },
  ]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if tab parameter is in URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'profile') {
      setActiveTab('profile');
    }
  }, [searchParams]);

  // Load data from MongoDB
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load user profile
        const profileRes = await userAPI.getMyProfile();
        setProfileData(profileRes.data);

        // Load upcoming appointments
        const appointmentsRes = await appointmentAPI.getUpcomingAppointments({ limit: 5 });
        const appointments = appointmentsRes.data?.data || appointmentsRes.data || [];
        
        const formattedAppointments = appointments.map(apt => ({
          id: apt._id,
          doctor: `${apt.doctorId?.personalInfo?.firstName || ''} ${apt.doctorId?.personalInfo?.lastName || ''}`,
          specialty: apt.doctorId?.doctorInfo?.specialization || 'N/A',
          date: dayjs(apt.appointmentDate).format('DD/MM/YYYY'),
          time: dayjs(apt.appointmentDate).format('HH:mm'),
          status: apt.status || 'upcoming',
        })).slice(0, 5);
        
        setUpcomingAppointments(formattedAppointments);

        // Load lab results - only if patient ID exists
        const patientId = profileRes.data?._id || profileRes.data?.id;
        if (patientId) {
          const labResultsRes = await patientAPI.getPatientDocuments(patientId);
          const labResults = labResultsRes.data?.data || labResultsRes.data || [];
          
          const formattedResults = labResults
            .filter(doc => doc.type === 'LAB_RESULT' || doc.documentType === 'xét nghiệm')
            .map(result => ({
              id: result._id,
              type: result.name || result.title || 'Xét nghiệm',
              date: dayjs(result.uploadDate || result.createdAt).format('DD/MM/YYYY'),
            status: 'ready',
          }))
          .slice(0, 5);
        
          setRecentResults(formattedResults);

          // Update stats with lab data
          const statsRes = await appointmentAPI.getAppointmentStats();
          const statsData = statsRes.data || {};
          
          setStats([
            { icon: <CalendarOutlined />, title: 'Lịch hẹn', value: formattedAppointments.length, color: '#1890ff' },
            { icon: <FileOutlined />, title: 'Hồ sơ', value: labResults.length || 0, color: '#52c41a' },
            { icon: <HeartOutlined />, title: 'Đơn thuốc', value: statsData.totalPrescriptions || 0, color: '#eb2f96' },
            { icon: <CheckCircleOutlined />, title: 'Kết quả xét nghiệm', value: formattedResults.length, color: '#faad14' },
          ]);
        } else {
          // If no patient ID, just set default stats
          const statsRes = await appointmentAPI.getAppointmentStats();
          const statsData = statsRes.data || {};
          
          setStats([
            { icon: <CalendarOutlined />, title: 'Lịch hẹn', value: formattedAppointments.length, color: '#1890ff' },
            { icon: <FileOutlined />, title: 'Hồ sơ', value: 0, color: '#52c41a' },
            { icon: <HeartOutlined />, title: 'Đơn thuốc', value: statsData.totalPrescriptions || 0, color: '#eb2f96' },
            { icon: <CheckCircleOutlined />, title: 'Kết quả xét nghiệm', value: 0, color: '#faad14' },
          ]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Keep default empty states on error
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <Tabs 
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: '📊 Tổng quan',
            children: (
              <div className="space-y-6">
                {/* Welcome Card */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 text-white border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">
                          Xin chào, {profileData?.fullName || 'Bệnh nhân'}!
                        </h1>
                        <p className="text-blue-100">Quản lý sức khỏe của bạn mọi lúc, mọi nơi</p>
                      </div>
                      <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        className="rounded-lg"
                        onClick={() => navigate('/booking')}
                      >
                        Đặt lịch khám
                      </Button>
                    </div>
                  </Card>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Row gutter={[16, 16]}>
                    {stats.map((stat, index) => (
                      <Col xs={24} sm={12} lg={6} key={index}>
                        <Card className="rounded-xl hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-gray-500 text-sm mb-1">{stat.title}</div>
                              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                            </div>
                            <div
                              className="text-4xl"
                              style={{ color: stat.color, opacity: 0.3 }}
                            >
                              {stat.icon}
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </motion.div>

                {/* Main Content */}
                <Row gutter={[24, 24]}>
                  {/* Appointments */}
                  <Col xs={24} lg={14}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card
                        title={
                          <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-blue-600" />
                            <span>Lịch hẹn sắp tới</span>
                          </div>
                        }
                        extra={
                          <Button
                            type="link"
                            icon={<RightOutlined />}
                            onClick={() => navigate('/patient/appointments')}
                          >
                            Xem tất cả
                          </Button>
                        }
                        className="rounded-xl"
                      >
                        {loading ? (
                          <Skeleton active paragraph={{ rows: 3 }} />
                        ) : upcomingAppointments.length > 0 ? (
                          <List
                            dataSource={upcomingAppointments}
                            renderItem={(appointment) => (
                              <List.Item className="px-0 py-4 border-0 border-b last:border-0">
                                <List.Item.Meta
                                  avatar={
                                    <Avatar
                                      size="large"
                                      style={{ backgroundColor: '#1890ff' }}
                                      icon={<UserOutlined />}
                                    />
                                  }
                                  title={
                                    <div>
                                      <div className="font-semibold text-gray-900">
                                        {appointment.doctor}
                                      </div>
                                      <Tag className="mt-1">{appointment.specialty}</Tag>
                                    </div>
                                  }
                                  description={
                                    <div className="flex items-center gap-4 mt-2 text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <CalendarOutlined /> {appointment.date}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <ClockCircleOutlined /> {appointment.time}
                                      </span>
                                    </div>
                                  }
                                />
                                <Button type="link" onClick={() => navigate(`/patient/appointments/${appointment.id}`)}>
                                  Chi tiết
                                </Button>
                              </List.Item>
                            )}
                          />
                        ) : (
                          <Empty description="Không có lịch hẹn" />
                        )}
                      </Card>
                    </motion.div>
                  </Col>

                  {/* Recent Results */}
                  <Col xs={24} lg={10}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card
                        title={
                          <div className="flex items-center gap-2">
                            <FileOutlined className="text-green-600" />
                            <span>Kết quả xét nghiệm gần đây</span>
                          </div>
                        }
                        extra={
                          <Button
                            type="link"
                            icon={<RightOutlined />}
                            onClick={() => navigate('/patient/lab-results')}
                          >
                            Xem tất cả
                          </Button>
                        }
                        className="rounded-xl"
                      >
                        {loading ? (
                          <Skeleton active paragraph={{ rows: 3 }} />
                        ) : recentResults.length > 0 ? (
                          <List
                            dataSource={recentResults}
                            renderItem={(result) => (
                              <List.Item className="px-0 py-3 border-0 border-b last:border-0">
                                <List.Item.Meta
                                  title={
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-gray-900">
                                        {result.type}
                                      </span>
                                      {result.status === 'ready' && (
                                        <Tag color="success">Sẵn sàng</Tag>
                                      )}
                                    </div>
                                  }
                                  description={result.date}
                                />
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() => navigate(`/patient/lab-results/${result.id}`)}
                                >
                                  Xem
                                </Button>
                              </List.Item>
                            )}
                          />
                        ) : (
                          <Empty description="Không có kết quả" />
                        )}
                      </Card>
                    </motion.div>
                  </Col>
                </Row>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                      <Card
                        className="rounded-xl hover:shadow-md transition-shadow cursor-pointer text-center"
                        onClick={() => navigate('/patient/medical-records')}
                      >
                        <FileOutlined className="text-2xl text-blue-600 mb-2" />
                        <div className="font-semibold text-gray-900">Hồ sơ y tế</div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card
                        className="rounded-xl hover:shadow-md transition-shadow cursor-pointer text-center"
                        onClick={() => navigate('/patient/prescriptions')}
                      >
                        <PlusOutlined className="text-2xl text-green-600 mb-2" />
                        <div className="font-semibold text-gray-900">Đơn thuốc</div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card
                        className="rounded-xl hover:shadow-md transition-shadow cursor-pointer text-center"
                        onClick={() => navigate('/patient/messages')}
                      >
                        <HeartOutlined className="text-2xl text-red-600 mb-2" />
                        <div className="font-semibold text-gray-900">Tin nhắn</div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card
                        className="rounded-xl hover:shadow-md transition-shadow cursor-pointer text-center"
                        onClick={() => setActiveTab('profile')}
                      >
                        <UserOutlined className="text-2xl text-purple-600 mb-2" />
                        <div className="font-semibold text-gray-900">Hồ sơ</div>
                      </Card>
                    </Col>
                  </Row>
                </motion.div>
              </div>
            ),
          },
          {
            key: 'profile',
            label: '👤 Thông tin cá nhân',
            children: <ProfilePageContent />,
          },
        ]}
      />
  );
};

export default Dashboard;
