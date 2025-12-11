// 🏥 Hospital Admin Dashboard
import {
    BankOutlined,
    DollarOutlined,
    MedicineBoxOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import { Card, Col, Progress, Row, Statistic, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAPI from '../../services/api/adminAPI';
import './Dashboard.css';

const HospitalAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      message.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const departmentData = [
    { type: 'Cardiology', value: 245 },
    { type: 'Orthopedics', value: 198 },
    { type: 'Pediatrics', value: 167 },
    { type: 'Surgery', value: 134 },
  ];

  const pieConfig = {
    data: departmentData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
  };

  return (
    <div className="page-container dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Hospital Administration</h1>
          <p className="dashboard-subtitle">Tổng quan quản trị bệnh viện</p>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="Total Staff"
              value={stats?.totalStaff || 156}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="Active Patients"
              value={stats?.activePatients || 2846}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="Monthly Revenue"
              value={stats?.monthlyRevenue || 1250000000}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#cf1322' }}
              suffix="VND"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" loading={loading}>
            <Statistic
              title="Departments"
              value={stats?.totalDepartments || 12}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Patient Distribution by Department" className="content-card">
            <Pie {...pieConfig} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Resource Utilization" className="content-card">
            <div style={{ marginBottom: 16 }}>
              <p>Bed Occupancy</p>
              <Progress percent={85} status="active" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <p>Staff Utilization</p>
              <Progress percent={72} status="active" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <p>Equipment Usage</p>
              <Progress percent={68} />
            </div>
            <div>
              <p>Operating Room</p>
              <Progress percent={91} status="active" strokeColor="#faad14" />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HospitalAdminDashboard;
