// src/pages/doctor/Dashboard.jsx - Dashboard cho bác sĩ
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileOutlined,
  HeartOutlined,
  PlusOutlined,
  RightOutlined,
  UserOutlined,
  TeamOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Col, Empty, List, Row, Skeleton, Tabs, Tag, Statistic, Badge } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentAPI from '@/services/api/appointmentAPI';
import userAPI from '@/services/api/userAPI';
import dayjs from 'dayjs';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    todayCount: 0,
    completedCount: 0,
    patientCount: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load data from MongoDB
  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        setLoading(true);

        // Load doctor profile
        const profileRes = await userAPI.getMyProfile();
        setProfileData(profileRes.data);

        // Load today's appointments
        const todayRes = await appointmentAPI.getTodayAppointments({ limit: 10 });
        const todayData = todayRes.data?.data || todayRes.data || [];
        const todayArray = Array.isArray(todayData) ? todayData : [];
        
        const formattedToday = todayArray.map(apt => ({
          id: apt._id,
          patient: apt.patientId?.personalInfo?.firstName || 'N/A',
          patientId: apt.patientId?._id,
          time: dayjs(apt.appointmentDate).format('HH:mm'),
          reason: apt.reason || 'N/A',
          status: apt.status,
          phone: apt.patientId?.personalInfo?.phoneNumber || 'N/A',
          email: apt.patientId?.personalInfo?.email || 'N/A',
        }));
        
        setTodayAppointments(formattedToday);

        // Load upcoming appointments
        const upcomingRes = await appointmentAPI.getUpcomingAppointments({ limit: 5 });
        const upcomingData = upcomingRes.data?.data || upcomingRes.data || [];
        const upcomingArray = Array.isArray(upcomingData) ? upcomingData : [];
        
        const formattedUpcoming = upcomingArray.map(apt => ({
          id: apt._id,
          patient: apt.patientId?.personalInfo?.firstName || 'N/A',
          date: dayjs(apt.appointmentDate).format('DD/MM/YYYY'),
          time: dayjs(apt.appointmentDate).format('HH:mm'),
          reason: apt.reason || 'N/A',
          status: apt.status,
        })).slice(0, 5);
        
        setUpcomingAppointments(formattedUpcoming);

        // Load appointment stats
        const statsRes = await appointmentAPI.getAppointmentStats();
        const statsData = statsRes.data || {};
        
        setStats({
          todayCount: formattedToday.length,
          completedCount: formattedToday.filter(a => a.status === 'COMPLETED').length,
          patientCount: statsData.totalPatients || 0,
          pendingCount: formattedToday.filter(a => a.status === 'SCHEDULED').length,
        });
      } catch (error) {
        console.error('Error loading doctor dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDoctorData();
  }, []);

  const getStatusColor = (status) => {
    const statusMap = {
      'SCHEDULED': 'blue',
      'CONFIRMED': 'cyan',
      'IN_PROGRESS': 'orange',
      'COMPLETED': 'green',
      'CANCELLED': 'red',
      'NO_SHOW': 'volcano',
    };
    return statusMap[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'SCHEDULED': 'Đã đặt',
      'CONFIRMED': 'Xác nhận',
      'IN_PROGRESS': 'Đang khám',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Hủy',
      'NO_SHOW': 'Không đến',
    };
    return statusMap[status] || status;
  };

  return (
    <DoctorLayout>
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
                  <Card className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">
                          Xin chào, {profileData?.personalInfo?.firstName || 'Bác sĩ'}! 👨‍⚕️
                        </h1>
                        <p className="text-blue-100">
                          Chuyên khoa: {profileData?.specialty || 'N/A'}
                        </p>
                      </div>
                      <Badge count={stats.pendingCount} color="#ff4d4f">
                        <Button
                          type="primary"
                          size="large"
                          className="bg-white text-blue-600 hover:bg-blue-50"
                          onClick={() => setActiveTab('appointments')}
                        >
                          Lịch hẹn hôm nay
                        </Button>
                      </Badge>
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
                    <Col xs={24} sm={12} lg={6}>
                      <Card className="rounded-xl hover:shadow-md transition-shadow">
                        <Statistic
                          title="Lịch hẹn hôm nay"
                          value={stats.todayCount}
                          prefix={<CalendarOutlined className="text-blue-600" />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card className="rounded-xl hover:shadow-md transition-shadow">
                        <Statistic
                          title="Đã hoàn thành"
                          value={stats.completedCount}
                          prefix={<CheckCircleOutlined className="text-green-600" />}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card className="rounded-xl hover:shadow-md transition-shadow">
                        <Statistic
                          title="Đang chờ"
                          value={stats.pendingCount}
                          prefix={<ClockCircleOutlined className="text-orange-600" />}
                          valueStyle={{ color: '#faad14' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card className="rounded-xl hover:shadow-md transition-shadow">
                        <Statistic
                          title="Tổng bệnh nhân"
                          value={stats.patientCount}
                          prefix={<UserOutlined className="text-purple-600" />}
                          valueStyle={{ color: '#722ed1' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </motion.div>

                {/* Main Content */}
                <Row gutter={[24, 24]}>
                  {/* Today's Appointments */}
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
                            <span>Lịch hẹn hôm nay</span>
                          </div>
                        }
                        extra={
                          <Button
                            type="link"
                            icon={<RightOutlined />}
                            onClick={() => setActiveTab('appointments')}
                          >
                            Xem tất cả
                          </Button>
                        }
                        className="rounded-xl"
                      >
                        {loading ? (
                          <Skeleton active paragraph={{ rows: 3 }} />
                        ) : todayAppointments.length > 0 ? (
                          <List
                            dataSource={todayAppointments}
                            renderItem={(appointment) => (
                              <List.Item className="px-0 py-4 border-0 border-b last:border-0 hover:bg-gray-50 rounded-lg px-3">
                                <List.Item.Meta
                                  avatar={
                                    <Avatar
                                      size="large"
                                      style={{ backgroundColor: '#1890ff' }}
                                      icon={<UserOutlined />}
                                    />
                                  }
                                  title={
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-semibold text-gray-900">
                                          {appointment.patient}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                          {appointment.reason}
                                        </div>
                                      </div>
                                      <Tag color={getStatusColor(appointment.status)}>
                                        {getStatusLabel(appointment.status)}
                                      </Tag>
                                    </div>
                                  }
                                  description={
                                    <div className="flex items-center gap-4 mt-2 text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <ClockCircleOutlined /> {appointment.time}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        📱 {appointment.phone}
                                      </span>
                                    </div>
                                  }
                                />
                                <Button 
                                  type="primary" 
                                  size="small"
                                  onClick={() => navigate(`/doctor/appointments/${appointment.id}`)}
                                >
                                  Chi tiết
                                </Button>
                              </List.Item>
                            )}
                          />
                        ) : (
                          <Empty description="Không có lịch hẹn hôm nay" />
                        )}
                      </Card>
                    </motion.div>
                  </Col>

                  {/* Upcoming Appointments */}
                  <Col xs={24} lg={10}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card
                        title={
                          <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-green-600" />
                            <span>Lịch hẹn sắp tới</span>
                          </div>
                        }
                        extra={
                          <Button
                            type="link"
                            icon={<RightOutlined />}
                            onClick={() => setActiveTab('appointments')}
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
                              <List.Item className="px-0 py-3 border-0 border-b last:border-0">
                                <List.Item.Meta
                                  title={
                                    <div>
                                      <div className="font-semibold text-gray-900">
                                        {appointment.patient}
                                      </div>
                                      <Tag className="mt-1" color="blue">
                                        {appointment.date} {appointment.time}
                                      </Tag>
                                    </div>
                                  }
                                  description={appointment.reason}
                                />
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() => navigate(`/doctor/appointments/${appointment.id}`)}
                                >
                                  Xem
                                </Button>
                              </List.Item>
                            )}
                          />
                        ) : (
                          <Empty description="Không có lịch hẹn sắp tới" />
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
                        onClick={() => setActiveTab('appointments')}
                      >
                        <CalendarOutlined className="text-2xl text-blue-600 mb-2" />
                        <div className="font-semibold text-gray-900">Lịch hẹn</div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card
                        className="rounded-xl hover:shadow-md transition-shadow cursor-pointer text-center"
                        onClick={() => navigate('/doctor/medical-records')}
                      >
                        <FileOutlined className="text-2xl text-green-600 mb-2" />
                        <div className="font-semibold text-gray-900">Hồ sơ bệnh nhân</div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card
                        className="rounded-xl hover:shadow-md transition-shadow cursor-pointer text-center"
                        onClick={() => navigate('/doctor/prescriptions')}
                      >
                        <HeartOutlined className="text-2xl text-red-600 mb-2" />
                        <div className="font-semibold text-gray-900">Đơn thuốc</div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card
                        className="rounded-xl hover:shadow-md transition-shadow cursor-pointer text-center"
                        onClick={() => navigate('/doctor/schedule')}
                      >
                        <ClockCircleOutlined className="text-2xl text-purple-600 mb-2" />
                        <div className="font-semibold text-gray-900">Lịch làm việc</div>
                      </Card>
                    </Col>
                  </Row>
                </motion.div>
              </div>
            ),
          },
          {
            key: 'appointments',
            label: '📅 Lịch hẹn',
            children: <AppointmentsTab loading={loading} />,
          },
          {
            key: 'medical-records',
            label: '📋 Hồ sơ',
            children: <MedicalRecordsTab />,
          },
          {
            key: 'prescriptions',
            label: '💊 Đơn thuốc',
            children: <PrescriptionsTab />,
          },
          {
            key: 'profile',
            label: '👤 Hồ sơ cá nhân',
            children: <ProfileTab profileData={profileData} loading={loading} />,
          },
        ]}
      />
    </DoctorLayout>
  );
};

