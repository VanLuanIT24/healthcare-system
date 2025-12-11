// 👥 Enhanced User Management với Full Backend Integration
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    LockOutlined,
    PlusOutlined,
    SafetyOutlined,
    SearchOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Descriptions,
    Drawer,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Statistic,
    Switch,
    Table,
    Tag,
    Tooltip,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userAPI from '../../services/api/userAPI';
import designSystem from '../../theme/designSystem';
import './UserManagement.css';

const { Search } = Input;
const { Option } = Select;
const { colors } = designSystem;

const UserListEnhanced = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    department: '',
  });
  const [stats, setStats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const navigate = useNavigate();

  const roles = [
    { value: 'SUPER_ADMIN', label: 'Super Admin', color: 'red' },
    { value: 'HOSPITAL_ADMIN', label: 'Hospital Admin', color: 'orange' },
    { value: 'DEPARTMENT_HEAD', label: 'Trưởng khoa', color: 'gold' },
    { value: 'DOCTOR', label: 'Bác sĩ', color: 'blue' },
    { value: 'NURSE', label: 'Y tá', color: 'cyan' },
    { value: 'RECEPTIONIST', label: 'Lễ tân', color: 'green' },
    { value: 'LAB_TECHNICIAN', label: 'KTV Xét nghiệm', color: 'purple' },
    { value: 'PHARMACIST', label: 'Dược sĩ', color: 'magenta' },
    { value: 'BILLING_STAFF', label: 'Kế toán', color: 'lime' },
    { value: 'PATIENT', label: 'Bệnh nhân', color: 'default' },
  ];

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Clean params - remove empty strings to avoid validation errors
      const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...cleanedFilters,
      };
      const response = await userAPI.getUsers(params);
      setUsers(response.data?.users || response.data?.data || []);
      setPagination({
        ...pagination,
        total: response.data?.total || response.data?.pagination?.total || 0,
      });
    } catch (error) {
      console.error('Load users error:', error);
      
      // Hiển thị thông báo lỗi chi tiết từ server
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      const statusCode = error.response?.status;
      
      if (statusCode === 422) {
        message.error(`Lỗi xác thực dữ liệu: ${errorMessage}`);
        console.error('Validation errors:', error.response?.data?.errors);
      } else if (statusCode === 401) {
        message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else if (statusCode === 403) {
        message.error('Bạn không có quyền truy cập danh sách người dùng');
      } else if (statusCode >= 500) {
        message.error('Lỗi server. Vui lòng thử lại sau.');
      } else {
        message.error(`Không thể tải danh sách người dùng: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await userAPI.getUserStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Failed to load user stats');
    }
  };

  const handleCreateUser = async (values) => {
    try {
      await userAPI.createUser(values);
      message.success('Tạo người dùng thành công');
      setCreateModalVisible(false);
      form.resetFields();
      loadUsers();
      loadStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Tạo người dùng thất bại');
    }
  };

  const handleUpdateRole = async (values) => {
    try {
      await userAPI.assignRole(selectedUser._id, values.role);
      message.success('Cập nhật vai trò thành công');
      setRoleModalVisible(false);
      roleForm.resetFields();
      loadUsers();
    } catch (error) {
      message.error('Cập nhật vai trò thất bại');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      if (currentStatus === 'ACTIVE') {
        await userAPI.deactivateUser(userId);
        message.success('Đã vô hiệu hóa người dùng');
      } else {
        await userAPI.activateUser(userId);
        message.success('Đã kích hoạt người dùng');
      }
      loadUsers();
    } catch (error) {
      message.error('Thao tác thất bại');
    }
  };

  const handleResetPassword = (userId) => {
    Modal.confirm({
      title: 'Đặt lại mật khẩu',
      content: 'Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng này?',
      okText: 'Đặt lại',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await userAPI.resetPassword(userId);
          message.success('Đã đặt lại mật khẩu thành công');
        } catch (error) {
          message.error('Đặt lại mật khẩu thất bại');
        }
      },
    });
  };

  const handleDeleteUser = async (userId) => {
    try {
      await userAPI.deleteUser(userId);
      message.success('Đã xóa người dùng');
      loadUsers();
      loadStats();
    } catch (error) {
      message.error('Xóa người dùng thất bại');
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const response = await userAPI.getUserById(userId);
      setSelectedUser(response.data);
      setDrawerVisible(true);
    } catch (error) {
      message.error('Không thể tải thông tin người dùng');
    }
  };

  const getRoleColor = (role) => {
    const roleObj = roles.find((r) => r.value === role);
    return roleObj?.color || 'default';
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find((r) => r.value === role);
    return roleObj?.label || role;
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 250,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.profilePicture}
            icon={<UserOutlined />}
            style={{ backgroundColor: colors.primary[500] }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{record.fullName}</div>
            <div style={{ fontSize: 12, color: colors.text.secondary }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role) => <Tag color={getRoleColor(role)}>{getRoleLabel(role)}</Tag>,
      filters: roles.map((r) => ({ text: r.label, value: r.value })),
    },
    {
      title: 'Khoa/Phòng',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      render: (dept) => dept || 'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Badge
          status={status === 'ACTIVE' ? 'success' : 'default'}
          text={status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
        />
      ),
    },
    {
      title: 'Đăng nhập cuối',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
      render: (date) => (date ? moment(date).format('DD/MM/YYYY HH:mm') : 'Chưa đăng nhập'),
      sorter: (a, b) => moment(a.lastLogin).unix() - moment(b.lastLogin).unix(),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              size="small"
              icon={<UserOutlined />}
              onClick={() => handleViewDetails(record._id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/users/${record._id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Đổi vai trò">
            <Button
              type="link"
              size="small"
              icon={<SafetyOutlined />}
              onClick={() => {
                setSelectedUser(record);
                roleForm.setFieldsValue({ role: record.role });
                setRoleModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Đặt lại mật khẩu">
            <Button
              type="link"
              size="small"
              icon={<LockOutlined />}
              onClick={() => handleResetPassword(record._id)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Switch
              size="small"
              checked={record.status === 'ACTIVE'}
              onChange={() => handleToggleStatus(record._id, record.status)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa người dùng này?"
            onConfirm={() => handleDeleteUser(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container fadeIn">
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <TeamOutlined style={{ marginRight: 12, color: colors.primary[500] }} />
            Quản lý người dùng
          </h1>
          <p className="dashboard-subtitle">Quản lý tài khoản và phân quyền hệ thống</p>
        </div>
        <Space>
          <Button icon={<SafetyOutlined />} onClick={() => navigate('/roles')}>
            Quản lý vai trò
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)} size="large">
            Tạo người dùng mới
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} className="staggered-cards">
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng người dùng</span>}
              value={stats.totalUsers || 0}
              prefix={<TeamOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Hoạt động</span>}
              value={stats.activeUsers || 0}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.warning[500]}, ${colors.warning[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Online</span>}
              value={stats.onlineUsers || 0}
              prefix={<UserOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.error[500]}, ${colors.error[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Vô hiệu</span>}
              value={stats.inactiveUsers || 0}
              prefix={<CloseCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card variant="borderless" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm theo tên, email..."
              allowClear
              enterButton
              onSearch={(value) => {
                setFilters({ ...filters, search: value });
                setPagination({ ...pagination, current: 1 });
              }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Vai trò"
              allowClear
              onChange={(value) => setFilters({ ...filters, role: value || '' })}
            >
              {roles.map((role) => (
                <Option key={role.value} value={role.value}>
                  {role.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="ACTIVE">Hoạt động</Option>
              <Option value="INACTIVE">Vô hiệu</Option>
            </Select>
          </Col>
          <Col xs={12} md={5}>
            <Input
              placeholder="Khoa/Phòng"
              allowClear
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            />
          </Col>
          <Col xs={12} md={2}>
            <Button onClick={loadUsers} loading={loading} block>
              Lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* User Table */}
      <Card variant="borderless">
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1400 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng số ${total} người dùng`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Card>

      {/* Create User Modal */}
      <Modal
        title="Tạo người dùng mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateUser}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ"
                name="firstName"
                rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
              >
                <Input placeholder="Nguyễn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tên"
                name="lastName"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="Văn A" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
            ]}
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Vai trò"
                name="role"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select placeholder="Chọn vai trò">
                  {roles.map((role) => (
                    <Option key={role.value} value={role.value}>
                      <Tag color={role.color}>{role.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Khoa/Phòng" name="department">
                <Input placeholder="Khoa Nội" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Số điện thoại" name="phone">
            <Input placeholder="0912345678" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCreateModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Tạo người dùng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Role Update Modal */}
      <Modal
        title="Cập nhật vai trò"
        open={roleModalVisible}
        onCancel={() => {
          setRoleModalVisible(false);
          roleForm.resetFields();
        }}
        footer={null}
      >
        <Form form={roleForm} layout="vertical" onFinish={handleUpdateRole}>
          <Form.Item
            label="Vai trò mới"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò mới">
              {roles.map((role) => (
                <Option key={role.value} value={role.value}>
                  <Tag color={role.color}>{role.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setRoleModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Details Drawer */}
      <Drawer
        title="Thông tin người dùng"
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedUser && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={100}
                src={selectedUser.profilePicture}
                icon={<UserOutlined />}
                style={{ backgroundColor: colors.primary[500] }}
              />
              <h2 style={{ marginTop: 16, marginBottom: 8 }}>{selectedUser.fullName}</h2>
              <Tag color={getRoleColor(selectedUser.role)}>{getRoleLabel(selectedUser.role)}</Tag>
              <div style={{ marginTop: 8 }}>
                <Badge
                  status={selectedUser.status === 'ACTIVE' ? 'success' : 'default'}
                  text={selectedUser.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
                />
              </div>
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedUser.phone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Khoa/Phòng">{selectedUser.department || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Đăng nhập cuối">
                {selectedUser.lastLogin
                  ? moment(selectedUser.lastLogin).format('DD/MM/YYYY HH:mm')
                  : 'Chưa đăng nhập'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {moment(selectedUser.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'center' }}>
                <Button icon={<EditOutlined />} onClick={() => navigate(`/users/${selectedUser._id}/edit`)}>
                  Chỉnh sửa
                </Button>
                <Button icon={<LockOutlined />} onClick={() => handleResetPassword(selectedUser._id)}>
                  Đặt lại mật khẩu
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default UserListEnhanced;
