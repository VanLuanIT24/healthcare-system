// src/pages/admin/doctors/DoctorDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Tabs, Row, Col, Descriptions, Tag, Button, Space, Spin, Avatar, Rate, 
  Timeline, Empty, Modal, message, Table, Statistic
} from 'antd';
import { LoadingOutlined, ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { doctorAPI } from '@/services/api/doctorAPI';
import { motion } from 'framer-motion';

const DoctorDetail = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Load doctor detail
  useEffect(() => {
    const loadDoctorDetail = async () => {
      try {
        setLoading(true);
        const [docRes, statsRes] = await Promise.all([
          doctorAPI.getDoctorById(doctorId),
          doctorAPI.getDoctorStats(doctorId),
        ]);

        if (docRes.data?.data) {
          setDoctor(docRes.data.data);
        }
        if (statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
      } catch (error) {
        console.error('Error loading doctor:', error);
        message.error('Lỗi khi tải thông tin bác sĩ');
      } finally {
        setLoading(false);
      }
    };

    loadDoctorDetail();
  }, [doctorId]);

  // Load appointments
  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const res = await doctorAPI.getDoctorAppointments(doctorId, { limit: 10 });
      if (res.data?.data) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Xóa bác sĩ',
      content: 'Bạn chắc chắn muốn xóa bác sĩ này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await doctorAPI.deleteDoctor(doctorId);
          message.success('Xóa bác sĩ thành công');
          navigate('/admin/doctors');
        } catch (error) {
          message.error('Lỗi khi xóa bác sĩ');
        }
      },
    });
  };

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

  const appointmentColumns = [
    {
      title: 'Bệnh nhân',
      dataIndex: ['patient', 'name'],
      key: 'patient',
    },
    {
      title: 'Ngày giờ',
      dataIndex: 'appointmentDateTime',
      key: 'datetime',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'COMPLETED' ? 'green' : 'blue'}>
          {status}
        </Tag>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'personal',
      label: '👤 Thông tin cá nhân',
      children: (
        <Descriptions
          column={2}
          bordered
          items={[
            {
              label: 'Họ và tên',
              children: `${doctor.personalInfo?.firstName || ''} ${doctor.personalInfo?.lastName || ''}`,
            },
            {
              label: 'Email',
              children: doctor.email,
            },
            {
              label: 'Điện thoại',
              children: doctor.personalInfo?.phone || 'N/A',
            },
            {
              label: 'Giới tính',
              children: doctor.personalInfo?.gender || 'N/A',
            },
            {
              label: 'Ngày sinh',
              children: doctor.personalInfo?.dateOfBirth 
                ? new Date(doctor.personalInfo.dateOfBirth).toLocaleDateString('vi-VN')
                : 'N/A',
            },
            {
              label: 'Địa chỉ',
              children: `${doctor.personalInfo?.address?.street || ''}, ${doctor.personalInfo?.address?.city || ''}`,
            },
          ]}
        />
      ),
    },
    {
      key: 'expertise',
      label: '🏆 Chuyên môn & Chứng chỉ',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12}>
              <Card>
                <h4>Chuyên khoa chính</h4>
                <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {doctor.specialties?.[0]?.name || 'N/A'}
                </p>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card>
                <h4>Khoa</h4>
                <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {doctor.department?.name || 'N/A'}
                </p>
              </Card>
            </Col>
          </Row>

          {doctor.specialties && doctor.specialties.length > 1 && (
            <Card title="Chuyên khoa phụ" style={{ marginBottom: '16px' }}>
              <Space wrap>
                {doctor.specialties.slice(1).map(spec => (
                  <Tag key={spec._id} color="blue">{spec.name}</Tag>
                ))}
              </Space>
            </Card>
          )}

          {doctor.certificates && doctor.certificates.length > 0 && (
            <Card title="Chứng chỉ">
              <Space direction="vertical" style={{ width: '100%' }}>
                {doctor.certificates.map((cert, idx) => (
                  <div key={idx}>
                    <strong>{cert.name}</strong>
                    <p style={{ margin: '4px 0', color: '#666' }}>
                      Cấp năm {cert.year} - {cert.issuer}
                    </p>
                  </div>
                ))}
              </Space>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'experience',
      label: '💼 Kinh nghiệm',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Statistic
              title="Năm kinh nghiệm"
              value={doctor.yearsOfExperience || 0}
              suffix="năm"
            />
          </Col>
          <Col xs={24} sm={12}>
            <Statistic
              title="Đánh giá trung bình"
              value={doctor.rating || 0}
              precision={1}
              suffix="/ 5"
            />
          </Col>
          <Col xs={24}>
            <Card title="Bio">
              <p>{doctor.bio || 'Chưa cập nhật'}</p>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'schedule',
      label: '📅 Lịch làm việc',
      children: (
        <div>
          {doctor.availability && Object.entries(doctor.availability).length > 0 ? (
            <Table
              dataSource={Object.entries(doctor.availability).map(([day, hours]) => ({
                day,
                hours: hours.join(', '),
              }))}
              columns={[
                { title: 'Ngày', dataIndex: 'day', key: 'day' },
                { title: 'Giờ làm việc', dataIndex: 'hours', key: 'hours' },
              ]}
              pagination={false}
              rowKey="day"
            />
          ) : (
            <Empty description="Chưa cập nhật lịch làm việc" />
          )}
        </div>
      ),
    },
    {
      key: 'appointments',
      label: '📋 Lịch hẹn',
      children: (
        <div onMouseEnter={loadAppointments}>
          <Spin spinning={loadingAppointments}>
            {appointments.length > 0 ? (
              <Table
                dataSource={appointments}
                columns={appointmentColumns}
                pagination={false}
                rowKey="_id"
              />
            ) : (
              <Empty description="Chưa có lịch hẹn" />
            )}
          </Spin>
        </div>
      ),
    },
    {
      key: 'stats',
      label: '📊 Thống kê',
      children: stats ? (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic title="Tổng lịch hẹn" value={stats.totalAppointments || 0} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic title="Hoàn thành" value={stats.completedAppointments || 0} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic title="Không đến" value={stats.noShowCount || 0} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic title="Hủy" value={stats.cancelledAppointments || 0} />
          </Col>
        </Row>
      ) : (
        <Empty />
      ),
    },
  ];

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ padding: '24px' }}
      >
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/doctors')}
          style={{ marginBottom: '20px' }}
        >
          Quay lại
        </Button>

        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Row gutter={[16, 24]}>
            <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
              <Avatar
                size={120}
                src={doctor.personalInfo?.profilePicture 
                  ? `/uploads/profiles/${doctor.personalInfo.profilePicture}`
                  : undefined
                }
              />
              <h2 style={{ marginTop: '16px' }}>
                {doctor.personalInfo?.firstName} {doctor.personalInfo?.lastName}
              </h2>
              <Rate value={doctor.rating || 0} disabled />
              <Tag color={doctor.status === 'ACTIVE' ? 'green' : 'red'} style={{ marginTop: '8px' }}>
                {doctor.status === 'ACTIVE' ? 'Hoạt động' : 'Tắt'}
              </Tag>
            </Col>
            <Col xs={24} sm={18}>
              <Space>
                <Button 
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/admin/doctors/${doctorId}/edit`)}
                >
                  Chỉnh sửa
                </Button>
                <Button 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  Xóa
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card style={{ borderRadius: '12px' }}>
          <Tabs defaultActiveKey="personal" items={tabItems} />
        </Card>
      </motion.div>
    </AdminLayout>
  );
};

export default DoctorDetail;
