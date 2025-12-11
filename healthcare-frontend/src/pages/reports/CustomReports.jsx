// 📊 Custom Reports Page - Placeholder
import { FileTextOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const CustomReports = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <FileTextOutlined style={{ marginRight: 12, color: '#1890FF' }} />
            Báo cáo tùy chỉnh
          </h1>
          <p className="dashboard-subtitle">
            Tạo và quản lý báo cáo tùy chỉnh
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default CustomReports;
