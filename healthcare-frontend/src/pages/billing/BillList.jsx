// 💰 Billing List Page
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CreditCardOutlined,
    DollarOutlined,
    EyeOutlined,
    PlusOutlined,
    PrinterOutlined,
    SearchOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Input,
    message,
    Modal,
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
import billingAPI from '../../services/api/billingAPI';
import './Billing.css';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const BillList = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadBills();
    loadStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadBills = async () => {
    try {
      setLoading(true);
      const response = await billingAPI.getBills({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        status: filters.status,
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString(),
      });
      setBills(response.data.bills || []);
      setPagination({ ...pagination, total: response.data.total || 0 });
    } catch (error) {
      message.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await billingAPI.getRevenueStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handlePayment = (billId) => {
    navigate(`/billing/${billId}/payment`);
  };

  const handlePrint = async (billId) => {
    try {
      await billingAPI.generateInvoice(billId);
      message.success('In hóa đơn thành công');
    } catch (error) {
      message.error('In hóa đơn thất bại');
    }
  };

  const handleVoid = (billId) => {
    Modal.confirm({
      title: 'Hủy hóa đơn',
      content: 'Bạn có chắc chắn muốn hủy hóa đơn này?',
      okText: 'Hủy hóa đơn',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          await billingAPI.voidBill(billId);
          message.success('Đã hủy hóa đơn');
          loadBills();
        } catch (error) {
          message.error('Hủy hóa đơn thất bại');
        }
      },
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending: 'orange',
      'partially-paid': 'blue',
      paid: 'green',
      overdue: 'red',
      void: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Nháp',
      pending: 'Chờ thanh toán',
      'partially-paid': 'Thanh toán một phần',
      paid: 'Đã thanh toán',
      overdue: 'Quá hạn',
      void: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'billNumber',
      key: 'billNumber',
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
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <strong style={{ color: '#1890ff' }}>
          {amount?.toLocaleString('vi-VN')} VND
        </strong>
      ),
      sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount) => (
        <span style={{ color: '#52c41a' }}>
          {amount?.toLocaleString('vi-VN')} VND
        </span>
      ),
    },
    {
      title: 'Còn lại',
      key: 'remaining',
      render: (_, record) => {
        const remaining = (record.totalAmount || 0) - (record.paidAmount || 0);
        return (
          <span style={{ color: remaining > 0 ? '#ff4d4f' : '#52c41a' }}>
            {remaining.toLocaleString('vi-VN')} VND
          </span>
        );
      },
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/billing/${record._id}`)}
          >
            Chi tiết
          </Button>
          {(record.status === 'pending' || record.status === 'partially-paid') && (
            <Button
              type="link"
              size="small"
              icon={<CreditCardOutlined />}
              onClick={() => handlePayment(record._id)}
            >
              Thanh toán
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(record._id)}
          >
            In
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container bill-list-container">
      <PageHeader
        title="Quản lý thanh toán"
        subtitle="Danh sách hóa đơn và thanh toán"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/billing/create')}
          >
            Tạo hóa đơn mới
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Doanh thu hôm nay"
              value={stats.todayRevenue || 0}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Chờ thanh toán"
              value={stats.pendingAmount || 0}
              prefix={<ClockCircleOutlined />}
              suffix="VND"
              valueStyle={{ color: '#faad14', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã thanh toán"
              value={stats.paidAmount || 0}
              prefix={<CheckCircleOutlined />}
              suffix="VND"
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Số HĐ chưa TT"
              value={stats.pendingBills || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="filter-section">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm theo bệnh nhân, mã HĐ..."
              allowClear
              onSearch={(value) => setFilters({ ...filters, search: value })}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="pending">Chờ thanh toán</Option>
              <Option value="partially-paid">Thanh toán một phần</Option>
              <Option value="paid">Đã thanh toán</Option>
              <Option value="overdue">Quá hạn</Option>
              <Option value="void">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} md={10}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={bills}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} hóa đơn`,
          }}
          onChange={(newPagination) => setPagination(newPagination)}
          summary={(pageData) => {
            const totalAmount = pageData.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
            const paidAmount = pageData.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);
            const remaining = totalAmount - paidAmount;

            return (
              <Table.Summary.Row style={{ background: '#fafafa' }}>
                <Table.Summary.Cell colSpan={3}>
                  <strong>Tổng trang này</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <strong style={{ color: '#1890ff' }}>
                    {totalAmount.toLocaleString('vi-VN')} VND
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <strong style={{ color: '#52c41a' }}>
                    {paidAmount.toLocaleString('vi-VN')} VND
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <strong style={{ color: remaining > 0 ? '#ff4d4f' : '#52c41a' }}>
                    {remaining.toLocaleString('vi-VN')} VND
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell colSpan={2} />
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default BillList;
