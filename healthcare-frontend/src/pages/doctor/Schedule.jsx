// src/pages/doctor/Schedule.jsx - Quản lý lịch làm việc cho bác sĩ
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SaveOutlined,
    StopOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Form,
    List,
    message,
    Modal,
    Row,
    Select,
    Skeleton,
    Space,
    Table,
    Tabs,
    Tag,
    TimePicker
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  // Load schedules
  const loadSchedules = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
      };
      const res = await appointmentAPI.getDoctorSchedule('me', params);
      const data = res.data?.data || res.data || [];
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading schedules:', error);
      message.error('Lỗi tải lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  // Load doctor's appointments
  const loadAppointments = async (doctorId = 'me') => {
    try {
      setLoadingAppointments(true);
      const res = await appointmentAPI.getDoctorAppointments(doctorId, {
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().add(30, 'days').format('YYYY-MM-DD'),
      });
      const data = res.data?.data || res.data || [];
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      message.error('Lỗi tải lịch hẹn');
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    loadSchedules();
    loadAppointments();
  }, []);

  const handleAddSchedule = async (values) => {
    try {
      if (editingSchedule) {
        // Update existing schedule
        await appointmentAPI.updateDoctorSchedule(editingSchedule._id, {
          dayOfWeek: values.dayOfWeek,
          startTime: values.startTime.format('HH:mm'),
          endTime: values.endTime.format('HH:mm'),
          isAvailable: true,
        });
        message.success('Cập nhật lịch làm việc thành công');
      } else {
        // Create new schedule
        await appointmentAPI.createDoctorSchedule({
          dayOfWeek: values.dayOfWeek,
          startTime: values.startTime.format('HH:mm'),
          endTime: values.endTime.format('HH:mm'),
          isAvailable: true,
        });
        message.success('Thêm lịch làm việc thành công');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingSchedule(null);
      loadSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      message.error('Lỗi lưu lịch làm việc');
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    form.setFieldsValue({
      dayOfWeek: schedule.dayOfWeek,
      startTime: dayjs(schedule.startTime, 'HH:mm'),
      endTime: dayjs(schedule.endTime, 'HH:mm'),
    });
    setModalVisible(true);
  };

  const handleDeleteSchedule = (scheduleId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa lịch làm việc này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Không',
      onOk: async () => {
        try {
          await appointmentAPI.deleteDoctorSchedule(scheduleId);
          message.success('Xóa lịch làm việc thành công');
          loadSchedules();
        } catch (error) {
          message.error('Lỗi xóa lịch làm việc');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Ngày',
      key: 'dayOfWeek',
      width: '20%',
      render: (_, record) => <span className="font-semibold">{daysOfWeek[record.dayOfWeek - 1]}</span>,
    },
    {
      title: 'Thời gian bắt đầu',
      key: 'startTime',
      width: '20%',
      render: (_, record) => record.startTime,
    },
    {
      title: 'Thời gian kết thúc',
      key: 'endTime',
      width: '20%',
      render: (_, record) => record.endTime,
    },
    {
      title: 'Trạng thái',
      key: 'isAvailable',
      width: '15%',
      render: (_, record) => (
        <Tag color={record.isAvailable ? 'green' : 'red'}>
          {record.isAvailable ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '25%',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSchedule(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSchedule(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <DoctorLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Quản lý Lịch làm việc</h1>
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
        </div>

        {/* Info Card */}
        <Card className="rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-4">
            <CalendarOutlined className="text-3xl text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">Hướng dẫn</p>
              <p className="text-gray-700">
                Tạo lịch làm việc hàng tuần. Bệnh nhân sẽ chỉ có thể đặt lịch trong khoảng thời gian này.
              </p>
            </div>
          </div>
        </Card>

        {/* Schedule Table */}
        <Card className="rounded-lg">
          {loading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : (
            <Table
              columns={columns}
              dataSource={schedules}
              rowKey="_id"
              pagination={false}
              locale={{ emptyText: 'Chưa có lịch làm việc' }}
              scroll={{ x: 1000 }}
            />
          )}
        </Card>

        {/* Weekly Schedule Overview */}
        <Card title="Lịch làm việc hàng tuần" className="rounded-lg">
          {schedules.length > 0 ? (
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const schedule = schedules.find(s => s.dayOfWeek === day);
                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={day}>
                    <Card className="rounded-lg border-l-4 border-blue-600">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{daysOfWeek[day - 1]}</p>
                        <Divider />
                        {schedule ? (
                          <>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm text-gray-600">Thời gian</p>
                                <p className="font-semibold text-gray-900">
                                  {schedule.startTime} - {schedule.endTime}
                                </p>
                              </div>
                              <Tag color={schedule.isAvailable ? 'green' : 'red'}>
                                {schedule.isAvailable ? 'Hoạt động' : 'Tạm dừng'}
                              </Tag>
                            </div>
                            <Divider />
                            <Space size="small">
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handleEditSchedule(schedule)}
                              >
                                Sửa
                              </Button>
                              <Button
                                danger
                                size="small"
                                onClick={() => handleDeleteSchedule(schedule._id)}
                              >
                                Xóa
                              </Button>
                            </Space>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">Không làm việc</p>
                        )}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <Empty description="Chưa có lịch làm việc" />
          )}
        </Card>

        {/* Modal */}
        <Modal
          title={editingSchedule ? 'Sửa lịch làm việc' : 'Thêm lịch làm việc'}
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
            onFinish={handleAddSchedule}
            className="mt-6"
          >
            <Form.Item
              label="Ngày trong tuần"
              name="dayOfWeek"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <Select
                placeholder="Chọn ngày"
                options={daysOfWeek.map((day, index) => ({
                  label: day,
                  value: index + 1,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Thời gian bắt đầu"
              name="startTime"
              rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
            >
              <TimePicker format="HH:mm" />
            </Form.Item>

            <Form.Item
              label="Thời gian kết thúc"
              name="endTime"
              rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc' }]}
            >
              <TimePicker format="HH:mm" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block icon={<SaveOutlined />}>
                {editingSchedule ? 'Cập nhật' : 'Thêm'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Appointments Tab */}
        <Card title="Lịch hẹn của tôi" className="rounded-lg mt-6">
          <Tabs>
            <Tabs.TabPane
              tab={
                <span>
                  <CheckCircleOutlined /> Sắp tới ({appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length})
                </span>
              }
              key="upcoming"
            >
              {loadingAppointments ? (
                <Skeleton active paragraph={{ rows: 5 }} />
              ) : appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length > 0 ? (
                <List
                  dataSource={appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING')}
                  renderItem={appt => (
                    <List.Item className="py-4 border-b border-gray-200 last:border-b-0">
                      <List.Item.Meta
                        avatar={<Avatar icon="user" />}
                        title={appt.patientId?.personalInfo?.firstName || 'Bệnh nhân'}
                        description={
                          <div className="space-y-1">
                            <p className="font-medium">{dayjs(appt.appointmentDate).format('DD/MM/YYYY HH:mm')}</p>
                            <p className="text-gray-600 text-sm">{appt.reason}</p>
                          </div>
                        }
                      />
                      <div className="flex gap-2">
                        <Tag color={appt.status === 'CONFIRMED' ? 'green' : 'orange'}>
                          {appt.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                        </Tag>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Không có lịch hẹn sắp tới" />
              )}
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={
                <span>
                  <StopOutlined /> Đã hủy ({appointments.filter(a => a.status === 'CANCELLED').length})
                </span>
              }
              key="cancelled"
            >
              {loadingAppointments ? (
                <Skeleton active paragraph={{ rows: 5 }} />
              ) : appointments.filter(a => a.status === 'CANCELLED').length > 0 ? (
                <List
                  dataSource={appointments.filter(a => a.status === 'CANCELLED')}
                  renderItem={appt => (
                    <List.Item className="py-4 border-b border-gray-200 last:border-b-0">
                      <List.Item.Meta
                        avatar={<Avatar icon="user" />}
                        title={appt.patientId?.personalInfo?.firstName || 'Bệnh nhân'}
                        description={
                          <div className="space-y-1">
                            <p className="font-medium text-gray-500">{dayjs(appt.appointmentDate).format('DD/MM/YYYY HH:mm')}</p>
                            <p className="text-gray-400 text-sm line-through">{appt.reason}</p>
                          </div>
                        }
                      />
                      <Tag color="red">Đã hủy</Tag>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Không có lịch hẹn bị hủy" />
              )}
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={
                <span>
                  <CheckCircleOutlined /> Hoàn tất ({appointments.filter(a => a.status === 'COMPLETED').length})
                </span>
              }
              key="completed"
            >
              {loadingAppointments ? (
                <Skeleton active paragraph={{ rows: 5 }} />
              ) : appointments.filter(a => a.status === 'COMPLETED').length > 0 ? (
                <List
                  dataSource={appointments.filter(a => a.status === 'COMPLETED')}
                  renderItem={appt => (
                    <List.Item className="py-4 border-b border-gray-200 last:border-b-0">
                      <List.Item.Meta
                        avatar={<Avatar icon="user" />}
                        title={appt.patientId?.personalInfo?.firstName || 'Bệnh nhân'}
                        description={
                          <div className="space-y-1">
                            <p className="font-medium">{dayjs(appt.appointmentDate).format('DD/MM/YYYY HH:mm')}</p>
                            <p className="text-gray-600 text-sm">{appt.reason}</p>
                          </div>
                        }
                      />
                      <Tag color="green">Hoàn tất</Tag>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Không có lịch hẹn hoàn tất" />
              )}
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default DoctorSchedule;
