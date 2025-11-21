import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Empty,
  Spin,
  message,
  Space,
  Button,
  Tooltip,
  Divider,
  Alert,
  Progress,
  Descriptions
} from 'antd';
import {
  DatabaseOutlined,
  HddOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { apiClient } from '../utils/api';

const SystemHealthDashboard = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSystemHealth();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      setRefreshing(true);
      const response = await apiClient.get('/super-admin/system-health');
      
      if (response.data.success) {
        setSystemHealth(response.data.data);
        message.success('Cập nhật trạng thái hệ thống thành công');
      }
    } catch (err) {
      console.error('Error fetching system health:', err);
      message.error('Không thể lấy trạng thái hệ thống');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }} />;
  }

  if (!systemHealth) {
    return <Empty description="Không có dữ liệu hệ thống" />;
  }

  const getHealthStatus = (percentage) => {
    if (percentage < 50) return { status: 'success', color: '#52c41a' };
    if (percentage < 80) return { status: 'warning', color: '#faad14' };
    return { status: 'error', color: '#f5222d' };
  };

  const cpuStatus = getHealthStatus(systemHealth.cpu?.percentage || 0);
  const memoryStatus = getHealthStatus(systemHealth.memory?.percentage || 0);
  const diskStatus = getHealthStatus(systemHealth.disk?.percentage || 0);

  // Activity data - Chi tiết hoạt động
  const activityColumns = [
    {
      title: 'Hoạt động',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Tag color="blue">{count}</Tag>
    },
    {
      title: 'Tỷ lệ',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => (
        <Space>
          <Progress type="circle" percent={Math.round(percentage)} width={50} />
          {percentage >= 0 ? (
            <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#f5222d', fontSize: '16px' }} />
          )}
        </Space>
      )
    }
  ];

  const activityData = [
    { key: '1', name: 'Người dùng đang hoạt động', count: systemHealth.activeUsers || 0, percentage: 45 },
    { key: '2', name: 'Yêu cầu API hôm nay', count: systemHealth.apiRequests || 0, percentage: 62 },
    { key: '3', name: 'Lỗi hôm nay', count: systemHealth.errors || 0, percentage: -15 },
    { key: '4', name: 'Cơ sở dữ liệu truy cập', count: systemHealth.dbConnections || 0, percentage: 28 }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Alert if system is under stress */}
      {(cpuStatus.status === 'error' || memoryStatus.status === 'error' || diskStatus.status === 'error') && (
        <Alert
          message="Cảnh báo: Hệ thống đang chịu áp lực cao"
          description="CPU, bộ nhớ hoặc dung lượng đĩa đang ở mức nguy hiểm. Vui lòng kiểm tra các process."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Header with refresh button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>📊 Trạng Thái Hệ Thống</h2>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchSystemHealth}
          loading={refreshing}
        >
          Làm mới
        </Button>
      </div>

      {/* Status Indicators */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Trạng thái hệ thống"
              value="ONLINE"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Uptime"
              value={systemHealth.uptime || 'N/A'}
              suffix="giờ"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người dùng online"
              value={systemHealth.activeUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="API Latency"
              value={systemHealth.apiLatency || 0}
              suffix="ms"
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Resource Usage */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        {/* CPU */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            title={
              <Space>
                <HddOutlined />
                <span>CPU</span>
              </Space>
            }
            style={{ borderTop: `4px solid ${cpuStatus.color}` }}
          >
            <Progress
              type="circle"
              percent={Math.round(systemHealth.cpu?.percentage || 0)}
              status={cpuStatus.status}
              width={100}
              format={(percent) => `${percent}%`}
            />
            <Descriptions size="small" style={{ marginTop: '16px' }}>
              <Descriptions.Item label="Nhân">
                {systemHealth.cpu?.cores || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Tốc độ">
                {systemHealth.cpu?.speed || 'N/A'} GHz
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Memory */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            title={
              <Space>
                <DatabaseOutlined />
                <span>Bộ nhớ</span>
              </Space>
            }
            style={{ borderTop: `4px solid ${memoryStatus.color}` }}
          >
            <Progress
              type="circle"
              percent={Math.round(systemHealth.memory?.percentage || 0)}
              status={memoryStatus.status}
              width={100}
              format={(percent) => `${percent}%`}
            />
            <Descriptions size="small" style={{ marginTop: '16px' }}>
              <Descriptions.Item label="Sử dụng">
                {systemHealth.memory?.used || 'N/A'} GB
              </Descriptions.Item>
              <Descriptions.Item label="Tổng">
                {systemHealth.memory?.total || 'N/A'} GB
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Disk */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            title={
              <Space>
                <DatabaseOutlined />
                <span>Dung lượng đĩa</span>
              </Space>
            }
            style={{ borderTop: `4px solid ${diskStatus.color}` }}
          >
            <Progress
              type="circle"
              percent={Math.round(systemHealth.disk?.percentage || 0)}
              status={diskStatus.status}
              width={100}
              format={(percent) => `${percent}%`}
            />
            <Descriptions size="small" style={{ marginTop: '16px' }}>
              <Descriptions.Item label="Sử dụng">
                {systemHealth.disk?.used || 'N/A'} GB
              </Descriptions.Item>
              <Descriptions.Item label="Tổng">
                {systemHealth.disk?.total || 'N/A'} GB
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Database Status */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="📁 Cơ sở dữ liệu" loading={loading}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <strong>Trạng thái kết nối:</strong>
                <Tag
                  color={systemHealth.database?.connected ? 'success' : 'error'}
                  style={{ marginLeft: '8px' }}
                >
                  {systemHealth.database?.connected ? 'Đã kết nối' : 'Mất kết nối'}
                </Tag>
              </div>
              <div>
                <strong>Kết nối hiện tại:</strong>
                <Tag color="blue" style={{ marginLeft: '8px' }}>
                  {systemHealth.database?.connections || 0} / {systemHealth.database?.maxConnections || 50}
                </Tag>
              </div>
              <div>
                <strong>Dung lượng:</strong>
                <Tag color="cyan" style={{ marginLeft: '8px' }}>
                  {systemHealth.database?.size || 'N/A'} MB
                </Tag>
              </div>
              <div>
                <strong>Thời gian phản hồi:</strong>
                <Tag color="purple" style={{ marginLeft: '8px' }}>
                  {systemHealth.database?.latency || 'N/A'} ms
                </Tag>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Cache Status */}
        <Col xs={24} lg={12}>
          <Card title="⚡ Cache" loading={loading}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <strong>Trạng thái:</strong>
                <Tag
                  color={systemHealth.cache?.enabled ? 'success' : 'default'}
                  style={{ marginLeft: '8px' }}
                >
                  {systemHealth.cache?.enabled ? 'Bật' : 'Tắt'}
                </Tag>
              </div>
              <div>
                <strong>Hit Rate:</strong>
                <Progress
                  percent={Math.round((systemHealth.cache?.hitRate || 0) * 100)}
                  style={{ marginTop: '4px' }}
                />
              </div>
              <div>
                <strong>Kích thước bộ nhớ cache:</strong>
                <Tag color="orange" style={{ marginLeft: '8px' }}>
                  {systemHealth.cache?.size || 'N/A'} MB
                </Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card title="📈 Hoạt động gần đây">
        <Table
          columns={activityColumns}
          dataSource={activityData}
          pagination={false}
          size="small"
          rowKey="key"
        />
      </Card>

      {/* Server Info */}
      <Card title="ℹ️ Thông tin máy chủ" style={{ marginTop: '24px' }}>
        <Descriptions column={{ xxl: 4, xl: 3, lg: 2, md: 1 }} size="small">
          <Descriptions.Item label="Node.js Version">
            {systemHealth.server?.nodeVersion || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="OS">
            {systemHealth.server?.os || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian chạy">
            {systemHealth.uptime || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Môi trường">
            <Tag color="blue">{process.env.NODE_ENV || 'development'}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default SystemHealthDashboard;
