import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button, Calendar, Card, Col, Empty, Modal, Row, Space, Spin, Tag, Tooltip, Typography, message } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useEffect, useState } from 'react';
import { appointmentAPI } from '../../services/api/appointmentAPI';
import { userAPI } from '../../services/api/userAPI';
import './TimeSlotSelection.css';

dayjs.extend(isBetween);

const { Title, Text } = Typography;

const TimeSlotSelectionPage = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [monthData, setMonthData] = useState({});

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      loadDoctorSchedule(selectedDate);
      loadMonthAppointments(selectedDate);
    }
  }, [selectedDoctor, selectedDate]);

  const loadDoctors = async () => {
    try {
      const response = await userAPI.getUsers({ role: 'DOCTOR' });
      const doctorsWithDetails = response.data.map(doctor => ({
        ...doctor,
        specialization: doctor.specialization || 'Nội khoa',
        availability: doctor.availability || 'available'
      }));
      setDoctors(doctorsWithDetails);
      if (doctorsWithDetails.length > 0) {
        setSelectedDoctor(doctorsWithDetails[0]);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      message.error('Không thể tải danh sách bác sĩ');
    }
  };

  const loadDoctorSchedule = async (date) => {
    if (!selectedDoctor) return;

    setLoading(true);
    try {
      // Get appointments for selected doctor on selected date
      const response = await appointmentAPI.getAllAppointments({
        doctorId: selectedDoctor._id,
        date: date.format('YYYY-MM-DD')
      });

      const bookedSlots = response.data || [];
      
      // Generate time slots for the day (8AM - 5PM, 30 min intervals)
      const slots = generateTimeSlots(date, bookedSlots);
      setTimeSlots(slots);
      setAppointments(bookedSlots);
    } catch (error) {
      console.error('Error loading schedule:', error);
      // Generate slots even if API fails
      setTimeSlots(generateTimeSlots(date, []));
    } finally {
      setLoading(false);
    }
  };

  const loadMonthAppointments = async (date) => {
    if (!selectedDoctor) return;

    try {
      const startOfMonth = date.startOf('month').format('YYYY-MM-DD');
      const endOfMonth = date.endOf('month').format('YYYY-MM-DD');

      const response = await appointmentAPI.getAllAppointments({
        doctorId: selectedDoctor._id,
        startDate: startOfMonth,
        endDate: endOfMonth
      });

      // Group appointments by date
      const grouped = {};
      (response.data || []).forEach(apt => {
        const dateKey = dayjs(apt.appointmentDate).format('YYYY-MM-DD');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(apt);
      });

      setMonthData(grouped);
    } catch (error) {
      console.error('Error loading month appointments:', error);
    }
  };

  const generateTimeSlots = (date, bookedSlots) => {
    const slots = [];
    const now = dayjs();
    const isToday = date.isSame(now, 'day');

    // Working hours: 8AM - 5PM
    for (let hour = 8; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = date.hour(hour).minute(minute).second(0);
        const endTime = slotTime.add(30, 'minute');

        // Skip past time slots if today
        if (isToday && slotTime.isBefore(now)) {
          continue;
        }

        // Check if slot is booked
        const isBooked = bookedSlots.some(apt => {
          const aptStart = dayjs(apt.appointmentDate);
          const aptEnd = aptStart.add(apt.duration || 30, 'minute');
          return slotTime.isBetween(aptStart, aptEnd, null, '[)') || 
                 endTime.isBetween(aptStart, aptEnd, null, '(]');
        });

        slots.push({
          time: slotTime,
          endTime: endTime,
          timeLabel: slotTime.format('HH:mm'),
          endLabel: endTime.format('HH:mm'),
          available: !isBooked,
          status: isBooked ? 'booked' : 'available'
        });
      }
    }

    return slots;
  };

  const getListData = (value) => {
    const dateKey = value.format('YYYY-MM-DD');
    const dayAppointments = monthData[dateKey] || [];
    return dayAppointments;
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="calendar-events">
        {listData.length > 0 && (
          <li>
            <Badge
              status={listData.length > 15 ? 'error' : listData.length > 10 ? 'warning' : 'success'}
              text={`${listData.length} lịch`}
            />
          </li>
        )}
      </ul>
    );
  };

  const handleDateSelect = (date) => {
    // Don't allow past dates
    if (date.isBefore(dayjs(), 'day')) {
      message.warning('Không thể chọn ngày trong quá khứ');
      return;
    }
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    if (!slot.available) {
      message.warning('Khung giờ này đã được đặt');
      return;
    }
    setSelectedSlot(slot);
  };

  const handleBookSlot = () => {
    if (!selectedSlot || !selectedDoctor) {
      message.warning('Vui lòng chọn khung giờ');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận đặt lịch',
      content: (
        <div>
          <p><strong>Bác sĩ:</strong> BS. {selectedDoctor.fullName}</p>
          <p><strong>Ngày:</strong> {selectedDate.format('DD/MM/YYYY')}</p>
          <p><strong>Giờ:</strong> {selectedSlot.timeLabel} - {selectedSlot.endLabel}</p>
        </div>
      ),
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
        // Navigate to booking page with pre-filled data
        const params = new URLSearchParams({
          doctorId: selectedDoctor._id,
          date: selectedDate.format('YYYY-MM-DD'),
          time: selectedSlot.timeLabel
        });
        window.location.href = `/appointments/book?${params.toString()}`;
      }
    });
  };

  const getSlotStats = () => {
    const total = timeSlots.length;
    const available = timeSlots.filter(s => s.available).length;
    const booked = total - available;
    const percentage = total > 0 ? Math.round((available / total) * 100) : 0;

    return { total, available, booked, percentage };
  };

  const stats = getSlotStats();

  return (
    <div className="timeslot-selection-page">
      {/* Header */}
      <div className="timeslot-header">
        <Title level={1} className="text-gradient">Chọn Thời Gian Khám</Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Chọn ngày và giờ phù hợp để đặt lịch khám
        </Text>
      </div>

      {/* Doctor Selection Bar */}
      <Card className="doctor-selector-card glass">
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space size="middle">
              <Text strong style={{ fontSize: '16px' }}>Chọn bác sĩ:</Text>
              <Space size="small" wrap>
                {doctors.map(doctor => (
                  <Button
                    key={doctor._id}
                    type={selectedDoctor?._id === doctor._id ? 'primary' : 'default'}
                    onClick={() => setSelectedDoctor(doctor)}
                    icon={<UserOutlined />}
                    style={{
                      borderRadius: '12px',
                      background: selectedDoctor?._id === doctor._id 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : undefined,
                      border: selectedDoctor?._id === doctor._id ? 'none' : undefined
                    }}
                  >
                    BS. {doctor.fullName}
                  </Button>
                ))}
              </Space>
            </Space>
          </Col>
        </Row>
        {selectedDoctor && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(102, 126, 234, 0.05)', borderRadius: '12px' }}>
            <Space direction="vertical" size="small">
              <Text><strong>Chuyên khoa:</strong> {selectedDoctor.specialization}</Text>
              <Text><strong>Trạng thái:</strong> <Tag color={selectedDoctor.availability === 'available' ? 'success' : 'default'}>
                {selectedDoctor.availability === 'available' ? 'Có thể khám' : 'Bận'}
              </Tag></Text>
            </Space>
          </div>
        )}
      </Card>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Calendar Column */}
        <Col xs={24} lg={14}>
          <Card
            className="calendar-card glass"
            title={
              <Space>
                <CalendarOutlined />
                <Text strong>Lịch Tháng {selectedDate.format('MM/YYYY')}</Text>
              </Space>
            }
          >
            <Calendar
              fullscreen={false}
              value={selectedDate}
              onSelect={handleDateSelect}
              cellRender={dateCellRender}
              disabledDate={(date) => date.isBefore(dayjs(), 'day')}
            />
            <div className="calendar-legend">
              <Space size="large" wrap>
                <Space size="small">
                  <Badge status="success" />
                  <Text type="secondary">Còn trống</Text>
                </Space>
                <Space size="small">
                  <Badge status="warning" />
                  <Text type="secondary">Gần đầy</Text>
                </Space>
                <Space size="small">
                  <Badge status="error" />
                  <Text type="secondary">Đã đầy</Text>
                </Space>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Time Slots Column */}
        <Col xs={24} lg={10}>
          <Card
            className="slots-overview-card glass"
            title={
              <Space>
                <ClockCircleOutlined />
                <Text strong>Khung Giờ Khám - {selectedDate.format('DD/MM/YYYY')}</Text>
              </Space>
            }
          >
            {/* Stats */}
            <div className="slots-stats">
              <Row gutter={[12, 12]}>
                <Col span={8}>
                  <div className="stat-item">
                    <Text type="secondary" style={{ fontSize: '12px' }}>Tổng số</Text>
                    <Text strong style={{ fontSize: '24px', display: 'block' }}>{stats.total}</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="stat-item success">
                    <Text type="secondary" style={{ fontSize: '12px' }}>Còn trống</Text>
                    <Text strong style={{ fontSize: '24px', display: 'block', color: '#52c41a' }}>{stats.available}</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="stat-item error">
                    <Text type="secondary" style={{ fontSize: '12px' }}>Đã đặt</Text>
                    <Text strong style={{ fontSize: '24px', display: 'block', color: '#ff4d4f' }}>{stats.booked}</Text>
                  </div>
                </Col>
              </Row>
              <div className="availability-bar">
                <div
                  className="availability-fill"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
              <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block', marginTop: '8px' }}>
                {stats.percentage}% khung giờ còn trống
              </Text>
            </div>

            {/* Time Slots Grid */}
            <Spin spinning={loading}>
              <div className="timeslots-grid">
                {timeSlots.length === 0 ? (
                  <Empty description="Không có khung giờ khám" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  timeSlots.map((slot, index) => (
                    <Tooltip
                      key={index}
                      title={slot.available ? 'Click để chọn' : 'Đã có lịch hẹn'}
                    >
                      <Button
                        className={`timeslot-btn ${slot.available ? 'available' : 'booked'} ${selectedSlot?.timeLabel === slot.timeLabel ? 'selected' : ''}`}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.available}
                      >
                        <Space direction="vertical" size={0}>
                          <Text strong>{slot.timeLabel}</Text>
                          <Text style={{ fontSize: '11px' }}>- {slot.endLabel}</Text>
                        </Space>
                        {slot.available ? (
                          <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                        ) : (
                          <CloseCircleOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />
                        )}
                      </Button>
                    </Tooltip>
                  ))
                )}
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* Selected Slot Info */}
      {selectedSlot && (
        <Card className="selected-slot-card glass">
          <Row align="middle" justify="space-between">
            <Col>
              <Space size="large">
                <Avatar size={48} icon={<UserOutlined />} />
                <div>
                  <Text strong style={{ fontSize: '16px', display: 'block' }}>
                    BS. {selectedDoctor?.fullName}
                  </Text>
                  <Space size="small" wrap>
                    <Tag icon={<CalendarOutlined />} color="blue">
                      {selectedDate.format('DD/MM/YYYY')}
                    </Tag>
                    <Tag icon={<ClockCircleOutlined />} color="green">
                      {selectedSlot.timeLabel} - {selectedSlot.endLabel}
                    </Tag>
                  </Space>
                </div>
              </Space>
            </Col>
            <Col>
              <Button
                type="primary"
                size="large"
                onClick={handleBookSlot}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 40px',
                  height: '48px',
                  fontWeight: 600
                }}
              >
                Đặt lịch ngay
              </Button>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default TimeSlotSelectionPage;
