// src/pages/patient/AppointmentsPage.jsx
import appointmentAPI from '@/services/api/appointmentAPI';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Empty, message, Modal, Space, Spin, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load appointments from API
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        // Get both today and upcoming appointments (max limit is 50)
        const [todayRes, upcomingRes] = await Promise.all([
          appointmentAPI.getTodayAppointments({ limit: 50 }),
          appointmentAPI.getUpcomingAppointments({ limit: 50 })
        ]);

        // Debug logging
        console.log('Today appointments response:', todayRes);
        console.log('Upcoming appointments response:', upcomingRes);

        // Handle multiple response formats
        let todayData = [];
        let upcomingData = [];

        // Check different possible response structures
        if (todayRes?.data?.data && Array.isArray(todayRes.data.data)) {
          todayData = todayRes.data.data;
        } else if (todayRes?.data && Array.isArray(todayRes.data)) {
          todayData = todayRes.data;
        } else if (Array.isArray(todayRes)) {
          todayData = todayRes;
        }

        if (upcomingRes?.data?.data && Array.isArray(upcomingRes.data.data)) {
          upcomingData = upcomingRes.data.data;
        } else if (upcomingRes?.data && Array.isArray(upcomingRes.data)) {
          upcomingData = upcomingRes.data;
        } else if (Array.isArray(upcomingRes)) {
          upcomingData = upcomingRes;
        }
        
        console.log('Parsed today data:', todayData);
        console.log('Parsed upcoming data:', upcomingData);

        // Combine and format appointments
        const allAppointments = [...todayData, ...upcomingData].map(apt => ({
          id: apt._id || apt.id,
          doctor: `${apt.doctorId?.personalInfo?.firstName || ''} ${apt.doctorId?.personalInfo?.lastName || ''}`.trim() || 'N/A',
          date: dayjs(apt.appointmentDate).format('DD/MM/YYYY'),
          time: dayjs(apt.appointmentDate).format('HH:mm'),
          status: (apt.status || 'scheduled').toLowerCase(),
          reason: apt.reason || 'Không có',
          notes: apt.notes || '',
          fullData: apt,
        }));

        console.log('Final formatted appointments:', allAppointments);
        setAppointments(allAppointments);
      } catch (error) {
        console.error('Error loading appointments:', error);
        message.error('Không thể tải danh sách lịch hẹn: ' + (error?.message || 'Lỗi không xác định'));
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const handleCancel = (record) => {
    Modal.confirm({
      title: 'Xác nhận hủy lịch hẹn',
      content: 'Bạn có chắc chắn muốn hủy lịch hẹn này?',
      okText: 'Hủy lịch',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          await appointmentAPI.requestCancelAppointment(record.id);
          message.success('Yêu cầu hủy lịch hẹn đã được gửi');
          setAppointments(appointments.filter(a => a.id !== record.id));
        } catch (error) {
          message.error('Không thể hủy lịch hẹn. Vui lòng thử lại.');
        }
      },
    });
  };

  const getStatusTag = (status) => {
    const config = {
      'upcoming': { icon: <ClockCircleOutlined />, color: 'processing', text: 'Sắp tới' },
      'scheduled': { icon: <ClockCircleOutlined />, color: 'processing', text: 'Đã lên lịch' },
      'confirmed': { icon: <ClockCircleOutlined />, color: 'blue', text: 'Đã xác nhận' },
      'completed': { icon: <CheckCircleOutlined />, color: 'success', text: 'Hoàn thành' },
      'cancelled': { icon: <CloseCircleOutlined />, color: 'error', text: 'Đã hủy' },
      'in_progress': { icon: <ClockCircleOutlined />, color: 'warning', text: 'Đang khám' },
      'no_show': { icon: <CloseCircleOutlined />, color: 'volcano', text: 'Không đến' },
    };
    const { icon, color, text } = config[status] || config['upcoming'];
    return <Tag icon={icon} color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: 'Bác sĩ',
      dataIndex: 'doctor',
      key: 'doctor',
      width: 180,
    },
    {
      title: 'Ngày khám',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: 'Giờ khám',
      dataIndex: 'time',
      key: 'time',
      width: 100,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              Modal.info({
                title: 'Chi tiết lịch hẹn',
                width: 600,
                content: (
                  <div className="space-y-3">
                    <p><strong>Bác sĩ:</strong> {record.doctor}</p>
                    <p><strong>Ngày khám:</strong> {record.date} {record.time}</p>
                    <p><strong>Trạng thái:</strong> {getStatusTag(record.status)}</p>
                    <p><strong>Lý do khám:</strong> {record.reason}</p>
                    {record.notes && <p><strong>Ghi chú:</strong> {record.notes}</p>}
                  </div>
                ),
              });
            }}
          >
            Chi tiết
          </Button>
          {record.status === 'upcoming' || record.status === 'scheduled' ? (
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleCancel(record)}
            >
              Hủy
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  const upcomingCount = appointments.filter(a => a.status === 'upcoming').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch hẹn khám</h1>
          <p className="text-gray-500">Quản lý và theo dõi tất cả lịch hẹn khám của bạn</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate('/patient/create-appointment')}
          className="rounded-lg"
        >
          Đặt lịch mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl">
          <Badge
            count={appointments.length}
            style={{ backgroundColor: '#1890ff' }}
            overflowCount={99}
          >
            <div className="text-gray-600">Tổng lịch hẹn</div>
          </Badge>
        </Card>
        <Card className="rounded-xl">
          <Badge 
            count={appointments.filter(a => ['upcoming', 'scheduled', 'confirmed'].includes(a.status)).length}
            style={{ backgroundColor: '#faad14' }}
          >
            <div className="text-gray-600">Sắp tới</div>
          </Badge>
        </Card>
        <Card className="rounded-xl">
          <Badge 
            count={appointments.filter(a => a.status === 'completed').length}
            style={{ backgroundColor: '#52c41a' }}
          >
            <div className="text-gray-600">Hoàn thành</div>
          </Badge>
        </Card>
        <Card className="rounded-xl">
          <Badge 
            count={appointments.filter(a => a.status === 'cancelled').length}
            style={{ backgroundColor: '#f5222d' }}
          >
            <div className="text-gray-600">Đã hủy</div>
          </Badge>
        </Card>
      </div>

      {/* Appointments Table */}
      <Card className="rounded-xl">
        <Spin spinning={loading}>
          {appointments.length > 0 ? (
            <Table
              dataSource={appointments}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              className="rounded-lg"
            />
          ) : (
            <Empty 
              description="Không có lịch hẹn" 
              style={{ padding: '40px 0' }}
            />
          )}
        </Spin>
      </Card>
    </motion.div>
  );
};

export default AppointmentsPage;
