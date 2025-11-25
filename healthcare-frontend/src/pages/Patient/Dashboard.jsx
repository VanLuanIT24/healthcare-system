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
  Form,
  Input,
  Select,
  DatePicker,
  Table,
  Timeline,
  Tag,
  Divider,
  Modal,
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
  const [editingItem, setEditingItem] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if user is a doctor
  const isDoctor = user?.role === "DOCTOR";

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

  // Handle item edit for doctors
  const handleEditItem = (item, index) => {
    if (isDoctor) {
      setEditingItem(index);
      setEditValues({ ...item });
    }
  };

  // Save edited item
  const handleSaveEdit = async () => {
    try {
      message.success("Cập nhật dữ liệu thành công");
      setEditingItem(null);
      // Refresh data
      await fetchData();
    } catch (error) {
      message.error("Lỗi cập nhật dữ liệu");
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditValues({});
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
      label: isDoctor ? "🩺 Chế độ Bác sĩ (Được kích hoạt)" : "Hồ sơ cá nhân",
      disabled: true,
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

  // ===== RENDERER FUNCTIONS FOR EACH MODULE =====

  // 1️⃣ DEMOGRAPHICS RENDERER
  const renderDemographics = () => {
    if (!data) return <Empty description="Chưa có thông tin cá nhân" />;

    return (
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card title="👤 Thông tin cá nhân" className="patient-card-animate">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <div style={{ padding: "12px", background: "#f5f9ff", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Tên đầu tiên</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{data?.firstName || "N/A"}</p>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ padding: "12px", background: "#f5f9ff", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Tên cuối</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{data?.lastName || "N/A"}</p>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ padding: "12px", background: "#f5f9ff", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Ngày sinh</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{data?.dateOfBirth?.slice(0, 10) || "N/A"}</p>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ padding: "12px", background: "#f5f9ff", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Giới tính</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{data?.gender === "M" ? "Nam" : data?.gender === "F" ? "Nữ" : "Khác"}</p>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ padding: "12px", background: "#f5f9ff", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Nhóm máu</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{data?.bloodType || "N/A"}</p>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ padding: "12px", background: "#f5f9ff", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Tình trạng hôn nhân</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{data?.maritalStatus || "N/A"}</p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="📱 Thông tin liên lạc" className="patient-card-animate">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div style={{ padding: "12px", background: "#f0f7ff", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Email</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{data?.email || "N/A"}</p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ padding: "12px", background: "#f0f7ff", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Số điện thoại</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{data?.phoneNumber || "N/A"}</p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ padding: "12px", background: "#f0f7ff", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Số điện thoại khẩn cấp</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{data?.emergencyPhoneNumber || "N/A"}</p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ padding: "12px", background: "#f0f7ff", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Nghề nghiệp</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{data?.occupation || "N/A"}</p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {data?.addresses && data.addresses.length > 0 && (
          <Col xs={24}>
            <Card title="🏠 Địa chỉ" className="patient-card-animate">
              <Row gutter={[16, 16]}>
                {data.addresses.map((addr, idx) => (
                  <Col xs={24} sm={12} key={idx}>
                    <Card size="small" style={{ background: "#fffaf0", border: "1px solid #ffd591" }}>
                      <div style={{ fontSize: "13px" }}>
                        <p style={{ margin: "0 0 8px 0", fontWeight: 600, color: "#FF9800" }}>{addr.addressType}</p>
                        <p style={{ margin: 0 }}>{addr.street}</p>
                        <p style={{ margin: "4px 0" }}>{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p style={{ margin: "4px 0" }}>{addr.country}</p>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        )}
      </Row>
    );
  };

  // 2️⃣ INSURANCE RENDERER
  const renderInsurance = () => {
    if (!data) return <Empty description="Chưa có thông tin bảo hiểm" />;

    const insurance = Array.isArray(data) ? data[0] : data;
    return (
      <Card title="🛡️ Thông tin bảo hiểm" className="patient-card-animate">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: "16px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", borderRadius: "8px" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "12px", opacity: 0.9 }}>Công ty bảo hiểm</p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "16px" }}>{insurance?.insuranceCompany || "N/A"}</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: "16px", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white", borderRadius: "8px" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "12px", opacity: 0.9 }}>Số hợp đồng</p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "16px" }}>{insurance?.policyNumber || "N/A"}</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: "16px", background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white", borderRadius: "8px" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "12px", opacity: 0.9 }}>Loại bảo hiểm</p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "16px" }}>{insurance?.insuranceType || "N/A"}</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: "16px", background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white", borderRadius: "8px" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "12px", opacity: 0.9 }}>Trạng thái</p>
              <Tag color={insurance?.status === "ACTIVE" ? "green" : "red"} style={{ margin: 0 }}>{insurance?.status === "ACTIVE" ? "Hoạt động" : "Hết hạn"}</Tag>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ padding: "12px", background: "#f5f9ff", borderRadius: "8px" }}>
              <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Ngày có hiệu lực</p>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{insurance?.startDate?.slice(0, 10) || "N/A"}</p>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ padding: "12px", background: "#f5f9ff", borderRadius: "8px" }}>
              <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Ngày hết hạn</p>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{insurance?.endDate?.slice(0, 10) || "N/A"}</p>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  // 3️⃣ MEDICAL HISTORY RENDERER
  const renderMedicalHistory = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <Empty description="Chưa có bệnh sử" />;
    }

    const histories = Array.isArray(data) ? data : [data];
    return (
      <Card title="📋 Bệnh sử" className="patient-card-animate">
        <Timeline
          items={histories.map((item, idx) => ({
            dot: <div style={{ width: "16px", height: "16px", background: "#00BCD4", borderRadius: "50%", border: "2px solid white" }} />,
            children: (
              <Card size="small" style={{ marginBottom: "12px" }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Tên bệnh</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{item?.conditionName || "N/A"}</p>
                  </Col>
                  <Col xs={24} sm={12}>
                    <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Trạng thái</p>
                    <Tag color={item?.status === "ACTIVE" ? "red" : "green"}>{item?.status === "ACTIVE" ? "Đang mắc" : "Đã khỏi"}</Tag>
                  </Col>
                  <Col xs={24} sm={12}>
                    <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Ngày chẩn đoán</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{item?.diagnosisDate?.slice(0, 10) || "N/A"}</p>
                  </Col>
                  <Col xs={24} sm={12}>
                    <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Mô tả</p>
                    <p style={{ margin: 0, fontSize: "13px" }}>{item?.description || "Không có mô tả"}</p>
                  </Col>
                </Row>
              </Card>
            ),
          }))}
        />
      </Card>
    );
  };

  // 4️⃣ EMERGENCY CONTACT RENDERER
  const renderEmergencyContact = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <Empty description="Chưa có liên hệ khẩn cấp" />;
    }

    const contacts = Array.isArray(data) ? data : [data];
    return (
      <Row gutter={[16, 16]}>
        {contacts.map((contact, idx) => (
          <Col xs={24} sm={12} lg={8} key={idx}>
            <Card className="patient-card-animate" style={{ borderLeft: "4px solid #FF6B6B" }}>
              <div>
                <p style={{ margin: "0 0 12px 0", fontWeight: 700, fontSize: "15px", color: "#333" }}>
                  👤 {contact?.name || "N/A"}
                </p>
                <Row gutter={[0, 8]}>
                  <Col xs={24}>
                    <p style={{ margin: "0 0 2px 0", color: "#999", fontSize: "12px" }}>Mối quan hệ</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{contact?.relationship || "N/A"}</p>
                  </Col>
                  <Col xs={24}>
                    <p style={{ margin: "0 0 2px 0", color: "#999", fontSize: "12px" }}>Số điện thoại</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>📞 {contact?.phoneNumber || "N/A"}</p>
                  </Col>
                  <Col xs={24}>
                    <p style={{ margin: "0 0 2px 0", color: "#999", fontSize: "12px" }}>Email</p>
                    <p style={{ margin: 0, fontWeight: 600, wordBreak: "break-all" }}>{contact?.email || "N/A"}</p>
                  </Col>
                  <Col xs={24}>
                    <p style={{ margin: "0 0 2px 0", color: "#999", fontSize: "12px" }}>Địa chỉ</p>
                    <p style={{ margin: 0, fontSize: "13px" }}>{contact?.address || "N/A"}</p>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // 5️⃣ VISITS RENDERER
  const renderVisits = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <Empty description="Chưa có lần khám nào" />;
    }

    const visits = Array.isArray(data) ? data : [data];
    const columns = [
      {
        title: "📅 Ngày khám",
        dataIndex: "visitDate",
        key: "visitDate",
        render: (date) => date?.slice(0, 10) || "N/A",
      },
      {
        title: "⏱️ Thời gian",
        dataIndex: "visitTime",
        key: "visitTime",
        render: (time) => time || "N/A",
      },
      {
        title: "🏥 Bác sĩ",
        dataIndex: "doctorName",
        key: "doctorName",
        render: (name) => name || "N/A",
      },
      {
        title: "🔍 Lý do khám",
        dataIndex: "reason",
        key: "reason",
        render: (reason) => reason || "N/A",
      },
      {
        title: "💊 Chẩn đoán",
        dataIndex: "diagnosis",
        key: "diagnosis",
        render: (diagnosis) => diagnosis || "N/A",
      },
      {
        title: "📝 Ghi chú",
        dataIndex: "notes",
        key: "notes",
        render: (notes) => notes || "N/A",
      },
    ];

    return (
      <Card title="🏥 Lần khám" className="patient-card-animate">
        <Table
          dataSource={visits.map((v, i) => ({ ...v, key: i }))}
          columns={columns}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>
    );
  };

  // 6️⃣ APPOINTMENTS RENDERER
  const renderAppointments = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <Empty description="Chưa có lịch hẹn nào" />;
    }

    const appointments = Array.isArray(data) ? data : [data];
    return (
      <Row gutter={[16, 16]}>
        {appointments.map((apt, idx) => (
          <Col xs={24} md={12} lg={8} key={idx}>
            <Card className="patient-card-animate" style={{ borderTop: "4px solid #00BCD4" }}>
              <div>
                <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f0f0f0" }}>
                  <Tag color="blue">{apt?.status === "CONFIRMED" ? "✅ Đã xác nhận" : apt?.status === "PENDING" ? "⏳ Chờ xác nhận" : "❌ Đã hủy"}</Tag>
                </div>
                <Row gutter={[0, 12]}>
                  <Col xs={24}>
                    <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Ngày hẹn</p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "15px" }}>{apt?.appointmentDate?.slice(0, 10) || "N/A"}</p>
                  </Col>
                  <Col xs={24}>
                    <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Thời gian</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{apt?.appointmentTime || "N/A"}</p>
                  </Col>
                  <Col xs={24}>
                    <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Bác sĩ</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{apt?.doctorName || "N/A"}</p>
                  </Col>
                  <Col xs={24}>
                    <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Lý do</p>
                    <p style={{ margin: 0, fontSize: "13px" }}>{apt?.reason || "N/A"}</p>
                  </Col>
                  <Col xs={24}>
                    <Button type="primary" block size="small" style={{ marginTop: "8px" }}>
                      Quản lý lịch hẹn
                    </Button>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // 7️⃣ PRESCRIPTIONS RENDERER
  const renderPrescriptions = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <Empty description="Chưa có đơn thuốc nào" />;
    }

    const prescriptions = Array.isArray(data) ? data : [data];
    return (
      <Row gutter={[16, 16]}>
        {prescriptions.map((rx, idx) => (
          <Col xs={24} md={12} key={idx}>
            <Card className="patient-card-animate" style={{ borderLeft: "4px solid #4CAF50" }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Tên thuốc</p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#333" }}>{rx?.medicationName || "N/A"}</p>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Liều lượng</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{rx?.dosage || "N/A"}</p>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Tần suất</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{rx?.frequency || "N/A"}</p>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Số ngày</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{rx?.durationDays || "N/A"} ngày</p>
                  </div>
                </Col>
                <Col xs={24}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", color: "#999", fontSize: "12px" }}>Chỉ dẫn</p>
                    <p style={{ margin: 0, fontSize: "13px" }}>{rx?.instructions || "Không có chỉ dẫn"}</p>
                  </div>
                </Col>
                <Col xs={24}>
                  <div style={{ paddingTop: "12px", borderTop: "1px solid #f0f0f0" }}>
                    <Tag color={rx?.status === "ACTIVE" ? "green" : "red"}>{rx?.status === "ACTIVE" ? "✅ Hiệu lực" : "❌ Hết hạn"}</Tag>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // 8️⃣ LAB RESULTS RENDERER
  const renderLabResults = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <Empty description="Chưa có kết quả xét nghiệm nào" />;
    }

    const results = Array.isArray(data) ? data : [data];
    const columns = [
      {
        title: "📅 Ngày xét nghiệm",
        dataIndex: "testDate",
        key: "testDate",
        render: (date) => date?.slice(0, 10) || "N/A",
        width: 130,
      },
      {
        title: "🔬 Tên xét nghiệm",
        dataIndex: "testName",
        key: "testName",
        render: (name) => name || "N/A",
      },
      {
        title: "📊 Kết quả",
        dataIndex: "result",
        key: "result",
        render: (result) => result || "N/A",
      },
      {
        title: "📏 Giới hạn bình thường",
        dataIndex: "normalRange",
        key: "normalRange",
        render: (range) => range || "N/A",
      },
      {
        title: "⚠️ Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag color={status === "NORMAL" ? "green" : status === "ABNORMAL" ? "red" : "orange"}>
            {status === "NORMAL" ? "✅ Bình thường" : status === "ABNORMAL" ? "⚠️ Bất thường" : "🔍 Chờ xác nhận"}
          </Tag>
        ),
      },
    ];

    return (
      <Card title="🔬 Kết quả xét nghiệm" className="patient-card-animate">
        <Table
          dataSource={results.map((r, i) => ({ ...r, key: i }))}
          columns={columns}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
          size="small"
        />
      </Card>
    );
  };

  // MAIN RENDER CONTENT FUNCTION
  const renderContent = () => {
    if (selectedMenu === "home") {
      return renderHome();
    }

    if (loading) {
      return <Spin style={{ display: "flex", justifyContent: "center", marginTop: "40px" }} />;
    }

    // Route to appropriate renderer
    switch (selectedMenu) {
      case "demographics":
        return renderDemographics();
      case "insurance":
        return renderInsurance();
      case "medicalHistory":
        return renderMedicalHistory();
      case "emergencyContact":
        return renderEmergencyContact();
      case "visits":
        return renderVisits();
      case "appointments":
        return renderAppointments();
      case "prescriptions":
        return renderPrescriptions();
      case "labResults":
        return renderLabResults();
      default:
        return <Empty description="Chưa có dữ liệu" />;
    }
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
