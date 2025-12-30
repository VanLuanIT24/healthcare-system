// src/pages/errors/NotFoundPage.jsx
import { Button, Result } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
    >
      <Result
        status="404"
        title={<span className="text-5xl font-bold text-gray-900">404</span>}
        subTitle={
          <div>
            <p className="text-2xl font-semibold text-gray-800 mb-2">
              Không tìm thấy trang
            </p>
            <p className="text-gray-600">
              Trang bạn tìm kiếm không tồn tại hoặc đã được chuyển đi.
            </p>
          </div>
        }
        extra={[
          <Button 
            type="primary" 
            size="large" 
            className="rounded-lg"
            onClick={() => navigate('/')}
            key="home"
          >
            Quay lại trang chủ
          </Button>,
          <Button 
            size="large" 
            className="rounded-lg"
            onClick={() => navigate(-1)}
            key="back"
          >
            Quay lại
          </Button>,
        ]}
      />
    </motion.div>
  );
};

export default NotFoundPage;
