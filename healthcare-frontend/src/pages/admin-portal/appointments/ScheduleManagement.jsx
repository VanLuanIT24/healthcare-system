import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Badge,
    Button,
    Calendar,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Form,
    Input,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tag,
    TimePicker,
    Tooltip,
    Typography,
    message
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ScheduleManagement = () => {
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchDoctorSchedules();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/users?role=DOCTOR`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDoctors(response.data.users || []);
    } catch (error) {
      console.error('Fetch doctors error:', error);
      // Use mock data if API returns 401 or 404
      if (error.response?.status === 401 || error.response?.status === 404) {
        setDoctors(getMockDoctors());
      } else {
        message.error('Không thể tải danh sách bác sĩ');
      }
    }
  };

  // Mock data function
  const getMockDoctors = () => [
    {
      _id: '1',
      personalInfo: {
        firstName: 'BS. Nguyễn',
        lastName: 'Văn A'
      },
      professionalInfo: {
        department: 'Tim mạch',
        specialization: 'Bác sĩ Tim mạch'
      }
    },
    {
      _id: '2',
      personalInfo: {
        firstName: 'BS. Trần',
        lastName: 'Thị B'
      },
      professionalInfo: {
        department: 'Nội khoa',
        specialization: 'Bác sĩ Nội khoa'
      }
    },
    {
      _id: '3',
      personalInfo: {
        firstName: 'BS. Lê',
        lastName: 'Văn C'
      },
      professionalInfo: {
        department: 'Ngoại khoa',
        specialization: 'Bác sĩ Ngoại khoa'
      }
    }
  ];

  const fetchDoctorSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/schedules/doctor/${selectedDoctor}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            startDate: selectedDate.startOf('week').format('YYYY-MM-DD'),
            endDate: selectedDate.endOf('week').format('YYYY-MM-DD')
          }
        }
      );
      setSchedules(response.data.schedules || []);
    } catch (error) {
      message.error('Không thể tải lịch làm việc');
      console.error('Fetch schedules error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const scheduleData = {
        doctorId: selectedDoctor,
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm')
      };

      if (editingSchedule) {
        await axios.put(
          `${API_BASE_URL}/schedules/${editingSchedule._id}`,
          scheduleData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Đã cập nhật lịch làm việc');
      } else {
        await axios.post(
          `${API_BASE_URL}/schedules`,
          scheduleData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Đã tạo lịch làm việc');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingSchedule(null);
      fetchDoctorSchedules();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể lưu lịch làm việc');
    }
  };

  const deleteSchedule = async (scheduleId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa lịch làm việc này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(
            `${API_BASE_URL}/schedules/${scheduleId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success('Đã xóa lịch làm việc');
          fetchDoctorSchedules();
        } catch (error) {
          message.error('Không thể xóa lịch làm việc');
        }
      }
    });
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    form.setFieldsValue({
      date: moment(schedule.date),
      timeRange: [moment(schedule.startTime, 'HH:mm'), moment(schedule.endTime, 'HH:mm')],
      shiftType: schedule.shiftType,
      isOnCall: schedule.isOnCall,
      maxPatients: schedule.maxPatients,
      notes: schedule.notes
    });
    setModalVisible(true);
  };

  const getSchedulesByDate = (date) => {
    return schedules.filter(s => moment(s.date).isSame(date, 'day'));
  };

  const dateCellRender = (value) => {
    const daySchedules = getSchedulesByDate(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {daySchedules.map((schedule, index) => (
          <li key={index}>
            <Badge
              status={schedule.isOnCall ? 'warning' : 'success'}
              text={
                <Tooltip title={schedule.notes}>
                  <Text style={{ fontSize: 12 }}>
                    {schedule.startTime} - {schedule.endTime}
                    {schedule.isOnCall && ' 🚨'}
                  </Text>
                </Tooltip>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  // Weekly schedule table
  const weekDays = [];
  const startOfWeek = selectedDate.clone().startOf('week');
  for (let i = 0; i < 7; i++) {
    weekDays.push(startOfWeek.clone().add(i, 'days'));
  }

  const weekColumns = [
    {
      title: 'Ca',
      dataIndex: 'shift',
      key: 'shift',
      width: 100,
      fixed: 'left'
    },
    ...weekDays.map(day => ({
      title: (
        <div>
          <div>{day.format('ddd')}</div>
          <div style={{ fontSize: 12, fontWeight: 'normal' }}>{day.format('DD/MM')}</div>
        </div>
      ),
      key: day.format('YYYY-MM-DD'),
      render: (_, record) => {
        const daySchedules = schedules.filter(s => 
          moment(s.date).isSame(day, 'day') && 
          s.shiftType === record.shift
        );
        
        return daySchedules.map((schedule, idx) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <Tag color={schedule.isOnCall ? 'orange' : 'blue'}>
              {schedule.startTime} - {schedule.endTime}
            </Tag>
            <Space size="small">
              <Button 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(schedule)}
              />
              <Button 
                size="small" 
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteSchedule(schedule._id)}
              />
            </Space>
          </div>
        ));
      }
    }))
  ];

  const weekData = [
    { shift: 'MORNING', label: 'Sáng' },
    { shift: 'AFTERNOON', label: 'Chiều' },
    { shift: 'EVENING', label: 'Tối' },
    { shift: 'NIGHT', label: 'Đêm' }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý lịch làm việc
            </Title>
          </Col>
          <Col>
            <Space>
              <Select
                style={{ width: 250 }}
                placeholder="Chọn bác sĩ"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={setSelectedDoctor}
                value={selectedDoctor}
              >
                {doctors.map(doctor => (
                  <Option key={doctor._id} value={doctor._id}>
                    {doctor.personalInfo?.firstName} {doctor.personalInfo?.lastName} - 
                    {doctor.professionalInfo?.department}
                  </Option>
                ))}
              </Select>
              
              {selectedDoctor && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingSchedule(null);
                    form.resetFields();
                    setModalVisible(true);
                  }}
                >
                  Thêm lịch làm việc
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        {!selectedDoctor ? (
          <Card style={{ textAlign: 'center', padding: 40 }}>
            <UserOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
            <Title level={4} type="secondary">
              Vui lòng chọn bác sĩ để xem lịch làm việc
            </Title>
          </Card>
        ) : (
          <>
            <Card title="Lịch tuần" style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Button onClick={() => setSelectedDate(selectedDate.clone().subtract(1, 'week'))}>
                    ← Tuần trước
                  </Button>
                  <Button onClick={() => setSelectedDate(moment())}>
                    Tuần này
                  </Button>
                  <Button onClick={() => setSelectedDate(selectedDate.clone().add(1, 'week'))}>
                    Tuần sau →
                  </Button>
                  <Text strong>
                    Tuần {selectedDate.week()}: {selectedDate.startOf('week').format('DD/MM')} - 
                    {selectedDate.endOf('week').format('DD/MM/YYYY')}
                  </Text>
                </Space>
              </div>

              <Table
                columns={weekColumns}
                dataSource={weekData}
                loading={loading}
                rowKey="shift"
                pagination={false}
                scroll={{ x: 1200 }}
              />
            </Card>

            <Card title="Lịch tháng">
              <Calendar
                dateCellRender={dateCellRender}
                onSelect={(date) => setSelectedDate(date)}
              />
            </Card>
          </>
        )}
      </Card>

      {/* Create/Edit Schedule Modal */}
      <Modal
        title={editingSchedule ? 'Chỉnh sửa lịch làm việc' : 'Thêm lịch làm việc'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingSchedule(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={createSchedule}
        >
          <Form.Item
            name="date"
            label="Ngày làm việc"
            rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Khung giờ"
            rules={[{ required: true, message: 'Vui lòng chọn khung giờ' }]}
          >
            <TimePicker.RangePicker
              style={{ width: '100%' }}
              format="HH:mm"
              minuteStep={15}
            />
          </Form.Item>

          <Form.Item
            name="shiftType"
            label="Ca làm việc"
            rules={[{ required: true, message: 'Vui lòng chọn ca' }]}
          >
            <Select placeholder="Chọn ca">
              <Option value="MORNING">Sáng (7h - 12h)</Option>
              <Option value="AFTERNOON">Chiều (13h - 17h)</Option>
              <Option value="EVENING">Tối (17h - 21h)</Option>
              <Option value="NIGHT">Đêm (21h - 7h)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="maxPatients"
            label="Số bệnh nhân tối đa"
            initialValue={20}
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <Select>
              <Option value={10}>10 bệnh nhân</Option>
              <Option value={15}>15 bệnh nhân</Option>
              <Option value={20}>20 bệnh nhân</Option>
              <Option value={25}>25 bệnh nhân</Option>
              <Option value={30}>30 bệnh nhân</Option>
            </Select>
          </Form.Item>

          <Form.Item name="isOnCall" valuePropName="checked">
            <Checkbox>Trực khẩn cấp (On-call)</Checkbox>
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú về lịch làm việc..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSchedule ? 'Cập nhật' : 'Tạo lịch'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleManagement;
