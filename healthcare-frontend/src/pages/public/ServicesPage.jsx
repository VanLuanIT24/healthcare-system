// 🏥 Services Page
import {
    SafetyOutlined,
    ScheduleOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Card, Col, Row, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import './PublicPages.css';

const { Title, Paragraph } = Typography;

const ServicesPage = () => {
  const services = [
    {
      icon: '🏥',
      color: '#1890ff',
      title: 'Khám bệnh tổng quát',
      description: 'Khám sức khỏe định kỳ, tư vấn và điều trị các bệnh lý thường gặp',
      features: ['Khám nội khoa', 'Khám ngoại khoa', 'Khám sản phụ khoa', 'Khám nhi khoa'],
      price: 'Từ 200,000đ',
    },
    {
      icon: '❤️',
      color: '#eb2f96',
      title: 'Tim mạch',
      description: 'Chẩn đoán và điều trị các bệnh lý về tim mạch',
      features: ['Siêu âm tim', 'Điện tâm đồ', 'Đo Holter', 'Can thiệp tim mạch'],
      price: 'Từ 500,000đ',
    },
    {
      icon: '🧠',
      color: '#722ed1',
      title: 'Thần kinh',
      description: 'Chẩn đoán và điều trị các bệnh lý thần kinh',
      features: ['Đo điện não đồ', 'Chụp CT/MRI não', 'Điều trị đột quỵ', 'Phục hồi chức năng'],
      price: 'Từ 400,000đ',
    },
    {
      icon: '👶',
      color: '#faad14',
      title: 'Nhi khoa',
      description: 'Chăm sóc sức khỏe toàn diện cho trẻ em',
      features: ['Khám sơ sinh', 'Tiêm chủng', 'Theo dõi phát triển', 'Dinh dưỡng'],
      price: 'Từ 150,000đ',
    },
    {
      icon: '🦴',
      color: '#13c2c2',
      title: 'Chấn thương chỉnh hình',
      description: 'Điều trị các chấn thương và bệnh lý xương khớp',
      features: ['Phẫu thuật xương', 'Thay khớp', 'Nội soi khớp', 'Vật lý trị liệu'],
      price: 'Từ 300,000đ',
    },
    {
      icon: '🫀',
      color: '#fa8c16',
      title: 'Tiêu hóa',
      description: 'Chẩn đoán và điều trị bệnh lý tiêu hóa',
      features: ['Nội soi dạ dày', 'Nội soi đại tràng', 'Siêu âm gan', 'Can thiệp nội soi'],
      price: 'Từ 350,000đ',
    },
    {
      icon: '👁️',
      color: '#1890ff',
      title: 'Mắt',
      description: 'Khám và điều trị các bệnh lý về mắt',
      features: ['Khám tật khúc xạ', 'Phẫu thuật đục thủy tinh thể', 'Điều trị tăng nhãn áp', 'Laser mắt'],
      price: 'Từ 200,000đ',
    },
    {
      icon: '🦷',
      color: '#52c41a',
      title: 'Răng hàm mặt',
      description: 'Chăm sóc và điều trị răng miệng',
      features: ['Nhổ răng', 'Trám răng', 'Bọc răng sứ', 'Niềng răng'],
      price: 'Từ 100,000đ',
    },
    {
      icon: '🩺',
      color: '#eb2f96',
      title: 'Da liễu',
      description: 'Điều trị các bệnh lý về da',
      features: ['Điều trị mụn', 'Trị sẹo', 'Điều trị nấm', 'Làm đẹp da'],
      price: 'Từ 250,000đ',
    },
    {
      icon: '🔬',
      color: '#722ed1',
      title: 'Xét nghiệm',
      description: 'Xét nghiệm cận lâm sàng đầy đủ',
      features: ['Xét nghiệm máu', 'Xét nghiệm nước tiểu', 'Vi sinh', 'Hóa sinh'],
      price: 'Từ 50,000đ',
    },
    {
      icon: '📸',
      color: '#1890ff',
      title: 'Chẩn đoán hình ảnh',
      description: 'Chụp X-quang, CT, MRI, siêu âm',
      features: ['X-quang kỹ thuật số', 'CT Scanner 128 lát cắt', 'MRI 1.5T', 'Siêu âm 4D'],
      price: 'Từ 150,000đ',
    },
    {
      icon: '🚑',
      color: '#ff4d4f',
      title: 'Cấp cứu',
      description: 'Dịch vụ cấp cứu 24/7',
      features: ['Cấp cứu nội khoa', 'Cấp cứu ngoại khoa', 'Hồi sức', 'Xe cứu thương'],
      price: 'Liên hệ',
    },
  ];

  return (
    <div className="public-page services-page">
      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <Title level={1} style={{ color: 'white', textAlign: 'center' }}>
            Dịch vụ y tế
          </Title>
          <Paragraph style={{ color: 'white', textAlign: 'center', fontSize: 18 }}>
            Chúng tôi cung cấp đầy đủ các dịch vụ y tế chất lượng cao
          </Paragraph>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container">
          <Row gutter={[24, 24]}>
            {services.map((service, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <Card className="service-card" hoverable>
                  <div style={{ textAlign: 'center' }}>
                    <div className="service-icon">{service.icon}</div>
                    <Title level={4}>{service.title}</Title>
                    <Paragraph style={{ color: '#666', minHeight: 60 }}>
                      {service.description}
                    </Paragraph>

                    <div style={{ textAlign: 'left', marginTop: 16 }}>
                      <Paragraph strong>Dịch vụ bao gồm:</Paragraph>
                      <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                        {service.features.map((feature, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>
                            <small>{feature}</small>
                          </li>
                        ))}
                      </ul>
                      <Tag color={service.color} style={{ fontSize: 14 }}>
                        {service.price}
                      </Tag>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: '#f5f5f5' }}>
        <div className="container">
          <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
            Ưu điểm vượt trội
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card variant="borderless" style={{ textAlign: 'center' }}>
                <ScheduleOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                <Title level={4} style={{ marginTop: 16 }}>
                  Đặt lịch linh hoạt
                </Title>
                <Paragraph>
                  Đặt lịch online dễ dàng, chọn giờ khám phù hợp với lịch trình của bạn
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless" style={{ textAlign: 'center' }}>
                <UserOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                <Title level={4} style={{ marginTop: 16 }}>
                  Bác sĩ giỏi
                </Title>
                <Paragraph>
                  Đội ngũ bác sĩ giàu kinh nghiệm, được đào tạo bài bản tại các trường y khoa uy tín
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless" style={{ textAlign: 'center' }}>
                <SafetyOutlined style={{ fontSize: 48, color: '#722ed1' }} />
                <Title level={4} style={{ marginTop: 16 }}>
                  An toàn - Chất lượng
                </Title>
                <Paragraph>
                  Quy trình khám chữa bệnh đúng chuẩn, đảm bảo an toàn và hiệu quả cao
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <Card
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
              textAlign: 'center',
              padding: 40,
            }}
          >
            <Title level={2} style={{ color: 'white' }}>
              Cần tư vấn dịch vụ?
            </Title>
            <Paragraph style={{ color: 'white', fontSize: 18, marginBottom: 24 }}>
              Liên hệ với chúng tôi để được tư vấn chi tiết về các dịch vụ y tế
            </Paragraph>
            <Link to="/contact">
              <button className="cta-button">Liên hệ ngay</button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
