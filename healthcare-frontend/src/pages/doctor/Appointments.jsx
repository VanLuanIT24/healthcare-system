// src/pages/doctor/Appointments.jsx - Quản lý lịch hẹn cho bác sĩ
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import { useAuth } from '@/contexts/AuthContext';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  FileTextOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Input,
  List,
  Modal,
  Row,
  Space,
  Skeleton,
  Table,
  Tag,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    date: null,
    search: '',
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const statusOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đã đặt', value: 'SCHEDULED' },
    { label: 'Xác nhận', value: 'CONFIRMED' },
    { label: 'Đang khám', value: 'IN_PROGRESS' },
    { label: 'Hoàn thành', value: 'COMPLETED' },
    { label: 'Hủy', value: 'CANCELLED' },
    { label: 'Không đến', value: 'NO_SHOW' },
  ];

  const getStatusColor = (status) => {
    const colorMap = {
      'SCHEDULED': 'blue',
      'CONFIRMED': 'cyan',
      'IN_PROGRESS': 'orange',
      'COMPLETED': 'green',
      'CANCELLED': 'red',
      'NO_SHOW': 'volcano',
    };
    return colorMap[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      'SCHEDULED': 'Đã đặt',
      'CONFIRMED': 'Xác nhận',
      'IN_PROGRESS': 'Đang khám',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Hủy',
      'NO_SHOW': 'Không đến',
    };
    return labelMap[status] || status;
  };

  // Load appointments
  const loadAppointments = async () => {
    try {
      setLoading(true);
      if (!user?._id) {
        console.error('User ID not available');
        message.error('Lỗi: Không thể xác định bác sĩ');
        return;
      }

      console.log('📋 Loading appointments for doctor:', user._id);
      // Get appointments for current doctor
      const res = await appointmentAPI.getDoctorAppointments(user._id, { limit: 100 });
      console.log('✅ Appointments loaded:', res);

      // API returns { success, data: { items, pagination } }
      let arr = [];
      if (res.data?.data?.items) {
        arr = res.data.data.items;
        console.log('📊 Extracted items from response:', arr);
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        arr = res.data.data;
      } else if (Array.isArray(res.data)) {
        arr = res.data;
      }

      setAppointments(arr);
      applyFilters(arr);
    } catch (error) {
      console.error('Error loading appointments:', error);
      message.error('Lỗi tải lịch hẹn: ' + (error?.message || 'Vui lòng thử lại'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadAppointments();
    }
  }, [user?._id]);

  // Apply filters
  const applyFilters = (data) => {
    let filtered = [...data];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    // Filter by date
    if (filters.date) {
      const selectedDate = filters.date.format('YYYY-MM-DD');
      filtered = filtered.filter(apt =>
        dayjs(apt.appointmentDate).format('YYYY-MM-DD') === selectedDate
      );
    }

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.patientId?.personalInfo?.firstName?.toLowerCase().includes(search) ||
        apt.patientId?.personalInfo?.email?.toLowerCase().includes(search) ||
        apt.patientId?.personalInfo?.phone?.includes(search) ||
        apt.reason?.toLowerCase().includes(search)
      );
    }

    setFilteredAppointments(filtered);
  };

  useEffect(() => {
    applyFilters(appointments);
  }, [filters]);

  const handleStatusChange = async (record, newStatus) => {
    try {
      let apiCall;
      if (newStatus === 'IN_PROGRESS') {
        apiCall = appointmentAPI.checkInAppointment(record._id);
      } else if (newStatus === 'COMPLETED') {
        apiCall = appointmentAPI.completeAppointment(record._id);
      } else if (newStatus === 'NO_SHOW') {
        apiCall = appointmentAPI.noShowAppointment(record._id);
      } else {
        return;
      }

      await apiCall;
      message.success('Cập nhật trạng thái thành công');

      if (newStatus === 'IN_PROGRESS' && record.patientId?._id) {
        // Redirection logic for prescription
        message.info('Đang chuyển đến trang kê đơn...');
        setTimeout(() => {
          navigate('/doctor/prescriptions', {
            state: {
              patientId: record.patientId._id,
              patientName: `${record.patientId.personalInfo?.firstName} ${record.patientId.personalInfo?.lastName}`
            }
          });
        }, 1000);
      } else {
        loadAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      message.error('Lỗi cập nhật trạng thái');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    Modal.confirm({
      title: 'Xác nhận hủy',
      content: 'Bạn có chắc chắn muốn hủy lịch hẹn này?',
      okText: 'Hủy',
      okType: 'danger',
      cancelText: 'Không',
      onOk: async () => {
        try {
          await appointmentAPI.cancelAppointment(appointmentId, 'Bác sĩ hủy');
          message.success('Lịch hẹn đã được hủy');
          loadAppointments();
        } catch (error) {
          message.error('Lỗi hủy lịch hẹn');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Bệnh nhân',
      key: 'patient',
      width: '20%',
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.patientId?.personalInfo?.firstName}</div>
          <div className="text-sm text-gray-500">{record.patientId?.personalInfo?.email}</div>
        </div>
      ),
    },
    {
      title: 'Ngày giờ',
      key: 'date',
      width: '18%',
      render: (_, record) => (
        <div>
          <div>{dayjs(record.appointmentDate).format('DD/MM/YYYY')}</div>
          <div className="text-sm text-gray-500">{dayjs(record.appointmentDate).format('HH:mm')}</div>
        </div>
      ),
      sorter: (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate),
    },
    {
      title: 'Lý do khám',
      key: 'reason',
      width: '20%',
      render: (_, record) => record.reason || 'N/A',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: '15%',
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusLabel(record.status)}
        </Tag>
      ),
      filters: statusOptions.filter(s => s.value !== 'all').map(s => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '27%',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setSelectedAppointment(record);
              setModalVisible(true);
            }}
          >
            Chi tiết
          </Button>
          {['SCHEDULED', 'CONFIRMED'].includes(record.status) && (
            <Button
              type="default"
              size="small"
              onClick={() => handleStatusChange(record, 'IN_PROGRESS')}
            >
              Bắt đầu
            </Button>
          )}
          {record.status === 'IN_PROGRESS' && (
            <Button
              type="primary"
              size="small"
              danger
              onClick={() => handleStatusChange(record, 'COMPLETED')}
            >
              Hoàn thành
            </Button>
          )}
          {record.status === 'IN_PROGRESS' && (
            <Button
              type="default"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => navigate('/doctor/prescriptions', {
                state: {
                  patientId: record.patientId?._id,
                  patientName: `${record.patientId?.personalInfo?.firstName} ${record.patientId?.personalInfo?.lastName}`
                }
              })}
            >
              Kê đơn
            </Button>
          )}
          {['SCHEDULED', 'CONFIRMED'].includes(record.status) && (
            <Button
              danger
              size="small"
              onClick={() => handleCancelAppointment(record._id)}
            >
              Hủy
            </Button>
          )}
          <Button
            type="default"
            size="small"
            icon={<MessageOutlined />}
            onClick={() => navigate('/doctor/messages', {
              state: {
                patientId: record.patientId?._id,
                patientName: `${record.patientId?.personalInfo?.firstName} ${record.patientId?.personalInfo?.lastName}`
              }
            })}
          />
        </Space>
      ),
    },
  ];

  return (
    <DoctorLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Quản lý Lịch hẹn</h1>
        </div>

        {/* Filters */}
        <Card className="rounded-lg">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <DatePicker
                className="w-full"
                placeholder="Chọn ngày"
                value={filters.date}
                onChange={(date) => setFilters({ ...filters, date })}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <CustomSelect
                className="w-full"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                options={statusOptions}
              />
            </Col>

            <Col xs={24} sm={12} md={12}>
              <Input
                placeholder="Tìm kiếm bệnh nhân..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card className="rounded-lg">
          {loading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredAppointments}
              rowKey="_id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredAppointments.length,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              onChange={(pag) => setPagination(pag)}
              scroll={{ x: 1200 }}
            />
          )}
        </Card>

        {/* Detail Modal */}
        <Modal
          title="Chi tiết lịch hẹn"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2">
                  <UserOutlined /> Bệnh nhân
                </label>
                <p className="text-gray-900">
                  {selectedAppointment.patientId?.personalInfo?.firstName}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2">
                  <MailOutlined /> Email
                </label>
                <p className="text-gray-900">
                  {selectedAppointment.patientId?.personalInfo?.email}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2">
                  <PhoneOutlined /> Điện thoại
                </label>
                <p className="text-gray-900">
                  {selectedAppointment.patientId?.personalInfo?.phone}
                </p>
              </div>

              <Divider />

              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2">
                  <CalendarOutlined /> Ngày giờ
                </label>
                <p className="text-gray-900">
                  {dayjs(selectedAppointment.appointmentDate).format('DD/MM/YYYY HH:mm')}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2">
                  <FileTextOutlined /> Lý do khám
                </label>
                <p className="text-gray-900">{selectedAppointment.reason}</p>
              </div>

              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2">
                  <CheckCircleOutlined /> Trạng thái
                </label>
                <p>
                  <Tag color={getStatusColor(selectedAppointment.status)}>
                    {getStatusLabel(selectedAppointment.status)}
                  </Tag>
                </p>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <label className="font-semibold text-gray-700">Ghi chú</label>
                  <p className="text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}

              <Divider />
              <Button
                type="primary"
                block
                icon={<MessageOutlined />}
                onClick={() => navigate('/doctor/messages', {
                  state: {
                    patientId: selectedAppointment.patientId?._id,
                    patientName: `${selectedAppointment.patientId?.personalInfo?.firstName} ${selectedAppointment.patientId?.personalInfo?.lastName}`
                  }
                })}
              >
                Nhắn tin cho bệnh nhân
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </DoctorLayout>
  );
};

export default Appointments;
