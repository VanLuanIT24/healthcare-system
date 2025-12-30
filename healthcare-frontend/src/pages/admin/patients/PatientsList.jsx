// src/pages/admin/patients/PatientsList.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import patientAPI from '@/services/api/patientAPI';
import { DeleteOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Select, Skeleton, Space, Table, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: '' });
  const navigate = useNavigate();

  const statusMap = {
    ACTIVE: { label: 'Hoạt động', color: 'green' },
    INACTIVE: { label: 'Không hoạt động', color: 'orange' },
    SUSPENDED: { label: 'Tạm khóa', color: 'red' }
  };

  const fetchPatients = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await patientAPI.getPatients({
        page,
        limit,
        search: filters.search || undefined,
        status: filters.status || undefined
      });

      const data = response?.data?.data || {};
      const items = data?.items || [];

      setPatients(items);
      setPagination({
        current: page,
        pageSize: limit,
        total: data?.total || items.length
      });
    } catch (error) {
      console.error('Error fetching patients:', error);
      message.error('Lỗi tải danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(1, 10);
  }, [filters]);

  const handleTableChange = (newPagination) => {
    fetchPatients(newPagination.current, newPagination.pageSize);
  };

  const columns = [
    {
      title: 'Tên bệnh nhân',
      key: 'name',
      width: '18%',
      render: (_, record) => (
        <div>
          <strong>{record?.personalInfo?.firstName} {record?.personalInfo?.lastName}</strong>
          <div style={{ fontSize: '12px', color: '#666' }}>{record?.email}</div>
        </div>
      )
    },
    {
      title: 'Số điện thoại',
      key: 'phone',
      width: '12%',
      render: (_, record) => record?.personalInfo?.phone || 'N/A'
    },
    {
      title: 'Giới tính',
      key: 'gender',
      width: '10%',
      render: (_, record) => record?.personalInfo?.gender || 'N/A'
    },
    {
      title: 'Ngày sinh',
      key: 'dob',
      width: '12%',
      render: (_, record) => dayjs(record?.personalInfo?.dateOfBirth).format('DD/MM/YYYY') || 'N/A'
    },
    {
      title: 'Địa chỉ',
      key: 'address',
      width: '20%',
      render: (_, record) => record?.personalInfo?.address?.street || 'N/A'
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: '10%',
      render: (_, record) => (
        <Tag color={statusMap[record?.status]?.color || 'default'}>
          {statusMap[record?.status]?.label || record?.status}
        </Tag>
      )
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
            onClick={() => navigate(`/admin/patients/${record?._id}`)}
          >
            Chi tiết
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record?._id)}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  const handleDelete = async (patientId) => {
    if (window.confirm('Bạn chắc chắn muốn xóa bệnh nhân này?')) {
      try {
        await patientAPI.deletePatient(patientId);
        message.success('Xóa bệnh nhân thành công');
        fetchPatients(pagination.current, pagination.pageSize);
      } catch (error) {
        message.error(error?.response?.data?.message || 'Lỗi xóa bệnh nhân');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Quản lý Bệnh nhân</h1>
        </div>

        <Card className="rounded-lg">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm theo tên hoặc email..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Lọc theo trạng thái"
                allowClear
                value={filters.status || undefined}
                onChange={(value) => setFilters({ ...filters, status: value })}
                options={[
                  { label: 'Hoạt động', value: 'ACTIVE' },
                  { label: 'Không hoạt động', value: 'INACTIVE' },
                  { label: 'Tạm khóa', value: 'SUSPENDED' }
                ]}
              />
            </Col>
          </Row>
        </Card>

        <Card className="rounded-lg">
          {loading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : (
            <Table
              columns={columns}
              dataSource={patients}
              rowKey="_id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} bệnh nhân`,
                pageSizeOptions: ['10', '20', '50']
              }}
              onChange={handleTableChange}
              scroll={{ x: 1200 }}
            />
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PatientsList;
