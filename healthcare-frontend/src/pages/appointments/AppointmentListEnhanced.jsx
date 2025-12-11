// 📅 Enhanced Appointment List với Full CRUD
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Drawer,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    TimePicker,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentAPI from '../../services/api/appointmentAPI';
import patientAPI from '../../services/api/patientAPI';
import userAPI from '../../services/api/userAPI';
import designSystem from '../../theme/designSystem';
import './Appointment.css';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { colors } = designSystem;

const AppointmentListEnhanced = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: null,
  });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [form] = Form.useForm();
  const [rescheduleForm] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    loadAppointments();
    loadStats();
    loadPatients();
    loadDoctors();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointments({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        status: filters.status,
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString(),
      });
      setAppointments(response.data?.appointments || response.data?.data || []);
      setPagination({ ...pagination, total: response.data?.total || response.data?.pagination?.total || 0 });
    } catch (error) {
      message.error('Không thể tải danh sách lịch hẹn');
      console.error('Load appointments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await appointmentAPI.getAppointmentStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const loadPatients = async () => {
    try {
      const response = await patientAPI.searchPatients({ limit: 100, status: 'ACTIVE' });
      setPatients(response.data?.patients || []);
    } catch (error) {
      console.error('Failed to load patients');
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await userAPI.getUsers({ role: 'DOCTOR', isActive: true, limit: 100 });
      setDoctors(response.data?.users || []);
    } catch (error) {
      console.error('Failed to load doctors');
    }
  };

  const loadAvailableSlots = async (doctorId, date) => {
    try {
      const response = await appointmentAPI.getAvailableSlots({
        doctorId,
        date: date.format('YYYY-MM-DD'),
      });
      setAvailableSlots(response.data?.slots || []);
    } catch (error) {
      message.error('Không thể tải lịch trống');
    }
  };

  const handleCreateAppointment = async (values) => {
    try {
      await appointmentAPI.createAppointment({
        patientId: values.patientId,
        doctorId: values.doctorId,
        appointmentDate: values.appointmentDate.toISOString(),
        appointmentTime: values.appointmentTime.format('HH:mm'),
        reason: values.reason,
        priority: values.priority || 'ROUTINE',
        notes: values.notes,
      });
      message.success('Đặt lịch hẹn thành công');
      setCreateModalVisible(false);
      form.resetFields();
      loadAppointments();
      loadStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Đặt lịch hẹn thất bại');
    }
  };

  const handleReschedule = async (values) => {
    try {
      await appointmentAPI.rescheduleAppointment(selectedAppointment._id, {
        newDate: values.newDate.toISOString(),
        newTime: values.newTime.format('HH:mm'),
        reason: values.rescheduleReason,
      });
      message.success('Đổi lịch hẹn thành công');
      setRescheduleModalVisible(false);
      rescheduleForm.resetFields();
      loadAppointments();
    } catch (error) {
      message.error('Đổi lịch hẹn thất bại');
    }
  };

  const handleCancel = (appointmentId) => {
    Modal.confirm({
      title: 'Hủy lịch hẹn',
      content: 'Bạn có chắc chắn muốn hủy lịch hẹn này?',
      okText: 'Hủy lịch',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          await appointmentAPI.cancelAppointment(appointmentId);
          message.success('Đã hủy lịch hẹn');
          loadAppointments();
          loadStats();
        } catch (error) {
          message.error('Hủy lịch hẹn thất bại');
        }
      },
    });
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      await appointmentAPI.checkInAppointment(appointmentId);
      message.success('Check-in thành công');
      loadAppointments();
    } catch (error) {
      message.error('Check-in thất bại');
    }
  };

  const handleViewDetails = async (appointmentId) => {
    try {
      const response = await appointmentAPI.getAppointmentById(appointmentId);
      setSelectedAppointment(response.data?.appointment || response.data);
      setDrawerVisible(true);
    } catch (error) {
      message.error('Không thể tải thông tin lịch hẹn');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: 'blue',
      CHECKED_IN: 'orange',
      IN_PROGRESS: 'purple',
      COMPLETED: 'green',
      CANCELLED: 'red',
      scheduled: 'blue',
      'checked-in': 'orange',
      'in-progress': 'purple',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      SCHEDULED: 'Đã lên lịch',
      CHECKED_IN: 'Đã check-in',
      IN_PROGRESS: 'Đang khám',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      scheduled: 'Đã lên lịch',
      'checked-in': 'Đã check-in',
      'in-progress': 'Đang khám',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Bệnh nhân',
      key: 'patient',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar src={record.patient?.profilePicture} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.patient?.fullName}</div>
            <div style={{ fontSize: 12, color: colors.text.secondary }}>
              {record.patient?.patientId}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Bác sĩ',
      dataIndex: ['doctor', 'fullName'],
      key: 'doctor',
      width: 150,
    },
    {
      title: 'Ngày & Giờ',
      dataIndex: 'appointmentDate',
      key: 'date',
      width: 150,
      render: (date) => (
        <div>
          <div>{moment(date).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: 12, color: colors.text.secondary }}>
            {moment(date).format('HH:mm')}
          </div>
        </div>
      ),
      sorter: (a, b) => moment(a.appointmentDate).unix() - moment(b.appointmentDate).unix(),
    },
    {
      title: 'Lý do khám',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => {
        const priorityConfig = {
          URGENT: { color: 'red', text: 'Khẩn cấp' },
          ROUTINE: { color: 'default', text: 'Thường' },
          emergency: { color: 'red', text: 'Khẩn cấp' },
          urgent: { color: 'orange', text: 'Ưu tiên' },
          normal: { color: 'default', text: 'Thường' },
        };
        const config = priorityConfig[priority] || { color: 'default', text: priority };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => (
        <Badge
          status={status === 'COMPLETED' || status === 'completed' ? 'success' : 'processing'}
          text={getStatusText(status)}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record._id)}
          >
            Chi tiết
          </Button>
          {(record.status === 'SCHEDULED' || record.status === 'scheduled') && (
            <>
              <Button
                type="link"
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSelectedAppointment(record);
                  setRescheduleModalVisible(true);
                }}
              >
                Đổi lịch
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => handleCheckIn(record._id)}
              >
                Check-in
              </Button>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleCancel(record._id)}
              >
                Hủy
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container fadeIn">
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <CalendarOutlined style={{ marginRight: 12, color: colors.primary[500] }} />
            Quản lý lịch hẹn
          </h1>
          <p className="dashboard-subtitle">Danh sách lịch hẹn khám bệnh</p>
        </div>
        <Space>
          <Button icon={<CalendarOutlined />} onClick={() => navigate('/appointments/calendar')}>
            Xem lịch
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            size="large"
          >
            Đặt lịch hẹn mới
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} className="staggered-cards">
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng lịch hẹn</span>}
              value={stats.total || 0}
              prefix={<CalendarOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.warning[500]}, ${colors.warning[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Hôm nay</span>}
              value={stats.today || 0}
              prefix={<ClockCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Đã hoàn thành</span>}
              value={stats.completed || 0}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.error[500]}, ${colors.error[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Đã hủy</span>}
              value={stats.cancelled || 0}
              prefix={<CloseCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card variant="borderless" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm theo tên bệnh nhân, bác sĩ..."
              allowClear
              enterButton
              onSearch={(value) => {
                setFilters({ ...filters, search: value });
                setPagination({ ...pagination, current: 1 });
              }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="SCHEDULED">Đã lên lịch</Option>
              <Option value="CHECKED_IN">Đã check-in</Option>
              <Option value="IN_PROGRESS">Đang khám</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} md={10}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
          </Col>
        </Row>
      </Card>

      {/* Appointments Table */}
      <Card variant="borderless">
        <Table
          columns={columns}
          dataSource={appointments}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1200 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng số ${total} lịch hẹn`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Card>

      {/* Create Appointment Modal */}
      <Modal
        title="Đặt lịch hẹn mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateAppointment}>
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
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {patients.map((patient) => (
                    <Option key={patient._id} value={patient._id}>
                      {patient.fullName} - {patient.patientId}
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
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={(doctorId) => {
                    const appointmentDate = form.getFieldValue('appointmentDate');
                    if (appointmentDate) {
                      loadAvailableSlots(doctorId, appointmentDate);
                    }
                  }}
                >
                  {doctors.map((doctor) => (
                    <Option key={doctor._id} value={doctor._id}>
                      {doctor.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày khám"
                name="appointmentDate"
                rules={[{ required: true, message: 'Vui lòng chọn ngày khám' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current < moment().startOf('day')}
                  onChange={(date) => {
                    const doctorId = form.getFieldValue('doctorId');
                    if (doctorId && date) {
                      loadAvailableSlots(doctorId, date);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giờ khám"
                name="appointmentTime"
                rules={[{ required: true, message: 'Vui lòng chọn giờ khám' }]}
              >
                <TimePicker
                  style={{ width: '100%' }}
                  format="HH:mm"
                  minuteStep={15}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Lý do khám"
            name="reason"
            rules={[{ required: true, message: 'Vui lòng nhập lý do khám' }]}
          >
            <TextArea rows={3} placeholder="Nhập lý do khám..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Mức ưu tiên" name="priority" initialValue="ROUTINE">
                <Select>
                  <Option value="URGENT">Khẩn cấp</Option>
                  <Option value="ROUTINE">Thường</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi chú" name="notes">
            <TextArea rows={2} placeholder="Ghi chú thêm..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCreateModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Đặt lịch
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        title="Đổi lịch hẹn"
        open={rescheduleModalVisible}
        onCancel={() => {
          setRescheduleModalVisible(false);
          rescheduleForm.resetFields();
        }}
        footer={null}
      >
        <Form form={rescheduleForm} layout="vertical" onFinish={handleReschedule}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày mới"
                name="newDate"
                rules={[{ required: true, message: 'Vui lòng chọn ngày mới' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current < moment().startOf('day')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giờ mới"
                name="newTime"
                rules={[{ required: true, message: 'Vui lòng chọn giờ mới' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={15} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Lý do đổi lịch" name="rescheduleReason">
            <TextArea rows={3} placeholder="Nhập lý do đổi lịch..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setRescheduleModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Xác nhận đổi lịch
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Appointment Details Drawer */}
      <Drawer
        title="Chi tiết lịch hẹn"
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedAppointment && (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Bệnh nhân">
                <Space>
                  <Avatar src={selectedAppointment.patient?.profilePicture} icon={<UserOutlined />} />
                  {selectedAppointment.patient?.fullName}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Mã bệnh nhân">
                {selectedAppointment.patient?.patientId}
              </Descriptions.Item>
              <Descriptions.Item label="Bác sĩ">
                {selectedAppointment.doctor?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày & Giờ">
                {moment(selectedAppointment.appointmentDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do khám">
                {selectedAppointment.reason}
              </Descriptions.Item>
              <Descriptions.Item label="Mức ưu tiên">
                <Tag color={selectedAppointment.priority === 'URGENT' ? 'red' : 'default'}>
                  {selectedAppointment.priority === 'URGENT' ? 'Khẩn cấp' : 'Thường'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge
                  status={selectedAppointment.status === 'COMPLETED' ? 'success' : 'processing'}
                  text={getStatusText(selectedAppointment.status)}
                />
              </Descriptions.Item>
              {selectedAppointment.notes && (
                <Descriptions.Item label="Ghi chú">
                  {selectedAppointment.notes}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ngày tạo">
                {moment(selectedAppointment.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AppointmentListEnhanced;
