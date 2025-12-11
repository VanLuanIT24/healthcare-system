// 💰 Billing Staff Dashboard
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { Button, Card, Col, message, Row, Statistic, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import billingAPI from '../../services/api/billingAPI';
import './Dashboard.css';

const BillingStaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const statsResponse = await billingAPI.getRevenueStats();
      setStats(statsResponse.data);

      const billsResponse = await billingAPI.getOutstandingBills();
      setPendingBills(billsResponse.data?.bills || []);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'billNumber',
      key: 'billNumber',
    },
    {
      title: 'Bệnh nhân',
      dataIndex: ['patient', 'fullName'],
      key: 'patient',
    },
    {
      title: 'Số tiền',
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (amount) => `${amount?.toLocaleString('vi-VN')} VND`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : 'orange'}>
          {status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/billing/${record._id}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="page-container dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Quản lý thanh toán</h1>
          <p className="dashboard-subtitle">Dashboard thu ngân</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<FileTextOutlined />}
          onClick={() => navigate('/billing/create')}
        >
          Tạo hóa đơn mới
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="Doanh thu hôm nay"
              value={stats?.todayRevenue || 45000000}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="Doanh thu tháng"
              value={stats?.monthRevenue || 1250000000}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="HĐ chờ thanh toán"
              value={pendingBills.length || 12}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="HĐ đã thanh toán"
              value={stats?.paidBills || 156}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card
            title="Hóa đơn chờ thanh toán"
            className="content-card"
            extra={
              <Button type="link" onClick={() => navigate('/billing')}>
                Xem tất cả
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={pendingBills}
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BillingStaffDashboard;
