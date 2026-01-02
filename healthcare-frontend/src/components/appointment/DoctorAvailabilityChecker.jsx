// src/components/appointment/DoctorAvailabilityChecker.jsx - Kiểm tra lịch rảnh bác sĩ và gợi ý khung giờ trống

import appointmentAPI from '@/services/api/appointmentAPI';
import { checkScheduleConflict, generateAvailableSlots, getAvailableDays } from '@/services/utils/scheduleChecker';
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, DatePicker, Empty, Row, Skeleton, Space, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState, useRef } from 'react';

const DoctorAvailabilityChecker = ({
  doctorId,
  selectedDate,
  selectedTime,
  onSlotSelect,
  onAvailabilityChange,
  className = ''
}) => {
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [selectedDateLocal, setSelectedDateLocal] = useState(selectedDate ? dayjs(selectedDate) : null);
  const [selectedTimeLocal, setSelectedTimeLocal] = useState(selectedTime);
  const [showAllSchedules, setShowAllSchedules] = useState(false); // Toggle show more schedules
  const prevAvailabilityRef = useRef(null); // Track previous availability state to prevent loop

  // Load doctor's schedule
  useEffect(() => {
    if (!doctorId) return;

    const loadDoctorSchedule = async () => {
      try {
        setLoading(true);
        const res = await appointmentAPI.getDoctorSchedule(doctorId);
        const schedules = res.data?.data || res.data || [];
        setDoctorSchedules(Array.isArray(schedules) ? schedules : []);

        // Generate available days
        const days = getAvailableDays(schedules, 14);
        setAvailableDays(days);
      } catch (error) {
        console.error('Error loading doctor schedule:', error);
        message.error('Không thể tải lịch làm việc của bác sĩ');
      } finally {
        setLoading(false);
      }
    };

    loadDoctorSchedule();
  }, [doctorId]);

  // Check availability when date/time changes
  useEffect(() => {
    checkAvailability();
  }, [selectedTimeLocal, availableSlots]);

  // Update available slots when date changes
  useEffect(() => {
    if (!selectedDateLocal) return;

    // 🎯 Priority: Check for specific date schedule (from backend DoctorSchedule)
    const directSchedule = doctorSchedules.find(s => s.date && dayjs(s.date).isSame(selectedDateLocal, 'day'));

    if (directSchedule && directSchedule.timeSlots) {
      const slots = directSchedule.timeSlots
        .filter(ts => ts.isAvailable)
        .map(ts => ({ time: ts.startTime, endTime: ts.endTime, ...ts }));
      setAvailableSlots(slots);
      return;
    }

    // 🔽 Fallback: Week-day based schedule logic
    const dayOfWeek = selectedDateLocal.day(); // 0=Sun, 1=Mon, ..., 6=Sat
    const dayMap = {
      0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY',
      4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY'
    };

    const daySchedules = doctorSchedules.filter(schedule => {
      if (!schedule.dayOfWeek) return false; // Skip if no dayOfWeek
      const scheduleDayMap = {
        'Chủ nhật': 0, 'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3,
        'Thứ 5': 4, 'Thứ 6': 5, 'Thứ 7': 6,
        'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3,
        'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
      };

      const scheduleDayNum = scheduleDayMap[schedule.dayOfWeek];
      return scheduleDayNum === dayOfWeek;
    });

    const slots = generateAvailableSlots(daySchedules, 30);
    setAvailableSlots(slots);
  }, [selectedDateLocal, doctorSchedules]);

  // Check availability of selected time
  const checkAvailability = () => {
    if (!selectedTimeLocal || !doctorId) return;


    setChecking(true);

    // Check against available slots (which are already filtered and processed)
    const slot = availableSlots.find(s => s.time === selectedTimeLocal);
    const isAvailable = !!slot;


    if (isAvailable) {
      setCheckResult({ available: true, message: 'Bác sĩ có lịch làm việc khung giờ này' });
    } else {
      if (availableSlots.length === 0) {
        setCheckResult({ available: false, message: 'Bác sĩ không có lịch làm việc vào ngày này' });
      } else {
        setCheckResult({ available: false, message: 'Khung giờ này không khả dụng' });
      }
    }
    // Prevent infinite loop: only notify parent if availability CHANGED
    const resultHash = `${isAvailable}-${isAvailable ? 'available' : availableSlots.length > 0 ? 'booked' : 'no-schedule'}`;

    if (prevAvailabilityRef.current !== resultHash) {
      prevAvailabilityRef.current = resultHash;
      onAvailabilityChange?.(isAvailable);
    }

    setChecking(false);
  };

  const handleDateChange = (date) => {
    setSelectedDateLocal(date);
    onSlotSelect?.(date ? date.format('YYYY-MM-DD') : null, selectedTimeLocal);
  };

  const handleTimeChange = (time) => {
    setSelectedTimeLocal(time);
    onSlotSelect?.(selectedDateLocal ? selectedDateLocal.format('YYYY-MM-DD') : null, time);
  };

  const handleSlotClick = (slot, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedTimeLocal(slot.time);
    onSlotSelect?.(selectedDateLocal ? selectedDateLocal.format('YYYY-MM-DD') : null, slot.time);
  };

  // Disable past dates
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  return (
    <div className={className}>
      <Card className="mb-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CalendarOutlined />
          Kiểm tra lịch rảnh của bác sĩ
        </h3>

        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Chọn ngày */}
            <div>
              <label className="block text-sm font-medium mb-2">Chọn ngày hẹn</label>
              <DatePicker
                value={selectedDateLocal}
                onChange={handleDateChange}
                disabledDate={disabledDate}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                placeholder="Chọn ngày"
              />
              {availableDays.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-2">
                    Bác sĩ rảnh vào những ngày:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableDays.map(day => (
                      <Tag
                        key={day.date}
                        color={day.isToday ? 'blue' : 'default'}
                        className="cursor-pointer"
                        onClick={() => setSelectedDateLocal(dayjs(day.date))}
                      >
                        {day.isToday ? 'Hôm nay' : day.isTomorrow ? 'Ngày mai' : day.display}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chọn giờ */}
            {selectedDateLocal && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Chọn giờ hẹn (
                  <span className="text-blue-600 font-semibold">
                    {availableSlots.length > 0 ? availableSlots.length : 'không'} khung giờ trống
                  </span>
                  )
                </label>

                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {availableSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`h-12 rounded-lg transition-all flex items-center justify-center cursor-pointer select-none font-medium text-sm ${selectedTimeLocal === slot.time
                          ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                          : 'bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700'
                          }`}
                        onClick={(e) => handleSlotClick(slot, e)}
                      >
                        {slot.time}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có khung giờ trống trong ngày này"
                  />
                )}
              </div>
            )}

            {/* Kết quả kiểm tra */}
            {checkResult && (
              <div>
                {checkResult.available ? (
                  <Alert
                    message={<CheckCircleOutlined className="mr-2 text-green-500" />}
                    description={checkResult.message}
                    type="success"
                    showIcon={false}
                    icon={<CheckCircleOutlined className="text-green-500" />}
                  />
                ) : (
                  <Alert
                    message={<ExclamationCircleOutlined className="mr-2 text-orange-500" />}
                    description={checkResult.message}
                    type="warning"
                    showIcon={false}
                    icon={<ExclamationCircleOutlined className="text-orange-500" />}
                  />
                )}
              </div>
            )}

            {/* Thông tin lịch làm việc - Compact View */}
            {selectedDateLocal && doctorSchedules.length > 0 && (
              <Card size="small" className="bg-blue-50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ClockCircleOutlined />
                  Lịch làm việc của bác sĩ
                  <Tag color="blue" className="ml-auto">{doctorSchedules.length} ngày</Tag>
                </h4>
                
                {/* Show only first 6 schedules by default */}
                <Row gutter={[12, 8]}>
                  {(showAllSchedules ? doctorSchedules : doctorSchedules.slice(0, 6)).map((schedule, idx) => {
                    const isDateSchedule = !!schedule.date;
                    const title = isDateSchedule ? dayjs(schedule.date).format('DD/MM') : schedule.dayOfWeek;
                    const timeInfo = isDateSchedule && schedule.timeSlots?.length > 0
                      ? `${schedule.timeSlots[0].startTime} - ${schedule.timeSlots[schedule.timeSlots.length - 1].endTime}`
                      : `${schedule.startTime || '--'} - ${schedule.endTime || '--'}`;

                    return (
                      <Col xs={8} sm={6} md={4} key={idx}>
                        <div className="text-center p-2 bg-white rounded border border-blue-200 hover:border-blue-400 transition-colors">
                          <div className="font-semibold text-blue-600 text-xs">{title}</div>
                          <div className="text-gray-500 text-xs">{timeInfo}</div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
                
                {/* Show more/less button */}
                {doctorSchedules.length > 6 && (
                  <div className="text-center mt-2">
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => setShowAllSchedules(!showAllSchedules)}
                    >
                      {showAllSchedules ? 'Thu gọn' : `Xem thêm ${doctorSchedules.length - 6} ngày`}
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </Space>
        )}
      </Card>
    </div>
  );
};

export default DoctorAvailabilityChecker;
