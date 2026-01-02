// src/pages/admin/users/UsersList.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import adminAPI from '@/services/api/admin/adminAPI';
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  SwapOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Skeleton, Space, Table, Tag, Modal, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const navigate = useNavigate();

  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers({
        page,
        limit,
        search: filters.search || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined
      });

      // Format mới: response.data.data = { items, total, page, limit, pages }
      const data = response?.data?.data || {};
      const items = data?.items || [];

      setUsers(items);
      setPagination({
        current: page,
        pageSize: limit,
        total: data?.total || items.length
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, 10);
  }, [filters]);

  const handleTableChange = (newPagination) => {
    fetchUsers(newPagination.current, newPagination.pageSize);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn chắc chắn muốn xóa người dùng này?')) {
      try {
        await adminAPI.deleteUser(userId);
        fetchUsers(pagination.current, pagination.pageSize);
        message.success('Xóa người dùng thành công');
      } catch (error) {
        console.error('Error deleting user:', error);
        message.error('Lỗi khi xóa người dùng');
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      if (currentStatus === 'ACTIVE') {
        await adminAPI.disableUser(userId);
        message.success('Đã vô hiệu hóa người dùng');
      } else {
        await adminAPI.enableUser(userId);
        message.success('Đã kích hoạt người dùng');
      }
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error toggling user status:', error);
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const getRoleColor = (role) => {
    const roleColors = {
      SUPER_ADMIN: 'red',
      ADMIN: 'orange',
      HOSPITAL_ADMIN: 'volcano',
      DOCTOR: 'blue',
      NURSE: 'cyan',
      PATIENT: 'green',
      RECEPTIONIST: 'purple',
      CONSULTANT_SUPPORT: 'lime'
    };
    return roleColors[role] || 'default';
  };

  const getStatusColor = (status) => {
    const statusColors = {
      ACTIVE: 'green',
      INACTIVE: 'orange',
      SUSPENDED: 'red',
      PENDING_APPROVAL: 'blue',
      LOCKED: 'red',
      DELETED: 'red'
    };
    return statusColors[status] || 'default';
  };

  const columns = [
    {
      title: 'Tên',
      key: 'name',
      width: '20%',
      render: (_, record) => (
        <div>
          <strong>{record?.personalInfo?.firstName} {record?.personalInfo?.lastName}</strong>
          <br />
          <small style={{ color: '#666' }}>{record?.email}</small>
        </div>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      width: '12%',
      render: (role) => <Tag color={getRoleColor(role)}>{role}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: '12%',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
    },
    {
      title: 'Điện thoại',
      dataIndex: ['personalInfo', 'phone'],
      width: '15%'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: '15%',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Hành động',
      width: '20%',
      fixed: 'right',
      render: (_, record) => (
        <Space wrap size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/users/${record._id}`)}
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
          >
            Xem
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/users/${record._id}/edit`)}
            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: 'none', color: '#fff' }}
          >
            Sửa
          </Button>
          <Button
            size="small"
            icon={<SwapOutlined />}
            onClick={() => navigate(`/admin/users/${record._id}/change-role`)}
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: 'none', color: '#fff' }}
          >
            Role
          </Button>
          <Button
            size="small"
            icon={record?.status === 'ACTIVE' ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleStatus(record._id, record?.status)}
            danger={record?.status === 'ACTIVE'}
            style={record?.status === 'ACTIVE' ?
              { background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', border: 'none', color: '#fff' } :
              { background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)', border: 'none', color: '#fff' }
            }
          >
            {record?.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            style={{ background: 'linear-gradient(135deg, #fa5252 0%, #d9480f 100%)', border: 'none', color: '#fff' }}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-4" style={{ padding: '20px' }}>
        {/* Header with Gradient */}
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '30px',
            borderRadius: '12px',
            color: 'white',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
          }}
        >
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>👥 Danh sách người dùng</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/users/create')}
            size="large"
            style={{ background: '#fff', color: '#667eea', border: 'none', fontWeight: 'bold' }}
          >
            ➕ Thêm người dùng
          </Button>
        </div>

        {/* Filters */}
        <Card
          style={{
            borderRadius: '12px',
            borderTop: '4px solid #667eea',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Input
                placeholder="🔍 Tìm theo tên hoặc email"
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{ borderRadius: '8px' }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <CustomSelect
                placeholder="👤 Lọc theo role"
                allowClear
                value={filters.role}
                onChange={(value) => setFilters({ ...filters, role: value })}
                options={[
                  { label: '🔴 SUPER_ADMIN', value: 'SUPER_ADMIN' },
                  { label: '🟠 ADMIN', value: 'ADMIN' },
                  { label: '🔵 DOCTOR', value: 'DOCTOR' },
                  { label: '🩺 NURSE', value: 'NURSE' },
                  { label: '🟢 PATIENT', value: 'PATIENT' },
                  { label: '📞 RECEPTIONIST', value: 'RECEPTIONIST' },
                  { label: '💻 CONSULTANT_SUPPORT', value: 'CONSULTANT_SUPPORT' }
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <CustomSelect
                placeholder="📊 Lọc theo trạng thái"
                allowClear
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                options={[
                  { label: '✅ ACTIVE', value: 'ACTIVE' },
                  { label: '⏸️ INACTIVE', value: 'INACTIVE' },
                  { label: '⛔ SUSPENDED', value: 'SUSPENDED' },
                  { label: '🔒 LOCKED', value: 'LOCKED' }
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Skeleton loading={loading} active paragraph={{ rows: 10 }}>
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}
          >
            <Table
              columns={columns}
              dataSource={users}
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
              rowKey="_id"
              scroll={{ x: 1200 }}
              style={{ borderRadius: '8px' }}
            />
          </Card>
        </Skeleton>
      </div>
    </AdminLayout>
  );
};

export default UsersList;
