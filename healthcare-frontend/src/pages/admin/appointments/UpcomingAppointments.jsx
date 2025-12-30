// src/pages/admin/appointments/UpcomingAppointments.jsx
import AppointmentCard from '@/components/appointment/AppointmentCard';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import { CalendarOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Empty, Input, Row, Select, Skeleton, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'status', 'patient'
  const navigate = useNavigate();

  const sortOptions = [
    { label: 'Theo thời gian', value: 'date' },
    { label: 'Theo trạng thái', value: 'status' },
    { label: 'Theo bệnh nhân', value: 'patient' },
    { label: 'Theo bác sĩ', value: 'doctor' }
  ];

  useEffect(() => {
    fetchUpcomingAppointments();
  }, [sortBy]);

  const fetchUpcomingAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getUpcomingAppointments({
        search: searchText || undefined
      });
      
      let data = Array.isArray(response.data) ? response.data : response.data?.data || [];

      // Sắp xếp theo tiêu chí
      data = data.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(a.appointmentDate) - new Date(b.appointmentDate);
          case 'status':
            return (a.status || '').localeCompare(b.status || '');
          case 'patient':
            return (a.patientId?.fullName || '').localeCompare(b.patientId?.fullName || '');
          case 'doctor':
            return (a.doctorId?.fullName || '').localeCompare(b.doctorId?.fullName || '');
          default:
            return 0;
        }
      });

      setAppointments(data);
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      message.error('Lỗi tải danh sách lịch sắp tới');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (appointmentId) => {
    try {
      await appointmentAPI.sendReminder(appointmentId);
      message.success('Gửi nhắc hẹn thành công');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Lỗi gửi nhắc hẹn');
    }
  };

  const handleReschedule = (appointment) => {
    navigate(`/admin/appointments/${appointment._id}/reschedule`);
  };

  const getActionButtons = (appointment) => {
    const buttons = [];

    if (!['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status)) {
      buttons.push({
        label: 'Nhắc hẹn',
        onClick: () => handleSendReminder(appointment._id)
      });

      buttons.push({
        label: 'Đổi lịch',
        onClick: () => handleReschedule(appointment)
      });
    }

    buttons.push({
      label: 'Chi tiết',
      type: 'primary',
      onClick: () => navigate(`/admin/appointments/${appointment._id}`)
    });

    return buttons;
  };

  const handleSearch = (value) => {
    setSearchText(value);
    // Debounce search
    setTimeout(fetchUpcomingAppointments, 300);
  };

  // Nhóm lịch hẹn theo khoảng thời gian
  const groupedAppointments = {
    today: appointments.filter(a => dayjs(a.appointmentDate).isSame(dayjs(), 'day')),
    tomorrow: appointments.filter(a => dayjs(a.appointmentDate).isSame(dayjs().add(1, 'day'), 'day')),
    thisWeek: appointments.filter(a => {
      const diff = dayjs(a.appointmentDate).diff(dayjs(), 'day');
      return diff > 1 && diff <= 7;
    }),
    later: appointments.filter(a => {
      const diff = dayjs(a.appointmentDate).diff(dayjs(), 'day');
      return diff > 7;
    })
  };

  const renderSection = (title, items) => {
    if (items.length === 0) return null;

    return (
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1890ff' }}>
          {title} ({items.length})
        </h3>
        {items.map(appointment => (
          <AppointmentCard
            key={appointment._id}
            appointment={appointment}
            onDetail={() => navigate(`/admin/appointments/${appointment._id}`)}
            actionButtons={getActionButtons(appointment)}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          <CalendarOutlined style={{ marginRight: '8px' }} />
          Lịch hẹn sắp tới
        </h1>

        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={16}>
            <Input
              placeholder="Tìm kiếm bệnh nhân, bác sĩ..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={24} sm={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Sắp xếp theo"
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
            />
          </Col>

          <Col xs={24}>
            <Button type="primary" onClick={fetchUpcomingAppointments} loading={loading}>
              Làm mới
            </Button>
          </Col>
        </Row>

        <Divider />

        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : appointments.length > 0 ? (
          <div>
            {renderSection('Hôm nay', groupedAppointments.today)}
            {renderSection('Ngày mai', groupedAppointments.tomorrow)}
            {renderSection('Tuần này', groupedAppointments.thisWeek)}
            {renderSection('Sau đó', groupedAppointments.later)}
          </div>
        ) : (
          <Empty description="Không có lịch hẹn sắp tới" />
        )}
      </div>
    </AdminLayout>
  );
};

export default UpcomingAppointments;
