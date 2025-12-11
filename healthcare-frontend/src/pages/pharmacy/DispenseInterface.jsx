// 💊 Dispense Interface Page - Placeholder
import { ShoppingOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const DispenseInterface = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <ShoppingOutlined style={{ marginRight: 12, color: '#52C41A' }} />
            Cấp phát thuốc
          </h1>
          <p className="dashboard-subtitle">
            Giao diện cấp phát thuốc cho bệnh nhân
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default DispenseInterface;
