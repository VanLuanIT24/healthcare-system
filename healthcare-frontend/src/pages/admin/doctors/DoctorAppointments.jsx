// src/pages/admin/doctors/DoctorAppointments.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Card, Space, Button, Tag, Input, Row, Col, Modal, message, Spin } from 'antd';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';

import { LoadingOutlined, ArrowLeftOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { doctorAPI } from '@/services/api/doctorAPI';
import { motion } from 'framer-motion';

const DoctorAppointments = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [doctorName, setDoctorName] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [pageNumber, pageSize, status]);

  useEffect(() => {
    if (doctorId) {
      const getDoctorName = async () => {
        try {
          const res = await doctorAPI.getDoctorById(doctorId);
          if (res.data?.data) {
            setDoctorName(
              `${res.data.data.personalInfo?.firstName || ''} ${res.data.data.personalInfo?.lastName || ''}`.trim()
            );
          }
        } catch (error) {
          console.error('Error loading doctor name:', error);
        }
      };
      getDoctorName();
    }
  }, [doctorId]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pageNumber,
        limit: pageSize,
      };

      if (status) params.status = status;

      const res = await doctorAPI.getDoctorAppointments(doctorId, params);

      if (Array.isArray(res.data?.data)) {
        setAppointments(res.data.data);
      } else if (res.data?.data?.appointments) {
        setAppointments(res.data.data.appointments);
        setTotal(res.data.data.total || 0);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      message.error('Lỗi khi tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Bệnh nhân',
      dataIndex: ['patient', 'personalInfo'],
      key: 'patient',
      render: (info, record) => (
        <div>
          <strong>{`${info?.firstName || ''} ${info?.lastName || ''}`.trim()}</strong>
          <br />
          <small style={{ color: '#666' }}>{record.patient?.email}</small>
        </div>
      ),
    },
    {
      title: 'Ngày giờ',
      dataIndex: 'appointmentDateTime',
      key: 'datetime',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Loại',
      dataIndex: 'appointmentType',
      key: 'type',
      render: (type) => type || 'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          'SCHEDULED': 'blue',
          'COMPLETED': 'green',
          'CANCELLED': 'red',
          'NO_SHOW': 'orange',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes || '-',
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/appointments/${record._id}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ padding: '24px' }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/doctors')}
          style={{ marginBottom: '20px' }}
        >
          Quay lại
        </Button>

        <h1 style={{ marginBottom: '24px' }}>📋 Lịch hẹn của bác sĩ {doctorName}</h1>

        {/* Filters */}
        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <CustomSelect
                placeholder="Chọn trạng thái"
                value={status || undefined}
                onChange={(value) => setStatus(value)}
                options={[
                  { label: 'Đã lên lịch', value: 'SCHEDULED' },
                  { label: 'Hoàn thành', value: 'COMPLETED' },
                  { label: 'Hủy', value: 'CANCELLED' },
                  { label: 'Không đến', value: 'NO_SHOW' },
                ]}
                allowClear
              />

            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card style={{ borderRadius: '12px' }}>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={appointments}
              rowKey="_id"
              pagination={{
                current: pageNumber,
                pageSize: pageSize,
                total: total,
                onChange: (page, size) => {
                  setPageNumber(page);
                  setPageSize(size);
                },
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} lịch hẹn`,
              }}
              scroll={{ x: 1200 }}
            />
          </Spin>
        </Card>
      </motion.div>
    </AdminLayout>
  );
};

export default DoctorAppointments;
