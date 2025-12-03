import {
    CalendarOutlined,
    FileOutlined,
    HomeOutlined,
    LogoutOutlined,
    MedicineBoxFilled,
    MedicineBoxOutlined,
    PlusOutlined,
    ScheduleOutlined,
    TeamOutlined,
    UserOutlined
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Card,
    Col,
    Dropdown,
    Empty,
    Layout,
    List,
    Menu,
    message,
    Row,
    Space,
    Spin,
    Statistic,
    Table,
    Tag
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getRoleDisplayName } from "../../utils/roleUtils";

const { Content } = Layout;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const MedicalStaffDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    "Content-Type": "application/json",
  });

  useEffect(() => {
    if (selectedMenu !== "home") {
      fetchData();
    }
  }, [selectedMenu]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const endpoints = {
        patients: "/medical/patients",
        appointments: "/medical/appointments",
        prescriptions: "/medical/prescriptions",
        labResults: "/medical/lab-results",
      };

      const endpoint = endpoints[selectedMenu];
      if (!endpoint) {
        setData(null);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: getHeaders(),
      });

      if (response.data.success) {
        setData(response.data.data);
      } else {
        message.error("Lỗi tải dữ liệu");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login", { replace: true });
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ cá nhân",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Trang chủ",
    },
    {
      key: "patients",
      icon: <TeamOutlined />,
      label: "Bệnh nhân",
    },
    {
      key: "appointments",
      icon: <CalendarOutlined />,
      label: "Lịch hẹn",
    },
    {
      key: "prescriptions",
      icon: <MedicineBoxOutlined />,
      label: "Đơn thuốc",
    },
    {
      key: "labResults",
      icon: <FileOutlined />,
      label: "Kết quả xét nghiệm",
    },
  ];

  const quickAccessCards = [
    {
      icon: <TeamOutlined />,
      title: "Quản lý bệnh nhân",
      desc: "Xem danh sách bệnh nhân",
      color: "#1890ff",
      onClick: () => setSelectedMenu("patients"),
    },
    {
      icon: <ScheduleOutlined />,
      title: "Lịch làm việc",
      desc: "Xem lịch trình của bạn",
      color: "#52c41a",
      onClick: () => setSelectedMenu("appointments"),
    },
    {
      icon: <MedicineBoxFilled />,
      title: "Khám bệnh",
      desc: "Tiếp nhận bệnh nhân",
      color: "#fa8c16",
      onClick: () => message.info("Tính năng đang phát triển"),
    },
    {
      icon: <MedicineBoxOutlined />,
      title: "Kê đơn",
      desc: "Tạo đơn thuốc mới",
      color: "#722ed1",
      onClick: () => message.info("Tính năng đang phát triển"),
    },
  ];

  const renderHome = () => (
    <div className="medical-home">
      <Card
        className="welcome-card"
        style={{
          background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
          color: "white",
          marginBottom: "24px",
          border: "none",
        }}
      >
        <div style={{ padding: "16px" }}>
          <h2 style={{ margin: "0 0 4px 0", fontSize: "26px", fontWeight: 700 }}>
            👨‍⚕️ Chào mừng, {user?.personalInfo?.firstName || user?.email}!
          </h2>
          <p style={{ margin: 0, opacity: 0.85, fontSize: "14px" }}>
            {getRoleDisplayName(user?.role)} - Hệ thống làm việc và chăm sóc bệnh nhân
          </p>
        </div>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderTop: "4px solid #1890ff" }}>
            <Statistic
              title="Bệnh nhân hôm nay"
              value={8}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderTop: "4px solid #52c41a" }}>
            <Statistic
              title="Lịch hẹn chờ"
              value={5}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderTop: "4px solid #fa8c16" }}>
            <Statistic
              title="Đơn thuốc cần xử lý"
              value={3}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: "#fa8c16", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderTop: "4px solid #722ed1" }}>
            <Statistic
              title="Xét nghiệm chờ kết quả"
              value={12}
              prefix={<FileOutlined />}
              valueStyle={{ color: "#722ed1", fontSize: "28px" }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ marginBottom: "16px", color: "#333", fontSize: "16px", fontWeight: 600 }}>
          ⚡ Truy cập nhanh
        </h3>
        <Row gutter={[16, 16]}>
          {quickAccessCards.map((card, idx) => (
            <Col xs={24} sm={12} lg={6} key={idx}>
              <Card
                style={{ cursor: "pointer" }}
                onClick={card.onClick}
                hoverable
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "36px", color: card.color, marginBottom: "12px" }}>
                    {card.icon}
                  </div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 600 }}>
                    {card.title}
                  </h4>
                  <p style={{ margin: 0, color: "#999", fontSize: "12px" }}>
                    {card.desc}
                  </p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Today's Schedule */}
      <Card title="📅 Lịch làm việc hôm nay" style={{ marginBottom: "24px" }}>
        <List
          dataSource={[
            { time: "08:00", patient: "Nguyễn Văn A", type: "Khám tổng quát" },
            { time: "09:30", patient: "Trần Thị B", type: "Tái khám" },
            { time: "11:00", patient: "Lê Văn C", type: "Khám mới" },
            { time: "14:00", patient: "Phạm Thị D", type: "Tư vấn" },
          ]}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={`${item.time} - ${item.patient}`}
                description={item.type}
              />
              <Tag color="blue">Chờ khám</Tag>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );

  const renderPatients = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <Empty description="Chưa có bệnh nhân nào" />;
    }

    const patients = Array.isArray(data) ? data : [data];
    
    const columns = [
      {
        title: "Bệnh nhân",
        dataIndex: "personalInfo",
        key: "name",
        render: (info) => `${info?.firstName} ${info?.lastName}`,
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "Số điện thoại",
        dataIndex: ["personalInfo", "phone"],
        key: "phone",
      },
      {
        title: "Tình trạng",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag color={status === "ACTIVE" ? "green" : "red"}>
            {status === "ACTIVE" ? "Đang điều trị" : "Đã xuất viện"}
          </Tag>
        ),
      },
      {
        title: "Hành động",
        key: "action",
        render: (_, record) => (
          <Space>
            <Button size="small">Xem hồ sơ</Button>
            <Button type="primary" size="small">Khám bệnh</Button>
          </Space>
        ),
      },
    ];

    return (
      <Card title="Danh sách bệnh nhân" extra={<Button type="primary" icon={<PlusOutlined />}>Thêm bệnh nhân</Button>}>
        <Table
          dataSource={patients.map((patient, i) => ({ ...patient, key: i }))}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    );
  };

  const renderContent = () => {
    if (selectedMenu === "home") {
      return renderHome();
    }

    if (loading) {
      return <Spin style={{ display: "flex", justifyContent: "center", marginTop: "40px" }} />;
    }

    switch (selectedMenu) {
      case "patients":
        return renderPatients();
      case "appointments":
        return <Empty description="Chưa có lịch hẹn nào" />;
      case "prescriptions":
        return <Empty description="Chưa có đơn thuốc nào" />;
      case "labResults":
        return <Empty description="Chưa có kết quả xét nghiệm nào" />;
      default:
        return <Empty description="Chưa có dữ liệu" />;
    }
  };

  return (
    <div className="medical-dashboard">
      {/* Top Header */}
      <div style={{ 
        background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)", 
        color: "white", 
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <MedicineBoxFilled style={{ fontSize: "24px", marginRight: "12px" }} />
          <span style={{ fontSize: "18px", fontWeight: 700 }}>Health Portal - Nhân Viên Y Tế</span>
        </div>

        <div>
          <Space size="middle" align="center">
            <div style={{ textAlign: "right", fontSize: "13px" }}>
              <p style={{ margin: 0, fontWeight: 500 }}>{user?.email}</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
                {getRoleDisplayName(user?.role)}
              </p>
            </div>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button
                type="text"
                icon={<UserOutlined />}
                shape="circle"
                size="large"
                style={{ color: "white" }}
              />
            </Dropdown>
          </Space>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ background: "white", borderBottom: "1px solid #f0f0f0" }}>
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={(e) => setSelectedMenu(e.key)}
          style={{ padding: "0 24px" }}
        />
      </div>

      {/* Main Content */}
      <Content style={{ padding: "24px", background: "#f5f5f5", minHeight: "calc(100vh - 128px)" }}>
        {renderContent()}
      </Content>
    </div>
  );
};

export default MedicalStaffDashboard;