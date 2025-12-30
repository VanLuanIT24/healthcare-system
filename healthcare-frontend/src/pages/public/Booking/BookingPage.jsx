// src/pages/public/Booking/BookingPage.jsx
import DoctorAvailabilityChecker from '@/components/appointment/DoctorAvailabilityChecker';
import { PageHeader } from '@/components/common';
import { appointmentAPI, publicAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  GoogleOutlined,
  HomeFilled,
  UserOutlined
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Radio,
  Result,
  Row,
  Select,
  Steps,
  message
} from 'antd';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const timeSlots = {
  morning: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  afternoon: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'],
};

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(searchParams.get('doctorId') ? parseInt(searchParams.get('doctorId')) : null);
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || null);
  const [selectedTime, setSelectedTime] = useState(searchParams.get('time') || null);
  const [bookingResult, setBookingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [slotAvailable, setSlotAvailable] = useState(null);

  // Load doctors and departments from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [doctorsRes, deptsRes] = await Promise.all([
          publicAPI.getDoctors(),
          publicAPI.getDepartments()
        ]);

        // Handle doctors
        let doctorsList = [];
        if (Array.isArray(doctorsRes?.data?.data?.doctors)) {
          doctorsList = doctorsRes.data.data.doctors;
        } else if (Array.isArray(doctorsRes?.data?.data)) {
          doctorsList = doctorsRes.data.data;
        } else if (Array.isArray(doctorsRes?.data)) {
          doctorsList = doctorsRes.data;
        }

        // Transform doctors data
        const transformedDoctors = doctorsList.map((doc, index) => ({
          id: doc._id || doc.id || index + 1,
          _id: doc._id || doc.id,
          name: doc.name || `${doc.personalInfo?.firstName || ''} ${doc.personalInfo?.lastName || ''}`.trim() || 'Bác sĩ',
          specialty: doc.specialty || doc.professionalInfo?.specialization || 'Bác sĩ đa khoa',
          departmentId: doc.departmentId || doc.professionalInfo?.department,
          avatar: doc.image || doc.personalInfo?.profilePicture || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300',
          price: '500.000đ',
          yearsOfExperience: doc.experience || doc.professionalInfo?.yearsOfExperience || 0,
          bio: doc.bio || '',
          personalInfo: doc.personalInfo
        }));

        setDoctors(transformedDoctors);

        // Handle departments
        let deptsList = deptsRes?.data?.data || deptsRes?.data || [];
        console.log('Departments loaded:', deptsList);
        setDepartments(Array.isArray(deptsList) ? deptsList : []);
      } catch (error) {
        console.error('Error loading data:', error);
        message.error('Lỗi khi tải dữ liệu');
        setDoctors([]);
        setDepartments([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadData();
  }, []);

  // Filter doctors by selected department
  const filteredDoctors = selectedDepartment
    ? doctors.filter(d => d.departmentId === selectedDepartment)
    : doctors;

  // Get selected doctor info
  const selectedDoctorInfo = doctors.find(d => d.id === selectedDoctor);

  // Steps
  const steps = [
    { title: 'Chọn dịch vụ', icon: <CalendarOutlined /> },
    { title: 'Chọn ngày giờ', icon: <CalendarOutlined /> },
    { title: 'Thông tin', icon: <UserOutlined /> },
    { title: 'Xác nhận', icon: <CheckCircleOutlined /> },
  ];

  // Disable past dates
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  // Handle form submit
  const handleSubmit = async (values) => {
    if (!user) {
      message.error('Vui lòng đăng nhập để đặt lịch');
      return;
    }

    if (!selectedDate || !selectedTime) {
      message.error('Vui lòng chọn ngày và giờ khám');
      return;
    }

    setLoading(true);

    try {
      // Create appointment date object
      const [hours, minutes] = selectedTime.split(':');
      const appointmentDate = dayjs(selectedDate)
        .hour(parseInt(hours))
        .minute(parseInt(minutes))
        .second(0)
        .toDate();

      const bookingData = {
        patientId: user._id || user.id, // Use current user as patient
        doctorId: selectedDoctorInfo?._id || selectedDoctor, // Backend expects MongoDB ID
        specialty: selectedDoctorInfo?.specialty || 'General',
        appointmentDate: appointmentDate,
        type: 'CONSULTATION', // Default type
        location: 'Phòng khám', // Default location
        reason: values.symptoms || 'Khám tổng quát',
        symptoms: values.symptoms ? [values.symptoms] : [],
        // Extra info for record-keeping if needed
        description: `Thông tin bệnh nhân: ${values.fullName}, SĐT: ${values.phone}, Giới tính: ${values.gender}`
      };

      console.log('📡 [BOOKING PAGE] Submitting booking data:', bookingData);

      const response = await appointmentAPI.createAppointment(bookingData);
      const newAppointment = response.data?.data;

      if (newAppointment) {
        setBookingResult({
          code: newAppointment.appointmentId || newAppointment._id,
          doctor: selectedDoctorInfo,
          date: selectedDate,
          time: selectedTime,
          patient: values,
        });
        setCurrentStep(3);
        message.success('Đặt lịch thành công!');
      } else {
        throw new Error('Không nhận được thông tin lịch hẹn từ máy chủ');
      }
    } catch (error) {
      console.error('❌ [BOOKING PAGE] Booking error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi khi đặt lịch';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Select Service & Doctor
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Select Department */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Chọn khoa ({departments.length} khoa)</h3>
        <Row gutter={[16, 16]}>
          {departments.map(dept => (
            <Col xs={12} sm={8} md={6} key={dept._id}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  hoverable
                  className={`text-center cursor-pointer rounded-xl transition-all ${selectedDepartment === dept._id
                    ? 'border-2 border-blue-500 bg-blue-50'
                    : 'border border-gray-200'
                    }`}
                  onClick={() => {
                    setSelectedDepartment(dept._id);
                    setSelectedDoctor(null);
                  }}
                >
                  <div className="text-3xl mb-2">🏥</div>
                  <div className="font-medium">{dept.name}</div>
                </Card>
              </motion.div>
            </Col>
          ))}
          {departments.length === 0 && !loadingDoctors && (
            <Col span={24}>
              <Alert type="info" message="Chưa có khoa nào được thiết lập" showIcon />
            </Col>
          )}
        </Row>
      </div>

      {/* Select Doctor */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Chọn bác sĩ ({filteredDoctors.length} bác sĩ{selectedDepartment ? ' trong khoa' : ''})
        </h3>
        {filteredDoctors.length === 0 ? (
          <Alert
            type="info"
            message={selectedDepartment ? "Khoa này chưa có bác sĩ" : "Vui lòng chọn khoa hoặc xem tất cả bác sĩ"}
            showIcon
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredDoctors.map(doctor => (
              <Col xs={24} sm={12} md={8} key={doctor.id}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    hoverable
                    className={`cursor-pointer rounded-xl transition-all ${selectedDoctor === doctor.id
                      ? 'border-2 border-blue-500 bg-blue-50'
                      : 'border border-gray-200'
                      }`}
                    onClick={() => setSelectedDoctor(doctor.id)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar src={doctor.avatar} size={60} />
                      <div>
                        <div className="font-semibold">{doctor.name}</div>
                        <div className="text-sm text-gray-500">{doctor.yearsOfExperience} năm kinh nghiệm</div>
                        <div className="text-blue-600 font-medium">{doctor.price}</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="primary"
          size="large"
          disabled={!selectedDoctor}
          onClick={() => setCurrentStep(1)}
          className="rounded-lg px-8"
        >
          Tiếp tục
        </Button>
      </div>
    </div>
  );

  // Step 2: Select Date & Time
  const renderStep2 = () => (
    <div className="space-y-6">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={24}>
          {/* Doctor Availability Checker */}
          <DoctorAvailabilityChecker
            doctorId={selectedDoctor}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSlotSelect={(date, time) => {
              setSelectedDate(date);
              setSelectedTime(time);
            }}
            onAvailabilityChange={setSlotAvailable}
          />
        </Col>
      </Row>

      {/* Selected Summary */}
      {selectedDoctorInfo && selectedDate && (
        <Card className="bg-gray-50 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-4">
            <Avatar src={selectedDoctorInfo.avatar} size={48} />
            <div>
              <div className="font-semibold">{selectedDoctorInfo.name}</div>
              <div className="text-sm text-gray-500">
                {selectedDate && dayjs(selectedDate).format('DD/MM/YYYY')}
                {selectedTime && ` - ${selectedTime}`}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-500">Phí khám</div>
              <div className="text-lg font-bold text-blue-600">{selectedDoctorInfo.price}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-between">
        <Button size="large" onClick={() => setCurrentStep(0)} className="rounded-lg">
          Quay lại
        </Button>
        <Button
          type="primary"
          size="large"
          disabled={!selectedDate || !selectedTime || slotAvailable === false}
          onClick={() => setCurrentStep(2)}
          className="rounded-lg px-8"
        >
          Tiếp tục
        </Button>
      </div>
    </div>
  );

  // Step 3: Patient Information
  const renderStep3 = () => (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Thông tin bệnh nhân</h3>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ gender: 'male' }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input size="large" placeholder="Nguyễn Văn A" className="rounded-lg" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: 'Vui lòng nhập SĐT' },
                { pattern: /^[0-9]{10}$/, message: 'SĐT không hợp lệ' },
              ]}
            >
              <Input size="large" placeholder="0912345678" className="rounded-lg" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input size="large" placeholder="email@example.com" className="rounded-lg" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="gender" label="Giới tính">
              <Radio.Group>
                <Radio value="male">Nam</Radio>
                <Radio value="female">Nữ</Radio>
                <Radio value="other">Khác</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="birthYear" label="Năm sinh">
              <Input size="large" placeholder="1990" className="rounded-lg" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="insurance" label="Mã bảo hiểm (nếu có)">
              <Input size="large" placeholder="BHYT..." className="rounded-lg" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="symptoms"
          label="Triệu chứng / Lý do khám"
        >
          <TextArea
            rows={4}
            placeholder="Mô tả triệu chứng hoặc lý do bạn muốn khám..."
            className="rounded-lg"
          />
        </Form.Item>

        {/* Summary Card */}
        <Card className="bg-blue-50 rounded-xl mb-6">
          <h4 className="font-semibold mb-3">Thông tin lịch hẹn</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Bác sĩ:</span>
              <span className="font-medium">{selectedDoctorInfo?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ngày khám:</span>
              <span className="font-medium">{dayjs(selectedDate).format('DD/MM/YYYY')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Giờ khám:</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between">
              <span className="text-gray-500">Phí khám:</span>
              <span className="font-bold text-blue-600">{selectedDoctorInfo?.price}</span>
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button size="large" onClick={() => setCurrentStep(1)} className="rounded-lg">
            Quay lại
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
            className="rounded-lg px-8"
          >
            Xác nhận đặt lịch
          </Button>
        </div>
      </Form>
    </div>
  );

  // Step 4: Success
  const renderStep4 = () => (
    <Result
      status="success"
      title="Đặt lịch thành công!"
      subTitle={
        <div className="space-y-2">
          <p>Mã lịch hẹn của bạn:</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-blue-600">{bookingResult?.code}</span>
            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(bookingResult?.code);
                message.success('Đã sao chép mã lịch hẹn!');
              }}
            />
          </div>
        </div>
      }
      extra={[
        <Card key="info" className="text-left max-w-md mx-auto mb-6 rounded-xl">
          <h4 className="font-semibold mb-4">Chi tiết lịch hẹn</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Avatar src={bookingResult?.doctor?.avatar} />
              <div>
                <div className="font-medium">{bookingResult?.doctor?.name}</div>
                <div className="text-gray-500">
                  {bookingResult?.doctor?.specialty}
                </div>
              </div>
            </div>
            <Divider className="my-3" />
            <div className="flex justify-between">
              <span className="text-gray-500">Ngày khám:</span>
              <span className="font-medium">
                {dayjs(bookingResult?.date).format('DD/MM/YYYY')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Giờ khám:</span>
              <span className="font-medium">{bookingResult?.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bệnh nhân:</span>
              <span className="font-medium">{bookingResult?.patient?.fullName}</span>
            </div>
          </div>
        </Card>,

        <Alert
          key="note"
          message="Lưu ý"
          description={
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li>Vui lòng đến trước 15 phút để làm thủ tục</li>
              <li>Mang theo CMND/CCCD và thẻ bảo hiểm (nếu có)</li>
              <li>Email xác nhận đã được gửi đến {bookingResult?.patient?.email}</li>
            </ul>
          }
          type="info"
          showIcon
          className="text-left max-w-md mx-auto mb-6"
        />,

        <div key="actions" className="flex flex-wrap justify-center gap-3">
          <Button icon={<GoogleOutlined />} className="rounded-lg">
            Thêm vào Google Calendar
          </Button>
          <Button type="primary" icon={<HomeFilled />} onClick={() => navigate('/')} className="rounded-lg">
            Về trang chủ
          </Button>
        </div>,
      ]}
    />
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderStep1();
      case 1: return renderStep2();
      case 2: return renderStep3();
      case 3: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div>
      <PageHeader
        title="Đặt lịch khám"
        subtitle="Đặt lịch hẹn trực tuyến nhanh chóng, tiện lợi"
        backgroundImage="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1920"
        size="small"
      />

      <div className="container mx-auto px-4 py-8">
        <Card className="rounded-xl shadow-sm">
          {/* Steps */}
          <Steps
            current={currentStep}
            items={steps}
            className="mb-8"
            responsive
          />

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;
