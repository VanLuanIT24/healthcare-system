// src/pages/admin/appointments/AppointmentAccessLogs.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import { ArrowLeftOutlined, AuditOutlined } from '@ant-design/icons';
import { Button, Card, Col, message, Row, Skeleton, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AppointmentAccessLogs = () => {
  const { appointmentId } = useParams();
  const [logs, setLogs] = useState([]);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const actionColorMap = {
    'VIEW': 'blue',
    'CREATE': 'green',
    'UPDATE': 'orange',
    'DELETE': 'red',
    'CANCEL': 'volcano',
    'RESCHEDULE': 'cyan',
    'CHECK_IN': 'purple',
    'COMPLETE': 'geekblue',
    'NO_SHOW': 'magenta'
  };

  const actionLabelMap = {
    'VIEW': 'Xem',
    'CREATE': 'Tạo',
    'UPDATE': 'Cập nhật',
    'DELETE': 'Xóa',
    'CANCEL': 'Hủy',
    'RESCHEDULE': 'Đổi lịch',
    'CHECK_IN': 'Check-in',
    'COMPLETE': 'Hoàn thành',
    'NO_SHOW': 'Vắng mặt'
  };

  useEffect(() => {
    loadAppointmentAndLogs();
  }, [appointmentId]);

  const loadAppointmentAndLogs = async () => {
    try {
      setLoading(true);

      const [appointmentRes, logsRes] = await Promise.all([
        appointmentAPI.getAppointmentById(appointmentId),
        appointmentAPI.getAppointmentAccessLogs(appointmentId)
      ]);

      setAppointment(appointmentRes.data);
      setLogs(logsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: '15%',
      render: (timestamp) => dayjs(timestamp).format('DD/MM/YYYY HH:mm:ss'),
      sorter: (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: '12%',
      render: (action) => (
        <Tag color={actionColorMap[action] || 'default'}>
          {actionLabelMap[action] || action}
        </Tag>
      )
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'userId',
      key: 'userId',
      width: '20%',
      render: (userId, record) => (
        <div>
          <div style={{ fontWeight: '500' }}>
            {record.userName || userId}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.userEmail}
          </div>
        </div>
      )
    },
    {
      title: 'Chức vụ',
      dataIndex: ['userRole'],
      key: 'userRole',
      width: '15%',
      render: (role) => (
        <Tag color="blue">
          {role || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Chi tiết',
      dataIndex: 'metadata',
      key: 'metadata',
      render: (metadata) => (
        <div style={{ fontSize: '12px', color: '#666', maxWidth: '200px' }}>
          {metadata && typeof metadata === 'object' ? (
            <pre style={{ margin: 0, whiteSpace: 'normal', wordWrap: 'break-word' }}>
              {JSON.stringify(metadata, null, 2).substring(0, 100)}...
            </pre>
          ) : (
            metadata || 'N/A'
          )}
        </div>
      )
    },
    {
      title: 'IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: '15%',
      render: (ip) => ip || 'N/A'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/admin/appointments/${appointmentId}`)}
          >
            Quay lại
          </Button>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          <AuditOutlined style={{ marginRight: '8px' }} />
          Nhật ký truy cập lịch hẹn
        </h1>

        {appointment && (
          <Card style={{ marginBottom: '20px', backgroundColor: '#f0f5ff' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div>
                  <strong>Bệnh nhân:</strong>
                  <div style={{ marginTop: '4px' }}>
                    {appointment.patientId?.fullName || 'N/A'}
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div>
                  <strong>Bác sĩ:</strong>
                  <div style={{ marginTop: '4px' }}>
                    {appointment.doctorId?.fullName || 'N/A'}
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div>
                  <strong>Thời gian:</strong>
                  <div style={{ marginTop: '4px' }}>
                    {dayjs(appointment.appointmentDate).format('DD/MM/YYYY HH:mm')}
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <div>
                  <strong>Trạng thái:</strong>
                  <div style={{ marginTop: '4px' }}>
                    <Tag>{appointment.status}</Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        <Card title={`Tổng cộng: ${logs.length} lần truy cập`}>
          <Table
            columns={columns}
            dataSource={logs}
            rowKey={(record, index) => index}
            pagination={{
              pageSize: 20,
              showTotal: (total) => `Tổng ${total} bản ghi`
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        <Card style={{ marginTop: '20px', backgroundColor: '#fff7e6', borderLeft: '4px solid #faad14' }}>
          <strong>📝 Thông tin:</strong>
          <ul style={{ marginTop: '8px', marginBottom: 0 }}>
            <li>Nhật ký này ghi lại tất cả các hoạt động liên quan đến lịch hẹn này</li>
            <li>Bao gồm xem, chỉnh sửa, hủy, và các hành động khác</li>
            <li>Thông tin được sử dụng cho mục đích kiểm toán và bảo mật</li>
            <li>Các bản ghi được lưu giữ trong 1 năm từ ngày tạo</li>
          </ul>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AppointmentAccessLogs;
