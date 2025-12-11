// 📅 Appointment List Page
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    PlusOutlined,
    SearchOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import appointmentAPI from '../../services/api/appointmentAPI';
import './Appointment.css';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadAppointments();
    loadStats();
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
      setAppointments(response.data.appointments);
      setPagination({ ...pagination, total: response.data.total });
    } catch (error) {
      message.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await appointmentAPI.getAppointmentStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats');
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

  const handleCompleteAppointment = (appointmentId) => {
    Modal.confirm({
      title: 'Hoàn thành lịch hẹn',
      content: 'Bạn có chắc chắn muốn đánh dấu lịch hẹn này là hoàn thành?',
      okText: 'Hoàn thành',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await appointmentAPI.completeAppointment(appointmentId);
          message.success('Lịch hẹn đã được hoàn thành');
          loadAppointments();
        } catch (error) {
          message.error('Hoàn thành lịch hẹn thất bại');
        }
      },
    });
  };

  const getStatusColor = (status) => {
    const colors = {
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
      scheduled: 'Đã lên lịch',
      'checked-in': 'Đã check-in',
      'in-progress': 'Đang khám',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      emergency: 'red',
      urgent: 'orange',
      normal: 'default',
    };
    return colors[priority] || 'default';
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
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
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
    },
    {
      title: 'Ngày & Giờ',
      dataIndex: 'appointmentDate',
      key: 'date',
      render: (date) => (
        <div>
          <div>{moment(date).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
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
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'emergency'
            ? 'Khẩn cấp'
            : priority === 'urgent'
            ? 'Ưu tiên'
            : 'Thường'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/appointments/${record._id}`)}
          >
            Chi tiết
          </Button>
          {record.status === 'scheduled' && (
            <>
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
          {(record.status === 'checked-in' || record.status === 'in-progress') && (
            <Button
              type="link"
              size="small"
              style={{ color: '#52c41a' }}
              onClick={() => handleCompleteAppointment(record._id)}
            >
              ✓ Hoàn thành
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container appointment-list-container">
      <PageHeader
        title="Quản lý lịch hẹn"
        subtitle="Danh sách lịch hẹn khám bệnh"
        extra={
          <Space>
            <Button icon={<CalendarOutlined />} onClick={() => navigate('/appointments/calendar')}>
              Xem lịch
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/appointments/schedule')}
            >
              Đặt lịch hẹn mới
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng lịch hẹn"
              value={stats.total || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Hôm nay"
              value={stats.today || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={stats.completed || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={stats.cancelled || 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="filter-section">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm theo tên bệnh nhân, bác sĩ..."
              allowClear
              onSearch={(value) => setFilters({ ...filters, search: value })}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="scheduled">Đã lên lịch</Option>
              <Option value="checked-in">Đã check-in</Option>
              <Option value="in-progress">Đang khám</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
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

      <Card>
        <Table
          columns={columns}
          dataSource={appointments}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} lịch hẹn`,
          }}
          onChange={(newPagination) => setPagination(newPagination)}
        />
      </Card>
    </div>
  );
};

export default AppointmentList;
