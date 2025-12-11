// 📖 About Us Page
import {
    CheckCircleOutlined,
    HeartOutlined,
    SafetyOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { Card, Col, Row, Timeline, Typography } from 'antd';
import { Link } from 'react-router-dom';
import './PublicPages.css';

const { Title, Paragraph } = Typography;

const AboutPage = () => {
  const values = [
    {
      icon: <HeartOutlined style={{ fontSize: 48, color: '#eb2f96' }} />,
      title: 'Tận tâm',
      description: 'Đặt bệnh nhân lên hàng đầu, chăm sóc tận tình từng chi tiết',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      title: 'An toàn',
      description: 'Tuân thủ nghiêm ngặt các tiêu chuẩn an toàn y tế quốc tế',
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      title: 'Chất lượng',
      description: 'Cam kết chất lượng dịch vụ cao nhất với đội ngũ chuyên nghiệp',
    },
    {
      icon: <TrophyOutlined style={{ fontSize: 48, color: '#faad14' }} />,
      title: 'Uy tín',
      description: 'Xây dựng niềm tin qua nhiều năm phục vụ cộng đồng',
    },
  ];

  return (
    <div className="public-page about-page">
      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <Title level={1} style={{ color: 'white', textAlign: 'center' }}>
            Về chúng tôi
          </Title>
          <Paragraph style={{ color: 'white', textAlign: 'center', fontSize: 18 }}>
            Tìm hiểu về Healthcare System - Đối tác tin cậy cho sức khỏe của bạn
          </Paragraph>
        </div>
      </section>

      {/* Introduction */}
      <section className="section">
        <div className="container">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"
                alt="Hospital"
                style={{ width: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
            </Col>
            <Col xs={24} md={12}>
              <Title level={2}>Healthcare System</Title>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                Healthcare System là hệ thống quản lý bệnh viện hiện đại, được xây dựng với mục tiêu 
                mang đến dịch vụ chăm sóc sức khỏe tốt nhất cho cộng đồng.
              </Paragraph>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                Với đội ngũ bác sĩ giàu kinh nghiệm, trang thiết bị y tế tiên tiến và quy trình 
                khám chữa bệnh chuyên nghiệp, chúng tôi cam kết đem lại sự hài lòng cao nhất 
                cho mọi bệnh nhân.
              </Paragraph>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                Hệ thống của chúng tôi áp dụng công nghệ số hóa toàn diện, giúp bệnh nhân dễ dàng 
                đặt lịch khám, quản lý hồ sơ bệnh án và theo dõi tình trạng sức khỏe một cách tiện lợi.
              </Paragraph>
            </Col>
          </Row>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section" style={{ background: '#f5f5f5' }}>
        <div className="container">
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card className="value-card" style={{ height: '100%' }}>
                <Title level={3}>🎯 Sứ mệnh</Title>
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                  Mang đến dịch vụ chăm sóc sức khỏe chất lượng cao, dễ tiếp cận và đáng tin cậy 
                  cho mọi người dân. Chúng tôi cam kết không ngừng nâng cao chất lượng dịch vụ, 
                  đầu tư vào công nghệ và con người để phục vụ cộng đồng tốt hơn mỗi ngày.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="value-card" style={{ height: '100%' }}>
                <Title level={3}>👁️ Tầm nhìn</Title>
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                  Trở thành hệ thống y tế hàng đầu tại Việt Nam, được công nhận về chất lượng 
                  dịch vụ xuất sắc, ứng dụng công nghệ tiên tiến và sự chăm sóc tận tâm. 
                  Chúng tôi hướng tới mục tiêu nâng cao chất lượng cuộc sống cho người dân.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Core Values */}
      <section className="section">
        <div className="container">
          <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
            Giá trị cốt lõi
          </Title>
          <Row gutter={[32, 32]}>
            {values.map((value, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card className="value-card" hoverable style={{ textAlign: 'center', height: '100%' }}>
                  {value.icon}
                  <Title level={4} style={{ marginTop: 16 }}>
                    {value.title}
                  </Title>
                  <Paragraph style={{ color: '#666' }}>
                    {value.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ background: '#f5f5f5' }}>
        <div className="container">
          <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
            Hành trình phát triển
          </Title>
          <Row justify="center">
            <Col xs={24} md={16}>
              <Timeline
                mode="left"
                items={[
                  {
                    label: '2020',
                    children: 'Thành lập Healthcare System với 20 bác sĩ và 50 giường bệnh',
                  },
                  {
                    label: '2021',
                    children: 'Mở rộng quy mô, đầu tư trang thiết bị hiện đại, đạt 50 bác sĩ',
                  },
                  {
                    label: '2022',
                    children: 'Ra mắt hệ thống đặt lịch online, phục vụ 5000+ bệnh nhân',
                  },
                  {
                    label: '2023',
                    children: 'Đạt chứng nhận ISO 9001:2015, mở thêm 2 chi nhánh',
                  },
                  {
                    label: '2024',
                    children: 'Áp dụng AI và công nghệ số hóa toàn diện',
                  },
                  {
                    label: '2025',
                    children: 'Hiện tại: 87 bác sĩ, 15,000+ bệnh nhân, tỷ lệ hài lòng 98.5%',
                  },
                ]}
              />
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
              Sẵn sàng chăm sóc sức khỏe của bạn?
            </Title>
            <Paragraph style={{ color: 'white', fontSize: 18, marginBottom: 24 }}>
              Đặt lịch khám ngay hôm nay để được các bác sĩ giàu kinh nghiệm tư vấn và điều trị
            </Paragraph>
            <Link to="/login">
              <button className="cta-button">Đặt lịch ngay</button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
