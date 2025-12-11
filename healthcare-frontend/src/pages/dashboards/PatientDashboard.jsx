// 🏥 Patient Dashboard (Patient Portal)
import {
    CalendarOutlined,
    DollarOutlined,
    ExperimentOutlined,
    FileTextOutlined,
    MedicineBoxOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Col, Empty, List, Row, Tag, Timeline } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import appointmentAPI from '../../services/api/appointmentAPI';
import './Dashboard.css';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      const response = await appointmentAPI.getUpcomingAppointments();
      setAppointments(response.data?.appointments || []);
    } catch (error) {
      // Mock data
      setAppointments([
        {
          _id: '1',
          doctor: { fullName: 'Dr. Nguyễn Văn A' },
          appointmentDate: new Date(Date.now() + 86400000),
          reason: 'Tái khám',
          status: 'scheduled',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Xin chào, {user?.fullName}</h1>
          <p className="dashboard-subtitle">Cổng thông tin bệnh nhân</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<CalendarOutlined />}
          onClick={() => navigate('/patient-portal/appointments/book')}
        >
          Đặt lịch khám
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-mini" hoverable onClick={() => navigate('/patient-portal/appointments')}>
            <div className="stat-content">
              <CalendarOutlined className="stat-icon blue" />
              <div>
                <div className="stat-value">{appointments.length}</div>
                <div className="stat-label">Lịch hẹn sắp tới</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-mini" hoverable onClick={() => navigate('/patient-portal/medical-records')}>
            <div className="stat-content">
              <FileTextOutlined className="stat-icon green" />
              <div>
                <div className="stat-value">12</div>
                <div className="stat-label">Hồ sơ khám bệnh</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-mini" hoverable onClick={() => navigate('/patient-portal/prescriptions')}>
            <div className="stat-content">
              <MedicineBoxOutlined className="stat-icon purple" />
              <div>
                <div className="stat-value">5</div>
                <div className="stat-label">Đơn thuốc</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-mini" hoverable onClick={() => navigate('/patient-portal/bills')}>
            <div className="stat-content">
              <DollarOutlined className="stat-icon orange" />
              <div>
                <div className="stat-value">2</div>
                <div className="stat-label">Hóa đơn chờ</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <CalendarOutlined /> Lịch hẹn sắp tới
              </span>
            }
            className="content-card"
            extra={
              <Button type="link" onClick={() => navigate('/patient-portal/appointments')}>
                Xem tất cả
              </Button>
            }
          >
            {appointments.length === 0 ? (
              <Empty description="Không có lịch hẹn" />
            ) : (
              <List
                dataSource={appointments.slice(0, 3)}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button type="link" onClick={() => navigate(`/patient-portal/appointments/${item._id}`)}>
                        Chi tiết
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={item.doctor?.fullName}
                      description={
                        <div>
                          <div>{new Date(item.appointmentDate).toLocaleString('vi-VN')}</div>
                          <div>{item.reason}</div>
                          <Tag color="blue">{item.status}</Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Thông tin sức khỏe" className="content-card">
            <Timeline>
              <Timeline.Item color="green">
                <div>Khám tổng quát - 15/11/2024</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Dr. Nguyễn Văn A</div>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <div>Xét nghiệm máu - 10/11/2024</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Kết quả: Bình thường</div>
              </Timeline.Item>
              <Timeline.Item color="gray">
                <div>Tiêm vaccine COVID-19 - 01/10/2024</div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Truy cập nhanh" className="content-card">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Button
                  block
                  size="large"
                  icon={<CalendarOutlined />}
                  onClick={() => navigate('/patient-portal/appointments/book')}
                >
                  Đặt lịch khám
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  block
                  size="large"
                  icon={<FileTextOutlined />}
                  onClick={() => navigate('/patient-portal/medical-records')}
                >
                  Hồ sơ bệnh án
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  block
                  size="large"
                  icon={<ExperimentOutlined />}
                  onClick={() => navigate('/patient-portal/lab-results')}
                >
                  Kết quả xét nghiệm
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  block
                  size="large"
                  icon={<DollarOutlined />}
                  onClick={() => navigate('/patient-portal/bills')}
                >
                  Thanh toán
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PatientDashboard;
