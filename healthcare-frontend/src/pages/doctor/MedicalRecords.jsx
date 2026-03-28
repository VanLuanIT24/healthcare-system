// src/pages/doctor/MedicalRecords.jsx - Hồ sơ bệnh nhân (Chỉ hiển thị bệnh nhân của bác sĩ)
import { useAuth } from '@/contexts/AuthContext';
import { appointmentAPI } from '@/services/api';
import {
  ClockCircleOutlined,
  EyeOutlined,
  HomeOutlined,
  LoadingOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Empty,
  List,
  Segmented,
  Space,
  Spin,
  Tag,
  Input,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const MedicalRecords = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');

  // Load bệnh nhân của bác sĩ từ appointments
  const loadDoctorPatients = async () => {
    try {
      if (!user?._id) {
        console.log('User ID not available yet');
        return;
      }

      setLoading(true);
      // Lấy tất cả appointments của bác sĩ
      const res = await appointmentAPI.getDoctorAppointments(user._id, {
        limit: 1000,
      });

      console.log('API Response:', res);

      // Handle response structure - could be data.items, data.data.items, or just data
      let appointments = [];
      if (res.data?.items) {
        appointments = res.data.items;
      } else if (res.data?.data?.items) {
        appointments = res.data.data.items;
      } else if (Array.isArray(res.data)) {
        appointments = res.data;
      }

      console.log('Appointments loaded:', appointments.length);

      // Nhóm bệnh nhân duy nhất và lấy appointment gần nhất
      const patientMap = new Map();

      appointments.forEach((appointment) => {
        // Handle both nested patient object and flattened patientId field
        const patientData = appointment.patient || appointment.patientId;
        const patientId = patientData?._id;

        if (!patientId) {
          console.warn('No patient ID found in appointment:', appointment);
          return;
        }

        const existing = patientMap.get(patientId);

        // Giữ appointment mới nhất cho mỗi bệnh nhân
        if (
          !existing ||
          new Date(appointment.appointmentDate) > new Date(existing.appointmentDate)
        ) {
          patientMap.set(patientId, appointment);
        }
      });

      // Chuyển map thành array và sắp xếp theo appointment gần nhất
      const patientList = Array.from(patientMap.values())
        .map((appointment) => {
          const patientData = appointment.patient || appointment.patientId || {};
          const info = patientData.personalInfo || {};
          const name = info.firstName
            ? `${info.firstName} ${info.lastName}`
            : (patientData.fullName || patientData.name || 'N/A');

          return {
            _id: patientData._id,
            name: name,
            email: patientData.email || info.email,
            phone: patientData.phone || info.phone,
            avatar: patientData.avatar || info.profilePicture,
            lastVisit: appointment.appointmentDate,
            status: appointment.type?.toLowerCase() || 'outpatient',
            appointmentId: appointment._id,
          };
        })
        .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));

      // Thêm bệnh nhân mẫu nếu danh sách trống để người dùng demo xem được giao diện chi tiết
      if (patientList.length === 0) {
        patientList.push({
          _id: 'preview',
          name: 'Nguyễn Văn A (Demo)',
          email: 'demo@healthcare.vn',
          phone: '0901234567',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          lastVisit: new Date(),
          status: 'outpatient',
          appointmentId: 'demo_apt_1',
        });
      }

      setPatients(patientList);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadDoctorPatients();
    }
  }, [user?._id]);

  // Lọc bệnh nhân theo status
  const filteredPatients = patients.filter((patient) => {
    const matchStatus =
      filterStatus === 'all' || patient.status === filterStatus;
    const matchSearch =
      searchText === '' ||
      patient.name.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.phone.includes(searchText);
    return matchStatus && matchSearch;
  });

  const getStatusTag = (status) => {
    const statusMap = {
      outpatient: {
        color: 'blue',
        label: 'Ngoài viện',
        icon: <HomeOutlined />,
      },
      inpatient: {
        color: 'red',
        label: 'Nội trú',
        icon: <ClockCircleOutlined />,
      },
    };
    const config = statusMap[status] || { color: 'default', label: status };
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.label}
      </Tag>
    );
  };

  const renderPatientCard = (patient) => (
    <motion.div
      key={patient._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        hoverable
        style={{
          marginBottom: '12px',
          border: '1px solid #f0f0f0',
          borderRadius: '8px',
        }}
        styles={{ body: { padding: '16px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
            {/* Avatar */}
            <Avatar
              size={48}
              src={patient.avatar}
              style={{
                backgroundColor: '#1890ff',
                flexShrink: 0,
              }}
            >
              {patient.name.charAt(0).toUpperCase()}
            </Avatar>

            {/* Patient Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                {patient.name}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '8px',
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <span>📧 {patient.email}</span>
                {patient.phone && <span>📱 {patient.phone}</span>}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#999',
                  marginBottom: '8px',
                }}
              >
                Lần khám cuối:{' '}
                <strong style={{ color: '#1890ff' }}>
                  {dayjs(patient.lastVisit).fromNow()}
                </strong>
              </div>
              <div>{getStatusTag(patient.status)}</div>
            </div>
          </div>

          {/* Action Button */}
          <Space>
            <Button
              type="default"
              icon={<MessageOutlined />}
              onClick={() => {
                navigate(`/doctor/messages`, {
                  state: {
                    patientId: patient._id,
                    patientName: patient.name
                  },
                });
              }}
            />
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => {
                navigate(`/doctor/medical-records/${patient._id}`, {
                  state: { patient },
                });
              }}
            >
              Xem hồ sơ
            </Button>
          </Space>
        </div>
      </Card>
    </motion.div>
  );

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
        {/* Header */}
        <div
          style={{
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            Hồ sơ bệnh nhân
          </h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
            Danh sách bệnh nhân {filteredPatients.length > 0 ? `(${filteredPatients.length})` : ''}
          </p>
        </div>

        {/* Filter & Search */}
        <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
          <Space
            direction="vertical"
            style={{ width: '100%' }}
            size="large"
          >
            {/* Search */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                🔍 Tìm kiếm bệnh nhân
              </label>
              <Input
                placeholder="Tìm theo tên, email hoặc số điện thoại..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ borderRadius: '6px' }}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                📋 Lọc theo tình trạng
              </label>
              <Segmented
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { label: 'Tất cả', value: 'all' },
                  { label: 'Ngoài viện', value: 'outpatient' },
                  { label: 'Nội trú', value: 'inpatient' },
                ]}
              />
            </div>
          </Space>
        </Card>

        {/* Patient List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
              tip="Đang tải danh sách bệnh nhân..."
            />
          </div>
        ) : filteredPatients.length === 0 ? (
          <Card style={{ borderRadius: '8px' }}>
            <Empty
              description={
                patients.length === 0
                  ? 'Chưa có bệnh nhân'
                  : 'Không tìm thấy bệnh nhân phù hợp'
              }
              style={{ padding: '40px 0' }}
            />
          </Card>
        ) : (
          <div>
            {filteredPatients.map((patient) =>
              renderPatientCard(patient)
            )}
          </div>
        )}

        {/* Footer Stats */}
        {filteredPatients.length > 0 && (
          <Card
            style={{
              marginTop: '24px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {filteredPatients.length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  Tổng bệnh nhân
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#13c2c2',
                  }}
                >
                  {filteredPatients.filter((p) => p.status === 'outpatient').length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  Ngoài viện
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#ff4d4f',
                  }}
                >
                  {filteredPatients.filter((p) => p.status === 'inpatient').length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  Nội trú
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DoctorLayout>
  );
};

export default MedicalRecords;
