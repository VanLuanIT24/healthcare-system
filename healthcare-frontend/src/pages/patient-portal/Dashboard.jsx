import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Layout,
  Button,
  Dropdown,
  Space,
  Empty,
  message,
  Progress,
  Row,
  Col,
  Statistic,
  Badge,
  Menu,
  Table,
  Tag,
  Spin,
  Tabs,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  PhoneOutlined,
  HeartOutlined,
  FileOutlined,
  CalendarOutlined,
  PlusOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const { Content } = Layout;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PatientDashboard = () => {
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
        appointments: "/patient/appointments",
        prescriptions: "/patient/prescriptions",
        labResults: "/patient/lab-results",
        medicalHistory: "/patient/medical-history",
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
    {
      key: "medicalHistory",
      icon: <HistoryOutlined />,
      label: "Bệnh sử",
    },
  ];

  const quickAccessCards = [
    {
      icon: <CalendarOutlined />,
      title: "Đặt lịch khám",
      desc: "Đặt lịch khám bác sĩ",
      color: "#00BCD4",
      onClick: () => setSelectedMenu("appointments"),
    },
    {
      icon: <MedicineBoxOutlined />,
      title: "Đơn thuốc",
      desc: "Xem đơn thuốc của bạn",
      color: "#4CAF50",
      onClick: () => setSelectedMenu("prescriptions"),
    },
    {
      icon: <FileOutlined />,
      title: "Kết quả xét nghiệm",
      desc: "Xem kết quả lab",
      color: "#FF9800",
      onClick: () => setSelectedMenu("labResults"),
    },
    {
      icon: <HeartOutlined />,
      title: "Lần khám gần đây",
      desc: "Xem lịch sử khám",
      color: "#F44336",
      onClick: () => setSelectedMenu("medicalHistory"),
    },
  ];

  const renderHome = () => (
    <div className="patient-home">
      <Card
        className="welcome-card"
        style={{
          background: "linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)",
          color: "white",
          marginBottom: "24px",
          border: "none",
        }}
      >
        <div style={{ padding: "16px" }}>
          <h2 style={{ margin: "0 0 4px 0", fontSize: "26px", fontWeight: 700 }}>
            👋 Xin chào, {user?.personalInfo?.firstName || user?.email}!
          </h2>
          <p style={{ margin: 0, opacity: 0.85, fontSize: "14px" }}>
            Cùng quản lý sức khỏe của bạn toàn diện và hiệu quả
          </p>
        </div>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderTop: "4px solid #00BCD4" }}>
            <Statistic
              title="Lần khám năm nay"
              value={3}
              prefix={<HeartOutlined />}
              valueStyle={{ color: "#00BCD4", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderTop: "4px solid #4CAF50" }}>
            <Statistic
              title="Đơn thuốc hiệu lực"
              value={2}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: "#4CAF50", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderTop: "4px solid #FF9800" }}>
            <Statistic
              title="Xét nghiệm sắp tới"
              value={1}
              prefix={<FileOutlined />}
              valueStyle={{ color: "#FF9800", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderTop: "4px solid #9C27B0" }}>
            <Statistic
              title="Lịch hẹn sắp tới"
              value={1}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#9C27B0", fontSize: "28px" }}
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
    </div>
  );

  const renderAppointments = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <Empty description="Chưa có lịch hẹn nào" />;
    }

    const appointments = Array.isArray(data) ? data : [data];
    
    const columns = [
      {
        title: "Ngày hẹn",
        dataIndex: "appointmentDate",
        key: "appointmentDate",
        render: (date) => date?.slice(0, 10) || "N/A",
      },
      {
        title: "Bác sĩ",
        dataIndex: "doctorName",
        key: "doctorName",
        render: (name) => name || "N/A",
      },
      {
        title: "Lý do",
        dataIndex: "reason",
        key: "reason",
        render: (reason) => reason || "N/A",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag color={status === "CONFIRMED" ? "green" : "orange"}>
            {status === "CONFIRMED" ? "Đã xác nhận" : "Chờ xác nhận"}
          </Tag>
        ),
      },
    ];

    return (
      <Card title="Lịch hẹn của tôi">
        <Table
          dataSource={appointments.map((apt, i) => ({ ...apt, key: i }))}
          columns={columns}
          pagination={{ pageSize: 5 }}
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
      case "appointments":
        return renderAppointments();
      case "prescriptions":
        return <Empty description="Chưa có đơn thuốc nào" />;
      case "labResults":
        return <Empty description="Chưa có kết quả xét nghiệm nào" />;
      case "medicalHistory":
        return <Empty description="Chưa có bệnh sử" />;
      default:
        return <Empty description="Chưa có dữ liệu" />;
    }
  };

  return (
    <div className="patient-dashboard">
      {/* Top Header */}
      <div style={{ 
        background: "linear-gradient(135deg, #0F5B8C 0%, #1890ff 100%)", 
        color: "white", 
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <HeartOutlined style={{ fontSize: "24px", marginRight: "12px" }} />
          <span style={{ fontSize: "18px", fontWeight: 700 }}>Health Portal - Bệnh Nhân</span>
        </div>

        <div>
          <Space size="middle" align="center">
            <div style={{ textAlign: "right", fontSize: "13px" }}>
              <p style={{ margin: 0, fontWeight: 500 }}>{user?.email}</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
                {user?.personalInfo?.firstName || "Bệnh nhân"}
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

export default PatientDashboard;