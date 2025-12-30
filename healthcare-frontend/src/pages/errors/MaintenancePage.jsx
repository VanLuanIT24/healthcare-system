// src/pages/errors/MaintenancePage.jsx
import { ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MaintenancePage = () => {
  const navigate = useNavigate();
  const estimatedTime = '2 giờ'; // Example estimated time

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 p-4"
    >
      <Card className="w-full max-w-md rounded-2xl shadow-2xl">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <WarningOutlined className="text-6xl text-orange-500" />
          </motion.div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Đang bảo trì
          </h1>

          <p className="text-gray-600 text-lg mb-8">
            Hệ thống HealthCare đang được nâng cấp để mang lại trải nghiệm tốt hơn cho bạn.
            Vui lòng thử lại sau.
          </p>

          <Card className="bg-orange-50 border-orange-200 mb-8">
            <div className="flex items-center justify-center gap-2 text-orange-700">
              <ClockCircleOutlined className="text-xl" />
              <span className="text-lg font-semibold">
                Dự kiến hoàn thành: {estimatedTime}
              </span>
            </div>
          </Card>

          <div className="space-y-3 mb-8">
            <p className="text-gray-600">
              ✓ Dữ liệu của bạn được bảo vệ an toàn
            </p>
            <p className="text-gray-600">
              ✓ Chúng tôi sẽ thông báo khi hệ thống khôi phục
            </p>
            <p className="text-gray-600">
              ✓ Liên hệ hotline 1800-XXXX để được hỗ trợ
            </p>
          </div>

          <Button 
            type="primary" 
            size="large" 
            className="rounded-lg w-full"
            onClick={() => window.location.reload()}
          >
            Kiểm tra lại
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default MaintenancePage;
