// 👤 Patient Edit Page - Placeholder
import { EditOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const PatientEdit = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <EditOutlined style={{ marginRight: 12, color: '#1890FF' }} />
            Chỉnh sửa bệnh nhân
          </h1>
          <p className="dashboard-subtitle">
            Cập nhật thông tin bệnh nhân
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default PatientEdit;
