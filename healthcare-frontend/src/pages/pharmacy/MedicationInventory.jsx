// 💊 Medication Inventory Management
import {
    ExclamationCircleOutlined,
    EyeOutlined,
    MedicineBoxOutlined,
    PlusOutlined,
    SearchOutlined,
    WarningOutlined
} from '@ant-design/icons';
import {
    Alert,
    Badge,
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
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import medicationAPI from '../../services/api/medicationAPI';
import './Pharmacy.css';

const { Search } = Input;
const { Option } = Select;

const MedicationInventory = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [restockModal, setRestockModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    loadMedications();
    loadStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadMedications = async () => {
    try {
      setLoading(true);
      // Use new inventory endpoint if available, fallback to regular getMedications
      const response = await medicationAPI.getMedicationInventory({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        category: filters.category,
        status: 'ACTIVE'
      });
      setMedications(response.data.medications || []);
      setPagination({ ...pagination, total: response.data.total || 0 });
    } catch (error) {
      message.error('Không thể tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await medicationAPI.getInventoryStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleRestock = (medication) => {
    setSelectedMedication(medication);
    form.setFieldsValue({
      quantity: 0,
      batchNumber: '',
      expiryDate: null,
    });
    setRestockModal(true);
  };

  const handleRestockSubmit = async (values) => {
    try {
      await medicationAPI.restockMedication(selectedMedication._id, values);
      message.success('Nhập kho thành công');
      setRestockModal(false);
      loadMedications();
      loadStats();
    } catch (error) {
      message.error('Nhập kho thất bại');
    }
  };

  const getStockStatus = (medication) => {
    const { stockQuantity, minStockLevel, maxStockLevel } = medication;
    if (stockQuantity === 0) return { status: 'out', text: 'Hết hàng', color: 'red' };
    if (stockQuantity < minStockLevel)
      return { status: 'low', text: 'Sắp hết', color: 'orange' };
    if (stockQuantity > maxStockLevel)
      return { status: 'overstock', text: 'Tồn kho nhiều', color: 'purple' };
    return { status: 'normal', text: 'Đủ hàng', color: 'green' };
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const daysUntilExpiry = moment(expiryDate).diff(moment(), 'days');
    if (daysUntilExpiry < 0) return { text: 'Đã hết hạn', color: 'red' };
    if (daysUntilExpiry < 30) return { text: 'Sắp hết hạn', color: 'orange' };
    return null;
  };

  const columns = [
    {
      title: 'Mã thuốc',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code) => <strong>{code}</strong>,
    },
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.manufacturer}</div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag>{category}</Tag>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      sorter: (a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0),
      render: (quantity, record) => {
        const status = getStockStatus(record);
        return (
          <Space>
            <Badge
              count={quantity}
              showZero
              style={{
                backgroundColor:
                  status.status === 'out'
                    ? '#ff4d4f'
                    : status.status === 'low'
                    ? '#faad14'
                    : '#52c41a',
              }}
            />
            <span>{record.unit}</span>
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái kho',
      key: 'stockStatus',
      render: (_, record) => {
        const status = getStockStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => {
        if (!date) return <span style={{ color: '#8c8c8c' }}>N/A</span>;
        const expiryStatus = getExpiryStatus(date);
        return (
          <div>
            <div>{moment(date).format('DD/MM/YYYY')}</div>
            {expiryStatus && (
              <Tag color={expiryStatus.color} style={{ marginTop: 4 }}>
                {expiryStatus.text}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <span style={{ color: '#1890ff', fontWeight: 600 }}>
          {price?.toLocaleString('vi-VN')} VND
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/pharmacy/medications/${record._id}`)}
          >
            Chi tiết
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleRestock(record)}
          >
            Nhập kho
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container medication-inventory-container">
      <PageHeader
        title="Quản lý kho thuốc"
        subtitle="Tồn kho và nhập xuất thuốc"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/pharmacy/medications/create')}
          >
            Thêm thuốc mới
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng loại thuốc"
              value={stats.totalMedications || 0}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Hết hàng"
              value={stats.outOfStock || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Sắp hết"
              value={stats.lowStock || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Sắp hết hạn"
              value={stats.expiringMedications || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {(stats.outOfStock > 0 || stats.expiringMedications > 0) && (
        <Alert
          message="Cảnh báo kho thuốc"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {stats.outOfStock > 0 && <li>Có {stats.outOfStock} loại thuốc đã hết hàng</li>}
              {stats.lowStock > 0 && <li>Có {stats.lowStock} loại thuốc sắp hết hàng</li>}
              {stats.expiringMedications > 0 && (
                <li>Có {stats.expiringMedications} loại thuốc sắp hết hạn</li>
              )}
            </ul>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Card className="filter-section">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Search
              placeholder="Tìm theo tên thuốc, mã thuốc..."
              allowClear
              onSearch={(value) => setFilters({ ...filters, search: value })}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Danh mục"
              allowClear
              onChange={(value) => setFilters({ ...filters, category: value || '' })}
            >
              <Option value="Antibiotic">Kháng sinh</Option>
              <Option value="Painkiller">Thuốc giảm đau</Option>
              <Option value="Vitamin">Vitamin</Option>
              <Option value="Supplement">Thực phẩm chức năng</Option>
              <Option value="Other">Khác</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={medications}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} loại thuốc`,
          }}
          onChange={(newPagination) => setPagination(newPagination)}
        />
      </Card>

      {/* Restock Modal */}
      <Modal
        title={`Nhập kho: ${selectedMedication?.name}`}
        open={restockModal}
        onCancel={() => setRestockModal(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleRestockSubmit}>
          <Form.Item
            name="quantity"
            label="Số lượng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              placeholder="Số lượng"
              addonAfter={selectedMedication?.unit}
            />
          </Form.Item>

          <Form.Item
            name="batchNumber"
            label="Số lô"
            rules={[{ required: true, message: 'Vui lòng nhập số lô' }]}
          >
            <Input placeholder="Nhập số lô" />
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label="Hạn sử dụng"
            rules={[{ required: true, message: 'Vui lòng chọn hạn sử dụng' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item name="supplier" label="Nhà cung cấp">
            <Input placeholder="Tên nhà cung cấp" />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú về lô hàng..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setRestockModal(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Nhập kho
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicationInventory;
