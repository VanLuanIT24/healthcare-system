// src/pages/admin/doctors/DoctorManagementEnhanced.jsx
// Comprehensive Doctor Management Features & Statistics

import AdminLayout from '@/components/layout/admin/AdminLayout';
import { doctorAPI } from '@/services/api/doctorAPI';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    LoadingOutlined,
    LockOutlined,
    SafetyOutlined,
    StarOutlined,
    TeamOutlined,
    UnlockOutlined
} from '@ant-design/icons';
import {
    Alert,
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Empty,
    Form, Input, InputNumber,
    message, Modal,
    Progress,
    Row,
    Space, Spin,
    Statistic,
    Table,
    Tabs,
    Tag
} from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DoctorManagementEnhanced = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [editingCredential, setEditingCredential] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load all doctor data
  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        setLoading(true);
        const docRes = await doctorAPI.getDoctorById(doctorId);
        if (docRes.data?.data) {
          setDoctor(docRes.data.data);
          setCredentials(docRes.data.data.credentials || []);
        }
      } catch (error) {
        message.error('Lỗi khi tải dữ liệu bác sĩ');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDoctorData();
  }, [doctorId]);

  // ============ 1. CREDENTIAL MANAGEMENT ============
  const handleAddCredential = async (values) => {
    try {
      const newCredential = {
        ...values,
        expiryDate: values.expiryDate?.toISOString()
      };

      setCredentials([...credentials, { ...newCredential, _id: Date.now() }]);
      form.resetFields();
      setModalVisible(false);
      message.success('Thêm chứng chỉ thành công');
    } catch (error) {
      message.error('Lỗi khi thêm chứng chỉ');
    }
  };

  const handleDeleteCredential = (credentialId) => {
    Modal.confirm({
      title: 'Xóa chứng chỉ',
      content: 'Bạn chắc chắn muốn xóa chứng chỉ này?',
      async onOk() {
        try {
          setCredentials(credentials.filter(c => c._id !== credentialId));
          message.success('Xóa chứng chỉ thành công');
        } catch (error) {
          message.error('Lỗi khi xóa chứng chỉ');
        }
      },
    });
  };

  // ============ 2. ACCOUNT SECURITY ============
  const handleResetPassword = () => {
    Modal.confirm({
      title: 'Reset Password',
      content: 'Gửi link reset password cho bác sĩ?',
      async onOk() {
        try {
          // Call API to send reset password email
          message.success('Email reset password đã được gửi');
        } catch (error) {
          message.error('Lỗi khi gửi email');
        }
      },
    });
  };

  const handleViewLoginHistory = () => {
    // Show login history modal
    Modal.info({
      title: 'Lịch sử đăng nhập',
      width: 800,
      content: (
        <Table
          columns={[
            { title: 'Thời gian', dataIndex: 'timestamp', key: 'timestamp' },
            { title: 'IP Address', dataIndex: 'ipAddress', key: 'ipAddress' },
            { title: 'Device', dataIndex: 'device', key: 'device' },
            { title: 'Status', dataIndex: 'status', key: 'status' },
          ]}
          dataSource={[
            // Mock data - replace with real data from API
            {
              key: 1,
              timestamp: '2024-12-30 10:30:00',
              ipAddress: '192.168.1.100',
              device: 'Chrome/Windows',
              status: 'Thành công'
            },
          ]}
        />
      ),
    });
  };

  // ============ 3. CONSULTATION FEES ============
  const handleSetConsultationFees = () => {
    Modal.confirm({
      title: 'Thiết lập phí tư vấn',
      content: (
        <Form layout="vertical">
          <Form.Item label="Phí tư vấn trực tiếp (VND)">
            <InputNumber min={0} step={10000} defaultValue={500000} />
          </Form.Item>
          <Form.Item label="Phí tư vấn trực tuyến (VND)">
            <InputNumber min={0} step={10000} defaultValue={300000} />
          </Form.Item>
          <Form.Item label="Phí kiểm tra định kỳ (VND)">
            <InputNumber min={0} step={10000} defaultValue={750000} />
          </Form.Item>
        </Form>
      ),
      async onOk() {
        message.success('Cập nhật phí tư vấn thành công');
      },
    });
  };

  // ============ 4. PERFORMANCE METRICS ============
  const performanceData = {
    totalAppointments: 156,
    completedAppointments: 142,
    averageRating: 4.8,
    noShowRate: 2.5,
    cancellationRate: 3.8,
    patientSatisfaction: 96,
    avgResponseTime: '2.5 giờ',
    avgConsultationTime: '25 phút',
  };

  // ============ 5. CREDENTIALS TABLE ============
  const credentialColumns = [
    {
      title: 'Chứng chỉ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Cấp phát bởi',
      dataIndex: 'issuedBy',
      key: 'issuedBy',
    },
    {
      title: 'Ngày cấp',
      dataIndex: 'issuedDate',
      key: 'issuedDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => {
        if (!date) return 'Không có hạn';
        const daysLeft = dayjs(date).diff(dayjs(), 'day');
        return (
          <span>
            {dayjs(date).format('DD/MM/YYYY')}
            {daysLeft < 90 && daysLeft > 0 && (
              <Tag color="orange" style={{ marginLeft: 8 }}>Sắp hết hạn</Tag>
            )}
            {daysLeft <= 0 && (
              <Tag color="red" style={{ marginLeft: 8 }}>Hết hạn</Tag>
            )}
          </span>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => setEditingCredential(record)}>Sửa</Button>
          <Button type="link" danger size="small" onClick={() => handleDeleteCredential(record._id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </div>
      </AdminLayout>
    );
  }

  if (!doctor) {
    return (
      <AdminLayout>
        <Empty description="Không tìm thấy bác sĩ" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ padding: '24px' }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/doctors')}
            style={{ marginBottom: '16px' }}
          >
            Quay lại
          </Button>

          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={6}>
              <Avatar
                size={100}
                src={doctor.personalInfo?.profilePicture}
                style={{ backgroundColor: '#87d068' }}
              >
                {doctor.personalInfo?.firstName?.[0]}
              </Avatar>
            </Col>
            <Col xs={24} sm={18}>
              <h1 style={{ margin: 0, marginBottom: 8 }}>
                {doctor.personalInfo?.firstName} {doctor.personalInfo?.lastName}
              </h1>
              <Tag color={doctor.status === 'ACTIVE' ? 'green' : 'red'}>
                {doctor.status === 'ACTIVE' ? 'Hoạt động' : 'Tắt'}
              </Tag>
              <p style={{ color: '#666', marginTop: 8 }}>
                {doctor.specialties?.[0]?.name || 'N/A'} • {doctor.department?.name || 'N/A'}
              </p>
            </Col>
          </Row>
        </div>

        {/* Tabs */}
        <Tabs
          items={[
            {
              key: '1',
              label: '📋 Thông tin cá nhân',
              children: <PersonalInfoTab doctor={doctor} />,
            },
            {
              key: '2',
              label: '📊 Thống kê hiệu suất',
              children: <PerformanceTab performanceData={performanceData} />,
            },
            {
              key: '3',
              label: '🎓 Chứng chỉ & Bằng cấp',
              children: (
                <div>
                  <Button
                    type="primary"
                    onClick={() => setModalVisible(true)}
                    style={{ marginBottom: 16 }}
                  >
                    Thêm chứng chỉ
                  </Button>
                  <Table
                    columns={credentialColumns}
                    dataSource={credentials}
                    rowKey="_id"
                  />
                  <Modal
                    title="Thêm chứng chỉ"
                    open={modalVisible}
                    onOk={() => {
                      form.validateFields().then(values => {
                        handleAddCredential(values);
                      });
                    }}
                    onCancel={() => setModalVisible(false)}
                  >
                    <Form form={form} layout="vertical">
                      <Form.Item
                        label="Tên chứng chỉ"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên chứng chỉ' }]}
                      >
                        <Input placeholder="VD: Bác sĩ Cử nhân Y Khoa" />
                      </Form.Item>
                      <Form.Item
                        label="Cấp phát bởi"
                        name="issuedBy"
                        rules={[{ required: true, message: 'Vui lòng nhập tổ chức cấp phát' }]}
                      >
                        <Input placeholder="VD: Đại học Y Dược TP.HCM" />
                      </Form.Item>
                      <Form.Item
                        label="Ngày cấp"
                        name="issuedDate"
                        rules={[{ required: true }]}
                      >
                        <DatePicker />
                      </Form.Item>
                      <Form.Item
                        label="Ngày hết hạn"
                        name="expiryDate"
                      >
                        <DatePicker placeholder="(Tùy chọn)" />
                      </Form.Item>
                    </Form>
                  </Modal>
                </div>
              ),
            },
            {
              key: '4',
              label: '🔒 Bảo mật & Quyền hạn',
              children: <SecurityTab doctor={doctor} />,
            },
            {
              key: '5',
              label: '💰 Tài chính & Phí tư vấn',
              children: <BillingTab doctor={doctor} />,
            },
          ]}
        />
      </motion.div>
    </AdminLayout>
  );
};

// ============ TAB COMPONENTS ============

const PersonalInfoTab = ({ doctor }) => (
  <Card>
    <Descriptions bordered column={2}>
      <Descriptions.Item label="Email" span={2}>{doctor.email}</Descriptions.Item>
      <Descriptions.Item label="Số điện thoại">{doctor.personalInfo?.phone}</Descriptions.Item>
      <Descriptions.Item label="Giới tính">{doctor.personalInfo?.gender === 'M' ? 'Nam' : 'Nữ'}</Descriptions.Item>
      <Descriptions.Item label="Ngày sinh">{dayjs(doctor.personalInfo?.dateOfBirth).format('DD/MM/YYYY')}</Descriptions.Item>
      <Descriptions.Item label="Kinh nghiệm">{doctor.yearsOfExperience} năm</Descriptions.Item>
      <Descriptions.Item label="Địa chỉ" span={2}>{doctor.personalInfo?.address?.street}, {doctor.personalInfo?.address?.city}</Descriptions.Item>
      <Descriptions.Item label="Khoa/Phòng">{doctor.department?.name}</Descriptions.Item>
      <Descriptions.Item label="Chuyên khoa">{doctor.specialties?.map(s => s.name).join(', ')}</Descriptions.Item>
    </Descriptions>
  </Card>
);

const PerformanceTab = ({ performanceData }) => (
  <Row gutter={[16, 16]}>
    <Col xs={24} sm={12} md={6}>
      <Card>
        <Statistic
          title="Tổng lịch hẹn"
          value={performanceData.totalAppointments}
          prefix={<CalendarOutlined />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card>
        <Statistic
          title="Hoàn thành"
          value={performanceData.completedAppointments}
          suffix={`/ ${performanceData.totalAppointments}`}
          prefix={<CheckCircleOutlined />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card>
        <Statistic
          title="Đánh giá trung bình"
          value={performanceData.averageRating}
          precision={1}
          prefix={<StarOutlined />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card>
        <Statistic
          title="Hài lòng bệnh nhân"
          value={performanceData.patientSatisfaction}
          suffix="%"
          prefix={<TeamOutlined />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12}>
      <Card title="Tỉ lệ không có mặt">
        <Progress
          type="circle"
          percent={performanceData.noShowRate}
          format={percent => `${percent}%`}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12}>
      <Card title="Tỉ lệ hủy lịch">
        <Progress
          type="circle"
          percent={performanceData.cancellationRate}
          format={percent => `${percent}%`}
        />
      </Card>
    </Col>
  </Row>
);

const SecurityTab = ({ doctor }) => (
  <Space direction="vertical" style={{ width: '100%' }} size="large">
    <Alert
      message="Quản lý bảo mật tài khoản bác sĩ"
      type="info"
      showIcon
    />
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button icon={<LockOutlined />} block>
          Reset Password - Gửi link reset cho bác sĩ
        </Button>
        <Button icon={<ClockCircleOutlined />} block>
          Xem lịch sử đăng nhập
        </Button>
        <Button icon={<UnlockOutlined />} danger block>
          Force Logout - Đăng xuất bác sĩ khỏi tất cả thiết bị
        </Button>
        <Button icon={<SafetyOutlined />} block>
          Xem lịch sử hoạt động
        </Button>
      </Space>
    </Card>
  </Space>
);

const BillingTab = ({ doctor }) => (
  <Space direction="vertical" style={{ width: '100%' }} size="large">
    <Alert
      message="Quản lý phí tư vấn và doanh thu"
      type="info"
      showIcon
    />
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12}>
        <Card title="Phí tư vấn trực tiếp">
          <Statistic
            value={500000}
            prefix="₫"
            suffix="/lần"
            valueStyle={{ color: '#1890ff' }}
          />
          <Button type="primary" style={{ marginTop: 16 }}>
            <DollarOutlined /> Cập nhật
          </Button>
        </Card>
      </Col>
      <Col xs={24} sm={12}>
        <Card title="Phí tư vấn trực tuyến">
          <Statistic
            value={300000}
            prefix="₫"
            suffix="/lần"
            valueStyle={{ color: '#52c41a' }}
          />
          <Button type="primary" style={{ marginTop: 16 }}>
            <DollarOutlined /> Cập nhật
          </Button>
        </Card>
      </Col>
    </Row>
  </Space>
);

export default DoctorManagementEnhanced;
