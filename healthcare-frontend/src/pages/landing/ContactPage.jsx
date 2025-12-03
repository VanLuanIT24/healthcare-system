import {
    ClockCircleOutlined,
    DownOutlined,
    EnvironmentOutlined,
    FacebookOutlined,
    HeartFilled,
    LinkedinOutlined,
    MailOutlined,
    MessageOutlined,
    PhoneOutlined,
    SendOutlined,
    TwitterOutlined,
    UserOutlined,
    YoutubeOutlined
} from "@ant-design/icons";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Dropdown,
    Form,
    Input,
    Layout,
    Menu,
    Row,
    Select,
    Space,
    Typography,
    message
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getRoleDisplayName } from "../../utils/roleUtils";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ContactPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [form] = Form.useForm();

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
      <Menu.Item key="vision" onClick={() => navigate("/about")}>Tầm nhìn & Sứ mệnh</Menu.Item>
      <Menu.Item key="facility" onClick={() => navigate("/about")}>Cơ sở vật chất</Menu.Item>
      <Menu.Item key="history" onClick={() => navigate("/about")}>Lịch sử phát triển</Menu.Item>
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

  const handleSubmit = (values) => {
    console.log("Contact form:", values);
    message.success("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong 24h.");
    form.resetFields();
  };

  const locations = [
    {
      name: "Cơ sở TP. Hồ Chí Minh",
      address: "123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM",
      phone: "(028) 1234 5678",
      email: "hcm@medicare.vn",
      hours: "Thứ 2 - Chủ nhật: 7:00 - 20:00"
    },
    {
      name: "Cơ sở Hà Nội",
      address: "456 Đường Láng, Quận Đống Đa, Hà Nội",
      phone: "(024) 8765 4321",
      email: "hanoi@medicare.vn",
      hours: "Thứ 2 - Chủ nhật: 7:00 - 20:00"
    },
    {
      name: "Cơ sở Đà Nẵng",
      address: "789 Đường Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng",
      phone: "(0236) 1122 3344",
      email: "danang@medicare.vn",
      hours: "Thứ 2 - Chủ nhật: 7:00 - 20:00"
    }
  ];

  const contactMethods = [
    {
      icon: <PhoneOutlined />,
      title: "Hotline",
      content: "1900-xxxx",
      description: "Hỗ trợ 24/7",
      color: "#52c41a"
    },
    {
      icon: <MailOutlined />,
      title: "Email",
      content: "support@medicare.vn",
      description: "Phản hồi trong 24h",
      color: "#1890ff"
    },
    {
      icon: <MessageOutlined />,
      title: "Live Chat",
      content: "Trò chuyện trực tuyến",
      description: "8:00 - 22:00 hàng ngày",
      color: "#fa8c16"
    },
    {
      icon: <FacebookOutlined />,
      title: "Facebook",
      content: "fb.com/medicare",
      description: "Inbox trực tiếp",
      color: "#1877f2"
    }
  ];

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
              <a style={{ color: "white", fontSize: 15, fontWeight: 600 }}>
                Liên hệ
              </a>
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
            background: "linear-gradient(135deg, rgba(15,91,140,0.9) 0%, rgba(24,144,255,0.85) 100%), url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920')",
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
            Liên Hệ Với Chúng Tôi
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
            Đội ngũ MediCare System luôn sẵn sàng hỗ trợ bạn
            <br />
            <strong>Nhanh chóng • Chuyên nghiệp • Tận tâm</strong>
          </Paragraph>
        </div>

        {/* Contact Methods */}
        <div style={{ padding: "80px 50px", background: "#fff" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <Title level={2} style={{ color: "#0F5B8C", marginBottom: 16 }}>
              Kênh Liên Hệ
            </Title>
            <Paragraph style={{ fontSize: 16, color: "#666", maxWidth: 700, margin: "0 auto" }}>
              Chọn phương thức liên hệ phù hợp với bạn
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {contactMethods.map((method, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card
                  hoverable
                  style={{ 
                    textAlign: "center",
                    borderRadius: 10,
                    border: `2px solid ${method.color}20`,
                    height: "100%"
                  }}
                >
                  <div style={{ fontSize: 60, color: method.color, marginBottom: 16 }}>
                    {method.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    {method.title}
                  </Title>
                  <Text strong style={{ fontSize: 16, color: method.color, display: "block", marginBottom: 8 }}>
                    {method.content}
                  </Text>
                  <Text type="secondary">{method.description}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Contact Form & Map */}
        <div style={{ padding: "80px 50px", background: "#f5f5f5" }}>
          <Row gutter={[48, 48]}>
            {/* Contact Form */}
            <Col xs={24} md={12}>
              <Card 
                variant="borderless"
                style={{ borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              >
                <Title level={3} style={{ color: "#0F5B8C", marginBottom: 24 }}>
                  <SendOutlined /> Gửi Tin Nhắn
                </Title>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  size="large"
                >
                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="0901234567" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email" },
                          { type: "email", message: "Email không hợp lệ" }
                        ]}
                      >
                        <Input prefix={<MailOutlined />} placeholder="email@example.com" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Chủ đề"
                    name="subject"
                    rules={[{ required: true, message: "Vui lòng chọn chủ đề" }]}
                  >
                    <Select placeholder="Chọn chủ đề">
                      <Option value="dat-lich">Đặt lịch khám</Option>
                      <Option value="tu-van">Tư vấn y tế</Option>
                      <Option value="khieu-nai">Khiếu nại</Option>
                      <Option value="gop-y">Góp ý</Option>
                      <Option value="khac">Khác</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Nội dung"
                    name="message"
                    rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                  >
                    <TextArea 
                      rows={5} 
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      size="large"
                      block
                      icon={<SendOutlined />}
                    >
                      Gửi tin nhắn
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            {/* Map & Info */}
            <Col xs={24} md={12}>
              <Card 
                variant="borderless"
                style={{ borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", height: "100%" }}
              >
                <Title level={3} style={{ color: "#0F5B8C", marginBottom: 24 }}>
                  <EnvironmentOutlined /> Vị Trí
                </Title>

                {/* Embedded Map Placeholder */}
                <div style={{ 
                  width: "100%", 
                  height: 300, 
                  background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)",
                  borderRadius: 8,
                  marginBottom: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <div style={{ textAlign: "center" }}>
                    <EnvironmentOutlined style={{ fontSize: 60, color: "#1890ff", marginBottom: 12 }} />
                    <Text style={{ fontSize: 16, color: "#666" }}>
                      Bản đồ Google Maps
                    </Text>
                  </div>
                </div>

                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                  <div>
                    <Text strong style={{ fontSize: 16, color: "#0F5B8C" }}>
                      <EnvironmentOutlined /> Địa chỉ chính
                    </Text>
                    <br />
                    <Text style={{ color: "#666" }}>
                      123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
                    </Text>
                  </div>

                  <div>
                    <Text strong style={{ fontSize: 16, color: "#0F5B8C" }}>
                      <PhoneOutlined /> Hotline 24/7
                    </Text>
                    <br />
                    <Text style={{ color: "#666", fontSize: 18 }}>
                      1900-xxxx
                    </Text>
                  </div>

                  <div>
                    <Text strong style={{ fontSize: 16, color: "#0F5B8C" }}>
                      <MailOutlined /> Email hỗ trợ
                    </Text>
                    <br />
                    <Text style={{ color: "#666" }}>
                      support@medicare.vn
                    </Text>
                  </div>

                  <div>
                    <Text strong style={{ fontSize: 16, color: "#0F5B8C" }}>
                      <ClockCircleOutlined /> Giờ làm việc
                    </Text>
                    <br />
                    <Text style={{ color: "#666" }}>
                      Thứ 2 - Chủ nhật: 7:00 - 20:00
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Locations */}
        <div style={{ padding: "80px 50px", background: "#fff" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <Title level={2} style={{ color: "#0F5B8C", marginBottom: 16 }}>
              Hệ Thống Cơ Sở
            </Title>
            <Paragraph style={{ fontSize: 16, color: "#666", maxWidth: 700, margin: "0 auto" }}>
              MediCare System có mặt tại các thành phố lớn
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {locations.map((location, index) => (
              <Col xs={24} md={8} key={index}>
                <Card
                  variant="borderless"
                  style={{ 
                    borderRadius: 10,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    height: "100%"
                  }}
                >
                  <Title level={4} style={{ color: "#0F5B8C", marginBottom: 16 }}>
                    {location.name}
                  </Title>
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <div>
                      <Text type="secondary">
                        <EnvironmentOutlined /> {location.address}
                      </Text>
                    </div>
                    <div>
                      <Text strong style={{ color: "#52c41a" }}>
                        <PhoneOutlined /> {location.phone}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary">
                        <MailOutlined /> {location.email}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary">
                        <ClockCircleOutlined /> {location.hours}
                      </Text>
                    </div>
                  </Space>
                  <Button type="primary" block style={{ marginTop: 20 }}>
                    Xem bản đồ
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Social Media */}
        <div style={{ padding: "60px 50px", background: "#f5f5f5", textAlign: "center" }}>
          <Title level={3} style={{ color: "#0F5B8C", marginBottom: 24 }}>
            Kết Nối Với Chúng Tôi
          </Title>
          <Space size="large">
            <Button 
              type="primary" 
              size="large"
              icon={<FacebookOutlined />}
              style={{ background: "#1877f2", borderColor: "#1877f2", width: 150 }}
            >
              Facebook
            </Button>
            <Button 
              type="primary" 
              size="large"
              icon={<TwitterOutlined />}
              style={{ background: "#1da1f2", borderColor: "#1da1f2", width: 150 }}
            >
              Twitter
            </Button>
            <Button 
              type="primary" 
              size="large"
              icon={<LinkedinOutlined />}
              style={{ background: "#0077b5", borderColor: "#0077b5", width: 150 }}
            >
              LinkedIn
            </Button>
            <Button 
              type="primary" 
              size="large"
              icon={<YoutubeOutlined />}
              style={{ background: "#ff0000", borderColor: "#ff0000", width: 150 }}
            >
              YouTube
            </Button>
          </Space>
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

export default ContactPage;
