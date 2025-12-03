import {
    CalendarOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    DownOutlined,
    EnvironmentOutlined,
    FacebookOutlined,
    HeartFilled,
    LinkedinOutlined,
    LockOutlined,
    LogoutOutlined,
    MailOutlined,
    PhoneOutlined,
    SendOutlined,
    TeamOutlined,
    TrophyOutlined,
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
    Form,
    Input,
    Layout,
    Menu,
    Row,
    Select,
    Space,
    Tag,
    Typography,
    Upload,
    message
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CareersPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [form] = Form.useForm();
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModalVisible, setApplyModalVisible] = useState(false);

  // Job openings data
  const jobs = [
    {
      id: 1,
      title: "Bác sĩ Nội khoa",
      department: "Khoa Nội",
      location: "TP. Hồ Chí Minh",
      type: "Toàn thời gian",
      experience: "3+ năm",
      salary: "25-35 triệu",
      deadline: "31/12/2024",
      description: "Khám và điều trị các bệnh lý nội khoa, tham gia các ca bệnh phức tạp",
      requirements: [
        "Tốt nghiệp Đại học Y khoa",
        "Có chứng chỉ hành nghề",
        "Kinh nghiệm tối thiểu 3 năm",
        "Kỹ năng giao tiếp tốt"
      ]
    },
    {
      id: 2,
      title: "Điều dưỡng viên",
      department: "Khoa Ngoại",
      location: "Hà Nội",
      type: "Toàn thời gian",
      experience: "1-2 năm",
      salary: "10-15 triệu",
      deadline: "25/12/2024",
      description: "Chăm sóc bệnh nhân, hỗ trợ bác sĩ trong các ca phẫu thuật",
      requirements: [
        "Tốt nghiệp Trường Cao đẳng Y tế",
        "Có chứng chỉ điều dưỡng",
        "Nhiệt tình, có tinh thần trách nhiệm",
        "Kỹ năng làm việc nhóm tốt"
      ]
    },
    {
      id: 3,
      title: "Kỹ thuật viên Xét nghiệm",
      department: "Khoa Xét nghiệm",
      location: "TP. Hồ Chí Minh",
      type: "Toàn thời gian",
      experience: "2+ năm",
      salary: "12-18 triệu",
      deadline: "20/12/2024",
      description: "Thực hiện các xét nghiệm, vận hành máy móc thiết bị",
      requirements: [
        "Tốt nghiệp Cao đẳng/Đại học chuyên ngành Xét nghiệm",
        "Kinh nghiệm làm việc tại phòng Lab",
        "Thành thạo các thiết bị xét nghiệm",
        "Cẩn thận, tỉ mỉ"
      ]
    },
    {
      id: 4,
      title: "Dược sĩ",
      department: "Khoa Dược",
      location: "Đà Nẵng",
      type: "Toàn thời gian",
      experience: "1-3 năm",
      salary: "12-20 triệu",
      deadline: "30/12/2024",
      description: "Tư vấn và phát thuốc cho bệnh nhân, quản lý kho thuốc",
      requirements: [
        "Tốt nghiệp Đại học Dược",
        "Có chứng chỉ hành nghề Dược",
        "Hiểu biết về các loại thuốc",
        "Kỹ năng tư vấn tốt"
      ]
    },
    {
      id: 5,
      title: "Nhân viên IT",
      department: "Phòng IT",
      location: "TP. Hồ Chí Minh",
      type: "Toàn thời gian",
      experience: "2+ năm",
      salary: "15-25 triệu",
      deadline: "15/01/2025",
      description: "Quản trị hệ thống, phát triển phần mềm quản lý bệnh viện",
      requirements: [
        "Tốt nghiệp Đại học chuyên ngành CNTT",
        "Kinh nghiệm lập trình web/mobile",
        "Biết React, Node.js là lợi thế",
        "Có khả năng làm việc độc lập"
      ]
    },
    {
      id: 6,
      title: "Nhân viên Marketing",
      department: "Phòng Marketing",
      location: "Hà Nội",
      type: "Toàn thời gian",
      experience: "1-2 năm",
      salary: "10-15 triệu",
      deadline: "10/01/2025",
      description: "Xây dựng và thực hiện các chiến dịch marketing, quản lý social media",
      requirements: [
        "Tốt nghiệp Đại học Marketing/Truyền thông",
        "Có kinh nghiệm về digital marketing",
        "Sáng tạo, năng động",
        "Thành thạo các công cụ marketing"
      ]
    }
  ];

  // Benefits data
  const benefits = [
    {
      icon: <DollarOutlined />,
      title: "Lương thưởng hấp dẫn",
      description: "Mức lương cạnh tranh, thưởng hiệu suất định kỳ"
    },
    {
      icon: <TrophyOutlined />,
      title: "Phát triển sự nghiệp",
      description: "Cơ hội đào tạo và thăng tiến rõ ràng"
    },
    {
      icon: <TeamOutlined />,
      title: "Môi trường chuyên nghiệp",
      description: "Đội ngũ đồng nghiệp thân thiện, hỗ trợ lẫn nhau"
    },
    {
      icon: <HeartFilled />,
      title: "Chế độ phúc lợi",
      description: "Bảo hiểm đầy đủ, khám sức khỏe định kỳ"
    }
  ];

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

  const handleApply = (job) => {
    setSelectedJob(job);
    setApplyModalVisible(true);
  };

  const onFinish = (values) => {
    console.log("Application submitted:", values);
    message.success("Đã gửi đơn ứng tuyển thành công!");
    form.resetFields();
    setApplyModalVisible(false);
  };

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
            Trang chủ
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
            padding: "80px 0",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 16,
            marginBottom: 60,
            color: "white"
          }}
        >
          <Title level={1} style={{ color: "white", marginBottom: 20 }}>
            Tuyển dụng
          </Title>
          <Paragraph style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", marginBottom: 0 }}>
            Tham gia đội ngũ của chúng tôi - Nơi bạn phát triển sự nghiệp trong lĩnh vực y tế
          </Paragraph>
        </div>

        {/* Benefits Section */}
        <div style={{ marginBottom: 60 }}>
          <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
            Quyền lợi khi làm việc tại MediCare
          </Title>
          <Row gutter={[32, 32]}>
            {benefits.map((benefit, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card style={{ textAlign: "center", height: "100%" }}>
                  <div style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }}>
                    {benefit.icon}
                  </div>
                  <Title level={4}>{benefit.title}</Title>
                  <Paragraph style={{ color: "#666" }}>{benefit.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Job Openings */}
        <div>
          <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
            Vị trí đang tuyển dụng
          </Title>
          <Row gutter={[24, 24]}>
            {jobs.map((job) => (
              <Col xs={24} lg={12} key={job.id}>
                <Card
                  hoverable
                  style={{ height: "100%" }}
                  actions={[
                    <Button type="primary" icon={<SendOutlined />} onClick={() => handleApply(job)}>
                      Ứng tuyển ngay
                    </Button>
                  ]}
                >
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <div>
                      <Title level={4} style={{ marginBottom: 8 }}>
                        {job.title}
                      </Title>
                      <Space wrap>
                        <Tag color="blue">{job.department}</Tag>
                        <Tag color="green">{job.type}</Tag>
                      </Space>
                    </div>

                    <Paragraph style={{ marginBottom: 0 }}>{job.description}</Paragraph>

                    <Row gutter={[16, 8]}>
                      <Col span={12}>
                        <Text type="secondary">
                          <EnvironmentOutlined /> {job.location}
                        </Text>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">
                          <ClockCircleOutlined /> {job.experience}
                        </Text>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">
                          <DollarOutlined /> {job.salary}
                        </Text>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">
                          <CalendarOutlined /> Hạn: {job.deadline}
                        </Text>
                      </Col>
                    </Row>

                    <div>
                      <Text strong>Yêu cầu:</Text>
                      <ul style={{ marginTop: 8, paddingLeft: 20, marginBottom: 0 }}>
                        {job.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Application Form Section */}
        {applyModalVisible && selectedJob && (
          <div style={{ marginTop: 60 }}>
            <Card title={`Ứng tuyển vị trí: ${selectedJob.title}`}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="fullName"
                      label="Họ và tên"
                      rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                    >
                      <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" }
                      ]}
                    >
                      <Input placeholder="email@example.com" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label="Số điện thoại"
                      rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                    >
                      <Input placeholder="0912345678" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="experience"
                      label="Số năm kinh nghiệm"
                      rules={[{ required: true, message: "Vui lòng chọn kinh nghiệm!" }]}
                    >
                      <Select placeholder="Chọn số năm kinh nghiệm">
                        <Select.Option value="0-1">Dưới 1 năm</Select.Option>
                        <Select.Option value="1-2">1-2 năm</Select.Option>
                        <Select.Option value="2-5">2-5 năm</Select.Option>
                        <Select.Option value="5+">Trên 5 năm</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="coverLetter"
                  label="Thư xin việc"
                  rules={[{ required: true, message: "Vui lòng viết thư xin việc!" }]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Giới thiệu về bản thân, lý do ứng tuyển và điểm mạnh của bạn..."
                  />
                </Form.Item>

                <Form.Item
                  name="cv"
                  label="Tải lên CV"
                  rules={[{ required: true, message: "Vui lòng tải lên CV!" }]}
                >
                  <Upload beforeUpload={() => false}>
                    <Button icon={<SendOutlined />}>Chọn file CV (PDF/DOC)</Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                      Gửi đơn ứng tuyển
                    </Button>
                    <Button onClick={() => {
                      setApplyModalVisible(false);
                      form.resetFields();
                    }}>
                      Hủy
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </div>
        )}
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

export default CareersPage;
