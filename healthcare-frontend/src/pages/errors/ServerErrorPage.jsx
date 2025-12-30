// src/pages/errors/ServerErrorPage.jsx
import { Button, Result } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ServerErrorPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100"
    >
      <Result
        status="500"
        title={<span className="text-5xl font-bold text-gray-900">500</span>}
        subTitle={
          <div>
            <p className="text-2xl font-semibold text-gray-800 mb-2">
              Lỗi máy chủ nội bộ
            </p>
            <p className="text-gray-600">
              Máy chủ hiện đang gặp sự cố. Vui lòng thử lại sau vài phút.
            </p>
          </div>
        }
        extra={[
          <Button 
            type="primary" 
            size="large" 
            className="rounded-lg"
            onClick={() => window.location.reload()}
            key="retry"
          >
            Thử lại
          </Button>,
          <Button 
            size="large" 
            className="rounded-lg"
            onClick={() => navigate('/')}
            key="home"
          >
            Quay lại trang chủ
          </Button>,
        ]}
      />
    </motion.div>
  );
};

export default ServerErrorPage;
