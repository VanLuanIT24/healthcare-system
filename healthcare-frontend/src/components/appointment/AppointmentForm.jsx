// src/components/appointment/AppointmentForm.jsx
import appointmentAPI from '@/services/api/appointmentAPI';
import { doctorAPI } from '@/services/api/doctorAPI';
import publicAPI from '@/services/api/publicAPI';
import { Button, Col, DatePicker, Divider, Form, Input, Row, Select, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const AppointmentForm = ({ 
  form, 
  initialData = null, 
  onSubmit, 
  loading = false,
  mode = 'create' // 'create', 'edit', 'reschedule'
}) => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [deptRes, doctorRes] = await Promise.all([
        publicAPI.getDepartments(),
        doctorAPI.getDoctors()
      ]);
      setDepartments(deptRes.data || []);
      setDoctors(doctorRes.data || []);

      if (initialData) {
        setSelectedDepartment(initialData.doctorId?.professionalInfo?.department);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Lỗi tải dữ liệu');
    } finally {
      setLoadingData(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!form.getFieldValue('doctorId') || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    try {
      setLoadingData(true);
      const response = await appointmentAPI.getAvailableSlots({
        doctorId: form.getFieldValue('doctorId'),
        date: selectedDate.format('YYYY-MM-DD')
      });
      setAvailableSlots(response.data?.availableSlots || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      message.error('Lỗi tải khung giờ');
      setAvailableSlots([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDoctorChange = () => {
    setAvailableSlots([]);
    loadAvailableSlots();
  };

  const handleDateChange = () => {
    setAvailableSlots([]);
    loadAvailableSlots();
  };

  const filteredDoctors = selectedDepartment
    ? doctors.filter(d => d.professionalInfo?.department === selectedDepartment)
    : doctors;

  return (
    <Spin spinning={loadingData}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={initialData || {}}
        autoComplete="off"
      >
        <Form.Item
          label="Bác sĩ"
          name="doctorId"
          rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
        >
          <Select
            placeholder="Chọn bác sĩ"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={filteredDoctors.map(doctor => ({
              label: `${doctor.fullName}`,
              value: doctor._id
            }))}
            onChange={handleDoctorChange}
          />
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={mode === 'reschedule' ? 'Ngày hẹn mới' : 'Ngày hẹn'}
              name="appointmentDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                disabledDate={(current) => current && current.isBefore(dayjs(), 'day')}
                onChange={(date) => {
                  setSelectedDate(date);
                  setTimeout(loadAvailableSlots, 100);
                }}
              />
            </Form.Item>
          </Col>

          {mode !== 'reschedule' && (
            <Col xs={24} sm={12}>
              <Form.Item
                label="Khung giờ"
                name="slot"
                rules={[{ required: true, message: 'Vui lòng chọn khung giờ' }]}
              >
                <Select
                  placeholder="Chọn khung giờ"
                  options={availableSlots.map(slot => ({
                    label: slot.time || slot,
                    value: slot.time || slot
                  }))}
                  disabled={availableSlots.length === 0}
                />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Form.Item
          label="Lý do khám"
          name="reason"
          rules={[{ required: true, message: 'Vui lòng nhập lý do khám' }]}
        >
          <Input.TextArea 
            placeholder="Mô tả lý do khám bệnh"
            rows={3}
          />
        </Form.Item>

        <Form.Item
          label="Ghi chú thêm"
          name="notes"
        >
          <Input.TextArea 
            placeholder="Ghi chú thêm (tùy chọn)"
            rows={2}
          />
        </Form.Item>

        <Divider />

        <Row justify="end" gutter={[8, 8]}>
          <Col>
            <Button onClick={() => form.resetFields()}>
              Xóa
            </Button>
          </Col>
          <Col>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
            >
              {mode === 'create' ? 'Tạo lịch hẹn' : mode === 'reschedule' ? 'Đổi lịch' : 'Cập nhật'}
            </Button>
          </Col>
        </Row>
      </Form>
    </Spin>
  );
};

export default AppointmentForm;
