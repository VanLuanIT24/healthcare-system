// src/pages/admin/doctors/ManageDoctorSpecialties.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Row, Col, Button, Select, Space, Table, Modal, message, Spin, Tag
} from 'antd';
import { LoadingOutlined, ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { doctorAPI } from '@/services/api/doctorAPI';
import publicAPI from '@/services/api/publicAPI';
import { motion } from 'framer-motion';

const ManageDoctorSpecialties = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [doctorSpecialties, setDoctorSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [doctorId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docRes, specRes] = await Promise.all([
        doctorAPI.getDoctorById(doctorId),
        publicAPI.getSpecialties(),
      ]);

      if (docRes.data?.data) {
        setDoctor(docRes.data.data);
        setDoctorSpecialties(docRes.data.data.specialties || []);
      }

      if (specRes?.data?.data) {
        setSpecialties(specRes.data.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecialty = async () => {
    if (!selectedSpecialty) {
      message.warning('Vui lòng chọn chuyên khoa');
      return;
    }

    // Check if already exists
    if (doctorSpecialties.some(s => s._id === selectedSpecialty)) {
      message.warning('Chuyên khoa này đã được thêm');
      return;
    }

    try {
      setSubmitting(true);
      await doctorAPI.addSpecialty(doctorId, selectedSpecialty);
      message.success('Thêm chuyên khoa thành công');
      setSelectedSpecialty('');
      loadData();
    } catch (error) {
      message.error('Lỗi khi thêm chuyên khoa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveSpecialty = (specialtyId) => {
    Modal.confirm({
      title: 'Xóa chuyên khoa',
      content: 'Bạn chắc chắn muốn xóa chuyên khoa này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await doctorAPI.removeSpecialty(doctorId, specialtyId);
          message.success('Xóa chuyên khoa thành công');
          loadData();
        } catch (error) {
          message.error('Lỗi khi xóa chuyên khoa');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tên chuyên khoa',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Tag color={record.color || 'blue'}>{text}</Tag>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveSpecialty(record._id)}
        >
          Xóa
        </Button>
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

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}
      >
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/admin/doctors/${doctorId}`)}
          style={{ marginBottom: '20px' }}
        >
          Quay lại
        </Button>

        <Card
          title={`🏆 Quản lý chuyên khoa của bác sĩ ${doctor?.personalInfo?.firstName} ${doctor?.personalInfo?.lastName}`}
          style={{ borderRadius: '12px', marginBottom: '24px' }}
        >
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={18}>
              <Select
                placeholder="Chọn chuyên khoa để thêm"
                value={selectedSpecialty}
                onChange={(value) => setSelectedSpecialty(value)}
                options={specialties
                  .filter(s => !doctorSpecialties.some(ds => ds._id === s._id))
                  .map(s => ({ label: s.name, value: s._id }))}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddSpecialty}
                loading={submitting}
                style={{ width: '100%' }}
              >
                Thêm
              </Button>
            </Col>
          </Row>

          {doctorSpecialties.length > 0 ? (
            <Table
              columns={columns}
              dataSource={doctorSpecialties}
              pagination={false}
              rowKey="_id"
            />
          ) : (
            <p style={{ textAlign: 'center', color: '#999' }}>
              Bác sĩ chưa có chuyên khoa nào
            </p>
          )}
        </Card>
      </motion.div>
    </AdminLayout>
  );
};

export default ManageDoctorSpecialties;
