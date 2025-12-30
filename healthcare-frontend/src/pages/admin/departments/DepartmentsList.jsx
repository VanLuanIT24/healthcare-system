// src/pages/admin/departments/DepartmentsList.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import adminAPI from '@/services/api/adminAPI';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Input, Popconfirm, Progress, Row, Select, Skeleton, Space, Statistic, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DepartmentsList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', type: null });
  const navigate = useNavigate();

  const departmentTypes = [
    { value: 'inpatient', label: 'Nội trú' },
    { value: 'outpatient', label: 'Ngoài trú' },
    { value: 'emergency', label: 'Cấp cứu' },
    { value: 'icu', label: 'ICU' }
  ];

  const getTypeColor = (type) => {
    const colors = {
      inpatient: 'blue',
      outpatient: 'green',
      emergency: 'red',
      icu: 'purple'
    };
    return colors[type] || 'default';
  };

  const getTypeLabel = (type) => {
    const labels = {
      inpatient: 'Nội trú',
      outpatient: 'Ngoài trú',
      emergency: 'Cấp cứu',
      icu: 'ICU'
    };
    return labels[type] || type;
  };

  const fetchDepartments = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const params = { page, limit, search: filters.search };
      if (filters.type) params.type = filters.type;
      
      const res = await adminAPI.getDepartments(params);
      const departmentData = res.data?.data || res.data || [];
      const deptArray = Array.isArray(departmentData) ? departmentData : [];
      
      setDepartments(deptArray);
      setPagination({
        current: res.data?.currentPage || page,
        pageSize: res.data?.pageSize || limit,
        total: res.data?.total || deptArray.length || 0,
      });

      // Calculate statistics from departments
      const totalDepts = deptArray.length;
      const totalDoctors = deptArray.reduce((sum, dept) => sum + (dept.statistics?.totalDoctors || 0), 0);
      const totalBeds = deptArray.reduce((sum, dept) => sum + (dept.statistics?.totalBeds || 0), 0);
      const occupiedBeds = deptArray.reduce((sum, dept) => sum + (dept.statistics?.occupiedBeds || 0), 0);
      
      setStats({ totalDepts, totalDoctors, totalBeds, occupiedBeds });
    } catch (error) {
      console.error('Error fetching departments:', error);
      message.error('Lỗi khi tải danh sách khoa');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments(1, pagination.pageSize);
    // eslint-disable-next-line
  }, [filters]);

  const handleTableChange = (newPagination) => {
    fetchDepartments(newPagination.current, newPagination.pageSize);
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteDepartment(id);
      message.success('Xóa khoa thành công');
      fetchDepartments(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error deleting department:', error);
      message.error('Lỗi khi xóa khoa');
    }
  };

  const columns = [
    {
      title: 'Tên khoa',
      key: 'name',
      width: '20%',
      render: (_, record) => (
        <div>
          <strong>{record?.name}</strong>
          <br />
          <small style={{ color: '#999' }}>Mã: {record?.code}</small>
        </div>
      )
    },
    {
      title: 'Loại',
      key: 'type',
      width: '12%',
      render: (_, record) => (
        <Tag color={getTypeColor(record?.type)}>
          {getTypeLabel(record?.type)}
        </Tag>
      )
    },
    {
      title: 'Mô tả',
      key: 'description',
      width: '25%',
      render: (_, record) => (
        <span>{record?.description || 'N/A'}</span>
      )
    },
    {
      title: 'Bác sĩ',
      key: 'doctors',
      width: '10%',
      render: (_, record) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {record?.statistics?.totalDoctors || 0}
        </span>
      )
    },
    {
      title: 'Giường / Chiếm dụng',
      key: 'beds',
      width: '15%',
      render: (_, record) => {
        const total = record?.statistics?.totalBeds || 0;
        const occupied = record?.statistics?.occupiedBeds || 0;
        const rate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;
        
        return (
          <div>
            <span style={{ fontWeight: 'bold' }}>{occupied}/{total}</span>
            <br />
            <Progress percent={parseFloat(rate)} size="small" status={rate > 80 ? 'exception' : 'active'} />
          </div>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '18%',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/admin/departments/${record?._id}`)}
          >
            Chi tiết
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/admin/departments/${record?._id}/edit`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa khoa"
            description="Bạn có chắc chắn muốn xóa khoa này?"
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
          <h1 className="text-2xl font-bold">Quản lý Khoa</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/departments/create')}>
            Thêm khoa mới
          </Button>
        </div>

        {/* Statistics */}
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng số khoa"
                value={pagination.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng bác sĩ"
                value={departments.reduce((sum, d) => sum + (d?.statistics?.totalDoctors || 0), 0)}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng giường"
                value={departments.reduce((sum, d) => sum + (d?.statistics?.totalBeds || 0), 0)}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Giường đang dùng"
                value={departments.reduce((sum, d) => sum + (d?.statistics?.occupiedBeds || 0), 0)}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="rounded-lg">
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={16}>
              <Input 
                placeholder="Tìm kiếm khoa..." 
                prefix={<SearchOutlined />} 
                value={filters.search} 
                onChange={(e) => setFilters({ ...filters, search: e.target.value })} 
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Select 
                placeholder="Lọc theo loại"
                allowClear
                value={filters.type}
                onChange={(val) => setFilters({ ...filters, type: val })}
                options={departmentTypes}
              />
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card className="rounded-lg">
          {loading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : departments.length === 0 ? (
            <Empty description="Chưa có khoa nào" />
          ) : (
            <Table 
              columns={columns} 
              dataSource={departments} 
              rowKey="_id" 
              pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total }} 
              scroll={{ x: 1200 }} 
              onChange={handleTableChange}
              bordered
              size="middle"
            />
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DepartmentsList;
