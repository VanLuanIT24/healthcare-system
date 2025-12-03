import {
    CalendarOutlined,
    EditOutlined,
    ExportOutlined,
    EyeOutlined,
    MailOutlined,
    MoreOutlined,
    PhoneOutlined,
    PlusOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Dropdown,
    Input,
    message,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../../../services/adminApi';

const { Title, Text } = Typography;
const { Option } = Select;

const PatientList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: null,
    search: ''
  });

  useEffect(() => {
    fetchPatients();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      // SỬ DỤNG API SERVICE
      const response = await patientApi.search({
        keyword: filters.search,
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      // XỬ LÝ RESPONSE
      if (response.success && response.data) {
        setPatients(response.data.patients || response.data || []);
        setPagination({
          ...pagination,
          total: response.data.pagination?.totalItems || response.data.pagination?.total || 0
        });
      }

    } catch (error) {
      console.error('❌ [PATIENT LIST] Fetch error:', error);
      message.error(
        error.response?.data?.message || error.message || 'Không thể tải danh sách bệnh nhân'
      );
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const getMockPatients = () => [
    {
      _id: '1',
      personalInfo: {
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        email: 'nguyenvana@example.com',
        phone: '0123456789',
        dateOfBirth: '1990-05-15',
        gender: 'Nam',
        avatar: null
      },
      role: 'PATIENT',
      status: 'active',
      medicalRecordNumber: 'MRN001',
      createdAt: '2025-01-10'
    },
    {
      _id: '2',
      personalInfo: {
        firstName: 'Trần',
        lastName: 'Thị B',
        email: 'tranthib@example.com',
        phone: '0987654321',
        dateOfBirth: '1985-08-20',
        gender: 'Nữ',
        avatar: null
      },
      role: 'PATIENT',
      status: 'active',
      medicalRecordNumber: 'MRN002',
      createdAt: '2025-02-15'
    },
    {
      _id: '3',
      personalInfo: {
        firstName: 'Lê',
        lastName: 'Văn C',
        email: 'levanc@example.com',
        phone: '0369852147',
        dateOfBirth: '2000-12-10',
        gender: 'Nam',
        avatar: null
      },
      role: 'PATIENT',
      status: 'active',
      medicalRecordNumber: 'MRN003',
      createdAt: '2025-03-20'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'success',
      INACTIVE: 'default',
      SUSPENDED: 'warning'
    };
    return colors[status] || 'default';
  };

  const calculateAge = (dob) => {
    if (!dob) return '-';
    return moment().diff(moment(dob), 'years');
  };

  const columns = [
    {
      title: 'Mã BN',
      dataIndex: 'patientId',
      key: 'patientId',
      width: 120,
      render: (_, record) => (
        <Text strong style={{ color: '#1890ff' }}>
          {record._id?.substring(0, 8).toUpperCase()}
        </Text>
      )
    },
    {
      title: 'Thông tin bệnh nhân',
      key: 'patient',
      render: (record) => (
        <Space>
          <Avatar 
            size={40} 
            src={record.personalInfo?.profilePicture} 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          >
            {record.personalInfo?.firstName?.[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.personalInfo?.firstName} {record.personalInfo?.lastName}
            </div>
            <Space size="small">
              <PhoneOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.personalInfo?.phone || 'Chưa cập nhật'}
              </Text>
            </Space>
          </div>
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Space>
          <MailOutlined style={{ color: '#8c8c8c' }} />
          <Text>{email}</Text>
        </Space>
      )
    },
    {
      title: 'Tuổi / Giới tính',
      key: 'ageGender',
      render: (record) => (
        <div>
          <div>{calculateAge(record.personalInfo?.dateOfBirth)} tuổi</div>
          <Tag color={record.personalInfo?.gender === 'MALE' ? 'blue' : 'pink'} size="small">
            {record.personalInfo?.gender === 'MALE' ? 'Nam' : 
             record.personalInfo?.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
          </Tag>
        </div>
      )
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: '#8c8c8c' }} />
          <Text>{moment(date).format('DD/MM/YYYY')}</Text>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Hoạt động', value: 'ACTIVE' },
        { text: 'Không hoạt động', value: 'INACTIVE' },
        { text: 'Tạm khóa', value: 'SUSPENDED' }
      ],
      render: (status) => (
        <Badge 
          status={status === 'ACTIVE' ? 'success' : 'default'} 
          text={
            status === 'ACTIVE' ? 'Hoạt động' : 
            status === 'INACTIVE' ? 'Không hoạt động' : 'Tạm khóa'
          } 
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            label: 'Xem chi tiết',
            icon: <EyeOutlined />,
            onClick: () => navigate(`/admin/patients/${record._id}`)
          },
          {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <EditOutlined />,
            onClick: () => navigate(`/admin/patients/${record._id}/edit`)
          },
          {
            type: 'divider'
          },
          {
            key: 'medical',
            label: 'Hồ sơ bệnh án',
            onClick: () => navigate(`/admin/patients/${record._id}/medical-records`)
          },
          {
            key: 'appointments',
            label: 'Lịch hẹn',
            onClick: () => navigate(`/admin/patients/${record._id}/appointments`)
          },
          {
            key: 'billing',
            label: 'Hóa đơn',
            onClick: () => navigate(`/admin/patients/${record._id}/billing`)
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
                Quản lý bệnh nhân
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
                  onClick={() => navigate('/admin/patients/create')}
                >
                  Đăng ký bệnh nhân
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Tìm kiếm theo tên, SĐT, mã BN..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
            />
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
            </Select>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={patients}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bệnh nhân`,
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

export default PatientList;
