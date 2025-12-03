import {
    CalendarOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    DownOutlined,
    EnvironmentOutlined,
    FacebookOutlined,
    FileTextOutlined,
    HeartFilled,
    HomeOutlined,
    LinkedinOutlined,
    LockOutlined,
    LogoutOutlined,
    MailOutlined,
    PhoneOutlined,
    ProfileOutlined,
    SearchOutlined,
    SettingOutlined,
    SolutionOutlined,
    TwitterOutlined,
    UserAddOutlined,
    UserOutlined,
    VideoCameraOutlined,
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
    Steps,
    Tag,
    Typography
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const UserGuidePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

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
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            borderRadius: 16,
            marginBottom: 60,
            color: "white"
          }}
        >
          <SolutionOutlined style={{ fontSize: 64, marginBottom: 20 }} />
          <Title level={1} style={{ color: "white", marginBottom: 16 }}>
            Hướng Dẫn Sử Dụng
          </Title>
          <Paragraph style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", marginBottom: 0 }}>
            Hướng dẫn chi tiết cách sử dụng các tính năng của MediCare System
          </Paragraph>
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
                  { key: "overview", href: "#overview", title: "Tổng quan" },
                  { key: "registration", href: "#registration", title: "Đăng ký tài khoản" },
                  { key: "booking", href: "#booking", title: "Đặt lịch khám" },
                  { key: "consultation", href: "#consultation", title: "Tư vấn trực tuyến" },
                  { key: "records", href: "#records", title: "Hồ sơ sức khỏe" },
                  { key: "payment", href: "#payment", title: "Thanh toán" },
                  { key: "account", href: "#account", title: "Quản lý tài khoản" },
                  { key: "support", href: "#support", title: "Hỗ trợ" }
                ]}
              />
            </Card>
          </Col>

          {/* Main Content */}
          <Col xs={24} md={18}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Overview */}
              <Card id="overview">
                <Title level={3}>
                  <HeartFilled style={{ color: "#1890ff", marginRight: 8 }} />
                  Tổng quan về MediCare System
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  MediCare System là nền tảng quản lý y tế toàn diện, kết nối bệnh nhân với các cơ sở y tế 
                  và bác sĩ chuyên khoa. Hệ thống cung cấp đầy đủ các tính năng từ đặt lịch khám, quản lý 
                  hồ sơ bệnh án điện tử, tư vấn trực tuyến đến thanh toán và theo dõi lịch sử khám chữa bệnh.
                </Paragraph>

                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                  <Col xs={24} sm={12} md={6}>
                    <Card size="small" style={{ textAlign: "center", background: "#f0f9ff" }}>
                      <CalendarOutlined style={{ fontSize: 32, color: "#1890ff", marginBottom: 12 }} />
                      <br />
                      <Text strong>Đặt lịch dễ dàng</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card size="small" style={{ textAlign: "center", background: "#f6ffed" }}>
                      <FileTextOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 12 }} />
                      <br />
                      <Text strong>Hồ sơ điện tử</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card size="small" style={{ textAlign: "center", background: "#fff7e6" }}>
                      <VideoCameraOutlined style={{ fontSize: 32, color: "#fa8c16", marginBottom: 12 }} />
                      <br />
                      <Text strong>Tư vấn online</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card size="small" style={{ textAlign: "center", background: "#f9f0ff" }}>
                      <DollarOutlined style={{ fontSize: 32, color: "#722ed1", marginBottom: 12 }} />
                      <br />
                      <Text strong>Thanh toán nhanh</Text>
                    </Card>
                  </Col>
                </Row>
              </Card>

              {/* Registration */}
              <Card id="registration">
                <Title level={3}>
                  <UserAddOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                  Hướng dẫn đăng ký tài khoản
                </Title>
                <Paragraph style={{ fontSize: 15, marginBottom: 24 }}>
                  Làm theo các bước sau để tạo tài khoản MediCare:
                </Paragraph>

                <Steps
                  direction="vertical"
                  current={currentStep}
                  items={[
                    {
                      title: "Truy cập trang đăng ký",
                      description: (
                        <div style={{ marginTop: 12 }}>
                          <Paragraph>
                            Nhấn vào nút <Tag color="blue">Đăng ký</Tag> ở góc trên bên phải hoặc truy cập trực tiếp 
                            tại <a href="/register">medicare.vn/register</a>
                          </Paragraph>
                        </div>
                      ),
                      icon: <HomeOutlined />
                    },
                    {
                      title: "Điền thông tin cá nhân",
                      description: (
                        <div style={{ marginTop: 12 }}>
                          <Paragraph>Cung cấp các thông tin bắt buộc:</Paragraph>
                          <ul style={{ marginTop: 8 }}>
                            <li>Họ và tên đầy đủ</li>
                            <li>Số điện thoại (sẽ dùng để đăng nhập)</li>
                            <li>Email liên hệ</li>
                            <li>Ngày sinh và giới tính</li>
                            <li>Địa chỉ</li>
                          </ul>
                        </div>
                      ),
                      icon: <ProfileOutlined />
                    },
                    {
                      title: "Tạo mật khẩu",
                      description: (
                        <div style={{ marginTop: 12 }}>
                          <Paragraph>Tạo mật khẩu mạnh với các yêu cầu:</Paragraph>
                          <ul style={{ marginTop: 8 }}>
                            <li>Tối thiểu 8 ký tự</li>
                            <li>Có chữ hoa, chữ thường</li>
                            <li>Có số và ký tự đặc biệt</li>
                            <li>Không chứa thông tin cá nhân</li>
                          </ul>
                          <Card size="small" style={{ marginTop: 12, background: "#e6f7ff" }}>
                            <Text strong>💡 Mẹo:</Text> Sử dụng cụm từ dễ nhớ nhưng khó đoán
                          </Card>
                        </div>
                      ),
                      icon: <LockOutlined />
                    },
                    {
                      title: "Xác thực tài khoản",
                      description: (
                        <div style={{ marginTop: 12 }}>
                          <Paragraph>
                            Hệ thống sẽ gửi mã OTP qua SMS đến số điện thoại của bạn. 
                            Nhập mã để xác thực và hoàn tất đăng ký.
                          </Paragraph>
                          <Card size="small" style={{ marginTop: 12, background: "#fff7e6" }}>
                            <Text>⚠️ Mã OTP có hiệu lực trong 5 phút</Text>
                          </Card>
                        </div>
                      ),
                      icon: <CheckCircleOutlined />
                    }
                  ]}
                />

                <Card size="small" style={{ marginTop: 24, background: "#f6ffed", borderColor: "#b7eb8f" }}>
                  <Text strong>✅ Hoàn tất!</Text>
                  <br />
                  <Text>
                    Sau khi đăng ký thành công, bạn có thể đăng nhập và bắt đầu sử dụng các dịch vụ của MediCare.
                  </Text>
                </Card>
              </Card>

              {/* Booking Appointments */}
              <Card id="booking">
                <Title level={3}>
                  <CalendarOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                  Hướng dẫn đặt lịch khám
                </Title>
                <Paragraph style={{ fontSize: 15, marginBottom: 24 }}>
                  Đặt lịch khám bệnh trực tuyến nhanh chóng chỉ với 4 bước đơn giản:
                </Paragraph>

                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Card size="small">
                      <Space>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "#1890ff",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold"
                          }}
                        >
                          1
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text strong>Chọn chuyên khoa hoặc bác sĩ</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Tìm kiếm theo tên bác sĩ, chuyên khoa hoặc triệu chứng
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card size="small">
                      <Space>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "#52c41a",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold"
                          }}
                        >
                          2
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text strong>Chọn ngày và giờ khám</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Xem lịch trống và chọn thời gian phù hợp
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card size="small">
                      <Space>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "#fa8c16",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold"
                          }}
                        >
                          3
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text strong>Điền thông tin khám bệnh</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Mô tả triệu chứng và tiền sử bệnh (nếu có)
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card size="small">
                      <Space>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "#722ed1",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold"
                          }}
                        >
                          4
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text strong>Xác nhận và thanh toán</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Kiểm tra thông tin và hoàn tất đặt lịch
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Title level={5}>Lưu ý quan trọng</Title>
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <Card size="small" style={{ background: "#e6f7ff" }}>
                    ℹ️ Đến trước 15 phút để làm thủ tục
                  </Card>
                  <Card size="small" style={{ background: "#f6ffed" }}>
                    ✅ Mang theo CMND/CCCD và thẻ bảo hiểm y tế (nếu có)
                  </Card>
                  <Card size="small" style={{ background: "#fff7e6" }}>
                    ⏰ Hủy lịch trước 24h để không mất phí
                  </Card>
                  <Card size="small" style={{ background: "#f9f0ff" }}>
                    📱 Bạn sẽ nhận được SMS/Email xác nhận lịch hẹn
                  </Card>
                </Space>
              </Card>

              {/* Online Consultation */}
              <Card id="consultation">
                <Title level={3}>
                  <VideoCameraOutlined style={{ color: "#fa8c16", marginRight: 8 }} />
                  Hướng dẫn tư vấn trực tuyến
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Tư vấn sức khỏe từ xa với bác sĩ qua video call:
                </Paragraph>

                <Title level={5} style={{ marginTop: 20 }}>Chuẩn bị trước buổi tư vấn</Title>
                <ul style={{ fontSize: 15, lineHeight: 1.8 }}>
                  <li>Kiểm tra kết nối internet ổn định</li>
                  <li>Chuẩn bị camera và micro hoạt động tốt</li>
                  <li>Sẵn sàng các kết quả xét nghiệm/chẩn đoán hình ảnh (nếu có)</li>
                  <li>Chuẩn bị danh sách thuốc đang dùng</li>
                  <li>Tìm không gian yên tĩnh, riêng tư</li>
                </ul>

                <Title level={5} style={{ marginTop: 20 }}>Trong buổi tư vấn</Title>
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col span={24}>
                    <Card size="small" style={{ background: "#f0f9ff" }}>
                      <Text strong>1. Tham gia phòng chờ:</Text> Click vào link được gửi qua email/SMS trước 5 phút
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card size="small" style={{ background: "#f6ffed" }}>
                      <Text strong>2. Bật camera và micro:</Text> Đảm bảo bác sĩ có thể nhìn và nghe rõ
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card size="small" style={{ background: "#fff7e6" }}>
                      <Text strong>3. Mô tả triệu chứng:</Text> Nói rõ về các triệu chứng, thời gian xuất hiện
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card size="small" style={{ background: "#f9f0ff" }}>
                      <Text strong>4. Chia sẻ tài liệu:</Text> Upload kết quả xét nghiệm nếu bác sĩ yêu cầu
                    </Card>
                  </Col>
                </Row>

                <Title level={5} style={{ marginTop: 20 }}>Sau buổi tư vấn</Title>
                <Space direction="vertical" size="small" style={{ width: "100%", marginTop: 16 }}>
                  <Text>✓ Nhận đơn thuốc điện tử (nếu có)</Text>
                  <Text>✓ Xem lại nội dung tư vấn trong hồ sơ</Text>
                  <Text>✓ Đặt lịch tái khám nếu cần</Text>
                  <Text>✓ Đánh giá chất lượng dịch vụ</Text>
                </Space>
              </Card>

              {/* Medical Records */}
              <Card id="records">
                <Title level={3}>
                  <FileTextOutlined style={{ color: "#722ed1", marginRight: 8 }} />
                  Quản lý hồ sơ sức khỏe điện tử
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Hồ sơ sức khỏe điện tử của bạn bao gồm:
                </Paragraph>

                <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                  <Col xs={24} md={12}>
                    <Card>
                      <Title level={5}>
                        <ProfileOutlined style={{ color: "#1890ff" }} /> Thông tin cá nhân
                      </Title>
                      <ul style={{ fontSize: 14 }}>
                        <li>Thông tin cơ bản (họ tên, ngày sinh, địa chỉ)</li>
                        <li>Tiền sử bệnh và dị ứng</li>
                        <li>Nhóm máu và chỉ số sinh học</li>
                        <li>Thông tin liên hệ khẩn cấp</li>
                      </ul>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card>
                      <Title level={5}>
                        <CalendarOutlined style={{ color: "#52c41a" }} /> Lịch sử khám bệnh
                      </Title>
                      <ul style={{ fontSize: 14 }}>
                        <li>Danh sách các lần khám</li>
                        <li>Chẩn đoán và kết quả điều trị</li>
                        <li>Đơn thuốc và hướng dẫn dùng</li>
                        <li>Ghi chú của bác sĩ</li>
                      </ul>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card>
                      <Title level={5}>
                        <SearchOutlined style={{ color: "#fa8c16" }} /> Kết quả xét nghiệm
                      </Title>
                      <ul style={{ fontSize: 14 }}>
                        <li>Xét nghiệm máu, nước tiểu</li>
                        <li>Xét nghiệm vi sinh, hóa sinh</li>
                        <li>Biểu đồ theo dõi chỉ số</li>
                        <li>Xu hướng thay đổi sức khỏe</li>
                      </ul>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card>
                      <Title level={5}>
                        <FileTextOutlined style={{ color: "#722ed1" }} /> Hình ảnh y tế
                      </Title>
                      <ul style={{ fontSize: 14 }}>
                        <li>X-quang, CT, MRI</li>
                        <li>Siêu âm</li>
                        <li>Nội soi</li>
                        <li>Ảnh chụp vết thương/da liễu</li>
                      </ul>
                    </Card>
                  </Col>
                </Row>

                <Card size="small" style={{ marginTop: 20, background: "#e6f7ff" }}>
                  <Text strong>💡 Mẹo:</Text> Thường xuyên cập nhật thông tin để bác sĩ có cái nhìn toàn diện về sức khỏe của bạn
                </Card>
              </Card>

              {/* Payment */}
              <Card id="payment">
                <Title level={3}>
                  <DollarOutlined style={{ color: "#13c2c2", marginRight: 8 }} />
                  Hướng dẫn thanh toán
                </Title>

                <Title level={5}>Phương thức thanh toán</Title>
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col xs={24} sm={12}>
                    <Card size="small" style={{ background: "#f0f9ff" }}>
                      <DollarOutlined style={{ fontSize: 24, color: "#1890ff", marginRight: 12 }} />
                      <Text strong>Thẻ tín dụng/ghi nợ</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Visa, MasterCard, JCB
                      </Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card size="small" style={{ background: "#f6ffed" }}>
                      <PhoneOutlined style={{ fontSize: 24, color: "#52c41a", marginRight: 12 }} />
                      <Text strong>Ví điện tử</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        MoMo, ZaloPay, VNPay
                      </Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card size="small" style={{ background: "#fff7e6" }}>
                      <MailOutlined style={{ fontSize: 24, color: "#fa8c16", marginRight: 12 }} />
                      <Text strong>Chuyển khoản</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Internet Banking
                      </Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card size="small" style={{ background: "#f9f0ff" }}>
                      <EnvironmentOutlined style={{ fontSize: 24, color: "#722ed1", marginRight: 12 }} />
                      <Text strong>Tại quầy</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Tiền mặt hoặc quẹt thẻ
                      </Text>
                    </Card>
                  </Col>
                </Row>

                <Title level={5} style={{ marginTop: 24 }}>Quy trình thanh toán online</Title>
                <ol style={{ fontSize: 15, lineHeight: 1.8 }}>
                  <li>Chọn dịch vụ và xác nhận thông tin</li>
                  <li>Chọn phương thức thanh toán</li>
                  <li>Nhập thông tin thẻ/tài khoản (nếu cần)</li>
                  <li>Xác thực OTP từ ngân hàng</li>
                  <li>Nhận hóa đơn điện tử qua email</li>
                </ol>

                <Card size="small" style={{ marginTop: 16, background: "#fff1f0", borderColor: "#ffa39e" }}>
                  <Text strong>🔒 Bảo mật:</Text> Tất cả giao dịch được mã hóa SSL 256-bit
                </Card>
              </Card>

              {/* Account Management */}
              <Card id="account">
                <Title level={3}>
                  <SettingOutlined style={{ color: "#faad14", marginRight: 8 }} />
                  Quản lý tài khoản
                </Title>

                <Row gutter={[24, 24]}>
                  <Col xs={24} md={8}>
                    <Card>
                      <Title level={5}>
                        <UserOutlined /> Cập nhật thông tin
                      </Title>
                      <Paragraph style={{ fontSize: 14 }}>
                        Vào <Text strong>Hồ sơ cá nhân</Text> để cập nhật:
                      </Paragraph>
                      <ul style={{ fontSize: 14 }}>
                        <li>Thông tin liên lạc</li>
                        <li>Ảnh đại diện</li>
                        <li>Địa chỉ</li>
                        <li>Tiền sử bệnh</li>
                      </ul>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card>
                      <Title level={5}>
                        <LockOutlined /> Đổi mật khẩu
                      </Title>
                      <Paragraph style={{ fontSize: 14 }}>
                        Bước thực hiện:
                      </Paragraph>
                      <ol style={{ fontSize: 14 }}>
                        <li>Nhập mật khẩu hiện tại</li>
                        <li>Nhập mật khẩu mới</li>
                        <li>Xác nhận mật khẩu mới</li>
                        <li>Lưu thay đổi</li>
                      </ol>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card>
                      <Title level={5}>
                        <SettingOutlined /> Cài đặt bảo mật
                      </Title>
                      <Paragraph style={{ fontSize: 14 }}>
                        Các tùy chọn bảo mật:
                      </Paragraph>
                      <ul style={{ fontSize: 14 }}>
                        <li>Xác thực 2 yếu tố</li>
                        <li>Quản lý phiên đăng nhập</li>
                        <li>Nhật ký hoạt động</li>
                        <li>Quyền riêng tư</li>
                      </ul>
                    </Card>
                  </Col>
                </Row>
              </Card>

              {/* Support */}
              <Card id="support">
                <Title level={3}>
                  <PhoneOutlined style={{ color: "#eb2f96", marginRight: 8 }} />
                  Hỗ trợ khách hàng
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn:
                </Paragraph>

                <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
                  <Col xs={24} md={8}>
                    <Card style={{ textAlign: "center", background: "#f0f9ff" }}>
                      <PhoneOutlined style={{ fontSize: 40, color: "#1890ff", marginBottom: 16 }} />
                      <Title level={5}>Hotline 24/7</Title>
                      <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                        1900-xxxx
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Miễn phí cuộc gọi
                      </Text>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card style={{ textAlign: "center", background: "#f6ffed" }}>
                      <MailOutlined style={{ fontSize: 40, color: "#52c41a", marginBottom: 16 }} />
                      <Title level={5}>Email hỗ trợ</Title>
                      <Text strong style={{ fontSize: 16, color: "#52c41a" }}>
                        support@medicare.vn
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Phản hồi trong 24h
                      </Text>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card style={{ textAlign: "center", background: "#fff7e6" }}>
                      <VideoCameraOutlined style={{ fontSize: 40, color: "#fa8c16", marginBottom: 16 }} />
                      <Title level={5}>Live Chat</Title>
                      <Text strong style={{ fontSize: 16, color: "#fa8c16" }}>
                        Chat trực tuyến
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        8h - 22h hàng ngày
                      </Text>
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Title level={5}>Câu hỏi thường gặp</Title>
                <Paragraph style={{ fontSize: 15 }}>
                  Tham khảo trang <a onClick={() => navigate("/faq")} style={{ cursor: "pointer" }}>
                    <strong>Câu hỏi thường gặp (FAQ)</strong>
                  </a> để tìm câu trả lời nhanh cho các thắc mắc phổ biến.
                </Paragraph>
              </Card>

              {/* Quick Tips */}
              <Card style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                <Title level={4} style={{ color: "white" }}>
                  💡 Mẹo sử dụng hiệu quả
                </Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card size="small" style={{ background: "rgba(255,255,255,0.2)", border: "none" }}>
                      <Text style={{ color: "white" }}>
                        ✓ Bật thông báo để không bỏ lỡ lịch hẹn
                      </Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" style={{ background: "rgba(255,255,255,0.2)", border: "none" }}>
                      <Text style={{ color: "white" }}>
                        ✓ Cập nhật hồ sơ đầy đủ để được tư vấn tốt hơn
                      </Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" style={{ background: "rgba(255,255,255,0.2)", border: "none" }}>
                      <Text style={{ color: "white" }}>
                        ✓ Lưu kết quả xét nghiệm để theo dõi sức khỏe
                      </Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" style={{ background: "rgba(255,255,255,0.2)", border: "none" }}>
                      <Text style={{ color: "white" }}>
                        ✓ Đánh giá sau mỗi lần khám để cải thiện dịch vụ
                      </Text>
                    </Card>
                  </Col>
                </Row>
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

export default UserGuidePage;
