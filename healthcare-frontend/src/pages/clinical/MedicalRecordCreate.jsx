// 📋 Medical Record Create Page - Placeholder
import { FileAddOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const MedicalRecordCreate = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <FileAddOutlined style={{ marginRight: 12, color: '#1890FF' }} />
            Tạo bệnh án mới
          </h1>
          <p className="dashboard-subtitle">
            Lập bệnh án điện tử cho bệnh nhân
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default MedicalRecordCreate;
