// 🔬 Lab Result View Page - Placeholder
import { FileSearchOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const LabResultView = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <FileSearchOutlined style={{ marginRight: 12, color: '#1890FF' }} />
            Xem kết quả xét nghiệm
          </h1>
          <p className="dashboard-subtitle">
            Chi tiết kết quả xét nghiệm
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default LabResultView;
