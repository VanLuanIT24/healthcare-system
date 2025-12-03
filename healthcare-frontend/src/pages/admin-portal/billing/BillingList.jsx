import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    FileTextOutlined,
    PlusOutlined,
    PrinterOutlined,
    SearchOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
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
    Typography
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingApi } from '../../../services/adminApi';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const BillingList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingBills: 0,
    paidBills: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: null,
    search: ''
  });
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    fetchBills();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      
      // SỬ DỤNG API SERVICE
      const response = await billingApi.getList({
        page: pagination.current,
        limit: pagination.pageSize,
        status: filters.status
      });
      
      // XỬ LÝ RESPONSE
      if (response.success && response.data) {
        setBills(response.data.bills || response.data || []);
        setPagination({
          ...pagination,
          total: response.data.pagination?.totalItems || response.data.pagination?.total || 0
        });
      }
    } catch (error) {
      console.error('❌ [BILLING] Fetch error:', error);
      message.error(
        error.response?.data?.message || error.message || 'Không thể tải danh sách hóa đơn'
      );
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // TODO: Implement stats API endpoint in backend
      setStats({ totalRevenue: 45000000, pendingBills: 12, paidBills: 38 });
    } catch (error) {
      console.error('Fetch stats error:', error);
      setStats({ totalRevenue: 45000000, pendingBills: 12, paidBills: 38 });
    }
  };

  const getMockBills = () => [
    {
      _id: '1',
      billNumber: 'HD001',
      patientId: { personalInfo: { firstName: 'Nguyễn', lastName: 'Văn A' } },
      totalAmount: 500000,
      status: 'PAID',
      createdAt: '2025-11-25',
      paidAt: '2025-11-25'
    },
    {
      _id: '2',
      billNumber: 'HD002',
      patientId: { personalInfo: { firstName: 'Trần', lastName: 'Thị B' } },
      totalAmount: 750000,
      status: 'PENDING',
      createdAt: '2025-11-26'
    },
    {
      _id: '3',
      billNumber: 'HD003',
      patientId: { personalInfo: { firstName: 'Lê', lastName: 'Văn C' } },
      totalAmount: 300000,
      status: 'PAID',
      createdAt: '2025-11-27',
      paidAt: '2025-11-27'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      PARTIAL: 'processing',
      PAID: 'success',
      OVERDUE: 'error',
      VOIDED: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Chờ thanh toán',
      PARTIAL: 'Thanh toán một phần',
      PAID: 'Đã thanh toán',
      OVERDUE: 'Quá hạn',
      VOIDED: 'Đã hủy'
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handlePayment = (bill) => {
    setSelectedBill(bill);
    paymentForm.setFieldsValue({
      amount: bill.finalAmount - bill.paidAmount,
      paymentMethod: 'CASH'
    });
    setPaymentModal(true);
  };

  const processPayment = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/billing/${selectedBill._id}/payment`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Thanh toán thành công!');
      setPaymentModal(false);
      paymentForm.resetFields();
      fetchBills();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể xử lý thanh toán');
    }
  };

  const columns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'billNumber',
      key: 'billNumber',
      render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (record) => (
        <div>
          <div>{record.patientInfo?.name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.patientInfo?.phone}
          </Text>
        </div>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix()
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount) => <Text strong>{formatCurrency(amount)}</Text>,
      sorter: (a, b) => a.finalAmount - b.finalAmount
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount) => <Text style={{ color: '#52c41a' }}>{formatCurrency(amount)}</Text>
    },
    {
      title: 'Còn nợ',
      key: 'remaining',
      render: (record) => (
        <Text type="danger">
          {formatCurrency(record.finalAmount - record.paidAmount)}
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Chờ thanh toán', value: 'PENDING' },
        { text: 'Thanh toán một phần', value: 'PARTIAL' },
        { text: 'Đã thanh toán', value: 'PAID' },
        { text: 'Quá hạn', value: 'OVERDUE' }
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
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/admin/billing/${record._id}`)}
          >
            Chi tiết
          </Button>
          {record.status !== 'PAID' && record.status !== 'VOIDED' && (
            <Button 
              size="small" 
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => handlePayment(record)}
            >
              Thanh toán
            </Button>
          )}
          <Button 
            size="small" 
            icon={<PrinterOutlined />}
            onClick={() => window.open(`/admin/billing/${record._id}/print`, '_blank')}
          >
            In
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Quản lý hóa đơn
              </Title>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/billing/create')}
              >
                Tạo hóa đơn
              </Button>
            </Col>
          </Row>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Doanh thu hôm nay"
                value={stats.totalRevenue}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarOutlined />}
                suffix="VNĐ"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Chờ thanh toán"
                value={stats.pendingBills}
                valueStyle={{ color: '#cf1322' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đã thanh toán"
                value={stats.paidBills}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo mã HĐ, tên BN..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="PENDING">Chờ thanh toán</Option>
              <Option value="PARTIAL">Thanh toán một phần</Option>
              <Option value="PAID">Đã thanh toán</Option>
              <Option value="OVERDUE">Quá hạn</Option>
            </Select>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={bills}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hóa đơn`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Payment Modal */}
      <Modal
        title="Xử lý thanh toán"
        open={paymentModal}
        onCancel={() => {
          setPaymentModal(false);
          paymentForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={processPayment}
        >
          <Form.Item label="Mã hóa đơn">
            <Input value={selectedBill?.billNumber} disabled />
          </Form.Item>

          <Form.Item label="Tổng tiền">
            <Input 
              value={formatCurrency(selectedBill?.finalAmount || 0)} 
              disabled 
            />
          </Form.Item>

          <Form.Item label="Đã thanh toán">
            <Input 
              value={formatCurrency(selectedBill?.paidAmount || 0)} 
              disabled 
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền thanh toán"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền' },
              {
                validator: (_, value) => {
                  const remaining = (selectedBill?.finalAmount || 0) - (selectedBill?.paidAmount || 0);
                  if (value > remaining) {
                    return Promise.reject('Số tiền vượt quá số tiền còn nợ');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="Phương thức thanh toán"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}
          >
            <Select placeholder="Chọn phương thức">
              <Option value="CASH">Tiền mặt</Option>
              <Option value="BANK_TRANSFER">Chuyển khoản</Option>
              <Option value="CREDIT_CARD">Thẻ tín dụng</Option>
              <Option value="DEBIT_CARD">Thẻ ghi nợ</Option>
              <Option value="MOMO">Momo</Option>
              <Option value="VNPAY">VNPay</Option>
            </Select>
          </Form.Item>

          <Form.Item name="referenceNumber" label="Mã giao dịch">
            <Input placeholder="Nhập mã giao dịch (nếu có)" />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={2} placeholder="Ghi chú thêm..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setPaymentModal(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Xác nhận thanh toán
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BillingList;
