import {
    ArrowLeftOutlined,
    CalendarOutlined,
    SaveOutlined
} from '@ant-design/icons';
import {
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
    TimePicker,
    Typography
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateAppointment = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const getMockPatients = () => ([
    {
      _id: 'PAT001',
      personalInfo: {
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        phone: '0901234567'
      }
    },
    {
      _id: 'PAT002',
      personalInfo: {
        firstName: 'Trần',
        lastName: 'Thị B',
        dateOfBirth: '1985-08-20',
        gender: 'female',
        phone: '0912345678'
      }
    },
    {
      _id: 'PAT003',
      personalInfo: {
        firstName: 'Lê',
        lastName: 'Văn C',
        dateOfBirth: '1995-03-10',
        gender: 'male',
        phone: '0923456789'
      }
    }
  ]);

  const getMockDoctors = () => ([
    {
      _id: 'DOC001',
      personalInfo: {
        firstName: 'BS.',
        lastName: 'Nguyễn Văn Minh'
      },
      professionalInfo: {
        specialization: 'Nội khoa',
        department: 'Khoa Nội'
      }
    },
    {
      _id: 'DOC002',
      personalInfo: {
        firstName: 'BS.',
        lastName: 'Trần Thị Lan'
      },
      professionalInfo: {
        specialization: 'Nhi khoa',
        department: 'Khoa Nhi'
      }
    },
    {
      _id: 'DOC003',
      personalInfo: {
        firstName: 'BS.',
        lastName: 'Lê Văn Hùng'
      },
      professionalInfo: {
        specialization: 'Tim mạch',
        department: 'Khoa Tim mạch'
      }
    }
  ]);

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data.data || response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        setPatients(getMockPatients());
      } else {
        message.error('Không thể tải danh sách bệnh nhân');
      }
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/users?role=DOCTOR`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data.data || response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        setDoctors(getMockDoctors());
      } else {
        message.error('Không thể tải danh sách bác sĩ');
      }
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const appointmentData = {
        patientId: values.patientId,
        doctorId: values.doctorId,
        appointmentDate: values.appointmentDate.format('YYYY-MM-DD'),
        appointmentTime: values.appointmentTime.format('HH:mm'),
        type: values.type,
        reason: values.reason,
        notes: values.notes,
        status: 'scheduled'
      };

      const response = await axios.post(
        `${API_BASE_URL}/appointments`,
        appointmentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success('Tạo lịch hẹn thành công!');
      navigate('/admin/appointments/list');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        // Mock success
        message.success('Tạo lịch hẹn thành công! (Mock data)');
        setTimeout(() => navigate('/admin/appointments/list'), 1000);
      } else {
        message.error(error.response?.data?.message || 'Không thể tạo lịch hẹn');
      }
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/appointments/list')}
                style={{ marginBottom: 16 }}
              >
                Quay lại
              </Button>
              <Title level={2}>
                <CalendarOutlined style={{ marginRight: 8 }} />
                Tạo lịch hẹn mới
              </Title>
              <Text type="secondary">Tạo lịch hẹn cho bệnh nhân</Text>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            style={{ maxWidth: 800 }}
          >
            <Card title="Thông tin lịch hẹn" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Bệnh nhân"
                    name="patientId"
                    rules={[{ required: true, message: 'Vui lòng chọn bệnh nhân' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Chọn bệnh nhân"
                      loading={loadingPatients}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {patients.map(patient => (
                        <Option key={patient._id} value={patient._id}>
                          {patient.personalInfo.firstName} {patient.personalInfo.lastName} - {patient.personalInfo.phone}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Bác sĩ"
                    name="doctorId"
                    rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Chọn bác sĩ"
                      loading={loadingDoctors}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {doctors.map(doctor => (
                        <Option key={doctor._id} value={doctor._id}>
                          {doctor.personalInfo.firstName} {doctor.personalInfo.lastName} - {doctor.professionalInfo?.specialization}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Ngày hẹn"
                    name="appointmentDate"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      disabledDate={disabledDate}
                      placeholder="Chọn ngày"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Giờ hẹn"
                    name="appointmentTime"
                    rules={[{ required: true, message: 'Vui lòng chọn giờ hẹn' }]}
                  >
                    <TimePicker
                      style={{ width: '100%' }}
                      format="HH:mm"
                      minuteStep={15}
                      placeholder="Chọn giờ"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Loại lịch hẹn"
                    name="type"
                    rules={[{ required: true, message: 'Vui lòng chọn loại lịch hẹn' }]}
                  >
                    <Select placeholder="Chọn loại lịch hẹn">
                      <Option value="consultation">Khám tư vấn</Option>
                      <Option value="follow-up">Tái khám</Option>
                      <Option value="emergency">Cấp cứu</Option>
                      <Option value="routine">Khám định kỳ</Option>
                      <Option value="vaccination">Tiêm chủng</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Lý do khám"
                    name="reason"
                    rules={[{ required: true, message: 'Vui lòng nhập lý do khám' }]}
                  >
                    <Input placeholder="Nhập lý do khám" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Ghi chú"
                name="notes"
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </Form.Item>
            </Card>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                >
                  Tạo lịch hẹn
                </Button>
                <Button
                  onClick={() => navigate('/admin/appointments/list')}
                  size="large"
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default CreateAppointment;
