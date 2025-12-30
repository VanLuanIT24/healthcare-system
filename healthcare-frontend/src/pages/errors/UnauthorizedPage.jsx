// src/pages/errors/UnauthorizedPage.jsx
import { Button, Result } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100"
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
              Bạn không có quyền truy cập vào trang này. Vui lòng kiểm tra lại tài khoản.
            </p>
          </div>
        }
        extra={[
          <Button 
            type="primary" 
            size="large" 
            className="rounded-lg"
            onClick={() => navigate('/login')}
            key="login"
          >
            Đăng nhập
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

export default UnauthorizedPage;
