// 📅 Appointment Calendar View
import {
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    FilterOutlined,
    PlusOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Badge, Button, Calendar, Card, Descriptions, Modal, Select, Space, Tag, message } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import appointmentAPI from '../../services/api/appointmentAPI';
import './Appointment.css';

const { Option } = Select;

const AppointmentCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, filterStatus, filterDoctor]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointments({
        startDate: selectedDate.clone().startOf('month').toISOString(),
        endDate: selectedDate.clone().endOf('month').toISOString(),
        status: filterStatus !== 'all' ? filterStatus : undefined,
        doctor: filterDoctor !== 'all' ? filterDoctor : undefined,
      });
      setAppointments(response.data.appointments || []);
    } catch (error) {
      message.error('Không thể tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const getListData = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    return appointments.filter((apt) => moment(apt.appointmentDate).format('YYYY-MM-DD') === dateStr);
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <div className="appointment-calendar-cell">
        {listData.map((item, index) => (
          <div
            key={index}
            className={`appointment-event appointment-event-${item.status}`}
            onClick={(e) => {
              e.stopPropagation();
              handleAppointmentClick(item);
            }}
          >
            <div className="appointment-event-time">
              {moment(item.appointmentDate).format('HH:mm')}
            </div>
            <div className="appointment-event-patient">{item.patient?.fullName}</div>
            {item.priority === 'emergency' && (
              <Badge status="error" text="Khẩn cấp" style={{ fontSize: 11 }} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailModal(true);
  };

  const handleCheckIn = async () => {
    try {
      await appointmentAPI.checkIn(selectedAppointment._id);
      message.success('Check-in thành công');
      setDetailModal(false);
      loadAppointments();
    } catch (error) {
      message.error('Check-in thất bại');
    }
  };

  const handleCancel = async () => {
    Modal.confirm({
      title: 'Hủy lịch hẹn',
      content: 'Bạn có chắc chắn muốn hủy lịch hẹn này?',
      okText: 'Hủy lịch hẹn',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          await appointmentAPI.cancel(selectedAppointment._id);
          message.success('Đã hủy lịch hẹn');
          setDetailModal(false);
          loadAppointments();
        } catch (error) {
          message.error('Hủy lịch hẹn thất bại');
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
      scheduled: 'Đã đặt',
      'checked-in': 'Đã check-in',
      'in-progress': 'Đang khám',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  return (
    <div className="page-container appointment-calendar-container">
      <PageHeader
        title="Lịch khám"
        subtitle="Xem lịch hẹn theo lịch"
        extra={
          <Space>
            <Button icon={<FilterOutlined />} onClick={() => navigate('/appointments')}>
              Danh sách
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/appointments/schedule')}>
              Đặt lịch mới
            </Button>
          </Space>
        }
      />

      <Card className="filter-section" style={{ marginBottom: 16 }}>
        <Space size="large">
          <Space>
            <span>Trạng thái:</span>
            <Select
              style={{ width: 150 }}
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">Tất cả</Option>
              <Option value="scheduled">Đã đặt</Option>
              <Option value="checked-in">Đã check-in</Option>
              <Option value="in-progress">Đang khám</Option>
              <Option value="completed">Hoàn thành</Option>
            </Select>
          </Space>
          <Space>
            <CalendarOutlined />
            <span>
              Tháng {selectedDate.format('MM/YYYY')} - {appointments.length} lịch hẹn
            </span>
          </Space>
        </Space>
      </Card>

      <Card loading={loading}>
        <Calendar
          value={selectedDate}
          onSelect={(date) => setSelectedDate(date)}
          dateCellRender={dateCellRender}
          onPanelChange={(date) => setSelectedDate(date)}
        />
      </Card>

      {/* Appointment Detail Modal */}
      <Modal
        title="Chi tiết lịch hẹn"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            Đóng
          </Button>,
          selectedAppointment?.status === 'scheduled' && (
            <Button key="checkin" type="primary" onClick={handleCheckIn}>
              Check-in
            </Button>
          ),
          (selectedAppointment?.status === 'scheduled' ||
            selectedAppointment?.status === 'checked-in') && (
            <Button key="cancel" danger onClick={handleCancel}>
              Hủy lịch hẹn
            </Button>
          ),
        ]}
      >
        {selectedAppointment && (
          <>
            <div className="appointment-detail-header">
              <Space size="large">
                <div>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  {moment(selectedAppointment.appointmentDate).format('DD/MM/YYYY')}
                </div>
                <div>
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  {moment(selectedAppointment.appointmentDate).format('HH:mm')}
                </div>
                <Tag color={getStatusColor(selectedAppointment.status)}>
                  {getStatusText(selectedAppointment.status)}
                </Tag>
              </Space>
            </div>

            <Descriptions column={2} style={{ marginTop: 24 }}>
              <Descriptions.Item label="Bệnh nhân" span={2}>
                <Space>
                  <UserOutlined />
                  <strong>{selectedAppointment.patient?.fullName}</strong>
                  <span style={{ color: '#8c8c8c' }}>
                    ({selectedAppointment.patient?.patientId})
                  </span>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Số điện thoại">
                {selectedAppointment.patient?.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {selectedAppointment.patient?.gender === 'male'
                  ? 'Nam'
                  : selectedAppointment.patient?.gender === 'female'
                  ? 'Nữ'
                  : 'Khác'}
              </Descriptions.Item>

              <Descriptions.Item label="Bác sĩ" span={2}>
                <strong>{selectedAppointment.doctor?.fullName}</strong>
                <span style={{ color: '#8c8c8c', marginLeft: 8 }}>
                  ({selectedAppointment.doctor?.position})
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Phòng khám">
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {selectedAppointment.room || 'Chưa phân phòng'}
              </Descriptions.Item>

              <Descriptions.Item label="Độ ưu tiên">
                <Tag
                  color={
                    selectedAppointment.priority === 'emergency'
                      ? 'red'
                      : selectedAppointment.priority === 'urgent'
                      ? 'orange'
                      : 'default'
                  }
                >
                  {selectedAppointment.priority === 'emergency'
                    ? 'Khẩn cấp'
                    : selectedAppointment.priority === 'urgent'
                    ? 'Ưu tiên'
                    : 'Thường'}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Lý do khám" span={2}>
                {selectedAppointment.reason}
              </Descriptions.Item>

              {selectedAppointment.notes && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedAppointment.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedAppointment.status === 'completed' && (
              <div style={{ marginTop: 16, padding: 16, background: '#f0f5ff', borderRadius: 8 }}>
                <strong>Kết quả khám:</strong>
                <p style={{ marginTop: 8 }}>{selectedAppointment.diagnosis || 'Chưa có thông tin'}</p>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentCalendar;
