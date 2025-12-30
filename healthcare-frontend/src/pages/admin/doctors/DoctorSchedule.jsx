// src/pages/admin/doctors/DoctorSchedule.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import userAPI from '@/services/api/userAPI';
import { doctorAPI } from '@/services/api/doctorAPI';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Button,
  Calendar,
  Card,
  Col,
  DatePicker,
  Empty,
  Pagination,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Timeline,
  Typography
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.locale('vi');

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const DoctorSchedule = () => {
  const [searchParams] = useSearchParams();
  const selectedDoctorFromParams = searchParams.get('doctorId');

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(selectedDoctorFromParams || null);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // calendar, timeline, table
  const [dateRange, setDateRange] = useState([dayjs(), dayjs().add(7, 'days')]);
  const [highlightedDate, setHighlightedDate] = useState(dayjs());
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  // Load doctors list
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await doctorAPI.getDoctors({ limit: 999 });
        const doctorsList = response?.data?.data || [];
        setDoctors(doctorsList);
        
        // Auto-select doctor if provided in URL params
        if (selectedDoctorFromParams && doctorsList.length > 0) {
          setSelectedDoctor(selectedDoctorFromParams);
        }
      } catch (error) {
        console.error('Error loading doctors:', error);
      }
    };
    loadDoctors();
  }, [selectedDoctorFromParams]);

  // Load schedule for selected doctor
  useEffect(() => {
    if (!selectedDoctor || !dateRange?.[0]) return;

    const loadSchedule = async () => {
      try {
        setLoading(true);
        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1]?.format('YYYY-MM-DD') || dateRange[0].format('YYYY-MM-DD');

        const response = await appointmentAPI.getDoctorSchedule(selectedDoctor, {
          startDate,
          endDate
        });

        if (response?.data?.data) {
          setScheduleData(response.data.data);
        }
      } catch (error) {
        console.error('Error loading schedule:', error);
        setScheduleData(null);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [selectedDoctor, dateRange]);

  // Filter appointments based on selected date and status
  useEffect(() => {
    if (!scheduleData?.scheduleByDate) {
      setFilteredAppointments([]);
      return;
    }

    const dateKey = highlightedDate.format('YYYY-MM-DD');
    let appointments = scheduleData.scheduleByDate[dateKey] || [];

    if (statusFilter !== 'all') {
      appointments = appointments.filter(apt => apt.status === statusFilter);
    }

    // Sort by appointment date
    appointments.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

    setFilteredAppointments(appointments);
    setPagination({ ...pagination, current: 1 });
  }, [scheduleData, highlightedDate, statusFilter]);

  // Get doctor info
  const doctorInfo = doctors.find(d => d._id === selectedDoctor);

  // Calendar cell render with appointment count
  const getListData = (date) => {
    if (!scheduleData?.scheduleByDate) return [];
    const dateKey = date.format('YYYY-MM-DD');
    return scheduleData.scheduleByDate[dateKey] || [];
  };

  const dateCellRender = (date) => {
    const appointments = getListData(date);
    if (appointments.length === 0) return null;

    const statusColors = {
      SCHEDULED: 'blue',
      CONFIRMED: 'green',
      IN_PROGRESS: 'orange',
      COMPLETED: 'purple',
      CANCELLED: 'red',
      NO_SHOW: 'default'
    };

    return (
      <div style={{ padding: '4px 0' }}>
        <Tag color={statusColors[appointments[0]?.status] || 'default'}>
          {appointments.length} lịch
        </Tag>
      </div>
    );
  };

  // Timeline render for appointments
  const renderTimeline = () => {
    if (filteredAppointments.length === 0) {
      return <Empty description="Không có lịch hẹn trong ngày này" />;
    }

    const statusColors = {
      SCHEDULED: 'blue',
      CONFIRMED: 'green',
      IN_PROGRESS: 'orange',
      COMPLETED: 'purple',
      CANCELLED: 'red',
      NO_SHOW: 'default'
    };

    return (
      <Timeline
        items={filteredAppointments.map(apt => ({
          color: statusColors[apt.status],
          children: (
            <Card size="small" style={{ marginBottom: '8px' }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <ClockCircleOutlined /> {' '}
                      <strong>{dayjs(apt.appointmentDate).format('HH:mm')}</strong>
                    </div>
                    <div>
                      <strong>Bệnh nhân:</strong> {apt.patientId?.personalInfo?.firstName} {apt.patientId?.personalInfo?.lastName}
                    </div>
                    <div>
                      <strong>Trạng thái:</strong> <Tag color={statusColors[apt.status]}>{apt.status}</Tag>
                    </div>
                    <div>
                      <strong>Lý do:</strong> {apt.reason || 'Không có'}
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          )
        }))}
      />
    );
  };

  // Table render for appointments
  const tableColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date) => dayjs(date).format('HH:mm DD/MM/YYYY'),
      width: 150
    },
    {
      title: 'Bệnh nhân',
      dataIndex: ['patientId', 'personalInfo'],
      key: 'patientName',
      render: (patientInfo) => patientInfo ? `${patientInfo.firstName} ${patientInfo.lastName}` : 'N/A',
      width: 200
    },
    {
      title: 'Điện thoại',
      dataIndex: ['patientId', 'phone'],
      key: 'patientPhone',
      render: (phone) => phone || 'N/A',
      width: 120
    },
    {
      title: 'Lý do khám',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => reason || 'Khám tổng quát',
      width: 200
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          SCHEDULED: 'blue',
          CONFIRMED: 'green',
          IN_PROGRESS: 'orange',
          COMPLETED: 'purple',
          CANCELLED: 'red',
          NO_SHOW: 'default'
        };
        const statusLabel = {
          SCHEDULED: 'Đã lên lịch',
          CONFIRMED: 'Xác nhận',
          IN_PROGRESS: 'Đang khám',
          COMPLETED: 'Hoàn thành',
          CANCELLED: 'Hủy',
          NO_SHOW: 'Vắng'
        };
        return <Tag color={statusMap[status]}>{statusLabel[status]}</Tag>;
      },
      width: 120
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} phút`,
      width: 100
    }
  ];

  const paginatedAppointments = filteredAppointments.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  const handleExportCSV = () => {
    if (!filteredAppointments.length) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    const headers = ['Thời gian', 'Tên bệnh nhân', 'Điện thoại', 'Lý do khám', 'Trạng thái'];
    const rows = filteredAppointments.map(apt => [
      dayjs(apt.appointmentDate).format('HH:mm DD/MM/YYYY'),
      `${apt.patientId?.personalInfo?.firstName} ${apt.patientId?.personalInfo?.lastName}`,
      apt.patientId?.phone || 'N/A',
      apt.reason || 'Khám tổng quát',
      apt.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lichlambac-si-${highlightedDate.format('YYYY-MM-DD')}.csv`);
    link.click();
  };

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Title level={2}>
          <CalendarOutlined /> Lịch Làm Việc Bác Sĩ
        </Title>

        {/* Select Doctor Section */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={12} lg={8}>
              <div>
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
              </div>
            </Col>

            <Col xs={24} sm={24} md={12} lg={10}>
              <div>
                <Text strong>Khoảng Thời Gian</Text>
                <RangePicker
                  style={{ width: '100%', marginTop: '8px' }}
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                  format="DD/MM/YYYY"
                  locale={dayjs.locale()}
                />
              </div>
            </Col>

            <Col xs={24} sm={24} md={12} lg={6}>
              <div>
                <Text strong>Chế độ xem</Text>
                <Select
                  style={{ width: '100%', marginTop: '8px' }}
                  value={viewMode}
                  onChange={setViewMode}
                >
                  <Select.Option value="calendar">Lịch</Select.Option>
                  <Select.Option value="timeline">Dòng thời gian</Select.Option>
                  <Select.Option value="table">Bảng</Select.Option>
                </Select>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Doctor Info & Stats */}
        {selectedDoctor && doctorInfo && (
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Space direction="vertical" size="small">
                  <Text strong>Tên bác sĩ</Text>
                  <Text>{doctorInfo.personalInfo?.firstName} {doctorInfo.personalInfo?.lastName}</Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space direction="vertical" size="small">
                  <Text strong>Chuyên khoa</Text>
                  <Text>{doctorInfo.professionalInfo?.specialization || 'N/A'}</Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space direction="vertical" size="small">
                  <Text strong>Phòng ban</Text>
                  <Text>{doctorInfo.professionalInfo?.department || 'N/A'}</Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space direction="vertical" size="small">
                  <Text strong>Trạng thái</Text>
                  <Tag color={doctorInfo.status === 'ACTIVE' ? 'green' : 'red'}>
                    {doctorInfo.status}
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        {/* Schedule View */}
        {selectedDoctor ? (
          loading ? (
            <Card>
              <Skeleton active />
            </Card>
          ) : (
            <>
              {viewMode === 'calendar' && (
                <Card title="Lịch Làm Việc" style={{ marginBottom: '24px' }}>
                  <Calendar
                    fullscreen={true}
                    dateCellRender={dateCellRender}
                    onSelect={setHighlightedDate}
                    value={highlightedDate}
                  />
                </Card>
              )}

              {/* Timeline or Table View */}
              <Card
                title={`Lịch Hẹn Ngày ${highlightedDate.format('DD/MM/YYYY')}`}
                extra={
                  <Space>
                    <Select
                      style={{ width: '150px' }}
                      value={statusFilter}
                      onChange={setStatusFilter}
                      placeholder="Lọc trạng thái"
                    >
                      <Select.Option value="all">Tất cả trạng thái</Select.Option>
                      <Select.Option value="SCHEDULED">Đã lên lịch</Select.Option>
                      <Select.Option value="CONFIRMED">Xác nhận</Select.Option>
                      <Select.Option value="IN_PROGRESS">Đang khám</Select.Option>
                      <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                      <Select.Option value="CANCELLED">Hủy</Select.Option>
                      <Select.Option value="NO_SHOW">Vắng</Select.Option>
                    </Select>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleExportCSV}
                    >
                      Xuất CSV
                    </Button>
                  </Space>
                }
              >
                {filteredAppointments.length === 0 ? (
                  <Empty description="Không có lịch hẹn" />
                ) : viewMode === 'timeline' ? (
                  <>
                    {renderTimeline()}
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <Text type="secondary">
                        Tổng cộng: {filteredAppointments.length} lịch hẹn
                      </Text>
                    </div>
                  </>
                ) : (
                  <>
                    <Table
                      columns={tableColumns}
                      dataSource={paginatedAppointments}
                      rowKey="_id"
                      pagination={false}
                      size="small"
                    />
                    {filteredAppointments.length > pagination.pageSize && (
                      <Pagination
                        style={{ marginTop: '16px', textAlign: 'right' }}
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={filteredAppointments.length}
                        onChange={(page) => setPagination({ ...pagination, current: page })}
                      />
                    )}
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <Text type="secondary">
                        Tổng cộng: {filteredAppointments.length} lịch hẹn
                      </Text>
                    </div>
                  </>
                )}
              </Card>
            </>
          )
        ) : (
          <Card>
            <Empty
              description="Vui lòng chọn bác sĩ để xem lịch làm việc"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default DoctorSchedule;
