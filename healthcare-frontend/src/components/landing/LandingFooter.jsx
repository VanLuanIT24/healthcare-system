import {
    EnvironmentOutlined,
    FacebookOutlined,
    HeartFilled,
    LinkedinOutlined,
    MailOutlined,
    PhoneOutlined,
    TwitterOutlined,
    YoutubeOutlined
} from "@ant-design/icons";
import { Button, Col, Divider, Input, Layout, Row, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const LandingFooter = () => {
  const navigate = useNavigate();

  return (
    <Footer
      style={{
        background: "linear-gradient(135deg, #0F5B8C 0%, #1890ff 100%)",
        color: "white",
        padding: "60px 50px 30px"
      }}
    >
      <Row gutter={[32, 32]}>
        {/* Column 1: Contact Information */}
        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ color: "white", marginBottom: 20 }}>
            <HeartFilled style={{ marginRight: 8 }} />
            MediCare System
          </Title>
          <Space direction="vertical" size="middle">
            <div>
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                123 Đường ABC, Quận XYZ, TP.HCM
              </Text>
            </div>
            <div>
              <PhoneOutlined style={{ marginRight: 8 }} />
              <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                Hotline: 1900-xxxx
              </Text>
            </div>
            <div>
              <MailOutlined style={{ marginRight: 8 }} />
              <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                Email: support@medicare.vn
              </Text>
            </div>
          </Space>
        </Col>

        {/* Column 2: Quick Links */}
        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ color: "white", marginBottom: 20 }}>
            Liên kết nhanh
          </Title>
          <Space direction="vertical" size="small">
            <a onClick={() => navigate("/about")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
              Giới thiệu
            </a>
            <a onClick={() => navigate("/services")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
              Dịch vụ
            </a>
            <a onClick={() => navigate("/news")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
              Tin tức
            </a>
            <a onClick={() => navigate("/careers")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
              Tuyển dụng
            </a>
            <a onClick={() => navigate("/contact")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
              Liên hệ
            </a>
          </Space>
        </Col>

        {/* Column 3: Policies */}
        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ color: "white", marginBottom: 20 }}>
            Chính sách
          </Title>
          <Space direction="vertical" size="small">
            <a onClick={() => navigate("/privacy-policy")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
              Chính sách bảo mật
            </a>
            <a onClick={() => navigate("/terms-of-service")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
              Điều khoản sử dụng
            </a>
            <a onClick={() => navigate("/user-guide")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
              Hướng dẫn sử dụng
            </a>
            <a onClick={() => navigate("/payment-policy")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
              Quy định thanh toán
            </a>
            <a onClick={() => navigate("/faq")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
              Câu hỏi thường gặp
            </a>
          </Space>
        </Col>

        {/* Column 4: Newsletter */}
        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ color: "white", marginBottom: 20 }}>
            Đăng ký nhận tin
          </Title>
          <Paragraph style={{ color: "rgba(255,255,255,0.85)", marginBottom: 16 }}>
            Nhận thông tin khuyến mãi và bài viết sức khỏe mỗi tuần
          </Paragraph>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Email của bạn"
              style={{ borderRadius: "4px 0 0 4px" }}
            />
            <Button
              type="primary"
              style={{
                background: "#52c41a",
                borderColor: "#52c41a",
                borderRadius: "0 4px 4px 0"
              }}
            >
              Đăng ký
            </Button>
          </Space.Compact>

          <div style={{ marginTop: 24 }}>
            <Text style={{ color: "rgba(255,255,255,0.85)", display: "block", marginBottom: 12 }}>
              Theo dõi chúng tôi
            </Text>
            <Space size="middle">
              <FacebookOutlined style={{ fontSize: 24, cursor: "pointer" }} />
              <TwitterOutlined style={{ fontSize: 24, cursor: "pointer" }} />
              <LinkedinOutlined style={{ fontSize: 24, cursor: "pointer" }} />
              <YoutubeOutlined style={{ fontSize: 24, cursor: "pointer" }} />
            </Space>
          </div>
        </Col>
      </Row>

      <Divider style={{ borderColor: "rgba(255,255,255,0.2)", margin: "40px 0 20px" }} />

      <Row justify="space-between" align="middle">
        <Col xs={24} md={12} style={{ textAlign: "center", marginBottom: 10 }}>
          <Text style={{ color: "rgba(255,255,255,0.85)" }}>
            © 2024 MediCare System. All rights reserved.
          </Text>
        </Col>
        <Col xs={24} md={12} style={{ textAlign: "center" }}>
          <Space split={<Divider type="vertical" style={{ borderColor: "rgba(255,255,255,0.3)" }} />}>
            <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
              Đối tác: Bệnh viện ABC
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
              Công ty XYZ
            </Text>
          </Space>
        </Col>
      </Row>
    </Footer>
  );
};

export default LandingFooter;
