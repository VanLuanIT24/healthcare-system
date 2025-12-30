// src/pages/patient/CreateAppointmentPage.jsx
import appointmentAPI from '@/services/api/appointmentAPI';
import { doctorAPI } from '@/services/api/doctorAPI';
import publicAPI from '@/services/api/publicAPI';
import { ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Empty,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Spin,
    Steps,
    Tag
} from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateAppointmentPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({});

  // Load departments and all doctors on mount
  useEffect(() => {
    const loadDepartmentsAndDoctors = async () => {
      try {
        setLoading(true);
        // Load departments
        const deptResponse = await publicAPI.getDepartments();
        setDepartments(deptResponse.data || []);
        
        // Load all doctors
        const doctorResponse = await doctorAPI.getDoctors();
        setDoctors(doctorResponse.data || []);
      } catch (error) {
        console.error('Error loading departments and doctors:', error);
        message.error('Không thể tải danh sách khoa và bác sĩ');
      } finally {
        setLoading(false);
      }
    };
    loadDepartmentsAndDoctors();
  }, []);

  // Filter doctors when department is selected
  useEffect(() => {
    if (selectedDepartment && doctors.length > 0) {
      const filtered = doctors.filter(doctor => 
        doctor.professionalInfo?.department === selectedDepartment
      );
      setFilteredDoctors(filtered);
      // Reset doctor selection when department changes
      setSelectedDoctor(null);
      setSelectedDate(null);
      setAvailableSlots([]);
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedDepartment, doctors]);

  // Load available slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await appointmentAPI.getAvailableSlots({
        doctorId: selectedDoctor,
        date: selectedDate.format('YYYY-MM-DD'),
      });
      setAvailableSlots(response.data?.availableSlots || []);
      if (!response.data?.availableSlots || response.data.availableSlots.length === 0) {
        message.info('Không có khung giờ trống cho ngày này. Vui lòng chọn ngày khác.');
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
      message.error('Không thể tải khung giờ trống');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectDepartment = (value) => {
    setSelectedDepartment(value);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  const handleSelectDoctor = (value) => {
    setSelectedDoctor(value);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  const handleSelectDate = (date) => {
    // Validate date is in the future
    if (date && date.isBefore(dayjs(), 'day')) {
      message.error('Vui lòng chọn ngày trong tương lai');
      return;
    }
    setSelectedDate(date);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleNextStep = async () => {
    if (currentStep === 0) {
      // Validate department and doctor selection
      const reason = form.getFieldValue('reason');
      if (!selectedDepartment) {
        message.error('Vui lòng chọn khoa/phòng khám');
        return;
      }
      if (!selectedDoctor) {
        message.error('Vui lòng chọn bác sĩ');
        return;
      }
      if (!reason) {
        message.error('Vui lòng nhập lý do khám');
        return;
      }
      setFormData({
        ...formData,
        departmentId: selectedDepartment,
        doctorId: selectedDoctor,
        reason,
      });
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Validate date selection
      if (!selectedDate) {
        message.error('Vui lòng chọn ngày khám');
        return;
      }
      setFormData({
        ...formData,
        appointmentDate: selectedDate.format('YYYY-MM-DD'),
      });
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate slot selection
      if (!selectedSlot) {
        message.error('Vui lòng chọn khung giờ');
        return;
      }
      setFormData({
        ...formData,
        appointmentDate: selectedDate.format(`YYYY-MM-DD ${selectedSlot.time}`),
      });
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const confirmationDetails = form.getFieldValue('notes');
      const appointmentPayload = {
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        reason: formData.reason,
        notes: confirmationDetails || '',
      };

      setLoading(true);
      const response = await appointmentAPI.createAppointment(appointmentPayload);
      
      message.success('Lịch hẹn đã được tạo thành công!');
      
      // Show confirmation modal
      Modal.success({
        title: 'Đặt lịch thành công',
        content: `
          Lịch hẹn của bạn đã được tạo.
          
          Bác sĩ: ${response.data?.doctorId?.name || 'N/A'}
          Ngày: ${dayjs(response.data?.appointmentDate).format('DD/MM/YYYY HH:mm')}
          
          Vui lòng kiểm tra email để nhận xác nhận.
        `,
        onOk() {
          navigate('/patient/appointments');
        },
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      message.error(error.response?.data?.message || 'Không thể tạo lịch hẹn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Chọn khoa & bác sĩ', description: 'Chọn khoa và bác sĩ' },
    { title: 'Chọn ngày', description: 'Chọn ngày khám' },
    { title: 'Chọn giờ', description: 'Chọn khung giờ' },
    { title: 'Xác nhận', description: 'Xác nhận lịch hẹn' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <Button
          type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/patient/appointments')}
            className="text-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Đặt lịch khám mới</h1>
            <p className="text-gray-500">Chọn khoa, bác sĩ và thời gian phù hợp</p>
          </div>
        </div>

        <Card className="rounded-xl">
          <Steps
            current={currentStep}
            items={steps}
            className="mb-8"
          />

          <Spin spinning={loading}>
            {/* Step 1: Select Department and Doctor */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onValuesChange={(_, values) => {
                    setFormData({ ...formData, ...values });
                  }}
                >
                  <Form.Item
                    label="Chọn khoa/phòng khám"
                    name="department"
                    rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
                  >
                    <Select
                      placeholder="Tìm kiếm khoa..."
                      loading={loading}
                      onChange={handleSelectDepartment}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={departments.map(dept => ({
                        label: dept,
                        value: dept,
                      }))}
                    />
                  </Form.Item>

                  {selectedDepartment && (
                    <div className="mb-4 p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Khoa được chọn: <span className="font-semibold">{selectedDepartment}</span>
                      </p>
                    </div>
                  )}

                  <Form.Item
                    label="Chọn bác sĩ"
                    name="doctor"
                    rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
                  >
                    <Select
                      placeholder={selectedDepartment ? "Tìm kiếm bác sĩ..." : "Vui lòng chọn khoa trước"}
                      loading={loading}
                      onChange={handleSelectDoctor}
                      disabled={!selectedDepartment}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={filteredDoctors.map(doctor => ({
                        label: (
                          <div className="flex items-center justify-between w-full">
                            <span>{doctor.personalInfo?.firstName} {doctor.personalInfo?.lastName}</span>
                            <span className="text-xs text-gray-500">
                              {doctor.doctorInfo?.specialization || 'Chuyên khoa'}
                            </span>
                          </div>
                        ),
                        value: doctor._id,
                      }))}
                      notFoundContent={selectedDepartment && filteredDoctors.length === 0 ? "Không có bác sĩ nào trong khoa này" : "Chọn khoa để xem danh sách"}
                    />
                  </Form.Item>

                  {selectedDoctor && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Bác sĩ được chọn: <span className="font-semibold">
                          {filteredDoctors.find(d => d._id === selectedDoctor)?.personalInfo?.firstName} 
                          {' '}
                          {filteredDoctors.find(d => d._id === selectedDoctor)?.personalInfo?.lastName}
                        </span>
                      </p>
                    </div>
                  )}

                  <Form.Item
                    label="Lý do khám"
                    name="reason"
                    rules={[{ required: true, message: 'Vui lòng nhập lý do khám' }]}
                  >
                    <Input.TextArea
                      placeholder="Mô tả lý do bạn muốn khám..."
                      rows={4}
                    />
                  </Form.Item>
                </Form>
              </motion.div>
            )}

            {/* Step 2: Select Date */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-6">
                  <Card className="bg-blue-50 border-blue-200">
                    <Row gutter={16}>
                      <Col span={12}>
                        <p className="text-sm text-gray-600">Khoa được chọn</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedDepartment}
                        </p>
                      </Col>
                      <Col span={12}>
                        <p className="text-sm text-gray-600">Bác sĩ được chọn</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {filteredDoctors.find(d => d._id === selectedDoctor)?.personalInfo?.firstName} 
                          {' '}
                          {filteredDoctors.find(d => d._id === selectedDoctor)?.personalInfo?.lastName}
                        </p>
                      </Col>
                    </Row>
                  </Card>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Chọn ngày khám</h3>
                    <DatePicker
                      fullWidth
                      style={{ width: '100%', height: '40px' }}
                      placeholder="Chọn ngày"
                      onChange={handleSelectDate}
                      value={selectedDate}
                      disabledDate={(current) =>
                        !current ||
                        current.isBefore(dayjs(), 'day') ||
                        current.isAfter(dayjs().add(3, 'months'), 'day')
                      }
                      format="DD/MM/YYYY"
                    />
                  </div>

                  {selectedDate && (
                    <Card className="bg-green-50 border-green-200">
                      <p className="text-sm text-gray-600">Ngày được chọn</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedDate.format('dddd, DD/MM/YYYY')}
                      </p>
                    </Card>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Select Time Slot */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-6">
                  <Card className="bg-blue-50 border-blue-200">
                    <Row gutter={16}>
                      <Col span={8}>
                        <p className="text-sm text-gray-600">Khoa</p>
                        <p className="text-base font-semibold text-gray-900">
                          {selectedDepartment}
                        </p>
                      </Col>
                      <Col span={8}>
                        <p className="text-sm text-gray-600">Bác sĩ</p>
                        <p className="text-base font-semibold text-gray-900">
                          {filteredDoctors.find(d => d._id === selectedDoctor)?.personalInfo?.firstName}
                        </p>
                      </Col>
                      <Col span={8}>
                        <p className="text-sm text-gray-600">Ngày khám</p>
                        <p className="text-base font-semibold text-gray-900">
                          {selectedDate?.format('DD/MM/YYYY')}
                        </p>
                      </Col>
                    </Row>
                  </Card>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Chọn khung giờ</h3>
                    {loadingSlots ? (
                      <div className="flex justify-center py-8">
                        <Spin />
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <Row gutter={[16, 16]}>
                        {availableSlots.map((slot, idx) => (
                          <Col key={idx} xs={24} sm={12} md={8} lg={6}>
                            <Card
                              className={`cursor-pointer text-center transition-all ${
                                selectedSlot?.time === slot.time
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-blue-500'
                              }`}
                              onClick={() => handleSelectSlot(slot)}
                            >
                              <ClockCircleOutlined className="text-2xl mb-2" />
                              <p className="text-lg font-semibold">{slot.time}</p>
                              <Tag color={slot.available ? 'green' : 'red'} className="mt-2">
                                {slot.available ? 'Trống' : 'Đã đặt'}
                              </Tag>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Empty description="Không có khung giờ trống" />
                    )}
                  </div>

                  {selectedSlot && (
                    <Card className="bg-green-50 border-green-200">
                      <p className="text-sm text-gray-600">Khung giờ được chọn</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedSlot.time}</p>
                    </Card>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirm */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Form form={form} layout="vertical">
                  <div className="space-y-4 mb-6">
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">
                        Thông tin lịch hẹn
                      </h3>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">🏥 Khoa</p>
                            <p className="text-base font-semibold text-gray-900">
                              {selectedDepartment}
                            </p>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">👨‍⚕️ Bác sĩ</p>
                            <p className="text-base font-semibold text-gray-900">
                              {filteredDoctors.find(d => d._id === selectedDoctor)?.personalInfo?.firstName}{' '}
                              {filteredDoctors.find(d => d._id === selectedDoctor)?.personalInfo?.lastName}
                            </p>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">📋 Chuyên khoa</p>
                            <p className="text-base font-semibold text-gray-900">
                              {filteredDoctors.find(d => d._id === selectedDoctor)?.doctorInfo?.specialization || 'N/A'}
                            </p>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">📅 Ngày khám</p>
                            <p className="text-base font-semibold text-gray-900">
                              {selectedDate?.format('dddd, DD/MM/YYYY')}
                            </p>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">⏰ Giờ khám</p>
                            <p className="text-base font-semibold text-gray-900">
                              {selectedSlot?.time}
                            </p>
                          </div>
                        </Col>
                        <Col xs={24}>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">💬 Lý do khám</p>
                            <p className="text-base font-semibold text-gray-900">
                              {formData.reason}
                            </p>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </div>

                  <Divider />

                  <Form.Item
                    label="Ghi chú hoặc yêu cầu đặc biệt (tùy chọn)"
                    name="notes"
                  >
                    <Input.TextArea
                      placeholder="Nhập bất kỳ ghi chú hay yêu cầu đặc biệt nào..."
                      rows={4}
                    />
                  </Form.Item>

                  <Card className="bg-yellow-50 border-yellow-200 mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                      ⚠️ Các điều khoản
                    </p>
                    <p className="text-xs text-gray-600">
                      Bằng cách xác nhận, bạn đồng ý với các điều khoản và điều kiện của chúng tôi.
                      Vui lòng đến sớm 10 phút trước giờ hẹn.
                    </p>
                  </Card>
                </Form>
              </motion.div>
            )}
          </Spin>

          <Divider />

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => navigate('/patient/appointments')}>
              Hủy
            </Button>
            <Button onClick={handlePrevStep} disabled={currentStep === 0}>
              Quay lại
            </Button>
            {currentStep < 3 ? (
              <Button type="primary" onClick={handleNextStep} loading={loading}>
                Tiếp tục
              </Button>
            ) : (
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                Xác nhận đặt lịch
              </Button>
            )}
          </Space>
        </Card>
      </motion.div>
  );
};

export default CreateAppointmentPage;
