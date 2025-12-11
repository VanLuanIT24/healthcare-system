// 🏠 Landing Page - Homepage
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CustomerServiceOutlined,
    HeartOutlined,
    MedicineBoxOutlined,
    SafetyOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Divider,
    Row,
    Space,
    Statistic,
    Tag,
    Typography
} from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

const { Title, Paragraph, Text } = Typography;

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    successRate: 0,
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    loadPublicStats();
    
    // Handle navbar scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadPublicStats = async () => {
    try {
      // Mock data - có thể gọi API public stats
      setStats({
        totalPatients: 15420,
        totalDoctors: 87,
        totalAppointments: 45230,
        successRate: 98.5,
      });
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const features = [
    {
      icon: <CalendarOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      title: 'Đặt lịch khám online',
      description: 'Đặt lịch khám bệnh dễ dàng, nhanh chóng chỉ với vài thao tác đơn giản',
    },
    {
      icon: <UserOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      title: 'Bác sĩ giàu kinh nghiệm',
      description: 'Đội ngũ bác sĩ chuyên môn cao, tận tâm với nghề nghiệp',
    },
    {
      icon: <MedicineBoxOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
      title: 'Trang thiết bị hiện đại',
      description: 'Thiết bị y tế tiên tiến, đảm bảo chất lượng khám chữa bệnh',
    },
    {
      icon: <HeartOutlined style={{ fontSize: 48, color: '#eb2f96' }} />,
      title: 'Chăm sóc tận tình',
      description: 'Dịch vụ chăm sóc khách hàng 24/7, luôn đặt bệnh nhân lên hàng đầu',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 48, color: '#fa8c16' }} />,
      title: 'An toàn - Bảo mật',
      description: 'Thông tin bệnh nhân được bảo mật tuyệt đối theo tiêu chuẩn quốc tế',
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 48, color: '#13c2c2' }} />,
      title: 'Phục vụ 24/7',
      description: 'Hoạt động liên tục, sẵn sàng phục vụ mọi lúc mọi nơi',
    },
  ];

  const specialties = [
    { name: 'Tim mạch', icon: '❤️', color: '#ff4d4f' },
    { name: 'Nhi khoa', icon: '👶', color: '#fadb14' },
    { name: 'Thần kinh', icon: '🧠', color: '#722ed1' },
    { name: 'Tiêu hóa', icon: '🫀', color: '#fa8c16' },
    { name: 'Chấn thương chỉnh hình', icon: '🦴', color: '#13c2c2' },
    { name: 'Da liễu', icon: '🩺', color: '#52c41a' },
    { name: 'Mắt', icon: '👁️', color: '#1890ff' },
    { name: 'Tai mũi họng', icon: '👂', color: '#eb2f96' },
  ];

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-content">
          <div className="navbar-brand">
            <span className="brand-icon">🏥</span>
            <span className="brand-text">Healthcare System</span>
          </div>
          <div className="navbar-menu">
            <Link to="/home" className="nav-link active">Trang chủ</Link>
            <Link to="/about" className="nav-link">Về chúng tôi</Link>
            <Link to="/services" className="nav-link">Dịch vụ</Link>
            <Link to="/contact" className="nav-link">Liên hệ</Link>
            <Button 
              type="primary" 
              onClick={() => navigate('/login')}
              className="nav-login-btn"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="hero-badge">✨ Nền tảng chăm sóc sức khỏe hàng đầu</div>
            <Title level={1} className="hero-title">
              🏥 Healthcare System
            </Title>
            <Paragraph className="hero-subtitle">
              Hệ thống quản lý bệnh viện hiện đại - Đặt lịch khám, quản lý hồ sơ bệnh án, 
              và chăm sóc sức khỏe toàn diện cho bạn và gia đình
            </Paragraph>
            <Space size="large" className="hero-actions">
              <Button
                type="primary"
                size="large"
                icon={<CalendarOutlined />}
                onClick={() => navigate('/login')}
                className="hero-button primary"
              >
                Đặt lịch khám ngay
              </Button>
              <Button
                size="large"
                icon={<CustomerServiceOutlined />}
                onClick={() => navigate('/about')}
                className="hero-button secondary"
              >
                Tìm hiểu thêm
              </Button>
            </Space>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="Bệnh nhân"
                  value={stats.totalPatients}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="Bác sĩ"
                  value={stats.totalDoctors}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="Lượt khám"
                  value={stats.totalAppointments}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="Tỷ lệ hài lòng"
                  value={stats.successRate}
                  suffix="%"
                  prefix={<HeartOutlined />}
                  valueStyle={{ color: '#eb2f96' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
            Tại sao chọn chúng tôi?
          </Title>
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card className="feature-card" hoverable>
                  <div style={{ textAlign: 'center' }}>
                    {feature.icon}
                    <Title level={4} style={{ marginTop: 16 }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ color: '#666' }}>
                      {feature.description}
                    </Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="specialties-section">
        <div className="container">
          <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
            Chuyên khoa
          </Title>
          <Row gutter={[16, 16]} justify="center">
            {specialties.map((specialty, index) => (
              <Col key={index}>
                <Tag
                  className="specialty-tag"
                  style={{
                    fontSize: 16,
                    padding: '12px 24px',
                    borderRadius: 20,
                    cursor: 'pointer',
                    borderColor: specialty.color,
                    color: specialty.color,
                  }}
                >
                  <Space>
                    <span style={{ fontSize: 20 }}>{specialty.icon}</span>
                    <span>{specialty.name}</span>
                  </Space>
                </Tag>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <Title level={2} className="cta-title">
              Bắt đầu chăm sóc sức khỏe của bạn ngay hôm nay
            </Title>
            <Paragraph className="cta-subtitle">
              Đăng ký tài khoản hoặc đăng nhập để đặt lịch khám và sử dụng các dịch vụ của chúng tôi
            </Paragraph>
            <Space size="large" className="cta-buttons">
              <Button
                type="primary"
                size="large"
                icon={<CalendarOutlined />}
                onClick={() => navigate('/login')}
                className="cta-button primary"
              >
                Đăng nhập ngay
              </Button>
              <Button
                size="large"
                icon={<CustomerServiceOutlined />}
                onClick={() => navigate('/contact')}
                className="cta-button secondary"
              >
                Liên hệ tư vấn
              </Button>
            </Space>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <div className="container">
          <Divider style={{ borderColor: '#d9d9d9' }} />
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Title level={4}>Healthcare System</Title>
              <Paragraph>
                Hệ thống quản lý bệnh viện hiện đại, mang đến dịch vụ chăm sóc sức khỏe tốt nhất cho bạn.
              </Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <Title level={4}>Liên kết nhanh</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/about">Về chúng tôi</Link>
                <Link to="/services">Dịch vụ</Link>
                <Link to="/doctors">Đội ngũ bác sĩ</Link>
                <Link to="/contact">Liên hệ</Link>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Title level={4}>Liên hệ</Title>
              <Paragraph>
                📍 123 Đường ABC, Quận 1, TP.HCM<br />
                📞 Hotline: 1900-xxxx<br />
                📧 Email: support@healthcare.vn<br />
                🕐 Phục vụ 24/7
              </Paragraph>
            </Col>
          </Row>
          <Divider style={{ borderColor: '#d9d9d9' }} />
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              © 2025 Healthcare System. All rights reserved. | Developed by Võ Văn Luận
            </Text>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
 