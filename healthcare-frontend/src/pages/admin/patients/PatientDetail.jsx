// src/pages/admin/patients/PatientDetail.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import patientAPI from '@/services/api/patientAPI';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Skeleton, Statistic, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getPatientById(patientId);
      setPatient(response?.data?.data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      message.error('Lỗi tải thông tin bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  if (loading) {
    return (
      <AdminLayout>
        <Skeleton active paragraph={{ rows: 5 }} />
      </AdminLayout>
    );
  }

  if (!patient) {
    return (
      <AdminLayout>
        <Card>
          <p>Không tìm thấy bệnh nhân</p>
          <Button onClick={() => navigate('/admin/patients')}>Quay lại</Button>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Chi tiết Bệnh nhân</h1>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/patients')}>
            Quay lại
          </Button>
        </div>

        <Card title="Thông tin cơ bản" className="rounded-lg">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Statistic
                title="Tên"
                value={`${patient?.personalInfo?.firstName} ${patient?.personalInfo?.lastName}`}
              />
            </Col>
            <Col xs={24} md={12}>
              <Statistic title="Email" value={patient?.email} />
            </Col>
            <Col xs={24} md={12}>
              <Statistic title="Số điện thoại" value={patient?.personalInfo?.phone || 'N/A'} />
            </Col>
            <Col xs={24} md={12}>
              <Statistic title="Giới tính" value={patient?.personalInfo?.gender || 'N/A'} />
            </Col>
            <Col xs={24} md={12}>
              <Statistic
                title="Ngày sinh"
                value={dayjs(patient?.personalInfo?.dateOfBirth).format('DD/MM/YYYY') || 'N/A'}
              />
            </Col>
            <Col xs={24} md={12}>
              <Statistic title="Địa chỉ" value={patient?.personalInfo?.address?.street || 'N/A'} />
            </Col>
          </Row>
        </Card>

        <Card title="Lịch khám" className="rounded-lg">
          <p>Tổng số lịch khám: {patient?.appointments?.length || 0}</p>
        </Card>

        <Card title="Hóa đơn" className="rounded-lg">
          <p>Tổng số hóa đơn: {patient?.bills?.length || 0}</p>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PatientDetail;
