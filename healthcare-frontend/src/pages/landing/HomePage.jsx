import {
  ApiOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  DownOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
  FacebookOutlined,
  FileProtectOutlined,
  HeartFilled,
  LinkedinOutlined,
  LockOutlined,
  LogoutOutlined,
  MailOutlined,
  PhoneOutlined,
  ProfileOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SettingOutlined,
  SmileOutlined,
  TeamOutlined,
  TrophyOutlined,
  TwitterOutlined,
  UserOutlined,
  YoutubeOutlined
} from "@ant-design/icons";
import {
  AutoComplete,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Form,
  Input,
  Layout,
  Modal,
  Row,
  Space,
  Statistic,
  Tooltip,
  Typography
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getRoleDisplayName } from "../../utils/roleUtils";

const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer } = Layout;
const { Search } = Input;

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [searchOptions, setSearchOptions] = useState([]);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    satisfaction: 0
  });
  const [targetStats, setTargetStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    satisfaction: 0
  });
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/public/stats`);
        if (response.data.success) {
          setTargetStats(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Fallback to default values
        setTargetStats({
          patients: 15000,
          doctors: 150,
          appointments: 50000,
          satisfaction: 98
        });
      }
    };

    fetchStats();
  }, []);

  // Fetch featured doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/public/featured-doctors?limit=4`);
        if (response.data.success) {
          setFeaturedDoctors(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Animate stats counter
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        patients: prev.patients < targetStats.patients ? prev.patients + Math.ceil(targetStats.patients / 100) : targetStats.patients,
        doctors: prev.doctors < targetStats.doctors ? prev.doctors + 1 : targetStats.doctors,
        appointments: prev.appointments < targetStats.appointments ? prev.appointments + Math.ceil(targetStats.appointments / 100) : targetStats.appointments,
        satisfaction: prev.satisfaction < targetStats.satisfaction ? prev.satisfaction + 1 : targetStats.satisfaction
      }));
    }, 30);

    return () => clearInterval(interval);
  }, [targetStats]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle change password
  const handleChangePassword = async (values) => {
    try {
      // Call API to change password
      console.log("Change password:", values);
      setChangePasswordVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Change password error:", error);
    }
  };

  // Smart search handler
  const handleSearch = (value) => {
    setSearchText(value);
    if (value.length > 2) {
      // Mock search results - in production, call API
      const mockResults = [
        { value: "Bác sĩ Nguyễn Văn A - Nội khoa", type: "doctor" },
        { value: "Bác sĩ Trần Thị B - Nhi khoa", type: "doctor" },
        { value: "Khám sức khỏe tổng quát", type: "service" },
        { value: "Xét nghiệm máu", type: "service" }
      ];
      setSearchOptions(mockResults);
    } else {
      setSearchOptions([]);
    }
  };

  // User menu for authenticated users
  const userMenuItems = [
    {
      key: "header",
      disabled: true,
      label: (
        <div>
          <Text strong>Xin chào, {user?.fullName || user?.email}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {getRoleDisplayName(user?.role)}
          </Text>
        </div>
      ),
      style: { cursor: "default", background: "#f5f5f5" }
    },
    { type: "divider" },
    {
      key: "account",
      icon: <UserOutlined />,
      label: "Quản lý tài khoản",
      onClick: () => navigate("/account")
    },
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: "Hồ sơ bệnh nhân",
      onClick: () => navigate("/patient/profile")
    },
    ...(user?.role === "PATIENT" ? [{
      key: "appointments",
      icon: <CalendarOutlined />,
      label: "Lịch hẹn của tôi",
      onClick: () => navigate("/patient/appointments")
    }] : []),
    {
      key: "changePassword",
      icon: <LockOutlined />,
      label: "Bảo mật",
      onClick: () => navigate("/account?tab=security")
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/account?tab=settings")
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout
    }
  ];

  // Services menu items
  const servicesMenuItems = [
    {
      type: "group",
      label: "Chuyên khoa",
      children: [
        { key: "noi-khoa", label: "Nội khoa", onClick: () => navigate("/services") },
        { key: "ngoai-khoa", label: "Ngoại khoa", onClick: () => navigate("/services") },
        { key: "san-phu-khoa", label: "Sản - Phụ khoa", onClick: () => navigate("/services") },
        { key: "nhi-khoa", label: "Nhi khoa", onClick: () => navigate("/services") },
        { key: "rang-ham-mat", label: "Răng hàm mặt", onClick: () => navigate("/services") }
      ]
    },
    {
      type: "group",
      label: "Dịch vụ đặc biệt",
      children: [
        { key: "tong-quat", label: "Khám sức khỏe tổng quát", onClick: () => navigate("/services") },
        { key: "tam-soat", label: "Tầm soát ung thư", onClick: () => navigate("/services") },
        { key: "dinh-duong", label: "Tư vấn dinh dưỡng", onClick: () => navigate("/services") },
        { key: "cap-cuu", label: "Cấp cứu 24/7", onClick: () => navigate("/services") },
        { key: "xet-nghiem", label: "Xét nghiệm", onClick: () => navigate("/services") }
      ]
    }
  ];

  // About menu items
  const aboutMenuItems = [
    { key: "vision", label: "Tầm nhìn & Sứ mệnh", onClick: () => navigate("/about") },
    { key: "facility", label: "Cơ sở vật chất", onClick: () => navigate("/about") },
    { key: "history", label: "Lịch sử phát triển", onClick: () => navigate("/about") }
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Header - Enhanced with Navigation */}
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
          {/* Logo & Brand */}
          <div 
            style={{ display: "flex", alignItems: "center", color: "white", cursor: "pointer" }}
            onClick={() => {
              navigate("/");
              window.scrollTo(0, 0);
            }}
          >
            <HeartFilled style={{ fontSize: 32, marginRight: 12 }} />
            <Title level={3} style={{ color: "white", margin: 0, fontSize: 22 }}>
              MediCare System
            </Title>
          </div>

          {/* Main Navigation */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Space size="large">
              <Dropdown menu={{ items: aboutMenuItems }} trigger={["hover"]}>
                <a style={{ color: "white", fontSize: 15 }} onClick={e => e.preventDefault()}>
                  Giới thiệu <DownOutlined style={{ fontSize: 10 }} />
                </a>
              </Dropdown>

              <Dropdown menu={{ items: servicesMenuItems }} trigger={["hover"]}>
                <a style={{ color: "white", fontSize: 15 }} onClick={e => e.preventDefault()}>
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
                <a style={{ color: "white", fontSize: 15 }}>
                  Liên hệ
                </a>
              </Tooltip>
            </Space>
          </div>

          {/* User Area */}
          <Space size="middle">
            {isAuthenticated ? (
              <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
                <div style={{ display: "flex", alignItems: "center", cursor: "pointer", color: "white" }}>
                  <Avatar 
                    size={40} 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: "#52c41a", marginRight: 8 }}
                  />
                  <div style={{ textAlign: "left" }}>
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
                  icon={<UserOutlined />}
                  onClick={() => navigate("/login")}
                  style={{ 
                    color: "white", 
                    borderColor: "white",
                    fontWeight: 500
                  }}
                >
                  Đăng nhập
                </Button>
                <Button 
                  type="primary"
                  style={{ 
                    background: "white", 
                    color: "#1890ff",
                    borderColor: "white",
                    fontWeight: 500
                  }}
                  onClick={() => navigate("/register")}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </Space>
        </div>
      </Header>

      {/* Main Content */}
      <Content>
        {/* Hero Section - Video Background Style */}
        <div 
          style={{ 
            background: "linear-gradient(135deg, rgba(15,91,140,0.9) 0%, rgba(24,144,255,0.85) 100%), url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920')",
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
            Chăm Sóc Sức Khỏe Toàn Diện
          </Title>
          <Paragraph 
            style={{ 
              fontSize: 20, 
              color: "white", 
              maxWidth: 800, 
              margin: "0 auto 40px", 
              lineHeight: 1.8,
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
            }}
          >
            Hệ thống quản lý y tế thông minh - Kết nối bệnh nhân, bác sĩ và quản lý
            <br />
            <strong>An toàn • Bảo mật • Hiệu quả</strong>
          </Paragraph>

          {/* Smart Search Bar */}
          <div style={{ maxWidth: 700, margin: "0 auto 40px" }}>
            <AutoComplete
              style={{ width: "100%" }}
              options={searchOptions}
              onSearch={handleSearch}
              placeholder={
                isAuthenticated 
                  ? "Tìm kiếm bệnh nhân, lịch hẹn, đơn thuốc... (Smart Search)"
                  : "Tìm kiếm bác sĩ, chuyên khoa, dịch vụ..."
              }
            >
              <Search
                size="large"
                enterButton={
                  <Button type="primary" size="large" icon={<SearchOutlined />}>
                    Tìm kiếm
                  </Button>
                }
                style={{ 
                  borderRadius: 50,
                  overflow: "hidden"
                }}
              />
            </AutoComplete>
          </div>

          {/* CTA Buttons */}
          <Space size="large" wrap>
            <Button
              type="primary"
              size="large"
              icon={<CalendarOutlined />}
              onClick={() => navigate(isAuthenticated ? "/appointments/create" : "/register")}
              style={{
                height: 50,
                fontSize: 16,
                borderRadius: 25,
                paddingLeft: 30,
                paddingRight: 30,
                background: "#52c41a",
                borderColor: "#52c41a"
              }}
            >
              Đặt lịch khám ngay
            </Button>
            <Button
              size="large"
              icon={<TeamOutlined />}
              onClick={() => navigate("/doctors")}
              style={{
                height: 50,
                fontSize: 16,
                borderRadius: 25,
                paddingLeft: 30,
                paddingRight: 30,
                background: "white",
                color: "#1890ff",
                borderColor: "white"
              }}
            >
              Tìm bác sĩ
            </Button>
            <Button
              size="large"
              icon={<ApiOutlined />}
              onClick={() => navigate("/consultation")}
              style={{
                height: 50,
                fontSize: 16,
                borderRadius: 25,
                paddingLeft: 30,
                paddingRight: 30,
                background: "rgba(255,255,255,0.2)",
                color: "white",
                borderColor: "white"
              }}
            >
              Tư vấn trực tuyến
            </Button>
          </Space>
        </div>

        {/* Stats Section - Impressive Numbers */}
        <div 
          style={{ 
            padding: "60px 50px",
            background: "#f5f5f5"
          }}
        >
          <Row gutter={[32, 32]} justify="center">
            <Col xs={12} md={6}>
              <Card variant="borderless" style={{ textAlign: "center", borderRadius: 10 }}>
                <Statistic
                  title={<Text strong style={{ fontSize: 16 }}>Bệnh nhân tin tưởng</Text>}
                  value={stats.patients}
                  prefix={<SmileOutlined style={{ color: "#1890ff" }} />}
                  suffix="+"
                  valueStyle={{ color: "#1890ff", fontSize: 32, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card variant="borderless" style={{ textAlign: "center", borderRadius: 10 }}>
                <Statistic
                  title={<Text strong style={{ fontSize: 16 }}>Bác sĩ chuyên khoa</Text>}
                  value={stats.doctors}
                  prefix={<TeamOutlined style={{ color: "#52c41a" }} />}
                  suffix="+"
                  valueStyle={{ color: "#52c41a", fontSize: 32, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card variant="borderless" style={{ textAlign: "center", borderRadius: 10 }}>
                <Statistic
                  title={<Text strong style={{ fontSize: 16 }}>Lượt khám thành công</Text>}
                  value={stats.appointments}
                  prefix={<CalendarOutlined style={{ color: "#fa8c16" }} />}
                  suffix="+"
                  valueStyle={{ color: "#fa8c16", fontSize: 32, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card variant="borderless" style={{ textAlign: "center", borderRadius: 10 }}>
                <Statistic
                  title={<Text strong style={{ fontSize: 16 }}>Hài lòng dịch vụ</Text>}
                  value={stats.satisfaction}
                  prefix={<TrophyOutlined style={{ color: "#eb2f96" }} />}
                  suffix="%"
                  valueStyle={{ color: "#eb2f96", fontSize: 32, fontWeight: 700 }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Featured Services - 4 Column Grid */}
        <div style={{ padding: "80px 50px", background: "white" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <Title level={2} style={{ color: "#0F5B8C", marginBottom: 16 }}>
              Tính Năng Nổi Bật
            </Title>
            <Paragraph style={{ fontSize: 16, color: "#666", maxWidth: 700, margin: "0 auto" }}>
              Trải nghiệm các dịch vụ y tế hiện đại với công nghệ tiên tiến
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Card 
                hoverable
                style={{ 
                  textAlign: "center", 
                  height: "100%",
                  borderRadius: 10,
                  border: "1px solid #f0f0f0"
                }}
              >
                <FileProtectOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }} />
                <Title level={4} style={{ marginBottom: 12 }}>Hồ sơ sức khỏe điện tử</Title>
                <Paragraph style={{ color: "#666", marginBottom: 16 }}>
                  Lưu trữ toàn bộ lịch sử khám chữa bệnh, dễ dàng tra cứu mọi lúc, mọi nơi.
                </Paragraph>
                <a style={{ color: "#1890ff", fontWeight: 500 }}>Tìm hiểu thêm →</a>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card 
                hoverable
                style={{ 
                  textAlign: "center", 
                  height: "100%",
                  borderRadius: 10,
                  border: "1px solid #f0f0f0"
                }}
              >
                <CalendarOutlined style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }} />
                <Title level={4} style={{ marginBottom: 12 }}>Đặt lịch khám online</Title>
                <Paragraph style={{ color: "#666", marginBottom: 16 }}>
                  Đặt lịch nhanh chóng, chọn bác sĩ và thời gian phù hợp chỉ với vài thao tác.
                </Paragraph>
                <a style={{ color: "#52c41a", fontWeight: 500 }}>Sử dụng ngay →</a>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card 
                hoverable
                style={{ 
                  textAlign: "center", 
                  height: "100%",
                  borderRadius: 10,
                  border: "1px solid #f0f0f0"
                }}
              >
                <ExperimentOutlined style={{ fontSize: 48, color: "#fa8c16", marginBottom: 16 }} />
                <Title level={4} style={{ marginBottom: 12 }}>Xét nghiệm trực tuyến</Title>
                <Paragraph style={{ color: "#666", marginBottom: 16 }}>
                  Xem kết quả xét nghiệm ngay khi có, nhận tư vấn từ bác sĩ chuyên khoa.
                </Paragraph>
                <a style={{ color: "#fa8c16", fontWeight: 500 }}>Xem chi tiết →</a>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card 
                hoverable
                style={{ 
                  textAlign: "center", 
                  height: "100%",
                  borderRadius: 10,
                  border: "1px solid #f0f0f0"
                }}
              >
                <ClockCircleOutlined style={{ fontSize: 48, color: "#eb2f96", marginBottom: 16 }} />
                <Title level={4} style={{ marginBottom: 12 }}>Cấp cứu 24/7</Title>
                <Paragraph style={{ color: "#666", marginBottom: 16 }}>
                  Dịch vụ cấp cứu hoạt động liên tục, sẵn sàng phục vụ mọi lúc, mọi nơi.
                </Paragraph>
                <a style={{ color: "#eb2f96", fontWeight: 500 }}>Liên hệ ngay →</a>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Featured Doctors Section */}
        <div style={{ padding: "80px 50px", background: "#f5f5f5" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <Title level={2} style={{ color: "#0F5B8C", marginBottom: 16 }}>
              Đội Ngũ Bác Sĩ Tiêu Biểu
            </Title>
            <Paragraph style={{ fontSize: 16, color: "#666", maxWidth: 700, margin: "0 auto" }}>
              Đội ngũ y bác sĩ giàu kinh nghiệm, tận tâm và chuyên nghiệp
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {loading ? (
              // Loading skeleton
              [1, 2, 3, 4].map(index => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card loading style={{ borderRadius: 10 }} />
                </Col>
              ))
            ) : featuredDoctors.length > 0 ? (
              // Real doctors from API
              featuredDoctors.map((doctor, index) => (
                <Col xs={24} sm={12} md={6} key={doctor.id}>
                  <Card
                    hoverable
                    style={{ 
                      textAlign: "center",
                      borderRadius: 10,
                      overflow: "hidden"
                    }}
                    cover={
                      <div 
                        style={{ 
                          height: 220,
                          background: `linear-gradient(135deg, ${['#1890ff', '#52c41a', '#fa8c16', '#eb2f96'][index % 4]} 0%, ${['#0F5B8C', '#389e0d', '#d46b08', '#c41d7f'][index % 4]} 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        {doctor.image ? (
                          <Avatar 
                            size={120} 
                            src={doctor.image}
                            style={{ border: "4px solid white" }}
                          />
                        ) : (
                          <Avatar 
                            size={120} 
                            icon={<UserOutlined />} 
                            style={{ backgroundColor: "white", color: "#1890ff" }} 
                          />
                        )}
                      </div>
                    }
                  >
                    <Title level={4} style={{ marginBottom: 8 }}>{doctor.name}</Title>
                    <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
                      {doctor.degree}
                    </Text>
                    <Text strong style={{ color: "#1890ff", display: "block", marginBottom: 4 }}>
                      {doctor.specialty}
                    </Text>
                    <Text type="secondary" style={{ display: "block", marginBottom: 8, fontSize: 12 }}>
                      {doctor.department}
                    </Text>
                    <Paragraph style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
                      {doctor.experience}
                    </Paragraph>
                    <Space direction="vertical" style={{ width: "100%" }} size="small">
                      <Button type="link" block onClick={() => navigate(`/doctors/${doctor.id}`)}>
                        Xem chi tiết
                      </Button>
                      <Button 
                        type="primary" 
                        block 
                        icon={<CalendarOutlined />}
                        onClick={() => navigate(isAuthenticated ? `/appointments/create?doctorId=${doctor.id}` : "/register")}
                      >
                        Đặt lịch khám
                      </Button>
                    </Space>
                  </Card>
                </Col>
              ))
            ) : (
              // No doctors available
              <Col span={24}>
                <Card style={{ textAlign: "center", padding: "40px" }}>
                  <TeamOutlined style={{ fontSize: 64, color: "#d9d9d9", marginBottom: 16 }} />
                  <Title level={4} type="secondary">Chưa có bác sĩ nào</Title>
                  <Paragraph type="secondary">
                    Hệ thống đang cập nhật thông tin bác sĩ. Vui lòng quay lại sau.
                  </Paragraph>
                </Card>
              </Col>
            )}
          </Row>
        </div>

        {/* Additional Features */}
        <div style={{ padding: "80px 50px", background: "white" }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={8}>
              <div style={{ textAlign: "center" }}>
                <SafetyCertificateOutlined style={{ fontSize: 64, color: "#1890ff", marginBottom: 20 }} />
                <Title level={4} style={{ marginBottom: 12 }}>Bảo mật tuyệt đối</Title>
                <Paragraph style={{ color: "#666" }}>
                  Hệ thống mã hóa dữ liệu y tế theo tiêu chuẩn HIPAA, đảm bảo thông tin 
                  bệnh nhân được bảo vệ an toàn tuyệt đối.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: "center" }}>
                <TeamOutlined style={{ fontSize: 64, color: "#52c41a", marginBottom: 20 }} />
                <Title level={4} style={{ marginBottom: 12 }}>Kết nối đa chiều</Title>
                <Paragraph style={{ color: "#666" }}>
                  Kết nối thông suốt giữa bệnh nhân, bác sĩ, và ban quản lý trong một 
                  hệ sinh thái y tế hiện đại và thông minh.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: "center" }}>
                <DashboardOutlined style={{ fontSize: 64, color: "#fa8c16", marginBottom: 20 }} />
                <Title level={4} style={{ marginBottom: 12 }}>Giao diện thông minh</Title>
                <Paragraph style={{ color: "#666" }}>
                  Thiết kế responsive, trực quan và dễ sử dụng cho mọi đối tượng người dùng 
                  với trải nghiệm tối ưu nhất.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </Content>

      {/* Footer - Enhanced with 4 Columns */}
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
              <a onClick={() => navigate("/about")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Giới thiệu</a>
              <a onClick={() => navigate("/services")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Dịch vụ</a>
              <a onClick={() => navigate("/news")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Tin tức</a>
              <a onClick={() => navigate("/careers")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Tuyển dụng</a>
              <a onClick={() => navigate("/contact")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Liên hệ</a>
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

      {/* Change Password Modal */}
      <Modal
        title="Đổi mật khẩu"
        open={changePasswordVisible}
        onCancel={() => {
          setChangePasswordVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={450}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleChangePassword}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Nhập mật khẩu hiện tại"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Nhập mật khẩu mới"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Xác nhận mật khẩu mới"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => {
                setChangePasswordVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Đổi mật khẩu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default HomePage;
