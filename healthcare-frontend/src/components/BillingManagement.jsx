import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, Input, Select, message, Drawer,
  Descriptions, Badge, Row, Col, InputNumber, DatePicker, Tag, Tabs
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DollarOutlined, FileOutlined
} from '@ant-design/icons';
import { apiClient } from '../utils/api';
import dayjs from 'dayjs';

const BillingManagement = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchRecords();
    fetchPatients();
  }, [activeTab, pagination.current, pagination.pageSize]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      switch (activeTab) {
        case 'invoices':
          endpoint = '/bills/invoices';
          break;
        case 'insurance':
          endpoint = '/bills/insurance';
          break;
        case 'payments':
          endpoint = '/bills/payments';
          break;
        default:
          endpoint = '/bills/invoices';
      }

      const response = await apiClient.get(endpoint, {
        params: {
          page: pagination.current,
          limit: pagination.pageSize
        }
      });

      if (response.data.success) {
        setRecords(response.data.data.records || response.data.data || []);
        setPagination({
          ...pagination,
          total: response.data.data.total || 0
        });
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err);
      message.error(`Không thể tải ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await apiClient.get('/patients/search', {
        params: { limit: 1000 }
      });
      if (response.data.success) {
        setPatients(response.data.data.patients || []);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const handleCreateRecord = () => {
    setSelectedRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      patientId: record.patientId?._id || record.patientId,
      amount: record.amount,
      description: record.description,
      status: record.status,
      dueDate: record.dueDate ? dayjs(record.dueDate) : null
    });
    setIsModalVisible(true);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setIsDetailDrawerVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        patientId: values.patientId,
        amount: values.amount,
        description: values.description,
        status: values.status || 'PENDING',
        dueDate: values.dueDate?.toISOString()
      };

      if (selectedRecord) {
        await apiClient.put(
          `/bills/${activeTab}/${selectedRecord._id}`,
          payload
        );
        message.success('Cập nhật thành công');
      } else {
        await apiClient.post(
          `/bills/${activeTab}`,
          payload
        );
        message.success('Tạo mới thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchRecords();
    } catch (err) {
      console.error('Submit error:', err);
      message.error(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleDeleteRecord = (recordId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.delete(`/bills/${activeTab}/${recordId}`);
          message.success('Xóa thành công');
          fetchRecords();
        } catch (err) {
          message.error('Không thể xóa');
        }
      }
    });
  };

  const invoiceColumns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber'
    },
    {
      title: 'Bệnh nhân',
      dataIndex: ['patientId', 'patientId'],
      key: 'patient'
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <span style={{ color: '#1890ff' }}>{amount?.toLocaleString('vi-VN')} đ</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          'PENDING': 'orange',
          'PAID': 'green',
          'OVERDUE': 'red',
          'CANCELLED': 'gray'
        };
        const labels = {
          'PENDING': 'Chờ thanh toán',
          'PAID': 'Đã thanh toán',
          'OVERDUE': 'Quá hạn',
          'CANCELLED': 'Đã hủy'
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      }
    },
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleViewRecord(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleEditRecord(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteRecord(record._id)} />
        </Space>
      )
    }
  ];

  const tabItems = [
    {
      key: 'invoices',
      label: <span><FileOutlined /> Hóa đơn</span>,
      children: (
        <Table
          columns={invoiceColumns}
          dataSource={records}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize, total: pagination.total })
          }}
          rowKey="_id"
        />
      )
    },
    {
      key: 'insurance',
      label: <span><DollarOutlined /> Bảo hiểm</span>,
      children: (
        <Table
          columns={invoiceColumns}
          dataSource={records}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize, total: pagination.total })
          }}
          rowKey="_id"
        />
      )
    },
    {
      key: 'payments',
      label: <span><DollarOutlined /> Thanh toán</span>,
      children: (
        <Table
          columns={invoiceColumns}
          dataSource={records}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize, total: pagination.total })
          }}
          rowKey="_id"
        />
      )
    }
  ];

  return (
    <div>
      <Card
        title="Quản Lý Thanh Toán & Bảo Hiểm"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateRecord}>
            Tạo Mới
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      <Modal
        title={selectedRecord ? 'Sửa' : 'Tạo mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="patientId"
            label="Bệnh nhân"
            rules={[{ required: true, message: 'Vui lòng chọn bệnh nhân' }]}
          >
            <Select placeholder="Chọn bệnh nhân">
              {patients.map(p => (
                <Select.Option key={p._id} value={p._id}>
                  {p.patientId} - {p.personalInfo?.firstName} {p.personalInfo?.lastName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
          >
            <InputNumber
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              min={0}
              placeholder="Nhập số tiền"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Ngày hạn thanh toán"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue="PENDING"
          >
            <Select>
              <Select.Option value="PENDING">Chờ thanh toán</Select.Option>
              <Select.Option value="PAID">Đã thanh toán</Select.Option>
              <Select.Option value="OVERDUE">Quá hạn</Select.Option>
              <Select.Option value="CANCELLED">Đã hủy</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedRecord ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Chi tiết"
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
        width={500}
      >
        {selectedRecord && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã hóa đơn">
              {selectedRecord.invoiceNumber || selectedRecord._id}
            </Descriptions.Item>
            <Descriptions.Item label="Bệnh nhân">
              {selectedRecord.patientId?.patientId}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <span style={{ color: '#1890ff', fontSize: '16px', fontWeight: 'bold' }}>
                {selectedRecord.amount?.toLocaleString('vi-VN')} đ
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {selectedRecord.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Hạn thanh toán">
              {selectedRecord.dueDate ? dayjs(selectedRecord.dueDate).format('DD/MM/YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {dayjs(selectedRecord.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default BillingManagement;
