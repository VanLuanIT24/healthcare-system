import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExperimentOutlined,
    FileTextOutlined,
    SyncOutlined
} from '@ant-design/icons';
import {
    Badge,
    Button,
    Card,
    Col,
    message,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tabs,
    Tag,
    Typography
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { laboratoryApi } from '../../../services/adminApi';

const { Title, Text } = Typography;
const { Option } = Select;

const LabDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [labOrders, setLabOrders] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    today: 0
  });

  useEffect(() => {
    fetchLabOrders();
    fetchStats();
  }, []);

  const fetchLabOrders = async () => {
    try {
      setLoading(true);
      
      const response = await laboratoryApi.getOrders({
        page: 1,
        limit: 50
      });
      
      // XỬ LÝ RESPONSE - Đảm bảo luôn là array
      if (response.success && response.data) {
        const orders = response.data.orders || response.data;
        setLabOrders(Array.isArray(orders) ? orders : []);
      } else if (Array.isArray(response.data)) {
        setLabOrders(response.data);
      } else if (Array.isArray(response)) {
        setLabOrders(response);
      } else {
        setLabOrders([]);
      }
    } catch (error) {
      console.error('Fetch lab orders error:', error);
      message.error(
        error.response?.data?.message || error.message || 'Không thể tải danh sách xét nghiệm'
      );
      // Không dùng mock data, để trống
      setLabOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await laboratoryApi.getStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
      // Giữ stats mặc định nếu lỗi
      setStats({
        pending: 0,
        inProgress: 0,
        completed: 0,
        today: 0
      });
    }
  };

  // Mock data for development
  const getMockLabOrders = () => [
    {
      _id: '1',
      orderCode: 'LAB001',
      patientName: 'Nguyễn Văn A',
      testName: 'Xét nghiệm máu tổng quát',
      status: 'pending',
      priority: 'normal',
      orderedAt: moment().subtract(2, 'hours').toISOString(),
      doctor: 'BS. Trần Văn B'
    },
    {
      _id: '2',
      orderCode: 'LAB002',
      patientName: 'Trần Thị B',
      testName: 'Xét nghiệm nước tiểu',
      status: 'inProgress',
      priority: 'urgent',
      orderedAt: moment().subtract(1, 'hours').toISOString(),
      doctor: 'BS. Lê Thị C'
    },
    {
      _id: '3',
      orderCode: 'LAB003',
      patientName: 'Lê Văn C',
      testName: 'Xét nghiệm sinh hóa',
      status: 'completed',
      priority: 'normal',
      orderedAt: moment().subtract(4, 'hours').toISOString(),
      completedAt: moment().subtract(1, 'hours').toISOString(),
      doctor: 'BS. Nguyễn Thị D'
    }
  ];

  const getMockStats = () => ({
    pending: 5,
    inProgress: 3,
    completed: 12,
    today: 20
  });

  const updateOrderStatus = async (orderId, status) => {
    try {
      await laboratoryApi.updateResult(orderId, { status });
      message.success('Đã cập nhật trạng thái');
      fetchLabOrders();
      fetchStats();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      IN_PROGRESS: 'processing',
      COMPLETED: 'success',
      CANCELLED: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Chờ xử lý',
      IN_PROGRESS: 'Đang xét nghiệm',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (record) => (
        <div>
          <div>{record.patientId?.personalInfo?.firstName} {record.patientId?.personalInfo?.lastName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.patientId?.phone}
          </Text>
        </div>
      )
    },
    {
      title: 'Xét nghiệm',
      dataIndex: ['testId', 'name'],
      key: 'test'
    },
    {
      title: 'Loại',
      dataIndex: ['testId', 'category'],
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'Bác sĩ chỉ định',
      key: 'doctor',
      render: (record) =>
        `${record.doctorId?.personalInfo?.firstName} ${record.doctorId?.personalInfo?.lastName}`
    },
    {
      title: 'Ngày chỉ định',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.orderDate).unix() - moment(b.orderDate).unix()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Chờ xử lý', value: 'PENDING' },
        { text: 'Đang xét nghiệm', value: 'IN_PROGRESS' },
        { text: 'Hoàn thành', value: 'COMPLETED' }
      ],
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          {record.status === 'PENDING' && (
            <Button
              size="small"
              type="primary"
              onClick={() => updateOrderStatus(record._id, 'IN_PROGRESS')}
            >
              Bắt đầu
            </Button>
          )}
          {record.status === 'IN_PROGRESS' && (
            <Button
              size="small"
              type="primary"
              onClick={() => navigate(`/admin/laboratory/${record._id}/results`)}
            >
              Nhập KQ
            </Button>
          )}
          {record.status === 'COMPLETED' && (
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => navigate(`/admin/laboratory/${record._id}`)}
            >
              Xem KQ
            </Button>
          )}
        </Space>
      )
    }
  ];

  const pendingOrders = labOrders.filter(o => o.status === 'PENDING');
  const inProgressOrders = labOrders.filter(o => o.status === 'IN_PROGRESS');
  const completedOrders = labOrders.filter(o => o.status === 'COMPLETED');

  const tabItems = [
    {
      key: 'all',
      label: 'Tất cả',
      children: (
        <Table
          columns={columns}
          dataSource={labOrders}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phiếu`
          }}
        />
      )
    },
    {
      key: 'pending',
      label: (
        <Badge count={stats.pending} offset={[10, 0]}>
          <span>Chờ xử lý</span>
        </Badge>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={pendingOrders}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1200 }}
          pagination={{
            showTotal: (total) => `${total} phiếu chờ xử lý`
          }}
        />
      )
    },
    {
      key: 'in-progress',
      label: (
        <Badge count={stats.inProgress} offset={[10, 0]}>
          <span>Đang xét nghiệm</span>
        </Badge>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={inProgressOrders}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1200 }}
          pagination={{
            showTotal: (total) => `${total} phiếu đang xử lý`
          }}
        />
      )
    },
    {
      key: 'completed',
      label: 'Đã hoàn thành',
      children: (
        <Table
          columns={columns}
          dataSource={completedOrders}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1200 }}
          pagination={{
            showTotal: (total) => `${total} phiếu đã hoàn thành`
          }}
        />
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý xét nghiệm
          </Title>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Hôm nay"
                value={stats.today}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Chờ xử lý"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Đang xét nghiệm"
                value={stats.inProgress}
                prefix={<SyncOutlined spin />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Hoàn thành"
                value={stats.completed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default LabDashboard;
