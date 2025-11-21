import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  Row,
  Col,
  Statistic,
  Tooltip,
  Divider,
  DatePicker,
  InputNumber
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
  IdcardOutlined,
  MedicineBoxOutlined,
  LogoutOutlined,
  LoginOutlined
} from '@ant-design/icons';
import { apiClient } from '../utils/api';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

const PatientManagement = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admitted: 0
  });

  // Fetch patients
  useEffect(() => {
    fetchPatients();
  }, [pagination.current, pagination.pageSize, searchText, filterStatus]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(searchText && { search: searchText }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      };

      const response = await apiClient.get('/patients/search', { params });

      if (response.data.success) {
        const patientsData = response.data.data.patients || [];
        setPatients(patientsData);
        setPagination({
          ...pagination,
          total: response.data.data.total || patientsData.length
        });

        // Calculate stats
        setStats({
          total: patientsData.length,
          active: patientsData.filter(p => p.status === 'ACTIVE').length,
          admitted: patientsData.filter(p => p.admissionStatus === 'ADMITTED').length
        });
      }
    } catch (err) {
      message.error('Không thể tải danh sách bệnh nhân');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setDrawerVisible(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setEditMode(true);
    form.setFieldsValue({
      firstName: patient.personalInfo?.firstName,
      lastName: patient.personalInfo?.lastName,
      phone: patient.personalInfo?.phone,
      email: patient.email,
      dateOfBirth: patient.personalInfo?.dateOfBirth ? dayjs(patient.personalInfo.dateOfBirth) : null,
      gender: patient.personalInfo?.gender
    });
    setModalVisible(true);
  };

  const allowedRoles = ['RECEPTIONIST', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD'];
  const canCreatePatient = !!user && allowedRoles.includes(user.role);

  const handleCreatePatient = () => {
    if (!canCreatePatient) {
      message.error('Bạn không có quyền tạo tài khoản bệnh nhân');
      return;
    }
    setSelectedPatient(null);
    setEditMode(false);
    form.resetFields();
    setModalVisible(true);
  };

  const handleAdmitPatient = async (patientId) => {
    Modal.confirm({
      title: 'Nhập viện',
      content: 'Bạn có chắc chắn muốn nhập viện cho bệnh nhân này?',
      okText: 'Nhập viện',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.post(`/patients/${patientId}/admit`, {
            admissionDate: new Date().toISOString(),
            reason: 'Nhập viện từ giao diện quản lý'
          });
          message.success('Nhập viện thành công');
          await fetchPatients();
        } catch (err) {
          message.error('Không thể nhập viện');
        }
      }
    });
  };

  const handleDischargePatient = async (patientId) => {
    Modal.confirm({
      title: 'Xuất viện',
      content: 'Bạn có chắc chắn muốn xuất viện cho bệnh nhân này?',
      okText: 'Xuất viện',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.post(`/patients/${patientId}/discharge`, {
            dischargeDate: new Date().toISOString(),
            reason: 'Xuất viện từ giao diện quản lý'
          });
          message.success('Xuất viện thành công');
          await fetchPatients();
        } catch (err) {
          message.error('Không thể xuất viện');
        }
      }
    });
  };

  const handleSubmit = async (values) => {
    try {
      const userData = {
        email: values.email,
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
          gender: values.gender
        }
      };

      if (editMode && selectedPatient) {
        // Use /users/:id endpoint to update profile (backend user routes handle patient data)
        await apiClient.put(`/users/${selectedPatient._id}`, {
          personalInfo: userData.personalInfo
        });
        message.success('Cập nhật bệnh nhân thành công');
      } else {
        await apiClient.post('/users', {
          ...userData,
          role: 'PATIENT',
          password: values.password || 'DefaultPass123!@',
          confirmPassword: values.password || 'DefaultPass123!@'
        });
        message.success('Tạo bệnh nhân thành công');
      }

      setModalVisible(false);
      form.resetFields();
      fetchPatients();
    } catch (err) {
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
      render: (text) => (
        <Space>
          <PhoneOutlined style={{ color: '#faad14' }} />
          <span>{text || '-'}</span>
        </Space>
      )
    },
    {
      title: 'Giới tính',
      dataIndex: ['personalInfo', 'gender'],
      key: 'gender',
      render: (gender) => {
        const genderMap = {
          MALE: { text: 'Nam', color: 'blue' },
          FEMALE: { text: 'Nữ', color: 'magenta' },
          OTHER: { text: 'Khác', color: 'default' }
        };
        const config = genderMap[gender] || { text: gender, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          ACTIVE: { color: 'success', text: 'Hoạt động' },
          INACTIVE: { color: 'error', text: 'Không hoạt động' },
          SUSPENDED: { color: 'warning', text: 'Tạm khóa' }
        };
        return <Badge status={config[status]?.color} text={config[status]?.text || status} />;
      }
    },
    {
      title: 'Viện',
      dataIndex: 'admissionStatus',
      key: 'admissionStatus',
      render: (status) => {
        const statusMap = {
          ADMITTED: { text: 'Đã nhập viện', color: 'warning' },
          DISCHARGED: { text: 'Đã xuất viện', color: 'success' },
          PENDING: { text: 'Chờ xử lý', color: 'default' }
        };
        const config = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 300,
      render: (_, record) => (
        <Space wrap>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewPatient(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditPatient(record)}
            />
          </Tooltip>
          {record.admissionStatus !== 'ADMITTED' && (
            <Tooltip title="Nhập viện">
              <Button
                icon={<LoginOutlined />}
                size="small"
                onClick={() => handleAdmitPatient(record._id)}
                style={{ color: '#faad14' }}
              />
            </Tooltip>
          )}
          {record.admissionStatus === 'ADMITTED' && (
            <Tooltip title="Xuất viện">
              <Button
                icon={<LogoutOutlined />}
                size="small"
                onClick={() => handleDischargePatient(record._id)}
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  return (
    <div>
      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng bệnh nhân"
              value={stats.total}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hoạt động"
              value={stats.active}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang nhập viện"
              value={stats.admitted}
              prefix={<MedicineBoxOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search & Filter */}
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
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">Tất cả</Option>
              <Option value="ACTIVE">Hoạt động</Option>
              <Option value="INACTIVE">Không hoạt động</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchPatients}>
              Làm mới
            </Button>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreatePatient}
            disabled={!canCreatePatient}
            title={!canCreatePatient ? 'Bạn không có quyền tạo bệnh nhân' : ''}
          >
            Thêm bệnh nhân
          </Button>
        </Space>
      </Card>

      {/* Patients Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={patients}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Patient Detail Drawer */}
      <Drawer
        title="Chi tiết bệnh nhân"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedPatient && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Email">{selectedPatient.email}</Descriptions.Item>
            <Descriptions.Item label="Họ tên">
              {selectedPatient.personalInfo?.firstName} {selectedPatient.personalInfo?.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedPatient.personalInfo?.phone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {selectedPatient.personalInfo?.gender || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {selectedPatient.personalInfo?.dateOfBirth
                ? new Date(selectedPatient.personalInfo.dateOfBirth).toLocaleDateString('vi-VN')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Badge
                status={selectedPatient.status === 'ACTIVE' ? 'success' : 'error'}
                text={selectedPatient.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái nhập viện">
              <Tag color={selectedPatient.admissionStatus === 'ADMITTED' ? 'warning' : 'success'}>
                {selectedPatient.admissionStatus === 'ADMITTED' ? 'Đã nhập viện' : 'Chưa nhập viện'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {selectedPatient.createdAt ? new Date(selectedPatient.createdAt).toLocaleString('vi-VN') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* Create/Edit Patient Modal */}
      <Modal
        title={editMode ? 'Chỉnh sửa bệnh nhân' : 'Thêm bệnh nhân mới'}
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
            <Input disabled={editMode} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstName"
                label="Họ"
                rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastName"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input />
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
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Select>
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editMode ? 'Cập nhật' : 'Tạo'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PatientManagement;
