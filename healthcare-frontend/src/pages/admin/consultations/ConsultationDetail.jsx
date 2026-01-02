// src/pages/admin/consultations/ConsultationDetail.jsx - Chi tiết tư vấn
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Row,
  Space,
  Spin,
  Tag,
  message,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import clinicalAPI from '@/services/api/clinicalAPI';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const ConsultationDetail = () => {
  const navigate = useNavigate();
  const { consultationId } = useParams();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load consultation detail
  const loadConsultation = async () => {
    try {
      setLoading(true);
      const res = await clinicalAPI.getConsultation(consultationId);
      const data = res.data?.data || res.data;
      setConsultation(data);
    } catch (error) {
      console.error('Error loading consultation:', error);
      message.error('Không thể tải chi tiết tư vấn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (consultationId) {
      loadConsultation();
    }
  }, [consultationId]);

  const getStatusColor = (status) => {
    const statusMap = {
      PENDING: 'orange',
      IN_PROGRESS: 'blue',
      COMPLETED: 'green',
      CANCELLED: 'red',
      APPROVED: 'cyan',
    };
    return statusMap[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING: 'Chờ xử lý',
      IN_PROGRESS: 'Đang khám',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Hủy',
      APPROVED: 'Được phê duyệt',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '80px 40px' }}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          />
          <div style={{ marginTop: '16px', color: '#1890ff' }}>
            Đang tải chi tiết tư vấn...
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!consultation) {
    return (
      <AdminLayout>
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/consultations')}
            style={{ marginBottom: '20px' }}
          >
            Quay lại
          </Button>
          <Card>
            <Empty description="Không tìm thấy yêu cầu tư vấn" />
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const patient = consultation.patientId || {};
  const doctor = consultation.doctorId || {};
  const patientInfo = patient.personalInfo || {};
  const doctorInfo = doctor.personalInfo || {};

  return (
    <AdminLayout>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/consultations')}
            >
              Quay lại
            </Button>
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/admin/consultations/${consultationId}/edit`)}
              >
                Chỉnh sửa
              </Button>
              <Button danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Space>
          </div>
        </motion.div>

        {/* Consultation Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card style={{ marginBottom: '24px', borderRadius: '8px' }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <h3>👤 Thông tin khách hàng</h3>
                <Descriptions
                  items={[
                    {
                      label: 'Tên khách hàng',
                      children: `${patientInfo.firstName || ''} ${patientInfo.lastName || ''}`.trim() || 'N/A',
                    },
                    {
                      label: 'Email',
                      children: patient.email || 'N/A',
                    },
                    {
                      label: 'Số điện thoại',
                      children: patientInfo.phone || 'N/A',
                    },
                    {
                      label: 'Ngày sinh',
                      children: patientInfo.dateOfBirth ? dayjs(patientInfo.dateOfBirth).format('DD/MM/YYYY') : 'N/A',
                    },
                  ]}
                />
              </Col>
              <Col xs={24} md={12}>
                <h3>👨‍💼 Thông tin nhân viên hỗ trợ</h3>
                <Descriptions
                  items={[
                    {
                      label: 'Tên nhân viên',
                      children: `${doctorInfo.firstName || ''} ${doctorInfo.lastName || ''}`.trim() || 'N/A',
                    },
                    {
                      label: 'Email',
                      children: doctor.email || 'N/A',
                    },
                    {
                      label: 'Chuyên môn',
                      children: doctor.specialty || 'N/A',
                    },
                    {
                      label: 'Bệnh viện',
                      children: doctor.hospitalName || 'N/A',
                    },
                  ]}
                />
              </Col>
            </Row>
          </Card>
        </motion.div>

        {/* Consultation Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card style={{ marginBottom: '24px', borderRadius: '8px' }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <h3>📋 Trạng thái yêu cầu</h3>
                <Descriptions
                  items={[
                    {
                      label: 'Trạng thái hiện tại',
                      children: (
                        <Tag color={getStatusColor(consultation.status)}>
                          {getStatusLabel(consultation.status)}
                        </Tag>
                      ),
                    },
                    {
                      label: 'Ngày tạo',
                      children: dayjs(consultation.createdAt).format('DD/MM/YYYY HH:mm'),
                    },
                    {
                      label: 'Cập nhật lần cuối',
                      children: dayjs(consultation.updatedAt).fromNow(),
                    },
                  ]}
                />
              </Col>
              <Col xs={24} md={12}>
                <h3>📊 Thông tin thêm</h3>
                <Descriptions
                  items={[
                    {
                      label: 'Mã yêu cầu',
                      children: <span className="font-mono">{consultation._id?.slice(-12)}</span>,
                    },
                    {
                      label: 'Loại tư vấn',
                      children: consultation.consultationType || 'Tư vấn thường',
                    },
                    {
                      label: 'Ưu tiên',
                      children: consultation.priority || 'Bình thường',
                    },
                  ]}
                />
              </Col>
            </Row>
          </Card>
        </motion.div>

        {/* Diagnosis */}
        {consultation.diagnosis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card style={{ marginBottom: '24px', borderRadius: '8px' }}>
              <h3>🔍 Chẩn đoán</h3>
              <p>{consultation.diagnosis}</p>
            </Card>
          </motion.div>
        )}

        {/* Symptoms */}
        {consultation.symptoms && consultation.symptoms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card style={{ marginBottom: '24px', borderRadius: '8px' }}>
              <h3>🤒 Triệu chứng</h3>
              <ul>
                {consultation.symptoms.map((symptom, idx) => (
                  <li key={idx}>{symptom}</li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}

        {/* Physical Exam */}
        {consultation.physicalExam && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card style={{ marginBottom: '24px', borderRadius: '8px' }}>
              <h3>👨‍⚕️ Khám lâm sàng</h3>
              <Descriptions
                items={Object.entries(consultation.physicalExam).map(([key, value]) => ({
                  label: key.charAt(0).toUpperCase() + key.slice(1),
                  children: String(value),
                }))}
              />
            </Card>
          </motion.div>
        )}

        {/* Notes */}
        {consultation.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card style={{ borderRadius: '8px' }}>
              <h3>📝 Ghi chú</h3>
              <p>{consultation.notes}</p>
            </Card>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ConsultationDetail;
