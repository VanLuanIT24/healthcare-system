// src/pages/admin/appointments/AppointmentReminders.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import { BellOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Divider, Empty, Modal, Row, Skeleton, Space, message } from 'antd';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const AppointmentReminders = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [dateFilter, setDateFilter] = useState(dayjs());
  const [reminderType, setReminderType] = useState('email'); // 'email', 'sms', 'both'

  const reminderTypeOptions = [
    { label: 'Email', value: 'email' },
    { label: 'SMS', value: 'sms' },
    { label: 'Cả hai', value: 'both' }
  ];

  useEffect(() => {
    loadAppointments();
  }, [dateFilter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getUpcomingAppointments({
        date: dateFilter?.format('YYYY-MM-DD')
      });

      // Filter appointments that are upcoming but not completed/cancelled
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const filtered = data.filter(a =>
        !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status)
      );

      setAppointments(filtered);
      setSelectedAppointments([]);
    } catch (error) {
      console.error('Error loading appointments:', error);
      message.error('Lỗi tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (appointmentId) => {
    Modal.confirm({
      title: 'Gửi nhắc hẹn',
      content: `Bạn có chắc chắn muốn gửi nhắc hẹn qua ${reminderType === 'both' ? 'Email và SMS' : reminderType === 'email' ? 'Email' : 'SMS'}?`,
      okText: 'Gửi',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await appointmentAPI.sendReminder(appointmentId);
          message.success('Gửi nhắc hẹn thành công');
          loadAppointments();
        } catch (error) {
          message.error(error?.response?.data?.message || 'Lỗi gửi nhắc hẹn');
        }
      }
    });
  };

  const handleSendBulkReminders = () => {
    if (selectedAppointments.length === 0) {
      message.warning('Vui lòng chọn ít nhất một lịch hẹn');
      return;
    }

    Modal.confirm({
      title: 'Gửi nhắc hẹn hàng loạt',
      content: `Bạn có chắc chắn muốn gửi nhắc hẹn cho ${selectedAppointments.length} lịch hẹn?`,
      okText: 'Gửi',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // Send reminders for each selected appointment
          await Promise.all(
            selectedAppointments.map(id =>
              appointmentAPI.sendReminder(id)
            )
          );

          message.success(`Gửi nhắc hẹn cho ${selectedAppointments.length} lịch thành công`);
          setSelectedAppointments([]);
          loadAppointments();
        } catch (error) {
          message.error(error?.response?.data?.message || 'Lỗi gửi nhắc hẹn hàng loạt');
        }
      }
    });
  };

  const getActionButtons = (appointment) => [
    {
      label: 'Nhắc hẹn',
      icon: <BellOutlined />,
      type: 'primary',
      onClick: () => handleSendReminder(appointment._id)
    },
    {
      label: 'Chi tiết',
      onClick: () => {
        // Navigate to detail
      }
    }
  ];

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          <BellOutlined style={{ marginRight: '8px' }} />
          Gửi nhắc hẹn
        </h1>

        <Card style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Ngày hẹn</label>
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                value={dateFilter}
                onChange={(date) => setDateFilter(date)}
              />
            </Col>

            <Col xs={24} sm={8}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phương thức gửi</label>
              <CustomSelect
                style={{ width: '100%' }}
                value={reminderType}
                onChange={setReminderType}
                options={reminderTypeOptions}
              />

            </Col>

            <Col xs={24} sm={8}>
              <Button
                type="primary"
                icon={<BellOutlined />}
                onClick={handleSendBulkReminders}
                disabled={selectedAppointments.length === 0}
                style={{ width: '100%' }}
              >
                Gửi cho {selectedAppointments.length} lịch
              </Button>
            </Col>
          </Row>
        </Card>

        <Divider />

        <div style={{ marginBottom: '16px' }}>
          <Space>
            <span>Đã chọn: {selectedAppointments.length} / {appointments.length}</span>
            {selectedAppointments.length > 0 && (
              <Button
                size="small"
                onClick={() => setSelectedAppointments([])}
              >
                Bỏ chọn
              </Button>
            )}
          </Space>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : appointments.length > 0 ? (
          <div>
            {appointments.map(appointment => (
              <Card
                key={appointment._id}
                style={{
                  marginBottom: '12px',
                  backgroundColor: selectedAppointments.includes(appointment._id) ? '#f0f5ff' : 'white'
                }}
              >
                <Row align="middle">
                  <Col xs={24} sm={20}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedAppointments.includes(appointment._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAppointments([...selectedAppointments, appointment._id]);
                          } else {
                            setSelectedAppointments(selectedAppointments.filter(id => id !== appointment._id));
                          }
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600' }}>
                          {appointment.patientId?.fullName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {dayjs(appointment.appointmentDate).format('DD/MM/YYYY HH:mm')} - {appointment.doctorId?.fullName}
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} sm={4} style={{ textAlign: 'right', marginTop: '12px' }}>
                    <Button
                      size="small"
                      type="primary"
                      icon={<BellOutlined />}
                      onClick={() => handleSendReminder(appointment._id)}
                    >
                      Gửi
                    </Button>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        ) : (
          <Empty description={`Không có lịch hẹn vào ${dateFilter?.format('DD/MM/YYYY')}`} />
        )}
      </div>
    </AdminLayout>
  );
};

export default AppointmentReminders;
