// ⚙️ System Settings Page - Placeholder
import { SettingOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const SystemSettings = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <SettingOutlined style={{ marginRight: 12, color: '#1890FF' }} />
            Cài đặt hệ thống
          </h1>
          <p className="dashboard-subtitle">
            Cấu hình và tùy chỉnh hệ thống
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default SystemSettings;
