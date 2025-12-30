// src/pages/admin/medications/MedicationInventory.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import medicationInventoryAPI from '@/services/api/medicationInventoryAPI';
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FileExcelOutlined,
    PlusOutlined, SearchOutlined,
    SwapOutlined,
    WarningOutlined
} from '@ant-design/icons';
import {
    Badge,
    Button,
    Card,
    Col,
    Drawer, Form,
    Input,
    InputNumber,
    message,
    Popconfirm,
    Row,
    Select,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Tooltip
} from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MedicationInventory = () => {
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stats, setStats] = useState({});
  const [stockDrawerVisible, setStockDrawerVisible] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [form] = Form.useForm();

  const categories = [
    { label: 'Kháng sinh', value: 'antibiotic' },
    { label: 'Giảm đau', value: 'painkiller' },
    { label: 'Chống viêm', value: 'antiinflammatory' },
    { label: 'Vitamin', value: 'vitamin' },
    { label: 'Thần kinh', value: 'neurological' },
    { label: 'Tim mạch', value: 'cardiovascular' },
    { label: 'Tiêu hóa', value: 'digestive' },
    { label: 'Khác', value: 'other' },
  ];

  const units = [
    { label: 'Viên', value: 'tablet' },
    { label: 'Chai', value: 'bottle' },
    { label: 'Vial', value: 'vial' },
    { label: 'Lọ', value: 'jar' },
    { label: 'Hộp', value: 'box' },
  ];

  // Load medications
  const loadMedications = async () => {
    try {
      setLoading(true);
      const params = {
        page: pageNumber,
        limit: pageSize,
      };

      if (searchText) params.search = searchText;
      if (selectedCategory) params.category = selectedCategory;

      const res = await medicationInventoryAPI.getMedications(params);
      const medList = Array.isArray(res.data.data) ? res.data.data : [];

      setMedications(medList);
      setTotal(res.data.pagination?.total || 0);

      // Calculate stats from medications
      const lowStockCount = medList.filter(m => m.quantity <= (m.minimumStock || 10)).length;
      const outOfStockCount = medList.filter(m => m.quantity === 0).length;
      const totalValue = medList.reduce((sum, m) => sum + ((m.quantity || 0) * (m.price || 0)), 0);
      
      setStats({
        totalMedications: res.data.pagination?.total || medList.length,
        lowStockCount,
        outOfStockCount,
        totalInventoryValue: totalValue
      });
    } catch (error) {
      console.error('Error loading medications:', error);
      message.error('Lỗi khi tải danh sách dược liệu');
      setStats({
        totalMedications: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalInventoryValue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedications();
  }, [pageNumber, pageSize, searchText, selectedCategory]);

  const handleDelete = async (medicationId) => {
    try {
      await medicationInventoryAPI.deleteMedication(medicationId);
      message.success('Xóa dược liệu thành công');
      loadMedications();
    } catch (error) {
      message.error('Lỗi khi xóa dược liệu');
    }
  };

  const handleUpdateStock = async (values) => {
    try {
      await medicationInventoryAPI.updateStock(selectedMedication._id, values.quantity, values.type);
      message.success('Cập nhật kho thành công');
      setStockDrawerVisible(false);
      form.resetFields();
      loadMedications();
    } catch (error) {
      message.error('Lỗi khi cập nhật kho');
    }
  };

  const handleExportReport = async () => {
    try {
      const blob = await medicationInventoryAPI.exportInventoryReport('pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medication-inventory-${new Date().getTime()}.pdf`;
      a.click();
      message.success('Tải báo cáo thành công');
    } catch (error) {
      message.error('Lỗi khi tải báo cáo');
    }
  };

  const getStockStatus = (quantity, minQuantity) => {
    if (quantity <= 0) return { status: 'error', label: 'Hết hàng' };
    if (quantity <= minQuantity) return { status: 'warning', label: 'Cảnh báo' };
    return { status: 'success', label: 'Bình thường' };
  };

  const columns = [
    {
      title: 'Tên dược liệu',
      key: 'name',
      width: 200,
      render: (_, record) => (
        <div style={{ fontWeight: 500, color: '#262626' }}>
          {record.name || 'N/A'}
        </div>
      ),
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Mã dược liệu',
      key: 'code',
      width: 120,
      render: (_, record) => (
        <span style={{ fontFamily: 'monospace', color: '#1890ff' }}>
          {record.code || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Phân loại',
      key: 'category',
      width: 130,
      render: (_, record) => {
        const cat = categories.find(c => c.value === record.category);
        return <Tag color="blue">{cat?.label || record.category}</Tag>;
      },
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const status = getStockStatus(record.quantity, record.minimumStock);
        return (
          <Tooltip title={`Tối thiểu: ${record.minimumStock}`}>
            <Badge
              status={status.status}
              text={
                <span style={{ fontWeight: 'bold' }}>
                  {record.quantity} {record.unit}
                </span>
              }
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Giá/Đơn vị',
      key: 'price',
      width: 110,
      align: 'right',
      render: (_, record) => (
        <span>{Number(record.price || 0).toLocaleString('vi-VN')} ₫</span>
      ),
    },
    {
      title: 'Hạn dùng',
      key: 'expiryDate',
      width: 120,
      render: (_, record) => {
        if (!record.expiryDate) return '-';
        const isExpired = dayjs(record.expiryDate).isBefore(dayjs());
        return (
          <span style={{ color: isExpired ? '#f5222d' : '#52c41a' }}>
            {dayjs(record.expiryDate).format('DD/MM/YYYY')}
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const status = getStockStatus(record.quantity, record.minimumStock);
        return (
          <Tag color={status.status === 'error' ? 'red' : status.status === 'warning' ? 'orange' : 'green'}>
            {status.label}
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <Space wrap size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/medications/${record._id}`)}
            >
              Chi tiết
            </Button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/medications/${record._id}/edit`)}
            >
              Sửa
            </Button>
          </Tooltip>
          <Tooltip title="Cập nhật kho">
            <Button
              size="small"
              icon={<SwapOutlined />}
              onClick={() => {
                setSelectedMedication(record);
                setStockDrawerVisible(true);
              }}
            >
              Kho
            </Button>
          </Tooltip>
          <Popconfirm
            title="Xóa dược liệu?"
            description="Bạn chắc chắn muốn xóa dược liệu này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ padding: '24px' }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>💊 Quản lý kho dược liệu</h1>
          <Space>
            <Button
              icon={<FileExcelOutlined />}
              onClick={handleExportReport}
            >
              Xuất báo cáo
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/medications/create')}
            >
              Thêm dược liệu
            </Button>
          </Space>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng loại dược liệu"
                value={total}
                prefix={<span>💊</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Cảnh báo tồn kho thấp"
                value={medications.filter(m => m.quantity <= m.minimumStock).length}
                valueStyle={{ color: '#faad14' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Hết hàng"
                value={medications.filter(m => m.quantity <= 0).length}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng giá trị kho"
                value={medications.reduce((sum, m) => sum + (m.quantity * m.price), 0)}
                formatter={(value) => `${Number(value).toLocaleString('vi-VN')} ₫`}
                valueStyle={{ fontSize: '14px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm dược liệu..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Chọn phân loại"
                value={selectedCategory || undefined}
                onChange={(value) => setSelectedCategory(value)}
                options={categories}
                allowClear
              />
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card style={{ borderRadius: '12px', backgroundColor: '#fff' }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              flexDirection: 'column',
              gap: 16
            }}>
              <Spin size="large" />
              <p style={{ color: '#8c8c8c' }}>Đang tải danh sách dược liệu...</p>
            </div>
          ) : medications.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              flexDirection: 'column',
              gap: 16
            }}>
              <div style={{ fontSize: 48 }}>💊</div>
              <h3 style={{ color: '#262626' }}>Chưa có dược liệu nào</h3>
              <p style={{ color: '#8c8c8c', marginBottom: 16 }}>Hãy thêm dược liệu mới để bắt đầu</p>
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/admin/medications/create')}
              >
                Thêm dược liệu
              </Button>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={medications}
              rowKey="_id"
              pagination={{
                current: pageNumber,
                pageSize: pageSize,
                total: total,
                onChange: (page) => setPageNumber(page),
                showSizeChanger: true,
                pageSizeOptions: ['15', '30', '50'],
                showTotal: (total) => `Tổng ${total} dược liệu`,
              }}
              scroll={{ x: 1400 }}
              size="middle"
            />
          )}
        </Card>

        {/* Stock Update Drawer */}
        <Drawer
          title={`Cập nhật kho: ${selectedMedication?.name}`}
          placement="right"
          onClose={() => {
            setStockDrawerVisible(false);
            form.resetFields();
          }}
          open={stockDrawerVisible}
          width={400}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateStock}
          >
            <Form.Item
              name="type"
              label="Loại cập nhật"
              rules={[{ required: true, message: 'Vui lòng chọn loại cập nhật' }]}
            >
              <Select
                options={[
                  { label: 'Nhập kho', value: 'add' },
                  { label: 'Xuất kho', value: 'remove' },
                  { label: 'Điều chỉnh', value: 'adjust' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
            >
              <InputNumber min={0} placeholder="Nhập số lượng" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Cập nhật kho
              </Button>
            </Form.Item>

            {selectedMedication && (
              <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <p><strong>Tồn kho hiện tại:</strong> {selectedMedication.quantity} {selectedMedication.unit}</p>
                <p><strong>Tồn kho tối thiểu:</strong> {selectedMedication.minimumStock}</p>
                <p><strong>Hạn dùng:</strong> {dayjs(selectedMedication.expiryDate).format('DD/MM/YYYY')}</p>
              </div>
            )}
          </Form>
        </Drawer>
      </motion.div>
    </AdminLayout>
  );
};

export default MedicationInventory;
