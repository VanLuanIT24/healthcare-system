// src/pages/patient/BookAppointment.jsx - Trang đặt lịch hẹn cho bệnh nhân trong dashboard

import DoctorAvailabilityChecker from '@/components/appointment/DoctorAvailabilityChecker';
import appointmentAPI from '@/services/api/appointmentAPI';
import { departmentAPI } from '@/services/api/departmentAPI';
import publicAPI from '@/services/api/publicAPI';
import { ArrowLeftOutlined, CopyOutlined } from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Result,
  Row,
  Space,
  Spin,
  message
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';

const { TextArea } = Input;

const BookAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();

  const [step, setStep] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [slotAvailable, setSlotAvailable] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  // Load doctors and departments
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingDoctors(true);
        const [doctorsRes, deptsRes] = await Promise.all([
          publicAPI.getDoctors({ limit: 100 }), // Use public API for patient access, get all doctors
          departmentAPI.getDepartments()
        ]);

        let doctorsList = doctorsRes.data?.data?.doctors || doctorsRes.data?.data || doctorsRes.data || [];
        let deptsList = deptsRes.data?.data || deptsRes.data || [];

        console.log('Doctors loaded:', doctorsList);
        console.log('Departments loaded:', deptsList);

        setDoctors(Array.isArray(doctorsList) ? doctorsList : []);
        setDepartments(Array.isArray(deptsList) ? deptsList : []);
      } catch (error) {
        console.error('Error loading doctors:', error);
        message.error('Lỗi tải danh sách bác sĩ');
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadData();
  }, []);

  // Filter doctors by department - check both professionalInfo.department and department._id
  const filteredDoctors = selectedDepartment
    ? doctors.filter(d => {
      const deptId = d.professionalInfo?.department || d.department?._id || d.departmentId;
      return deptId === selectedDepartment;
    })
    : doctors;

  const selectedDoctorInfo = doctors.find(d => d._id === selectedDoctor);

  const handleBookAppointment = async (values) => {
    try {
      setSubmitLoading(true);

      const appointmentData = {
        patientId: user?._id, // Add patientId from auth context
        doctorId: selectedDoctor,
        specialty: selectedSpecialty,
        appointmentDate: `${selectedDate}T${selectedTime}:00`,
        duration: 30,
        type: 'CONSULTATION',
        location: 'Phòng khám',
        reason: values.reason || 'Tư vấn',
        notes: values.notes,
        status: 'SCHEDULED'
      };

      const res = await appointmentAPI.createAppointment(appointmentData);

      setBookingResult({
        id: res.data?.data?._id || res.data?._id,
        code: `BK${Date.now().toString().slice(-8)}`,
        doctor: selectedDoctorInfo,
        date: selectedDate,
        time: selectedTime,
        patient: values
      });

      setStep(3);
      message.success('Đặt lịch hẹn thành công!');
    } catch (error) {
      console.error('Error booking appointment:', error);
      message.error(error.response?.data?.message || 'Lỗi đặt lịch hẹn');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Step 1: Select Doctor
  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Chọn khoa và bác sĩ</h3>

      {/* Select Department */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Chọn khoa ({departments.length} khoa)
        </label>
        <CustomSelect
          placeholder="Chọn khoa"
          allowClear
          value={selectedDepartment}
          onChange={(value) => {
            setSelectedDepartment(value);
            setSelectedDoctor(null); // Reset doctor when department changes
          }}
          options={departments.map(dept => ({
            label: dept.name,
            value: dept._id
          }))}
        />

      </div>

      {/* Select Doctor */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Bác sĩ ({filteredDoctors.length} bác sĩ{selectedDepartment ? ' trong khoa' : ''})
        </label>
        {filteredDoctors.length === 0 ? (
          <Alert
            type="info"
            message={selectedDepartment ? "Khoa này chưa có bác sĩ" : "Chọn khoa để xem bác sĩ hoặc xem tất cả bác sĩ bên dưới"}
            showIcon
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredDoctors.map(doctor => (
              <Col xs={24} sm={12} key={doctor._id}>
                <Card
                  hoverable
                  className={`cursor-pointer transition-all rounded-lg ${selectedDoctor === doctor._id
                    ? 'border-2 border-blue-500 bg-blue-50'
                    : 'border border-gray-200'
                    }`}
                  onClick={() => {
                    setSelectedDoctor(doctor._id);
                    // Auto-select first specialty
                    if (doctor.specialties && doctor.specialties.length > 0) {
                      setSelectedSpecialty(doctor.specialties[0].name);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={doctor.personalInfo?.profilePicture}
                      size={48}
                      icon="user"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">
                        {doctor.personalInfo?.firstName} {doctor.personalInfo?.lastName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {doctor.yearsOfExperience || doctor.professionalInfo?.yearsOfExperience} năm kinh nghiệm
                      </div>
                    </div>
                  </div>
                </Card>
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
          onClick={() => setStep(1)}
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
      <h3 className="text-lg font-semibold">Chọn ngày giờ hẹn</h3>

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

      {/* Summary */}
      {selectedDoctorInfo && selectedDate && (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg">
          <Row gutter={16}>
            <Col xs={24} sm="auto">
              <Avatar src={selectedDoctorInfo.personalInfo?.profilePicture} size={56} icon="user" />
            </Col>
            <Col xs={24} sm="auto" flex="auto">
              <div>
                <div className="font-semibold">
                  {selectedDoctorInfo.personalInfo?.firstName} {selectedDoctorInfo.personalInfo?.lastName}
                </div>
                <div className="text-sm text-gray-600">
                  {dayjs(selectedDate).format('DD/MM/YYYY')} - {selectedTime}
                </div>
              </div>
            </Col>
            <Col xs={24} sm="auto">
              {slotAvailable === true ? (
                <div className="text-green-600 font-semibold text-sm">
                  ✓ Khung giờ có sẵn
                </div>
              ) : slotAvailable === false ? (
                <div className="text-red-600 font-semibold text-sm">
                  ✗ Khung giờ không khả dụng
                </div>
              ) : null}
            </Col>
          </Row>
        </Card>
      )}

      <div className="flex justify-between">
        <Button size="large" htmlType="button" onClick={() => setStep(0)} icon={<ArrowLeftOutlined />} className="rounded-lg">
          Quay lại
        </Button>
        <Button
          type="primary"
          size="large"
          htmlType="button"
          disabled={!selectedDate || !selectedTime || slotAvailable === false}
          onClick={() => setStep(2)}
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
      <h3 className="text-lg font-semibold mb-6">Thông tin bệnh nhân</h3>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleBookAppointment}
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
                { pattern: /^[0-9]{10}$/, message: 'SĐT phải 10 số' }
              ]}
            >
              <Input size="large" placeholder="0912345678" className="rounded-lg" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="reason"
          label="Lý do khám"
          rules={[{ required: true, message: 'Vui lòng nhập lý do khám' }]}
        >
          <TextArea rows={3} placeholder="Mô tả lý do bạn muốn khám..." className="rounded-lg" />
        </Form.Item>

        <Form.Item name="notes" label="Ghi chú thêm">
          <TextArea rows={2} placeholder="Ghi chú thêm (tùy chọn)..." className="rounded-lg" />
        </Form.Item>

        {/* Summary Card */}
        <Card className="bg-blue-50 rounded-lg mb-6 border-2 border-blue-200">
          <h4 className="font-semibold mb-4">Xác nhận thông tin đặt lịch</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Bác sĩ:</span>
              <span className="font-medium">
                {selectedDoctorInfo?.personalInfo?.firstName} {selectedDoctorInfo?.personalInfo?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày khám:</span>
              <span className="font-medium">{dayjs(selectedDate).format('DD/MM/YYYY')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giờ khám:</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between">
              <span className="text-gray-600 font-semibold">Trạng thái:</span>
              <span className="font-semibold text-blue-600">Chờ xác nhận</span>
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button size="large" onClick={() => setStep(1)} icon={<ArrowLeftOutlined />} className="rounded-lg">
            Quay lại
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={submitLoading}
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
      title="Đặt lịch hẹn thành công!"
      subTitle={
        <div className="space-y-2">
          <p>Mã lịch hẹn của bạn:</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-blue-600">{bookingResult?.code}</span>
            <Button
              type="text"
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
        <Card key="info" className="text-left max-w-md mx-auto mb-6 rounded-lg">
          <h4 className="font-semibold mb-4">Chi tiết lịch hẹn</h4>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <div className="flex items-center gap-3">
              <Avatar src={bookingResult?.doctor?.personalInfo?.profilePicture} size={48} icon="user" />
              <div>
                <div className="font-medium">
                  {bookingResult?.doctor?.personalInfo?.firstName} {bookingResult?.doctor?.personalInfo?.lastName}
                </div>
              </div>
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ngày khám:</span>
              <span className="font-medium">{dayjs(bookingResult?.date).format('DD/MM/YYYY')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Giờ khám:</span>
              <span className="font-medium">{bookingResult?.time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Trạng thái:</span>
              <span className="font-medium text-orange-600">Chờ xác nhận</span>
            </div>
          </Space>
        </Card>,

        <Alert
          key="note"
          message="Lưu ý"
          description={
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li>Bạn sẽ nhận được email xác nhận sớm</li>
              <li>Vui lòng đến trước 15 phút để làm thủ tục</li>
              <li>Mang theo CMND/CCCD và thẻ BHYT (nếu có)</li>
            </ul>
          }
          type="info"
          showIcon
          className="text-left max-w-md mx-auto mb-6"
        />,

        <Space key="actions" className="justify-center">
          <Button
            type="primary"
            onClick={() => navigate('/patient/appointments')}
            className="rounded-lg"
          >
            Xem lịch hẹn của tôi
          </Button>
          <Button onClick={() => navigate('/patient')} className="rounded-lg">
            Về dashboard
          </Button>
        </Space>
      ]}
    />
  );

  const steps = ['Chọn bác sĩ', 'Chọn ngày giờ', 'Thông tin bệnh nhân', 'Hoàn tất'];

  const renderStep = () => {
    switch (step) {
      case 0: return renderStep1();
      case 1: return renderStep2();
      case 2: return renderStep3();
      case 3: return renderStep4();
      default: return renderStep1();
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/patient/appointments')}
          className="mb-4"
        >
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold">Đặt lịch khám mới</h1>
        <p className="text-gray-600 mt-2">Chọn bác sĩ và thời gian phù hợp với bạn</p>
      </div>

      {loadingDoctors ? (
        <Card className="h-96 flex items-center justify-center">
          <Spin size="large" />
        </Card>
      ) : (
        <Card className="rounded-lg shadow-sm">
          {/* Steps */}
          <div className="mb-8">
            {steps.map((stepName, idx) => (
              <div
                key={idx}
                className={`inline-block mr-8 pb-4 border-b-2 ${step === idx ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-600'
                  }`}
              >
                <div className="text-sm font-medium">{stepName}</div>
              </div>
            ))}
          </div>

          {/* Content */}
          {renderStep()}
        </Card>
      )}
    </div>
  );
};

export default BookAppointment;
