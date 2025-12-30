// src/pages/admin/appointments/DoctorScheduleManagement.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import { doctorAPI } from '@/services/api/doctorAPI';
import { ClockCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Form, Modal, Row, Select, Skeleton, Space, Table, TimePicker, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const DoctorScheduleManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form] = Form.useForm();

  const daysOfWeek = [
    { value: 'MONDAY', label: 'Thứ 2' },
    { value: 'TUESDAY', label: 'Thứ 3' },
    { value: 'WEDNESDAY', label: 'Thứ 4' },
    { value: 'THURSDAY', label: 'Thứ 5' },
    { value: 'FRIDAY', label: 'Thứ 6' },
    { value: 'SATURDAY', label: 'Thứ 7' },
    { value: 'SUNDAY', label: 'Chủ nhật' }
  ];

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      loadSchedules();
    }
  }, [selectedDoctor]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getDoctors();
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      message.error('Lỗi tải danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    if (!selectedDoctor) return;

    try {
      setLoading(true);
      const response = await appointmentAPI.getDoctorSchedule(selectedDoctor);
      setSchedules(response.data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
      message.error('Lỗi tải lịch làm việc');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    form.setFieldsValue({
      dayOfWeek: schedule.dayOfWeek,
      startTime: dayjs(schedule.startTime, 'HH:mm'),
      endTime: dayjs(schedule.endTime, 'HH:mm')
    });
    setIsModalVisible(true);
  };

  const handleDeleteSchedule = (scheduleId) => {
    Modal.confirm({
      title: 'Xóa lịch làm việc',
      content: 'Bạn có chắc chắn muốn xóa lịch làm việc này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await appointmentAPI.deleteDoctorSchedule(scheduleId);
          message.success('Xóa lịch làm việc thành công');
          loadSchedules();
        } catch (error) {
          message.error(error?.response?.data?.message || 'Lỗi xóa lịch');
        }
      }
    });
  };

  const handleSaveSchedule = async (values) => {
    try {
      const scheduleData = {
        doctorId: selectedDoctor,
        dayOfWeek: values.dayOfWeek,
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm')
      };

      if (editingSchedule) {
        await appointmentAPI.updateDoctorSchedule(editingSchedule._id, scheduleData);
        message.success('Cập nhật lịch làm việc thành công');
      } else {
        await appointmentAPI.createDoctorSchedule(scheduleData);
        message.success('Tạo lịch làm việc thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      loadSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      message.error(error?.response?.data?.message || 'Lỗi lưu lịch');
    }
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (day) => {
        const dayObj = daysOfWeek.find(d => d.value === day);
        return dayObj?.label || day;
      }
    },
    {
      title: 'Giờ bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime'
    },
    {
      title: 'Giờ kết thúc',
      dataIndex: 'endTime',
      key: 'endTime'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditSchedule(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteSchedule(record._id)}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          <ClockCircleOutlined style={{ marginRight: '8px' }} />
          Quản lý lịch làm việc bác sĩ
        </h1>

        <Card style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={16}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Chọn bác sĩ</label>
              <Select
                style={{ width: '100%' }}
                placeholder="Chọn bác sĩ"
                value={selectedDoctor}
                onChange={setSelectedDoctor}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={doctors.map(doctor => ({
                  label: `${doctor.fullName}`,
                  value: doctor._id
                }))}
              />
            </Col>

            <Col xs={24} sm={8}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddSchedule}
                disabled={!selectedDoctor}
                style={{ width: '100%' }}
              >
                Thêm lịch
              </Button>
            </Col>
          </Row>
        </Card>

        <Divider />

        {selectedDoctor && (
          <Card title={`Lịch làm việc của ${doctors.find(d => d._id === selectedDoctor)?.fullName}`}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : schedules.length > 0 ? (
              <Table
                columns={columns}
                dataSource={schedules}
                rowKey="_id"
                pagination={false}
              />
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>Chưa có lịch làm việc nào</p>
            )}
          </Card>
        )}

        {/* Modal thêm/sửa lịch */}
        <Modal
          title={editingSchedule ? 'Sửa lịch làm việc' : 'Thêm lịch làm việc'}
          open={isModalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveSchedule}
          >
            <Form.Item
              label="Ngày"
              name="dayOfWeek"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <Select
                placeholder="Chọn ngày"
                options={daysOfWeek}
              />
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giờ bắt đầu"
                  name="startTime"
                  rules={[{ required: true, message: 'Vui lòng nhập giờ bắt đầu' }]}
                >
                  <TimePicker format="HH:mm" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giờ kết thúc"
                  name="endTime"
                  rules={[{ required: true, message: 'Vui lòng nhập giờ kết thúc' }]}
                >
                  <TimePicker format="HH:mm" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default DoctorScheduleManagement;
