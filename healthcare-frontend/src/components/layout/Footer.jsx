// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { Row, Col, Space, Divider, Input, Button, Tooltip, Typography } from 'antd';
import { 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined,
  FacebookFilled,
  YoutubeFilled,
  InstagramFilled,
  LinkedinFilled,
  SendOutlined,
  SafetyCertificateFilled,
  CheckCircleFilled,
  HeartFilled,
  ClockCircleFilled,
  AppstoreOutlined,
  AndroidOutlined,
  MessageOutlined,
  GlobalOutlined,
  DownloadOutlined,
  StarFilled,
  ArrowUpOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Text, Title } = Typography;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { title: 'Giới thiệu', path: '/about' },
    { title: 'Dịch vụ', path: '/services' },
    { title: 'Bác sĩ', path: '/doctors' },
    { title: 'Đặt lịch', path: '/booking' },
    { title: 'Tin tức', path: '/news' },
    { title: 'Liên hệ', path: '/contact' },
  ];

  const services = [
    { title: 'Khám tổng quát', path: '/services/general' },
    { title: 'Tim mạch', path: '/services/cardiology' },
    { title: 'Nhi khoa', path: '/services/pediatrics' },
    { title: 'Sản phụ khoa', path: '/services/obstetrics' },
    { title: 'Da liễu', path: '/services/dermatology' },
    { title: 'Xét nghiệm', path: '/services/laboratory' },
    { title: 'Nha khoa', path: '/services/dentistry' },
    { title: 'Mắt', path: '/services/ophthalmology' },
  ];

  const socialLinks = [
    { 
      icon: <FacebookFilled />, 
      href: 'https://facebook.com/healthcare', 
      color: '#1877F2',
      label: 'Facebook'
    },
    { 
      icon: <YoutubeFilled />, 
      href: 'https://youtube.com/healthcare', 
      color: '#FF0000',
      label: 'YouTube'
    },
    { 
      icon: <InstagramFilled />, 
      href: 'https://instagram.com/healthcare', 
      color: '#E4405F',
      label: 'Instagram'
    },
    { 
      icon: <LinkedinFilled />, 
      href: 'https://linkedin.com/company/healthcare', 
      color: '#0A66C2',
      label: 'LinkedIn'
    },
  ];

  const certifications = [
    { 
      name: 'JCI', 
      description: 'Tiêu chuẩn quốc tế',
      icon: <SafetyCertificateFilled className="text-green-500" />
    },
    { 
      name: 'ISO 9001:2015', 
      description: 'Hệ thống chất lượng',
      icon: <CheckCircleFilled className="text-blue-500" />
    },
    { 
      name: 'TOP 100', 
      description: 'Bệnh viện tốt nhất',
      icon: <StarFilled className="text-yellow-500" />
    },
  ];

  const FooterLogo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            <circle cx="32" cy="32" r="32" fill="url(#footer-gradient)" />
            <path
              d="M32 20C26 16 20 20 20 26C20 32 26 38 32 40C38 38 44 32 44 26C44 20 38 16 32 20Z"
              fill="white"
              fillOpacity="0.95"
            />
            <path
              d="M32 26L36 30L40 26L38 23H35V20H29V23H26L24 26L28 30L32 26Z"
              fill="#1890ff"
            />
            <rect x="31" y="20" width="2" height="12" fill="#1890ff" />
            
            {/* Hiệu ứng ánh sáng */}
            <circle cx="24" cy="24" r="4" fill="white" fillOpacity="0.2" />
            <circle cx="40" cy="24" r="4" fill="white" fillOpacity="0.2" />
            
            <defs>
              <linearGradient
                id="footer-gradient"
                x1="0"
                y1="0"
                x2="64"
                y2="64"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1890ff" />
                <stop offset="0.5" stopColor="#40a9ff" />
                <stop offset="1" stopColor="#096dd9" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 animate-pulse bg-blue-500 rounded-full blur-xl opacity-20 -z-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">HealthCare</h2>
          <p className="text-blue-200 text-sm font-medium">Bệnh viện Đa khoa Quốc tế</p>
        </div>
      </div>
      <p className="text-gray-300 mb-6 leading-relaxed text-sm">
        <HeartFilled className="text-red-400 mr-2 inline" />
        Chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao với đội ngũ chuyên gia đầu ngành 
        và hệ thống trang thiết bị hiện đại đạt chuẩn quốc tế.
      </p>
    </motion.div>
  );

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-300 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-800 rounded-full blur-3xl animate-pulse" />
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 20 0 L 0 0 0 20" fill="none" stroke="%231890ff" stroke-width="0.5" opacity="0.1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)"/%3E%3C/svg%3E')`
          }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 py-16 relative z-10">
        <Row gutter={[48, 32]}>
          {/* Company Info */}
          <Col xs={24} lg={6}>
            <FooterLogo />
            
            {/* Contact Info */}
            <div className="space-y-4 mb-8">
              <motion.div 
                className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-2xl hover:from-gray-800/70 hover:to-gray-800/50 transition-all duration-300 group cursor-pointer"
                whileHover={{ x: 5, scale: 1.02 }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <PhoneOutlined className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-sm text-blue-300 font-medium mb-1">Hotline 24/7</p>
                  <a href="tel:19001234" className="text-white text-xl font-bold hover:text-blue-400 transition-colors">
                    1900-1234
                  </a>
                  <p className="text-gray-400 text-xs mt-1">Miễn phí cuộc gọi</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-2xl hover:from-gray-800/70 hover:to-gray-800/50 transition-all duration-300 group cursor-pointer"
                whileHover={{ x: 5, scale: 1.02 }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MailOutlined className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-sm text-green-300 font-medium mb-1">Email liên hệ</p>
                  <a href="mailto:info@healthcare.vn" className="text-white hover:text-green-400 transition-colors">
                    info@healthcare.vn
                  </a>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-2xl hover:from-gray-800/70 hover:to-gray-800/50 transition-all duration-300 group cursor-pointer"
                whileHover={{ x: 5, scale: 1.02 }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <ClockCircleFilled className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-sm text-purple-300 font-medium mb-1">Giờ làm việc</p>
                  <p className="text-white">07:00 - 20:00 (T2 - CN)</p>
                  <p className="text-gray-400 text-xs mt-1">Khẩn cấp: 24/7</p>
                </div>
              </motion.div>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={12} sm={6} lg={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-white font-bold text-lg mb-6 pb-3 relative inline-block">
                <span className="relative">
                  Liên kết nhanh
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-300"></span>
                </span>
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                  >
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-all duration-300 group flex items-center"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500 mr-3 group-hover:w-3 group-hover:h-3 transition-all"></span>
                      <span className="group-hover:text-blue-400 group-hover:font-medium">
                        {link.title}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </Col>

          {/* Services */}
          <Col xs={12} sm={6} lg={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-white font-bold text-lg mb-6 pb-3 relative inline-block">
                <span className="relative">
                  Dịch vụ
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-500 to-green-300"></span>
                </span>
              </h3>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                  >
                    <Link
                      to={service.path}
                      className="text-gray-400 hover:text-white transition-all duration-300 group flex items-center"
                    >
                      <MedicineBoxOutlined className="mr-3 text-blue-400 opacity-60 group-hover:opacity-100" />
                      <span className="group-hover:text-green-400 group-hover:font-medium">
                        {service.title}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </Col>

          {/* Newsletter & Map */}
          <Col xs={24} sm={12} lg={10}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              {/* Newsletter */}
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-2xl border border-blue-800/30 backdrop-blur-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <SendOutlined className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Nhận tin tức y tế</h3>
                    <p className="text-blue-200 text-sm">
                      Đăng ký để nhận thông tin y tế hữu ích và ưu đãi đặc biệt
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nhập email của bạn" 
                    size="large"
                    className="flex-1 rounded-xl border-blue-700/50 bg-gray-900/50 backdrop-blur-sm"
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      type="primary" 
                      size="large"
                      className="rounded-xl h-auto px-6 bg-gradient-to-r from-blue-600 to-blue-500 border-none shadow-lg"
                    >
                      Đăng ký
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Map với địa chỉ Đà Nẵng */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">Vị trí của chúng tôi</h3>
                  <Tooltip title="Xem bản đồ lớn">
                    <a 
                      href="https://maps.google.com/?q=388 Núi Thành, Hải Châu, Đà Nẵng" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      <GlobalOutlined /> Xem toàn màn hình
                    </a>
                  </Tooltip>
                </div>
                
                <div className="relative rounded-2xl overflow-hidden border border-gray-800/50 shadow-2xl">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.8417342299254!2d108.21359157579325!3d16.07278438461044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421831e5c07f1b%3A0x90ebd4056c64795c!2s388%20N%C3%BAi%20Th%C3%A0nh%2C%20H%E1%BA%A3i%20Ch%C3%A2u%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng%2C%20Vietnam!5e0!3m2!1sen!2s!4v1701234567890!5m2!1sen!2s"
                    width="100%"
                    height="200"
                    style={{ border: 0, filter: 'saturate(1.2)' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="HealthCare Đà Nẵng Location"
                    className="hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                        <EnvironmentOutlined className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">388 Núi Thành</p>
                        <p className="text-gray-300 text-xs">Hải Châu, Đà Nẵng</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* App Download & Social */}
              <div className="grid grid-cols-2 gap-4">
                {/* App Download */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                  <h4 className="text-white font-semibold mb-3 text-sm">Tải ứng dụng</h4>
                  <div className="space-y-2">
                    <motion.a
                      href="#"
                      whileHover={{ y: -3 }}
                      className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                        <AppstoreOutlined className="text-2xl text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Tải trên</div>
                        <div className="text-white font-medium text-sm">App Store</div>
                      </div>
                    </motion.a>
                    <motion.a
                      href="#"
                      whileHover={{ y: -3 }}
                      className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                        <AndroidOutlined className="text-2xl text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Có trên</div>
                        <div className="text-white font-medium text-sm">Play Store</div>
                      </div>
                    </motion.a>
                  </div>
                </div>

                {/* Social & Certifications */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-3 text-sm">Mạng xã hội</h4>
                    <div className="flex gap-2">
                      {socialLinks.map((social, index) => (
                        <Tooltip key={index} title={social.label} placement="top">
                          <motion.a
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -5, scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg hover:shadow-xl transition-all"
                            style={{ 
                              backgroundColor: `${social.color}15`,
                              color: social.color,
                              border: `1px solid ${social.color}30`
                            }}
                          >
                            {social.icon}
                          </motion.a>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3 text-sm">Chứng nhận</h4>
                    <div className="flex flex-wrap gap-2">
                      {certifications.map((cert, idx) => (
                        <Tooltip key={idx} title={cert.description} placement="top">
                          <motion.div
                            whileHover={{ y: -3 }}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                          >
                            {cert.icon}
                            <span className="text-white text-xs font-medium">{cert.name}</span>
                          </motion.div>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Col>
        </Row>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800/30 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <Row justify="space-between" align="middle">
            <Col xs={24} md={12} className="text-center md:text-left mb-4 md:mb-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <p className="text-gray-500 text-sm">
                  © {currentYear} <span className="text-blue-400 font-semibold">HealthCare International Hospital</span>
                </p>
                <div className="hidden md:block text-gray-600">•</div>
                <p className="text-gray-500 text-sm">
                  Giấy phép: 123/GP-BYT • MST: 0123456789
                </p>
              </div>
            </Col>
            
            <Col xs={24} md={12} className="text-center md:text-right">
              <div className="flex flex-wrap justify-center md:justify-end gap-3">
                {['Bảo mật', 'Điều khoản', 'Sitemap', 'Liên hệ'].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                  >
                    <Link 
                      to={`/${item.toLowerCase().replace(' ', '-')}`}
                      className="text-gray-500 hover:text-blue-400 text-sm transition-colors px-2 py-1 rounded hover:bg-gray-800/30"
                    >
                      {item}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Floating Buttons */}
      <div className="fixed right-6 bottom-6 z-50 space-y-3">
        {/* Back to Top */}
        <Tooltip title="Lên đầu trang" placement="left">
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl hover:shadow-2xl flex items-center justify-center text-white text-lg"
            whileHover={{ y: -5, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <ArrowUpOutlined />
          </motion.button>
        </Tooltip>

        {/* Chat Button */}
        <Tooltip title="Chat với chúng tôi" placement="left">
          <motion.button
            className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-xl hover:shadow-2xl flex items-center justify-center text-white text-lg"
            whileHover={{ y: -5, scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <MessageOutlined />
          </motion.button>
        </Tooltip>

        {/* Emergency Button */}
        <Tooltip title="Khẩn cấp" placement="left">
          <motion.button
            onClick={() => window.location.href = 'tel:19001234'}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-xl hover:shadow-2xl flex items-center justify-center text-white text-lg animate-pulse"
            whileHover={{ y: -5, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
          >
            <PhoneOutlined />
          </motion.button>
        </Tooltip>
      </div>
    </footer>
  );
};

export default Footer;