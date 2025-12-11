// 🔐 Role Management Page - Placeholder
import { SafetyOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const RoleManagement = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <SafetyOutlined style={{ marginRight: 12, color: '#1890FF' }} />
            Quản lý vai trò
          </h1>
          <p className="dashboard-subtitle">
            Quản lý vai trò và phân quyền người dùng
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default RoleManagement;
