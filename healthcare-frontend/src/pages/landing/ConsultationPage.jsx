import {
    ApiOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    CommentOutlined,
    DownOutlined,
    HeartFilled,
    MailOutlined,
    PhoneOutlined,
    RobotOutlined,
    TeamOutlined,
    UserOutlined,
    VideoCameraOutlined
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
    Steps,
    Tooltip,
    Typography
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getRoleDisplayName } from "../../utils/roleUtils";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ConsultationPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
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

  const consultationTypes = [
    {
      icon: <CommentOutlined />,
      title: "Chat trực tuyến",
      description: "Trao đổi với bác sĩ qua tin nhắn văn bản",
      price: "100,000đ",
      duration: "30 phút",
      color: "#1890ff"
    },
    {
      icon: <PhoneOutlined />,
      title: "Tư vấn qua điện thoại",
      description: "Gọi điện trực tiếp với bác sĩ chuyên khoa",
      price: "150,000đ",
      duration: "20 phút",
      color: "#52c41a"
    },
    {
      icon: <VideoCameraOutlined />,
      title: "Video call",
      description: "Gặp mặt trực tuyến với bác sĩ qua video",
      price: "200,000đ",
      duration: "30 phút",
      color: "#fa8c16"
    },
    {
      icon: <RobotOutlined />,
      title: "AI Chatbot",
      description: "Trợ lý y tế AI hỗ trợ 24/7",
      price: "Miễn phí",
      duration: "Không giới hạn",
      color: "#eb2f96"
    }
  ];

  const handleSubmit = (values) => {
    console.log("Consultation request:", values);
    // Handle consultation request
  };

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
            background: "linear-gradient(135deg, rgba(15,91,140,0.9) 0%, rgba(24,144,255,0.85) 100%), url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920')",
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
            Tư Vấn Sức Khỏe Trực Tuyến
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
            Kết nối với bác sĩ chuyên khoa mọi lúc, mọi nơi
            <br />
            <strong>Nhanh chóng • Tiện lợi • Bảo mật</strong>
          </Paragraph>
        </div>

        {/* Consultation Types */}
        <div style={{ padding: "80px 50px", background: "#fff" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <Title level={2} style={{ color: "#0F5B8C", marginBottom: 16 }}>
              Chọn Hình Thức Tư Vấn
            </Title>
            <Paragraph style={{ fontSize: 16, color: "#666", maxWidth: 700, margin: "0 auto" }}>
              Linh hoạt chọn phương thức tư vấn phù hợp với nhu cầu của bạn
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {consultationTypes.map((type, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card
                  hoverable
                  style={{ 
                    textAlign: "center",
                    borderRadius: 10,
                    border: `2px solid ${type.color}20`,
                    height: "100%"
                  }}
                >
                  <div 
                    style={{ 
                      fontSize: 60, 
                      color: type.color, 
                      marginBottom: 16 
                    }}
                  >
                    {type.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 12 }}>
                    {type.title}
                  </Title>
                  <Paragraph style={{ color: "#666", minHeight: 48, marginBottom: 16 }}>
                    {type.description}
                  </Paragraph>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 20, color: type.color }}>
                      {type.price}
                    </Text>
                    <br />
                    <Text type="secondary">
                      <ClockCircleOutlined /> {type.duration}
                    </Text>
                  </div>
                  <Button 
                    type="primary" 
                    block
                    size="large"
                    style={{ 
                      background: type.color, 
                      borderColor: type.color 
                    }}
                  >
                    Chọn
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Consultation Form */}
        <div style={{ padding: "80px 50px", background: "#f5f5f5" }}>
          <Row justify="center">
            <Col xs={24} md={16}>
              <Card 
                variant="borderless"
                style={{ borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              >
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                  <Title level={2} style={{ color: "#0F5B8C", marginBottom: 16 }}>
                    <ApiOutlined /> Đặt Lịch Tư Vấn
                  </Title>
                  <Paragraph style={{ fontSize: 16, color: "#666" }}>
                    Điền thông tin để bác sĩ có thể hỗ trợ bạn tốt nhất
                  </Paragraph>
                </div>

                <Steps current={currentStep} style={{ marginBottom: 40 }}>
                  <Steps.Step title="Thông tin" />
                  <Steps.Step title="Triệu chứng" />
                  <Steps.Step title="Xác nhận" />
                </Steps>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  size="large"
                >
                  {currentStep === 0 && (
                    <>
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
                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
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
                        label="Chuyên khoa cần tư vấn"
                        name="specialty"
                        rules={[{ required: true, message: "Vui lòng chọn chuyên khoa" }]}
                      >
                        <Select placeholder="Chọn chuyên khoa">
                          <Option value="noi-khoa">Nội khoa</Option>
                          <Option value="ngoai-khoa">Ngoại khoa</Option>
                          <Option value="san-phu-khoa">Sản - Phụ khoa</Option>
                          <Option value="nhi-khoa">Nhi khoa</Option>
                          <Option value="tim-mach">Tim mạch</Option>
                          <Option value="tieu-hoa">Tiêu hóa</Option>
                          <Option value="than-kinh">Thần kinh</Option>
                          <Option value="da-lieu">Da liễu</Option>
                        </Select>
                      </Form.Item>
                    </>
                  )}

                  {currentStep === 1 && (
                    <>
                      <Form.Item
                        label="Triệu chứng hiện tại"
                        name="symptoms"
                        rules={[{ required: true, message: "Vui lòng mô tả triệu chứng" }]}
                      >
                        <TextArea 
                          rows={4} 
                          placeholder="Mô tả chi tiết các triệu chứng bạn đang gặp phải..."
                        />
                      </Form.Item>

                      <Form.Item
                        label="Thời gian xuất hiện triệu chứng"
                        name="duration"
                        rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
                      >
                        <Select placeholder="Chọn thời gian">
                          <Option value="1-2-ngay">1-2 ngày</Option>
                          <Option value="3-7-ngay">3-7 ngày</Option>
                          <Option value="1-2-tuan">1-2 tuần</Option>
                          <Option value="tren-2-tuan">Trên 2 tuần</Option>
                          <Option value="man-tinh">Mãn tính</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label="Tiền sử bệnh (nếu có)"
                        name="medicalHistory"
                      >
                        <TextArea 
                          rows={3} 
                          placeholder="Các bệnh lý đã mắc, đang điều trị..."
                        />
                      </Form.Item>
                    </>
                  )}

                  {currentStep === 2 && (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <div style={{ 
                        fontSize: 80, 
                        color: "#52c41a", 
                        marginBottom: 24 
                      }}>
                        <CalendarOutlined />
                      </div>
                      <Title level={3} style={{ marginBottom: 16 }}>
                        Xác nhận thông tin
                      </Title>
                      <Paragraph style={{ fontSize: 16, color: "#666", marginBottom: 24 }}>
                        Vui lòng kiểm tra lại thông tin trước khi gửi yêu cầu tư vấn
                      </Paragraph>
                      <div style={{ 
                        background: "#f5f5f5", 
                        padding: "20px", 
                        borderRadius: 8,
                        textAlign: "left"
                      }}>
                        <Text strong>Họ tên:</Text> {form.getFieldValue("fullName")}
                        <br />
                        <Text strong>Số điện thoại:</Text> {form.getFieldValue("phone")}
                        <br />
                        <Text strong>Email:</Text> {form.getFieldValue("email")}
                        <br />
                        <Text strong>Chuyên khoa:</Text> {form.getFieldValue("specialty")}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 40, textAlign: "center" }}>
                    <Space size="large">
                      {currentStep > 0 && (
                        <Button size="large" onClick={() => setCurrentStep(currentStep - 1)}>
                          Quay lại
                        </Button>
                      )}
                      {currentStep < 2 && (
                        <Button 
                          type="primary" 
                          size="large"
                          onClick={() => setCurrentStep(currentStep + 1)}
                        >
                          Tiếp tục
                        </Button>
                      )}
                      {currentStep === 2 && (
                        <Button 
                          type="primary" 
                          size="large"
                          htmlType="submit"
                          icon={<CalendarOutlined />}
                        >
                          Xác nhận đặt lịch
                        </Button>
                      )}
                    </Space>
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Benefits */}
        <div style={{ padding: "80px 50px", background: "#fff" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <Title level={2} style={{ color: "#0F5B8C" }}>
              Lợi Ích Khi Tư Vấn Trực Tuyến
            </Title>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card variant="borderless" style={{ textAlign: "center", height: "100%" }}>
                <ClockCircleOutlined style={{ fontSize: 60, color: "#1890ff", marginBottom: 16 }} />
                <Title level={4}>Tiết kiệm thời gian</Title>
                <Paragraph style={{ color: "#666" }}>
                  Không cần di chuyển, tư vấn ngay tại nhà mọi lúc, mọi nơi
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless" style={{ textAlign: "center", height: "100%" }}>
                <TeamOutlined style={{ fontSize: 60, color: "#52c41a", marginBottom: 16 }} />
                <Title level={4}>Bác sĩ chuyên khoa</Title>
                <Paragraph style={{ color: "#666" }}>
                  Kết nối với bác sĩ giàu kinh nghiệm trong nhiều lĩnh vực
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless" style={{ textAlign: "center", height: "100%" }}>
                <HeartFilled style={{ fontSize: 60, color: "#eb2f96", marginBottom: 16 }} />
                <Title level={4}>An toàn & bảo mật</Title>
                <Paragraph style={{ color: "#666" }}>
                  Thông tin cá nhân và y tế được bảo mật tuyệt đối
                </Paragraph>
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

export default ConsultationPage;
