// src/components/appointment/AppointmentCard.jsx
import { CalendarOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Empty, Row, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import AppointmentStatusTag from './AppointmentStatusTag';

dayjs.locale('vi');

const AppointmentCard = ({ appointment, onDetail, onAction, loading = false, actionButtons = [] }) => {
  if (!appointment) {
    return <Empty description="Không có lịch hẹn" />;
  }

  const formatTime = (dateTime) => {
    return dayjs(dateTime).format('DD/MM/YYYY HH:mm');
  };

  const calculateDaysUntil = (appointmentDate) => {
    const diff = dayjs(appointmentDate).diff(dayjs(), 'days');
    return diff;
  };

  const daysUntil = calculateDaysUntil(appointment.appointmentDate);
  
  const isUpcoming = daysUntil > 0 && !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status);
  const isToday = daysUntil === 0 && !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status);
  const isPast = daysUntil < 0;

  return (
    <Card
      hoverable
      style={{
        borderLeft: isToday ? '4px solid #1890ff' : isUpcoming ? '4px solid #52c41a' : '4px solid #d9d9d9',
        transition: 'all 0.3s ease',
        marginBottom: '16px'
      }}
      onClick={onDetail}
      className="appointment-card"
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AppointmentStatusTag status={appointment.status} />
            {isToday && <Tag color="blue">Hôm nay</Tag>}
            {isUpcoming && daysUntil <= 3 && <Tag color="orange">Sắp tới</Tag>}
          </div>
        </div>
        <Space>
          {isToday && (
            <Tag color="cyan" style={{ fontSize: '12px' }}>
              Hôm nay
            </Tag>
          )}
        </Space>
      </Row>

      <Divider style={{ margin: '12px 0' }} />

      {/* Thông tin lịch hẹn chính */}
      <Row gutter={[16, 12]}>
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <strong>Ngày/Giờ:</strong>
            <span>{formatTime(appointment.appointmentDate)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
            <UserOutlined style={{ color: '#1890ff' }} />
            <strong>Bác sĩ:</strong>
            <span>{appointment.doctorId?.fullName || 'Chưa xác định'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
            <UserOutlined style={{ color: '#52c41a' }} />
            <strong>Bệnh nhân:</strong>
            <span>{appointment.patientId?.fullName || 'Chưa xác định'}</span>
          </div>

          {appointment.reason && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
              <FileTextOutlined style={{ color: '#faad14' }} />
              <strong>Lý do:</strong>
              <span>{appointment.reason}</span>
            </div>
          )}

          {appointment.notes && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
              <FileTextOutlined style={{ color: '#faad14', marginTop: '2px' }} />
              <div>
                <strong>Ghi chú:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>{appointment.notes}</p>
              </div>
            </div>
          )}
        </div>
      </Row>

      <Divider style={{ margin: '12px 0' }} />

      {/* Action buttons */}
      {actionButtons && actionButtons.length > 0 && (
        <Row gutter={[8, 8]} style={{ marginTop: '12px' }}>
          {actionButtons.map((btn, idx) => (
            <Button
              key={idx}
              type={btn.type || 'default'}
              danger={btn.danger}
              size="small"
              loading={loading}
              onClick={(e) => {
                e.stopPropagation();
                btn.onClick && btn.onClick(appointment);
              }}
            >
              {btn.icon && btn.icon}
              {btn.label}
            </Button>
          ))}
        </Row>
      )}
    </Card>
  );
};

export default AppointmentCard;
