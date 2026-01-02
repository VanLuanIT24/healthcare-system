// src/pages/admin/appointments/TodayAppointments.jsx
import AppointmentCard from '@/components/appointment/AppointmentCard';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import { CheckOutlined, ClockCircleOutlined, CloseOutlined, PhoneOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Empty, Modal, Row, Skeleton, message } from 'antd';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TodayAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  const statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ xác nhận', value: 'PENDING' },
    { label: 'Đã xác nhận', value: 'CONFIRMED' },
    { label: 'Đã check-in', value: 'CHECKED_IN' },
    { label: 'Đang khám', value: 'IN_PROGRESS' },
    { label: 'Hoàn thành', value: 'COMPLETED' },
    { label: 'Vắng mặt', value: 'NO_SHOW' }
  ];

  useEffect(() => {
    fetchTodayAppointments();
  }, [filterStatus]);

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getTodayAppointments({
        status: filterStatus || undefined
      });

      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching today appointments:', error);
      message.error('Lỗi tải danh sách lịch hôm nay');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointment) => {
    Modal.confirm({
      title: 'Check-in lịch hẹn',
      content: `Bạn có chắc chắn muốn check-in cho ${appointment.patientId?.fullName || 'Bệnh nhân'}?`,
      okText: 'Check-in',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await appointmentAPI.checkInAppointment(appointment._id);
          message.success('Check-in thành công');
          fetchTodayAppointments();
        } catch (error) {
          message.error(error?.response?.data?.message || 'Lỗi check-in');
        }
      }
    });
  };

  const handleComplete = (appointment) => {
    navigate(`/admin/appointments/${appointment._id}`, {
      state: { tab: 'complete' }
    });
  };

  const handleNoShow = async (appointment) => {
    Modal.confirm({
      title: 'Đánh dấu vắng mặt',
      content: `Bạn có chắc chắn muốn đánh dấu ${appointment.patientId?.fullName || 'Bệnh nhân'} vắng mặt?`,
      okText: 'Đánh dấu',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await appointmentAPI.noShowAppointment(appointment._id);
          message.success('Đã đánh dấu vắng mặt');
          fetchTodayAppointments();
        } catch (error) {
          message.error(error?.response?.data?.message || 'Lỗi đánh dấu vắng mặt');
        }
      }
    });
  };

  const handleCancel = (appointment) => {
    Modal.confirm({
      title: 'Hủy lịch hẹn',
      content: `Bạn có chắc chắn muốn hủy lịch của ${appointment.patientId?.fullName || 'Bệnh nhân'}?`,
      okText: 'Hủy',
      cancelText: 'Đóng',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await appointmentAPI.cancelAppointment(appointment._id, 'Hủy bởi nhân viên');
          message.success('Hủy lịch thành công');
          fetchTodayAppointments();
        } catch (error) {
          message.error(error?.response?.data?.message || 'Lỗi hủy lịch');
        }
      }
    });
  };

  const getActionButtons = (appointment) => {
    const buttons = [];

    if (appointment.status === 'PENDING') {
      buttons.push({
        label: 'Xác nhận',
        type: 'primary',
        onClick: () => {
          // Implement confirm logic
          message.info('Chức năng xác nhận chưa được triển khai');
        }
      });
    }

    if (['PENDING', 'CONFIRMED'].includes(appointment.status)) {
      buttons.push({
        label: 'Check-in',
        icon: <PhoneOutlined />,
        type: 'primary',
        onClick: handleCheckIn
      });
    }

    if (['CHECKED_IN', 'IN_PROGRESS'].includes(appointment.status)) {
      buttons.push({
        label: 'Hoàn thành',
        icon: <CheckOutlined />,
        type: 'primary',
        onClick: handleComplete
      });

      buttons.push({
        label: 'Vắng mặt',
        icon: <CloseOutlined />,
        onClick: handleNoShow
      });
    }

    if (!['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status)) {
      buttons.push({
        label: 'Hủy',
        danger: true,
        onClick: handleCancel
      });
    }

    buttons.push({
      label: 'Chi tiết',
      type: 'default',
      onClick: () => navigate(`/admin/appointments/${appointment._id}`)
    });

    return buttons;
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          <ClockCircleOutlined style={{ marginRight: '8px' }} />
          Lịch hẹn hôm nay ({appointments.length})
        </h1>

        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} md={8}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Lọc theo trạng thái</label>
            <CustomSelect
              style={{ width: '100%' }}
              placeholder="Chọn trạng thái"
              options={statusOptions}
              value={filterStatus}
              onChange={setFilterStatus}
            />

          </Col>

          <Col xs={24} sm={12} md={16} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <Button type="primary" onClick={fetchTodayAppointments} loading={loading}>
              Làm mới
            </Button>
            <Button onClick={() => navigate('/admin/appointments')}>
              Xem tất cả
            </Button>
          </Col>
        </Row>

        <Divider />

        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : appointments.length > 0 ? (
          <Row gutter={[16, 16]}>
            {appointments.map(appointment => (
              <Col key={appointment._id} xs={24}>
                <AppointmentCard
                  appointment={appointment}
                  onDetail={() => navigate(`/admin/appointments/${appointment._id}`)}
                  actionButtons={getActionButtons(appointment)}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="Không có lịch hẹn hôm nay" />
        )}
      </div>
    </AdminLayout>
  );
};

export default TodayAppointments;
