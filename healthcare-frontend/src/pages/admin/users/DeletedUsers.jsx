// src/pages/admin/users/DeletedUsers.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import adminAPI from '@/services/api/admin/adminAPI';
import { RollbackOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Skeleton, Space, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';

const DeletedUsers = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchDeletedUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await adminAPI.getDeletedUsers({
        page,
        limit,
        search: search || undefined
      });

      // Format mới: response.data.data = { items, total, page, limit, pages }
      const data = response?.data?.data || {};
      const items = data?.items || [];

      setDeletedUsers(items);
      setPagination({
        current: page,
        pageSize: limit,
        total: data?.total || items.length
      });
    } catch (error) {
      console.error('Error fetching deleted users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedUsers(1, 10);
  }, [search]);

  const handleTableChange = (newPagination) => {
    fetchDeletedUsers(newPagination.current, newPagination.pageSize);
  };

  const handleRestore = async (userId) => {
    if (window.confirm('Khôi phục người dùng này?')) {
      try {
        await adminAPI.restoreUser(userId);
        fetchDeletedUsers(pagination.current, pagination.pageSize);
      } catch (error) {
        console.error('Error restoring user:', error);
      }
    }
  };

  const getRoleColor = (role) => {
    const roleColors = {
      SUPER_ADMIN: 'red',
      ADMIN: 'orange',
      DOCTOR: 'blue',
      NURSE: 'cyan',
      PATIENT: 'green',
      RECEPTIONIST: 'purple'
    };
    return roleColors[role] || 'default';
  };

  const columns = [
    {
      title: 'Tên',
      key: 'name',
      width: '25%',
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
      width: '15%',
      render: (role) => <Tag color={getRoleColor(role)}>{role}</Tag>
    },
    {
      title: 'Điện thoại',
      dataIndex: ['personalInfo', 'phone'],
      width: '20%'
    },
    {
      title: 'Ngày xóa',
      dataIndex: 'deletedAt',
      width: '20%',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
    },
    {
      title: 'Hành động',
      width: '20%',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<RollbackOutlined />}
            onClick={() => handleRestore(record._id)}
          >
            Khôi phục
          </Button>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <Input
          placeholder="Tìm người dùng đã xóa"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />

        <Skeleton loading={loading} active paragraph={{ rows: 10 }}>
          <Card title="🗑️ Người dùng đã xóa" className="rounded-lg">
            <Table
              columns={columns}
              dataSource={deletedUsers}
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
              rowKey="_id"
              scroll={{ x: 1000 }}
            />
          </Card>
        </Skeleton>
      </div>
    </AdminLayout>
  );
};

export default DeletedUsers;
