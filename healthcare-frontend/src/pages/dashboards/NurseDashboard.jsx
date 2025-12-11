// 👩‍⚕️ Nurse Dashboard
import {
    AlertOutlined,
    ClockCircleOutlined,
    ExperimentOutlined,
    HeartOutlined,
    MedicineBoxOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Card, Col, Empty, List, Row, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const NurseDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadNursingTasks();
  }, []);

  const loadNursingTasks = async () => {
    // Mock data
    const mockTasks = [
      {
        id: '1',
        patient: { fullName: 'Nguyễn Văn A', patientId: 'P001', room: '301' },
        type: 'vital-signs',
        description: 'Đo dấu hiệu sinh tồn',
        time: '09:00',
        status: 'pending',
        priority: 'normal',
      },
      {
        id: '2',
        patient: { fullName: 'Trần Thị B', patientId: 'P002', room: '305' },
        type: 'medication',
        description: 'Tiêm thuốc kháng sinh',
        time: '10:00',
        status: 'pending',
        priority: 'urgent',
      },
    ];
    setTasks(mockTasks);
  };

  const getTaskIcon = (type) => {
    const icons = {
      'vital-signs': <HeartOutlined />,
      'medication': <MedicineBoxOutlined />,
      'lab': <ExperimentOutlined />,
      'alert': <AlertOutlined />,
    };
    return icons[type] || <ClockCircleOutlined />;
  };

  const getPriorityColor = (priority) => {
    return priority === 'urgent' ? 'red' : priority === 'high' ? 'orange' : 'default';
  };

  return (
    <div className="page-container dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Chào mừng, {user?.fullName}</h1>
          <p className="dashboard-subtitle">Nhiệm vụ điều dưỡng hôm nay</p>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="stat-card-mini">
            <div className="stat-content">
              <UserOutlined className="stat-icon blue" />
              <div>
                <div className="stat-value">24</div>
                <div className="stat-label">Bệnh nhân đang điều trị</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card-mini">
            <div className="stat-content">
              <ClockCircleOutlined className="stat-icon orange" />
              <div>
                <div className="stat-value">{tasks.length}</div>
                <div className="stat-label">Nhiệm vụ chờ xử lý</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card-mini">
            <div className="stat-content">
              <AlertOutlined className="stat-icon red" />
              <div>
                <div className="stat-value">3</div>
                <div className="stat-label">Cảnh báo khẩn</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <span>
                <ClockCircleOutlined /> Nhiệm vụ hôm nay
              </span>
            }
            className="content-card"
            extra={<Badge count={tasks.length} />}
          >
            {tasks.length === 0 ? (
              <Empty description="Không có nhiệm vụ" />
            ) : (
              <List
                dataSource={tasks}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button type="primary" size="small">
                        Hoàn thành
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={getTaskIcon(item.type)} />}
                      title={
                        <div>
                          {item.patient.fullName} - Phòng {item.patient.room}
                          {' '}
                          <Tag color={getPriorityColor(item.priority)}>
                            {item.priority === 'urgent' ? 'Khẩn' : 'Thường'}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div>{item.description}</div>
                          <div>
                            <ClockCircleOutlined /> {item.time}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Thao tác nhanh" className="content-card">
            <Button
              block
              size="large"
              icon={<HeartOutlined />}
              style={{ marginBottom: 12 }}
              onClick={() => navigate('/clinical/vital-signs')}
            >
              Ghi nhận dấu hiệu sinh tồn
            </Button>
            <Button
              block
              size="large"
              icon={<MedicineBoxOutlined />}
              style={{ marginBottom: 12 }}
              onClick={() => navigate('/prescriptions')}
            >
              Quản lý thuốc
            </Button>
            <Button
              block
              size="large"
              icon={<UserOutlined />}
              onClick={() => navigate('/patients')}
            >
              Danh sách bệnh nhân
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NurseDashboard;
