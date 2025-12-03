import {
    EditOutlined,
    ExportOutlined,
    EyeOutlined,
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
    Space,
    Table,
    Tag,
    Typography
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { staffApi } from '../../../services/adminApi';

const { Title } = Typography;
const { Option } = Select;

const StaffList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    role: null,
    status: null,
    department: null,
    search: ''
  });

  useEffect(() => {
    fetchStaffList();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      
      // SỬ DỤNG API SERVICE
      const response = await staffApi.getList({
        page: pagination.current,
        limit: pagination.pageSize,
        role: filters.role,
        status: filters.status,
        department: filters.department,
        search: filters.search
      });
      
      // XỬ LÝ RESPONSE
      if (response.success && response.data) {
        setStaffList(response.data.users || response.data || []);
        setPagination({
          ...pagination,
          total: response.data.pagination?.totalItems || response.data.pagination?.total || 0
        });
      }

    } catch (error) {
      console.error('❌ [STAFF LIST] Fetch error:', error);
      message.error(
        error.response?.data?.message || error.message || 'Không thể tải danh sách nhân viên'
      );
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const getMockStaffList = () => [
    {
      _id: '1',
      personalInfo: {
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        email: 'nguyenvana@healthcare.vn',
        phone: '0123456789',
        avatar: null
      },
      role: 'DOCTOR',
      department: 'Tim mạch',
      status: 'active',
      createdAt: '2025-01-15'
    },
    {
      _id: '2',
      personalInfo: {
        firstName: 'Trần',
        lastName: 'Thị B',
        email: 'tranthib@healthcare.vn',
        phone: '0987654321',
        avatar: null
      },
      role: 'NURSE',
      department: 'Nhi khoa',
      status: 'active',
      createdAt: '2025-02-20'
    },
    {
      _id: '3',
      personalInfo: {
        firstName: 'Lê',
        lastName: 'Văn C',
        email: 'levanc@healthcare.vn',
        phone: '0369852147',
        avatar: null
      },
      role: 'PHARMACIST',
      department: 'Nhà thuốc',
      status: 'active',
      createdAt: '2025-03-10'
    }
  ];

  const handleDisableUser = async (userId) => {
    try {
      await staffApi.disable(userId, 'Vô hiệu hóa bởi quản trị viên');
      message.success('Đã vô hiệu hóa tài khoản');
      fetchStaffList();
    } catch (error) {
      console.error('❌ [STAFF] Disable error:', error);
      message.error(error.response?.data?.message || error.message || 'Không thể vô hiệu hóa tài khoản');
    }
  };

  const handleEnableUser = async (userId) => {
    try {
      await staffApi.enable(userId);
      message.success('Đã kích hoạt tài khoản');
      fetchStaffList();
    } catch (error) {
      console.error('❌ [STAFF] Enable error:', error);
      message.error(error.response?.data?.message || error.message || 'Không thể kích hoạt tài khoản');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      SUPER_ADMIN: 'red',
      HOSPITAL_ADMIN: 'orange',
      DEPARTMENT_HEAD: 'purple',
      DOCTOR: 'blue',
      NURSE: 'cyan',
      PHARMACIST: 'green',
      LAB_TECHNICIAN: 'lime',
      RECEPTIONIST: 'gold',
      BILLING_STAFF: 'magenta'
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      SUPER_ADMIN: 'Super Admin',
      HOSPITAL_ADMIN: 'Quản trị viên',
      DEPARTMENT_HEAD: 'Trưởng khoa',
      DOCTOR: 'Bác sĩ',
      NURSE: 'Y tá',
      PHARMACIST: 'Dược sĩ',
      LAB_TECHNICIAN: 'Kỹ thuật viên XN',
      RECEPTIONIST: 'Lễ tân',
      BILLING_STAFF: 'Kế toán'
    };
    return labels[role] || role;
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'success',
      INACTIVE: 'default',
      SUSPENDED: 'warning',
      LOCKED: 'error'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: ['personalInfo', 'profilePicture'],
      key: 'avatar',
      width: 60,
      render: (picture, record) => (
        <Avatar 
          size={40} 
          src={picture} 
          icon={<UserOutlined />}
          style={{ backgroundColor: '#1890ff' }}
        >
          {record.personalInfo?.firstName?.[0]}
        </Avatar>
      )
    },
    {
      title: 'Họ tên',
      key: 'fullName',
      render: (record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.personalInfo?.firstName} {record.personalInfo?.lastName}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {record.email}
          </div>
        </div>
      ),
      sorter: true
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Quản trị viên', value: 'HOSPITAL_ADMIN' },
        { text: 'Trưởng khoa', value: 'DEPARTMENT_HEAD' },
        { text: 'Bác sĩ', value: 'DOCTOR' },
        { text: 'Y tá', value: 'NURSE' },
        { text: 'Dược sĩ', value: 'PHARMACIST' },
        { text: 'Kỹ thuật viên XN', value: 'LAB_TECHNICIAN' },
        { text: 'Lễ tân', value: 'RECEPTIONIST' },
        { text: 'Kế toán', value: 'BILLING_STAFF' }
      ],
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {getRoleLabel(role)}
        </Tag>
      )
    },
    {
      title: 'Khoa/Phòng',
      dataIndex: ['professionalInfo', 'department'],
      key: 'department',
      render: (dept) => dept || '-'
    },
    {
      title: 'Chuyên môn',
      dataIndex: ['professionalInfo', 'specialization'],
      key: 'specialization',
      render: (spec) => spec || '-'
    },
    {
      title: 'Số điện thoại',
      dataIndex: ['personalInfo', 'phone'],
      key: 'phone',
      render: (phone) => phone || '-'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Hoạt động', value: 'ACTIVE' },
        { text: 'Không hoạt động', value: 'INACTIVE' },
        { text: 'Tạm khóa', value: 'SUSPENDED' },
        { text: 'Bị khóa', value: 'LOCKED' }
      ],
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'ACTIVE' ? 'Hoạt động' : 
           status === 'INACTIVE' ? 'Không hoạt động' :
           status === 'SUSPENDED' ? 'Tạm khóa' : 'Bị khóa'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            label: 'Xem chi tiết',
            icon: <EyeOutlined />,
            onClick: () => navigate(`/admin/staff/${record._id}`)
          },
          {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <EditOutlined />,
            onClick: () => navigate(`/admin/staff/${record._id}/edit`)
          },
          {
            type: 'divider'
          },
          {
            key: 'disable',
            label: record.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt',
            icon: record.status === 'ACTIVE' ? <LockOutlined /> : <UnlockOutlined />,
            onClick: () => {
              if (record.status === 'ACTIVE') {
                Modal.confirm({
                  title: 'Xác nhận vô hiệu hóa',
                  content: `Bạn có chắc muốn vô hiệu hóa tài khoản ${record.email}?`,
                  okText: 'Vô hiệu hóa',
                  cancelText: 'Hủy',
                  onOk: () => handleDisableUser(record._id)
                });
              } else {
                handleEnableUser(record._id);
              }
            }
          }
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      }
    }
  ];

  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleRoleFilter = (value) => {
    setFilters({ ...filters, role: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleStatusFilter = (value) => {
    setFilters({ ...filters, status: value });
    setPagination({ ...pagination, current: 1 });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Quản lý nhân viên
              </Title>
            </Col>
            <Col>
              <Space>
                <Button icon={<ExportOutlined />}>
                  Xuất Excel
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/admin/staff/create')}
                >
                  Thêm nhân viên
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Tìm kiếm theo tên, email..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Lọc theo vai trò"
              style={{ width: '100%' }}
              allowClear
              onChange={handleRoleFilter}
            >
              <Option value="HOSPITAL_ADMIN">Quản trị viên</Option>
              <Option value="DEPARTMENT_HEAD">Trưởng khoa</Option>
              <Option value="DOCTOR">Bác sĩ</Option>
              <Option value="NURSE">Y tá</Option>
              <Option value="PHARMACIST">Dược sĩ</Option>
              <Option value="LAB_TECHNICIAN">Kỹ thuật viên XN</Option>
              <Option value="RECEPTIONIST">Lễ tân</Option>
              <Option value="BILLING_STAFF">Kế toán</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              allowClear
              onChange={handleStatusFilter}
            >
              <Option value="ACTIVE">Hoạt động</Option>
              <Option value="INACTIVE">Không hoạt động</Option>
              <Option value="SUSPENDED">Tạm khóa</Option>
              <Option value="LOCKED">Bị khóa</Option>
            </Select>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={staffList}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhân viên`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default StaffList;
