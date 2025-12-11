// 📅 Online Booking Page - Đặt lịch khám online
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    MedicineBoxOutlined,
    PhoneOutlined,
    UserOutlined,
    VideoCameraOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    message,
    Radio,
    Result,
    Row,
    Select,
    Space,
    Steps,
    Tag,
    Timeline,
    Typography
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentAPI from '../../services/api/appointmentAPI';
import userAPI from '../../services/api/userAPI';
import './OnlineBooking.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

const OnlineBookingPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await userAPI.getUsers({ role: 'DOCTOR' });
      setDoctors(response.data?.data || response.data?.users || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      message.error('Không thể tải danh sách bác sĩ');
    }
  };

  const loadAvailableSlots = async (doctorId, date) => {
    try {
      setLoading(true);
      // Giả lập tính toán slots trống (trong thực tế sẽ gọi API)
      const slots = generateTimeSlots(date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading slots:', error);
      message.error('Không thể tải khung giờ trống');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (date) => {
    const slots = [];
    const startHour = 8;
    const endHour = 17;
    const slotDuration = 30; // minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isAvailable = Math.random() > 0.3; // 70% available
        slots.push({
          time,
          available: isAvailable,
          label: `${time} - ${hour.toString().padStart(2, '0')}:${(minute + slotDuration).toString().padStart(2, '0')}`
        });
      }
    }
    return slots;
  };

  const handleStepChange = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    form.validateFields().then((values) => {
      setBookingData({ ...bookingData, ...values });
      setCurrentStep(currentStep + 1);
    }).catch((error) => {
      console.error('Validation error:', error);
    });
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleDoctorSelect = (doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId);
    setSelectedDoctor(doctor);
    form.setFieldsValue({ doctorId });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (selectedDoctor) {
      loadAvailableSlots(selectedDoctor._id, date);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    form.setFieldsValue({ 
      appointmentDate: dayjs(`${selectedDate.format('YYYY-MM-DD')} ${slot.time}`)
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      
      const appointmentData = {
        ...bookingData,
        ...values,
        appointmentDate: dayjs(`${selectedDate.format('YYYY-MM-DD')} ${selectedSlot.time}`).toISOString(),
        duration: 30,
        location: 'Phòng khám online',
        status: 'SCHEDULED'
      };

      const response = await appointmentAPI.createAppointment(appointmentData);
      
      setBookingResult(response.data);
      message.success('Đặt lịch thành công!');
      setCurrentStep(3);
    } catch (error) {
      console.error('Booking error:', error);
      message.error(error.response?.data?.message || 'Đặt lịch thất bại');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Thông tin',
      icon: <UserOutlined />,
    },
    {
      title: 'Chọn bác sĩ',
      icon: <MedicineBoxOutlined />,
    },
    {
      title: 'Chọn giờ',
      icon: <ClockCircleOutlined />,
    },
    {
      title: 'Hoàn tất',
      icon: <CheckCircleOutlined />,
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="booking-step-card glass">
            <Title level={3} className="text-gradient">
              <UserOutlined /> Thông tin cá nhân
            </Title>
            <Paragraph type="secondary">
              Vui lòng cung cấp thông tin để đặt lịch khám
            </Paragraph>
            
            <Form form={form} layout="vertical" className="booking-form">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Họ và tên"
                    name="patientName"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="Nguyễn Văn A" 
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số điện thoại' },
                      { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
                    ]}
                  >
                    <Input 
                      prefix={<PhoneOutlined />} 
                      placeholder="0987654321" 
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                  >
                    <Input 
                      prefix={<FileTextOutlined />} 
                      placeholder="email@example.com" 
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Loại khám"
                    name="type"
                    initialValue="CONSULTATION"
                    rules={[{ required: true }]}
                  >
                    <Select size="large" placeholder="Chọn loại khám">
                      <Select.Option value="CONSULTATION">Tư vấn</Select.Option>
                      <Select.Option value="CHECKUP">Khám tổng quát</Select.Option>
                      <Select.Option value="FOLLOW_UP">Tái khám</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="Lý do khám"
                    name="reason"
                    rules={[{ required: true, message: 'Vui lòng nhập lý do khám' }]}
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="Mô tả triệu chứng hoặc lý do khám bệnh..."
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="Hình thức khám"
                    name="mode"
                    initialValue="IN_PERSON"
                  >
                    <Radio.Group size="large">
                      <Radio.Button value="IN_PERSON">
                        <EnvironmentOutlined /> Trực tiếp
                      </Radio.Button>
                      <Radio.Button value="TELEMEDICINE">
                        <VideoCameraOutlined /> Từ xa
                      </Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <div className="step-actions">
              <Button type="primary" size="large" onClick={handleNext}>
                Tiếp theo <CalendarOutlined />
              </Button>
            </div>
          </Card>
        );

      case 1:
        return (
          <Card className="booking-step-card glass">
            <Title level={3} className="text-gradient">
              <MedicineBoxOutlined /> Chọn bác sĩ
            </Title>
            <Paragraph type="secondary">
              Chọn bác sĩ phù hợp với nhu cầu của bạn
            </Paragraph>

            <Row gutter={[16, 16]} className="doctor-grid">
              {doctors.map((doctor) => (
                <Col xs={24} sm={12} lg={8} key={doctor._id}>
                  <Card
                    hoverable
                    className={`doctor-card ${selectedDoctor?._id === doctor._id ? 'selected' : ''}`}
                    onClick={() => handleDoctorSelect(doctor._id)}
                  >
                    <div className="doctor-avatar">
                      <UserOutlined style={{ fontSize: 48 }} />
                    </div>
                    <Title level={4}>
                      {doctor.personalInfo?.fullName || 'Bác sĩ'}
                    </Title>
                    <Tag color="blue">
                      {doctor.professionalInfo?.specialization || 'Đa khoa'}
                    </Tag>
                    <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                      {doctor.professionalInfo?.bio || 'Bác sĩ chuyên khoa'}
                    </Paragraph>
                    <Divider />
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text type="secondary">
                        <CalendarOutlined /> Kinh nghiệm: {doctor.professionalInfo?.yearsOfExperience || 5} năm
                      </Text>
                      <Text type="secondary">
                        <MedicineBoxOutlined /> Khoa: {doctor.professionalInfo?.department || 'Tổng hợp'}
                      </Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>

            <div className="step-actions">
              <Button size="large" onClick={handlePrevious}>
                Quay lại
              </Button>
              <Button 
                type="primary" 
                size="large" 
                onClick={handleNext}
                disabled={!selectedDoctor}
              >
                Tiếp theo
              </Button>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="booking-step-card glass">
            <Title level={3} className="text-gradient">
              <ClockCircleOutlined /> Chọn ngày và giờ khám
            </Title>
            <Paragraph type="secondary">
              Chọn thời gian phù hợp với lịch trình của bạn
            </Paragraph>

            <Row gutter={24}>
              <Col xs={24} md={10}>
                <Card className="calendar-card">
                  <Title level={4}>Chọn ngày</Title>
                  <DatePicker
                    style={{ width: '100%' }}
                    size="large"
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      return current && current < dayjs().startOf('day');
                    }}
                    onChange={handleDateSelect}
                  />
                </Card>

                {selectedDate && selectedDoctor && (
                  <Card className="doctor-summary-card" style={{ marginTop: 16 }}>
                    <Title level={5}>Thông tin đã chọn</Title>
                    <Timeline>
                      <Timeline.Item color="blue">
                        <Text strong>Bác sĩ:</Text> {selectedDoctor.personalInfo?.fullName}
                      </Timeline.Item>
                      <Timeline.Item color="green">
                        <Text strong>Ngày:</Text> {selectedDate.format('DD/MM/YYYY')}
                      </Timeline.Item>
                      {selectedSlot && (
                        <Timeline.Item color="purple">
                          <Text strong>Giờ:</Text> {selectedSlot.label}
                        </Timeline.Item>
                      )}
                    </Timeline>
                  </Card>
                )}
              </Col>

              <Col xs={24} md={14}>
                {selectedDate ? (
                  <Card className="slots-card">
                    <Title level={4}>Khung giờ trống</Title>
                    <div className="time-slots-grid">
                      {availableSlots.map((slot, index) => (
                        <Button
                          key={index}
                          className={`time-slot ${selectedSlot?.time === slot.time ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                          disabled={!slot.available}
                          onClick={() => handleSlotSelect(slot)}
                          size="large"
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card className="slots-card">
                    <Result
                      icon={<CalendarOutlined />}
                      title="Vui lòng chọn ngày khám"
                      subTitle="Chọn ngày ở bên trái để xem khung giờ trống"
                    />
                  </Card>
                )}
              </Col>
            </Row>

            <div className="step-actions">
              <Button size="large" onClick={handlePrevious}>
                Quay lại
              </Button>
              <Button 
                type="primary" 
                size="large" 
                onClick={handleSubmit}
                disabled={!selectedSlot}
                loading={loading}
              >
                Xác nhận đặt lịch
              </Button>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="booking-step-card glass">
            <Result
              status="success"
              title="Đặt lịch thành công!"
              subTitle={`Mã lịch hẹn: ${bookingResult?.appointmentId || 'N/A'}`}
              extra={[
                <Card key="details" className="booking-details-card">
                  <Timeline>
                    <Timeline.Item color="blue">
                      <Text strong>Bác sĩ:</Text> {selectedDoctor?.personalInfo?.fullName}
                    </Timeline.Item>
                    <Timeline.Item color="green">
                      <Text strong>Ngày giờ:</Text> {selectedDate?.format('DD/MM/YYYY')} - {selectedSlot?.label}
                    </Timeline.Item>
                    <Timeline.Item color="purple">
                      <Text strong>Loại khám:</Text> {bookingData.type}
                    </Timeline.Item>
                    <Timeline.Item color="orange">
                      <Text strong>Hình thức:</Text> {bookingData.mode === 'IN_PERSON' ? 'Trực tiếp' : 'Từ xa'}
                    </Timeline.Item>
                  </Timeline>
                  <Divider />
                  <Paragraph type="secondary">
                    Chúng tôi đã gửi xác nhận qua email và SMS. Vui lòng đến trước giờ hẹn 15 phút.
                  </Paragraph>
                </Card>,
                <Space key="actions" size="large" style={{ marginTop: 24 }}>
                  <Button size="large" onClick={() => navigate('/appointments')}>
                    Xem lịch hẹn
                  </Button>
                  <Button type="primary" size="large" onClick={() => window.location.reload()}>
                    Đặt lịch mới
                  </Button>
                </Space>
              ]}
            />
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="online-booking-page">
      <div className="booking-header">
        <Title level={1} className="text-gradient">
          📅 Đặt lịch khám online
        </Title>
        <Paragraph>
          Đặt lịch nhanh chóng, dễ dàng, tiện lợi
        </Paragraph>
      </div>

      <Card className="booking-container glass">
        <Steps 
          current={currentStep} 
          onChange={handleStepChange}
          className="booking-steps"
        >
          {steps.map((item) => (
            <Step key={item.title} title={item.title} icon={item.icon} />
          ))}
        </Steps>

        <div className="step-content">
          {renderStepContent()}
        </div>
      </Card>
    </div>
  );
};

export default OnlineBookingPage;
