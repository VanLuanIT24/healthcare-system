// src/pages/public/Home/WhyChooseUsSection.jsx
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CustomerServiceOutlined,
    MedicineBoxOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { Col, Row } from 'antd';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <TeamOutlined />,
    title: 'Đội ngũ chuyên gia',
    description: 'Bác sĩ giàu kinh nghiệm, được đào tạo tại các trường y hàng đầu trong và ngoài nước',
    color: '#1890ff',
  },
  {
    icon: <MedicineBoxOutlined />,
    title: 'Công nghệ hiện đại',
    description: 'Trang thiết bị y tế tiên tiến, hệ thống phòng mổ đạt chuẩn quốc tế',
    color: '#52c41a',
  },
  {
    icon: <ClockCircleOutlined />,
    title: 'Phục vụ 24/7',
    description: 'Cấp cứu và chăm sóc bệnh nhân liên tục, không nghỉ lễ',
    color: '#eb2f96',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Chứng nhận quốc tế',
    description: 'Đạt chứng nhận JCI, ISO 9001:2015 về chất lượng dịch vụ y tế',
    color: '#faad14',
  },
  {
    icon: <CustomerServiceOutlined />,
    title: 'Hỗ trợ tận tâm',
    description: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ 24/7',
    color: '#722ed1',
  },
  {
    icon: <CheckCircleOutlined />,
    title: 'Bảo hiểm đa dạng',
    description: 'Liên kết với 30+ công ty bảo hiểm, thanh toán nhanh chóng',
    color: '#13c2c2',
  },
];

const WhyChooseUsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-cyan-400 font-semibold uppercase tracking-wider">
            Tại sao chọn chúng tôi
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            Lý do HealthCare là lựa chọn hàng đầu
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe tốt nhất 
            với đội ngũ chuyên gia và công nghệ tiên tiến
          </p>
        </motion.div>

        {/* Features Grid */}
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="h-full"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 h-full border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                    style={{ 
                      backgroundColor: `${feature.color}20`,
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
