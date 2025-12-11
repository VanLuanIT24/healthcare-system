// 💊 Prescription Create Page - Placeholder
import { FileAddOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const PrescriptionCreate = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <FileAddOutlined style={{ marginRight: 12, color: '#52C41A' }} />
            Kê đơn thuốc mới
          </h1>
          <p className="dashboard-subtitle">
            Tạo đơn thuốc cho bệnh nhân
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default PrescriptionCreate;
