import {
    CalendarOutlined,
    DownOutlined,
    EnvironmentOutlined,
    HeartFilled,
    MailOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    SearchOutlined,
    StarFilled,
    TrophyOutlined,
    UserOutlined
} from "@ant-design/icons";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Dropdown,
    Input,
    Layout,
    Menu,
    Pagination,
    Rate,
    Row,
    Select,
    Space,
    Tag,
    Tooltip,
    Typography
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getRoleDisplayName } from "../../utils/roleUtils";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const DoctorsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

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

  // Mock doctors data
  const doctorsData = [
    {
      id: 1,
      name: "TS.BS Nguyễn Văn An",
      specialty: "Tim mạch",
      degree: "Tiến sĩ Y khoa",
      experience: 20,
      rating: 4.9,
      reviews: 256,
      languages: ["Tiếng Việt", "English"],
      location: "TP. Hồ Chí Minh",
      price: "500,000",
      avatar: "https://i.pravatar.cc/150?img=12",
      verified: true,
      achievements: ["Giải thưởng Thầy thuốc ưu tú", "Chứng chỉ quốc tế ACC"],
      bio: "Chuyên gia hàng đầu về tim mạch, với hơn 20 năm kinh nghiệm điều trị các bệnh tim mạch phức tạp."
    },
    {
      id: 2,
      name: "BS.CKII Trần Thị Bích",
      specialty: "Nhi khoa",
      degree: "Bác sĩ chuyên khoa II",
      experience: 15,
      rating: 4.8,
      reviews: 189,
      languages: ["Tiếng Việt"],
      location: "Hà Nội",
      price: "350,000",
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: true,
      achievements: ["Top 10 bác sĩ nhi khoa xuất sắc"],
      bio: "Tận tâm chăm sóc sức khỏe trẻ em, chuyên về bệnh hô hấp và dị ứng ở trẻ."
    },
    {
      id: 3,
      name: "PGS.TS Lê Văn Cường",
      specialty: "Ngoại khoa",
      degree: "Phó giáo sư, Tiến sĩ",
      experience: 25,
      rating: 5.0,
      reviews: 312,
      languages: ["Tiếng Việt", "English", "中文"],
      location: "TP. Hồ Chí Minh",
      price: "800,000",
      avatar: "https://i.pravatar.cc/150?img=33",
      verified: true,
      achievements: ["Giải thưởng nghiên cứu khoa học quốc gia", "Chuyên gia phẫu thuật nội soi"],
      bio: "Chuyên gia phẫu thuật nội soi hàng đầu, được đào tạo tại Nhật Bản và Hàn Quốc."
    },
    {
      id: 4,
      name: "BS Phạm Thị Diệu",
      specialty: "Sản - Phụ khoa",
      degree: "Bác sĩ chuyên khoa I",
      experience: 12,
      rating: 4.7,
      reviews: 145,
      languages: ["Tiếng Việt", "English"],
      location: "Đà Nẵng",
      price: "400,000",
      avatar: "https://i.pravatar.cc/150?img=9",
      verified: true,
      achievements: ["Chứng chỉ siêu âm sản khoa quốc tế"],
      bio: "Chuyên về thai sản và điều trị vô sinh, có nhiều ca điều trị thành công."
    },
    {
      id: 5,
      name: "BS.CKI Hoàng Văn Em",
      specialty: "Nội khoa",
      degree: "Bác sĩ chuyên khoa I",
      experience: 18,
      rating: 4.6,
      reviews: 201,
      languages: ["Tiếng Việt"],
      location: "Cần Thơ",
      price: "300,000",
      avatar: "https://i.pravatar.cc/150?img=68",
      verified: true,
      achievements: ["Chuyên gia tiểu đường"],
      bio: "Chuyên điều trị các bệnh nội tiết, đặc biệt là bệnh tiểu đường và tuyến giáp."
    },
    {
      id: 6,
      name: "TS Ngô Thị Phương",
      specialty: "Da liễu",
      degree: "Tiến sĩ Y khoa",
      experience: 16,
      rating: 4.9,
      reviews: 278,
      languages: ["Tiếng Việt", "English", "Français"],
      location: "Hà Nội",
      price: "450,000",
      avatar: "https://i.pravatar.cc/150?img=10",
      verified: true,
      achievements: ["Chuyên gia điều trị mụn và nám", "Đào tạo tại Pháp"],
      bio: "Chuyên gia da liễu thẩm mỹ, được đào tạo tại Paris với nhiều kỹ thuật tiên tiến."
    },
    {
      id: 7,
      name: "BS Mai Văn Giang",
      specialty: "Răng hàm mặt",
      degree: "Bác sĩ chuyên khoa I",
      experience: 10,
      rating: 4.8,
      reviews: 167,
      languages: ["Tiếng Việt", "English"],
      location: "TP. Hồ Chí Minh",
      price: "350,000",
      avatar: "https://i.pravatar.cc/150?img=15",
      verified: true,
      achievements: ["Chứng chỉ Implant quốc tế"],
      bio: "Chuyên về cấy ghép Implant và chỉnh nha thẩm mỹ, công nghệ Invisalign."
    },
    {
      id: 8,
      name: "BS.CKII Võ Thị Hoa",
      specialty: "Tai - Mũi - Họng",
      degree: "Bác sĩ chuyên khoa II",
      experience: 14,
      rating: 4.7,
      reviews: 134,
      languages: ["Tiếng Việt"],
      location: "Đà Nẵng",
      price: "320,000",
      avatar: "https://i.pravatar.cc/150?img=47",
      verified: true,
      achievements: ["Chuyên gia nội soi tai mũi họng"],
      bio: "Chuyên điều trị viêm xoang, viêm họng và các bệnh lý tai mũi họng mãn tính."
    }
  ];

  const specialties = ["all", "Tim mạch", "Nhi khoa", "Ngoại khoa", "Sản - Phụ khoa", "Nội khoa", "Da liễu", "Răng hàm mặt", "Tai - Mũi - Họng"];

  const filteredDoctors = selectedSpecialty === "all" 
    ? doctorsData 
    : doctorsData.filter(doc => doc.specialty === selectedSpecialty);

  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
            background: "linear-gradient(135deg, rgba(15,91,140,0.9) 0%, rgba(24,144,255,0.85) 100%), url('https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1920')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            padding: "80px 50px",
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
            Đội Ngũ Bác Sĩ Chuyên Khoa
          </Title>
          <Paragraph 
            style={{ 
              fontSize: 20, 
              color: "white", 
              maxWidth: 800, 
              margin: "0 auto 30px", 
              lineHeight: 1.8,
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
            }}
          >
            150+ bác sĩ giàu kinh nghiệm, tận tâm và chuyên nghiệp
          </Paragraph>

          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <Search
              placeholder="Tìm bác sĩ theo tên, chuyên khoa..."
              enterButton={<Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>}
              size="large"
              style={{ borderRadius: 50 }}
            />
          </div>
        </div>

        {/* Filter Section */}
        <div style={{ padding: "40px 50px", background: "#f5f5f5" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="middle">
                <Text strong style={{ fontSize: 16 }}>Chuyên khoa:</Text>
                <Select 
                  value={selectedSpecialty}
                  onChange={setSelectedSpecialty}
                  style={{ width: 220 }}
                  size="large"
                >
                  <Option value="all">Tất cả chuyên khoa</Option>
                  {specialties.slice(1).map(spec => (
                    <Option key={spec} value={spec}>{spec}</Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col>
              <Text type="secondary">
                Hiển thị {paginatedDoctors.length} / {filteredDoctors.length} bác sĩ
              </Text>
            </Col>
          </Row>
        </div>

        {/* Doctors Grid */}
        <div style={{ padding: "40px 50px", background: "#fff" }}>
          <Row gutter={[24, 24]}>
            {paginatedDoctors.map(doctor => (
              <Col xs={24} sm={12} md={8} key={doctor.id}>
                <Card
                  hoverable
                  style={{ borderRadius: 10, overflow: "hidden", height: "100%" }}
                >
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <Avatar 
                      size={120} 
                      src={doctor.avatar}
                      icon={<UserOutlined />}
                      style={{ marginBottom: 12, border: "4px solid #f0f0f0" }}
                    />
                    {doctor.verified && (
                      <SafetyCertificateOutlined 
                        style={{ 
                          position: "absolute",
                          top: 95,
                          left: "50%",
                          transform: "translateX(30px)",
                          fontSize: 24,
                          color: "#52c41a",
                          background: "white",
                          borderRadius: "50%"
                        }} 
                      />
                    )}
                    <Title level={4} style={{ marginBottom: 4, marginTop: 8 }}>
                      {doctor.name}
                    </Title>
                    <Text strong style={{ color: "#1890ff", fontSize: 15 }}>
                      {doctor.specialty}
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Rate disabled value={doctor.rating} style={{ fontSize: 14 }} />
                      <Text type="secondary" style={{ marginLeft: 8, fontSize: 13 }}>
                        {doctor.rating} ({doctor.reviews} đánh giá)
                      </Text>
                    </div>
                  </div>

                  <Paragraph ellipsis={{ rows: 2 }} style={{ color: "#666", marginBottom: 12, fontSize: 14 }}>
                    {doctor.bio}
                  </Paragraph>

                  <Space direction="vertical" size="small" style={{ width: "100%", marginBottom: 12 }}>
                    <Text type="secondary">
                      <TrophyOutlined /> {doctor.degree}
                    </Text>
                    <Text type="secondary">
                      <StarFilled style={{ color: "#faad14" }} /> {doctor.experience} năm kinh nghiệm
                    </Text>
                    <Text type="secondary">
                      <EnvironmentOutlined /> {doctor.location}
                    </Text>
                  </Space>

                  <div style={{ marginBottom: 12 }}>
                    {doctor.languages.map(lang => (
                      <Tag key={lang} color="blue" style={{ marginBottom: 4 }}>
                        {lang}
                      </Tag>
                    ))}
                  </div>

                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    padding: "12px 0",
                    borderTop: "1px solid #f0f0f0",
                    marginTop: 12
                  }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>Phí khám từ</Text>
                      <br />
                      <Text strong style={{ color: "#52c41a", fontSize: 18 }}>
                        {doctor.price}đ
                      </Text>
                    </div>
                    <Button 
                      type="primary" 
                      icon={<CalendarOutlined />}
                      size="large"
                    >
                      Đặt khám
                    </Button>
                  </div>

                  <Button type="link" block style={{ marginTop: 8 }}>
                    Xem hồ sơ chi tiết →
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <Row justify="center" style={{ marginTop: 40 }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredDoctors.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          </Row>
        </div>

        {/* Why Choose Us */}
        <div style={{ padding: "80px 50px", background: "#f5f5f5" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <Title level={2} style={{ color: "#0F5B8C" }}>
              Tại Sao Chọn Bác Sĩ Của Chúng Tôi?
            </Title>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} md={6}>
              <div style={{ textAlign: "center" }}>
                <SafetyCertificateOutlined style={{ fontSize: 60, color: "#52c41a", marginBottom: 16 }} />
                <Title level={4}>Được chứng nhận</Title>
                <Paragraph style={{ color: "#666" }}>
                  100% bác sĩ có chứng chỉ hành nghề hợp lệ và được xác thực
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div style={{ textAlign: "center" }}>
                <TrophyOutlined style={{ fontSize: 60, color: "#1890ff", marginBottom: 16 }} />
                <Title level={4}>Giàu kinh nghiệm</Title>
                <Paragraph style={{ color: "#666" }}>
                  Trung bình 15+ năm kinh nghiệm lâm sàng
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div style={{ textAlign: "center" }}>
                <StarFilled style={{ fontSize: 60, color: "#faad14", marginBottom: 16 }} />
                <Title level={4}>Đánh giá cao</Title>
                <Paragraph style={{ color: "#666" }}>
                  Đánh giá trung bình 4.8/5 từ hàng nghìn bệnh nhân
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div style={{ textAlign: "center" }}>
                <HeartFilled style={{ fontSize: 60, color: "#eb2f96", marginBottom: 16 }} />
                <Title level={4}>Tận tâm</Title>
                <Paragraph style={{ color: "#666" }}>
                  Chăm sóc bệnh nhân với sự tận tâm và trách nhiệm cao
                </Paragraph>
              </div>
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

export default DoctorsPage;
