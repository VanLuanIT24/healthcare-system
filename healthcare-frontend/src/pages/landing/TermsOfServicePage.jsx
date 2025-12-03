import {
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DownOutlined,
    EnvironmentOutlined,
    ExclamationCircleOutlined,
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
    SafetyCertificateOutlined,
    SettingOutlined,
    TwitterOutlined,
    UserOutlined,
    WarningOutlined,
    YoutubeOutlined
} from "@ant-design/icons";
import {
    Alert,
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
    Table,
    Tag,
    Typography
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const TermsOfServicePage = () => {
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

  // Prohibited activities table
  const prohibitedActivities = [
    {
      key: "1",
      activity: "Cung cấp thông tin sai lệch",
      consequence: "Đình chỉ tài khoản",
      severity: "Cao"
    },
    {
      key: "2",
      activity: "Sử dụng tài khoản của người khác",
      consequence: "Khóa tài khoản vĩnh viễn",
      severity: "Rất cao"
    },
    {
      key: "3",
      activity: "Spam hoặc quảng cáo trái phép",
      consequence: "Cảnh cáo hoặc khóa tài khoản",
      severity: "Trung bình"
    },
    {
      key: "4",
      activity: "Tấn công hoặc lạm dụng hệ thống",
      consequence: "Khóa tài khoản + báo cáo pháp lý",
      severity: "Rất cao"
    },
    {
      key: "5",
      activity: "Chia sẻ thông tin y tế của người khác",
      consequence: "Khóa tài khoản + trách nhiệm pháp lý",
      severity: "Rất cao"
    }
  ];

  const columns = [
    {
      title: "Hành vi bị cấm",
      dataIndex: "activity",
      key: "activity"
    },
    {
      title: "Hậu quả",
      dataIndex: "consequence",
      key: "consequence"
    },
    {
      title: "Mức độ nghiêm trọng",
      dataIndex: "severity",
      key: "severity",
      render: (severity) => {
        let color = "green";
        if (severity === "Rất cao") color = "red";
        else if (severity === "Cao") color = "orange";
        else if (severity === "Trung bình") color = "gold";
        return <Tag color={color}>{severity}</Tag>;
      }
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
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: 16,
            marginBottom: 60,
            color: "white"
          }}
        >
          <FileTextOutlined style={{ fontSize: 64, marginBottom: 20 }} />
          <Title level={1} style={{ color: "white", marginBottom: 16 }}>
            Điều Khoản Sử Dụng
          </Title>
          <Paragraph style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", marginBottom: 0 }}>
            Các quy định và điều khoản khi sử dụng dịch vụ MediCare System
          </Paragraph>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
            Có hiệu lực từ: 01/01/2024 | Cập nhật: 27/11/2024
          </Text>
        </div>

        <Alert
          message="Quan trọng"
          description="Bằng việc đăng ký và sử dụng dịch vụ MediCare, bạn đồng ý tuân thủ tất cả các điều khoản và điều kiện được nêu dưới đây. Vui lòng đọc kỹ trước khi sử dụng."
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 40 }}
        />

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
                  { key: "acceptance", href: "#acceptance", title: "Chấp nhận điều khoản" },
                  { key: "account", href: "#account", title: "Tài khoản người dùng" },
                  { key: "services", href: "#services", title: "Sử dụng dịch vụ" },
                  { key: "prohibited", href: "#prohibited", title: "Hành vi bị cấm" },
                  { key: "medical", href: "#medical", title: "Trách nhiệm y tế" },
                  { key: "payment", href: "#payment", title: "Thanh toán" },
                  { key: "liability", href: "#liability", title: "Trách nhiệm pháp lý" },
                  { key: "termination", href: "#termination", title: "Chấm dứt dịch vụ" },
                  { key: "changes", href: "#changes", title: "Thay đổi điều khoản" }
                ]}
              />
            </Card>
          </Col>

          {/* Main Content */}
          <Col xs={24} md={18}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Acceptance */}
              <Card id="acceptance">
                <Title level={3}>
                  <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                  1. Chấp nhận điều khoản
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Các Điều khoản Dịch vụ này ("Điều khoản") là một thỏa thuận ràng buộc pháp lý giữa bạn và 
                  MediCare System. Bằng cách truy cập hoặc sử dụng nền tảng, website, ứng dụng di động hoặc 
                  các dịch vụ của chúng tôi, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các 
                  Điều khoản này.
                </Paragraph>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Nếu bạn không đồng ý với bất kỳ phần nào của các Điều khoản này, bạn không được phép sử dụng 
                  dịch vụ của chúng tôi.
                </Paragraph>

                <Card size="small" style={{ marginTop: 16, background: "#f6ffed", borderColor: "#b7eb8f" }}>
                  <Space>
                    <CheckCircleOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                    <div>
                      <Text strong>Điều kiện sử dụng:</Text>
                      <br />
                      <Text style={{ fontSize: 13 }}>
                        Bạn phải từ đủ 16 tuổi trở lên hoặc có sự giám sát của người giám hộ hợp pháp để sử dụng dịch vụ này.
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Card>

              {/* Account */}
              <Card id="account">
                <Title level={3}>
                  <UserOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                  2. Tài khoản người dùng
                </Title>

                <Title level={5}>2.1. Đăng ký tài khoản</Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Để sử dụng đầy đủ các tính năng của MediCare, bạn cần tạo một tài khoản. Bạn cam kết:
                </Paragraph>
                <ul style={{ fontSize: 15, lineHeight: 1.8 }}>
                  <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
                  <li>Duy trì tính bảo mật của mật khẩu và thông tin đăng nhập</li>
                  <li>Thông báo ngay cho chúng tôi về bất kỳ việc sử dụng trái phép nào</li>
                  <li>Chịu trách nhiệm về tất cả hoạt động diễn ra dưới tài khoản của bạn</li>
                </ul>

                <Title level={5} style={{ marginTop: 24 }}>2.2. Bảo mật tài khoản</Title>
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col xs={24} md={12}>
                    <Card size="small" style={{ background: "#e6f7ff" }}>
                      <CheckCircleOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                      <Text strong>Nên làm:</Text>
                      <ul style={{ marginTop: 8, fontSize: 13 }}>
                        <li>Sử dụng mật khẩu mạnh</li>
                        <li>Đăng xuất sau mỗi phiên</li>
                        <li>Bật xác thực hai yếu tố</li>
                        <li>Cập nhật thông tin định kỳ</li>
                      </ul>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" style={{ background: "#fff1f0" }}>
                      <CloseCircleOutlined style={{ color: "#f5222d", marginRight: 8 }} />
                      <Text strong>Không nên làm:</Text>
                      <ul style={{ marginTop: 8, fontSize: 13 }}>
                        <li>Chia sẻ tài khoản</li>
                        <li>Sử dụng mật khẩu đơn giản</li>
                        <li>Lưu mật khẩu trên thiết bị chung</li>
                        <li>Truy cập từ mạng không an toàn</li>
                      </ul>
                    </Card>
                  </Col>
                </Row>

                <Title level={5} style={{ marginTop: 24 }}>2.3. Quyền của tài khoản</Title>
                <Paragraph style={{ fontSize: 15 }}>
                  Chúng tôi có quyền đình chỉ hoặc chấm dứt tài khoản của bạn nếu:
                </Paragraph>
                <Space direction="vertical" size="small" style={{ width: "100%", marginTop: 12 }}>
                  <Text>• Vi phạm bất kỳ điều khoản nào trong thỏa thuận này</Text>
                  <Text>• Cung cấp thông tin sai lệch hoặc gian lận</Text>
                  <Text>• Không thanh toán đầy đủ các dịch vụ đã sử dụng</Text>
                  <Text>• Có hành vi gây hại đến hệ thống hoặc người dùng khác</Text>
                </Space>
              </Card>

              {/* Services Usage */}
              <Card id="services">
                <Title level={3}>
                  <SafetyCertificateOutlined style={{ color: "#722ed1", marginRight: 8 }} />
                  3. Sử dụng dịch vụ
                </Title>

                <Title level={5}>3.1. Phạm vi dịch vụ</Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  MediCare cung cấp nền tảng kết nối giữa bệnh nhân và các cơ sở y tế, bao gồm:
                </Paragraph>
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col xs={24} sm={12} md={6}>
                    <Card size="small" style={{ textAlign: "center", background: "#f0f9ff" }}>
                      <CalendarOutlined style={{ fontSize: 32, color: "#1890ff", marginBottom: 8 }} />
                      <br />
                      <Text strong>Đặt lịch khám</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card size="small" style={{ textAlign: "center", background: "#f6ffed" }}>
                      <FileTextOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 8 }} />
                      <br />
                      <Text strong>Hồ sơ điện tử</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card size="small" style={{ textAlign: "center", background: "#fff7e6" }}>
                      <MailOutlined style={{ fontSize: 32, color: "#fa8c16", marginBottom: 8 }} />
                      <br />
                      <Text strong>Tư vấn trực tuyến</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card size="small" style={{ textAlign: "center", background: "#f9f0ff" }}>
                      <ProfileOutlined style={{ fontSize: 32, color: "#722ed1", marginBottom: 8 }} />
                      <br />
                      <Text strong>Xét nghiệm</Text>
                    </Card>
                  </Col>
                </Row>

                <Title level={5} style={{ marginTop: 24 }}>3.2. Quy định sử dụng</Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Khi sử dụng dịch vụ, bạn đồng ý:
                </Paragraph>
                <ul style={{ fontSize: 15, lineHeight: 1.8 }}>
                  <li>Cung cấp thông tin y tế chính xác và trung thực</li>
                  <li>Tuân thủ hướng dẫn và chỉ định của bác sĩ</li>
                  <li>Đến đúng giờ cho các cuộc hẹn đã đặt</li>
                  <li>Thông báo trước khi hủy hoặc đổi lịch hẹn</li>
                  <li>Tôn trọng đội ngũ y tế và bệnh nhân khác</li>
                </ul>

                <Alert
                  message="Lưu ý quan trọng"
                  description="MediCare là nền tảng kết nối, không phải cơ sở y tế. Chúng tôi không thay thế cho khám bệnh trực tiếp và không chịu trách nhiệm về quyết định y tế."
                  type="info"
                  showIcon
                  style={{ marginTop: 20 }}
                />
              </Card>

              {/* Prohibited Activities */}
              <Card id="prohibited">
                <Title level={3}>
                  <WarningOutlined style={{ color: "#f5222d", marginRight: 8 }} />
                  4. Hành vi bị cấm
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
                  Bạn không được phép thực hiện các hành vi sau đây khi sử dụng dịch vụ của chúng tôi:
                </Paragraph>

                <Table
                  columns={columns}
                  dataSource={prohibitedActivities}
                  pagination={false}
                  bordered
                  size="small"
                />

                <Card size="small" style={{ marginTop: 20, background: "#fff1f0", borderColor: "#ffa39e" }}>
                  <Space>
                    <ExclamationCircleOutlined style={{ fontSize: 20, color: "#f5222d" }} />
                    <div>
                      <Text strong>Cảnh báo pháp lý:</Text>
                      <br />
                      <Text style={{ fontSize: 13 }}>
                        Các hành vi vi phạm nghiêm trọng có thể bị truy cứu trách nhiệm pháp lý theo quy định của pháp luật Việt Nam.
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Card>

              {/* Medical Responsibility */}
              <Card id="medical">
                <Title level={3}>
                  <SafetyCertificateOutlined style={{ color: "#13c2c2", marginRight: 8 }} />
                  5. Trách nhiệm y tế
                </Title>

                <Title level={5}>5.1. Trách nhiệm của bệnh nhân</Title>
                <ul style={{ fontSize: 15, lineHeight: 1.8 }}>
                  <li>Cung cấp thông tin y tế đầy đủ, chính xác về tiền sử bệnh, dị ứng, thuốc đang dùng</li>
                  <li>Tuân thủ chỉ định điều trị và uống thuốc theo đơn của bác sĩ</li>
                  <li>Thông báo ngay nếu có tác dụng phụ hoặc triệu chứng bất thường</li>
                  <li>Đến tái khám đúng lịch hẹn</li>
                </ul>

                <Title level={5} style={{ marginTop: 24 }}>5.2. Trách nhiệm của MediCare</Title>
                <ul style={{ fontSize: 15, lineHeight: 1.8 }}>
                  <li>Đảm bảo nền tảng hoạt động ổn định và bảo mật</li>
                  <li>Kết nối với các cơ sở y tế và bác sĩ có chứng chỉ hành nghề hợp lệ</li>
                  <li>Bảo vệ thông tin cá nhân và dữ liệu y tế của bạn</li>
                  <li>Hỗ trợ giải quyết khiếu nại và tranh chấp</li>
                </ul>

                <Title level={5} style={{ marginTop: 24 }}>5.3. Giới hạn trách nhiệm</Title>
                <Alert
                  message="Miễn trừ trách nhiệm"
                  description={
                    <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                      <li>MediCare không chịu trách nhiệm về chất lượng dịch vụ y tế từ các cơ sở y tế đối tác</li>
                      <li>Không chịu trách nhiệm về kết quả điều trị hoặc các quyết định y tế của bác sĩ</li>
                      <li>Không chịu trách nhiệm về việc bệnh nhân không tuân thủ hướng dẫn điều trị</li>
                      <li>Không thay thế cho khám bệnh trực tiếp trong trường hợp cấp cứu</li>
                    </ul>
                  }
                  type="warning"
                  showIcon
                />
              </Card>

              {/* Payment */}
              <Card id="payment">
                <Title level={3}>
                  <ProfileOutlined style={{ color: "#faad14", marginRight: 8 }} />
                  6. Thanh toán và hoàn tiền
                </Title>

                <Title level={5}>6.1. Phương thức thanh toán</Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Chúng tôi chấp nhận các phương thức thanh toán sau:
                </Paragraph>
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col span={24}>
                    <Card size="small" style={{ background: "#f0f9ff" }}>
                      ✓ Thẻ tín dụng/ghi nợ (Visa, MasterCard, JCB)
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card size="small" style={{ background: "#f6ffed" }}>
                      ✓ Ví điện tử (MoMo, ZaloPay, VNPay)
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card size="small" style={{ background: "#fff7e6" }}>
                      ✓ Chuyển khoản ngân hàng
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card size="small" style={{ background: "#f9f0ff" }}>
                      ✓ Thanh toán tại quầy (đối với dịch vụ trực tiếp)
                    </Card>
                  </Col>
                </Row>

                <Title level={5} style={{ marginTop: 24 }}>6.2. Chính sách hoàn tiền</Title>
                <ul style={{ fontSize: 15, lineHeight: 1.8 }}>
                  <li><Text strong>Hủy trước 24h:</Text> Hoàn 100% phí đặt lịch</li>
                  <li><Text strong>Hủy trong 12-24h:</Text> Hoàn 50% phí đặt lịch</li>
                  <li><Text strong>Hủy dưới 12h:</Text> Không hoàn phí</li>
                  <li><Text strong>Không đến khám:</Text> Mất toàn bộ phí đã thanh toán</li>
                </ul>

                <Card size="small" style={{ marginTop: 16, background: "#e6f7ff" }}>
                  <Text>
                    <strong>Thời gian xử lý hoàn tiền:</strong> 5-7 ngày làm việc kể từ khi yêu cầu được chấp thuận
                  </Text>
                </Card>
              </Card>

              {/* Liability */}
              <Card id="liability">
                <Title level={3}>
                  <ExclamationCircleOutlined style={{ color: "#f5222d", marginRight: 8 }} />
                  7. Giới hạn trách nhiệm pháp lý
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Trong phạm vi tối đa được pháp luật cho phép:
                </Paragraph>
                <ul style={{ fontSize: 15, lineHeight: 1.8 }}>
                  <li>MediCare không chịu trách nhiệm về bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên hoặc do hậu quả phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ</li>
                  <li>Tổng trách nhiệm của chúng tôi trong mọi trường hợp không vượt quá số tiền bạn đã thanh toán cho dịch vụ trong 12 tháng gần nhất</li>
                  <li>Chúng tôi không đảm bảo rằng dịch vụ sẽ không bị gián đoạn, an toàn tuyệt đối hoặc không có lỗi</li>
                </ul>

                <Alert
                  message="Trường hợp khẩn cấp"
                  description="Trong trường hợp khẩn cấp về y tế, vui lòng gọi cấp cứu 115 hoặc đến cơ sở y tế gần nhất ngay lập tức thay vì sử dụng dịch vụ trực tuyến."
                  type="error"
                  showIcon
                  style={{ marginTop: 20 }}
                />
              </Card>

              {/* Termination */}
              <Card id="termination">
                <Title level={3}>
                  <CloseCircleOutlined style={{ color: "#fa8c16", marginRight: 8 }} />
                  8. Chấm dứt dịch vụ
                </Title>

                <Title level={5}>8.1. Chấm dứt từ phía người dùng</Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Bạn có thể ngừng sử dụng và yêu cầu xóa tài khoản bất cứ lúc nào bằng cách:
                </Paragraph>
                <ul style={{ fontSize: 15 }}>
                  <li>Liên hệ với bộ phận hỗ trợ qua email hoặc hotline</li>
                  <li>Hoàn thành mọi nghĩa vụ thanh toán còn tồn đọng</li>
                  <li>Xác nhận yêu cầu xóa tài khoản</li>
                </ul>

                <Title level={5} style={{ marginTop: 24 }}>8.2. Chấm dứt từ phía MediCare</Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Chúng tôi có quyền đình chỉ hoặc chấm dứt tài khoản của bạn ngay lập tức nếu:
                </Paragraph>
                <Space direction="vertical" size="small" style={{ width: "100%", marginTop: 12 }}>
                  <Card size="small" style={{ background: "#fff1f0" }}>
                    <CloseCircleOutlined style={{ color: "#f5222d", marginRight: 8 }} />
                    Vi phạm nghiêm trọng các điều khoản sử dụng
                  </Card>
                  <Card size="small" style={{ background: "#fff1f0" }}>
                    <CloseCircleOutlined style={{ color: "#f5222d", marginRight: 8 }} />
                    Cung cấp thông tin gian lận hoặc sai lệch
                  </Card>
                  <Card size="small" style={{ background: "#fff1f0" }}>
                    <CloseCircleOutlined style={{ color: "#f5222d", marginRight: 8 }} />
                    Có hành vi gây hại đến hệ thống hoặc người dùng khác
                  </Card>
                  <Card size="small" style={{ background: "#fff1f0" }}>
                    <CloseCircleOutlined style={{ color: "#f5222d", marginRight: 8 }} />
                    Không thanh toán các khoản phí đã phát sinh
                  </Card>
                </Space>
              </Card>

              {/* Changes */}
              <Card id="changes">
                <Title level={3}>
                  <SettingOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                  9. Thay đổi điều khoản
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Chúng tôi có quyền sửa đổi hoặc cập nhật các Điều khoản này vào bất kỳ lúc nào. Các thay đổi quan trọng sẽ được thông báo qua:
                </Paragraph>
                <ul style={{ fontSize: 15, lineHeight: 1.8 }}>
                  <li>Email đến địa chỉ email đã đăng ký</li>
                  <li>Thông báo trên website/ứng dụng</li>
                  <li>Tin nhắn SMS (đối với thay đổi quan trọng)</li>
                </ul>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Việc bạn tiếp tục sử dụng dịch vụ sau khi có thông báo thay đổi được coi là bạn đã chấp nhận các điều khoản mới.
                </Paragraph>

                <Card size="small" style={{ marginTop: 16, background: "#f6ffed", borderColor: "#b7eb8f" }}>
                  <Text>
                    <strong>Lưu ý:</strong> Chúng tôi khuyến khích bạn thường xuyên xem lại các Điều khoản này để cập nhật các thay đổi mới nhất.
                  </Text>
                </Card>
              </Card>

              {/* Contact & Legal */}
              <Card>
                <Title level={3}>
                  <MailOutlined style={{ color: "#722ed1", marginRight: 8 }} />
                  10. Liên hệ và pháp lý
                </Title>

                <Title level={5}>10.1. Thông tin liên hệ</Title>
                <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
                  <Col xs={24} md={8}>
                    <Card size="small" style={{ textAlign: "center", background: "#f0f9ff" }}>
                      <PhoneOutlined style={{ fontSize: 32, color: "#1890ff", marginBottom: 12 }} />
                      <br />
                      <Text strong>Hotline</Text>
                      <br />
                      <Text>1900-xxxx</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>24/7</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card size="small" style={{ textAlign: "center", background: "#f6ffed" }}>
                      <MailOutlined style={{ fontSize: 32, color: "#52c41a", marginBottom: 12 }} />
                      <br />
                      <Text strong>Email</Text>
                      <br />
                      <Text>legal@medicare.vn</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>Phản hồi trong 24h</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card size="small" style={{ textAlign: "center", background: "#fff7e6" }}>
                      <EnvironmentOutlined style={{ fontSize: 32, color: "#fa8c16", marginBottom: 12 }} />
                      <br />
                      <Text strong>Địa chỉ</Text>
                      <br />
                      <Text>123 ABC, Q.XYZ, TP.HCM</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>8h-17h (T2-T6)</Text>
                    </Card>
                  </Col>
                </Row>

                <Title level={5} style={{ marginTop: 24 }}>10.2. Luật áp dụng</Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Các Điều khoản này được điều chỉnh bởi và giải thích theo pháp luật Việt Nam. Mọi tranh chấp phát sinh sẽ được giải quyết tại Tòa án có thẩm quyền tại Thành phố Hồ Chí Minh.
                </Paragraph>
              </Card>

              {/* Final Note */}
              <Card style={{ background: "#f0f2f5", textAlign: "center" }}>
                <Title level={5}>Điều khoản này có hiệu lực từ ngày 01/01/2024</Title>
                <Text type="secondary">
                  Cập nhật lần cuối: 27/11/2024
                  <br />
                  Phiên bản: 2.0
                </Text>
                <Divider />
                <Text>
                  Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ MediCare System!
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

export default TermsOfServicePage;
