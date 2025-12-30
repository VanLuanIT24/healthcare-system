// src/pages/doctor/MedicalRecordDetail.jsx - Chi tiết hồ sơ bệnh nhân
import { useAuth } from '@/contexts/AuthContext';
import { appointmentAPI, userAPI } from '@/services/api';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DownloadOutlined,
  FileTextOutlined,
  HeartOutlined,
  LoadingOutlined,
  PhoneOutlined,
  MailOutlined,
  FileOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Row,
  Space,
  Spin,
  Tabs,
  Tag,
  Table,
  Statistic,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const MedicalRecordDetail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Load chi tiết bệnh nhân
  const loadPatientDetail = async () => {
    try {
      if (!patientId || !user?._id) return;

      setLoading(true);

      // Lấy thông tin bệnh nhân
      const patientRes = await userAPI.getUserById(patientId);
      const patientData = patientRes.data?.data || patientRes.data;
      setPatient(patientData);

      // Lấy appointments của bệnh nhân từ bác sĩ hiện tại
      const appointmentRes = await appointmentAPI.getDoctorAppointments(
        user._id,
        { limit: 1000 }
      );

      // Handle response structure
      let allAppointments = [];
      if (appointmentRes.data?.items) {
        allAppointments = appointmentRes.data.items;
      } else if (appointmentRes.data?.data?.items) {
        allAppointments = appointmentRes.data.data.items;
      } else if (Array.isArray(appointmentRes.data)) {
        allAppointments = appointmentRes.data;
      }

      // Lọc appointments của bệnh nhân này
      const patientAppointments = allAppointments.filter((apt) => {
        // Handle both nested patient object and flattened patientId field
        const patientData = apt.patient || apt.patientId;
        return patientData?._id === patientId;
      });
      setAppointments(patientAppointments);
    } catch (error) {
      console.error('Error loading patient detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId && user?._id) {
      loadPatientDetail();
    }
  }, [patientId, user?._id]);

  if (loading) {
    return (
      <DoctorLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          />
          <div style={{ marginTop: '16px', color: '#1890ff' }}>Đang tải hồ sơ bệnh nhân...</div>
        </div>
      </DoctorLayout>
    );
  }

  if (!patient) {
    return (
      <DoctorLayout>
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/doctor/medical-records')}
            style={{ marginBottom: '20px' }}
          >
            Quay lại
          </Button>
          <Card>
            <Empty description="Không tìm thấy bệnh nhân" />
          </Card>
        </div>
      </DoctorLayout>
    );
  }

  // Tab: Overview
  const OverviewTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Card */}
      <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={4}>
            <Avatar
              size={100}
              src={patient.avatar}
              style={{ backgroundColor: '#1890ff' }}
            >
              {patient.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Col>
          <Col xs={24} sm={20}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>
                  {patient.name}
                </h2>
                <Space>
                  <Button
                    icon={<MessageOutlined />}
                    onClick={() => navigate('/doctor/messages', {
                      state: { patientId: patient._id, patientName: patient.name }
                    })}
                  >
                    Nhắn tin
                  </Button>
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    onClick={() => navigate('/doctor/prescriptions', {
                      state: { patientId: patient._id, patientName: patient.name }
                    })}
                  >
                    Kê đơn
                  </Button>
                </Space>
              </div>
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: '8px' }}>
                    <MailOutlined /> {patient.email}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <PhoneOutlined /> {patient.phone || 'N/A'}
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: '8px' }}>
                    🎂 {patient.dateOfBirth ? dayjs(patient.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}
                  </div>
                  <div>
                    👤 Giới tính: {patient.gender === 'M' ? 'Nam' : patient.gender === 'F' ? 'Nữ' : 'N/A'}
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Patient Info Grid */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: '8px' }}>
            <Statistic
              title="Tổng lần khám"
              value={appointments.length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: '8px' }}>
            <Statistic
              title="Tình trạng"
              value={
                patient.isInpatient
                  ? 'Nội trú'
                  : 'Ngoài viện'
              }
              valueStyle={{ color: patient.isInpatient ? '#ff4d4f' : '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: '8px' }}>
            <Statistic
              title="Thành viên từ"
              value={dayjs(patient.createdAt).format('DD/MM/YYYY')}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Medical Info */}
      <Card style={{ marginTop: '20px', borderRadius: '8px' }}>
        <h3>📋 Thông tin y tế</h3>
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Descriptions
              items={[
                {
                  label: 'Nhóm máu',
                  children: patient.bloodGroup || 'N/A',
                },
                {
                  label: 'Chiều cao',
                  children: patient.height ? `${patient.height} cm` : 'N/A',
                },
                {
                  label: 'Cân nặng',
                  children: patient.weight ? `${patient.weight} kg` : 'N/A',
                },
              ]}
              column={1}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Descriptions
              items={[
                {
                  label: 'Dị ứng',
                  children: patient.allergies && patient.allergies.length > 0
                    ? patient.allergies.join(', ')
                    : 'Không',
                },
                {
                  label: 'Bệnh mãn tính',
                  children: patient.chronicDiseases && patient.chronicDiseases.length > 0
                    ? patient.chronicDiseases.join(', ')
                    : 'Không',
                },
              ]}
              column={1}
            />
          </Col>
        </Row>
      </Card>

      {/* Contact & Address */}
      <Card style={{ marginTop: '20px', borderRadius: '8px' }}>
        <h3>📍 Thông tin liên hệ</h3>
        <Descriptions
          items={[
            {
              label: 'Địa chỉ',
              children: patient.address || 'N/A',
              span: 3,
            },
            {
              label: 'Thành phố',
              children: patient.city || 'N/A',
            },
            {
              label: 'Mã bưu chính',
              children: patient.zipCode || 'N/A',
            },
          ]}
        />
      </Card>
    </motion.div>
  );

  // Tab: Visit History
  const VisitHistoryTab = () => {
    const columns = [
      {
        title: 'Ngày khám',
        dataIndex: 'date',
        key: 'date',
        render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        width: 150,
      },
      {
        title: 'Loại',
        dataIndex: 'type',
        key: 'type',
        render: (type) => (
          <Tag color={type === 'inpatient' ? 'red' : 'blue'}>
            {type === 'inpatient' ? 'Nội trú' : 'Ngoài viện'}
          </Tag>
        ),
        width: 120,
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          const statusMap = {
            pending: { color: 'orange', label: 'Chờ xử lý' },
            confirmed: { color: 'blue', label: 'Xác nhận' },
            completed: { color: 'green', label: 'Hoàn thành' },
            cancelled: { color: 'red', label: 'Hủy' },
          };
          const config = statusMap[status] || { color: 'default', label: status };
          return <Tag color={config.color}>{config.label}</Tag>;
        },
        width: 120,
      },
      {
        title: 'Ghi chú',
        dataIndex: 'notes',
        key: 'notes',
        render: (notes) => notes || '-',
      },
      {
        title: 'Hành động',
        key: 'action',
        render: (_, record) => (
          <Button type="link" size="small">
            Chi tiết
          </Button>
        ),
        width: 100,
      },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {appointments.length === 0 ? (
          <Empty description="Không có lịch sử khám" />
        ) : (
          <Table
            columns={columns}
            dataSource={appointments.map((apt, idx) => ({
              ...apt,
              key: apt._id || idx,
            }))}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        )}
      </motion.div>
    );
  };

  // Tab: Lab Results
  const LabResultsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Empty
        description="Chưa có kết quả xét nghiệm"
        style={{ padding: '40px' }}
      />
    </motion.div>
  );

  // Tab: Prescriptions
  const PrescriptionsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Empty
        description="Chưa có đơn thuốc"
        style={{ padding: '40px' }}
      />
    </motion.div>
  );

  // Tab: Inpatient Info (nếu bệnh nhân là nội trú)
  const InpatientInfoTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {patient.isInpatient ? (
        <Card style={{ borderRadius: '8px' }}>
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Descriptions
                items={[
                  {
                    label: 'Giường bệnh',
                    children: patient.bedNumber || 'N/A',
                  },
                  {
                    label: 'Phòng',
                    children: patient.roomNumber || 'N/A',
                  },
                  {
                    label: 'Khoa',
                    children: patient.department?.name || 'N/A',
                  },
                ]}
                column={1}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Descriptions
                items={[
                  {
                    label: 'Ngày nhập viện',
                    children: patient.admissionDate
                      ? dayjs(patient.admissionDate).format('DD/MM/YYYY')
                      : 'N/A',
                  },
                  {
                    label: 'Ngày dự kiến xuất viện',
                    children: patient.expectedDischargeDate
                      ? dayjs(patient.expectedDischargeDate).format('DD/MM/YYYY')
                      : 'N/A',
                  },
                ]}
                column={1}
              />
            </Col>
          </Row>
        </Card>
      ) : (
        <Empty description="Bệnh nhân không phải nội trú" />
      )}
    </motion.div>
  );

  // Prepare tabs
  const tabItems = [
    {
      key: 'overview',
      label: '📋 Tổng quan',
      children: <OverviewTab />,
    },
    {
      key: 'visits',
      label: `📅 Lịch sử khám (${appointments.length})`,
      children: <VisitHistoryTab />,
    },
    {
      key: 'labs',
      label: '🧪 Kết quả xét nghiệm',
      children: <LabResultsTab />,
    },
    {
      key: 'prescriptions',
      label: '💊 Đơn thuốc',
      children: <PrescriptionsTab />,
    },
  ];

  // Chỉ thêm Inpatient tab nếu bệnh nhân là nội trú
  if (patient.isInpatient) {
    tabItems.push({
      key: 'inpatient',
      label: '🏥 Thông tin nội trú',
      children: <InpatientInfoTab />,
    });
  }

  return (
    <DoctorLayout>
      <div
        style={{
          padding: '24px',
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        {/* Back Button */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/doctor/medical-records')}
          style={{ marginBottom: '20px' }}
        >
          Quay lại danh sách
        </Button>

        {/* Tabs */}
        <Card style={{ borderRadius: '8px' }}>
          <Tabs
            items={tabItems}
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
          />
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default MedicalRecordDetail;
