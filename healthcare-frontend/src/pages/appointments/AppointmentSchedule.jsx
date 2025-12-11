// 📅 Appointment Schedule Form
import {
    SaveOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Alert,
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    message,
    Row,
    Select,
    Space,
    TimePicker
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import appointmentAPI from '../../services/api/appointmentAPI';
import patientAPI from '../../services/api/patientAPI';
import userAPI from '../../services/api/userAPI';
import './Appointment.css';

const { Option } = Select;
const { TextArea } = Input;

const AppointmentSchedule = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedDoctor]);

  const loadPatients = async () => {
    try {
      const response = await patientAPI.searchPatients('');
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error('Failed to load patients');
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await userAPI.getUsersByRole('DOCTOR');
      setDoctors(response.data.users || []);
    } catch (error) {
      console.error('Failed to load doctors');
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const response = await appointmentAPI.getAvailableSlots({
        doctorId: selectedDoctor,
        date: selectedDate.format('YYYY-MM-DD'),
      });
      setAvailableSlots(response.data.slots || []);
    } catch (error) {
      message.error('Không thể tải lịch trống');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const appointmentData = {
        ...values,
        appointmentDate: moment(
          `${selectedDate.format('YYYY-MM-DD')} ${values.appointmentTime.format('HH:mm')}`
        ).toISOString(),
      };
      delete appointmentData.appointmentTime;

      await appointmentAPI.createAppointment(appointmentData);
      message.success('Đặt lịch hẹn thành công');
      navigate('/appointments');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đặt lịch hẹn thất bại');
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };

  return (
    <div className="page-container appointment-schedule-container">
      <PageHeader
        title="Đặt lịch hẹn mới"
        subtitle="Tạo lịch hẹn khám bệnh"
        showBack
        backPath="/appointments"
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            priority: 'normal',
          }}
        >
          <div className="appointment-form-section">
            <h3>Thông tin bệnh nhân</h3>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="patientId"
                  label="Chọn bệnh nhân"
                  rules={[{ required: true, message: 'Vui lòng chọn bệnh nhân' }]}
                >
                  <Select
                    showSearch
                    placeholder="Tìm và chọn bệnh nhân"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {patients.map((patient) => (
                      <Option key={patient._id} value={patient._id}>
                        <Space>
                          <Avatar size="small" src={patient.profilePicture} icon={<UserOutlined />} />
                          {patient.fullName} - {patient.patientId}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="priority" label="Mức độ ưu tiên">
                  <Select>
                    <Option value="normal">Bình thường</Option>
                    <Option value="urgent">Ưu tiên</Option>
                    <Option value="emergency">Khẩn cấp</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="appointment-form-section">
            <h3>Thông tin bác sĩ và thời gian</h3>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="doctorId"
                  label="Chọn bác sĩ"
                  rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
                >
                  <Select
                    showSearch
                    placeholder="Tìm và chọn bác sĩ"
                    optionFilterProp="children"
                    onChange={(value) => setSelectedDoctor(value)}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {doctors.map((doctor) => (
                      <Option key={doctor._id} value={doctor._id}>
                        <Space>
                          <Avatar size="small" src={doctor.profilePicture} icon={<UserOutlined />} />
                          {doctor.fullName}
                          {doctor.position && ` - ${doctor.position}`}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="appointmentDatePicker"
                  label="Chọn ngày"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    disabledDate={disabledDate}
                    onChange={(date) => setSelectedDate(date)}
                    placeholder="Chọn ngày khám"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="appointmentTime"
                  label="Chọn giờ"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm"
                    minuteStep={15}
                    placeholder="Chọn giờ khám"
                  />
                </Form.Item>
              </Col>
            </Row>

            {availableSlots.length > 0 && (
              <Alert
                message="Lịch trống khả dụng"
                description={
                  <div className="time-slot-grid">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.time}
                        className={`time-slot ${slot.available ? '' : 'disabled'}`}
                        onClick={() => {
                          if (slot.available) {
                            form.setFieldsValue({
                              appointmentTime: moment(slot.time, 'HH:mm'),
                            });
                          }
                        }}
                      >
                        {slot.time}
                      </div>
                    ))}
                  </div>
                }
                type="info"
                style={{ marginTop: 16 }}
              />
            )}
          </div>

          <div className="appointment-form-section">
            <h3>Chi tiết lịch hẹn</h3>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="reason"
                  label="Lý do khám"
                  rules={[{ required: true, message: 'Vui lòng nhập lý do khám' }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Mô tả triệu chứng hoặc lý do cần khám..."
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item name="notes" label="Ghi chú (tùy chọn)">
                  <TextArea rows={2} placeholder="Ghi chú thêm nếu có..." />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="form-actions">
            <Button size="large" onClick={() => navigate('/appointments')}>
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              Đặt lịch hẹn
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AppointmentSchedule;
