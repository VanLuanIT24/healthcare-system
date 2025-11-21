import React from 'react';
import { Button, Row, Col, Card, Space, Statistic, Carousel } from 'antd';
import { 
  UserOutlined, 
  SafetyOutlined, 
  TeamOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <SafetyOutlined style={{ fontSize: '48px', color: '#0099cc' }} />,
      title: 'Bảo Mật Cao',
      description: 'Dữ liệu bệnh nhân được mã hóa và bảo vệ tối đa'
    },
    {
      icon: <TeamOutlined style={{ fontSize: '48px', color: '#0077aa' }} />,
      title: 'Quản Lý Đội Ngũ',
      description: 'Hỗ trợ nhiều vai trò: Bác sĩ, Bệnh nhân, Admin'
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: '48px', color: '#0099cc' }} />,
      title: 'Quản Lý Hồ Sơ',
      description: 'Quản lý hồ sơ bệnh nhân, lịch hẹn, đơn thuốc'
    },
    {
      icon: <RiseOutlined style={{ fontSize: '48px', color: '#06b6d4' }} />,
      title: 'Phân Tích Dữ Liệu',
      description: 'Thống kê và báo cáo chi tiết cho quản lý'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Nguyễn Văn A',
      role: 'Bác sĩ Tim Mạch',
      content: 'Hệ thống rất hiệu quả, giúp tôi quản lý bệnh nhân dễ dàng hơn.'
    },
    {
      name: 'Ms. Trần Thị B',
      role: 'Bệnh nhân',
      content: 'Giao diện thân thiện, dễ sử dụng để theo dõi sức khỏe của mình.'
    },
    {
      name: 'Mr. Lê Văn C',
      role: 'Quản Lý Bệnh Viện',
      content: 'Công cụ quản lý tuyệt vời cho bệnh viện của chúng tôi.'
    }
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      {/* ===== HEADER NAVIGATION ===== */}
      <div 
        style={{
          background: 'linear-gradient(90deg, #ffffff 0%, #f8fdfb 100%)',
          padding: '12px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 153, 204, 0.05)',
          borderBottom: '1px solid #e0f2fe'
        }}
      >
        <Logo size="medium" showText={true} />
        <Space size="large">
          <Button 
            type="default"
            size="large"
            onClick={() => navigate('/superadmin/login')}
            style={{
              borderColor: '#0099cc',
              color: '#0099cc'
            }}
          >
            Đăng Nhập
          </Button>
          <Button 
            type="primary"
            size="large"
            onClick={() => navigate('/superadmin/register')}
            style={{
              background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 153, 204, 0.3)'
            }}
          >
            Đăng Ký
          </Button>
        </Space>
      </div>

      {/* ===== HERO SECTION ===== */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f8fdfb 0%, #f5f8ff 50%, #f8fdfb 100%)',
          padding: '80px 40px',
          textAlign: 'center'
        }}
      >
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '800', 
          color: '#0099cc',
          marginBottom: '20px'
        }}>
          Nền Tảng Quản Lý Y Tế Hiện Đại
        </h1>
        <p style={{ 
          fontSize: '20px', 
          color: '#0077aa',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          Quản lý bệnh nhân, lịch hẹn, hóa đơn và hồ sơ y tế một cách dễ dàng và an toàn
        </p>
        <Space size="large">
          <Button 
            type="primary"
            size="large"
            onClick={() => navigate('/superadmin/login')}
            style={{
              background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
              border: 'none',
              height: '48px',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(0, 153, 204, 0.3)'
            }}
          >
            Bắt Đầu Ngay <ArrowRightOutlined />
          </Button>
          <Button 
            size="large"
            style={{
              height: '48px',
              fontSize: '16px',
              borderColor: '#0099cc',
              color: '#0099cc'
            }}
          >
            Tìm Hiểu Thêm
          </Button>
        </Space>

        {/* Stats */}
        <Row gutter={[32, 32]} style={{ marginTop: '60px', maxWidth: '1000px', margin: '60px auto 0' }}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ border: '1px solid #a5f3fc', background: '#ffffff' }}>
              <Statistic
                title="Bệnh Nhân"
                value={5000}
                suffix="+"
                valueStyle={{ color: '#0099cc', fontSize: '32px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ border: '1px solid #a5f3fc', background: '#ffffff' }}>
              <Statistic
                title="Bác Sĩ"
                value={150}
                suffix="+"
                valueStyle={{ color: '#0077aa', fontSize: '32px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ border: '1px solid #a5f3fc', background: '#ffffff' }}>
              <Statistic
                title="Bệnh Viện"
                value={25}
                suffix="+"
                valueStyle={{ color: '#0099cc', fontSize: '32px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ border: '1px solid #a5f3fc', background: '#ffffff' }}>
              <Statistic
                title="Lịch Hẹn"
                value={10000}
                suffix="+"
                valueStyle={{ color: '#0077aa', fontSize: '32px' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* ===== FEATURES SECTION ===== */}
      <div style={{ padding: '80px 40px', background: '#ffffff' }}>
        <h2 style={{ 
          fontSize: '40px', 
          fontWeight: '800', 
          color: '#0099cc',
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          Tính Năng Chính
        </h2>
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card 
                style={{
                  border: '1px solid #a5f3fc',
                  borderRadius: '12px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 153, 204, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 153, 204, 0.08)';
                }}
              >
                <div style={{ marginBottom: '20px' }}>
                  {feature.icon}
                </div>
                <h3 style={{ color: '#0099cc', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  {feature.description}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <div style={{ 
        padding: '80px 40px', 
        background: 'linear-gradient(135deg, #f8fdfb 0%, #f5f8ff 100%)'
      }}>
        <h2 style={{ 
          fontSize: '40px', 
          fontWeight: '800', 
          color: '#0099cc',
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          Đánh Giá Từ Người Dùng
        </h2>
        <Row gutter={[32, 32]}>
          {testimonials.map((testimonial, index) => (
            <Col xs={24} md={8} key={index}>
              <Card
                style={{
                  border: '2px solid #0099cc',
                  borderRadius: '12px',
                  background: '#ffffff'
                }}
              >
                <p style={{ fontSize: '16px', color: '#1e3a8a', marginBottom: '20px', fontStyle: 'italic' }}>
                  "{testimonial.content}"
                </p>
                <div style={{ borderTop: '2px solid #a5f3fc', paddingTop: '16px' }}>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#0099cc',
                    margin: '0 0 4px 0'
                  }}>
                    {testimonial.name}
                  </p>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#0077aa',
                    margin: 0
                  }}>
                    {testimonial.role}
                  </p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== CTA SECTION ===== */}
      <div style={{
        padding: '80px 40px',
        background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: '40px', 
          fontWeight: '800', 
          color: '#ffffff',
          marginBottom: '20px'
        }}>
          Bắt Đầu Quản Lý Y Tế Hiệu Quả Ngay Hôm Nay
        </h2>
        <p style={{ 
          fontSize: '18px', 
          color: '#e0f2fe',
          marginBottom: '40px'
        }}>
          Tham gia hàng nghìn bệnh viện đang sử dụng Healthcare System
        </p>
        <Space size="large">
          <Button 
            size="large"
            style={{
              background: '#ffffff',
              color: '#0099cc',
              border: 'none',
              height: '48px',
              fontSize: '16px',
              fontWeight: '600'
            }}
            onClick={() => navigate('/superadmin/register')}
          >
            Đăng Ký Miễn Phí
          </Button>
          <Button 
            size="large"
            style={{
              background: 'transparent',
              color: '#ffffff',
              border: '2px solid #ffffff',
              height: '48px',
              fontSize: '16px'
            }}
          >
            Liên Hệ Sales
          </Button>
        </Space>
      </div>

      {/* ===== FOOTER ===== */}
      <div style={{
        padding: '40px',
        background: '#1e3a8a',
        color: '#e0f2fe',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '8px' }}>
          © 2025 Healthcare System. Tất cả quyền được bảo lưu.
        </p>
        <Space split="|" style={{ color: '#e0f2fe' }}>
          <a href="#" style={{ color: '#e0f2fe' }}>Điều Khoản</a>
          <a href="#" style={{ color: '#e0f2fe' }}>Chính Sách</a>
          <a href="#" style={{ color: '#e0f2fe' }}>Liên Hệ</a>
        </Space>
      </div>
    </div>
  );
};

export default HomePage;
