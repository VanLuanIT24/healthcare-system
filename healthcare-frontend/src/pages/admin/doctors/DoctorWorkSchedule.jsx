// src/pages/admin/doctors/DoctorWorkSchedule.jsx
// Quản lý lịch làm việc (giờ làm việc) của bác sĩ
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { departmentAPI } from '@/services/api/departmentAPI';
import { doctorAPI } from '@/services/api/doctorAPI';
import { doctorScheduleAPI } from '@/services/api/doctorScheduleAPI';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SaveOutlined,
    ScheduleOutlined
} from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    Col,
    DatePicker,
    Empty,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Tabs,
    Tag,
    TimePicker,
    Typography,
    message
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

dayjs.locale('vi');

const { Title, Text } = Typography;

// Các ngày trong tuần
const DAYS_OF_WEEK = [
  { value: 1, label: 'Thứ 2', short: 'T2' },
  { value: 2, label: 'Thứ 3', short: 'T3' },
  { value: 3, label: 'Thứ 4', short: 'T4' },
  { value: 4, label: 'Thứ 5', short: 'T5' },
  { value: 5, label: 'Thứ 6', short: 'T6' },
  { value: 6, label: 'Thứ 7', short: 'T7' },
  { value: 0, label: 'Chủ nhật', short: 'CN' }
];

