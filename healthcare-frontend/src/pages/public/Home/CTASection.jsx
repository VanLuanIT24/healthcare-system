// src/pages/public/Home/CTASection.jsx
import { CalendarOutlined, PhoneOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12 lg:p-16 text-center relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center"
            >
              <PhoneOutlined className="text-4xl text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Bạn cần tư vấn?
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Đội ngũ tư vấn viên của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. 
              Gọi ngay hoặc đặt lịch hẹn trực tuyến!
            </p>

            {/* Hotline */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <a 
                href="tel:1800xxxx"
                className="text-4xl md:text-5xl font-bold text-white hover:text-cyan-300 transition-colors"
              >
                1800-XXXX
              </a>
              <p className="text-blue-200 mt-2">Miễn phí cuộc gọi</p>
            </motion.div>

            {/* Buttons */}
            <Space size="large" wrap className="justify-center">
              <Button
                type="primary"
                size="large"
                icon={<CalendarOutlined />}
                onClick={() => navigate('/booking')}
                className="h-14 px-10 rounded-xl font-semibold text-lg bg-white text-blue-600 hover:bg-gray-100 border-none"
              >
                Đặt lịch trực tuyến
              </Button>
              <Button
                size="large"
                icon={<PhoneOutlined />}
                onClick={() => window.location.href = 'tel:1800xxxx'}
                className="h-14 px-10 rounded-xl font-semibold text-lg bg-transparent text-white border-2 border-white hover:bg-white/10"
              >
                Gọi ngay
              </Button>
            </Space>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <div className="flex flex-wrap justify-center gap-6 text-blue-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Hỗ trợ 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span>Tư vấn miễn phí</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span>Đặt lịch nhanh chóng</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
