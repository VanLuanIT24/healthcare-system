// 🩺 Doctor Dashboard - Enhanced Version
import {
    AlertOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExperimentOutlined,
    EyeOutlined,
    FileTextOutlined,
    FormOutlined,
    HeartOutlined,
    MedicineBoxOutlined,
    ReloadOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Card, Col, Empty, List, message, Row, Space, Statistic, Tag, Timeline } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import appointmentAPI from '../../services/api/appointmentAPI';
import clinicalAPI from '../../services/api/clinicalAPI';
import designSystem from '../../theme/designSystem';
import './Dashboard.css';

const { colors } = designSystem;

const DoctorDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [patientQueue, setPatientQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [
        appointmentsRes,
        recordsRes,
      ] = await Promise.allSettled([
        appointmentAPI.getTodayAppointments(),
        clinicalAPI.getRecentMedicalRecords({ limit: 5 }),
      ]);

      // Process appointments
      if (appointmentsRes.status === 'fulfilled') {
        const appointments = appointmentsRes.value.data?.appointments || appointmentsRes.value.data || [];
        setTodayAppointments(appointments);
        
        // Filter for waiting patients
        const waiting = appointments.filter(apt => 
          apt.status === 'CHECKED_IN' || apt.status === 'checked-in'
        );
        setPatientQueue(waiting);

        // Calculate stats
        const completed = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'completed').length;
        const pending = appointments.filter(a => 
          a.status === 'SCHEDULED' || a.status === 'scheduled' || 
          a.status === 'CHECKED_IN' || a.status === 'checked-in'
        ).length;
        
        setStats({
          total: appointments.length,
          completed,
          pending,
          waiting: waiting.length,
        });
      }

      // Process recent records
      if (recordsRes.status === 'fulfilled') {
        const records = recordsRes.value.data?.data || recordsRes.value.data?.records || [];
        setRecentRecords(records);
      }

    } catch (error) {
      console.error('Error loading doctor data:', error);
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDoctorData();
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'blue',
      'checked-in': 'orange',
      'in-progress': 'purple',
      'completed': 'green',
      'cancelled': 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      'scheduled': 'Đã lên lịch',
      'checked-in': 'Đã check-in',
      'in-progress': 'Đang khám',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
    };
    return texts[status] || status;
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'emergency') return <Badge status="error" text="Khẩn cấp" />;
    if (priority === 'urgent') return <Badge status="warning" text="Ưu tiên" />;
    return <Badge status="default" text="Thường" />;
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
            <HeartOutlined style={{ marginRight: 12, color: colors.error[500] }} />
            Chào mừng, Dr. {user?.lastName || user?.fullName}
          </h1>
          <p className="dashboard-subtitle" style={{ 
            fontSize: 14, 
            color: colors.text.secondary,
            marginBottom: 0,
          }}>
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
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
            icon={<UserOutlined />} 
            onClick={() => navigate('/patients')}
          >
            Danh sách bệnh nhân
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
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Lịch hẹn hôm nay</span>}
              value={stats?.total || 0}
              prefix={<CalendarOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: 32, fontWeight: 600 }}
            />
            <div className="stat-footer" style={{ marginTop: 12, color: 'rgba(255,255,255,0.8)' }}>
              <Space>
                <ClockCircleOutlined />
                <span>Tổng lịch hẹn</span>
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
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Đang chờ khám</span>}
              value={stats?.waiting || 0}
              prefix={<ClockCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: 32, fontWeight: 600 }}
            />
            <div className="stat-footer" style={{ marginTop: 12, color: 'rgba(255,255,255,0.8)' }}>
              <Space>
                <AlertOutlined />
                <span>Cần xử lý ngay</span>
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
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Đã hoàn thành</span>}
              value={stats?.completed || 0}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: 32, fontWeight: 600 }}
            />
            <div className="stat-footer" style={{ marginTop: 12, color: 'rgba(255,255,255,0.8)' }}>
              <Space>
                <CheckCircleOutlined />
                <span>Hôm nay</span>
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
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Chờ xử lý</span>}
              value={stats?.pending || 0}
              prefix={<FileTextOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: 32, fontWeight: 600 }}
            />
            <div className="stat-footer" style={{ marginTop: 12, color: 'rgba(255,255,255,0.8)' }}>
              <Space>
                <FileTextOutlined />
                <span>Đang đợi</span>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content - Patient Queue & Schedule */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Patient Queue */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <UserOutlined style={{ color: colors.primary[500] }} />
                <span>Hàng đợi khám bệnh</span>
              </Space>
            }
            className="content-card"
            variant="borderless"
            loading={loading}
            extra={<Badge count={patientQueue.length} showZero style={{ backgroundColor: colors.warning[500] }} />}
          >
            {patientQueue.length === 0 ? (
              <Empty description="Không có bệnh nhân đang chờ" />
            ) : (
              <List
                dataSource={patientQueue}
                renderItem={(item, index) => (
                  <List.Item
                    className={`priority-${item.priority || 'normal'} hover-lift`}
                    actions={[
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/consultation/${item._id}`)}
                      >
                        Bắt đầu khám
                      </Button>,
                    ]}
                    style={{
                      padding: '16px',
                      marginBottom: 8,
                      borderRadius: 8,
                      background: index % 2 === 0 ? colors.background.paper : colors.background.default,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={item.patient?.profilePicture}
                          icon={<UserOutlined />}
                          size={56}
                          style={{ border: `3px solid ${colors.primary[500]}` }}
                        />
                      }
                      title={
                        <Space>
                          <span style={{ fontSize: 16, fontWeight: 600 }}>
                            {item.patient?.fullName}
                          </span>
                          {getPriorityBadge(item.priority)}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
                          <span style={{ color: colors.text.secondary }}>
                            <strong>ID:</strong> {item.patient?.patientId}
                          </span>
                          <span style={{ color: colors.text.secondary }}>
                            <strong>Lý do:</strong> {item.reason || 'Khám tổng quát'}
                          </span>
                          <span style={{ color: colors.warning[600], fontWeight: 500 }}>
                            <ClockCircleOutlined /> Đã chờ:{' '}
                            {item.checkInTime ? Math.floor((Date.now() - new Date(item.checkInTime)) / 60000) : 0} phút
                          </span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Today's Schedule */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined style={{ color: colors.success[500] }} />
                <span>Lịch làm việc hôm nay</span>
              </Space>
            }
            className="content-card"
            variant="borderless"
            loading={loading}
          >
            {todayAppointments.length === 0 ? (
              <Empty description="Không có lịch hẹn" />
            ) : (
              <Timeline>
                {todayAppointments.map((appointment) => (
                  <Timeline.Item
                    key={appointment._id}
                    color={getStatusColor(appointment.status)}
                    dot={
                      appointment.status === 'in-progress' || appointment.status === 'IN_PROGRESS' ? (
                        <ClockCircleOutlined spin style={{ fontSize: 16 }} />
                      ) : undefined
                    }
                  >
                    <div className="timeline-item" style={{ padding: '8px 0' }}>
                      <div className="timeline-time" style={{ 
                        fontWeight: 600, 
                        color: colors.primary[600],
                        fontSize: 15,
                      }}>
                        {new Date(appointment.appointmentDate).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="timeline-content" style={{ marginTop: 4 }}>
                        <div className="timeline-patient" style={{ 
                          fontWeight: 600, 
                          fontSize: 15,
                          color: colors.text.primary,
                        }}>
                          {appointment.patient?.fullName}
                        </div>
                        <div className="timeline-reason" style={{
                          fontSize: 13,
                          color: colors.text.secondary,
                          marginTop: 4,
                        }}>
                          {appointment.reason || 'Khám tổng quát'}
                        </div>
                        <Space style={{ marginTop: 8 }}>
                          <Tag color={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Tag>
                          <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/appointments/${appointment._id}`)}
                          >
                            Chi tiết
                          </Button>
                        </Space>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Medical Records */}
      {recentRecords.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <FileTextOutlined style={{ color: colors.info[500] }} />
                  <span>Hồ sơ bệnh án gần đây</span>
                </Space>
              }
              className="content-card"
              variant="borderless"
              extra={
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => navigate('/medical-records')}
                >
                  Xem tất cả
                </Button>
              }
            >
              <List
                dataSource={recentRecords}
                renderItem={(record) => (
                  <List.Item
                    className="hover-lift"
                    actions={[
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/medical-records/${record._id}`)}
                      >
                        Xem
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: colors.info[500] }} />}
                      title={record.patient?.fullName || 'N/A'}
                      description={
                        <Space direction="vertical" size={2}>
                          <span>{record.chiefComplaint || 'Không có thông tin'}</span>
                          <span style={{ fontSize: 12, color: colors.text.secondary }}>
                            {new Date(record.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <FormOutlined style={{ color: colors.warning[500] }} />
                <span>Thao tác nhanh</span>
              </Space>
            }
            className="content-card"
            variant="borderless"
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Button
                  size="large"
                  block
                  icon={<UserOutlined />}
                  onClick={() => navigate('/patients')}
                  style={{ height: 64 }}
                >
                  Danh sách bệnh nhân
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  size="large"
                  block
                  icon={<MedicineBoxOutlined />}
                  onClick={() => navigate('/prescriptions/create')}
                  style={{ height: 64 }}
                >
                  Kê đơn thuốc
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  size="large"
                  block
                  icon={<FileTextOutlined />}
                  onClick={() => navigate('/medical-records')}
                  style={{ height: 64 }}
                >
                  Hồ sơ bệnh án
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  size="large"
                  block
                  icon={<ExperimentOutlined />}
                  onClick={() => navigate('/lab/orders')}
                  style={{ height: 64 }}
                >
                  Xét nghiệm
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DoctorDashboard;
