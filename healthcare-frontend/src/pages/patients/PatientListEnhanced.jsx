// 👥 Enhanced Patient List with Full Backend Integration
import {
    CalendarOutlined,
    EditOutlined,
    EyeOutlined,
    FileTextOutlined,
    HomeOutlined,
    MailOutlined,
    MedicineBoxOutlined,
    PhoneOutlined,
    PlusOutlined,
    SearchOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Drawer,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    Tooltip,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import patientAPI from '../../services/api/patientAPI';
import designSystem from '../../theme/designSystem';
import './PatientManagement.css';

const { Search } = Input;
const { Option } = Select;
const { colors } = designSystem;

const PatientListEnhanced = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    gender: '',
    bloodType: '',
  });
  const [stats, setStats] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
    loadStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };
      const response = await patientAPI.searchPatients(params);
      setPatients(response.data?.patients || response.data?.data || []);
      setPagination({
        ...pagination,
        total: response.data?.total || response.data?.pagination?.total || 0,
      });
    } catch (error) {
      message.error('Không thể tải danh sách bệnh nhân');
      console.error('Load patients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await patientAPI.getPatientStatistics();
      setStats(response.data || {});
    } catch (error) {
      console.error('Failed to load patient stats');
    }
  };

  const handleRegisterPatient = async (values) => {
    try {
      await patientAPI.registerPatient({
        ...values,
        dateOfBirth: values.dateOfBirth?.toISOString(),
      });
      message.success('Đăng ký bệnh nhân thành công');
      setRegisterModalVisible(false);
      form.resetFields();
      loadPatients();
      loadStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  const handleViewDetails = async (patientId) => {
    try {
      const response = await patientAPI.getPatientById(patientId);
      setSelectedPatient(response.data);
      setDrawerVisible(true);
    } catch (error) {
      message.error('Không thể tải thông tin bệnh nhân');
    }
  };

  const handleAdmit = (patientId) => {
    Modal.confirm({
      title: 'Nhập viện',
      content: 'Xác nhận nhập viện cho bệnh nhân này?',
      okText: 'Nhập viện',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await patientAPI.admitPatient(patientId, {
            admissionDate: new Date().toISOString(),
            department: 'GENERAL',
            ward: 'Ward 1',
            bed: 'Bed 1',
          });
          message.success('Nhập viện thành công');
          loadPatients();
        } catch (error) {
          message.error('Nhập viện thất bại');
        }
      },
    });
  };

  const handleDischarge = (patientId) => {
    Modal.confirm({
      title: 'Xuất viện',
      content: 'Xác nhận xuất viện cho bệnh nhân này?',
      okText: 'Xuất viện',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await patientAPI.dischargePatient(patientId, {
            dischargeDate: new Date().toISOString(),
            dischargeSummary: 'Patient discharged in good condition',
          });
          message.success('Xuất viện thành công');
          loadPatients();
        } catch (error) {
          message.error('Xuất viện thất bại');
        }
      },
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      ACTIVE: 'green',
      ADMITTED: 'blue',
      DISCHARGED: 'default',
      DECEASED: 'red',
    };
    return statusColors[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      ACTIVE: 'Đang điều trị',
      ADMITTED: 'Nội trú',
      DISCHARGED: 'Đã xuất viện',
      DECEASED: 'Đã mất',
    };
    return statusTexts[status] || status;
  };

  const columns = [
    {
      title: 'Mã BN',
      dataIndex: 'patientId',
      key: 'patientId',
      width: 120,
      fixed: 'left',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Họ và tên',
      key: 'fullName',
      width: 200,
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
            <div style={{ fontSize: 12, color: colors.text.secondary }}>
              {record.gender === 'male' ? 'Nam' : record.gender === 'female' ? 'Nữ' : 'Khác'} •{' '}
              {record.dateOfBirth ? moment().diff(record.dateOfBirth, 'years') + ' tuổi' : 'N/A'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div>
          <div>
            <PhoneOutlined style={{ marginRight: 8, color: colors.primary[500] }} />
            {record.phone || 'N/A'}
          </div>
          <div style={{ fontSize: 12, color: colors.text.secondary }}>
            <MailOutlined style={{ marginRight: 8 }} />
            {record.email || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      width: 120,
      render: (date) => (date ? moment(date).format('DD/MM/YYYY') : 'N/A'),
      sorter: (a, b) => moment(a.dateOfBirth).unix() - moment(b.dateOfBirth).unix(),
    },
    {
      title: 'Nhóm máu',
      dataIndex: 'bloodType',
      key: 'bloodType',
      width: 100,
      render: (bloodType) => bloodType && <Tag color="red">{bloodType}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => (
        <Badge status={status === 'ACTIVE' ? 'success' : 'default'} text={getStatusText(status)} />
      ),
      filters: [
        { text: 'Đang điều trị', value: 'ACTIVE' },
        { text: 'Nội trú', value: 'ADMITTED' },
        { text: 'Đã xuất viện', value: 'DISCHARGED' },
      ],
    },
    {
      title: 'Đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record._id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/patients/${record._id}/edit`)}
            />
          </Tooltip>
          {record.status === 'ACTIVE' && (
            <Button type="link" size="small" onClick={() => handleAdmit(record._id)}>
              Nhập viện
            </Button>
          )}
          {record.status === 'ADMITTED' && (
            <Button type="link" size="small" onClick={() => handleDischarge(record._id)}>
              Xuất viện
            </Button>
          )}
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
            <UserOutlined style={{ marginRight: 12, color: colors.primary[500] }} />
            Quản lý bệnh nhân
          </h1>
          <p className="dashboard-subtitle">Danh sách và thông tin bệnh nhân</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setRegisterModalVisible(true)} size="large">
          Đăng ký bệnh nhân mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} className="staggered-cards">
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng bệnh nhân</span>}
              value={stats.totalPatients || 0}
              prefix={<UserOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Đang điều trị</span>}
              value={stats.activePatients || 0}
              prefix={<MedicineBoxOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.info[500]}, ${colors.info[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Nội trú</span>}
              value={stats.admittedPatients || 0}
              prefix={<HomeOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.warning[500]}, ${colors.warning[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Mới tháng này</span>}
              value={stats.newPatientsThisMonth || 0}
              prefix={<CalendarOutlined style={{ color: 'white' }} />}
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
              placeholder="Tìm theo tên, mã BN, số điện thoại..."
              allowClear
              enterButton
              onSearch={(value) => {
                setFilters({ ...filters, search: value });
                setPagination({ ...pagination, current: 1 });
              }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Giới tính"
              allowClear
              onChange={(value) => setFilters({ ...filters, gender: value || '' })}
            >
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Nhóm máu"
              allowClear
              onChange={(value) => setFilters({ ...filters, bloodType: value || '' })}
            >
              <Option value="A+">A+</Option>
              <Option value="A-">A-</Option>
              <Option value="B+">B+</Option>
              <Option value="B-">B-</Option>
              <Option value="O+">O+</Option>
              <Option value="O-">O-</Option>
              <Option value="AB+">AB+</Option>
              <Option value="AB-">AB-</Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="ACTIVE">Đang điều trị</Option>
              <Option value="ADMITTED">Nội trú</Option>
              <Option value="DISCHARGED">Đã xuất viện</Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Button onClick={loadPatients} loading={loading} block>
              Tìm kiếm
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Patient Table */}
      <Card variant="borderless">
        <Table
          columns={columns}
          dataSource={patients}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1200 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng số ${total} bệnh nhân`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Card>

      {/* Register Patient Modal */}
      <Modal
        title="Đăng ký bệnh nhân mới"
        open={registerModalVisible}
        onCancel={() => {
          setRegisterModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleRegisterPatient}>
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="0912345678" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Nhóm máu" name="bloodType">
                <Select placeholder="Chọn nhóm máu">
                  <Option value="A+">A+</Option>
                  <Option value="A-">A-</Option>
                  <Option value="B+">B+</Option>
                  <Option value="B-">B-</Option>
                  <Option value="O+">O+</Option>
                  <Option value="O-">O-</Option>
                  <Option value="AB+">AB+</Option>
                  <Option value="AB-">AB-</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Địa chỉ" name={['address', 'street']}>
            <Input placeholder="Số nhà, tên đường" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Phường/Xã" name={['address', 'ward']}>
                <Input placeholder="Phường/Xã" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Quận/Huyện" name={['address', 'district']}>
                <Input placeholder="Quận/Huyện" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Tỉnh/Thành phố" name={['address', 'city']}>
                <Input placeholder="Tỉnh/Thành phố" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setRegisterModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Đăng ký
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Patient Details Drawer */}
      <Drawer
        title="Thông tin bệnh nhân"
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedPatient && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={100}
                src={selectedPatient.profilePicture}
                icon={<UserOutlined />}
                style={{ backgroundColor: colors.primary[500] }}
              />
              <h2 style={{ marginTop: 16, marginBottom: 4 }}>{selectedPatient.fullName}</h2>
              <Tag color={getStatusColor(selectedPatient.status)}>{getStatusText(selectedPatient.status)}</Tag>
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Mã bệnh nhân">
                <Tag color="blue">{selectedPatient.patientId}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {selectedPatient.dateOfBirth ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {selectedPatient.gender === 'male' ? 'Nam' : selectedPatient.gender === 'female' ? 'Nữ' : 'Khác'}
              </Descriptions.Item>
              <Descriptions.Item label="Nhóm máu">
                {selectedPatient.bloodType && <Tag color="red">{selectedPatient.bloodType}</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <PhoneOutlined style={{ marginRight: 8 }} />
                {selectedPatient.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined style={{ marginRight: 8 }} />
                {selectedPatient.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedPatient.address
                  ? `${selectedPatient.address.street}, ${selectedPatient.address.ward}, ${selectedPatient.address.district}, ${selectedPatient.address.city}`
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đăng ký">
                {moment(selectedPatient.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'center' }}>
                <Button icon={<FileTextOutlined />} onClick={() => navigate(`/patients/${selectedPatient._id}`)}>
                  Xem hồ sơ đầy đủ
                </Button>
                <Button type="primary" icon={<CalendarOutlined />} onClick={() => navigate(`/appointments/schedule?patientId=${selectedPatient._id}`)}>
                  Đặt lịch hẹn
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PatientListEnhanced;
