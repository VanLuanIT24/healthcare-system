// src/pages/public/Home/ServicesSection.jsx
import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    id: 'cardiology',
    icon: '🫀',
    title: 'Tim mạch',
    description: 'Chẩn đoán và điều trị các bệnh lý tim mạch với công nghệ hiện đại nhất',
    color: '#ff4d4f',
    bgColor: '#fff1f0',
  },
  {
    id: 'pediatrics',
    icon: '👶',
    title: 'Nhi khoa',
    description: 'Chăm sóc sức khỏe toàn diện cho trẻ em từ sơ sinh đến tuổi vị thành niên',
    color: '#1890ff',
    bgColor: '#e6f7ff',
  },
  {
    id: 'obstetrics',
    icon: '🤰',
    title: 'Sản phụ khoa',
    description: 'Theo dõi thai kỳ, sinh đẻ an toàn và chăm sóc sức khỏe phụ nữ',
    color: '#eb2f96',
    bgColor: '#fff0f6',
  },
  {
    id: 'neurology',
    icon: '🧠',
    title: 'Thần kinh',
    description: 'Khám và điều trị các bệnh lý về thần kinh, đột quỵ, đau đầu',
    color: '#722ed1',
    bgColor: '#f9f0ff',
  },
  {
    id: 'orthopedics',
    icon: '🦴',
    title: 'Chấn thương chỉnh hình',
    description: 'Điều trị các chấn thương xương khớp, phẫu thuật chỉnh hình',
    color: '#fa8c16',
    bgColor: '#fff7e6',
  },
  {
    id: 'laboratory',
    icon: '🔬',
    title: 'Xét nghiệm',
    description: 'Hệ thống xét nghiệm hiện đại, kết quả chính xác, nhanh chóng',
    color: '#13c2c2',
    bgColor: '#e6fffb',
  },
];

const ServicesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-blue-600 font-semibold uppercase tracking-wider">
            Dịch vụ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Chuyên khoa nổi bật
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Đội ngũ bác sĩ giàu kinh nghiệm cùng trang thiết bị y tế hiện đại, 
            cam kết mang đến dịch vụ chăm sóc sức khỏe tốt nhất
          </p>
        </motion.div>

        {/* Services Grid */}
        <Row gutter={[24, 24]}>
          {services.map((service, index) => (
            <Col xs={24} sm={12} lg={8} key={service.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  hoverable
                  className="h-full rounded-2xl border-0 shadow-sm hover:shadow-xl transition-all duration-300"
                  styles={{ body: { padding: '32px' } }}
                  onClick={() => navigate(`/services/${service.id}`)}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
                    style={{ backgroundColor: service.bgColor }}
                  >
                    {service.icon}
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  
                  <Button 
                    type="link" 
                    className="p-0 font-semibold"
                    style={{ color: service.color }}
                  >
                    Tìm hiểu thêm <ArrowRightOutlined />
                  </Button>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/services')}
            className="h-12 px-8 rounded-xl font-semibold"
          >
            Xem tất cả dịch vụ <ArrowRightOutlined />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