const AppointmentsTab = ({ loading }) => {
  const [appointments, setAppointments] = useState([]);
  const [pageLoading, setPageLoading] = useState(loading);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setPageLoading(true);
        const res = await appointmentAPI.getAppointments({ limit: 100 });
        const data = res.data?.data || res.data || [];
        const arr = Array.isArray(data) ? data : [];
        setAppointments(arr);
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setPageLoading(false);
      }
    };
    loadAppointments();
  }, []);

  if (pageLoading) return <Skeleton active paragraph={{ rows: 5 }} />;

  return (
    <Card>
      <List
        dataSource={appointments}
        renderItem={(apt) => (
          <List.Item>
            <List.Item.Meta
              title={`${apt.patientId?.personalInfo?.firstName || 'N/A'} - ${apt.reason}`}
              description={`${dayjs(apt.appointmentDate).format('DD/MM/YYYY HH:mm')}`}
            />
          </List.Item>
        )}
        locale={{ emptyText: 'Không có lịch hẹn' }}
      />
    </Card>
  );
};

const MedicalRecordsTab = () => {
  return (
    <Card className="rounded-xl">
      <Empty description="Tính năng hồ sơ bệnh nhân đang được phát triển" />
    </Card>
  );
};

const PrescriptionsTab = () => {
  return (
    <Card className="rounded-xl">
      <Empty description="Tính năng quản lý đơn thuốc đang được phát triển" />
    </Card>
  );
};

const ProfileTab = ({ profileData, loading }) => {
  return (
    <Card className="rounded-xl">
      {loading ? (
        <Skeleton active />
      ) : profileData ? (
        <div className="space-y-4">
          <div>
            <label className="font-semibold text-gray-700">Họ và tên:</label>
            <p className="text-gray-900">{profileData?.personalInfo?.firstName} {profileData?.personalInfo?.lastName}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Email:</label>
            <p className="text-gray-900">{profileData?.personalInfo?.email}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Điện thoại:</label>
            <p className="text-gray-900">{profileData?.personalInfo?.phoneNumber}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Chuyên khoa:</label>
            <p className="text-gray-900">{profileData?.specialty}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Số giấy phép:</label>
            <p className="text-gray-900">{profileData?.licenseNumber}</p>
          </div>
          <Button type="primary" onClick={() => window.location.href = '/doctor/profile/edit'}>
            Chỉnh sửa hồ sơ
          </Button>
        </div>
      ) : (
        <Empty description="Không thể tải hồ sơ" />
      )}
    </Card>
  );
};

export default DoctorDashboard;
