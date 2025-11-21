import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, Input, Select, message, Drawer,
  Descriptions, Badge, Row, Col, Tabs, Tag, Empty, Spin, DatePicker
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined,
  MedicineBoxOutlined, ExperimentOutlined, UserOutlined
} from '@ant-design/icons';
import { apiClient } from '../utils/api';
import dayjs from 'dayjs';

const MedicalRecordManagement = () => {
  const [activeTab, setActiveTab] = useState('diagnoses');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchRecords();
    fetchPatients();
    fetchDoctors();
  }, [activeTab, pagination.current, pagination.pageSize]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      switch (activeTab) {
        case 'diagnoses':
          endpoint = '/medical-records/diagnoses';
          break;
        case 'prescriptions':
          endpoint = '/medical-records/prescriptions';
          break;
        case 'lab-orders':
          endpoint = '/medical-records/lab-orders';
          break;
        case 'consultations':
          endpoint = '/medical-records/consultations';
          break;
        default:
          endpoint = '/medical-records/diagnoses';
      }

      const response = await apiClient.get(endpoint, {
        params: {
          page: pagination.current,
          limit: pagination.pageSize
        }
      });

      if (response.data.success) {
        setRecords(response.data.data.records || []);
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

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get('/users', {
        params: { role: 'DOCTOR', limit: 1000 }
      });
      if (response.data.success) {
        setDoctors(response.data.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
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
      doctorId: record.doctorId?._id || record.doctorId,
      description: record.description,
      notes: record.notes,
      status: record.status
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
        doctorId: values.doctorId,
        description: values.description,
        notes: values.notes,
        status: values.status || 'ACTIVE'
      };

      if (selectedRecord) {
        // Update
        await apiClient.put(
          `/medical-records/${activeTab}/${selectedRecord._id}`,
          payload
        );
        message.success(`Cập nhật ${activeTab} thành công`);
      } else {
        // Create
        await apiClient.post(
          `/medical-records/${activeTab}`,
          payload
        );
        message.success(`Tạo ${activeTab} thành công`);
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
          await apiClient.delete(`/medical-records/${activeTab}/${recordId}`);
          message.success('Xóa thành công');
          fetchRecords();
        } catch (err) {
          message.error('Không thể xóa');
        }
      }
    });
  };

  const getDiagnosisColumns = () => [
    {
      title: 'Bệnh nhân',
      dataIndex: ['patientId', 'patientId'],
      key: 'patient',
      render: (_, record) => record.patientId?.patientId || '-'
    },
    {
      title: 'Bác sĩ',
      dataIndex: ['doctorId', 'email'],
      key: 'doctor',
      render: (_, record) => record.doctorId?.email || '-'
    },
    {
      title: 'Chẩn đoán',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (text) => <span>{text?.substring(0, 50)}...</span>
    },
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={status === 'ACTIVE' ? 'success' : 'default'} text={status} />
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleViewRecord(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleEditRecord(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteRecord(record._id)} />
        </Space>
      )
    }
  ];

  const getCommonColumns = () => [
    {
      title: 'Bệnh nhân',
      dataIndex: ['patientId', 'patientId'],
      key: 'patient'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (text) => <span>{text?.substring(0, 50)}...</span>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
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
      key: 'diagnoses',
      label: <span><FileTextOutlined /> Chẩn đoán</span>,
      children: (
        <Table
          columns={getDiagnosisColumns()}
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
      key: 'prescriptions',
      label: <span><MedicineBoxOutlined /> Đơn thuốc</span>,
      children: (
        <Table
          columns={getCommonColumns()}
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
      key: 'lab-orders',
      label: <span><ExperimentOutlined /> Xét nghiệm</span>,
      children: (
        <Table
          columns={getCommonColumns()}
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
      key: 'consultations',
      label: <span><UserOutlined /> Tư vấn</span>,
      children: (
        <Table
          columns={getCommonColumns()}
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
        title="Quản Lý Hồ Sơ Bệnh Nhân"
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
        title={selectedRecord ? `Sửa ${activeTab}` : `Tạo ${activeTab}`}
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
            name="doctorId"
            label="Bác sĩ"
            rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
          >
            <Select placeholder="Chọn bác sĩ">
              {doctors.map(d => (
                <Select.Option key={d._id} value={d._id}>
                  {d.email} - {d.personalInfo?.firstName} {d.personalInfo?.lastName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Nhập ghi chú (tùy chọn)" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue="ACTIVE"
          >
            <Select>
              <Select.Option value="ACTIVE">Hoạt động</Select.Option>
              <Select.Option value="INACTIVE">Không hoạt động</Select.Option>
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
            <Descriptions.Item label="Bệnh nhân">
              {selectedRecord.patientId?.patientId}
            </Descriptions.Item>
            <Descriptions.Item label="Bác sĩ">
              {selectedRecord.doctorId?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {selectedRecord.description}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {selectedRecord.notes || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {dayjs(selectedRecord.createdAt).format('DD/MM/YYYY HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Badge status={selectedRecord.status === 'ACTIVE' ? 'success' : 'default'} text={selectedRecord.status} />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default MedicalRecordManagement;
