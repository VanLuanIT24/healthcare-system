// 📊 System Monitoring Page - Placeholder
import { DashboardOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const SystemMonitoring = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <DashboardOutlined style={{ marginRight: 12, color: '#1890FF' }} />
            Giám sát hệ thống
          </h1>
          <p className="dashboard-subtitle">
            Theo dõi hiệu suất và tài nguyên hệ thống
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default SystemMonitoring;
