// src/pages/admin/appointments/AvailableSlots.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import { doctorAPI } from '@/services/api/doctorAPI';
import publicAPI from '@/services/api/publicAPI';
import { ArrowRightOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Divider, Empty, Row, Select, Skeleton, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AvailableSlots = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [deptRes, doctorRes] = await Promise.all([
        publicAPI.getDepartments(),
        doctorAPI.getDoctors()
      ]);
      setDepartments(deptRes.data || []);
      setDoctors(doctorRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate) {
      message.warning('Vui lòng chọn bác sĩ và ngày');
      return;
    }

    try {
      setLoading(true);
      const response = await appointmentAPI.getAvailableSlots({
        doctorId: selectedDoctor,
        date: selectedDate.format('YYYY-MM-DD')
      });

      const slots = response.data?.availableSlots || [];
      setAvailableSlots(slots);

      if (slots.length === 0) {
        message.info('Không có khung giờ trống cho ngày này');
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      message.error('Lỗi tải khung giờ');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = selectedDepartment
    ? doctors.filter(d => d.professionalInfo?.department === selectedDepartment)
    : doctors;

  const handleSelectSlot = (slot) => {
    // Chuyển đến trang tạo lịch hẹn với thông tin đã chọn
    navigate('/patient/create-appointment', {
      state: {
        doctorId: selectedDoctor,
        appointmentDate: selectedDate,
        slot: slot.time || slot
      }
    });
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          <ClockCircleOutlined style={{ marginRight: '8px' }} />
          Tìm khung giờ trống
        </h1>

        <Card style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Bác sĩ</label>
              <Select
                style={{ width: '100%' }}
                placeholder="Chọn bác sĩ"
                allowClear
                options={doctors.map(doctor => ({
                  label: `${doctor.fullName}`,
                  value: doctor._id
                }))}
                value={selectedDoctor}
                onChange={(value) => {
                  setSelectedDoctor(value);
                  setAvailableSlots([]);
                }}
              />
            </Col>

            <Col xs={24} sm={12} md={6}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Ngày</label>
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                disabledDate={(current) => current && current.isBefore(dayjs(), 'day')}
                value={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setAvailableSlots([]);
                }}
              />
            </Col>

            <Col xs={24} sm={12} md={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                type="primary"
                style={{ width: '100%' }}
                onClick={loadAvailableSlots}
                loading={loading}
                disabled={!selectedDoctor || !selectedDate}
              >
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </Card>

        <Divider />

        {selectedDoctor && selectedDate && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Khung giờ trống cho bác sĩ {doctors.find(d => d._id === selectedDoctor)?.fullName} vào ngày{' '}
              <strong>{selectedDate.format('DD/MM/YYYY')}</strong>
            </h3>

            {loading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : availableSlots.length > 0 ? (
              <Row gutter={[12, 12]}>
                {availableSlots.map((slot, idx) => (
                  <Col xs={12} sm={8} md={6} lg={4} key={idx}>
                    <Card
                      hoverable
                      onClick={() => handleSelectSlot(slot)}
                      style={{
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: '1px solid #e0e0e0',
                        padding: '12px'
                      }}
                    >
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1890ff' }}>
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        {slot.time || slot}
                      </div>
                      <Button
                        type="link"
                        size="small"
                        style={{ marginTop: '8px' }}
                      >
                        Chọn <ArrowRightOutlined />
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                description="Không có khung giờ trống"
                style={{ marginTop: '20px' }}
              />
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AvailableSlots;