const DoctorWorkSchedule = () => {
  const [searchParams] = useSearchParams();
  const doctorIdFromParams = searchParams.get('doctorId');

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(doctorIdFromParams || null);
  const [regularSchedules, setRegularSchedules] = useState([]);
  const [specialSchedules, setSpecialSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [regularModalVisible, setRegularModalVisible] = useState(false);
  const [specialModalVisible, setSpecialModalVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  const [regularForm] = Form.useForm();
  const [specialForm] = Form.useForm();
  const [leaveForm] = Form.useForm();

  // Load doctors và departments
  useEffect(() => {
    const loadData = async () => {
      try {
        const [doctorsRes, deptsRes] = await Promise.all([
          doctorAPI.getDoctors({ limit: 999 }),
          departmentAPI.getDepartments()
        ]);
        
        setDoctors(doctorsRes?.data?.data || []);
        setDepartments(deptsRes?.data?.data || deptsRes?.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Load schedules khi chọn bác sĩ
  useEffect(() => {
    if (selectedDoctor) {
      loadDoctorSchedules();
    }
  }, [selectedDoctor]);

  const loadDoctorSchedules = async () => {
    try {
      setLoading(true);
      const response = await doctorScheduleAPI.getDoctorSchedules(selectedDoctor, {
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().add(30, 'days').format('YYYY-MM-DD')
      });

      if (response?.data?.data) {
        setRegularSchedules(response.data.data.regularSchedules || []);
        setSpecialSchedules(response.data.data.specialSchedules || []);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      message.error('Lỗi tải lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  // Tạo lịch cố định (REGULAR)
  const handleCreateRegularSchedule = async (values) => {
    try {
      setSaving(true);
      
      const scheduleData = {
        doctorId: selectedDoctor,
        scheduleType: 'REGULAR',
        dayOfWeek: values.dayOfWeek,
        startTime: values.workTime[0].format('HH:mm'),
        endTime: values.workTime[1].format('HH:mm'),
        breakStart: values.breakTime?.[0]?.format('HH:mm'),
        breakEnd: values.breakTime?.[1]?.format('HH:mm'),
        slotDuration: values.slotDuration || 30,
        maxPatientsPerSlot: values.maxPatientsPerSlot || 1,
        room: values.room,
        departmentId: values.departmentId,
        consultationType: values.consultationType || 'IN_PERSON',
        notes: values.notes
      };

      if (editingSchedule) {
        await doctorScheduleAPI.updateSchedule(editingSchedule._id, scheduleData);
        message.success('Cập nhật lịch thành công');
      } else {
        await doctorScheduleAPI.createSchedule(scheduleData);
        message.success('Tạo lịch thành công');
      }

      setRegularModalVisible(false);
      regularForm.resetFields();
      setEditingSchedule(null);
      loadDoctorSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      message.error(error.response?.data?.message || 'Lỗi lưu lịch');
    } finally {
      setSaving(false);
    }
  };

  // Tạo lịch đặc biệt (SPECIAL)
  const handleCreateSpecialSchedule = async (values) => {
    try {
      setSaving(true);
      
      const scheduleData = {
        doctorId: selectedDoctor,
        scheduleType: 'SPECIAL',
        specificDate: values.specificDate.format('YYYY-MM-DD'),
        startTime: values.workTime[0].format('HH:mm'),
        endTime: values.workTime[1].format('HH:mm'),
        breakStart: values.breakTime?.[0]?.format('HH:mm'),
        breakEnd: values.breakTime?.[1]?.format('HH:mm'),
        slotDuration: values.slotDuration || 30,
        room: values.room,
        notes: values.notes
      };

      await doctorScheduleAPI.createSchedule(scheduleData);
      message.success('Tạo lịch đặc biệt thành công');

      setSpecialModalVisible(false);
      specialForm.resetFields();
      loadDoctorSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      message.error(error.response?.data?.message || 'Lỗi lưu lịch');
    } finally {
      setSaving(false);
    }
  };

  // Tạo ngày nghỉ (LEAVE)
  const handleCreateLeave = async (values) => {
    try {
      setSaving(true);
      
      const scheduleData = {
        doctorId: selectedDoctor,
        scheduleType: 'LEAVE',
        specificDate: values.specificDate.format('YYYY-MM-DD'),
        leaveReason: values.leaveReason
      };

      await doctorScheduleAPI.createSchedule(scheduleData);
      message.success('Đăng ký nghỉ thành công');

      setLeaveModalVisible(false);
      leaveForm.resetFields();
      loadDoctorSchedules();
    } catch (error) {
      console.error('Error saving leave:', error);
      message.error(error.response?.data?.message || 'Lỗi đăng ký nghỉ');
    } finally {
      setSaving(false);
    }
  };

  // Xóa lịch
  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await doctorScheduleAPI.deleteSchedule(scheduleId);
      message.success('Xóa lịch thành công');
      loadDoctorSchedules();
    } catch (error) {
      message.error('Lỗi xóa lịch');
    }
  };

  // Edit regular schedule
  const handleEditRegular = (schedule) => {
    setEditingSchedule(schedule);
    regularForm.setFieldsValue({
      dayOfWeek: schedule.dayOfWeek,
      workTime: [dayjs(schedule.startTime, 'HH:mm'), dayjs(schedule.endTime, 'HH:mm')],
      breakTime: schedule.breakStart && schedule.breakEnd 
        ? [dayjs(schedule.breakStart, 'HH:mm'), dayjs(schedule.breakEnd, 'HH:mm')]
        : undefined,
      slotDuration: schedule.slotDuration,
      maxPatientsPerSlot: schedule.maxPatientsPerSlot,
      room: schedule.room,
      departmentId: schedule.department?._id,
      consultationType: schedule.consultationType,
      notes: schedule.notes
    });
    setRegularModalVisible(true);
  };

  // Tạo lịch hàng loạt cho cả tuần
  const handleBulkCreate = async () => {
    try {
      setSaving(true);
      
      // Tạo lịch mặc định cho các ngày trong tuần (T2-T6)
      const defaultSchedules = [1, 2, 3, 4, 5].map(day => ({
        dayOfWeek: day,
        startTime: '08:00',
        endTime: '17:00',
        breakStart: '12:00',
        breakEnd: '13:30',
        slotDuration: 30,
        maxPatientsPerSlot: 1,
        consultationType: 'IN_PERSON'
      }));

      await doctorScheduleAPI.bulkCreateSchedules(selectedDoctor, defaultSchedules);
      message.success('Tạo lịch mặc định thành công (T2-T6, 8:00-17:00)');
      loadDoctorSchedules();
    } catch (error) {
      message.error('Lỗi tạo lịch hàng loạt');
    } finally {
      setSaving(false);
    }
  };

  // Columns cho bảng lịch cố định
  const regularColumns = [
    {
      title: 'Ngày',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (day) => {
        const dayInfo = DAYS_OF_WEEK.find(d => d.value === day);
        return <Tag color="blue">{dayInfo?.label}</Tag>;
      },
      sorter: (a, b) => a.dayOfWeek - b.dayOfWeek
    },
    {
      title: 'Giờ làm việc',
      key: 'workTime',
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{record.startTime} - {record.endTime}</Text>
        </Space>
      )
    },
    {
      title: 'Nghỉ trưa',
      key: 'breakTime',
      render: (_, record) => (
        record.breakStart && record.breakEnd 
          ? <Text type="secondary">{record.breakStart} - {record.breakEnd}</Text>
          : <Text type="secondary">-</Text>
      )
    },
    {
      title: 'Slot (phút)',
      dataIndex: 'slotDuration',
      key: 'slotDuration',
      render: (duration) => <Tag>{duration} phút</Tag>
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      key: 'room',
      render: (room) => room || '-'
    },
    {
      title: 'Loại khám',
      dataIndex: 'consultationType',
      key: 'consultationType',
      render: (type) => {
        const types = {
          'IN_PERSON': { label: 'Trực tiếp', color: 'green' },
          'ONLINE': { label: 'Online', color: 'blue' },
          'BOTH': { label: 'Cả hai', color: 'purple' }
        };
        return <Tag color={types[type]?.color}>{types[type]?.label}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditRegular(record)}
          />
          <Popconfirm
            title="Xóa lịch này?"
            onConfirm={() => handleDeleteSchedule(record._id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Columns cho bảng lịch đặc biệt/nghỉ
  const specialColumns = [
    {
      title: 'Ngày',
      dataIndex: 'specificDate',
      key: 'specificDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY (dddd)'),
      sorter: (a, b) => new Date(a.specificDate) - new Date(b.specificDate)
    },
    {
      title: 'Loại',
      dataIndex: 'scheduleType',
      key: 'scheduleType',
      render: (type) => (
        type === 'LEAVE' 
          ? <Tag color="red">Nghỉ</Tag>
          : <Tag color="orange">Lịch đặc biệt</Tag>
      )
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        record.scheduleType === 'LEAVE' 
          ? <Text type="secondary">Cả ngày</Text>
          : <Text>{record.startTime} - {record.endTime}</Text>
      )
    },
    {
      title: 'Lý do/Ghi chú',
      key: 'reason',
      render: (_, record) => record.leaveReason || record.notes || '-'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Xóa lịch này?"
          onConfirm={() => handleDeleteSchedule(record._id)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  const doctorInfo = doctors.find(d => d._id === selectedDoctor);

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Title level={2}>
          <ScheduleOutlined /> Quản Lý Lịch Làm Việc Bác Sĩ
        </Title>

        {/* Chọn bác sĩ */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Text strong>Chọn Bác Sĩ</Text>
              <Select
                style={{ width: '100%', marginTop: '8px' }}
                placeholder="Tìm bác sĩ..."
                value={selectedDoctor}
                onChange={setSelectedDoctor}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase?.().includes(input.toLowerCase())
                }
              >
                {doctors.map(doctor => (
                  <Select.Option key={doctor._id} value={doctor._id}>
                    {doctor.personalInfo?.firstName} {doctor.personalInfo?.lastName}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            {selectedDoctor && (
              <Col xs={24} md={12}>
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingSchedule(null);
                      regularForm.resetFields();
                      setRegularModalVisible(true);
                    }}
                  >
                    Thêm lịch cố định
                  </Button>
                  <Button
                    icon={<CalendarOutlined />}
                    onClick={() => setSpecialModalVisible(true)}
                  >
                    Thêm lịch đặc biệt
                  </Button>
                  <Button
                    danger
                    icon={<ClockCircleOutlined />}
                    onClick={() => setLeaveModalVisible(true)}
                  >
                    Đăng ký nghỉ
                  </Button>
                  {regularSchedules.length === 0 && (
                    <Button
                      type="dashed"
                      icon={<SaveOutlined />}
                      onClick={handleBulkCreate}
                      loading={saving}
                    >
                      Tạo lịch mặc định (T2-T6)
                    </Button>
                  )}
                </Space>
              </Col>
            )}
          </Row>
        </Card>

        {/* Thông tin bác sĩ */}
        {doctorInfo && (
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Text strong>Họ tên: </Text>
                <Text>{doctorInfo.personalInfo?.firstName} {doctorInfo.personalInfo?.lastName}</Text>
              </Col>
              <Col span={6}>
                <Text strong>Email: </Text>
                <Text>{doctorInfo.email}</Text>
              </Col>
              <Col span={6}>
                <Text strong>Khoa: </Text>
                <Text>{doctorInfo.department?.name || doctorInfo.professionalInfo?.department || 'N/A'}</Text>
              </Col>
              <Col span={6}>
                <Text strong>Trạng thái: </Text>
                <Tag color={doctorInfo.status === 'ACTIVE' ? 'green' : 'red'}>
                  {doctorInfo.status}
                </Tag>
              </Col>
            </Row>
          </Card>
        )}

        {/* Bảng lịch */}
        {selectedDoctor ? (
          <Spin spinning={loading}>
            <Tabs 
              defaultActiveKey="regular"
              items={[
                {
                  key: 'regular',
                  label: <span><CalendarOutlined /> Lịch cố định hàng tuần ({regularSchedules.length})</span>,
                  children: regularSchedules.length > 0 ? (
                    <Table
                      columns={regularColumns}
                      dataSource={regularSchedules}
                      rowKey="_id"
                      pagination={false}
                    />
                  ) : (
                    <Empty description="Chưa có lịch làm việc cố định">
                      <Button type="primary" onClick={handleBulkCreate} loading={saving}>
                        Tạo lịch mặc định
                      </Button>
                    </Empty>
                  )
                },
                {
                  key: 'special',
                  label: <span><ClockCircleOutlined /> Lịch đặc biệt & Ngày nghỉ ({specialSchedules.length})</span>,
                  children: specialSchedules.length > 0 ? (
                    <Table
                      columns={specialColumns}
                      dataSource={specialSchedules}
                      rowKey="_id"
                      pagination={{ pageSize: 10 }}
                    />
                  ) : (
                    <Empty description="Chưa có lịch đặc biệt hoặc ngày nghỉ" />
                  )
                }
              ]}
            />
          </Spin>
        ) : (
          <Card>
            <Empty description="Vui lòng chọn bác sĩ để xem và quản lý lịch làm việc" />
          </Card>
        )}

        {/* Modal tạo/sửa lịch cố định */}
        <Modal
          title={editingSchedule ? 'Sửa lịch làm việc' : 'Thêm lịch làm việc cố định'}
          open={regularModalVisible}
          onCancel={() => {
            setRegularModalVisible(false);
            setEditingSchedule(null);
            regularForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={regularForm}
            layout="vertical"
            onFinish={handleCreateRegularSchedule}
            initialValues={{
              slotDuration: 30,
              maxPatientsPerSlot: 1,
              consultationType: 'IN_PERSON'
            }}
          >
            <Form.Item
              name="dayOfWeek"
              label="Ngày trong tuần"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <Select placeholder="Chọn ngày">
                {DAYS_OF_WEEK.map(day => (
                  <Select.Option key={day.value} value={day.value}>
                    {day.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="workTime"
              label="Giờ làm việc"
              rules={[{ required: true, message: 'Vui lòng chọn giờ làm việc' }]}
            >
              <TimePicker.RangePicker
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder={['Bắt đầu', 'Kết thúc']}
              />
            </Form.Item>

            <Form.Item
              name="breakTime"
              label="Giờ nghỉ trưa (không bắt buộc)"
            >
              <TimePicker.RangePicker
                format="HH:mm"
                style={{ width: '100%' }}
                placeholder={['Bắt đầu nghỉ', 'Kết thúc nghỉ']}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="slotDuration"
                  label="Thời lượng mỗi slot (phút)"
                >
                  <InputNumber min={10} max={120} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="maxPatientsPerSlot"
                  label="Số BN tối đa/slot"
                >
                  <InputNumber min={1} max={5} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="room" label="Phòng khám">
                  <Input placeholder="VD: Phòng 101" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="consultationType" label="Loại khám">
                  <Select>
                    <Select.Option value="IN_PERSON">Trực tiếp</Select.Option>
                    <Select.Option value="ONLINE">Online</Select.Option>
                    <Select.Option value="BOTH">Cả hai</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="departmentId" label="Khoa">
              <Select placeholder="Chọn khoa" allowClear>
                {departments.map(dept => (
                  <Select.Option key={dept._id} value={dept._id}>
                    {dept.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="notes" label="Ghi chú">
              <Input.TextArea rows={2} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving}>
                  {editingSchedule ? 'Cập nhật' : 'Tạo lịch'}
                </Button>
                <Button onClick={() => {
                  setRegularModalVisible(false);
                  setEditingSchedule(null);
                }}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal tạo lịch đặc biệt */}
        <Modal
          title="Thêm lịch làm việc đặc biệt"
          open={specialModalVisible}
          onCancel={() => {
            setSpecialModalVisible(false);
            specialForm.resetFields();
          }}
          footer={null}
          width={500}
        >
          <Alert
            message="Lịch đặc biệt sẽ ghi đè lịch cố định trong ngày đó"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form
            form={specialForm}
            layout="vertical"
            onFinish={handleCreateSpecialSchedule}
            initialValues={{ slotDuration: 30 }}
          >
            <Form.Item
              name="specificDate"
              label="Ngày"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="workTime"
              label="Giờ làm việc"
              rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
            >
              <TimePicker.RangePicker
                format="HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item name="breakTime" label="Giờ nghỉ (không bắt buộc)">
              <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="slotDuration" label="Thời lượng mỗi slot (phút)">
              <InputNumber min={10} max={120} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="room" label="Phòng">
              <Input placeholder="Phòng khám" />
            </Form.Item>

            <Form.Item name="notes" label="Ghi chú">
              <Input.TextArea rows={2} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving}>
                  Tạo lịch
                </Button>
                <Button onClick={() => setSpecialModalVisible(false)}>Hủy</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal đăng ký nghỉ */}
        <Modal
          title="Đăng ký ngày nghỉ"
          open={leaveModalVisible}
          onCancel={() => {
            setLeaveModalVisible(false);
            leaveForm.resetFields();
          }}
          footer={null}
          width={400}
        >
          <Form
            form={leaveForm}
            layout="vertical"
            onFinish={handleCreateLeave}
          >
            <Form.Item
              name="specificDate"
              label="Ngày nghỉ"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="leaveReason"
              label="Lý do nghỉ"
              rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
            >
              <Input.TextArea rows={3} placeholder="VD: Nghỉ phép năm, Hội nghị, ..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" danger htmlType="submit" loading={saving}>
                  Đăng ký nghỉ
                </Button>
                <Button onClick={() => setLeaveModalVisible(false)}>Hủy</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default DoctorWorkSchedule;
