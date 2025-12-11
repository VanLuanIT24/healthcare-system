// 📊 System Monitoring Dashboard
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DatabaseOutlined,
    DownloadOutlined,
    ReloadOutlined,
    WarningOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    message,
    Progress,
    Row,
    Select,
    Space,
    Spin,
    Statistic,
    Table,
    Tag
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import adminExtendedAPI from '../../services/api/adminExtendedAPI';
import './Admin.css';

const { Option } = Select;

const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [errorLogs, setErrorLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadMonitoringData();
    const interval = setInterval(loadMonitoringData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadMonitoringData = async () => {
    try {
      if (!refreshing) setLoading(true);
      else setRefreshing(true);

      // Load system metrics
      const metricsRes = await adminExtendedAPI.getSystemMetrics(timeRange);
      setMetrics(metricsRes.data);

      // Load database status
      const dbRes = await adminExtendedAPI.getDatabaseStatus();
      setDbStatus(dbRes.data);

      // Load error logs
      const errorRes = await adminExtendedAPI.getErrorLogs({
        page: pagination.current,
        limit: pagination.pageSize,
      });
      setErrorLogs(errorRes.data.logs || []);
      setPagination({ ...pagination, total: errorRes.data.total || 0 });
    } catch (error) {
      message.error('Không thể tải dữ liệu giám sát');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadMonitoringData();
  };

  const handleDownloadLogs = async () => {
    try {
      const response = await adminExtendedAPI.exportLogs({ timeRange });
      // Handle file download
      const blob = new Blob([JSON.stringify(response.data, null, 2)]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `system-logs-${moment().format('YYYY-MM-DD')}.json`);
      document.body.appendChild(link);
      link.click();
      message.success('Tải nhật ký xuống thành công');
    } catch (error) {
      message.error('Tải nhật ký thất bại');
    }
  };

  const handleClearOldLogs = () => {
    Modal.confirm({
      title: 'Xóa nhật ký cũ',
      content: 'Bạn có chắc chắn muốn xóa các nhật ký cũ hơn 30 ngày?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminExtendedAPI.clearOldLogs(30);
          message.success('Đã xóa nhật ký cũ');
          loadMonitoringData();
        } catch (error) {
          message.error('Xóa nhật ký thất bại');
        }
      },
    });
  };

  const errorColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm:ss'),
      width: 180,
    },
    {
      title: 'Mức độ',
      dataIndex: 'level',
      key: 'level',
      render: (level) => {
        const colors = { error: 'red', warning: 'orange', info: 'blue' };
        const icons = {
          error: <CloseCircleOutlined />,
          warning: <WarningOutlined />,
          info: <CheckCircleOutlined />,
        };
        return (
          <Tag color={colors[level]} icon={icons[level]}>
            {level.toUpperCase()}
          </Tag>
        );
      },
      width: 100,
    },
    {
      title: 'Mô tả',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      key: 'source',
      render: (source) => <code style={{ fontSize: 12 }}>{source}</code>,
      width: 120,
    },
  ];

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page-container monitoring-dashboard-container">
      <PageHeader
        title="Giám sát hệ thống"
        subtitle="Theo dõi hiệu suất và trạng thái hệ thống"
        extra={
          <Space>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
            >
              <Option value="1h">1 giờ</Option>
              <Option value="24h">24 giờ</Option>
              <Option value="7d">7 ngày</Option>
              <Option value="30d">30 ngày</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={refreshing}
            >
              Làm mới
            </Button>
          </Space>
        }
      />

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="CPU"
              value={metrics?.cpu || 0}
              suffix="%"
              valueStyle={{
                color: (metrics?.cpu || 0) > 80 ? '#ff4d4f' : '#1890ff',
              }}
            />
            <Progress
              percent={metrics?.cpu || 0}
              status={(metrics?.cpu || 0) > 80 ? 'exception' : 'active'}
              strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Memory"
              value={metrics?.memory || 0}
              suffix="%"
              valueStyle={{
                color: (metrics?.memory || 0) > 85 ? '#ff4d4f' : '#1890ff',
              }}
            />
            <Progress
              percent={metrics?.memory || 0}
              status={(metrics?.memory || 0) > 85 ? 'exception' : 'active'}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Disk"
              value={metrics?.disk || 0}
              suffix="%"
              valueStyle={{
                color: (metrics?.disk || 0) > 90 ? '#ff4d4f' : '#1890ff',
              }}
            />
            <Progress
              percent={metrics?.disk || 0}
              status={(metrics?.disk || 0) > 90 ? 'exception' : 'active'}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Uptime"
              value={metrics?.uptime || 0}
              suffix="h"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Database Status */}
      {dbStatus && (
        <Card style={{ marginBottom: 24 }} title="📦 Trạng thái Cơ sở dữ liệu">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <Statistic
                title="Kết nối"
                value={dbStatus.connections || 0}
                valueStyle={{
                  color: dbStatus.status === 'connected' ? '#52c41a' : '#ff4d4f',
                }}
                prefix={<DatabaseOutlined />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Dung lượng"
                value={dbStatus.size || 0}
                suffix="MB"
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Bộ sưu tập"
                value={dbStatus.collections || 0}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Tài liệu"
                value={dbStatus.documents || 0}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Error Logs */}
      <Card
        title="⚠️ Nhật ký lỗi"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="small"
              onClick={handleDownloadLogs}
            >
              Tải xuống
            </Button>
            <Button
              danger
              size="small"
              onClick={handleClearOldLogs}
            >
              Xóa cũ
            </Button>
          </Space>
        }
      >
        <Table
          columns={errorColumns}
          dataSource={errorLogs}
          loading={refreshing}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhật ký`,
          }}
          onChange={(newPagination) => setPagination(newPagination)}
          size="small"
        />
      </Card>

      {/* Auto-refresh notice */}
      <div style={{ marginTop: 16, textAlign: 'center', color: '#8c8c8c', fontSize: 12 }}>
        📊 Dữ liệu tự động làm mới mỗi 30 giây
      </div>
    </div>
  );
};

export default MonitoringDashboard;
