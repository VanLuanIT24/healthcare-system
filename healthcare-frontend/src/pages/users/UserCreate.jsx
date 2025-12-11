// 👤 User Create Page - Placeholder
import { UserAddOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const UserCreate = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <UserAddOutlined style={{ marginRight: 12, color: '#1890FF' }} />
            Tạo người dùng mới
          </h1>
          <p className="dashboard-subtitle">
            Thêm người dùng mới vào hệ thống
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default UserCreate;
