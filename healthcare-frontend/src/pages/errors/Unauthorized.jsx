// 403 Unauthorized Page
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { getDashboardRoute } = useAuth();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Result
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
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

export default Unauthorized;
