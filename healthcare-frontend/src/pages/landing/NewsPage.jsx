import {
    CalendarOutlined,
    DownOutlined,
    EyeOutlined,
    HeartFilled,
    MailOutlined,
    PhoneOutlined,
    SearchOutlined,
    TagsOutlined,
    UserOutlined
} from "@ant-design/icons";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Dropdown,
    Input,
    Layout,
    Menu,
    Pagination,
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

const NewsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  // Mock news data
  const newsData = [
    {
      id: 1,
      title: "Khai trương phòng khám chuyên khoa tim mạch hiện đại",
      excerpt: "MediCare System tự hào giới thiệu phòng khám tim mạch với trang thiết bị tiên tiến nhất, đội ngũ bác sĩ giàu kinh nghiệm...",
      category: "Sự kiện",
      date: "25/11/2024",
      views: 1250,
      author: "BS. Nguyễn Văn A",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
      tags: ["Tim mạch", "Khai trương", "Công nghệ"]
    },
    {
      id: 2,
      title: "Chương trình khám sức khỏe miễn phí cho người cao tuổi",
      excerpt: "Nhân dịp kỷ niệm 9 năm thành lập, chúng tôi tổ chức chương trình khám sức khỏe tổng quát miễn phí cho 500 người cao tuổi...",
      category: "Khuyến mãi",
      date: "23/11/2024",
      views: 2100,
      author: "BS. Trần Thị B",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
      tags: ["Khuyến mãi", "Người cao tuổi", "Miễn phí"]
    },
    {
      id: 3,
      title: "10 dấu hiệu cảnh báo bệnh tim mạch bạn cần biết",
      excerpt: "Bệnh tim mạch là nguyên nhân gây tử vong hàng đầu. Hãy cùng tìm hiểu 10 dấu hiệu cảnh báo sớm để phòng ngừa hiệu quả...",
      category: "Kiến thức y khoa",
      date: "20/11/2024",
      views: 3450,
      author: "TS. Lê Văn C",
      image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800",
      tags: ["Tim mạch", "Phòng ngừa", "Sức khỏe"]
    },
    {
      id: 4,
      title: "Chế độ dinh dưỡng cân bằng cho bệnh nhân tiểu đường",
      excerpt: "Dinh dưỡng đóng vai trò quan trọng trong việc kiểm soát đường huyết. Cùng chuyên gia dinh dưỡng tìm hiểu chế độ ăn phù hợp...",
      category: "Kiến thức y khoa",
      date: "18/11/2024",
      views: 1890,
      author: "CN. Phạm Thị D",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
      tags: ["Tiểu đường", "Dinh dưỡng", "Sức khỏe"]
    },
    {
      id: 5,
      title: "Ứng dụng công nghệ AI trong chẩn đoán hình ảnh y khoa",
      excerpt: "MediCare System đầu tư hệ thống AI hỗ trợ bác sĩ chẩn đoán hình ảnh X-quang, CT, MRI với độ chính xác cao hơn 95%...",
      category: "Công nghệ",
      date: "15/11/2024",
      views: 2800,
      author: "KS. Hoàng Văn E",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
      tags: ["AI", "Công nghệ", "Chẩn đoán"]
    },
    {
      id: 6,
      title: "Tập yoga giúp giảm stress và cải thiện sức khỏe tinh thần",
      excerpt: "Yoga không chỉ giúp cơ thể dẻo dai mà còn mang lại nhiều lợi ích cho sức khỏe tinh thần. Cùng tìm hiểu các bài tập đơn giản...",
      category: "Sức khỏe",
      date: "12/11/2024",
      views: 1600,
      author: "HLV. Ngô Thị F",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
      tags: ["Yoga", "Sức khỏe tinh thần", "Thể dục"]
    },
    {
      id: 7,
      title: "Giảm giá 30% gói khám sức khỏe tổng quát dịp cuối năm",
      excerpt: "Chương trình ưu đãi đặc biệt cuối năm với gói khám sức khỏe tổng quát VIP giảm 30%, bao gồm 50+ xét nghiệm và thăm khám...",
      category: "Khuyến mãi",
      date: "10/11/2024",
      views: 4200,
      author: "Phòng Marketing",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800",
      tags: ["Khuyến mãi", "Khám tổng quát", "Giảm giá"]
    },
    {
      id: 8,
      title: "Vaccine COVID-19 mũi nhắc lại: Những điều cần biết",
      excerpt: "Cập nhật thông tin mới nhất về vaccine COVID-19 mũi nhắc lại, đối tượng cần tiêm và lịch tiêm tại MediCare System...",
      category: "Sức khỏe",
      date: "08/11/2024",
      views: 3100,
      author: "BS. Mai Văn G",
      image: "https://images.unsplash.com/photo-1584118624012-df056829fbd0?w=800",
      tags: ["Vaccine", "COVID-19", "Phòng bệnh"]
    }
  ];

  const categories = ["all", "Sự kiện", "Khuyến mãi", "Kiến thức y khoa", "Công nghệ", "Sức khỏe"];

  const filteredNews = selectedCategory === "all" 
    ? newsData 
    : newsData.filter(news => news.category === selectedCategory);

  const paginatedNews = filteredNews.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
                <a style={{ color: "white", fontSize: 15, fontWeight: 600 }}>
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
            background: "linear-gradient(135deg, rgba(15,91,140,0.9) 0%, rgba(24,144,255,0.85) 100%), url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920')",
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
            Tin Tức & Sự Kiện
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
            Cập nhật thông tin y tế, sức khỏe và các sự kiện mới nhất
          </Paragraph>

          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <Search
              placeholder="Tìm kiếm tin tức, sự kiện..."
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
                <Text strong style={{ fontSize: 16 }}>Danh mục:</Text>
                <Select 
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{ width: 200 }}
                  size="large"
                >
                  <Option value="all">Tất cả</Option>
                  {categories.slice(1).map(cat => (
                    <Option key={cat} value={cat}>{cat}</Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col>
              <Text type="secondary">
                Hiển thị {paginatedNews.length} / {filteredNews.length} bài viết
              </Text>
            </Col>
          </Row>
        </div>

        {/* News Grid */}
        <div style={{ padding: "40px 50px", background: "#fff" }}>
          <Row gutter={[24, 24]}>
            {paginatedNews.map(news => (
              <Col xs={24} sm={12} md={8} key={news.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{ 
                      height: 220, 
                      background: `url(${news.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative"
                    }}>
                      <div style={{ 
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "#1890ff",
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: 4,
                        fontWeight: 500
                      }}>
                        {news.category}
                      </div>
                    </div>
                  }
                  style={{ borderRadius: 10, overflow: "hidden", height: "100%" }}
                >
                  <div style={{ minHeight: 280 }}>
                    <Title level={4} style={{ marginBottom: 12, lineHeight: 1.4 }}>
                      {news.title}
                    </Title>
                    <Paragraph ellipsis={{ rows: 3 }} style={{ color: "#666", marginBottom: 16 }}>
                      {news.excerpt}
                    </Paragraph>
                    
                    <div style={{ marginBottom: 12 }}>
                      {news.tags.map(tag => (
                        <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>
                          {tag}
                        </Tag>
                      ))}
                    </div>

                    <Divider style={{ margin: "12px 0" }} />

                    <Space split={<Divider type="vertical" />} style={{ width: "100%", fontSize: 13 }}>
                      <Text type="secondary">
                        <UserOutlined /> {news.author}
                      </Text>
                      <Text type="secondary">
                        <CalendarOutlined /> {news.date}
                      </Text>
                      <Text type="secondary">
                        <EyeOutlined /> {news.views}
                      </Text>
                    </Space>
                  </div>

                  <Button type="link" style={{ padding: 0, marginTop: 12 }}>
                    Đọc thêm →
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
              total={filteredNews.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          </Row>
        </div>

        {/* Popular Tags */}
        <div style={{ padding: "60px 50px", background: "#f5f5f5" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <Title level={3} style={{ color: "#0F5B8C" }}>
              <TagsOutlined /> Chủ đề phổ biến
            </Title>
          </div>
          <div style={{ textAlign: "center" }}>
            <Space wrap size="middle">
              {["Tim mạch", "Tiểu đường", "Dinh dưỡng", "COVID-19", "Yoga", "Sức khỏe tinh thần", 
                "Phòng bệnh", "Công nghệ", "AI", "Vaccine"].map(tag => (
                <Tag 
                  key={tag} 
                  style={{ 
                    padding: "8px 16px", 
                    fontSize: 15,
                    cursor: "pointer",
                    borderRadius: 20
                  }}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
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

export default NewsPage;
