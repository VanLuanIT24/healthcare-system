import {
    CheckCircleOutlined,
    DownOutlined,
    HeartFilled,
    MailOutlined,
    PhoneOutlined,
    SafetyOutlined,
    TeamOutlined,
    TrophyOutlined
} from "@ant-design/icons";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Dropdown,
    Layout,
    Menu,
    Row,
    Space,
    Timeline,
    Tooltip,
    Typography
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getRoleDisplayName } from "../../utils/roleUtils";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const AboutPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate("/profile")}>
        Hồ sơ cá nhân
      </Menu.Item>
      <Menu.Item key="dashboard" onClick={() => navigate("/dashboard")}>
        Dashboard
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" danger onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const aboutMenu = (
    <Menu>
      <Menu.Item key="vision" onClick={() => document.getElementById('vision').scrollIntoView({ behavior: 'smooth' })}>
        Tầm nhìn & Sứ mệnh
      </Menu.Item>
      <Menu.Item key="facility" onClick={() => document.getElementById('facility').scrollIntoView({ behavior: 'smooth' })}>
        Cơ sở vật chất
      </Menu.Item>
      <Menu.Item key="history" onClick={() => document.getElementById('history').scrollIntoView({ behavior: 'smooth' })}>
        Lịch sử phát triển
      </Menu.Item>
    </Menu>
  );

  const servicesMenu = (
    <Menu style={{ width: 500 }}>
      <Row gutter={16} style={{ padding: 16 }}>
        <Col span={12}>
          <Menu.ItemGroup title="Chuyên khoa">
            <Menu.Item key="noi-khoa">Nội khoa</Menu.Item>
            <Menu.Item key="ngoai-khoa">Ngoại khoa</Menu.Item>
            <Menu.Item key="san-phu-khoa">Sản - Phụ khoa</Menu.Item>
            <Menu.Item key="nhi-khoa">Nhi khoa</Menu.Item>
          </Menu.ItemGroup>
        </Col>
        <Col span={12}>
          <Menu.ItemGroup title="Dịch vụ đặc biệt">
            <Menu.Item key="tong-quat">Khám sức khỏe tổng quát</Menu.Item>
            <Menu.Item key="cap-cuu">Cấp cứu 24/7</Menu.Item>
          </Menu.ItemGroup>
        </Col>
      </Row>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Header */}
      <Header 
        style={{ 
          background: "linear-gradient(135deg, #0F5B8C 0%, #1890ff 100%)", 
          padding: "0 50px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          height: 64
        }}
      >
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          height: 64 
        }}>
          <div 
            style={{ display: "flex", alignItems: "center", color: "white", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <HeartFilled style={{ fontSize: 32, marginRight: 12 }} />
            <Title level={3} style={{ color: "white", margin: 0, fontSize: 22 }}>
              MediCare System
            </Title>
          </div>

          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Space size="large">
              <Dropdown overlay={aboutMenu} trigger={["hover"]}>
                <a style={{ color: "white", fontSize: 15 }}>
                  Giới thiệu <DownOutlined style={{ fontSize: 10 }} />
                </a>
              </Dropdown>
              <Dropdown overlay={servicesMenu} trigger={["hover"]}>
                <a style={{ color: "white", fontSize: 15 }}>
                  Dịch vụ <DownOutlined style={{ fontSize: 10 }} />
                </a>
              </Dropdown>
              <Badge count={3} offset={[5, 0]}>
                <a style={{ color: "white", fontSize: 15 }} onClick={() => navigate("/news")}>
                  Tin tức & Sự kiện
                </a>
              </Badge>
              <Tooltip title={
                <div>
                  <div><PhoneOutlined /> Hotline: 1900-xxxx</div>
                  <div><MailOutlined /> Email: support@medicare.vn</div>
                </div>
              }>
                <a style={{ color: "white", fontSize: 15 }} onClick={() => navigate("/contact")}>
                  Liên hệ
                </a>
              </Tooltip>
            </Space>
          </div>

          <Space size="middle">
            {isAuthenticated ? (
              <Dropdown overlay={userMenu} trigger={["click"]}>
                <div style={{ display: "flex", alignItems: "center", cursor: "pointer", color: "white" }}>
                  <Avatar size={40} style={{ backgroundColor: "#52c41a", marginRight: 8 }}>
                    {user?.fullName?.[0] || "U"}
                  </Avatar>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      {user?.fullName || user?.email}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.85 }}>
                      {getRoleDisplayName(user?.role)}
                    </div>
                  </div>
                  <DownOutlined style={{ marginLeft: 8, fontSize: 10 }} />
                </div>
              </Dropdown>
            ) : (
              <>
                <Button 
                  type="default"
                  ghost
                  onClick={() => navigate("/login")}
                  style={{ color: "white", borderColor: "white", fontWeight: 500 }}
                >
                  Đăng nhập
                </Button>
                <Button 
                  type="primary"
                  style={{ background: "white", color: "#1890ff", borderColor: "white", fontWeight: 500 }}
                  onClick={() => navigate("/register")}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </Space>
        </div>
      </Header>

      <Content>
        {/* Hero Section */}
        <div 
          style={{ 
            background: "linear-gradient(135deg, rgba(15,91,140,0.9) 0%, rgba(24,144,255,0.85) 100%), url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            padding: "100px 50px",
            textAlign: "center",
            color: "white"
          }}
        >
          <Title 
            level={1} 
            style={{ 
              color: "white", 
              marginBottom: 24, 
              fontSize: "3rem",
              fontWeight: 700,
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
            }}
          >
            Về Chúng Tôi
          </Title>
          <Paragraph 
            style={{ 
              fontSize: 20, 
              color: "white", 
              maxWidth: 800, 
              margin: "0 auto", 
              lineHeight: 1.8,
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
            }}
          >
            Chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao, 
            với đội ngũ chuyên gia giàu kinh nghiệm và trang thiết bị hiện đại.
          </Paragraph>
        </div>

        {/* Vision & Mission Section */}
        <div id="vision" style={{ padding: "80px 50px", background: "#fff" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <Title level={2} style={{ color: "#0F5B8C", marginBottom: 16 }}>
              Tầm Nhìn & Sứ Mệnh
            </Title>
            <Paragraph style={{ fontSize: 16, color: "#666", maxWidth: 700, margin: "0 auto" }}>
              Hướng tới tương lai y tế hiện đại và nhân văn
            </Paragraph>
          </div>

          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={12}>
              <Card 
                variant="borderless"
                style={{ 
                  height: "100%",
                  borderRadius: 10,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <TrophyOutlined style={{ fontSize: 60, color: "#1890ff", marginBottom: 16 }} />
                  <Title level={3} style={{ color: "#0F5B8C" }}>Tầm Nhìn</Title>
                </div>
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: "#666" }}>
                  Trở thành hệ thống y tế hàng đầu Việt Nam, được tin cậy bởi chất lượng 
                  dịch vụ xuất sắc, công nghệ tiên tiến và đội ngũ y bác sĩ chuyên nghiệp. 
                  Chúng tôi hướng tới mục tiêu mang lại sức khỏe và hạnh phúc cho hàng triệu 
                  người dân Việt Nam.
                </Paragraph>
                <ul style={{ fontSize: 15, color: "#666", lineHeight: 2 }}>
                  <li>Đầu tư công nghệ y tế hiện đại nhất</li>
                  <li>Phát triển đội ngũ y bác sĩ chất lượng cao</li>
                  <li>Mở rộng mạng lưới phủ sóng toàn quốc</li>
                  <li>Hợp tác quốc tế với các bệnh viện hàng đầu</li>
                </ul>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card 
                variant="borderless"
                style={{ 
                  height: "100%",
                  borderRadius: 10,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <HeartFilled style={{ fontSize: 60, color: "#52c41a", marginBottom: 16 }} />
                  <Title level={3} style={{ color: "#0F5B8C" }}>Sứ Mệnh</Title>
                </div>
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: "#666" }}>
                  Cung cấp dịch vụ chăm sóc sức khỏe toàn diện, chất lượng cao với chi phí 
                  hợp lý. Chúng tôi cam kết đặt lợi ích của bệnh nhân lên hàng đầu, với 
                  phương châm "Tận tâm - Chuyên nghiệp - Hiệu quả".
                </Paragraph>
                <ul style={{ fontSize: 15, color: "#666", lineHeight: 2 }}>
                  <li>Chăm sóc bệnh nhân với sự tận tâm và trách nhiệm</li>
                  <li>Cung cấp dịch vụ y tế chất lượng cao</li>
                  <li>Ứng dụng công nghệ vào điều trị hiện đại</li>
                  <li>Đào tạo và phát triển nguồn nhân lực y tế</li>
                </ul>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Core Values */}
        <div style={{ padding: "80px 50px", background: "#f5f5f5" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <Title level={2} style={{ color: "#0F5B8C", marginBottom: 16 }}>
              Giá Trị Cốt Lõi
            </Title>
            <Paragraph style={{ fontSize: 16, color: "#666", maxWidth: 700, margin: "0 auto" }}>
              Những giá trị định hình văn hóa và dịch vụ của chúng tôi
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Card variant="borderless" style={{ textAlign: "center", height: "100%", borderRadius: 10 }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }} />
                <Title level={4}>Chất lượng</Title>
                <Paragraph style={{ color: "#666" }}>
                  Cam kết chất lượng dịch vụ y tế đạt chuẩn quốc tế
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card variant="borderless" style={{ textAlign: "center", height: "100%", borderRadius: 10 }}>
                <HeartFilled style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }} />
                <Title level={4}>Tận tâm</Title>
                <Paragraph style={{ color: "#666" }}>
                  Chăm sóc bệnh nhân với tất cả sự tận tâm và yêu thương
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card variant="borderless" style={{ textAlign: "center", height: "100%", borderRadius: 10 }}>
                <SafetyOutlined style={{ fontSize: 48, color: "#fa8c16", marginBottom: 16 }} />
                <Title level={4}>An toàn</Title>
                <Paragraph style={{ color: "#666" }}>
                  Đảm bảo an toàn tuyệt đối cho bệnh nhân và thông tin
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card variant="borderless" style={{ textAlign: "center", height: "100%", borderRadius: 10 }}>
                <TeamOutlined style={{ fontSize: 48, color: "#eb2f96", marginBottom: 16 }} />
                <Title level={4}>Đồng hành</Title>
                <Paragraph style={{ color: "#666" }}>
                  Đồng hành cùng bệnh nhân trên hành trình chữa lành
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Facility Section */}
        <div id="facility" style={{ padding: "80px 50px", background: "#fff" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <Title level={2} style={{ color: "#0F5B8C", marginBottom: 16 }}>
              Cơ Sở Vật Chất
            </Title>
            <Paragraph style={{ fontSize: 16, color: "#666", maxWidth: 700, margin: "0 auto" }}>
              Trang thiết bị hiện đại, đạt chuẩn quốc tế
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: 250, 
                    background: "linear-gradient(135deg, #1890ff 0%, #0F5B8C 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Title level={1} style={{ color: "white", margin: 0 }}>🏥</Title>
                  </div>
                }
                style={{ borderRadius: 10, overflow: "hidden" }}
              >
                <Title level={4}>Phòng khám hiện đại</Title>
                <Paragraph style={{ color: "#666" }}>
                  20+ phòng khám chuyên khoa được trang bị đầy đủ thiết bị y tế tiên tiến, 
                  đảm bảo khám chữa bệnh hiệu quả.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: 250, 
                    background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Title level={1} style={{ color: "white", margin: 0 }}>🔬</Title>
                  </div>
                }
                style={{ borderRadius: 10, overflow: "hidden" }}
              >
                <Title level={4}>Phòng xét nghiệm</Title>
                <Paragraph style={{ color: "#666" }}>
                  Hệ thống phòng xét nghiệm với máy móc hiện đại, cho kết quả nhanh chóng 
                  và chính xác cao.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: 250, 
                    background: "linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Title level={1} style={{ color: "white", margin: 0 }}>🚑</Title>
                  </div>
                }
                style={{ borderRadius: 10, overflow: "hidden" }}
              >
                <Title level={4}>Phòng cấp cứu 24/7</Title>
                <Paragraph style={{ color: "#666" }}>
                  Phòng cấp cứu hoạt động 24/7 với đội ngũ bác sĩ trực liên tục, sẵn sàng 
                  xử lý các trường hợp khẩn cấp.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* History Timeline */}
        <div id="history" style={{ padding: "80px 50px", background: "#f5f5f5" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <Title level={2} style={{ color: "#0F5B8C", marginBottom: 16 }}>
              Lịch Sử Phát Triển
            </Title>
            <Paragraph style={{ fontSize: 16, color: "#666", maxWidth: 700, margin: "0 auto" }}>
              Hành trình xây dựng và phát triển của MediCare System
            </Paragraph>
          </div>

          <Row justify="center">
            <Col xs={24} md={16}>
              <Card variant="borderless" style={{ borderRadius: 10 }}>
                <Timeline mode="left">
                  <Timeline.Item color="blue" label="2015">
                    <Title level={4}>Thành lập</Title>
                    <Paragraph style={{ color: "#666" }}>
                      MediCare System được thành lập với 1 cơ sở tại TP.HCM, 
                      10 bác sĩ và 20 nhân viên y tế.
                    </Paragraph>
                  </Timeline.Item>

                  <Timeline.Item color="green" label="2017">
                    <Title level={4}>Mở rộng</Title>
                    <Paragraph style={{ color: "#666" }}>
                      Mở thêm 3 chi nhánh tại Hà Nội, Đà Nẵng và Cần Thơ. 
                      Đạt mốc 50+ bác sĩ chuyên khoa.
                    </Paragraph>
                  </Timeline.Item>

                  <Timeline.Item color="orange" label="2019">
                    <Title level={4}>Công nghệ số</Title>
                    <Paragraph style={{ color: "#666" }}>
                      Ra mắt hệ thống quản lý bệnh viện điện tử và ứng dụng đặt khám online, 
                      tiên phong trong chuyển đổi số y tế.
                    </Paragraph>
                  </Timeline.Item>

                  <Timeline.Item color="red" label="2021">
                    <Title level={4}>Chứng nhận quốc tế</Title>
                    <Paragraph style={{ color: "#666" }}>
                      Đạt chứng nhận ISO 9001:2015 về hệ thống quản lý chất lượng 
                      và JCI về tiêu chuẩn y tế quốc tế.
                    </Paragraph>
                  </Timeline.Item>

                  <Timeline.Item color="purple" label="2024">
                    <Title level={4}>Hiện tại</Title>
                    <Paragraph style={{ color: "#666" }}>
                      Với 10+ chi nhánh trên toàn quốc, 150+ bác sĩ chuyên khoa, 
                      phục vụ hơn 15,000 bệnh nhân và đạt 98% hài lòng về dịch vụ.
                    </Paragraph>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      {/* Footer */}
      <Footer 
        style={{ 
          background: "linear-gradient(135deg, #0F5B8C 0%, #1890ff 100%)", 
          color: "white", 
          padding: "40px 50px 20px"
        }}
      >
        <Row justify="center">
          <Col span={24} style={{ textAlign: "center" }}>
            <Text style={{ color: "rgba(255,255,255,0.85)" }}>
              © 2024 MediCare System. All rights reserved.
            </Text>
          </Col>
        </Row>
      </Footer>
    </Layout>
  );
};

export default AboutPage;
