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
  Upload,
  Rate,
  Drawer,
  Collapse,
  Tooltip,
  Popconfirm,
  Switch,
  Segmented,
  Statistic as AntStatistic,
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
  IdcardOutlined,
  CameraOutlined,
  LockOutlined,
  MailOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  EyeOutlined,
  DownloadOutlined,
  PhoneFilled,
  SafetyOutlined,
  TeamOutlined,
  FilePdfOutlined,
  StarOutlined,
  StarFilled,
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  UploadOutlined,
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

  // Additional modals and forms state
  const [demographicsEditModal, setDemographicsEditModal] = useState(false);
  const [insuranceEditModal, setInsuranceEditModal] = useState(false);
  const [emergencyContactModal, setEmergencyContactModal] = useState(false);
  const [appointmentBookModal, setAppointmentBookModal] = useState(false);
  const [prescriptionRefillModal, setPrescriptionRefillModal] = useState(false);
  const [ratingModal, setRatingModal] = useState(false);
  const [selectedVisitForRating, setSelectedVisitForRating] = useState(null);
  const [passwordChangeModal, setPasswordChangeModal] = useState(false);
  const [twoFAModal, setTwoFAModal] = useState(false);
  const [fileUploadDrawer, setFileUploadDrawer] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [rating, setRating] = useState(0);
  const [insuranceClaims, setInsuranceClaims] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactPriority, setContactPriority] = useState(1);
  const [isTwoFAEnabled, setIsTwoFAEnabled] = useState(false);
  const [editForm] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

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

  // ===== UTILITY FUNCTIONS =====

  // Export to PDF helper
  const exportPDF = (content, filename) => {
    const element = document.createElement("div");
    element.innerHTML = content;
    const opt = {
      margin: 10,
      filename: `${filename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };
    // Note: html2pdf library needs to be installed separately
    message.info("PDF export functionality requires html2pdf library");
  };

  // Handle password change
  const handlePasswordChange = async (values) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/patient/change-password`,
        {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
        { headers: getHeaders() }
      );
      if (response.data.success) {
        message.success("Đổi mật khẩu thành công!");
        passwordForm.resetFields();
        setPasswordChangeModal(false);
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  // Handle 2FA toggle
  const handleToggle2FA = async (enabled) => {
    try {
      if (enabled) {
        // Generate QR code for 2FA setup
        message.info("Chức năng 2FA sắp được triển khai");
      }
      setIsTwoFAEnabled(enabled);
    } catch (error) {
      message.error("Lỗi cập nhật 2FA");
    }
  };

  // Handle file upload (profile photo, insurance cards, etc.)
  const handleFileUpload = async (file, uploadType) => {
    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadType", uploadType);

      const response = await axios.post(
        `${API_BASE_URL}/patient/upload-file`,
        formData,
        {
          headers: {
            ...getHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        message.success("Tải lên tệp thành công!");
        setFileUploadDrawer(false);
        await fetchData();
      }
    } catch (error) {
      message.error("Lỗi tải lên tệp");
    } finally {
      setUploadingFile(false);
    }
  };

  // Add emergency contact
  const handleAddContact = async (values) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/patient/emergency-contact`,
        { ...values, priority: contactPriority },
        { headers: getHeaders() }
      );
      if (response.data.success) {
        message.success("Thêm liên hệ khẩn cấp thành công!");
        contactForm.resetFields();
        setEmergencyContactModal(false);
        await fetchData();
      }
    } catch (error) {
      message.error("Lỗi thêm liên hệ khẩn cấp");
    }
  };

  // Delete emergency contact
  const handleDeleteContact = async (contactId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/patient/emergency-contact/${contactId}`,
        { headers: getHeaders() }
      );
      if (response.data.success) {
        message.success("Xóa liên hệ khẩn cấp thành công!");
        await fetchData();
      }
    } catch (error) {
      message.error("Lỗi xóa liên hệ khẩn cấp");
    }
  };

  // Book appointment
  const handleBookAppointment = async (values) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/patient/appointments`,
        values,
        { headers: getHeaders() }
      );
      if (response.data.success) {
        message.success("Đặt lịch hẹn thành công!");
        setAppointmentBookModal(false);
        await fetchData();
      }
    } catch (error) {
      message.error("Lỗi đặt lịch hẹn");
    }
  };

  // Reschedule appointment
  const handleRescheduleAppointment = async (appointmentId, newDate) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/patient/appointments/${appointmentId}`,
        { appointmentDate: newDate },
        { headers: getHeaders() }
      );
      if (response.data.success) {
        message.success("Đổi lịch hẹn thành công!");
        await fetchData();
      }
    } catch (error) {
      message.error("Lỗi đổi lịch hẹn");
    }
  };

  // Request prescription refill
  const handleRequestRefill = async (prescriptionId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/patient/prescriptions/${prescriptionId}/refill`,
        {},
        { headers: getHeaders() }
      );
      if (response.data.success) {
        message.success("Yêu cầu cấp lại thuốc thành công!");
        await fetchData();
      }
    } catch (error) {
      message.error("Lỗi yêu cầu cấp lại thuốc");
    }
  };

  // Submit visit rating
  const handleSubmitRating = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/patient/visits/${selectedVisitForRating}/rating`,
        { rating, comments: "" },
        { headers: getHeaders() }
      );
      if (response.data.success) {
        message.success("Cảm ơn bạn đã đánh giá dịch vụ!");
        setRatingModal(false);
        setRating(0);
        await fetchData();
      }
    } catch (error) {
      message.error("Lỗi gửi đánh giá");
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
        {/* Profile Photo Section */}
        <Col xs={24}>
          <Card title="📸 Ảnh đại diện" className="patient-card-animate">
            <Row gutter={16}>
              <Col xs={24} sm={6} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "150px",
                    height: "150px",
                    background: "#e0e0e0",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                  }}
                >
                  <UserOutlined style={{ fontSize: "60px", color: "#ccc" }} />
                </div>
                <Button
                  icon={<CameraOutlined />}
                  block
                  style={{ marginTop: "12px" }}
                  onClick={() => setFileUploadDrawer(true)}
                >
                  Thay đổi ảnh
                </Button>
              </Col>
              <Col xs={24} sm={18}>
                <div>
                  <p>
                    <strong>Hướng dẫn:</strong> Ảnh đại diện nên có kích thước
                    từ 200x200px đến 2000x2000px
                  </p>
                  <p>Định dạng hỗ trợ: JPG, PNG, GIF (tối đa 5MB)</p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Personal Information */}
        <Col xs={24}>
          <Card
            title="👤 Thông tin cá nhân"
            extra={
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setDemographicsEditModal(true)}
              >
                Chỉnh sửa
              </Button>
            }
            className="patient-card-animate"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <div
                  style={{
                    padding: "12px",
                    background: "#f5f9ff",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    Tên đầu tiên
                  </p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>
                    {data?.firstName || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div
                  style={{
                    padding: "12px",
                    background: "#f5f9ff",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    Tên cuối
                  </p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>
                    {data?.lastName || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div
                  style={{
                    padding: "12px",
                    background: "#f5f9ff",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    Ngày sinh
                  </p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>
                    {data?.dateOfBirth?.slice(0, 10) || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div
                  style={{
                    padding: "12px",
                    background: "#f5f9ff",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    Giới tính
                  </p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>
                    {data?.gender === "M"
                      ? "Nam"
                      : data?.gender === "F"
                      ? "Nữ"
                      : "Khác"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div
                  style={{
                    padding: "12px",
                    background: "#f5f9ff",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    Nhóm máu
                  </p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>
                    {data?.bloodType || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div
                  style={{
                    padding: "12px",
                    background: "#f5f9ff",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    Tình trạng hôn nhân
                  </p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>
                    {data?.maritalStatus || "N/A"}
                  </p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Contact Information */}
        <Col xs={24}>
          <Card
            title="📱 Thông tin liên lạc"
            extra={
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setDemographicsEditModal(true)}
              >
                Xác thực
              </Button>
            }
            className="patient-card-animate"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    padding: "12px",
                    background: "#f0f7ff",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    Email
                  </p>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>
                      {data?.email || "N/A"}
                    </span>
                    <Badge
                      status={data?.emailVerified ? "success" : "error"}
                      text={
                        data?.emailVerified ? "Đã xác thực" : "Chưa xác thực"
                      }
                      style={{ fontSize: "12px" }}
                    />
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    padding: "12px",
                    background: "#f0f7ff",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    Số điện thoại
                  </p>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>
                      {data?.phoneNumber || "N/A"}
                    </span>
                    <Badge
                      status={data?.phoneVerified ? "success" : "error"}
                      text={
                        data?.phoneVerified ? "Đã xác thực" : "Chưa xác thực"
                      }
                      style={{ fontSize: "12px" }}
                    />
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    padding: "12px",
                    background: "#f0f7ff",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    Số điện thoại khẩn cấp
                  </p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>
                    {data?.emergencyPhoneNumber || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    padding: "12px",
                    background: "#f0f7ff",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    Nghề nghiệp
                  </p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>
                    {data?.occupation || "N/A"}
                  </p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Addresses */}
        {data?.addresses && data.addresses.length > 0 && (
          <Col xs={24}>
            <Card title="🏠 Địa chỉ" className="patient-card-animate">
              <Row gutter={[16, 16]}>
                {data.addresses.map((addr, idx) => (
                  <Col xs={24} sm={12} key={idx}>
                    <Card
                      size="small"
                      style={{
                        background: "#fffaf0",
                        border: "1px solid #ffd591",
                      }}
                    >
                      <div style={{ fontSize: "13px" }}>
                        <p
                          style={{
                            margin: "0 0 8px 0",
                            fontWeight: 600,
                            color: "#FF9800",
                          }}
                        >
                          {addr.addressType}
                        </p>
                        <p style={{ margin: 0 }}>{addr.street}</p>
                        <p style={{ margin: "4px 0" }}>
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p style={{ margin: "4px 0" }}>{addr.country}</p>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        )}

        {/* Security Settings */}
        <Col xs={24}>
          <Card title="🔐 Bảo mật tài khoản" className="patient-card-animate">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12}>
                <Card size="small" style={{ background: "#f5f5f5" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>
                        <LockOutlined /> Đổi mật khẩu
                      </p>
                      <p
                        style={{
                          margin: 0,
                          color: "#999",
                          fontSize: "12px",
                        }}
                      >
                        Cập nhật mật khẩu tài khoản của bạn
                      </p>
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => setPasswordChangeModal(true)}
                    >
                      Đổi
                    </Button>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card size="small" style={{ background: "#f5f5f5" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>
                        <SafetyOutlined /> Xác thực 2 yếu tố (2FA)
                      </p>
                      <p
                        style={{
                          margin: 0,
                          color: "#999",
                          fontSize: "12px",
                        }}
                      >
                        Bảo vệ tài khoản bằng 2FA
                      </p>
                    </div>
                    <Switch
                      checked={isTwoFAEnabled}
                      onChange={handleToggle2FA}
                    />
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Demographics Edit Modal */}
        <Modal
          title="Chỉnh sửa thông tin cá nhân"
          open={demographicsEditModal}
          onOk={() => {
            editForm.validateFields().then(() => {
              message.success("Cập nhật thành công!");
              setDemographicsEditModal(false);
            });
          }}
          onCancel={() => setDemographicsEditModal(false)}
          width={600}
        >
          <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item label="Tên đầu tiên" name="firstName">
              <Input defaultValue={data?.firstName} />
            </Form.Item>
            <Form.Item label="Tên cuối" name="lastName">
              <Input defaultValue={data?.lastName} />
            </Form.Item>
            <Form.Item label="Ngày sinh" name="dateOfBirth">
              <Input
                type="date"
                defaultValue={data?.dateOfBirth?.slice(0, 10)}
              />
            </Form.Item>
            <Form.Item label="Giới tính" name="gender">
              <Select
                options={[
                  { label: "Nam", value: "M" },
                  { label: "Nữ", value: "F" },
                  { label: "Khác", value: "O" },
                ]}
                defaultValue={data?.gender}
              />
            </Form.Item>
            <Form.Item label="Số điện thoại" name="phoneNumber">
              <Input defaultValue={data?.phoneNumber} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Password Change Modal */}
        <Modal
          title="Đổi mật khẩu"
          open={passwordChangeModal}
          onOk={() => {
            passwordForm.validateFields().then((values) => {
              handlePasswordChange(values);
            });
          }}
          onCancel={() => {
            setPasswordChangeModal(false);
            passwordForm.resetFields();
          }}
          width={500}
        >
          <Form form={passwordForm} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              label="Mật khẩu cũ"
              name="oldPassword"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu cũ",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu mới",
                },
                {
                  min: 8,
                  message: "Mật khẩu phải có ít nhất 8 ký tự",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng xác nhận mật khẩu",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp")
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Form>
        </Modal>
      </Row>
    );
  };

  // 2️⃣ INSURANCE RENDERER
  const renderInsurance = () => {
    if (!data) return <Empty description="Chưa có thông tin bảo hiểm" />;

    const insurance = Array.isArray(data) ? data[0] : data;
    return (
      <Row gutter={[24, 24]}>
        {/* Main Insurance Card */}
        <Col xs={24}>
          <Card
            title="🛡️ Thông tin bảo hiểm"
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setInsuranceEditModal(true)}
              >
                Thêm bảo hiểm
              </Button>
            }
            className="patient-card-animate"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <div
                  style={{
                    padding: "16px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "12px",
                      opacity: 0.9,
                    }}
                  >
                    Công ty bảo hiểm
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: "16px",
                    }}
                  >
                    {insurance?.insuranceCompany || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div
                  style={{
                    padding: "16px",
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "white",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "12px",
                      opacity: 0.9,
                    }}
                  >
                    Số hợp đồng
                  </p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "16px" }}>
                    {insurance?.policyNumber || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div
                  style={{
                    padding: "16px",
                    background:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    color: "white",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "12px",
                      opacity: 0.9,
                    }}
                  >
                    Loại bảo hiểm
                  </p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "16px" }}>
                    {insurance?.insuranceType || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div
                  style={{
                    padding: "16px",
                    background:
                      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                    color: "white",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "12px",
                      opacity: 0.9,
                    }}
                  >
                    Trạng thái
                  </p>
                  <Tag
                    color={insurance?.status === "ACTIVE" ? "green" : "red"}
                    style={{ margin: 0 }}
                  >
                    {insurance?.status === "ACTIVE"
                      ? "✅ Hoạt động"
                      : "❌ Hết hạn"}
                  </Tag>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    padding: "12px",
                    background: "#f5f9ff",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    Ngày có hiệu lực
                  </p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>
                    {insurance?.startDate?.slice(0, 10) || "N/A"}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    padding: "12px",
                    background: "#f5f9ff",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    Ngày hết hạn
                  </p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>
                    {insurance?.endDate?.slice(0, 10) || "N/A"}
                  </p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Insurance Documents */}
        <Col xs={24}>
          <Card title="📄 Tài liệu bảo hiểm" className="patient-card-animate">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <CreditCardOutlined
                    style={{
                      fontSize: "40px",
                      color: "#00BCD4",
                      marginBottom: 8,
                    }}
                  />
                  <p style={{ margin: "0 0 12px 0", fontWeight: 600 }}>
                    Mặt trước thẻ
                  </p>
                  <Button
                    icon={<UploadOutlined />}
                    block
                    onClick={() => setFileUploadDrawer(true)}
                  >
                    Tải lên ảnh
                  </Button>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <CreditCardOutlined
                    style={{
                      fontSize: "40px",
                      color: "#4CAF50",
                      marginBottom: 8,
                    }}
                  />
                  <p style={{ margin: "0 0 12px 0", fontWeight: 600 }}>
                    Mặt sau thẻ
                  </p>
                  <Button
                    icon={<UploadOutlined />}
                    block
                    onClick={() => setFileUploadDrawer(true)}
                  >
                    Tải lên ảnh
                  </Button>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Insurance Claims */}
        <Col xs={24}>
          <Card
            title="📋 Lịch sử yêu cầu bảo hiểm"
            className="patient-card-animate"
          >
            {insuranceClaims?.length > 0 ? (
              <Table
                dataSource={insuranceClaims.map((claim, idx) => ({
                  ...claim,
                  key: idx,
                }))}
                columns={[
                  {
                    title: "📅 Ngày yêu cầu",
                    dataIndex: "claimDate",
                    render: (date) => date?.slice(0, 10) || "N/A",
                  },
                  {
                    title: "💰 Số tiền",
                    dataIndex: "claimAmount",
                    render: (amt) => `${amt || 0}đ`,
                  },
                  {
                    title: "⚙️ Trạng thái",
                    dataIndex: "status",
                    render: (status) => (
                      <Tag
                        color={
                          status === "APPROVED"
                            ? "green"
                            : status === "PENDING"
                            ? "orange"
                            : "red"
                        }
                      >
                        {status === "APPROVED"
                          ? "✅ Đã duyệt"
                          : status === "PENDING"
                          ? "⏳ Chờ xử lý"
                          : "❌ Bị từ chối"}
                      </Tag>
                    ),
                  },
                ]}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            ) : (
              <Empty description="Chưa có yêu cầu bảo hiểm nào" />
            )}
          </Card>
        </Col>
      </Row>
    );
  };

  // 3️⃣ MEDICAL HISTORY RENDERER
  const renderMedicalHistory = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <Empty description="Chưa có bệnh sử" />;
    }

    const histories = Array.isArray(data) ? data : [data];
    return (
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "📋 Lịch sử bệnh",
            children: (
              <Card className="patient-card-animate">
                <Timeline
                  items={histories.map((item, idx) => ({
                    dot: (
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          background: "#00BCD4",
                          borderRadius: "50%",
                          border: "2px solid white",
                        }}
                      />
                    ),
                    children: (
                      <Card size="small" style={{ marginBottom: "12px" }}>
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12}>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Tên bệnh
                            </p>
                            <p style={{ margin: 0, fontWeight: 600 }}>
                              {item?.conditionName || "N/A"}
                            </p>
                          </Col>
                          <Col xs={24} sm={12}>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Trạng thái
                            </p>
                            <Tag
                              color={
                                item?.status === "ACTIVE" ? "red" : "green"
                              }
                            >
                              {item?.status === "ACTIVE"
                                ? "Đang mắc"
                                : "Đã khỏi"}
                            </Tag>
                          </Col>
                          <Col xs={24} sm={12}>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Ngày chẩn đoán
                            </p>
                            <p style={{ margin: 0, fontWeight: 600 }}>
                              {item?.diagnosisDate?.slice(0, 10) || "N/A"}
                            </p>
                          </Col>
                          <Col xs={24} sm={12}>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Mô tả
                            </p>
                            <p style={{ margin: 0, fontSize: "13px" }}>
                              {item?.description || "Không có mô tả"}
                            </p>
                          </Col>
                        </Row>
                      </Card>
                    ),
                  }))}
                />
              </Card>
            ),
          },
          {
            key: "2",
            label: "🚨 Dị ứng",
            children: (
              <Card className="patient-card-animate">
                {data?.allergies?.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {data.allergies.map((allergy, idx) => (
                      <Col xs={24} sm={12} key={idx}>
                        <Card
                          size="small"
                          style={{
                            background: "#fff3cd",
                            border: "1px solid #ffc107",
                          }}
                        >
                          <div>
                            <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>
                              {allergy.allergen}
                            </p>
                            <Tag color="warning">{allergy.severity}</Tag>
                            <p
                              style={{ margin: "8px 0 0 0", fontSize: "12px" }}
                            >
                              {allergy.reaction}
                            </p>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description="Chưa có dị ứng nào được ghi nhận" />
                )}
              </Card>
            ),
          },
          {
            key: "3",
            label: "💉 Tiêm chủng",
            children: (
              <Card className="patient-card-animate">
                {data?.vaccinations?.length > 0 ? (
                  <Table
                    dataSource={data.vaccinations.map((v, i) => ({
                      ...v,
                      key: i,
                    }))}
                    columns={[
                      {
                        title: "Tên vaccine",
                        dataIndex: "vaccineName",
                      },
                      {
                        title: "Ngày tiêm",
                        dataIndex: "vaccinationDate",
                        render: (date) => date?.slice(0, 10) || "N/A",
                      },
                      {
                        title: "Mũi",
                        dataIndex: "dose",
                      },
                      {
                        title: "Trạng thái",
                        dataIndex: "status",
                        render: (status) => (
                          <Tag
                            color={status === "COMPLETED" ? "green" : "blue"}
                          >
                            {status === "COMPLETED" ? "Hoàn thành" : "Chờ"}
                          </Tag>
                        ),
                      },
                    ]}
                    pagination={{ pageSize: 5 }}
                    size="small"
                  />
                ) : (
                  <Empty description="Chưa có thông tin tiêm chủng" />
                )}
              </Card>
            ),
          },
        ]}
      />
    );
  };

  // 4️⃣ EMERGENCY CONTACT RENDERER
  const renderEmergencyContact = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <Empty description="Chưa có liên hệ khẩn cấp" />;
    }

    const contacts = Array.isArray(data) ? data : [data];
    const sortedContacts = contacts.sort(
      (a, b) => (a.priority || 999) - (b.priority || 999)
    );

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            block
            onClick={() => setEmergencyContactModal(true)}
          >
            Thêm liên hệ khẩn cấp
          </Button>
        </Col>
        {sortedContacts.map((contact, idx) => (
          <Col xs={24} sm={12} lg={8} key={idx}>
            <Card
              className="patient-card-animate"
              style={{
                borderLeft:
                  contact.priority === 1
                    ? "4px solid #F44336"
                    : contact.priority === 2
                    ? "4px solid #FF9800"
                    : "4px solid #4CAF50",
                position: "relative",
              }}
              extra={
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "edit",
                        label: "Chỉnh sửa",
                        icon: <EditOutlined />,
                      },
                      {
                        key: "delete",
                        label: "Xóa",
                        icon: <DeleteOutlined />,
                        danger: true,
                      },
                    ],
                  }}
                >
                  <Button type="text" size="small">
                    ...
                  </Button>
                </Dropdown>
              }
            >
              <div>
                <div
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: "15px",
                      color: "#333",
                    }}
                  >
                    👤 {contact?.name || "N/A"}
                  </p>
                  <Badge
                    count={`P${contact?.priority || "?"}`}
                    style={{
                      backgroundColor:
                        contact.priority === 1
                          ? "#F44336"
                          : contact.priority === 2
                          ? "#FF9800"
                          : "#4CAF50",
                    }}
                  />
                </div>
                <Row gutter={[0, 12]}>
                  <Col xs={24}>
                    <p
                      style={{
                        margin: "0 0 2px 0",
                        color: "#999",
                        fontSize: "12px",
                      }}
                    >
                      Mối quan hệ
                    </p>
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      {contact?.relationship || "N/A"}
                    </p>
                  </Col>
                  <Col xs={24}>
                    <p
                      style={{
                        margin: "0 0 2px 0",
                        color: "#999",
                        fontSize: "12px",
                      }}
                    >
                      Số điện thoại
                    </p>
                    <a href={`tel:${contact?.phoneNumber}`}>
                      <p style={{ margin: 0, fontWeight: 600 }}>
                        📞 {contact?.phoneNumber || "N/A"}
                      </p>
                    </a>
                  </Col>
                  <Col xs={24}>
                    <p
                      style={{
                        margin: "0 0 2px 0",
                        color: "#999",
                        fontSize: "12px",
                      }}
                    >
                      Email
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        wordBreak: "break-all",
                      }}
                    >
                      {contact?.email || "N/A"}
                    </p>
                  </Col>
                  <Col xs={24}>
                    <Button
                      icon={<PhoneOutlined />}
                      block
                      type="primary"
                      danger
                      size="small"
                      style={{ marginTop: "8px" }}
                    >
                      Gọi ngay
                    </Button>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        ))}

        {/* Add/Edit Emergency Contact Modal */}
        <Modal
          title="Thêm liên hệ khẩn cấp"
          open={emergencyContactModal}
          onOk={() => {
            contactForm.validateFields().then((values) => {
              handleAddContact(values);
            });
          }}
          onCancel={() => {
            setEmergencyContactModal(false);
            contactForm.resetFields();
          }}
          width={500}
        >
          <Form form={contactForm} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              label="Tên liên hệ"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên liên hệ" }]}
            >
              <Input placeholder="Nhập tên" />
            </Form.Item>
            <Form.Item
              label="Mối quan hệ"
              name="relationship"
              rules={[{ required: true, message: "Vui lòng chọn mối quan hệ" }]}
            >
              <Select
                options={[
                  { label: "Cha/Mẹ", value: "PARENT" },
                  { label: "Vợ/Chồng", value: "SPOUSE" },
                  { label: "Con cái", value: "CHILD" },
                  { label: "Anh/Chị/Em", value: "SIBLING" },
                  { label: "Bạn bè", value: "FRIEND" },
                  { label: "Người giám hộ", value: "GUARDIAN" },
                  { label: "Khác", value: "OTHER" },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input placeholder="Nhập email (tùy chọn)" />
            </Form.Item>
            <Form.Item label="Độ ưu tiên" name="priority" initialValue={1}>
              <Select
                options={[
                  { label: "🔴 Ưu tiên cao (1)", value: 1 },
                  { label: "🟠 Ưu tiên trung bình (2)", value: 2 },
                  { label: "🟢 Ưu tiên thấp (3)", value: 3 },
                ]}
              />
            </Form.Item>
          </Form>
        </Modal>
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
        width: 110,
      },
      {
        title: "⏱️ Thời gian",
        dataIndex: "visitTime",
        key: "visitTime",
        render: (time) => time || "N/A",
        width: 80,
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
        title: "⭐ Đánh giá",
        key: "rating",
        render: (_, record) => (
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedVisitForRating(record._id);
              setRatingModal(true);
            }}
          >
            {record.rating ? `${record.rating}/5 ⭐` : "Đánh giá"}
          </Button>
        ),
        width: 100,
      },
      {
        title: "📄",
        key: "actions",
        render: (_, record) => (
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              title="Xem chi tiết"
            />
            <Button
              type="text"
              size="small"
              icon={<FilePdfOutlined />}
              title="Tải PDF"
            />
          </Space>
        ),
        width: 80,
      },
    ];

    return (
      <>
        <Card title="🏥 Lần khám" className="patient-card-animate">
          <Table
            dataSource={visits.map((v, i) => ({ ...v, key: i }))}
            columns={columns}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1200 }}
            size="small"
          />
        </Card>

        {/* Rating Modal */}
        <Modal
          title="Đánh giá dịch vụ khám"
          open={ratingModal}
          onOk={() => {
            if (rating === 0) {
              message.error("Vui lòng chọn số sao");
              return;
            }
            handleSubmitRating();
          }}
          onCancel={() => {
            setRatingModal(false);
            setRating(0);
          }}
        >
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ marginBottom: "16px", fontSize: "16px" }}>
              Bạn cảm thấy như thế nào về lần khám này?
            </p>
            <Rate
              size="large"
              value={rating}
              onChange={setRating}
              style={{ fontSize: "32px" }}
            />
            <p style={{ marginTop: "16px", color: "#999" }}>
              {rating === 0 && "Chọn số sao để đánh giá"}
              {rating === 1 && "Rất không hài lòng"}
              {rating === 2 && "Không hài lòng"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Hài lòng"}
              {rating === 5 && "Rất hài lòng"}
            </p>
          </div>
        </Modal>
      </>
    );
  };

  // 6️⃣ APPOINTMENTS RENDERER
  const renderAppointments = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Empty description="Chưa có lịch hẹn nào" />
          </Col>
          <Col xs={24}>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              block
              onClick={() => setAppointmentBookModal(true)}
            >
              Đặt lịch hẹn ngay
            </Button>
          </Col>
        </Row>
      );
    }

    const appointments = Array.isArray(data) ? data : [data];
    const upcomingApts = appointments.filter(
      (apt) => new Date(apt.appointmentDate) >= new Date()
    );
    const pastApts = appointments.filter(
      (apt) => new Date(apt.appointmentDate) < new Date()
    );

    return (
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: `📅 Sắp tới (${upcomingApts.length})`,
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    block
                    onClick={() => setAppointmentBookModal(true)}
                  >
                    Đặt lịch hẹn mới
                  </Button>
                </Col>
                {upcomingApts.map((apt, idx) => (
                  <Col xs={24} md={12} lg={8} key={idx}>
                    <Card
                      className="patient-card-animate"
                      style={{ borderTop: "4px solid #00BCD4" }}
                    >
                      <div>
                        <div
                          style={{
                            marginBottom: "16px",
                            paddingBottom: "12px",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          <Tag color="blue">
                            {apt?.status === "CONFIRMED"
                              ? "✅ Đã xác nhận"
                              : apt?.status === "PENDING"
                              ? "⏳ Chờ xác nhận"
                              : "❌ Đã hủy"}
                          </Tag>
                        </div>
                        <Row gutter={[0, 12]}>
                          <Col xs={24}>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Ngày hẹn
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 700,
                                fontSize: "15px",
                              }}
                            >
                              {apt?.appointmentDate?.slice(0, 10) || "N/A"}
                            </p>
                          </Col>
                          <Col xs={24}>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Thời gian
                            </p>
                            <p style={{ margin: 0, fontWeight: 600 }}>
                              {apt?.appointmentTime || "N/A"}
                            </p>
                          </Col>
                          <Col xs={24}>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Bác sĩ
                            </p>
                            <p style={{ margin: 0, fontWeight: 600 }}>
                              {apt?.doctorName || "N/A"}
                            </p>
                          </Col>
                          <Col xs={24}>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Lý do
                            </p>
                            <p style={{ margin: 0, fontSize: "13px" }}>
                              {apt?.reason || "N/A"}
                            </p>
                          </Col>
                          <Col xs={12}>
                            <Button
                              type="primary"
                              size="small"
                              block
                              style={{ marginTop: "8px" }}
                            >
                              Đổi lịch
                            </Button>
                          </Col>
                          <Col xs={12}>
                            <Popconfirm
                              title="Hủy lịch hẹn?"
                              description="Bạn có chắc muốn hủy lịch hẹn này?"
                              onConfirm={() =>
                                message.success("Hủy lịch hẹn thành công")
                              }
                              okText="Có"
                              cancelText="Không"
                            >
                              <Button
                                danger
                                size="small"
                                block
                                style={{ marginTop: "8px" }}
                              >
                                Hủy
                              </Button>
                            </Popconfirm>
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ),
          },
          {
            key: "2",
            label: `📋 Lịch sử (${pastApts.length})`,
            children: (
              <Row gutter={[16, 16]}>
                {pastApts.length > 0 ? (
                  pastApts.map((apt, idx) => (
                    <Col xs={24} md={12} lg={8} key={idx}>
                      <Card
                        className="patient-card-animate"
                        style={{ borderTop: "4px solid #4CAF50" }}
                      >
                        <Row gutter={[0, 12]}>
                          <Col xs={24}>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Ngày khám
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 700,
                                fontSize: "15px",
                              }}
                            >
                              {apt?.appointmentDate?.slice(0, 10) || "N/A"}
                            </p>
                          </Col>
                          <Col xs={24}>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Bác sĩ
                            </p>
                            <p style={{ margin: 0, fontWeight: 600 }}>
                              {apt?.doctorName || "N/A"}
                            </p>
                          </Col>
                          <Col xs={24}>
                            <Button block size="small">
                              Xem chi tiết
                            </Button>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col xs={24}>
                    <Empty description="Không có lịch sử" />
                  </Col>
                )}
              </Row>
            ),
          },
        ]}
      />
    );
  };

  // 7️⃣ PRESCRIPTIONS RENDERER
  const renderPrescriptions = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <Empty description="Chưa có đơn thuốc nào" />;
    }

    const prescriptions = Array.isArray(data) ? data : [data];
    const activePrescriptions = prescriptions.filter(
      (rx) => rx.status === "ACTIVE"
    );
    const expiredPrescriptions = prescriptions.filter(
      (rx) => rx.status !== "ACTIVE"
    );

    return (
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: `💊 Hiệu lực (${activePrescriptions.length})`,
            children: (
              <Row gutter={[16, 16]}>
                {activePrescriptions.map((rx, idx) => (
                  <Col xs={24} md={12} key={idx}>
                    <Card
                      className="patient-card-animate"
                      style={{ borderLeft: "4px solid #4CAF50" }}
                    >
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <div>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Tên thuốc
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 700,
                                fontSize: "15px",
                                color: "#333",
                              }}
                            >
                              {rx?.medicationName || "N/A"}
                            </p>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Liều lượng
                            </p>
                            <p style={{ margin: 0, fontWeight: 600 }}>
                              {rx?.dosage || "N/A"}
                            </p>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Tần suất
                            </p>
                            <p style={{ margin: 0, fontWeight: 600 }}>
                              {rx?.frequency || "N/A"}
                            </p>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Số ngày
                            </p>
                            <p style={{ margin: 0, fontWeight: 600 }}>
                              {rx?.durationDays || "N/A"} ngày
                            </p>
                          </div>
                        </Col>
                        <Col xs={24}>
                          <div>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                color: "#999",
                                fontSize: "12px",
                              }}
                            >
                              Chỉ dẫn
                            </p>
                            <p style={{ margin: 0, fontSize: "13px" }}>
                              {rx?.instructions || "Không có chỉ dẫn"}
                            </p>
                          </div>
                        </Col>
                        <Col xs={24}>
                          <div
                            style={{
                              paddingTop: "12px",
                              borderTop: "1px solid #f0f0f0",
                              display: "flex",
                              gap: "8px",
                            }}
                          >
                            <Button
                              type="primary"
                              block
                              size="small"
                              icon={<ReloadOutlined />}
                              onClick={() => handleRequestRefill(rx._id)}
                            >
                              Cấp lại
                            </Button>
                            <Button
                              type="default"
                              size="small"
                              icon={<FilePdfOutlined />}
                            >
                              PDF
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            ),
          },
          {
            key: "2",
            label: `📋 Hết hạn (${expiredPrescriptions.length})`,
            children: (
              <Row gutter={[16, 16]}>
                {expiredPrescriptions.length > 0 ? (
                  expiredPrescriptions.map((rx, idx) => (
                    <Col xs={24} md={12} key={idx}>
                      <Card
                        className="patient-card-animate"
                        style={{
                          borderLeft: "4px solid #f44336",
                          opacity: 0.7,
                        }}
                      >
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12}>
                            <div>
                              <p
                                style={{
                                  margin: "0 0 4px 0",
                                  color: "#999",
                                  fontSize: "12px",
                                }}
                              >
                                Tên thuốc
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontWeight: 700,
                                  fontSize: "15px",
                                }}
                              >
                                {rx?.medicationName || "N/A"}
                              </p>
                            </div>
                          </Col>
                          <Col xs={24} sm={12}>
                            <div>
                              <p
                                style={{
                                  margin: "0 0 4px 0",
                                  color: "#999",
                                  fontSize: "12px",
                                }}
                              >
                                Liều lượng
                              </p>
                              <p style={{ margin: 0, fontWeight: 600 }}>
                                {rx?.dosage || "N/A"}
                              </p>
                            </div>
                          </Col>
                        </Row>
                        <Tag color="red" style={{ marginTop: "12px" }}>
                          ❌ Hết hạn
                        </Tag>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col xs={24}>
                    <Empty description="Không có đơn thuốc hết hạn" />
                  </Col>
                )}
              </Row>
            ),
          },
        ]}
      />
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
        title: "📏 Bình thường",
        dataIndex: "normalRange",
        key: "normalRange",
        render: (range) => range || "N/A",
      },
      {
        title: "⚠️ Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag
            color={
              status === "NORMAL"
                ? "green"
                : status === "ABNORMAL"
                ? "red"
                : "orange"
            }
          >
            {status === "NORMAL"
              ? "✅ Bình thường"
              : status === "ABNORMAL"
              ? "⚠️ Bất thường"
              : "🔍 Chờ xác nhận"}
          </Tag>
        ),
      },
      {
        title: "📄",
        key: "actions",
        render: (_, record) => (
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<FilePdfOutlined />}
              title="Tải PDF"
            />
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              title="Chi tiết"
            />
          </Space>
        ),
        width: 100,
      },
    ];

    return (
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "📊 Kết quả mới nhất",
            children: (
              <Card className="patient-card-animate">
                <Table
                  dataSource={results
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((r, i) => ({ ...r, key: i }))}
                  columns={columns}
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: 1200 }}
                  size="small"
                />
              </Card>
            ),
          },
          {
            key: "2",
            label: "📈 Lịch sử",
            children: (
              <Card className="patient-card-animate">
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ fontWeight: 600, marginBottom: "12px" }}>
                    Lọc theo năm:
                  </p>
                  <Space wrap>
                    <Button>Năm nay</Button>
                    <Button>Năm trước</Button>
                    <Button>2 năm trước</Button>
                    <Button>Tất cả</Button>
                  </Space>
                </div>
                <Table
                  dataSource={results.map((r, i) => ({ ...r, key: i }))}
                  columns={columns}
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: 1200 }}
                  size="small"
                />
              </Card>
            ),
          },
          {
            key: "3",
            label: "🚨 Bất thường",
            children: (
              <Card className="patient-card-animate">
                {results.filter((r) => r.status === "ABNORMAL").length > 0 ? (
                  <Table
                    dataSource={results
                      .filter((r) => r.status === "ABNORMAL")
                      .map((r, i) => ({ ...r, key: i }))}
                    columns={columns}
                    pagination={{ pageSize: 8 }}
                    scroll={{ x: 1200 }}
                    size="small"
                  />
                ) : (
                  <Empty description="Không có kết quả bất thường" />
                )}
              </Card>
            ),
          },
        ]}
      />
    );
  };

  // MAIN RENDER CONTENT FUNCTION
  const renderContent = () => {
    if (selectedMenu === "home") {
      return renderHome();
    }

    if (loading) {
      return (
        <Spin
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "40px",
          }}
        />
      );
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
