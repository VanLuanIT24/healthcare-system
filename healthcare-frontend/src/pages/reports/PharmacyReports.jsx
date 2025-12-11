// 📊 Pharmacy Reports Page - Placeholder
import { FileTextOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const PharmacyReports = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <FileTextOutlined style={{ marginRight: 12, color: '#52C41A' }} />
            Báo cáo nhà thuốc
          </h1>
          <p className="dashboard-subtitle">
            Thống kê và báo cáo sử dụng thuốc
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default PharmacyReports;
