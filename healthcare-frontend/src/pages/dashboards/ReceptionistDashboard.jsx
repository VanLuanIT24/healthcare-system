// 📋 Receptionist Dashboard
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    SearchOutlined,
    UserAddOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Card, Col, Input, List, message, Row, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentAPI from '../../services/api/appointmentAPI';
import './Dashboard.css';

const ReceptionistDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentAPI.getTodayAppointments();
      setTodayAppointments(response.data?.appointments || []);
    } catch (error) {
      // Mock data
      setTodayAppointments([
        {
          _id: '1',
          patient: { fullName: 'Nguyễn Văn A', patientId: 'P001' },
          appointmentDate: new Date(),
          status: 'scheduled',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      await appointmentAPI.checkInAppointment(appointmentId);
      message.success('Check-in thành công');
      loadAppointments();
    } catch (error) {
      message.error('Check-in thất bại');
    }
  };

  return (
    <div className="page-container dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Lễ tân</h1>
          <p className="dashboard-subtitle">Quản lý tiếp nhận bệnh nhân</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<UserAddOutlined />}
          onClick={() => navigate('/patients/register')}
        >
          Đăng ký bệnh nhân mới
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="stat-card-mini">
            <div className="stat-content">
              <CalendarOutlined className="stat-icon blue" />
              <div>
                <div className="stat-value">{todayAppointments.length}</div>
                <div className="stat-label">Lịch hẹn hôm nay</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card-mini">
            <div className="stat-content">
              <ClockCircleOutlined className="stat-icon orange" />
              <div>
                <div className="stat-value">
                  {todayAppointments.filter(a => a.status === 'scheduled').length}
                </div>
                <div className="stat-label">Chờ check-in</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card-mini">
            <div className="stat-content">
              <CheckCircleOutlined className="stat-icon green" />
              <div>
                <div className="stat-value">
                  {todayAppointments.filter(a => a.status === 'checked-in').length}
                </div>
                <div className="stat-label">Đã check-in</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title="Lịch hẹn hôm nay"
            className="content-card"
            extra={<Badge count={todayAppointments.length} />}
          >
            <Input
              placeholder="Tìm kiếm bệnh nhân..."
              prefix={<SearchOutlined />}
              style={{ marginBottom: 16 }}
            />
            <List
              dataSource={todayAppointments}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    item.status === 'scheduled' ? (
                      <Button
                        type="primary"
                        onClick={() => handleCheckIn(item._id)}
                      >
                        Check-in
                      </Button>
                    ) : (
                      <Tag color="green">Đã check-in</Tag>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.patient?.fullName}
                    description={
                      <div>
                        <div>ID: {item.patient?.patientId}</div>
                        <div>Giờ hẹn: {new Date(item.appointmentDate).toLocaleTimeString('vi-VN')}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Thao tác nhanh" className="content-card">
            <Button
              block
              size="large"
              icon={<UserAddOutlined />}
              style={{ marginBottom: 12 }}
              onClick={() => navigate('/patients/register')}
            >
              Đăng ký bệnh nhân
            </Button>
            <Button
              block
              size="large"
              icon={<CalendarOutlined />}
              style={{ marginBottom: 12 }}
              onClick={() => navigate('/appointments/schedule')}
            >
              Đặt lịch hẹn
            </Button>
            <Button
              block
              size="large"
              icon={<SearchOutlined />}
              onClick={() => navigate('/patients')}
            >
              Tra cứu bệnh nhân
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReceptionistDashboard;
