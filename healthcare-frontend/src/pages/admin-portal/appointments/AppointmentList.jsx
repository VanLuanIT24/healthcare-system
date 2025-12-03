import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  SyncOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Calendar,
  Card,
  Col,
  DatePicker,
  message,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentApi } from '../../../services/adminApi';

const { Title, Text } = Typography;
const { Option } = Select;

const AppointmentList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // calendar, list, today
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [filterStatus, setFilterStatus] = useState(null);
  const [stats, setStats] = useState({
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, [selectedDate, filterStatus]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // SỬ DỤNG API SERVICE
      const response = await appointmentApi.getList({
        startDate: selectedDate.format('YYYY-MM-DD'),
        endDate: selectedDate.format('YYYY-MM-DD'),
        status: filterStatus,
        page: 1,
        limit: 50
      });
      
      // XỬ LÝ RESPONSE
      if (response.success && response.data) {
        setAppointments(response.data.appointments || response.data || []);
      }
    } catch (error) {
      console.error('❌ [APPOINTMENT] Fetch error:', error);
      message.error(
        error.response?.data?.message || error.message || 'Không thể tải danh sách lịch hẹn'
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // TODO: Implement stats API endpoint in backend
      setStats(getMockStats());
    } catch (error) {
      console.error('Fetch stats error:', error);
      setStats(getMockStats());
    }
  };

  // Mock data for development
  const getMockAppointments = () => [
    {
      _id: '1',
      appointmentCode: 'APT001',
      patient: { 
        personalInfo: { 
          firstName: 'Nguyễn', 
          lastName: 'Văn A',
          phone: '0123456789'
        } 
      },
      doctor: { 
        personalInfo: { 
          firstName: 'BS. Trần', 
          lastName: 'Văn B'
        },
        department: 'Tim mạch'
      },
      appointmentDate: moment().format('YYYY-MM-DD'),
      timeSlot: '09:00 - 09:30',
      status: 'CONFIRMED',
      reason: 'Khám tổng quát',
      notes: 'Bệnh nhân cần nhịn đói'
    },
    {
      _id: '2',
      appointmentCode: 'APT002',
      patient: { 
        personalInfo: { 
          firstName: 'Trần', 
          lastName: 'Thị C',
          phone: '0987654321'
        } 
      },
      doctor: { 
        personalInfo: { 
          firstName: 'BS. Lê', 
          lastName: 'Thị D'
        },
        department: 'Nhi khoa'
      },
      appointmentDate: moment().format('YYYY-MM-DD'),
      timeSlot: '10:00 - 10:30',
      status: 'SCHEDULED',
      reason: 'Tiêm chủng',
      notes: ''
    }
  ];

  const getMockStats = () => ({
    scheduled: 15,
    confirmed: 20,
    completed: 45,
    cancelled: 3
  });

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: 'blue',
      CONFIRMED: 'green',
      IN_PROGRESS: 'processing',
      COMPLETED: 'success',
      CANCELLED: 'error',
      NO_SHOW: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      SCHEDULED: 'Đã đặt',
      CONFIRMED: 'Đã xác nhận',
      IN_PROGRESS: 'Đang khám',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      NO_SHOW: 'Không đến'
    };
    return texts[status] || status;
  };

  // Calendar View
  const getListData = (value) => {
    const dayAppointments = appointments.filter(apt => 
      moment(apt.appointmentDate).isSame(value, 'day')
    );

    return dayAppointments.map(apt => ({
      type: apt.status === 'CONFIRMED' ? 'success' : 
            apt.status === 'CANCELLED' ? 'error' : 'warning',
      content: `${moment(apt.appointmentDate).format('HH:mm')} - ${apt.patientName}`
    }));
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  // Table columns for list view
  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'appointmentDate',
      key: 'time',
      render: (date) => (
        <Space direction="vertical" size="small">
          <Text strong>{moment(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary">{moment(date).format('HH:mm')}</Text>
        </Space>
      ),
      sorter: (a, b) => moment(a.appointmentDate).unix() - moment(b.appointmentDate).unix()
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div><Text strong>{record.patientId?.personalInfo?.firstName} {record.patientId?.personalInfo?.lastName}</Text></div>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{record.patientId?.phone}</Text></div>
          </div>
        </Space>
      )
    },
    {
      title: 'Bác sĩ',
      key: 'doctor',
      render: (record) => (
        <div>
          <div>{record.doctorId?.personalInfo?.firstName} {record.doctorId?.personalInfo?.lastName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.doctorId?.professionalInfo?.department}
          </Text>
        </div>
      )
    },
    {
      title: 'Loại khám',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag>{type === 'CONSULTATION' ? 'Tư vấn' : 
              type === 'FOLLOW_UP' ? 'Tái khám' : 
              type === 'EMERGENCY' ? 'Khẩn cấp' : 'Khám thường'}</Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Đã đặt', value: 'SCHEDULED' },
        { text: 'Đã xác nhận', value: 'CONFIRMED' },
        { text: 'Đang khám', value: 'IN_PROGRESS' },
        { text: 'Hoàn thành', value: 'COMPLETED' },
        { text: 'Đã hủy', value: 'CANCELLED' }
      ],
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/admin/appointments/${record._id}`)}>
            Chi tiết
          </Button>
          {record.status === 'SCHEDULED' && (
            <Button size="small" type="primary" onClick={() => handleConfirm(record._id)}>
              Xác nhận
            </Button>
          )}
          {['SCHEDULED', 'CONFIRMED'].includes(record.status) && (
            <Button size="small" danger onClick={() => handleCancel(record._id)}>
              Hủy
            </Button>
          )}
        </Space>
      )
    }
  ];

  const handleConfirm = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}/status`,
        { status: 'CONFIRMED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Đã xác nhận lịch hẹn');
      fetchAppointments();
      fetchStats();
    } catch (error) {
      message.error('Không thể xác nhận lịch hẹn');
    }
  };

  const handleCancel = async (appointmentId) => {
    Modal.confirm({
      title: 'Xác nhận hủy lịch hẹn',
      content: 'Bạn có chắc muốn hủy lịch hẹn này?',
      okText: 'Hủy lịch',
      cancelText: 'Đóng',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.put(
            `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
            { reason: 'Hủy bởi quản trị viên' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success('Đã hủy lịch hẹn');
          fetchAppointments();
          fetchStats();
        } catch (error) {
          message.error('Không thể hủy lịch hẹn');
        }
      }
    });
  };

  // Today's appointments
  const TodayView = () => {
    const todayAppointments = appointments.filter(apt =>
      moment(apt.appointmentDate).isSame(moment(), 'day')
    );

    const grouped = {
      scheduled: todayAppointments.filter(a => a.status === 'SCHEDULED'),
      confirmed: todayAppointments.filter(a => a.status === 'CONFIRMED'),
      inProgress: todayAppointments.filter(a => a.status === 'IN_PROGRESS'),
      completed: todayAppointments.filter(a => a.status === 'COMPLETED')
    };

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={6}>
          <Card>
            <Statistic
              title="Chờ xác nhận"
              value={grouped.scheduled.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card>
            <Statistic
              title="Đã xác nhận"
              value={grouped.confirmed.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card>
            <Statistic
              title="Đang khám"
              value={grouped.inProgress.length}
              prefix={<SyncOutlined spin />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={grouped.completed.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Lịch hẹn hôm nay">
            <Table
              columns={columns}
              dataSource={todayAppointments}
              loading={loading}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const tabItems = [
    {
      key: 'today',
      label: 'Hôm nay',
      children: <TodayView />
    },
    {
      key: 'calendar',
      label: 'Lịch',
      children: (
        <Card>
          <Calendar 
            dateCellRender={dateCellRender}
            onSelect={(date) => setSelectedDate(date)}
          />
        </Card>
      )
    },
    {
      key: 'list',
      label: 'Danh sách',
      children: (
        <Card>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={8}>
              <DatePicker
                style={{ width: '100%' }}
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                placeholder="Lọc theo trạng thái"
                style={{ width: '100%' }}
                allowClear
                onChange={setFilterStatus}
              >
                <Option value="SCHEDULED">Đã đặt</Option>
                <Option value="CONFIRMED">Đã xác nhận</Option>
                <Option value="IN_PROGRESS">Đang khám</Option>
                <Option value="COMPLETED">Hoàn thành</Option>
                <Option value="CANCELLED">Đã hủy</Option>
              </Select>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={appointments}
            loading={loading}
            rowKey="_id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} lịch hẹn`
            }}
          />
        </Card>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Quản lý lịch hẹn
              </Title>
            </Col>
            <Col>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/admin/appointments/create')}
                >
                  Tạo lịch hẹn
                </Button>
                <Button 
                  icon={<CalendarOutlined />}
                  onClick={() => navigate('/admin/schedules')}
                >
                  Quản lý lịch làm việc
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Đã đặt"
                value={stats.scheduled}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Đã xác nhận"
                value={stats.confirmed}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Hoàn thành"
                value={stats.completed}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Đã hủy"
                value={stats.cancelled}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default AppointmentList;
