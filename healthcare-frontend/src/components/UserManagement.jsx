import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  message,
  Drawer,
  Descriptions,
  Badge,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Search } = Input;
const { Option } = Select;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, filterRole, filterStatus, searchText]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        message.error('Vui lòng đăng nhập lại');
        return;
      }

      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(filterRole !== 'all' && { role: filterRole }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(searchText && { search: searchText })
      };

      console.log('Fetching users with token:', token.substring(0, 20) + '...');

      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        const usersData = response.data.data.users || response.data.data || [];
        setUsers(usersData);
        setPagination({
          ...pagination,
          total: response.data.data.total || usersData.length
        });
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 401) {
        message.error('Token hết hạn. Vui lòng đăng nhập lại');
        // Optionally redirect to login
        // window.location.href = '/superadmin/login';
      } else {
        message.error('Không thể tải danh sách người dùng');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setDrawerVisible(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditMode(true);
    form.setFieldsValue({
      email: user.email,
      firstName: user.personalInfo?.firstName,
      lastName: user.personalInfo?.lastName,
      phone: user.personalInfo?.phone,
      role: user.role,
      status: user.status
    });
    setModalVisible(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setEditMode(false);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_BASE_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Đã xóa người dùng');
      fetchUsers();
    } catch (err) {
      message.error('Không thể xóa người dùng');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const token = localStorage.getItem('accessToken');
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      
      await axios.patch(
        `${API_BASE_URL}/users/${user._id}/disable`,
        { reason: 'Admin action', status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      message.success(`Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} người dùng`);
      fetchUsers();
    } catch (err) {
      message.error('Không thể thay đổi trạng thái người dùng');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const userData = {
        email: values.email,
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          dateOfBirth: values.dateOfBirth || '1990-01-01',
          gender: values.gender || 'OTHER'
        },
        role: values.role,
        ...(values.password && { password: values.password, confirmPassword: values.password })
      };

      if (editMode && selectedUser) {
        // Update user
        await axios.put(
          `${API_BASE_URL}/users/${selectedUser._id}`,
          userData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Cập nhật người dùng thành công');
      } else {
        // Create user
        await axios.post(
          `${API_BASE_URL}/users`,
          { ...userData, password: values.password, confirmPassword: values.password },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Tạo người dùng thành công');
      }

      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (err) {
      console.error('Submit error:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Có lỗi xảy ra';
      message.error(errorMsg);
    }
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <Space>
          <MailOutlined style={{ color: '#1890ff' }} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Họ tên',
      key: 'name',
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ color: '#52c41a' }} />
          <span>
            {record.personalInfo?.firstName} {record.personalInfo?.lastName}
          </span>
        </Space>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: ['personalInfo', 'phone'],
      key: 'phone',
      render: (text) => text ? (
        <Space>
          <PhoneOutlined />
          <span>{text}</span>
        </Space>
      ) : '-'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Super Admin', value: 'SUPER_ADMIN' },
        { text: 'Admin', value: 'ADMIN' },
        { text: 'Bác sĩ', value: 'DOCTOR' },
        { text: 'Bệnh nhân', value: 'PATIENT' }
      ],
      render: (role) => {
        const colors = {
          SUPER_ADMIN: 'red',
          ADMIN: 'orange',
          DOCTOR: 'blue',
          PATIENT: 'green'
        };
        const labels = {
          SUPER_ADMIN: 'Super Admin',
          ADMIN: 'Admin',
          DOCTOR: 'Bác sĩ',
          PATIENT: 'Bệnh nhân'
        };
        return <Tag color={colors[role]}>{labels[role] || role}</Tag>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Hoạt động', value: 'ACTIVE' },
        { text: 'Không hoạt động', value: 'INACTIVE' },
        { text: 'Bị khóa', value: 'LOCKED' }
      ],
      render: (status) => {
        const config = {
          ACTIVE: { color: 'success', text: 'Hoạt động' },
          INACTIVE: { color: 'default', text: 'Không hoạt động' },
          LOCKED: { color: 'error', text: 'Bị khóa' }
        };
        return <Badge status={config[status]?.color} text={config[status]?.text || status} />;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewUser(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              icon={record.status === 'ACTIVE' ? <LockOutlined /> : <UnlockOutlined />}
              size="small"
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDeleteUser(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    doctors: users.filter(u => u.role === 'DOCTOR').length,
    patients: users.filter(u => u.role === 'PATIENT').length
  };

  return (
    <div>
      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={stats.total}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bác sĩ"
              value={stats.doctors}
              prefix={<IdcardOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bệnh nhân"
              value={stats.patients}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Search
              placeholder="Tìm kiếm theo email, tên..."
              allowClear
              style={{ width: 250 }}
              onSearch={setSearchText}
              prefix={<SearchOutlined />}
            />
            <Select
              style={{ width: 150 }}
              placeholder="Vai trò"
              value={filterRole}
              onChange={setFilterRole}
            >
              <Option value="all">Tất cả vai trò</Option>
              <Option value="SUPER_ADMIN">Super Admin</Option>
              <Option value="ADMIN">Admin</Option>
              <Option value="DOCTOR">Bác sĩ</Option>
              <Option value="PATIENT">Bệnh nhân</Option>
            </Select>
            <Select
              style={{ width: 150 }}
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="ACTIVE">Hoạt động</Option>
              <Option value="INACTIVE">Không hoạt động</Option>
              <Option value="LOCKED">Bị khóa</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
              Làm mới
            </Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateUser}>
            Thêm người dùng
          </Button>
        </Space>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* User Detail Drawer */}
      <Drawer
        title="Chi tiết người dùng"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedUser && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
            <Descriptions.Item label="Họ tên">
              {selectedUser.personalInfo?.firstName} {selectedUser.personalInfo?.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedUser.personalInfo?.phone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Tag color={
                selectedUser.role === 'SUPER_ADMIN' ? 'red' :
                selectedUser.role === 'ADMIN' ? 'orange' :
                selectedUser.role === 'DOCTOR' ? 'blue' : 'green'
              }>
                {selectedUser.role}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Badge
                status={selectedUser.status === 'ACTIVE' ? 'success' : 'error'}
                text={selectedUser.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedUser.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Đăng nhập lần cuối">
              {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* Create/Edit User Modal */}
      <Modal
        title={editMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="email@example.com" disabled={editMode} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Họ"
                rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nguyễn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Văn A" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="0987654321" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="ADMIN">Admin</Option>
              <Option value="DOCTOR">Bác sĩ</Option>
              <Option value="PATIENT">Bệnh nhân</Option>
            </Select>
          </Form.Item>

          {!editMode && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editMode ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
