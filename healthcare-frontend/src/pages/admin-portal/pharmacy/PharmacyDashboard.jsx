import {
    AlertOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    MedicineBoxOutlined,
    PlusOutlined,
    SearchOutlined
} from '@ant-design/icons';
import {
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
    Tabs,
    Tag,
    Typography
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyApi } from '../../../services/adminApi';

const { Title, Text } = Typography;
const { Option } = Select;

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState([]);
  const [stats, setStats] = useState({
    totalMedications: 0,
    lowStock: 0,
    expiringSoon: 0,
    outOfStock: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    category: null,
    status: null
  });

  useEffect(() => {
    fetchMedications();
    fetchStats();
  }, [filters]);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await pharmacyApi.getMedications({
        page: 1,
        limit: 100,
        search: filters.search,
        category: filters.category,
        status: filters.status
      });
      
      setMedications(response.data || []);
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn('⚠️ [PHARMACY] Medications API endpoint not implemented yet');
        setMedications(getMockMedications());
      } else {
        console.error('Fetch medications error:', error);
        message.error(error.response?.data?.message || 'Không thể tải danh sách thuốc');
        setMedications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await pharmacyApi.getStats();
      setStats({
        totalMedications: response.data?.overview?.totalMedications || 0,
        lowStock: response.data?.alerts?.lowStock || 0,
        expiringSoon: response.data?.overview?.recentlyAdded || 0,
        outOfStock: response.data?.alerts?.outOfStock || 0
      });
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn('⚠️ [PHARMACY] Medications stats API endpoint not implemented yet');
        setStats({
          totalMedications: getMockMedications().length,
          lowStock: 1,
          expiringSoon: 1,
          outOfStock: 1
        });
      } else {
        console.error('Fetch stats error:', error);
        setStats({
          totalMedications: 0,
          lowStock: 0,
          expiringSoon: 0,
          outOfStock: 0
        });
      }
    }
  };

  // Mock data for development
  const getMockMedications = () => [
    {
      _id: '1',
      medicationCode: 'MED001',
      name: 'Paracetamol 500mg',
      category: 'Hạ sốt - Giảm đau',
      manufacturer: 'DHG Pharma',
      quantity: 500,
      unit: 'Viên',
      price: 2000,
      expiryDate: '2026-12-31',
      location: 'Kệ A1',
      status: 'Còn hàng'
    },
    {
      _id: '2',
      medicationCode: 'MED002',
      name: 'Amoxicillin 500mg',
      category: 'Kháng sinh',
      manufacturer: 'Imexpharm',
      quantity: 8,
      unit: 'Viên',
      price: 5000,
      expiryDate: '2025-06-30',
      location: 'Kệ B2',
      status: 'Sắp hết'
    },
    {
      _id: '3',
      medicationCode: 'MED003',
      name: 'Vitamin C 1000mg',
      category: 'Vitamin & Khoáng chất',
      manufacturer: 'Traphaco',
      quantity: 0,
      unit: 'Viên',
      price: 3000,
      expiryDate: '2025-03-15',
      location: 'Kệ C3',
      status: 'Hết hàng'
    },
    {
      _id: '4',
      medicationCode: 'MED004',
      name: 'Omeprazole 20mg',
      category: 'Tiêu hóa',
      manufacturer: 'Stada Vietnam',
      quantity: 150,
      unit: 'Viên',
      price: 4500,
      expiryDate: '2026-09-20',
      location: 'Kệ A2',
      status: 'Còn hàng'
    }
  ];

  const getMockStats = () => ({
    totalMedications: 120,
    lowStock: 15,
    expiringSoon: 8,
    outOfStock: 3
  });

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { status: 'error', text: 'Hết hàng' };
    if (quantity < 10) return { status: 'warning', text: 'Sắp hết' };
    if (quantity < 50) return { status: 'processing', text: 'Còn ít' };
    return { status: 'success', text: 'Đủ hàng' };
  };

  const columns = [
    {
      title: 'Mã thuốc',
      dataIndex: 'medicationCode',
      key: 'code',
      width: 120,
      render: (code) => <Text strong style={{ color: '#1890ff' }}>{code}</Text>
    },
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div><Text strong>{name}</Text></div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.genericName}</Text>
        </div>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Kháng sinh', value: 'ANTIBIOTIC' },
        { text: 'Giảm đau', value: 'ANALGESIC' },
        { text: 'Vitamin', value: 'VITAMIN' },
        { text: 'Kháng viêm', value: 'ANTI_INFLAMMATORY' },
        { text: 'Tim mạch', value: 'CARDIOVASCULAR' },
        { text: 'Tiêu hóa', value: 'DIGESTIVE' }
      ],
      render: (category) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'Quy cách',
      key: 'specification',
      render: (record) => (
        <div>
          <div>{record.dosage}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.form}</Text>
        </div>
      )
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity) => {
        const status = getStockStatus(quantity);
        return (
          <Badge status={status.status} text={`${quantity} ${status.text}`} />
        );
      }
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit'
    },
    {
      title: 'Giá',
      dataIndex: 'unitPrice',
      key: 'price',
      sorter: (a, b) => a.unitPrice - b.unitPrice,
      render: (price) => new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ'
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expirationDate',
      key: 'expiration',
      sorter: (a, b) => moment(a.expirationDate).unix() - moment(b.expirationDate).unix(),
      render: (date) => {
        const daysUntilExpiry = moment(date).diff(moment(), 'days');
        const isExpiringSoon = daysUntilExpiry < 90;
        return (
          <Text type={isExpiringSoon ? 'danger' : 'secondary'}>
            {moment(date).format('DD/MM/YYYY')}
            {isExpiringSoon && <ExclamationCircleOutlined style={{ marginLeft: 8, color: '#ff4d4f' }} />}
          </Text>
        );
      }
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier'
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            size="small"
            onClick={() => navigate(`/admin/pharmacy/medications/${record._id}`)}
          >
            Chi tiết
          </Button>
          <Button 
            size="small" 
            type="primary"
            onClick={() => navigate(`/admin/pharmacy/medications/edit/${record._id}`)}
          >
            Sửa
          </Button>
        </Space>
      )
    }
  ];

  // Low stock items
  const lowStockItems = medications.filter(m => m.quantity < 50 && m.quantity > 0);
  
  // Expiring soon items
  const expiringSoonItems = medications.filter(m => {
    const daysUntilExpiry = moment(m.expirationDate).diff(moment(), 'days');
    return daysUntilExpiry < 90 && daysUntilExpiry > 0;
  });

  // Out of stock items
  const outOfStockItems = medications.filter(m => m.quantity === 0);

  const tabItems = [
    {
      key: 'all',
      label: 'Tất cả',
      children: (
        <Table
          columns={columns}
          dataSource={medications}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1400 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} thuốc`
          }}
        />
      )
    },
    {
      key: 'low-stock',
      label: (
        <Badge count={stats.lowStock} offset={[10, 0]}>
          <span>Sắp hết hàng</span>
        </Badge>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={lowStockItems}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1400 }}
          pagination={{
            showTotal: (total) => `${total} thuốc sắp hết`
          }}
        />
      )
    },
    {
      key: 'expiring',
      label: (
        <Badge count={stats.expiringSoon} offset={[10, 0]}>
          <span>Sắp hết hạn</span>
        </Badge>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={expiringSoonItems}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1400 }}
          pagination={{
            showTotal: (total) => `${total} thuốc sắp hết hạn`
          }}
        />
      )
    },
    {
      key: 'out-of-stock',
      label: (
        <Badge count={stats.outOfStock} offset={[10, 0]}>
          <span>Hết hàng</span>
        </Badge>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={outOfStockItems}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1400 }}
          pagination={{
            showTotal: (total) => `${total} thuốc hết hàng`
          }}
        />
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Quản lý nhà thuốc
              </Title>
            </Col>
            <Col>
              <Space>
                <Button onClick={() => navigate('/admin/pharmacy/prescriptions')}>
                  Đơn thuốc chờ cấp
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/admin/pharmacy/medications/create')}
                >
                  Thêm thuốc mới
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Tổng số thuốc"
                value={stats.totalMedications}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Sắp hết hàng"
                value={stats.lowStock}
                prefix={<AlertOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Sắp hết hạn"
                value={stats.expiringSoon}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Hết hàng"
                value={stats.outOfStock}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên, mã thuốc..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Lọc theo danh mục"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilters({ ...filters, category: value })}
            >
              <Option value="ANTIBIOTIC">Kháng sinh</Option>
              <Option value="ANALGESIC">Giảm đau</Option>
              <Option value="VITAMIN">Vitamin</Option>
              <Option value="ANTI_INFLAMMATORY">Kháng viêm</Option>
              <Option value="CARDIOVASCULAR">Tim mạch</Option>
              <Option value="DIGESTIVE">Tiêu hóa</Option>
            </Select>
          </Col>
        </Row>

        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default PharmacyDashboard;
