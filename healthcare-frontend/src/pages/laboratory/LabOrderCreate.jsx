// 🔬 Lab Order Create Page - Placeholder
import { ExperimentOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const LabOrderCreate = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <ExperimentOutlined style={{ marginRight: 12, color: '#1890FF' }} />
            Tạo phiếu xét nghiệm
          </h1>
          <p className="dashboard-subtitle">
            Yêu cầu xét nghiệm mới cho bệnh nhân
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default LabOrderCreate;
