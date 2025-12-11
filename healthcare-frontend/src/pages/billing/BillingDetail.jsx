// 💰 Billing Detail Page - Placeholder
import { FileTextOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const BillingDetail = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <FileTextOutlined style={{ marginRight: 12, color: '#52C41A' }} />
            Chi tiết hóa đơn
          </h1>
          <p className="dashboard-subtitle">
            Thông tin chi tiết hóa đơn thanh toán
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default BillingDetail;
