// 🔬 Laboratory Orders List
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExperimentOutlined,
    EyeOutlined,
    PlusOutlined,
    SearchOutlined,
    SyncOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Input,
    message,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import laboratoryAPI from '../../services/api/laboratoryAPI';
import './Laboratory.css';

const { Search } = Input;
const { Option } = Select;

const LabOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await laboratoryAPI.getLabOrders({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        status: filters.status,
      });
      setOrders(response.data.orders || []);
      setPagination({ ...pagination, total: response.data.total || 0 });
    } catch (error) {
      message.error('Không thể tải danh sách xét nghiệm');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await laboratoryAPI.getLabStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await laboratoryAPI.updateLabOrder(orderId, { status });
      message.success('Cập nhật trạng thái thành công');
      loadOrders();
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      collected: 'blue',
      'in-progress': 'purple',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ lấy mẫu',
      collected: 'Đã lấy mẫu',
      'in-progress': 'Đang xử lý',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      emergency: 'red',
      urgent: 'orange',
      normal: 'default',
    };
    return colors[priority] || 'default';
  };

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
      render: (number) => <strong>{number}</strong>,
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar src={record.patient?.profilePicture} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.patient?.fullName}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.patient?.patientId}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Bác sĩ chỉ định',
      dataIndex: ['doctor', 'fullName'],
      key: 'doctor',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: 'Xét nghiệm',
      dataIndex: 'tests',
      key: 'tests',
      render: (tests) => (
        <Badge count={tests?.length || 0} style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'emergency'
            ? 'Khẩn cấp'
            : priority === 'urgent'
            ? 'Ưu tiên'
            : 'Thường'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/lab/orders/${record._id}`)}
          >
            Chi tiết
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleUpdateStatus(record._id, 'collected')}
            >
              Lấy mẫu
            </Button>
          )}
          {record.status === 'collected' && (
            <Button
              type="link"
              size="small"
              onClick={() => navigate(`/lab/orders/${record._id}/result`)}
            >
              Nhập KQ
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container lab-order-list-container">
      <PageHeader
        title="Quản lý xét nghiệm"
        subtitle="Danh sách phiếu xét nghiệm"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/lab/orders/create')}
          >
            Tạo phiếu XN mới
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng phiếu XN"
              value={stats.total || 0}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Chờ lấy mẫu"
              value={stats.pending || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={stats.inProgress || 0}
              prefix={<SyncOutlined spin />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={stats.completed || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="filter-section">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Search
              placeholder="Tìm theo bệnh nhân, mã phiếu..."
              allowClear
              onSearch={(value) => setFilters({ ...filters, search: value })}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="pending">Chờ lấy mẫu</Option>
              <Option value="collected">Đã lấy mẫu</Option>
              <Option value="in-progress">Đang xử lý</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} phiếu xét nghiệm`,
          }}
          onChange={(newPagination) => setPagination(newPagination)}
        />
      </Card>
    </div>
  );
};

export default LabOrderList;
