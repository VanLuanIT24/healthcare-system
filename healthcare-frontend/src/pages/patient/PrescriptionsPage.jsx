// src/pages/patient/PrescriptionsPage.jsx
import { useAuth } from '@/contexts/AuthContext';
import prescriptionAPI from '@/services/api/prescriptionAPI';
import { DownloadOutlined, EyeOutlined, LoadingOutlined, PrinterOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Empty, message, Modal, Space, Spin, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const PrescriptionsPage = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        // Get patient ID from auth context
        const patientId = user?._id || user?.id;

        if (!patientId) {
          message.error('Không thể lấy thông tin bệnh nhân');
          return;
        }

        // Get prescriptions
        const res = await prescriptionAPI.getPatientPrescriptions(patientId, { limit: 50 });
        const data = res.data?.data || res.data || [];
        setPrescriptions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        message.error('Lỗi khi tải đơn thuốc: ' + (error?.response?.data?.message || error?.message || 'Lỗi không xác định'));
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [user]);

  const getStatusTag = (status) => {
    const statusMap = {
      'ACTIVE': { color: 'processing', label: 'Đang dùng' },
      'COMPLETED': { color: 'default', label: 'Kết thúc' },
      'CANCELLED': { color: 'error', label: 'Hủy' },
      'EXPIRED': { color: 'warning', label: 'Hết hạn' },
      'PENDING': { color: 'warning', label: 'Chờ duyệt' },
      'DISPENSED': { color: 'success', label: 'Đã cấp phát' },
    };
    const info = statusMap[status] || { color: 'default', label: status };
    return <Tag color={info.color}>{info.label}</Tag>;
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setIsModalVisible(true);
  };

  const handleDownload = async (prescription) => {
    try {
      message.loading({ content: 'Đang tải xuống...', key: 'download' });
      const res = await prescriptionAPI.exportPDF(prescription._id);
      
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${prescription._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      message.success({ content: 'Tải xuống thành công!', key: 'download' });
    } catch (error) {
      console.error('Error downloading prescription:', error);
      message.error({ content: 'Lỗi khi tải xuống', key: 'download' });
    }
  };

  const columns = [
    {
      title: 'Bác sĩ',
      dataIndex: ['doctorId', 'personalInfo', 'firstName'],
      key: 'doctor',
      render: (_, record) => `BS. ${record.doctorId?.personalInfo?.firstName} ${record.doctorId?.personalInfo?.lastName}`,
    },
    {
      title: 'Ngày cấp',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Thời gian',
      dataIndex: 'durationDays',
      key: 'duration',
      render: (days) => `${days} ngày`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewPrescription(record)}
          >
            Xem
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            Tải
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn thuốc</h1>
          <p className="text-gray-500">Theo dõi các đơn thuốc được kê đơn</p>
        </div>

        <Card className="rounded-xl">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading}>
            {prescriptions.length > 0 ? (
              <Table
                dataSource={prescriptions}
                columns={columns}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description="Không có đơn thuốc" />
            )}
          </Spin>
        </Card>

        {/* Prescription Detail Modal */}
        <Modal
          title="Chi tiết đơn thuốc"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          width={700}
          footer={[
            <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
              In
            </Button>,
            <Button 
              key="download" 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(selectedPrescription)}
            >
              Tải xuống
            </Button>,
          ]}
        >
          {selectedPrescription && (
            <div className="space-y-4">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Bác sĩ">
                  BS. {selectedPrescription.doctorId?.personalInfo?.firstName} {selectedPrescription.doctorId?.personalInfo?.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cấp">
                  {dayjs(selectedPrescription.createdAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian sử dụng">
                  {selectedPrescription.durationDays} ngày
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {getStatusTag(selectedPrescription.status)}
                </Descriptions.Item>
                {selectedPrescription.notes && (
                  <Descriptions.Item label="Ghi chú">
                    {selectedPrescription.notes}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Danh sách thuốc</h3>
                {selectedPrescription.medications && selectedPrescription.medications.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedPrescription.medications.map((med, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">
                            {med.medicationId?.name || med.medication}
                          </p>
                          <p className="text-sm text-gray-600">
                            Liều lượng: {med.dosage} | Thời gian: {med.frequency}
                          </p>
                          {med.notes && (
                            <p className="text-sm text-gray-500">Ghi chú: {med.notes}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty description="Không có thuốc trong đơn này" />
                )}
              </div>
            </div>
          )}
        </Modal>
      </motion.div>
  );
};

export default PrescriptionsPage;
