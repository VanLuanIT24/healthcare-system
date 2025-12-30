// src/pages/patient/LabResultsPage.jsx
import { DownloadOutlined, EyeOutlined, FileOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Empty, List, Modal, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';

const LabResultsPage = () => {
  const [selectedResult, setSelectedResult] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const labResults = [
    {
      id: 1,
      testName: 'Xét nghiệm máu',
      date: '20/12/2024',
      status: 'ready',
      resultDate: '22/12/2024',
      values: {
        'WBC': '4.5-10 x 10^9/L',
        'RBC': '4.5-5.9 x 10^12/L',
        'Hemoglobin': '130-180 g/L',
      },
    },
    {
      id: 2,
      testName: 'Chụp X-quang',
      date: '18/12/2024',
      status: 'ready',
      resultDate: '20/12/2024',
      description: 'Kết quả bình thường',
    },
    {
      id: 3,
      testName: 'Siêu âm',
      date: '15/12/2024',
      status: 'ready',
      resultDate: '17/12/2024',
      description: 'Không phát hiện bất thường',
    },
  ];

  const getStatusTag = (status) => {
    const config = {
      ready: { color: 'success', text: 'Sẵn sàng' },
      pending: { color: 'processing', text: 'Đang chờ' },
      processing: { color: 'warning', text: 'Đang xử lý' },
    };
    const { color, text } = config[status] || config.pending;
    return <Tag color={color}>{text}</Tag>;
  };

  const handleViewResult = (result) => {
    setSelectedResult(result);
    setIsModalVisible(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kết quả xét nghiệm</h1>
          <p className="text-gray-500">Xem kết quả các xét nghiệm và chẩn đoán hình ảnh</p>
        </div>

        {labResults.length > 0 ? (
          <List
            dataSource={labResults}
            renderItem={(result) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={result.id}
                className="mb-4"
              >
                <Card className="rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0"
                        style={{ backgroundColor: '#52c41a' }}
                      >
                        <FileOutlined />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">{result.testName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <span>Ngày xét: {result.date}</span>
                          <span>Kết quả: {result.resultDate}</span>
                        </div>
                        {getStatusTag(result.status)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewResult(result)}
                      >
                        Xem
                      </Button>
                      <Button
                        type="default"
                        size="small"
                        icon={<DownloadOutlined />}
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
          <Empty description="Không có kết quả xét nghiệm" />
        )}

        {/* Result Detail Modal */}
        <Modal
          title="Chi tiết kết quả xét nghiệm"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          width={700}
          footer={[
            <Button key="download" type="primary" icon={<DownloadOutlined />}>
              Tải xuống
            </Button>,
          ]}
        >
          {selectedResult && (
            <div className="space-y-4">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Loại xét nghiệm">
                  {selectedResult.testName}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày xét">
                  {selectedResult.date}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày nhận kết quả">
                  {selectedResult.resultDate}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {getStatusTag(selectedResult.status)}
                </Descriptions.Item>
              </Descriptions>

              {selectedResult.values && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Giá trị xét nghiệm</h3>
                  <table className="w-full border-collapse">
                    <tbody>
                      {Object.entries(selectedResult.values).map(([key, value]) => (
                        <tr key={key} className="border-b">
                          <td className="py-2 px-3 text-gray-700">{key}</td>
                          <td className="py-2 px-3 text-right font-semibold">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedResult.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Kết luận</h3>
                  <p className="text-gray-700">{selectedResult.description}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
    </motion.div>
  );
};

export default LabResultsPage;
