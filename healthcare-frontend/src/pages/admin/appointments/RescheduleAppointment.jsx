// src/pages/admin/appointments/RescheduleAppointment.jsx
import AppointmentForm from '@/components/appointment/AppointmentForm';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import { ArrowLeftOutlined, CalendarOutlined } from '@ant-design/icons';
import { Button, Card, Form, message, Skeleton } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const RescheduleAppointment = () => {
  const { appointmentId } = useParams();
  const [form] = Form.useForm();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (appointmentId) {
      loadAppointment();
    }
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointmentById(appointmentId);
      const data = response.data;
      setAppointment(data);

      // Pre-fill form
      form.setFieldsValue({
        doctorId: data.doctorId?._id,
        appointmentDate: dayjs(data.appointmentDate),
        reason: data.reason,
        notes: data.notes
      });
    } catch (error) {
      console.error('Error loading appointment:', error);
      message.error('Lỗi tải thông tin lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);

      const updateData = {
        appointmentDate: values.appointmentDate.toISOString(),
        reason: values.reason,
        notes: values.notes
      };

      await appointmentAPI.rescheduleAppointment(appointmentId, updateData);

      message.success('Đổi lịch thành công');
      navigate(`/admin/appointments/${appointmentId}`);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      message.error(error?.response?.data?.message || 'Lỗi đổi lịch');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      </AdminLayout>
    );
  }

  if (!appointment) {
    return (
      <AdminLayout>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <message type="error">Không tìm thấy lịch hẹn</message>
          <Button onClick={() => navigate('/admin/appointments')}>
            Quay lại
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/admin/appointments/${appointmentId}`)}
          >
            Quay lại
          </Button>
        </div>

        <Card>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
            <CalendarOutlined style={{ marginRight: '8px' }} />
            Đổi lịch hẹn
          </h1>

          <div style={{
            padding: '16px',
            backgroundColor: '#f0f5ff',
            borderRadius: '4px',
            marginBottom: '20px',
            borderLeft: '4px solid #1890ff'
          }}>
            <p><strong>Bệnh nhân:</strong> {appointment.patientId?.fullName}</p>
            <p><strong>Bác sĩ hiện tại:</strong> {appointment.doctorId?.fullName}</p>
            <p><strong>Thời gian hiện tại:</strong> {dayjs(appointment.appointmentDate).format('DD/MM/YYYY HH:mm')}</p>
            <p><strong>Lý do:</strong> {appointment.reason}</p>
          </div>

          <AppointmentForm
            form={form}
            initialData={appointment}
            onSubmit={onSubmit}
            loading={submitting}
            mode="reschedule"
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RescheduleAppointment;
