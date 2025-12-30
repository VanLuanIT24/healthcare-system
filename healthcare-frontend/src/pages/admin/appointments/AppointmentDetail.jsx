// src/pages/admin/appointments/AppointmentDetail.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Modal, Row, Skeleton, Space, Statistic, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AppointmentDetail = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusMap = {
    PENDING: { label: 'Chờ xác nhận', color: 'blue' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'green' },
    COMPLETED: { label: 'Hoàn thành', color: 'cyan' },
    CANCELLED: { label: 'Đã hủy', color: 'red' },
    NO_SHOW: { label: 'Vắng mặt', color: 'orange' }
  };

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointmentById(appointmentId);
      setAppointment(response?.data?.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      message.error('Lỗi tải thông tin lịch khám');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const handleConfirm = async () => {
    try {
      await appointmentAPI.updateAppointment(appointmentId, { status: 'CONFIRMED' });
      message.success('Xác nhận lịch khám thành công');
      fetchAppointment();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Lỗi xác nhận');
    }
  };

  const handleCheckIn = async () => {
    try {
      await appointmentAPI.checkInAppointment(appointmentId);
      message.success('Check-in thành công');
      fetchAppointment();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Lỗi check-in');
    }
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Hủy lịch khám',
      content: 'Bạn có chắc chắn muốn hủy lịch khám này?',
      okText: 'Hủy',
      cancelText: 'Đóng',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await appointmentAPI.cancelAppointment(appointmentId);
          message.success('Hủy lịch khám thành công');
          navigate('/admin/appointments');
        } catch (error) {
          message.error(error?.response?.data?.message || 'Lỗi hủy lịch khám');
        }
      }
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <Skeleton active paragraph={{ rows: 5 }} />
      </AdminLayout>
    );
  }

  if (!appointment) {
    return (
      <AdminLayout>
        <Card>
          <p>Không tìm thấy lịch khám</p>
          <Button onClick={() => navigate('/admin/appointments')}>Quay lại</Button>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Chi tiết Lịch khám</h1>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/appointments')}>
            Quay lại
          </Button>
        </div>

        {/* Main Info */}
        <Card className="rounded-lg">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Statistic
                title="Trạng thái"
                value={statusMap[appointment?.status]?.label || appointment?.status}
                valueStyle={{ color: statusMap[appointment?.status]?.color }}
              />
            </Col>
            <Col xs={24} md={12}>
              <Statistic
                title="Ngày khám"
                value={dayjs(appointment?.appointmentDate).format('DD/MM/YYYY')}
              />
            </Col>
            <Col xs={24} md={12}>
              <Statistic
                title="Giờ khám"
                value={dayjs(appointment?.appointmentTime, 'HH:mm').format('HH:mm')}
              />
            </Col>
            <Col xs={24} md={12}>
              <Statistic
                title="Lý do khám"
                value={appointment?.reason || 'N/A'}
              />
            </Col>
          </Row>
        </Card>

        {/* Patient Info */}
        <Card title="Thông tin bệnh nhân" className="rounded-lg">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <p><strong>Tên:</strong> {appointment?.patient?.personalInfo?.firstName} {appointment?.patient?.personalInfo?.lastName}</p>
              <p><strong>Email:</strong> {appointment?.patient?.email}</p>
              <p><strong>Số điện thoại:</strong> {appointment?.patient?.personalInfo?.phone || 'N/A'}</p>
            </Col>
            <Col xs={24} md={12}>
              <p><strong>Giới tính:</strong> {appointment?.patient?.personalInfo?.gender || 'N/A'}</p>
              <p><strong>Ngày sinh:</strong> {dayjs(appointment?.patient?.personalInfo?.dateOfBirth).format('DD/MM/YYYY') || 'N/A'}</p>
              <p><strong>Địa chỉ:</strong> {appointment?.patient?.personalInfo?.address?.street || 'N/A'}</p>
            </Col>
          </Row>
        </Card>

        {/* Doctor Info */}
        <Card title="Thông tin bác sĩ" className="rounded-lg">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <p><strong>Tên:</strong> {appointment?.doctor?.personalInfo?.firstName} {appointment?.doctor?.personalInfo?.lastName}</p>
              <p><strong>Email:</strong> {appointment?.doctor?.email}</p>
              <p><strong>Số điện thoại:</strong> {appointment?.doctor?.personalInfo?.phone || 'N/A'}</p>
            </Col>
            <Col xs={24} md={12}>
              <p><strong>Chuyên khoa:</strong> {appointment?.doctor?.professionalInfo?.department || 'N/A'}</p>
              <p><strong>Bằng cấp:</strong> {appointment?.doctor?.professionalInfo?.qualification || 'N/A'}</p>
              <p><strong>Số giấy phép:</strong> {appointment?.doctor?.professionalInfo?.licenseNumber || 'N/A'}</p>
            </Col>
          </Row>
        </Card>

        {/* Notes */}
        {appointment?.notes && (
          <Card title="Ghi chú" className="rounded-lg">
            <p>{appointment.notes}</p>
          </Card>
        )}

        {/* Timeline */}
        <Card title="Lịch sử" className="rounded-lg">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <p><strong>Tạo lúc:</strong> {dayjs(appointment?.createdAt).format('DD/MM/YYYY HH:mm')}</p>
            </Col>
            <Col xs={24} md={12}>
              <p><strong>Cập nhật lúc:</strong> {dayjs(appointment?.updatedAt).format('DD/MM/YYYY HH:mm')}</p>
            </Col>
          </Row>
        </Card>

        {/* Actions */}
        <Card className="rounded-lg">
          <Space>
            {appointment?.status === 'PENDING' && (
              <>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckOutlined />}
                  onClick={handleConfirm}
                >
                  Xác nhận lịch khám
                </Button>
                <Button
                  danger
                  size="large"
                  icon={<CloseOutlined />}
                  onClick={handleCancel}
                >
                  Hủy lịch khám
                </Button>
              </>
            )}
            {appointment?.status === 'CONFIRMED' && (
              <>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckOutlined />}
                  onClick={handleCheckIn}
                >
                  Check-in
                </Button>
                <Button
                  size="large"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/admin/appointments/${appointmentId}/reschedule`)}
                >
                  Dời lịch
                </Button>
                <Button
                  danger
                  size="large"
                  icon={<CloseOutlined />}
                  onClick={handleCancel}
                >
                  Hủy lịch khám
                </Button>
              </>
            )}
            {appointment?.status !== 'COMPLETED' && appointment?.status !== 'CANCELLED' && (
              <Button size="large" onClick={() => navigate('/admin/appointments')}>
                Quay lại
              </Button>
            )}
          </Space>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AppointmentDetail;
