// 404 Not Found Page
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { getDashboardRoute } = useAuth();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn tìm kiếm không tồn tại."
        extra={[
          <Button type="primary" key="home" onClick={() => navigate(getDashboardRoute())}>
            Về trang chủ
          </Button>,
          <Button key="back" onClick={() => navigate(-1)}>
            Quay lại
          </Button>,
        ]}
      />
    </div>
  );
};

export default NotFound;
