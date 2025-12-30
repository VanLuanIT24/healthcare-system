import AdminLayout from '@/components/layout/admin/AdminLayout';
import bedAPI from '@/services/api/bedAPI';
import { DeleteOutlined, EditOutlined, EyeOutlined, LogoutOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Drawer, Empty, Form, Input, message, Popconfirm, Row, Select, Skeleton, Space, Statistic, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const statusMap = {
  AVAILABLE: { color: 'green', label: 'Trống', icon: '✓' },
  OCCUPIED: { color: 'red', label: 'Đang dùng', icon: 'X' },
  CLEANING: { color: 'orange', label: 'Vệ sinh', icon: '~' },
  MAINTENANCE: { color: 'gray', label: 'Bảo trì', icon: '!' },
};

const bedTypeMap = {
  standard: 'Thường',
  vip: 'VIP',
  icu: 'ICU',
  isolation: 'Cách ly',
  intensive: 'Chuyên sâu'
};

const BedsList = () => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: null, department: null, bedType: null });
  const [statistics, setStatistics] = useState({ total: 0, available: 0, occupied: 0, occupancyRate: 0 });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const bedTypes = Object.entries(bedTypeMap).map(([key, value]) => ({ value: key, label: value }));
  const bedStatuses = Object.entries(statusMap).map(([key, value]) => ({ value: key, label: value.label }));

  const fetchBeds = async (page = 1, limit = 15) => {
    try {
      setLoading(true);
      const params = { page, limit, search: filters.search };
      if (filters.status) params.status = filters.status;
      if (filters.department) params.department = filters.department;
      if (filters.bedType) params.bedType = filters.bedType;

      const res = await bedAPI.getBeds(params);
      const bedData = res.data?.data || res.data || [];
      const bedsArray = Array.isArray(bedData) ? bedData : [];
      
      setBeds(bedsArray);
      setPagination({
        current: res.data?.currentPage || page,
        pageSize: res.data?.pageSize || limit,
        total: res.data?.total || bedsArray.length || 0,
      });

      // Calculate statistics
      const total = bedsArray.length || 0;
      const available = bedsArray.filter(b => b.status === 'AVAILABLE').length;
      const occupied = bedsArray.filter(b => b.status === 'OCCUPIED').length;
      const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;
      
      setStatistics({ total, available, occupied, occupancyRate });
    } catch (error) {
      console.error('Error fetching beds:', error);
      message.error('Lỗi tải danh sách giường');
      setBeds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeds(1, pagination.pageSize);
    // eslint-disable-next-line
  }, [filters]);

  const handleTableChange = (newPagination) => {
    fetchBeds(newPagination.current, newPagination.pageSize);
  };

  const handleAssignBed = (bed) => {
    setSelectedBed(bed);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleReleaseBed = async (bedId) => {
    try {
      if (bedAPI.releaseBed) {
        await bedAPI.releaseBed(bedId);
        message.success('Xuất viện thành công');
        fetchBeds(pagination.current, pagination.pageSize);
      } else {
        message.error('Chức năng chưa khả dụng');
      }
    } catch (error) {
      console.error('Error releasing bed:', error);
      message.error('Lỗi khi xuất viện');
    }
  };

  const handleUpdateStock = async (values) => {
    try {
      if (selectedBed && bedAPI.assignBedToPatient) {
        await bedAPI.assignBedToPatient(selectedBed._id, values.patientId, values.admissionDate?.toISOString());
        message.success('Phân giường thành công');
        setDrawerVisible(false);
        fetchBeds(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      console.error('Error updating bed:', error);
      message.error('Lỗi khi cập nhật giường');
    }
  };

  const handleDelete = async (bedId) => {
    try {
      if (bedAPI.deleteBed) {
        await bedAPI.deleteBed(bedId);
        message.success('Xóa giường thành công');
        fetchBeds(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      console.error('Error deleting bed:', error);
      message.error('Lỗi khi xóa giường');
    }
  };

  const columns = [
    {
      title: 'Mã giường',
      key: 'bedNumber',
      width: '12%',
      render: (_, record) => <strong>{record?.bedNumber}</strong>
    },
    {
      title: 'Phòng',
      key: 'room',
      width: '10%',
      render: (_, record) => <span>{record?.roomNumber || 'N/A'}</span>
    },
    {
      title: 'Loại',
      key: 'bedType',
      width: '12%',
      render: (_, record) => (
        <Tag color="blue">{bedTypeMap[record?.bedType] || 'Thường'}</Tag>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: '12%',
      render: (_, record) => {
        const status = statusMap[record?.status] || { color: 'default', label: 'Không rõ' };
        return <Tag color={status.color}>{status.label}</Tag>;
      }
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      width: '15%',
      render: (_, record) => record?.currentPatientRef?.fullName || '—'
    },
    {
      title: 'Ngày phân',
      key: 'assignedAt',
      width: '12%',
      render: (_, record) => record?.assignedAt ? new Date(record.assignedAt).toLocaleDateString('vi-VN') : '—'
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '17%',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/admin/beds/${record?._id}`)}
          >
            Chi tiết
          </Button>
          {record?.status === 'AVAILABLE' && (
            <Button 
              type="dashed" 
              size="small" 
              onClick={() => handleAssignBed(record)}
            >
              Phân giường
            </Button>
          )}
          {record?.status === 'OCCUPIED' && (
            <Popconfirm
              title="Xuất viện"
              description="Bạn có chắc chắn muốn xuất viện cho bệnh nhân này?"
              onConfirm={() => handleReleaseBed(record?._id)}
              okText="Xuất"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger size="small" icon={<LogoutOutlined />}>
                Xuất
              </Button>
            </Popconfirm>
          )}
          <Button 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/admin/beds/${record?._id}/edit`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa giường"
            description="Bạn có chắc chắn muốn xóa giường này?"
            onConfirm={() => handleDelete(record?._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Quản lý Giường bệnh</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/beds/create')}>
            Thêm giường mới
          </Button>
        </div>

        {/* Statistics */}
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng giường"
                value={statistics.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Còn trống"
                value={statistics.available}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đang dùng"
                value={statistics.occupied}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tỷ lệ chiếm dụng"
                value={statistics.occupancyRate}
                suffix="%"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="rounded-lg">
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={6}>
              <Input 
                placeholder="Tìm giường..." 
                prefix={<SearchOutlined />} 
                value={filters.search} 
                onChange={(e) => setFilters({ ...filters, search: e.target.value })} 
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Select 
                placeholder="Lọc trạng thái"
                allowClear
                value={filters.status}
                onChange={(val) => setFilters({ ...filters, status: val })}
                options={bedStatuses}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Select 
                placeholder="Lọc loại giường"
                allowClear
                value={filters.bedType}
                onChange={(val) => setFilters({ ...filters, bedType: val })}
                options={bedTypes}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Input 
                placeholder="Lọc khoa..."
                value={filters.department} 
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                allowClear
              />
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card className="rounded-lg">
          {loading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : beds.length === 0 ? (
            <Empty description="Chưa có giường nào" />
          ) : (
            <Table 
              columns={columns} 
              dataSource={beds} 
              rowKey="_id" 
              pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total }} 
              scroll={{ x: 1400 }} 
              onChange={handleTableChange}
              bordered
              size="middle"
            />
          )}
        </Card>

        {/* Drawer for bed assignment */}
        <Drawer
          title={`Phân giường: ${selectedBed?.bedNumber}`}
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
        >
          <Form form={form} layout="vertical" onFinish={handleUpdateStock}>
            <Form.Item 
              name="patientId" 
              label="Mã bệnh nhân"
              rules={[{ required: true, message: 'Vui lòng nhập mã bệnh nhân' }]}
            >
              <Input placeholder="Nhập mã bệnh nhân" />
            </Form.Item>
            <Form.Item 
              name="admissionDate" 
              label="Ngày nhập viện"
              rules={[{ required: true, message: 'Vui lòng chọn ngày nhập viện' }]}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Phân giường
              </Button>
            </Form.Item>
          </Form>
        </Drawer>
      </div>
    </AdminLayout>
  );
};

export default BedsList;
