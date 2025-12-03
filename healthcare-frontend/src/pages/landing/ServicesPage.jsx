import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CustomerServiceOutlined,
    DesktopOutlined,
    DownOutlined,
    EnvironmentOutlined,
    ExperimentOutlined,
    EyeOutlined,
    FacebookOutlined,
    HeartFilled,
    HeartOutlined,
    HomeOutlined,
    LinkedinOutlined,
    LockOutlined,
    LogoutOutlined,
    MailOutlined,
    MedicineBoxOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
    TwitterOutlined,
    UserOutlined,
    YoutubeOutlined
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Card,
    Col,
    Divider,
    Dropdown,
    Input,
    Layout,
    Menu,
    Row,
    Space,
    Tabs,
    Typography
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const ServicesPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  // Services data
  const services = [
    {
      id: 1,
      category: "examination",
      icon: <HeartOutlined />,
      title: "Khám tổng quát",
      description: "Kiểm tra sức khỏe toàn diện với đội ngũ bác sĩ chuyên môn cao",
      features: ["Khám lâm sàng", "Xét nghiệm máu", "Đo huyết áp", "Tư vấn sức khỏe"],
      price: "500.000đ",
      color: "#1890ff"
    },
    {
      id: 2,
      category: "examination",
      icon: <EyeOutlined />,
      title: "Khám chuyên khoa",
      description: "Khám và điều trị các bệnh chuyên sâu theo từng chuyên khoa",
      features: ["Tim mạch", "Nội tiết", "Tiêu hóa", "Thần kinh"],
      price: "300.000đ",
      color: "#52c41a"
    },
    {
      id: 3,
      category: "laboratory",
      icon: <ExperimentOutlined />,
      title: "Xét nghiệm",
      description: "Xét nghiệm với trang thiết bị hiện đại, kết quả nhanh chóng",
      features: ["Xét nghiệm máu", "Xét nghiệm nước tiểu", "Xét nghiệm vi sinh", "Xét nghiệm hóa sinh"],
      price: "Từ 50.000đ",
      color: "#fa8c16"
    },
    {
      id: 4,
      category: "imaging",
      icon: <DesktopOutlined />,
      title: "Chẩn đoán hình ảnh",
      description: "X-quang, siêu âm, CT, MRI với máy móc hiện đại nhất",
      features: ["X-quang", "Siêu âm", "CT Scanner", "MRI"],
      price: "Từ 100.000đ",
      color: "#722ed1"
    },
    {
      id: 5,
      category: "emergency",
      icon: <MedicineBoxOutlined />,
      title: "Cấp cứu 24/7",
      description: "Dịch vụ cấp cứu khẩn cấp hoạt động 24/7",
      features: ["Cấp cứu ngoại khoa", "Cấp cứu nội khoa", "Hồi sức cấp cứu", "Xe cứu thương"],
      price: "Liên hệ",
      color: "#f5222d"
    },
    {
      id: 6,
      category: "surgery",
      icon: <SafetyCertificateOutlined />,
      title: "Phẫu thuật",
      description: "Phẫu thuật an toàn với đội ngũ bác sĩ giàu kinh nghiệm",
      features: ["Phẫu thuật nội soi", "Phẫu thuật tổng quát", "Phẫu thuật thẩm mỹ", "Phẫu thuật chỉnh hình"],
      price: "Từ 5.000.000đ",
      color: "#13c2c2"
    },
    {
      id: 7,
      category: "telemedicine",
      icon: <DesktopOutlined />,
      title: "Tư vấn trực tuyến",
      description: "Tư vấn sức khỏe từ xa qua video call với bác sĩ",
      features: ["Tư vấn qua video", "Tư vấn qua điện thoại", "Chat với bác sĩ", "Đặt lịch khám online"],
      price: "Từ 100.000đ",
      color: "#eb2f96"
    },
    {
      id: 8,
      category: "pharmacy",
      icon: <MedicineBoxOutlined />,
      title: "Nhà thuốc",
      description: "Cung cấp thuốc chính hãng, tư vấn dùng thuốc miễn phí",
      features: ["Thuốc kê đơn", "Thuốc không kê đơn", "Thực phẩm chức năng", "Giao thuốc tận nhà"],
      price: "Theo đơn",
      color: "#faad14"
    },
    {
      id: 9,
      category: "vaccination",
      icon: <SafetyCertificateOutlined />,
      title: "Tiêm chủng",
      description: "Dịch vụ tiêm chủng đầy đủ cho trẻ em và người lớn",
      features: ["Vaccine trẻ em", "Vaccine người lớn", "Vaccine du lịch", "Tư vấn tiêm chủng"],
      price: "Từ 150.000đ",
      color: "#52c41a"
    }
  ];

  const categories = [
    { key: "all", label: "Tất cả dịch vụ" },
    { key: "examination", label: "Khám bệnh" },
    { key: "laboratory", label: "Xét nghiệm" },
    { key: "imaging", label: "Chẩn đoán hình ảnh" },
    { key: "emergency", label: "Cấp cứu" },
    { key: "surgery", label: "Phẫu thuật" },
    { key: "telemedicine", label: "Tư vấn online" },
    { key: "pharmacy", label: "Nhà thuốc" },
    { key: "vaccination", label: "Tiêm chủng" }
  ];

  const filteredServices = activeTab === "all" 
    ? services 
    : services.filter(s => s.category === activeTab);

  // User menu
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => navigate("/patient/profile")
    },
    {
      key: "change-password",
      icon: <LockOutlined />,
      label: "Đổi mật khẩu"
    },
    {
      key: "appointments",
      icon: <CalendarOutlined />,
      label: "Lịch khám",
      onClick: () => navigate("/patient/appointments")
    },
    {
      type: "divider"
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: logout
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "0 50px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1890ff",
              cursor: "pointer"
            }}
            onClick={() => navigate("/")}
          >
            <HeartFilled /> MediCare
          </div>
        </div>

        <Menu
          mode="horizontal"
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            justifyContent: "center"
          }}
        >
          <Menu.Item key="home" onClick={() => navigate("/")}>
            <HomeOutlined /> Trang chủ
          </Menu.Item>
          <Menu.SubMenu
            key="about"
            title={
              <span>
                Giới thiệu <DownOutlined />
              </span>
            }
          >
            <Menu.Item key="about-us" onClick={() => navigate("/about")}>
              Về chúng tôi
            </Menu.Item>
            <Menu.Item key="doctors" onClick={() => navigate("/doctors")}>
              Đội ngũ bác sĩ
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu
            key="services"
            title={
              <span>
                Dịch vụ <DownOutlined />
              </span>
            }
          >
            <Menu.Item key="services-all" onClick={() => navigate("/services")}>
              Tất cả dịch vụ
            </Menu.Item>
            <Menu.Item key="consultation" onClick={() => navigate("/consultation")}>
              Tư vấn trực tuyến
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="news" onClick={() => navigate("/news")}>
            Tin tức
          </Menu.Item>
          <Menu.Item key="contact" onClick={() => navigate("/contact")}>
            Liên hệ
          </Menu.Item>
        </Menu>

        <Space size="large">
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} src={user.avatar} />
                <span>{user.fullName || user.email}</span>
                <DownOutlined />
              </Space>
            </Dropdown>
          ) : (
            <>
              <Button type="link" onClick={() => navigate("/login")}>
                Đăng nhập
              </Button>
              <Button type="primary" onClick={() => navigate("/register")}>
                Đăng ký
              </Button>
            </>
          )}
        </Space>
      </Header>

      {/* Content */}
      <Content style={{ padding: "50px" }}>
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <Title level={1}>Dịch vụ y tế</Title>
          <Paragraph style={{ fontSize: 16, color: "#666" }}>
            Chúng tôi cung cấp đầy đủ các dịch vụ y tế chất lượng cao với đội ngũ bác sĩ chuyên môn
          </Paragraph>
        </div>

        {/* Service Categories Tabs */}
        <div style={{ marginBottom: 40 }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={categories.map(cat => ({
              key: cat.key,
              label: cat.label
            }))}
          />
        </div>

        {/* Services Grid */}
        <Row gutter={[24, 24]}>
          {filteredServices.map((service) => (
            <Col xs={24} sm={12} lg={8} key={service.id}>
              <Card
                hoverable
                style={{ height: "100%" }}
                actions={[
                  <Button 
                    type="primary" 
                    block
                    onClick={() => navigate("/consultation")}
                  >
                    Đặt lịch ngay
                  </Button>
                ]}
              >
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 48,
                      color: service.color,
                      marginBottom: 16
                    }}
                  >
                    {service.icon}
                  </div>
                  <Title level={4}>{service.title}</Title>
                  <Paragraph style={{ color: "#666" }}>
                    {service.description}
                  </Paragraph>
                </div>

                <Divider />

                <div style={{ marginBottom: 16 }}>
                  <Text strong>Dịch vụ bao gồm:</Text>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    {service.features.map((feature, idx) => (
                      <li key={idx}>
                        <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <Text strong style={{ fontSize: 18, color: service.color }}>
                    {service.price}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Why Choose Us Section */}
        <div style={{ marginTop: 80 }}>
          <Title level={2} style={{ textAlign: "center", marginBottom: 50 }}>
            Tại sao chọn chúng tôi?
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={6}>
              <Card style={{ textAlign: "center", height: "100%" }}>
                <TeamOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                <Title level={4} style={{ marginTop: 16 }}>
                  Đội ngũ chuyên môn
                </Title>
                <Paragraph>
                  Bác sĩ giàu kinh nghiệm, được đào tạo bài bản
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card style={{ textAlign: "center", height: "100%" }}>
                <SafetyCertificateOutlined style={{ fontSize: 48, color: "#52c41a" }} />
                <Title level={4} style={{ marginTop: 16 }}>
                  An toàn - Hiệu quả
                </Title>
                <Paragraph>
                  Quy trình khám chữa bệnh an toàn, hiệu quả cao
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card style={{ textAlign: "center", height: "100%" }}>
                <ClockCircleOutlined style={{ fontSize: 48, color: "#fa8c16" }} />
                <Title level={4} style={{ marginTop: 16 }}>
                  Phục vụ 24/7
                </Title>
                <Paragraph>
                  Dịch vụ cấp cứu và tư vấn hoạt động 24/7
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card style={{ textAlign: "center", height: "100%" }}>
                <CustomerServiceOutlined style={{ fontSize: 48, color: "#722ed1" }} />
                <Title level={4} style={{ marginTop: 16 }}>
                  Hỗ trợ tận tâm
                </Title>
                <Paragraph>
                  Chăm sóc khách hàng chu đáo, tận tình
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* CTA Section */}
        <div
          style={{
            marginTop: 80,
            padding: "60px 40px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 16,
            textAlign: "center",
            color: "white"
          }}
        >
          <Title level={2} style={{ color: "white", marginBottom: 20 }}>
            Cần tư vấn thêm về dịch vụ?
          </Title>
          <Paragraph style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", marginBottom: 30 }}>
            Đội ngũ chăm sóc khách hàng của chúng tôi sẵn sàng hỗ trợ bạn 24/7
          </Paragraph>
          <Space size="large">
            <Button
              type="primary"
              size="large"
              icon={<PhoneOutlined />}
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
            >
              Gọi ngay: 1900-xxxx
            </Button>
            <Button
              size="large"
              icon={<MailOutlined />}
              style={{ background: "white", color: "#722ed1" }}
              onClick={() => navigate("/contact")}
            >
              Liên hệ qua email
            </Button>
          </Space>
        </div>
      </Content>

      {/* Footer */}
      <Footer
        style={{
          background: "linear-gradient(135deg, #0F5B8C 0%, #1890ff 100%)",
          color: "white",
          padding: "60px 50px 30px"
        }}
      >
        <Row gutter={[32, 32]}>
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

          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: "white", marginBottom: 20 }}>
              Liên kết nhanh
            </Title>
            <Space direction="vertical" size="small">
              <a onClick={() => navigate("/about")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Giới thiệu</a>
              <a onClick={() => navigate("/services")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Dịch vụ</a>
              <a onClick={() => navigate("/news")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Tin tức</a>
              <a onClick={() => navigate("/careers")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Tuyển dụng</a>
              <a onClick={() => navigate("/contact")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Liên hệ</a>
            </Space>
          </Col>

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
    </Layout>
  );
};

export default ServicesPage;
