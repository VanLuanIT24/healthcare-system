import {
    BankOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    DownOutlined,
    EnvironmentOutlined,
    FacebookOutlined,
    HeartFilled,
    HomeOutlined,
    LinkedinOutlined,
    LockOutlined,
    LogoutOutlined,
    MailOutlined,
    MobileOutlined,
    PhoneOutlined,
    ProfileOutlined,
    SafetyCertificateOutlined,
    ShoppingOutlined,
    TwitterOutlined,
    UserOutlined,
    WalletOutlined,
    YoutubeOutlined
} from "@ant-design/icons";
import {
    Alert,
    Anchor,
    Avatar,
    Button,
    Card,
    Col,
    Collapse,
    Divider,
    Dropdown,
    Input,
    Layout,
    Menu,
    Row,
    Space,
    Table,
    Tag,
    Timeline,
    Typography
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const PaymentPolicyPage = () => {
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

  // Service pricing table
  const pricingData = [
    {
      key: "1",
      service: "Khám tổng quát",
      price: "500.000đ",
      insurance: "Có",
      note: "Bao gồm khám lâm sàng + xét nghiệm cơ bản"
    },
    {
      key: "2",
      service: "Khám chuyên khoa",
      price: "300.000 - 500.000đ",
      insurance: "Có",
      note: "Tùy theo chuyên khoa"
    },
    {
      key: "3",
      service: "Tư vấn trực tuyến",
      price: "200.000đ",
      insurance: "Không",
      note: "15-30 phút"
    },
    {
      key: "4",
      service: "Xét nghiệm máu",
      price: "100.000 - 500.000đ",
      insurance: "Có",
      note: "Tùy gói xét nghiệm"
    },
    {
      key: "5",
      service: "Chẩn đoán hình ảnh",
      price: "200.000 - 2.000.000đ",
      insurance: "Có",
      note: "X-quang, CT, MRI"
    }
  ];

  const columns = [
    {
      title: "Dịch vụ",
      dataIndex: "service",
      key: "service",
      width: "25%"
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: "20%",
      render: (text) => <Text strong style={{ color: "#1890ff" }}>{text}</Text>
    },
    {
      title: "Bảo hiểm",
      dataIndex: "insurance",
      key: "insurance",
      width: "15%",
      render: (text) => (
        <Tag color={text === "Có" ? "green" : "orange"}>
          {text}
        </Tag>
      )
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: "40%"
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
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            borderRadius: 16,
            marginBottom: 60,
            color: "white"
          }}
        >
          <DollarOutlined style={{ fontSize: 64, marginBottom: 20 }} />
          <Title level={1} style={{ color: "white", marginBottom: 16 }}>
            Quy Định Thanh Toán
          </Title>
          <Paragraph style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", marginBottom: 0 }}>
            Chính sách và quy định về thanh toán dịch vụ y tế
          </Paragraph>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
            Cập nhật: 27/11/2024
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
                  { key: "methods", href: "#methods", title: "Phương thức thanh toán" },
                  { key: "pricing", href: "#pricing", title: "Bảng giá dịch vụ" },
                  { key: "insurance", href: "#insurance", title: "Bảo hiểm y tế" },
                  { key: "refund", href: "#refund", title: "Hoàn tiền" },
                  { key: "invoices", href: "#invoices", title: "Hóa đơn" },
                  { key: "installment", href: "#installment", title: "Trả góp" },
                  { key: "security", href: "#security", title: "Bảo mật" },
                  { key: "support", href: "#support", title: "Hỗ trợ" }
                ]}
              />
            </Card>
          </Col>

          {/* Main Content */}
          <Col xs={24} md={18}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Payment Methods */}
              <Card id="methods">
                <Title level={3}>
                  <WalletOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                  Phương thức thanh toán
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
                  MediCare hỗ trợ đa dạng các phương thức thanh toán để mang lại sự tiện lợi tối đa cho bạn:
                </Paragraph>

                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Card style={{ height: "100%", background: "#f0f9ff", borderColor: "#91d5ff" }}>
                      <Space align="start">
                        <DollarOutlined style={{ fontSize: 40, color: "#1890ff" }} />
                        <div style={{ flex: 1 }}>
                          <Title level={5}>Thẻ tín dụng / Ghi nợ</Title>
                          <ul style={{ marginTop: 12, paddingLeft: 20 }}>
                            <li>Visa, MasterCard, JCB, American Express</li>
                            <li>Thanh toán an toàn qua cổng payment</li>
                            <li>Xác thực 3D Secure</li>
                            <li>Hỗ trợ thanh toán quốc tế</li>
                          </ul>
                          <Tag color="blue">Phổ biến nhất</Tag>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card style={{ height: "100%", background: "#f6ffed", borderColor: "#b7eb8f" }}>
                      <Space align="start">
                        <MobileOutlined style={{ fontSize: 40, color: "#52c41a" }} />
                        <div style={{ flex: 1 }}>
                          <Title level={5}>Ví điện tử</Title>
                          <ul style={{ marginTop: 12, paddingLeft: 20 }}>
                            <li>MoMo, ZaloPay, VNPay</li>
                            <li>ShopeePay, AirPay</li>
                            <li>Thanh toán nhanh chóng</li>
                            <li>Tích điểm, ưu đãi</li>
                          </ul>
                          <Tag color="green">Nhanh chóng</Tag>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card style={{ height: "100%", background: "#fff7e6", borderColor: "#ffd591" }}>
                      <Space align="start">
                        <BankOutlined style={{ fontSize: 40, color: "#fa8c16" }} />
                        <div style={{ flex: 1 }}>
                          <Title level={5}>Chuyển khoản ngân hàng</Title>
                          <ul style={{ marginTop: 12, paddingLeft: 20 }}>
                            <li>Internet Banking</li>
                            <li>Mobile Banking</li>
                            <li>Chuyển khoản ATM</li>
                            <li>Có mã tham chiếu riêng</li>
                          </ul>
                          <Tag color="orange">An toàn</Tag>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card style={{ height: "100%", background: "#f9f0ff", borderColor: "#d3adf7" }}>
                      <Space align="start">
                        <ShoppingOutlined style={{ fontSize: 40, color: "#722ed1" }} />
                        <div style={{ flex: 1 }}>
                          <Title level={5}>Thanh toán tại quầy</Title>
                          <ul style={{ marginTop: 12, paddingLeft: 20 }}>
                            <li>Tiền mặt</li>
                            <li>Quẹt thẻ</li>
                            <li>QR Code</li>
                            <li>Nhận hóa đơn ngay</li>
                          </ul>
                          <Tag color="purple">Trực tiếp</Tag>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>

                <Alert
                  message="Lưu ý về phí giao dịch"
                  description="Tất cả phương thức thanh toán trên đều KHÔNG THU PHÍ thêm. MediCare chịu toàn bộ phí giao dịch."
                  type="info"
                  showIcon
                  style={{ marginTop: 24 }}
                />
              </Card>

              {/* Pricing Table */}
              <Card id="pricing">
                <Title level={3}>
                  <DollarOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                  Bảng giá dịch vụ
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
                  Bảng giá tham khảo cho các dịch vụ y tế phổ biến:
                </Paragraph>

                <Table
                  columns={columns}
                  dataSource={pricingData}
                  pagination={false}
                  bordered
                  scroll={{ x: 800 }}
                />

                <Card size="small" style={{ marginTop: 20, background: "#fffbe6", borderColor: "#ffe58f" }}>
                  <Space>
                    <SafetyCertificateOutlined style={{ fontSize: 20, color: "#faad14" }} />
                    <div>
                      <Text strong>Cam kết minh bạch giá</Text>
                      <br />
                      <Text style={{ fontSize: 13 }}>
                        Giá dịch vụ được công khai rõ ràng. Không phát sinh chi phí ẩn. 
                        Bạn sẽ được báo giá chi tiết trước khi thực hiện dịch vụ.
                      </Text>
                    </div>
                  </Space>
                </Card>

                <Collapse
                  variant="borderless"
                  style={{ marginTop: 24, background: "#fafafa" }}
                  items={[
                    {
                      key: "1",
                      label: <Text strong>Xem chi tiết các gói khám</Text>,
                      children: (
                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                          <Card size="small">
                            <Text strong>Gói khám sức khỏe cơ bản:</Text> 2.500.000đ
                            <br />
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              Khám lâm sàng + Xét nghiệm máu + X-quang phổi + Siêu âm bụng
                            </Text>
                          </Card>
                          <Card size="small">
                            <Text strong>Gói khám sức khỏe toàn diện:</Text> 5.000.000đ
                            <br />
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              Bao gồm gói cơ bản + Điện tim + Xét nghiệm mở rộng + Tầm soát ung thư
                            </Text>
                          </Card>
                          <Card size="small">
                            <Text strong>Gói khám sức khỏe VIP:</Text> 10.000.000đ
                            <br />
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              Bao gồm toàn diện + CT/MRI + Tư vấn dinh dưỡng + Khám chuyên sâu
                            </Text>
                          </Card>
                        </Space>
                      )
                    }
                  ]}
                />
              </Card>

              {/* Insurance */}
              <Card id="insurance">
                <Title level={3}>
                  <SafetyCertificateOutlined style={{ color: "#722ed1", marginRight: 8 }} />
                  Thanh toán bảo hiểm y tế
                </Title>

                <Alert
                  message="Chấp nhận bảo hiểm y tế"
                  description="MediCare chấp nhận thanh toán qua bảo hiểm y tế bắt buộc và các công ty bảo hiểm tư nhân"
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                  style={{ marginBottom: 24 }}
                />

                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Card>
                      <Title level={5}>
                        <SafetyCertificateOutlined style={{ color: "#1890ff" }} /> 
                        {" "}Bảo hiểm y tế bắt buộc (BHYT)
                      </Title>
                      <Paragraph style={{ fontSize: 14 }}>
                        <Text strong>Quy trình sử dụng BHYT:</Text>
                      </Paragraph>
                      <Timeline
                        items={[
                          {
                            color: "blue",
                            children: "Mang theo thẻ BHYT còn hiệu lực"
                          },
                          {
                            color: "green",
                            children: "Xuất trình thẻ khi đăng ký khám"
                          },
                          {
                            color: "orange",
                            children: "Hệ thống kiểm tra tự động"
                          },
                          {
                            color: "purple",
                            children: "Chi trả phần còn lại (nếu có)"
                          }
                        ]}
                      />
                      <Card size="small" style={{ marginTop: 16, background: "#e6f7ff" }}>
                        <Text strong>Tỷ lệ chi trả:</Text> 80-100% tùy đối tượng
                      </Card>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card>
                      <Title level={5}>
                        <HeartFilled style={{ color: "#52c41a" }} /> 
                        {" "}Bảo hiểm tư nhân
                      </Title>
                      <Paragraph style={{ fontSize: 14 }}>
                        <Text strong>Đối tác bảo hiểm:</Text>
                      </Paragraph>
                      <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        <Card size="small">✓ Bảo Việt</Card>
                        <Card size="small">✓ Prudential</Card>
                        <Card size="small">✓ Manulife</Card>
                        <Card size="small">✓ AIA</Card>
                        <Card size="small">✓ FWD</Card>
                        <Card size="small">✓ MB Ageas Life</Card>
                      </Space>
                      <Card size="small" style={{ marginTop: 16, background: "#f6ffed" }}>
                        <Text>Hỗ trợ thanh toán trực tiếp (cashless)</Text>
                      </Card>
                    </Card>
                  </Col>
                </Row>

                <Card size="small" style={{ marginTop: 24, background: "#fff7e6" }}>
                  <Text strong>📋 Lưu ý:</Text>
                  <ul style={{ marginTop: 8, marginBottom: 0 }}>
                    <li>Kiểm tra giới hạn bảo hiểm trước khi sử dụng dịch vụ</li>
                    <li>Một số dịch vụ có thể không được bảo hiểm chi trả</li>
                    <li>Liên hệ tổng đài để biết chi tiết về quy trình bảo lãnh</li>
                  </ul>
                </Card>
              </Card>

              {/* Refund Policy */}
              <Card id="refund">
                <Title level={3}>
                  <CheckCircleOutlined style={{ color: "#13c2c2", marginRight: 8 }} />
                  Chính sách hoàn tiền
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
                  Chúng tôi cam kết hoàn tiền nhanh chóng và minh bạch theo các điều kiện sau:
                </Paragraph>

                <Row gutter={[24, 24]}>
                  <Col xs={24} md={8}>
                    <Card style={{ textAlign: "center", background: "#f6ffed", height: "100%" }}>
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          background: "#52c41a",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          fontSize: 24,
                          fontWeight: "bold"
                        }}
                      >
                        100%
                      </div>
                      <Title level={5}>Hủy trước 24h</Title>
                      <Paragraph style={{ fontSize: 14 }}>
                        Hoàn 100% phí đã thanh toán nếu hủy lịch trước 24 giờ
                      </Paragraph>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card style={{ textAlign: "center", background: "#fff7e6", height: "100%" }}>
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          background: "#fa8c16",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          fontSize: 24,
                          fontWeight: "bold"
                        }}
                      >
                        50%
                      </div>
                      <Title level={5}>Hủy 12-24h</Title>
                      <Paragraph style={{ fontSize: 14 }}>
                        Hoàn 50% phí nếu hủy trong khoảng 12-24 giờ trước lịch hẹn
                      </Paragraph>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card style={{ textAlign: "center", background: "#fff1f0", height: "100%" }}>
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          background: "#f5222d",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          fontSize: 24,
                          fontWeight: "bold"
                        }}
                      >
                        0%
                      </div>
                      <Title level={5}>Hủy dưới 12h</Title>
                      <Paragraph style={{ fontSize: 14 }}>
                        Không hoàn phí nếu hủy trong vòng 12 giờ hoặc không đến khám
                      </Paragraph>
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Title level={5}>Quy trình xử lý hoàn tiền</Title>
                <Timeline
                  style={{ marginTop: 20 }}
                  items={[
                    {
                      color: "blue",
                      children: (
                        <>
                          <Text strong>Bước 1:</Text> Gửi yêu cầu hủy lịch qua app/website
                        </>
                      )
                    },
                    {
                      color: "green",
                      children: (
                        <>
                          <Text strong>Bước 2:</Text> Hệ thống xử lý tự động trong 24h
                        </>
                      )
                    },
                    {
                      color: "orange",
                      children: (
                        <>
                          <Text strong>Bước 3:</Text> Nhận xác nhận hoàn tiền qua email/SMS
                        </>
                      )
                    },
                    {
                      color: "purple",
                      children: (
                        <>
                          <Text strong>Bước 4:</Text> Tiền về tài khoản trong 5-7 ngày làm việc
                        </>
                      )
                    }
                  ]}
                />

                <Card size="small" style={{ marginTop: 24, background: "#e6f7ff" }}>
                  <Text strong>💳 Phương thức hoàn tiền:</Text>
                  <ul style={{ marginTop: 8, marginBottom: 0 }}>
                    <li>Hoàn về tài khoản/thẻ gốc đã thanh toán</li>
                    <li>Hoặc chuyển thành credit trong tài khoản MediCare</li>
                    <li>Liên hệ CSKH để chọn phương thức phù hợp</li>
                  </ul>
                </Card>
              </Card>

              {/* Invoices */}
              <Card id="invoices">
                <Title level={3}>
                  <ProfileOutlined style={{ color: "#fa8c16", marginRight: 8 }} />
                  Hóa đơn và chứng từ
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Tất cả giao dịch đều được cấp hóa đơn điện tử hợp lệ theo quy định của Nhà nước:
                </Paragraph>

                <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                  <Col xs={24} md={12}>
                    <Card>
                      <Title level={5}>Hóa đơn điện tử</Title>
                      <ul style={{ fontSize: 14, lineHeight: 1.8 }}>
                        <li>Tự động gửi qua email sau thanh toán</li>
                        <li>Tra cứu trong mục "Lịch sử giao dịch"</li>
                        <li>Có mã tra cứu và chữ ký số</li>
                        <li>Giá trị pháp lý như hóa đơn giấy</li>
                        <li>Tải xuống định dạng PDF</li>
                      </ul>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card>
                      <Title level={5}>Hóa đơn GTGT (VAT)</Title>
                      <ul style={{ fontSize: 14, lineHeight: 1.8 }}>
                        <li>Yêu cầu xuất hóa đơn VAT khi thanh toán</li>
                        <li>Cần cung cấp thông tin công ty:
                          <ul>
                            <li>Tên công ty</li>
                            <li>Mã số thuế</li>
                            <li>Địa chỉ</li>
                          </ul>
                        </li>
                        <li>Thời gian xuất: 1-3 ngày làm việc</li>
                      </ul>
                    </Card>
                  </Col>
                </Row>

                <Card size="small" style={{ marginTop: 24, background: "#fffbe6" }}>
                  <Text strong>📄 Giấy tờ khác:</Text>
                  <br />
                  <Text>
                    Ngoài hóa đơn, bạn sẽ nhận được: Biên lai thu tiền, Phiếu khám bệnh, 
                    Đơn thuốc (nếu có), Kết quả xét nghiệm, Chứng nhận y tế (nếu cần).
                  </Text>
                </Card>
              </Card>

              {/* Installment */}
              <Card id="installment">
                <Title level={3}>
                  <DollarOutlined style={{ color: "#722ed1", marginRight: 8 }} />
                  Thanh toán trả góp
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Hỗ trợ trả góp 0% lãi suất cho các gói dịch vụ trị giá từ 5.000.000đ:
                </Paragraph>

                <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                  <Col xs={24} md={8}>
                    <Card style={{ textAlign: "center", background: "#f0f9ff" }}>
                      <Title level={4} style={{ color: "#1890ff" }}>3 tháng</Title>
                      <Paragraph>
                        <Text strong>0% lãi suất</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Đơn hàng từ 5 triệu
                        </Text>
                      </Paragraph>
                      <Tag color="blue">Phổ biến</Tag>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card style={{ textAlign: "center", background: "#f6ffed" }}>
                      <Title level={4} style={{ color: "#52c41a" }}>6 tháng</Title>
                      <Paragraph>
                        <Text strong>0% lãi suất</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Đơn hàng từ 10 triệu
                        </Text>
                      </Paragraph>
                      <Tag color="green">Ưu đãi</Tag>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card style={{ textAlign: "center", background: "#fff7e6" }}>
                      <Title level={4} style={{ color: "#fa8c16" }}>12 tháng</Title>
                      <Paragraph>
                        <Text strong>0% lãi suất</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Đơn hàng từ 20 triệu
                        </Text>
                      </Paragraph>
                      <Tag color="orange">Tiết kiệm</Tag>
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Title level={5}>Ngân hàng hỗ trợ trả góp</Title>
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Card size="small">✓ Vietcombank</Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small">✓ VietinBank</Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small">✓ BIDV</Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small">✓ Techcombank</Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small">✓ MB Bank</Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small">✓ VP Bank</Card>
                  </Col>
                </Row>

                <Alert
                  message="Điều kiện trả góp"
                  description={
                    <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                      <li>Có thẻ tín dụng của ngân hàng liên kết</li>
                      <li>Hạn mức thẻ đủ để thanh toán</li>
                      <li>Không phát sinh phí trả góp từ MediCare</li>
                      <li>Phí chuyển đổi (nếu có) do ngân hàng quy định</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                  style={{ marginTop: 24 }}
                />
              </Card>

              {/* Security */}
              <Card id="security">
                <Title level={3}>
                  <LockOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                  Bảo mật thanh toán
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
                  Chúng tôi cam kết bảo vệ thông tin thanh toán của bạn với các biện pháp bảo mật tối ưu:
                </Paragraph>

                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={12} md={6}>
                    <div style={{ textAlign: "center" }}>
                      <LockOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }} />
                      <Title level={5}>Mã hóa SSL</Title>
                      <Paragraph style={{ fontSize: 13 }}>
                        Tất cả giao dịch được mã hóa 256-bit SSL
                      </Paragraph>
                    </div>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <div style={{ textAlign: "center" }}>
                      <SafetyCertificateOutlined style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }} />
                      <Title level={5}>PCI DSS</Title>
                      <Paragraph style={{ fontSize: 13 }}>
                        Tuân thủ chuẩn bảo mật thẻ thanh toán quốc tế
                      </Paragraph>
                    </div>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <div style={{ textAlign: "center" }}>
                      <CheckCircleOutlined style={{ fontSize: 48, color: "#fa8c16", marginBottom: 16 }} />
                      <Title level={5}>Xác thực OTP</Title>
                      <Paragraph style={{ fontSize: 13 }}>
                        Xác thực 2 lớp cho mọi giao dịch
                      </Paragraph>
                    </div>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <div style={{ textAlign: "center" }}>
                      <ProfileOutlined style={{ fontSize: 48, color: "#722ed1", marginBottom: 16 }} />
                      <Title level={5}>Không lưu thẻ</Title>
                      <Paragraph style={{ fontSize: 13 }}>
                        Không lưu trữ thông tin thẻ trên hệ thống
                      </Paragraph>
                    </div>
                  </Col>
                </Row>

                <Card size="small" style={{ marginTop: 24, background: "#f6ffed", borderColor: "#b7eb8f" }}>
                  <Space>
                    <CheckCircleOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                    <div>
                      <Text strong>Chứng nhận bảo mật</Text>
                      <br />
                      <Text style={{ fontSize: 13 }}>
                        MediCare được chứng nhận bởi các tổ chức bảo mật quốc tế: Verisign, McAfee Secure, Norton Secured
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Card>

              {/* Support */}
              <Card id="support">
                <Title level={3}>
                  <PhoneOutlined style={{ color: "#eb2f96", marginRight: 8 }} />
                  Hỗ trợ thanh toán
                </Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                  Gặp vấn đề về thanh toán? Liên hệ ngay với chúng tôi:
                </Paragraph>

                <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                  <Col xs={24} md={8}>
                    <Card style={{ textAlign: "center", background: "#f0f9ff" }}>
                      <PhoneOutlined style={{ fontSize: 40, color: "#1890ff", marginBottom: 16 }} />
                      <Title level={5}>Hotline thanh toán</Title>
                      <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                        1900-xxxx (Ext: 2)
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        24/7 - Miễn phí cuộc gọi
                      </Text>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card style={{ textAlign: "center", background: "#f6ffed" }}>
                      <MailOutlined style={{ fontSize: 40, color: "#52c41a", marginBottom: 16 }} />
                      <Title level={5}>Email hỗ trợ</Title>
                      <Text strong style={{ fontSize: 16, color: "#52c41a" }}>
                        payment@medicare.vn
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Phản hồi trong 2 giờ
                      </Text>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card style={{ textAlign: "center", background: "#fff7e6" }}>
                      <WalletOutlined style={{ fontSize: 40, color: "#fa8c16", marginBottom: 16 }} />
                      <Title level={5}>Trung tâm giao dịch</Title>
                      <Text strong style={{ fontSize: 14, color: "#fa8c16" }}>
                        123 ABC, Q.XYZ, TP.HCM
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        8h-20h hàng ngày
                      </Text>
                    </Card>
                  </Col>
                </Row>
              </Card>

              {/* Final Note */}
              <Card style={{ background: "#f0f2f5", textAlign: "center" }}>
                <Text type="secondary">
                  Chính sách thanh toán có hiệu lực từ 01/01/2024 | Cập nhật: 27/11/2024
                  <br />
                  MediCare có quyền thay đổi chính sách mà không cần thông báo trước
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

export default PaymentPolicyPage;
