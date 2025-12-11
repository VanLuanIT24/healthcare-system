// 📋 Medical Record Detail Page - Placeholder
import { FileTextOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const MedicalRecordDetail = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <FileTextOutlined style={{ marginRight: 12, color: '#1890FF' }} />
            Chi tiết bệnh án
          </h1>
          <p className="dashboard-subtitle">
            Thông tin chi tiết bệnh án điện tử
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default MedicalRecordDetail;
