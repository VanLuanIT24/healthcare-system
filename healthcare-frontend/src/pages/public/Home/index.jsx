// src/pages/public/Home/index.jsx
import {
    ArrowRightOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FireOutlined,
    HeartOutlined,
    MessageOutlined,
    PhoneOutlined,
    SafetyOutlined,
    TeamOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Row, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CTASection from './CTASection';
import DoctorsSection from './DoctorsSection';
import HeroSection from './HeroSection';
import NewsSection from './NewsSection';
import ServicesSection from './ServicesSection';
import StatsSection from './StatsSection';
import WhyChooseUsSection from './WhyChooseUsSection';

const HomePage = () => {
  const navigate = useNavigate();

  // Featured specialties
  const featuredSpecialties = [
    {
      id: 1,
      name: 'Tim mạch',
      icon: '🫀',
      description: 'Chẩn đoán và điều trị bệnh tim',
      doctors: 12,
      color: '#ff4d4f',
      gradient: 'from-red-500 to-red-600'
    },
    {
      id: 2,
      name: 'Nhi khoa',
      icon: '👶',
      description: 'Chăm sóc sức khỏe trẻ em',
      doctors: 15,
      color: '#faad14',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 3,
      name: 'Phẫu thuật',
      icon: '🔪',
      description: 'Phẫu thuật chuyên biệt',
      doctors: 18,
      color: '#1890ff',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 4,
      name: 'Chẩn đoán hình ảnh',
      icon: '📱',
      description: 'CT, MRI, X-quang hiện đại',
      doctors: 8,
      color: '#52c41a',
      gradient: 'from-green-500 to-green-600'
    },
  ];

  // Quick stats
  const quickStats = [
    { icon: <HeartOutlined />, value: '50,000+', label: 'Bệnh nhân hài lòng', color: '#ff4d4f' },
    { icon: <TeamOutlined />, value: '200+', label: 'Bác sĩ chuyên nghiệp', color: '#1890ff' },
    { icon: <TrophyOutlined />, value: '25+', label: 'Năm kinh nghiệm', color: '#faad14' },
    { icon: <SafetyOutlined />, value: '100%', label: 'An toàn & Vô trùng', color: '#52c41a' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Stats */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <Row gutter={[32, 32]}>
            {quickStats.map((stat, idx) => (
              <Col xs={12} md={6} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl mb-3" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Featured Specialties */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Chuyên Khoa Nổi Bật</h2>
            <p className="text-gray-600 text-lg">Các dịch vụ y tế hàng đầu của chúng tôi</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mt-4 rounded-full" />
          </motion.div>

          <Row gutter={[24, 24]}>
            {featuredSpecialties.map((specialty, idx) => (
              <Col xs={24} sm={12} lg={6} key={specialty.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="h-full"
                >
                  <Card
                    className="h-full border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                    onClick={() => navigate('/services')}
                    hoverable
                    style={{ borderTop: `4px solid ${specialty.color}` }}
                  >
                    <div className="text-5xl mb-4">{specialty.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{specialty.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{specialty.description}</p>
                    <div className="flex items-center justify-between">
                      <Tag color={specialty.color}>{specialty.doctors} Bác sĩ</Tag>
                      <ArrowRightOutlined className="text-gray-400" />
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-12">
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/services')}
              className="h-12 px-8 text-base font-semibold"
            >
              Xem Tất Cả Dịch Vụ <ArrowRightOutlined />
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Why Choose Us */}
      <WhyChooseUsSection />

      {/* Doctors Section */}
      <DoctorsSection />

      {/* Special Offers */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                <Tag color="gold" className="mb-4">
                  <FireOutlined /> Ưu Đãi Đặc Biệt
                </Tag>
                <h2 className="text-4xl font-bold mb-4">
                  Khám Bệnh Miễn Phí Cho Lần Đầu
                </h2>
                <p className="text-white/80 text-lg mb-6">
                  Khám sức khỏe toàn diện miễn phí với bác sĩ chuyên môn cao. Không tính phí cho tư vấn lần đầu.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircleOutlined className="text-2xl" />
                    <span>Khám bệnh miễn phí</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircleOutlined className="text-2xl" />
                    <span>Xét nghiệm cơ bản miễn phí</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircleOutlined className="text-2xl" />
                    <span>Tư vấn sức khỏe với chuyên gia</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircleOutlined className="text-2xl" />
                    <span>Chiết khấu 20% cho các dịch vụ tiếp theo</span>
                  </div>
                </div>
                <Button
                  size="large"
                  className="bg-white text-blue-600 border-0 h-12 px-8 text-base font-semibold hover:bg-gray-100"
                  onClick={() => navigate('/booking')}
                >
                  Đặt Lịch Ngay <ArrowRightOutlined />
                </Button>
              </motion.div>
            </Col>
            <Col xs={24} md={12}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-center"
              >
                <img
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400"
                  alt="Special Offer"
                  className="rounded-2xl shadow-2xl"
                />
              </motion.div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* News Section */}
      <NewsSection />

      {/* Contact Quick Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Cần Hỗ Trợ Ngay Bây Giờ?
          </h2>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ y: -5 }}>
                <Card className="text-center hover:shadow-lg">
                  <PhoneOutlined className="text-3xl text-blue-600 mb-3" />
                  <h4 className="font-semibold mb-2">Gọi Hotline</h4>
                  <p className="text-gray-600 text-sm">1800-XXXX (Miễn phí 24/7)</p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ y: -5 }}>
                <Card className="text-center hover:shadow-lg">
                  <MessageOutlined className="text-3xl text-green-600 mb-3" />
                  <h4 className="font-semibold mb-2">Chat Với Bác Sĩ</h4>
                  <p className="text-gray-600 text-sm">Trò chuyện ngay với chuyên gia</p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ y: -5 }}>
                <Card className="text-center hover:shadow-lg">
                  <CalendarOutlined className="text-3xl text-purple-600 mb-3" />
                  <h4 className="font-semibold mb-2">Đặt Lịch Khám</h4>
                  <p className="text-gray-600 text-sm">Đặt lịch hẹn với bác sĩ</p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ y: -5 }}>
                <Card className="text-center hover:shadow-lg">
                  <ClockCircleOutlined className="text-3xl text-orange-600 mb-3" />
                  <h4 className="font-semibold mb-2">Giờ Làm Việc</h4>
                  <p className="text-gray-600 text-sm">Thứ 2 - CN: 7:00 - 20:00</p>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
};

export default HomePage;
