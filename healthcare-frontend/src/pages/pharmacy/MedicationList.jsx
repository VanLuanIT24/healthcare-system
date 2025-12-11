// 💊 Medication List Page - Placeholder
import { MedicineBoxOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const MedicationList = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <MedicineBoxOutlined style={{ marginRight: 12, color: '#52C41A' }} />
            Danh sách thuốc
          </h1>
          <p className="dashboard-subtitle">
            Quản lý danh mục thuốc và vật tư y tế
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default MedicationList;
