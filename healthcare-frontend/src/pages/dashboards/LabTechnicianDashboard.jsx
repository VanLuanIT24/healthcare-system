// 🔬 Lab Technician Dashboard
import {
    AlertOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExperimentOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Card, Col, List, message, Row, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import laboratoryAPI from '../../services/api/laboratoryAPI';
import './Dashboard.css';

const LabTechnicianDashboard = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [awaitingReview, setAwaitingReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLabData();
  }, []);

  const loadLabData = async () => {
    try {
      const pendingResponse = await laboratoryAPI.getPendingCollections();
      setPendingOrders(pendingResponse.data?.orders || []);

      const progressResponse = await laboratoryAPI.getInProgressTests();
      setInProgress(progressResponse.data?.orders || []);

      const reviewResponse = await laboratoryAPI.getAwaitingReview();
      setAwaitingReview(reviewResponse.data?.orders || []);
    } catch (error) {
      // Mock data
      setPendingOrders([
        {
          _id: '1',
          patient: { fullName: 'Nguyễn Văn A', patientId: 'P001' },
          tests: [{ name: 'Xét nghiệm máu' }],
          status: 'pending',
          priority: 'normal',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'collected': 'blue',
      'in-progress': 'purple',
      'completed': 'green',
      'cancelled': 'red',
    };
    return colors[status] || 'default';
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await laboratoryAPI.updateLabOrder(orderId, { status });
      message.success('Cập nhật trạng thái thành công');
      loadLabData();
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  return (
    <div className="page-container dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Phòng xét nghiệm</h1>
          <p className="dashboard-subtitle">Quản lý xét nghiệm</p>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card className="stat-card-mini">
            <div className="stat-content">
              <ClockCircleOutlined className="stat-icon orange" />
              <div>
                <div className="stat-value">{pendingOrders.length}</div>
                <div className="stat-label">Chờ lấy mẫu</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card className="stat-card-mini">
            <div className="stat-content">
              <SyncOutlined className="stat-icon blue" spin />
              <div>
                <div className="stat-value">{inProgress.length}</div>
                <div className="stat-label">Đang xử lý</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card className="stat-card-mini">
            <div className="stat-content">
              <AlertOutlined className="stat-icon purple" />
              <div>
                <div className="stat-value">{awaitingReview.length}</div>
                <div className="stat-label">Chờ duyệt</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card className="stat-card-mini">
            <div className="stat-content">
              <CheckCircleOutlined className="stat-icon green" />
              <div>
                <div className="stat-value">32</div>
                <div className="stat-label">Hoàn thành hôm nay</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Chờ lấy mẫu"
            className="content-card"
            extra={<Badge count={pendingOrders.length} />}
          >
            <List
              dataSource={pendingOrders}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      onClick={() => handleUpdateStatus(item._id, 'collected')}
                    >
                      Đã lấy mẫu
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<ExperimentOutlined />} />}
                    title={item.patient?.fullName}
                    description={
                      <div>
                        <div>ID: {item.patient?.patientId}</div>
                        <div>Xét nghiệm: {item.tests?.map(t => t.name).join(', ')}</div>
                        <Tag color={getStatusColor(item.status)}>
                          {item.status}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Đang xử lý"
            className="content-card"
            extra={<Badge count={inProgress.length} />}
          >
            <List
              dataSource={inProgress}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      onClick={() => navigate(`/lab/orders/${item._id}/result`)}
                    >
                      Nhập kết quả
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<SyncOutlined spin />}
                        style={{ backgroundColor: '#1890ff' }}
                      />
                    }
                    title={item.patient?.fullName}
                    description={
                      <div>
                        <div>Xét nghiệm: {item.tests?.map(t => t.name).join(', ')}</div>
                        <Tag color="blue">Đang xử lý</Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Thao tác nhanh" className="content-card">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Button
                  block
                  size="large"
                  icon={<ExperimentOutlined />}
                  onClick={() => navigate('/lab/orders')}
                >
                  Danh sách phiếu XN
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  block
                  size="large"
                  onClick={() => navigate('/lab/tests')}
                >
                  Danh mục xét nghiệm
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  block
                  size="large"
                  onClick={() => navigate('/lab/results')}
                >
                  Kết quả XN
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  block
                  size="large"
                  onClick={() => navigate('/lab/reports')}
                >
                  Báo cáo
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LabTechnicianDashboard;
