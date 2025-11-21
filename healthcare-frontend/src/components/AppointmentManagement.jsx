import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Tag,
  Space,
  message,
  Drawer,
  Row,
  Col,
  Statistic,
  Empty,
  Spin,
  Popconfirm,
  Empty as EmptyState
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloseOutlined,
  CheckOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { apiClient } from '../utils/api';
import dayjs from 'dayjs';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [pagination.page, filterStatus]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filterStatus && { status: filterStatus }),
        ...(searchText && { search: searchText })
      };

      const response = await apiClient.get('/appointments', { params });

      if (response.data.success) {
        const data = Array.isArray(response.data.data) 
          ? response.data.data 
          : response.data.data.appointments || [];
        
        setAppointments(data.map(apt => ({ ...apt, key: apt._id })));
        
        // Update pagination if total count provided
        if (response.data.data.total) {
          setPagination(prev => ({ ...prev, total: response.data.data.total }));
        }
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      message.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (values) => {
    try {
      setLoading(true);

      const appointmentData = {
        patientId: values.patientId,
        doctorId: values.doctorId,
        appointmentDate: values.appointmentDate ? values.appointmentDate.format('YYYY-MM-DD') : '',
        appointmentTime: values.appointmentTime ? values.appointmentTime.format('HH:mm') : '',
        reason: values.reason,
        notes: values.notes,
        status: 'SCHEDULED'
      };

      if (editingId) {
        await apiClient.put(`/appointments/${editingId}`, appointmentData);
        message.success('Cập nhật lịch hẹn thành công');
      } else {
        await apiClient.post('/appointments', appointmentData);
        message.success('Tạo lịch hẹn thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchAppointments();
    } catch (err) {
      console.error('Error saving appointment:', err);
      message.error(err.response?.data?.message || 'Lỗi khi lưu lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAppointment = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({
      patientId: record.patientId,
      doctorId: record.doctorId,
      appointmentDate: record.appointmentDate ? dayjs(record.appointmentDate) : null,
      appointmentTime: record.appointmentTime ? dayjs(record.appointmentTime, 'HH:mm') : null,
      reason: record.reason,
      notes: record.notes
    });
    setIsModalVisible(true);
  };

  const handleDeleteAppointment = async (id) => {
    try {
      await apiClient.delete(`/appointments/${id}`);
      message.success('Xóa lịch hẹn thành công');
      fetchAppointments();
    } catch (err) {
      console.error('Error deleting appointment:', err);
      message.error('Không thể xóa lịch hẹn');
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      await apiClient.patch(`/appointments/${id}`, { status: 'CANCELLED' });
      message.success('Hủy lịch hẹn thành công');
      fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      message.error('Không thể hủy lịch hẹn');
    }
  };

  const handleCompleteAppointment = async (id) => {
    try {
      await apiClient.patch(`/appointments/${id}`, { status: 'COMPLETED' });
      message.success('Hoàn thành lịch hẹn thành công');
      fetchAppointments();
    } catch (err) {
      console.error('Error completing appointment:', err);
      message.error('Không thể hoàn thành lịch hẹn');
    }
  };

  const handleViewDetails = (record) => {
    setSelectedAppointment(record);
    setIsDetailDrawerVisible(true);
  };

  const getStatusTag = (status) => {
    const statusMap = {
      SCHEDULED: { color: 'blue', label: 'Đã lên lịch' },
      COMPLETED: { color: 'green', label: 'Hoàn thành' },
      CANCELLED: { color: 'red', label: 'Hủy' },
      NO_SHOW: { color: 'orange', label: 'Không xuất hiện' }
    };
    const config = statusMap[status] || { color: 'default', label: status };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const columns = [
    {
      title: 'Bệnh nhân',
      dataIndex: 'patientId',
      key: 'patientId',
      render: (id) => id || 'N/A'
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (id) => id || 'N/A'
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
    },
    {
      title: 'Giờ hẹn',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
      render: (time) => time || 'N/A'
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => reason || 'N/A'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />
          {record.status === 'SCHEDULED' && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditAppointment(record)}
              />
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleCompleteAppointment(record._id)}
              />
              <Popconfirm
                title="Hủy lịch hẹn"
                description="Bạn có chắc chắn muốn hủy lịch hẹn này?"
                onConfirm={() => handleCancelAppointment(record._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button size="small" danger icon={<CloseOutlined />} />
              </Popconfirm>
            </>
          )}
          <Popconfirm
            title="Xóa lịch hẹn"
            description="Bạn có chắc chắn muốn xóa lịch hẹn này?"
            onConfirm={() => handleDeleteAppointment(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng lịch hẹn"
              value={appointments.length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã lên lịch"
              value={appointments.filter(a => a.status === 'SCHEDULED').length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={appointments.filter(a => a.status === 'COMPLETED').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hủy"
              value={appointments.filter(a => a.status === 'CANCELLED').length}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Card style={{ marginBottom: '24px' }}>
        <Space style={{ width: '100%', marginBottom: '16px' }}>
          <Input
            placeholder="Tìm kiếm bệnh nhân..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '250px' }}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: '200px' }}
            allowClear
            value={filterStatus}
            onChange={setFilterStatus}
          >
            <Select.Option value="">Tất cả trạng thái</Select.Option>
            <Select.Option value="SCHEDULED">Đã lên lịch</Select.Option>
            <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
            <Select.Option value="CANCELLED">Hủy</Select.Option>
            <Select.Option value="NO_SHOW">Không xuất hiện</Select.Option>
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Tạo lịch hẹn
          </Button>
        </Space>
      </Card>

      {/* Appointments Table */}
      <Card loading={loading}>
        <Table
          columns={columns}
          dataSource={appointments}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination(prev => ({ ...prev, page }))
          }}
          rowKey="key"
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingId ? 'Chỉnh sửa lịch hẹn' : 'Tạo lịch hẹn mới'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingId(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAppointment}
        >
          <Form.Item
            name="patientId"
            label="ID Bệnh nhân"
            rules={[{ required: true, message: 'Vui lòng nhập ID bệnh nhân' }]}
          >
            <Input placeholder="Nhập ID bệnh nhân" />
          </Form.Item>

          <Form.Item
            name="doctorId"
            label="ID Bác sĩ"
            rules={[{ required: true, message: 'Vui lòng nhập ID bác sĩ' }]}
          >
            <Input placeholder="Nhập ID bác sĩ" />
          </Form.Item>

          <Form.Item
            name="appointmentDate"
            label="Ngày hẹn"
            rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="appointmentTime"
            label="Giờ hẹn"
            rules={[{ required: true, message: 'Vui lòng chọn giờ hẹn' }]}
          >
            <TimePicker
              format="HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do khám"
            rules={[{ required: true, message: 'Vui lòng nhập lý do khám' }]}
          >
            <Input.TextArea
              placeholder="Nhập lý do khám"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea
              placeholder="Nhập ghi chú thêm"
              rows={2}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title="Chi tiết lịch hẹn"
        placement="right"
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
        width={400}
      >
        {selectedAppointment ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <strong>ID:</strong>
              <p>{selectedAppointment._id}</p>
            </div>

            <div>
              <strong>Bệnh nhân:</strong>
              <p>{selectedAppointment.patientId}</p>
            </div>

            <div>
              <strong>Bác sĩ:</strong>
              <p>{selectedAppointment.doctorId}</p>
            </div>

            <div>
              <strong>Ngày hẹn:</strong>
              <p>{selectedAppointment.appointmentDate ? dayjs(selectedAppointment.appointmentDate).format('DD/MM/YYYY') : 'N/A'}</p>
            </div>

            <div>
              <strong>Giờ hẹn:</strong>
              <p>{selectedAppointment.appointmentTime || 'N/A'}</p>
            </div>

            <div>
              <strong>Lý do:</strong>
              <p>{selectedAppointment.reason || 'N/A'}</p>
            </div>

            <div>
              <strong>Ghi chú:</strong>
              <p>{selectedAppointment.notes || 'N/A'}</p>
            </div>

            <div>
              <strong>Trạng thái:</strong>
              <p>{getStatusTag(selectedAppointment.status)}</p>
            </div>

            <div>
              <strong>Ngày tạo:</strong>
              <p>{selectedAppointment.createdAt ? dayjs(selectedAppointment.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A'}</p>
            </div>
          </Space>
        ) : (
          <Empty />
        )}
      </Drawer>
    </div>
  );
};

export default AppointmentManagement;
