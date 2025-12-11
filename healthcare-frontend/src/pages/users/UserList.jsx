// 👥 User List Page
import {
    DeleteOutlined,
    EditOutlined,
    LockOutlined,
    MoreOutlined,
    PlusOutlined,
    SearchOutlined,
    UnlockOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Dropdown,
    Input,
    message,
    Modal,
    Row,
    Select,
    Table,
    Tag
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userAPI from '../../services/api/userAPI';
import './UserManagement.css';

const { Search } = Input;
const { Option } = Select;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        role: filters.role,
        status: filters.status,
      });
      setUsers(response.data.users);
      setPagination({ ...pagination, total: response.data.total });
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (userId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa người dùng này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await userAPI.deleteUser(userId);
          message.success('Đã xóa người dùng');
          loadUsers();
        } catch (error) {
          message.error('Xóa người dùng thất bại');
        }
      },
    });
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      if (currentStatus === 'active') {
        await userAPI.disableUser(userId);
        message.success('Đã vô hiệu hóa người dùng');
      } else {
        await userAPI.enableUser(userId);
        message.success('Đã kích hoạt người dùng');
      }
      loadUsers();
    } catch (error) {
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      SUPER_ADMIN: 'red',
      HOSPITAL_ADMIN: 'volcano',
      DOCTOR: 'blue',
      NURSE: 'cyan',
      PHARMACIST: 'purple',
      LAB_TECHNICIAN: 'geekblue',
      RECEPTIONIST: 'green',
      BILLING_STAFF: 'orange',
      PATIENT: 'default',
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      SUPER_ADMIN: 'Super Admin',
      HOSPITAL_ADMIN: 'Quản trị viên',
      DOCTOR: 'Bác sĩ',
      NURSE: 'Y tá',
      PHARMACIST: 'Dược sĩ',
      LAB_TECHNICIAN: 'Kỹ thuật viên XN',
      RECEPTIONIST: 'Lễ tân',
      BILLING_STAFF: 'Thu ngân',
      PATIENT: 'Bệnh nhân',
    };
    return labels[role] || role;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      locked: 'warning',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
      locked: 'Bị khóa',
    };
    return labels[status] || status;
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 250,
      render: (_, record) => (
        <div className="user-avatar">
          <Avatar
            size={48}
            src={record.profilePicture}
            icon={<UserOutlined />}
          />
          <div className="user-info">
            <div className="user-name">{record.fullName}</div>
            <div className="user-email">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color={getRoleColor(role)}>{getRoleLabel(role)}</Tag>,
    },
    {
      title: 'Chức vụ',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <UserOutlined />,
                label: 'Xem chi tiết',
                onClick: () => navigate(`/users/${record._id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Chỉnh sửa',
                onClick: () => navigate(`/users/${record._id}/edit`),
              },
              {
                key: 'toggle',
                icon: record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />,
                label: record.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt',
                onClick: () => handleToggleStatus(record._id, record.status),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Xóa',
                danger: true,
                onClick: () => handleDelete(record._id),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="page-container user-list-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý người dùng</h1>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate('/users/create')}
        >
          Thêm người dùng
        </Button>
      </div>

      <Card className="filter-section">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder="Tìm kiếm theo tên, email..."
              allowClear
              onSearch={(value) => setFilters({ ...filters, search: value })}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc theo vai trò"
              allowClear
              onChange={(value) => setFilters({ ...filters, role: value || '' })}
            >
              <Option value="SUPER_ADMIN">Super Admin</Option>
              <Option value="HOSPITAL_ADMIN">Quản trị viên</Option>
              <Option value="DOCTOR">Bác sĩ</Option>
              <Option value="NURSE">Y tá</Option>
              <Option value="PHARMACIST">Dược sĩ</Option>
              <Option value="LAB_TECHNICIAN">Kỹ thuật viên XN</Option>
              <Option value="RECEPTIONIST">Lễ tân</Option>
              <Option value="BILLING_STAFF">Thu ngân</Option>
              <Option value="PATIENT">Bệnh nhân</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc theo trạng thái"
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
              <Option value="locked">Bị khóa</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} người dùng`,
          }}
          onChange={(newPagination) => setPagination(newPagination)}
        />
      </Card>
    </div>
  );
};

export default UserList;
