// 💰 Billing List Page
import {
    DollarOutlined,
    EyeOutlined,
    FileTextOutlined,
    PlusOutlined,
    PrinterOutlined,
    SearchOutlined,
    UndoOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
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

const BillingList = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: null,
  });
  const [refundModal, setRefundModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [form] = Form.useForm();
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
      console.error('Failed to load revenue stats');
    }
  };

  const handleRefund = (bill) => {
    setSelectedBill(bill);
    form.setFieldsValue({ amount: bill.totalAmount, reason: '' });
    setRefundModal(true);
  };

  const handleRefundSubmit = async (values) => {
    try {
      // Get the payment ID from bill
      const paymentId = selectedBill.payments?.[0]?._id;
      if (!paymentId) {
        message.error('Không tìm thấy thông tin thanh toán');
        return;
      }

      await billingAPI.refundPayment(paymentId, {
        amount: values.amount,
        reason: values.reason,
      });
      message.success('Hoàn tiền thành công');
      setRefundModal(false);
      loadBills();
      loadStats();
    } catch (error) {
      message.error('Hoàn tiền thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      partial: 'blue',
      paid: 'green',
      overdue: 'red',
      void: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chưa thanh toán',
      partial: 'Thanh toán một phần',
      paid: 'Đã thanh toán',
      overdue: 'Quá hạn',
      void: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Số hóa đơn',
      dataIndex: 'billNumber',
      key: 'billNumber',
      width: 120,
      render: (billNumber) => <strong>{billNumber}</strong>,
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.patientName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.patientId}</div>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <span style={{ color: '#1890ff', fontWeight: 600 }}>
          {amount?.toLocaleString('vi-VN')} VND
        </span>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
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
      title: 'Còn nợ',
      key: 'remainingAmount',
      render: (_, record) => {
        const remaining = record.totalAmount - record.paidAmount;
        return (
          <span style={{ color: remaining > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>
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
      width: 180,
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
          {record.status !== 'void' && record.paidAmount > 0 && (
            <Button
              type="link"
              size="small"
              icon={<UndoOutlined />}
              onClick={() => handleRefund(record)}
            >
              Hoàn tiền
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => navigate(`/billing/${record._id}/print`)}
          >
            In
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container billing-list-container">
      <PageHeader
        title="Quản lý hóa đơn"
        subtitle="Danh sách hóa đơn và thanh toán"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/billing/create')}
            >
              Tạo hóa đơn mới
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue || 0}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: '#1890ff', fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã thanh toán"
              value={stats.paidAmount || 0}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: '#52c41a', fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Còn phải thu"
              value={stats.pendingAmount || 0}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: '#ff4d4f', fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng hóa đơn"
              value={stats.totalBills || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14', fontSize: 16 }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="filter-section">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm theo số hóa đơn, tên bệnh nhân..."
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
              <Option value="pending">Chưa thanh toán</Option>
              <Option value="partial">Thanh toán một phần</Option>
              <Option value="paid">Đã thanh toán</Option>
              <Option value="overdue">Quá hạn</Option>
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
        />
      </Card>

      {/* Refund Modal */}
      <Modal
        title={`Hoàn tiền cho hóa đơn ${selectedBill?.billNumber}`}
        open={refundModal}
        onCancel={() => setRefundModal(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleRefundSubmit}>
          <Form.Item
            name="amount"
            label="Số tiền hoàn"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={selectedBill?.paidAmount}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do hoàn tiền"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập lý do hoàn tiền..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setRefundModal(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Xác nhận hoàn tiền
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BillingList;
