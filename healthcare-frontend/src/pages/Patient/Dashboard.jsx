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
  ClockCircleOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EnvironmentOutlined,
  PhoneOutlined as CallOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import "../styles/PatientDashboard.css";
import axios from "axios";

const { Sider, Content } = Layout;

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Get auth token
  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    "Content-Type": "application/json",
  });

  // Fetch data based on selected menu
  useEffect(() => {
    if (selectedMenu !== "home") {
      fetchData();
    }
  }, [selectedMenu]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const endpoints = {
        demographics: "/patient/demographics",
        insurance: "/patient/insurance",
        medicalHistory: "/patient/medical-history",
        emergencyContact: "/patient/emergency-contact",
        visits: "/patient/visits",
        appointments: "/patient/appointments",
        prescriptions: "/patient/prescriptions",
        labResults: "/patient/lab-results",
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
      // Delay redirect slightly to ensure context updates
      setTimeout(() => {
        navigate("/superadmin/login", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if logout fails
      navigate("/superadmin/login", { replace: true });
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
      key: "demographics",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "insurance",
      icon: <CreditCardOutlined />,
      label: "Bảo hiểm",
    },
    {
      key: "medicalHistory",
      icon: <HistoryOutlined />,
      label: "Bệnh sử",
    },
    {
      key: "emergencyContact",
      icon: <PhoneOutlined />,
      label: "Liên hệ khẩn cấp",
    },
    {
      key: "visits",
      icon: <HeartOutlined />,
      label: "Lần khám",
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
      onClick: () => setSelectedMenu("visits"),
    },
  ];

  const renderHome = () => (
    <div className="patient-home">
      {/* Welcome Header */}
      <Card
        className="welcome-card patient-card-animate"
        style={{
          background: "linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)",
          color: "white",
          marginBottom: "24px",
          border: "none",
        }}
      >
        <div style={{ padding: "16px" }}>
          <h2
            style={{ margin: "0 0 4px 0", fontSize: "26px", fontWeight: 700 }}
          >
            👋 Xin chào, {user?.personalInfo?.firstName || user?.email}!
          </h2>
          <p style={{ margin: 0, opacity: 0.85, fontSize: "14px" }}>
            Cùng quản lý sức khỏe của bạn toàn diện và hiệu quả
          </p>
        </div>
      </Card>

      {/* Health Stats Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="stat-card patient-card-animate"
            style={{ borderTop: "4px solid #00BCD4" }}
          >
            <Statistic
              title="Lần khám năm nay"
              value={3}
              prefix={<HeartOutlined />}
              valueStyle={{ color: "#00BCD4", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="stat-card patient-card-animate"
            style={{ borderTop: "4px solid #4CAF50", animationDelay: "0.1s" }}
          >
            <Statistic
              title="Đơn thuốc hiệu lực"
              value={2}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: "#4CAF50", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="stat-card patient-card-animate"
            style={{ borderTop: "4px solid #FF9800", animationDelay: "0.2s" }}
          >
            <Statistic
              title="Xét nghiệm sắp tới"
              value={1}
              prefix={<FileOutlined />}
              valueStyle={{ color: "#FF9800", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="stat-card patient-card-animate"
            style={{ borderTop: "4px solid #9C27B0", animationDelay: "0.3s" }}
          >
            <Statistic
              title="Lịch hẹn sắp tới"
              value={1}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#9C27B0", fontSize: "28px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div style={{ marginBottom: "24px" }}>
        <h3
          style={{
            marginBottom: "16px",
            color: "#333",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          ⚡ Truy cập nhanh
        </h3>
        <Row gutter={[16, 16]}>
          {quickAccessCards.map((card, idx) => (
            <Col xs={24} sm={12} lg={6} key={idx}>
              <Card
                className="quick-access-card patient-card-animate"
                style={{ animationDelay: `${idx * 0.1}s`, cursor: "pointer" }}
                onClick={card.onClick}
                hoverable
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "36px",
                      color: card.color,
                      marginBottom: "12px",
                    }}
                  >
                    {card.icon}
                  </div>
                  <h4
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
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

      {/* Health Progress & Activity Side by Side */}
      <Row gutter={[16, 16]}>
        {/* Health Progress */}
        <Col xs={24} lg={12}>
          <Card className="health-progress-card patient-card-animate">
            <h3
              style={{
                marginBottom: "20px",
                marginTop: 0,
                color: "#333",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              📊 Tiến độ sức khỏe
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <div
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: "13px" }}>
                    Tỷ lệ khám định kỳ
                  </span>
                  <span
                    style={{
                      color: "#00BCD4",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    75%
                  </span>
                </div>
                <Progress percent={75} strokeColor="#00BCD4" showInfo={false} />
              </div>
              <div>
                <div
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: "13px" }}>
                    Đơn thuốc tuân thủ
                  </span>
                  <span
                    style={{
                      color: "#4CAF50",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    90%
                  </span>
                </div>
                <Progress percent={90} strokeColor="#4CAF50" showInfo={false} />
              </div>
              <div>
                <div
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: "13px" }}>
                    Cập nhật hồ sơ
                  </span>
                  <span
                    style={{
                      color: "#FF9800",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    100%
                  </span>
                </div>
                <Progress
                  percent={100}
                  strokeColor="#FF9800"
                  showInfo={false}
                />
              </div>
            </div>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card className="recent-activity-card patient-card-animate">
            <h3
              style={{
                marginBottom: "16px",
                marginTop: 0,
                color: "#333",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              📝 Hoạt động gần đây
            </h3>
            <div className="activity-timeline">
              <div className="activity-item">
                <div
                  className="activity-icon"
                  style={{ background: "#00BCD4" }}
                >
                  <CheckCircleOutlined />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Hoàn thành khám tổng quát</p>
                  <p className="activity-time">2 ngày trước</p>
                </div>
              </div>
              <div className="activity-item">
                <div
                  className="activity-icon"
                  style={{ background: "#4CAF50" }}
                >
                  <MedicineBoxOutlined />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Nhận đơn thuốc mới</p>
                  <p className="activity-time">1 tuần trước</p>
                </div>
              </div>
              <div className="activity-item">
                <div
                  className="activity-icon"
                  style={{ background: "#FF9800" }}
                >
                  <FileOutlined />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Kết quả xét nghiệm có sẵn</p>
                  <p className="activity-time">2 tuần trước</p>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderContent = () => {
    if (selectedMenu === "home") {
      return renderHome();
    }

    if (!data) {
      return (
        <Empty description="Chưa có dữ liệu" style={{ marginTop: "40px" }} />
      );
    }

    if (Array.isArray(data)) {
      return (
        <Row gutter={[16, 16]}>
          {data.map((item, index) => (
            <Col xs={24} key={index}>
              <Card className="data-card patient-card-animate">
                <div style={{ fontSize: "13px" }}>
                  {typeof item === "object" ? (
                    <div>
                      {Object.entries(item).map(([key, value]) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            marginBottom: "8px",
                            borderBottom: "1px solid #f0f0f0",
                            paddingBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#00BCD4",
                              minWidth: "150px",
                            }}
                          >
                            {key}:
                          </span>
                          <span style={{ flex: 1, color: "#666" }}>
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    String(item)
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      );
    }

    return (
      <Card className="data-card patient-card-animate">
        <div style={{ fontSize: "13px" }}>
          {typeof data === "object" ? (
            <div>
              {Object.entries(data).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    marginBottom: "8px",
                    borderBottom: "1px solid #f0f0f0",
                    paddingBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#00BCD4",
                      minWidth: "150px",
                    }}
                  >
                    {key}:
                  </span>
                  <span style={{ flex: 1, color: "#666" }}>
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            String(data)
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="patient-dashboard-modern">
      {/* Top Header */}
      <div className="patient-top-header">
        <div className="header-brand">
          <HeartOutlined style={{ fontSize: "24px", color: "white" }} />
          <span
            style={{
              marginLeft: "8px",
              fontSize: "18px",
              fontWeight: 700,
              color: "white",
            }}
          >
            Health Portal
          </span>
        </div>

        <div className="header-user">
          <Space size="middle" align="center">
            <div
              style={{ textAlign: "right", fontSize: "13px", color: "white" }}
            >
              <p style={{ margin: 0, fontWeight: 500 }}>{user?.email}</p>
              <p
                style={{ margin: "2px 0 0 0", fontSize: "12px", opacity: 0.8 }}
              >
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

      {/* Horizontal Navigation */}
      <div className="patient-nav-bar">
        <div className="nav-container">
          <Menu
            theme="light"
            mode="horizontal"
            selectedKeys={[selectedMenu]}
            items={menuItems}
            onClick={(e) => setSelectedMenu(e.key)}
            className="patient-horizontal-menu"
            style={{
              background: "transparent",
              border: "none",
              display: "flex",
              flex: 1,
              justifyContent: "flex-start",
              flexWrap: "wrap",
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <Layout.Content className="patient-content-modern">
        {renderContent()}
      </Layout.Content>
    </div>
  );
};

export default PatientDashboard;
