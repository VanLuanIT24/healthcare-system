// 📋 Audit Logs - System activity tracking
import {
    DownloadOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Input,
    message,
    Row,
    Select,
    Space,
    Table,
    Tag,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import adminAPI from '../../services/api/adminAPI';
import './Admin.css';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    module: '',
    dateRange: null,
  });

  useEffect(() => {
    loadLogs();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAuditLogs({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        action: filters.action,
        module: filters.module,
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString(),
      });
      setLogs(response.data.logs || []);
      setPagination({ ...pagination, total: response.data.total || 0 });
    } catch (error) {
      message.error('Không thể tải nhật ký hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await adminAPI.exportAuditLogs({
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString(),
      });
      message.success('Xuất nhật ký thành công');
    } catch (error) {
      message.error('Xuất nhật ký thất bại');
    }
  };

  const getActionColor = (action) => {
    const colors = {
      create: 'green',
      update: 'blue',
      delete: 'red',
      view: 'default',
      login: 'cyan',
      logout: 'default',
      export: 'purple',
    };
    return colors[action] || 'default';
  };

  const getActionText = (action) => {
    const texts = {
      create: 'Tạo mới',
      update: 'Cập nhật',
      delete: 'Xóa',
      view: 'Xem',
      login: 'Đăng nhập',
      logout: 'Đăng xuất',
      export: 'Xuất dữ liệu',
    };
    return texts[action] || action;
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (time) => moment(time).format('DD/MM/YYYY HH:mm:ss'),
      sorter: (a, b) => moment(a.timestamp).unix() - moment(b.timestamp).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Người dùng',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar src={record.user?.profilePicture} icon={<UserOutlined />} size="small" />
          <div>
            <div style={{ fontWeight: 500 }}>{record.user?.fullName}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.user?.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action) => (
        <Tag color={getActionColor(action)}>{getActionText(action)}</Tag>
      ),
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (module) => <Tag>{module}</Tag>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
    },
    {
      title: 'User Agent',
      dataIndex: 'userAgent',
      key: 'userAgent',
      ellipsis: true,
      width: 200,
      render: (agent) => (
        <span style={{ fontSize: 12, color: '#8c8c8c' }}>{agent}</span>
      ),
    },
  ];

  return (
    <div className="page-container audit-logs-container">
      <PageHeader
        title="Nhật ký hoạt động"
        subtitle="Theo dõi tất cả hoạt động trên hệ thống"
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Xuất nhật ký
          </Button>
        }
      />

      <Card className="filter-section">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm theo người dùng, mô tả..."
              allowClear
              onSearch={(value) => setFilters({ ...filters, search: value })}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Hành động"
              allowClear
              onChange={(value) => setFilters({ ...filters, action: value || '' })}
            >
              <Option value="create">Tạo mới</Option>
              <Option value="update">Cập nhật</Option>
              <Option value="delete">Xóa</Option>
              <Option value="view">Xem</Option>
              <Option value="login">Đăng nhập</Option>
              <Option value="logout">Đăng xuất</Option>
              <Option value="export">Xuất dữ liệu</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Module"
              allowClear
              onChange={(value) => setFilters({ ...filters, module: value || '' })}
            >
              <Option value="User">Người dùng</Option>
              <Option value="Patient">Bệnh nhân</Option>
              <Option value="Appointment">Lịch hẹn</Option>
              <Option value="Prescription">Đơn thuốc</Option>
              <Option value="Laboratory">Xét nghiệm</Option>
              <Option value="Billing">Thanh toán</Option>
              <Option value="Medical Record">Hồ sơ BA</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
          </Col>
        </Row>
      </Card>

      <Card className="audit-log-table">
        <Table
          columns={columns}
          dataSource={logs}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} bản ghi`,
          }}
          onChange={(newPagination) => setPagination(newPagination)}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default AuditLogs;
