// 💊 Pharmacist Dashboard
import {
    AlertOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    MedicineBoxOutlined,
} from '@ant-design/icons';
import { Alert, Avatar, Badge, Button, Card, Col, List, message, Row } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import prescriptionAPI from '../../services/api/prescriptionAPI';
import './Dashboard.css';

const PharmacistDashboard = () => {
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPharmacyData();
  }, []);

  const loadPharmacyData = async () => {
    try {
      const prescriptionsResponse = await prescriptionAPI.getPrescriptions({ status: 'pending' });
      setPendingPrescriptions(prescriptionsResponse.data?.prescriptions || []);

      const alertsResponse = await prescriptionAPI.getLowStockAlerts();
      setLowStockAlerts(alertsResponse.data?.medications || []);
    } catch (error) {
      // Mock data
      setPendingPrescriptions([
        {
          _id: '1',
          patient: { fullName: 'Nguyễn Văn A', patientId: 'P001' },
          medications: [{ name: 'Paracetamol', quantity: 20 }],
          status: 'pending',
        },
      ]);
      setLowStockAlerts([
        { name: 'Amoxicillin', currentStock: 50, minStock: 100 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (prescriptionId) => {
    try {
      await prescriptionAPI.dispenseMedication(prescriptionId);
      message.success('Đã xuất thuốc thành công');
      loadPharmacyData();
    } catch (error) {
      message.error('Xuất thuốc thất bại');
    }
  };

  return (
    <div className="page-container dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dược phẩm</h1>
          <p className="dashboard-subtitle">Quản lý nhà thuốc</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<MedicineBoxOutlined />}
          onClick={() => navigate('/pharmacy/inventory')}
        >
          Quản lý kho
        </Button>
      </div>

      {lowStockAlerts.length > 0 && (
        <Alert
          message="Cảnh báo tồn kho"
          description={`Có ${lowStockAlerts.length} loại thuốc sắp hết hàng`}
          type="warning"
          showIcon
          icon={<AlertOutlined />}
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" onClick={() => navigate('/pharmacy/inventory')}>
              Xem chi tiết
            </Button>
          }
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="stat-card-mini">
            <div className="stat-content">
              <ClockCircleOutlined className="stat-icon orange" />
              <div>
                <div className="stat-value">{pendingPrescriptions.length}</div>
                <div className="stat-label">Đơn chờ xuất thuốc</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card-mini">
            <div className="stat-content">
              <AlertOutlined className="stat-icon red" />
              <div>
                <div className="stat-value">{lowStockAlerts.length}</div>
                <div className="stat-label">Cảnh báo tồn kho</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card-mini">
            <div className="stat-content">
              <CheckCircleOutlined className="stat-icon green" />
              <div>
                <div className="stat-value">45</div>
                <div className="stat-label">Đã xuất hôm nay</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title="Đơn thuốc chờ xử lý"
            className="content-card"
            extra={<Badge count={pendingPrescriptions.length} />}
          >
            <List
              dataSource={pendingPrescriptions}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      onClick={() => handleDispense(item._id)}
                    >
                      Xuất thuốc
                    </Button>,
                    <Button
                      type="link"
                      onClick={() => navigate(`/prescriptions/${item._id}`)}
                    >
                      Chi tiết
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<MedicineBoxOutlined />} />}
                    title={item.patient?.fullName}
                    description={
                      <div>
                        <div>ID: {item.patient?.patientId}</div>
                        <div>
                          Số loại thuốc: {item.medications?.length || 0}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="Cảnh báo tồn kho thấp"
            className="content-card"
            extra={<Badge count={lowStockAlerts.length} />}
          >
            <List
              dataSource={lowStockAlerts}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<ExclamationCircleOutlined />}
                        style={{ backgroundColor: '#ff4d4f' }}
                      />
                    }
                    title={item.name}
                    description={`Tồn kho: ${item.currentStock} (Tối thiểu: ${item.minStock})`}
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
                  icon={<MedicineBoxOutlined />}
                  onClick={() => navigate('/pharmacy/inventory')}
                >
                  Quản lý kho
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  block
                  size="large"
                  onClick={() => navigate('/prescriptions')}
                >
                  Đơn thuốc
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  block
                  size="large"
                  onClick={() => navigate('/pharmacy/medications')}
                >
                  Danh mục thuốc
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  block
                  size="large"
                  onClick={() => navigate('/pharmacy/reports')}
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

export default PharmacistDashboard;
