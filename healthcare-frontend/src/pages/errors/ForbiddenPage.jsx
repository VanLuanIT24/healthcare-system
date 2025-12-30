// src/pages/errors/ForbiddenPage.jsx
import { Button, Result } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100"
    >
      <Result
        status="403"
        title={<span className="text-5xl font-bold text-gray-900">403</span>}
        subTitle={
          <div>
            <p className="text-2xl font-semibold text-gray-800 mb-2">
              Quyền truy cập bị từ chối
            </p>
            <p className="text-gray-600">
              Bạn không có quyền truy cập vào trang này. Vui lòng kiểm tra lại tài khoản hoặc liên hệ với người quản trị.
            </p>
          </div>
        }
        extra={[
          <Button 
            type="primary" 
            size="large" 
            className="rounded-lg"
            onClick={() => navigate('/dashboard')}
            key="dashboard"
          >
            Quay lại Bảng điều khiển
          </Button>,
          <Button 
            size="large" 
            className="rounded-lg"
            onClick={() => navigate('/')}
            key="home"
          >
            Trang chủ
          </Button>,
        ]}
      />
    </motion.div>
  );
};

export default ForbiddenPage;
