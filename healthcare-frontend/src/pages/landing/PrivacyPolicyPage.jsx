import {
    CalendarOutlined,
    DownOutlined,
    EnvironmentOutlined,
    FacebookOutlined,
    FileProtectOutlined,
    HeartFilled,
    HomeOutlined,
    LinkedinOutlined,
    LockOutlined,
    LogoutOutlined,
    MailOutlined,
    PhoneOutlined,
    ProfileOutlined,
    SafetyCertificateOutlined,
    SecurityScanOutlined,
    SettingOutlined,
    TwitterOutlined,
    UserOutlined,
    YoutubeOutlined
} from "@ant-design/icons";
import {
    Anchor,
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
    Timeline,
    Typography
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 16,
            marginBottom: 60,
            color: "white"
          }}
        >
          <FileProtectOutlined style={{ fontSize: 64, marginBottom: 20 }} />
          <Title level={1} style={{ color: "white", marginBottom: 16 }}>
            Chính Sách Bảo Mật
          </Title>
          <Paragraph style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", marginBottom: 0 }}>
            Cam kết bảo vệ thông tin cá nhân và dữ liệu y tế của bạn
          </Paragraph>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
            Cập nhật lần cuối: 27/11/2024
          </Text>
        </div>

        <Row gutter={32}>
          {/* Sidebar Navigation */}
          <Col xs={24} md={6}>
            <Card
              style={{
                position: "sticky",
                top: 80
              }}
            >
              <Anchor
                offsetTop={80}
                items={[
                  { key: "intro", href: "#intro", title: "Giới thiệu" },
                  { key: "collection", href: "#collection", title: "Thu thập thông tin" },
                  { key: "usage", href: "#usage", title: "Sử dụng thông tin" },
                  { key: "protection", href: "#protection", title: "Bảo vệ dữ liệu" },
                  { key: "sharing", href: "#sharing", title: "Chia sẻ thông tin" },
                  { key: "rights", href: "#rights", title: "Quyền của bạn" },
                  { key: "cookies", href: "#cookies", title: "Cookies" },
                  { key: "contact", href: "#contact", title: "Liên hệ" }
                ]}
              />
            </Card>
          </Col>

          {/* Main Content */}
          <Col xs={24} md={18}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Introduction */}
              <Card id="intro">
                <Title level={3}>
                  <SafetyCertificateOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                  Giới thiệu
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Tại MediCare System, chúng tôi hiểu rằng thông tin sức khỏe của bạn là cực kỳ nhạy cảm và quan trọng. 
                  Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân 
                  và dữ liệu y tế của bạn khi sử dụng dịch vụ của chúng tôi.
                </Paragraph>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Bằng việc sử dụng hệ thống MediCare, bạn đồng ý với các điều khoản được mô tả trong chính sách này. 
                  Chúng tôi cam kết tuân thủ các quy định pháp luật về bảo vệ dữ liệu cá nhân và tiêu chuẩn bảo mật 
                  y tế quốc tế.
                </Paragraph>
              </Card>

              {/* Data Collection */}
              <Card id="collection">
                <Title level={3}>
                  <ProfileOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                  Thu thập thông tin
                </Title>
                <Paragraph style={{ fontSize: 15, marginBottom: 20 }}>
                  Chúng tôi thu thập các loại thông tin sau để cung cấp dịch vụ y tế tốt nhất cho bạn:
                </Paragraph>

                <Timeline
                  items={[
                    {
                      color: "blue",
                      children: (
                        <>
                          <Title level={5}>1. Thông tin cá nhân cơ bản</Title>
                          <ul style={{ marginTop: 8 }}>
                            <li>Họ tên, ngày sinh, giới tính</li>
                            <li>Địa chỉ liên lạc, số điện thoại, email</li>
                            <li>Số CMND/CCCD, số bảo hiểm y tế</li>
                            <li>Thông tin liên hệ khẩn cấp</li>
                          </ul>
                        </>
                      )
                    },
                    {
                      color: "green",
                      children: (
                        <>
                          <Title level={5}>2. Thông tin y tế</Title>
                          <ul style={{ marginTop: 8 }}>
                            <li>Lịch sử khám chữa bệnh và chẩn đoán</li>
                            <li>Kết quả xét nghiệm và chẩn đoán hình ảnh</li>
                            <li>Đơn thuốc và lịch sử điều trị</li>
                            <li>Tiền sử bệnh và dị ứng</li>
                            <li>Thông tin về gia đình và di truyền (nếu có)</li>
                          </ul>
                        </>
                      )
                    },
                    {
                      color: "orange",
                      children: (
                        <>
                          <Title level={5}>3. Thông tin tài chính</Title>
                          <ul style={{ marginTop: 8 }}>
                            <li>Thông tin thanh toán và hóa đơn</li>
                            <li>Thông tin bảo hiểm y tế</li>
                            <li>Lịch sử giao dịch (được mã hóa)</li>
                          </ul>
                        </>
                      )
                    },
                    {
                      color: "purple",
                      children: (
                        <>
                          <Title level={5}>4. Thông tin kỹ thuật</Title>
                          <ul style={{ marginTop: 8 }}>
                            <li>Địa chỉ IP và thông tin thiết bị</li>
                            <li>Nhật ký truy cập hệ thống</li>
                            <li>Cookies và dữ liệu phiên làm việc</li>
                            <li>Thông tin về trình duyệt và hệ điều hành</li>
                          </ul>
                        </>
                      )
                    }
                  ]}
                />
              </Card>

              {/* Data Usage */}
              <Card id="usage">
                <Title level={3}>
                  <SettingOutlined style={{ color: "#fa8c16", marginRight: 8 }} />
                  Sử dụng thông tin
                </Title>
                <Paragraph style={{ fontSize: 15, marginBottom: 20 }}>
                  Thông tin thu thập được sẽ được sử dụng cho các mục đích sau:
                </Paragraph>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card size="small" style={{ background: "#f0f9ff" }}>
                      <Space>
                        <SafetyCertificateOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                        <div>
                          <Text strong>Cung cấp dịch vụ y tế</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Khám chữa bệnh, xét nghiệm, tư vấn y tế
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" style={{ background: "#f6ffed" }}>
                      <Space>
                        <FileProtectOutlined style={{ fontSize: 24, color: "#52c41a" }} />
                        <div>
                          <Text strong>Quản lý hồ sơ bệnh án</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Lưu trữ và truy xuất thông tin y tế
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" style={{ background: "#fff7e6" }}>
                      <Space>
                        <MailOutlined style={{ fontSize: 24, color: "#fa8c16" }} />
                        <div>
                          <Text strong>Liên lạc và thông báo</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Nhắc lịch hẹn, kết quả xét nghiệm
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" style={{ background: "#f9f0ff" }}>
                      <Space>
                        <SecurityScanOutlined style={{ fontSize: 24, color: "#722ed1" }} />
                        <div>
                          <Text strong>Bảo mật và tuân thủ</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Đảm bảo an toàn và tuân thủ pháp luật
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>

              {/* Data Protection */}
              <Card id="protection">
                <Title level={3}>
                  <LockOutlined style={{ color: "#722ed1", marginRight: 8 }} />
                  Bảo vệ dữ liệu
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Chúng tôi áp dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin của bạn:
                </Paragraph>

                <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
                  <Col xs={24} md={8}>
                    <div style={{ textAlign: "center" }}>
                      <LockOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 12 }} />
                      <Title level={5}>Mã hóa dữ liệu</Title>
                      <Paragraph style={{ fontSize: 13 }}>
                        Tất cả dữ liệu được mã hóa AES-256 khi lưu trữ và TLS/SSL khi truyền tải
                      </Paragraph>
                    </div>
                  </Col>
                  <Col xs={24} md={8}>
                    <div style={{ textAlign: "center" }}>
                      <SecurityScanOutlined style={{ fontSize: 48, color: "#52c41a", marginBottom: 12 }} />
                      <Title level={5}>Kiểm soát truy cập</Title>
                      <Paragraph style={{ fontSize: 13 }}>
                        Hệ thống phân quyền nghiêm ngặt, chỉ nhân viên được ủy quyền mới truy cập
                      </Paragraph>
                    </div>
                  </Col>
                  <Col xs={24} md={8}>
                    <div style={{ textAlign: "center" }}>
                      <SafetyCertificateOutlined style={{ fontSize: 48, color: "#fa8c16", marginBottom: 12 }} />
                      <Title level={5}>Sao lưu định kỳ</Title>
                      <Paragraph style={{ fontSize: 13 }}>
                        Dữ liệu được sao lưu tự động hàng ngày tại các trung tâm dữ liệu an toàn
                      </Paragraph>
                    </div>
                  </Col>
                </Row>

                <Card size="small" style={{ marginTop: 20, background: "#fff1f0", borderColor: "#ffa39e" }}>
                  <Space>
                    <SafetyCertificateOutlined style={{ fontSize: 20, color: "#f5222d" }} />
                    <div>
                      <Text strong>Tuân thủ tiêu chuẩn quốc tế</Text>
                      <br />
                      <Text style={{ fontSize: 13 }}>
                        Hệ thống của chúng tôi tuân thủ các tiêu chuẩn HIPAA, ISO 27001 về bảo mật thông tin y tế
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Card>

              {/* Data Sharing */}
              <Card id="sharing">
                <Title level={3}>
                  <ProfileOutlined style={{ color: "#13c2c2", marginRight: 8 }} />
                  Chia sẻ thông tin
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Thông tin có thể được chia sẻ trong các trường hợp sau:
                </Paragraph>

                <Space direction="vertical" size="middle" style={{ width: "100%", marginTop: 20 }}>
                  <Card size="small">
                    <Text strong>✓ Với đội ngũ y tế điều trị:</Text>
                    <br />
                    <Text>Bác sĩ, y tá, và nhân viên y tế liên quan đến việc chăm sóc sức khỏe của bạn</Text>
                  </Card>
                  <Card size="small">
                    <Text strong>✓ Với cơ quan bảo hiểm:</Text>
                    <br />
                    <Text>Để xử lý yêu cầu thanh toán bảo hiểm y tế (theo sự đồng ý của bạn)</Text>
                  </Card>
                  <Card size="small">
                    <Text strong>✓ Theo yêu cầu pháp luật:</Text>
                    <br />
                    <Text>Khi có lệnh của tòa án hoặc cơ quan nhà nước có thẩm quyền</Text>
                  </Card>
                  <Card size="small">
                    <Text strong>✓ Trong trường hợp khẩn cấp:</Text>
                    <br />
                    <Text>Để bảo vệ tính mạng và sức khỏe của bạn hoặc người khác</Text>
                  </Card>
                </Space>
              </Card>

              {/* User Rights */}
              <Card id="rights">
                <Title level={3}>
                  <UserOutlined style={{ color: "#eb2f96", marginRight: 8 }} />
                  Quyền của bạn
                </Title>
                <Paragraph style={{ fontSize: 15, marginBottom: 20 }}>
                  Bạn có các quyền sau đây đối với thông tin cá nhân của mình:
                </Paragraph>

                <Timeline
                  items={[
                    {
                      color: "blue",
                      children: (
                        <>
                          <Text strong>Quyền truy cập:</Text> Xem và tải xuống thông tin cá nhân và hồ sơ y tế của bạn
                        </>
                      )
                    },
                    {
                      color: "green",
                      children: (
                        <>
                          <Text strong>Quyền sửa đổi:</Text> Yêu cầu cập nhật hoặc sửa chữa thông tin không chính xác
                        </>
                      )
                    },
                    {
                      color: "orange",
                      children: (
                        <>
                          <Text strong>Quyền xóa:</Text> Yêu cầu xóa dữ liệu cá nhân (trừ những thông tin bắt buộc lưu trữ theo luật)
                        </>
                      )
                    },
                    {
                      color: "purple",
                      children: (
                        <>
                          <Text strong>Quyền hạn chế:</Text> Yêu cầu hạn chế việc xử lý thông tin của bạn
                        </>
                      )
                    },
                    {
                      color: "red",
                      children: (
                        <>
                          <Text strong>Quyền rút lại:</Text> Rút lại sự đồng ý chia sẻ thông tin bất cứ lúc nào
                        </>
                      )
                    },
                    {
                      color: "cyan",
                      children: (
                        <>
                          <Text strong>Quyền khiếu nại:</Text> Gửi khiếu nại về việc xử lý dữ liệu không đúng quy định
                        </>
                      )
                    }
                  ]}
                />

                <Card size="small" style={{ marginTop: 20, background: "#e6f7ff", borderColor: "#91d5ff" }}>
                  <Text>
                    <strong>Để thực hiện các quyền trên:</strong> Vui lòng liên hệ với bộ phận hỗ trợ qua email{" "}
                    <a href="mailto:privacy@medicare.vn">privacy@medicare.vn</a> hoặc hotline 1900-xxxx
                  </Text>
                </Card>
              </Card>

              {/* Cookies */}
              <Card id="cookies">
                <Title level={3}>
                  <SettingOutlined style={{ color: "#faad14", marginRight: 8 }} />
                  Cookies và công nghệ theo dõi
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Chúng tôi sử dụng cookies và các công nghệ tương tự để cải thiện trải nghiệm người dùng:
                </Paragraph>

                <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                  <Col span={24}>
                    <Card size="small" style={{ background: "#fffbe6" }}>
                      <Text strong>Cookies cần thiết:</Text> Đảm bảo website hoạt động đúng, quản lý phiên đăng nhập
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card size="small" style={{ background: "#f6ffed" }}>
                      <Text strong>Cookies chức năng:</Text> Ghi nhớ tùy chọn và cài đặt của bạn
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card size="small" style={{ background: "#e6f7ff" }}>
                      <Text strong>Cookies phân tích:</Text> Thu thập dữ liệu thống kê để cải thiện dịch vụ (ẩn danh)
                    </Card>
                  </Col>
                </Row>

                <Paragraph style={{ fontSize: 15, marginTop: 20 }}>
                  Bạn có thể quản lý cookies thông qua cài đặt trình duyệt. Lưu ý rằng việc vô hiệu hóa cookies có thể ảnh hưởng đến chức năng của website.
                </Paragraph>
              </Card>

              {/* Contact */}
              <Card id="contact">
                <Title level={3}>
                  <MailOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                  Liên hệ
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào về Chính sách bảo mật này, vui lòng liên hệ với chúng tôi:
                </Paragraph>

                <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
                  <Col xs={24} md={8}>
                    <Card size="small" style={{ textAlign: "center" }}>
                      <PhoneOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 12 }} />
                      <br />
                      <Text strong>Hotline</Text>
                      <br />
                      <Text>1900-xxxx</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card size="small" style={{ textAlign: "center" }}>
                      <MailOutlined style={{ fontSize: 32, color: "#1890ff", marginBottom: 12 }} />
                      <br />
                      <Text strong>Email</Text>
                      <br />
                      <Text>privacy@medicare.vn</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card size="small" style={{ textAlign: "center" }}>
                      <EnvironmentOutlined style={{ fontSize: 32, color: "#fa8c16", marginBottom: 12 }} />
                      <br />
                      <Text strong>Địa chỉ</Text>
                      <br />
                      <Text>123 Đường ABC, Q.XYZ, TP.HCM</Text>
                    </Card>
                  </Col>
                </Row>
              </Card>

              {/* Last Updated */}
              <Card style={{ background: "#f0f2f5", textAlign: "center" }}>
                <Text type="secondary">
                  Chính sách bảo mật này được cập nhật lần cuối vào ngày 27/11/2024
                  <br />
                  Chúng tôi có thể cập nhật chính sách này theo thời gian. Các thay đổi quan trọng sẽ được thông báo qua email.
                </Text>
              </Card>
            </Space>
          </Col>
        </Row>
      </Content>

      {/* Footer */}
      <Footer
        style={{
          background: "linear-gradient(135deg, #0F5B8C 0%, #1890ff 100%)",
          color: "white",
          padding: "60px 50px 30px",
          marginTop: 60
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

export default PrivacyPolicyPage;
