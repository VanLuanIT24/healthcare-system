// src/pages/admin/appointments/AppointmentsList.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import { CheckOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined, EyeOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Modal, Row, Skeleton, Space, Table, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: '', doctorId: '' });
  const navigate = useNavigate();

  const statusMap = {
    SCHEDULED: { label: 'Chờ xác nhận', color: 'blue' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'green' },
    IN_PROGRESS: { label: 'Đang khám', color: 'orange' },
    COMPLETED: { label: 'Hoàn thành', color: 'cyan' },
    CANCELLED: { label: 'Đã hủy', color: 'red' },
    NO_SHOW: { label: 'Vắng mặt', color: 'default' }
  };

  const fetchAppointments = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointments({
        page,
        limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
        doctorId: filters.doctorId || undefined
      });

      const data = response?.data?.data || {};
      const items = data?.items || [];

      setAppointments(items);
      setPagination({
        current: page,
        pageSize: limit,
        total: data?.total || items.length
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      message.error('Lỗi tải danh sách lịch khám');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(1, 10);
  }, [filters]);

  const handleTableChange = (newPagination) => {
    fetchAppointments(newPagination.current, newPagination.pageSize);
  };

  const handleCancel = async (appointmentId) => {
    Modal.confirm({
      title: 'Hủy lịch khám',
      content: 'Bạn có chắc chắn muốn hủy lịch khám này?',
      okText: 'Hủy',
      cancelText: 'Đóng',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await appointmentAPI.cancelAppointment(appointmentId);
          message.success('Hủy lịch khám thành công');
          fetchAppointments(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error(error?.response?.data?.message || 'Lỗi hủy lịch khám');
        }
      }
    });
  };

  const handleConfirm = async (appointmentId) => {
    try {
      await appointmentAPI.updateAppointment(appointmentId, { status: 'CONFIRMED' });
      message.success('Xác nhận lịch khám thành công');
      fetchAppointments(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Lỗi xác nhận lịch khám');
    }
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      await appointmentAPI.checkInAppointment(appointmentId);
      message.success('Check-in thành công');
      fetchAppointments(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Lỗi check-in');
    }
  };

  const columns = [
    {
      title: 'Bệnh nhân',
      key: 'patientName',
      width: '15%',
      render: (_, record) => (
        <div>
          <strong>{record?.patientId?.personalInfo?.firstName} {record?.patientId?.personalInfo?.lastName}</strong>
          <div style={{ fontSize: '12px', color: '#1890ff' }}>{record?.patientId?.personalInfo?.phone || record?.patientId?.phone || 'No phone'}</div>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{record?.patientId?.email}</div>
        </div>
      )
    },
    {
      title: 'Bác sĩ',
      key: 'doctorName',
      width: '15%',
      render: (_, record) => (
        <div>
          <strong>{record?.doctorId?.personalInfo?.firstName} {record?.doctorId?.personalInfo?.lastName}</strong>
          <div style={{ fontSize: '12px', color: '#52c41a' }}>
            {record?.doctorId?.professionalInfo?.department?.name || record?.doctorId?.professionalInfo?.department || 'N/A'}
          </div>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
            {record?.doctorId?.personalInfo?.phone || 'No phone'}
          </div>
        </div>
      )
    },
    {
      title: 'Thời gian',
      key: 'appointmentTime',
      width: '15%',
      render: (_, record) => {
        const start = dayjs(record?.appointmentDate);
        const end = start.add(record?.duration || 30, 'minute');
        return (
          <div>
            <div style={{ fontWeight: '500' }}>{start.format('DD/MM/YYYY')}</div>
            <div style={{ fontSize: '13px', color: '#1890ff' }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {start.format('HH:mm')} - {end.format('HH:mm')}
            </div>
          </div>
        );
      },
      sorter: (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
    },
    {
      title: 'Lý do khám',
      key: 'reason',
      width: '15%',
      render: (_, record) => <span>{record?.reason || 'N/A'}</span>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: '12%',
      render: (_, record) => (
        <Tag color={statusMap[record?.status]?.color || 'default'}>
          {statusMap[record?.status]?.label || record?.status}
        </Tag>
      ),
      filters: Object.entries(statusMap).map(([key, val]) => ({
        text: val.label,
        value: key
      }))
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '20%',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/appointments/${record?._id}`)}
          >
            Chi tiết
          </Button>
          {record?.status === 'SCHEDULED' && (
            <>
              <Button
                type="success"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleConfirm(record?._id)}
              >
                Xác nhận
              </Button>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleCancel(record?._id)}
              >
                Hủy
              </Button>
            </>
          )}
          {record?.status === 'CONFIRMED' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleCheckIn(record?._id)}
            >
              Check-in
            </Button>
          )}
          {record?.status !== 'COMPLETED' && record?.status !== 'CANCELLED' && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/appointments/${record?._id}/reschedule`)}
            >
              Dời lịch
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Quản lí Lịch khám</h1>
        </div>

        {/* Filters */}
        <Card className="rounded-lg">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Tìm theo tên bệnh nhân/bác sĩ..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <CustomSelect
                placeholder="Lọc theo trạng thái"
                allowClear
                value={filters.status || undefined}
                onChange={(value) => setFilters({ ...filters, status: value })}
                options={[
                  { label: 'Chờ xác nhận', value: 'SCHEDULED' },
                  { label: 'Đã xác nhận', value: 'CONFIRMED' },
                  { label: 'Đang khám', value: 'IN_PROGRESS' },
                  { label: 'Hoàn thành', value: 'COMPLETED' },
                  { label: 'Đã hủy', value: 'CANCELLED' },
                  { label: 'Vắng mặt', value: 'NO_SHOW' }
                ]}
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
              dataSource={appointments}
              rowKey="_id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} lịch khám`,
                pageSizeOptions: ['10', '20', '50']
              }}
              onChange={handleTableChange}
              scroll={{ x: 1200 }}
            />
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AppointmentsList;
