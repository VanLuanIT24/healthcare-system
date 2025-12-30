// src/pages/patient/MedicalRecordsPage.jsx
import { useAuth } from '@/contexts/AuthContext';
import medicalRecordAPI from '@/services/api/medicalRecordAPI';
import { DownloadOutlined, EyeOutlined, FileOutlined, LoadingOutlined, PrinterOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Empty, List, message, Modal, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const MedicalRecordsPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch medical records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        // Get patient ID from auth context
        const patientId = user?._id || user?.id;

        if (!patientId) {
          message.error('Không thể lấy thông tin bệnh nhân');
          return;
        }

        // Get medical records
        const res = await medicalRecordAPI.getPatientMedicalRecords(patientId, { limit: 50 });
        const data = res.data?.data || res.data || [];
        setRecords(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching medical records:', error);
        message.error('Lỗi khi tải hồ sơ y tế: ' + (error?.response?.data?.message || error?.message || 'Lỗi không xác định'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const handleDownload = async (record) => {
    try {
      message.loading({ content: 'Đang tải xuống...', key: 'download' });
      const res = await medicalRecordAPI.exportPDF(record.patientId, { recordId: record._id });
      
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `medical-record-${record._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      message.success({ content: 'Tải xuống thành công!', key: 'download' });
    } catch (error) {
      console.error('Error downloading record:', error);
      message.error({ content: 'Lỗi khi tải xuống', key: 'download' });
    }
  };

  const getVisitTypeLabel = (type) => {
    const types = {
      'OUTPATIENT': 'Khám ngoại trú',
      'INPATIENT': 'Khám nội trú',
      'EMERGENCY': 'Khám cấp cứu',
      'FOLLOW_UP': 'Tái khám',
    };
    return types[type] || type;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ y tế</h1>
        <p className="text-gray-500">Lịch sử khám chữa bệnh và các ghi chép y tế</p>
      </div>

      <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={loading}>
          {records.length > 0 ? (
            <List
              dataSource={records}
              renderItem={(record) => (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={record._id}
                  className="mb-4"
                >
                  <Card className="rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0"
                          style={{ backgroundColor: '#1890ff' }}
                        >
                          <FileOutlined />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900">
                              {getVisitTypeLabel(record.visitType)}
                            </h3>
                            <Tag color="blue">{record.department}</Tag>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            BS. {record.doctorId?.personalInfo?.firstName} {record.doctorId?.personalInfo?.lastName}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {dayjs(record.visitDate).format('DD/MM/YYYY HH:mm')}
                          </p>
                          <p className="text-gray-600 text-sm mt-2">
                            <strong>Chứng trạng:</strong> {record.chiefComplaint}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="primary"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewRecord(record)}
                        >
                          Xem
                        </Button>
                        <Button
                          type="default"
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(record)}
                        >
                          Tải
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            />
          ) : (
            <Empty description="Không có hồ sơ y tế" />
          )}
        </Spin>

        {/* Record Detail Modal */}
        <Modal
          title="Chi tiết hồ sơ y tế"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          width={800}
          footer={[
            <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
              In
            </Button>,
            <Button
              key="download"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(selectedRecord)}
            >
              Tải xuống
            </Button>,
          ]}
        >
          {selectedRecord && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Loại khám">
                {getVisitTypeLabel(selectedRecord.visitType)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày khám">
                {dayjs(selectedRecord.visitDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Bác sĩ">
                BS. {selectedRecord.doctorId?.personalInfo?.firstName} {selectedRecord.doctorId?.personalInfo?.lastName} - {selectedRecord.department}
              </Descriptions.Item>
              <Descriptions.Item label="Chứng trạng">
                {selectedRecord.chiefComplaint}
              </Descriptions.Item>
              <Descriptions.Item label="Tiền sử bệnh">
                {selectedRecord.historyOfPresentIllness || 'Không có'}
              </Descriptions.Item>
              {selectedRecord.physicalExamination?.findings && (
                <Descriptions.Item label="Kết luận khám">
                  {selectedRecord.physicalExamination.findings}
                </Descriptions.Item>
              )}
              {selectedRecord.diagnosis && (
                <Descriptions.Item label="Chẩn đoán">
                  {selectedRecord.diagnosis}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>
      </motion.div>
  );
};

export default MedicalRecordsPage;
