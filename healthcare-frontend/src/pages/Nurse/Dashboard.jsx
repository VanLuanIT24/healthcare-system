import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Badge,
  message,
  Avatar,
  Space,
  Menu,
  Empty,
  Spin,
  Table,
  Tag,
  Form,
  Input,
  InputNumber,
  Drawer,
  Modal,
  Tooltip,
  Divider,
  Alert,
  Progress,
  List,
  Segmented,
  Timeline,
  Select,
  Collapse,
} from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  HeartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  DashboardOutlined,
  PlusOutlined,
  EyeOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  BgColorsOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  RiseOutlined,
  DownloadOutlined,
  PrinterOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  SearchOutlined,
  FilterOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../utils/api";
import "./NurseDashboard.css";

const { Header, Sider, Content } = Layout;

const NurseDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Dashboard Stats with animation
  const [stats, setStats] = useState({
    assignedPatients: 12,
    todayAppointments: 5,
    pendingCare: 3,
    vitalAnomalies: 1,
    completedTasks: 7,
    totalTasks: 12,
  });

  // Patient List
  const [patientsList] = useState([
    {
      id: "P001",
      name: "Nguyễn Văn A",
      age: 45,
      room: "301",
      diagnosis: "Tiểu đường loại 2",
      status: "care_in_progress",
      lastVitals: "10:30 AM",
      priority: "medium",
      phone: "0901234567",
      email: "nguyen.a@email.com",
    },
    {
      id: "P002",
      name: "Trần Thị B",
      age: 62,
      room: "302",
      diagnosis: "Huyết áp cao",
      status: "needs_care",
      lastVitals: "9:15 AM",
      priority: "high",
      phone: "0912345678",
      email: "tran.b@email.com",
    },
    {
      id: "P003",
      name: "Lê Văn C",
      age: 55,
      room: "303",
      diagnosis: "COPD",
      status: "stable",
      lastVitals: "11:00 AM",
      priority: "low",
      phone: "0923456789",
      email: "le.c@email.com",
    },
  ]);

  // Medical Records Data
  const [medicalRecords] = useState({
    P001: {
      bloodType: "O+",
      allergies: ["Penicillin"],
      chronicConditions: ["Tiểu đường loại 2"],
      currentMedications: [
        { name: "Insulin", dosage: "20 units", frequency: "2x daily" },
        { name: "Metformin", dosage: "500mg", frequency: "3x daily" },
      ],
      lastVisit: "2025-11-28",
      doctor: "Dr. Nguyễn Hữu Lực",
      diagnosis: "Type 2 Diabetes Mellitus",
      treatment: "Insulin therapy, dietary management",
      notes: "Patient compliant with treatment regimen",
    },
    P002: {
      bloodType: "A+",
      allergies: ["Aspirin"],
      chronicConditions: ["Huyết áp cao"],
      currentMedications: [
        { name: "Lisinopril", dosage: "10mg", frequency: "daily" },
        { name: "Amlodipine", dosage: "5mg", frequency: "daily" },
      ],
      lastVisit: "2025-11-27",
      doctor: "Dr. Trương Minh Tâm",
      diagnosis: "Hypertension Stage 2",
      treatment: "ACE inhibitor + CCB combination",
      notes: "Monitor for dizziness",
    },
    P003: {
      bloodType: "B+",
      allergies: [],
      chronicConditions: ["COPD"],
      currentMedications: [
        { name: "Salbutamol", dosage: "100mcg", frequency: "as needed" },
        { name: "Fluticasone", dosage: "250mcg", frequency: "2x daily" },
      ],
      lastVisit: "2025-11-26",
      doctor: "Dr. Võ Thanh Lâm",
      diagnosis: "COPD Gold Stage 2",
      treatment: "Inhaled corticosteroids + bronchodilators",
      notes: "Monitor respiratory rate closely",
    },
  });

  // Vital Signs
  const [vitalRecords, setVitalRecords] = useState({
    P001: [
      {
        time: "10:30 AM",
        temperature: 36.8,
        bloodPressure: "130/85",
        heartRate: 78,
        respiratoryRate: 18,
        oxygenSaturation: 97,
        note: "Normal",
      },
      {
        time: "2:30 PM",
        temperature: 36.9,
        bloodPressure: "128/82",
        heartRate: 76,
        respiratoryRate: 18,
        oxygenSaturation: 98,
        note: "Normal",
      },
    ],
    P002: [
      {
        time: "9:15 AM",
        temperature: 37.1,
        bloodPressure: "145/92",
        heartRate: 82,
        respiratoryRate: 20,
        oxygenSaturation: 96,
        note: "BP elevated",
      },
    ],
    P003: [
      {
        time: "11:00 AM",
        temperature: 36.7,
        bloodPressure: "120/80",
        heartRate: 72,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        note: "Good",
      },
    ],
  });

  // Nursing Notes
  const [nursingNotes] = useState({
    P001: [
      {
        time: "8:30 AM",
        note: "Patient alert and oriented, no complaints",
        nurse: "Y.T. Linh",
        category: "assessment",
      },
      {
        time: "2:00 PM",
        note: "Assisted with ambulation, tolerates well",
        nurse: "Y.T. Linh",
        category: "intervention",
      },
    ],
  });

  // Modals
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [recordDrawerVisible, setRecordDrawerVisible] = useState(false);
  const [vitalDrawerVisible, setVitalDrawerVisible] = useState(false);
  const [vitalForm] = Form.useForm();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // API call here: const response = await apiClient.get('/nurse/dashboard');
    } catch (error) {
      console.error("Error loading dashboard:", error);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/superadmin/login", { replace: true });
  };

  const showMedicalRecord = (patient) => {
    setSelectedPatient(patient);
    setRecordDrawerVisible(true);
  };

  const showVitalInput = (patient) => {
    setSelectedPatient(patient);
    vitalForm.resetFields();
    setVitalDrawerVisible(true);
  };

  const handleAddVitalSigns = async (values) => {
    if (!selectedPatient) return;

    const newVital = {
      time: new Date().toLocaleTimeString("vi-VN"),
      ...values,
      note: values.note || "Normal",
    };

    const patientId = selectedPatient.id;
    if (!vitalRecords[patientId]) {
      vitalRecords[patientId] = [];
    }

    vitalRecords[patientId].unshift(newVital);
    setVitalRecords({ ...vitalRecords });
    message.success("Cập nhật sinh hiệu thành công");
    setVitalDrawerVisible(false);
    vitalForm.resetFields();
  };

  const getStatusColor = (status) => {
    const colors = {
      care_in_progress: "processing",
      needs_care: "warning",
      stable: "success",
      critical: "error",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      care_in_progress: "Đang chăm sóc",
      needs_care: "Cần chăm sóc",
      stable: "Ổn định",
      critical: "Nguy hiểm",
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "red",
      medium: "orange",
      low: "green",
    };
    return colors[priority] || "default";
  };

  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "2",
      icon: <UserOutlined />,
      label: "Danh Sách Bệnh Nhân",
    },
    {
      key: "3",
      icon: <FileTextOutlined />,
      label: "Hồ Sơ Bệnh Án",
    },
    {
      key: "4",
      icon: <HeartOutlined />,
      label: "Sinh Hiệu & Ghi Chú",
    },
  ];

  const patientColumns = [
    {
      title: "Bệnh Nhân",
      key: "patient",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.name}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: "Tuổi / Phòng",
      key: "info",
      render: (_, record) => `${record.age} tuổi / P. ${record.room}`,
      width: 120,
    },
    {
      title: "Chẩn Đoán",
      dataIndex: "diagnosis",
      width: 180,
    },
    {
      title: "Tình Trạng",
      key: "status",
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusLabel(record.status)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Ưu Tiên",
      key: "priority",
      render: (_, record) => (
        <Badge
          color={getPriorityColor(record.priority)}
          text={
            record.priority === "high"
              ? "Cao"
              : record.priority === "medium"
              ? "Trung Bình"
              : "Thấp"
          }
        />
      ),
      width: 100,
    },
    {
      title: "Sinh Hiệu",
      key: "lastVitals",
      render: (_, record) => (
        <span style={{ fontSize: "12px", color: "#666" }}>
          {record.lastVitals}
        </span>
      ),
      width: 100,
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Hồ sơ">
            <Button
              type="text"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => showMedicalRecord(record)}
            />
          </Tooltip>
          <Tooltip title="Sinh hiệu">
            <Button
              type="text"
              size="small"
              icon={<HeartOutlined />}
              onClick={() => showVitalInput(record)}
            />
          </Tooltip>
        </Space>
      ),
      width: 100,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#0f172a" }}>
      {/* MODERN SIDEBAR */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={280}
        theme="dark"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          boxShadow: "4px 0 20px rgba(0,0,0,0.3)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          position: "relative",
        }}
      >
        {/* Logo Section */}
        <div className="nurse-sidebar-logo">
          <div className="logo-icon-wrapper">
            <HeartOutlined className="pulse-icon" />
          </div>
          {!collapsed && (
            <div style={{ textAlign: "center" }}>
              <div className="logo-title">NURSE CARE</div>
              <div className="logo-subtitle">v2.0 Professional</div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(e) => setSelectedKey(e.key)}
          items={[
            {
              key: "1",
              icon: <DashboardOutlined style={{ fontSize: "16px" }} />,
              label: "Dashboard",
              className: "menu-item-custom",
            },
            {
              key: "2",
              icon: <TeamOutlined style={{ fontSize: "16px" }} />,
              label: "Bệnh Nhân",
              className: "menu-item-custom",
            },
            {
              key: "3",
              icon: <FileTextOutlined style={{ fontSize: "16px" }} />,
              label: "Hồ Sơ Bệnh Án",
              className: "menu-item-custom",
            },
            {
              key: "4",
              icon: <HeartOutlined style={{ fontSize: "16px" }} />,
              label: "Sinh Hiệu & Ghi Chú",
              className: "menu-item-custom",
            },
            {
              key: "5",
              icon: <MedicineBoxOutlined style={{ fontSize: "16px" }} />,
              label: "Quản Lý Thuốc",
              className: "menu-item-custom",
            },
          ]}
          style={{
            background: "transparent",
            border: "none",
            paddingTop: "20px",
          }}
        />

        {/* Footer Section */}
        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <Avatar
              size={40}
              style={{
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              }}
              icon={<UserOutlined />}
            />
            {!collapsed && (
              <div>
                <div className="sidebar-user-name">
                  {user?.personalInfo?.firstName || "Nguyễn"}
                </div>
                <div className="sidebar-user-role">Điều Dưỡng</div>
              </div>
            )}
          </div>
        </div>
      </Sider>

      {/* MAIN LAYOUT */}
      <Layout style={{ background: "#f0f4f8" }}>
        {/* PROFESSIONAL HEADER */}
        <Layout.Header
          className="nurse-header-modern"
          style={{
            background:
              "linear-gradient(90deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
            padding: "0 32px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e2e8f0",
            height: 80,
          }}
        >
          <div className="header-left">
            <div className="header-title-group">
              <h1 className="header-main-title">Hệ Thống Chăm Sóc Bệnh Nhân</h1>
              <p className="header-subtitle">
                Quản lý hiệu quả và theo dõi sức khỏe bệnh nhân 24/7
              </p>
            </div>
          </div>

          <div className="header-right">
            <Space size={20} align="center">
              <Tooltip title="Làm mới dữ liệu">
                <Button
                  type="text"
                  shape="circle"
                  icon={<SyncOutlined style={{ fontSize: "18px" }} />}
                  className="header-icon-btn"
                />
              </Tooltip>

              <Divider type="vertical" style={{ height: 24 }} />

              <div className="header-user-section">
                <Avatar
                  size={48}
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  }}
                  icon={<UserOutlined />}
                />
                <div className="header-user-info">
                  <div className="header-user-name">
                    {user?.personalInfo?.firstName || "Y Tá"}
                  </div>
                  <div className="header-user-status">Trực tuyến</div>
                </div>
              </div>

              <Button
                type="primary"
                danger
                size="large"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="logout-btn"
              >
                Đăng Xuất
              </Button>
            </Space>
          </div>
        </Layout.Header>

        {/* CONTENT AREA */}
        <Layout.Content style={{ padding: "24px 32px", overflow: "auto" }}>
          <Spin spinning={loading} size="large">
            {/* ========== TAB 1: DASHBOARD ========== */}
            {selectedKey === "1" && (
              <div className="dashboard-container">
                {/* ALERT BANNER */}
                <Alert
                  message="⚠️ Cảnh báo: 1 bệnh nhân có dấu hiệu bất thường"
                  description="Bệnh nhân Trần Thị B (P.302) có huyết áp cao - Cần theo dõi gần gũi"
                  type="warning"
                  showIcon
                  closable
                  className="alert-banner-custom"
                  style={{ marginBottom: 24 }}
                />

                {/* STAT CARDS - Row 1 */}
                <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                  {[
                    {
                      title: "Bệnh Nhân Được Giao",
                      value: 12,
                      prefix: <TeamOutlined />,
                      color: "#3b82f6",
                      bgColor: "#eff6ff",
                    },
                    {
                      title: "Lịch Hẹn Hôm Nay",
                      value: 5,
                      prefix: <CalendarOutlined />,
                      color: "#22c55e",
                      bgColor: "#f0fdf4",
                    },
                    {
                      title: "Cần Chăm Sóc",
                      value: 3,
                      prefix: <AlertOutlined />,
                      color: "#f59e0b",
                      bgColor: "#fffbeb",
                    },
                    {
                      title: "Bất Thường Sinh Hiệu",
                      value: 1,
                      prefix: <HeartOutlined />,
                      color: "#ef4444",
                      bgColor: "#fef2f2",
                    },
                  ].map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                      <div className="stat-card-wrapper">
                        <Card
                          className="stat-card-modern"
                          style={{
                            borderTop: `4px solid ${stat.color}`,
                            borderRadius: "12px",
                          }}
                          hoverable
                        >
                          <div className="stat-card-content">
                            <div
                              className="stat-icon"
                              style={{ color: stat.color }}
                            >
                              {stat.prefix}
                            </div>
                            <div className="stat-info">
                              <div className="stat-value">{stat.value}</div>
                              <div className="stat-title">{stat.title}</div>
                            </div>
                          </div>
                          <div className="stat-trend">
                            <RiseOutlined style={{ color: "#22c55e" }} />
                            <span>+2.5%</span>
                          </div>
                        </Card>
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* STAT CARDS - Row 2 (Task Progress) */}
                <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                  <Col xs={24} lg={12}>
                    <Card
                      className="card-modern"
                      title="Tiến Độ Công Việc Hôm Nay"
                    >
                      <div style={{ padding: "20px 0" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "16px",
                          }}
                        >
                          <span>
                            Hoàn thành: {stats.completedTasks}/
                            {stats.totalTasks} công việc
                          </span>
                          <strong>
                            {Math.round(
                              (stats.completedTasks / stats.totalTasks) * 100
                            )}
                            %
                          </strong>
                        </div>
                        <Progress
                          percent={Math.round(
                            (stats.completedTasks / stats.totalTasks) * 100
                          )}
                          strokeColor={{
                            "0%": "#f59e0b",
                            "100%": "#22c55e",
                          }}
                          status="active"
                          strokeWidth={8}
                        />
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card className="card-modern" title="Thống Kê Ngày Hôm Nay">
                      <List
                        size="small"
                        dataSource={[
                          {
                            label: "Bệnh nhân kiểm tra",
                            value: 8,
                            icon: "✓",
                            color: "#22c55e",
                          },
                          {
                            label: "Lần cấp thuốc",
                            value: 12,
                            icon: "💊",
                            color: "#3b82f6",
                          },
                          {
                            label: "Ghi chú lâm sàng",
                            value: 15,
                            icon: "📝",
                            color: "#8b5cf6",
                          },
                          {
                            label: "Báo cáo với bác sĩ",
                            value: 5,
                            icon: "👨‍⚕️",
                            color: "#ec4899",
                          },
                        ]}
                        renderItem={(item) => (
                          <List.Item style={{ padding: "12px 0" }}>
                            <div
                              style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "8px",
                                  background: `${item.color}15`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "18px",
                                }}
                              >
                                {item.icon}
                              </div>
                              <div>
                                <div
                                  style={{ fontSize: "13px", color: "#666" }}
                                >
                                  {item.label}
                                </div>
                              </div>
                            </div>
                            <strong
                              style={{ color: item.color, fontSize: "18px" }}
                            >
                              {item.value}
                            </strong>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* PATIENT ATTENTION & TASKS */}
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Card
                      className="card-modern"
                      title="🚨 Bệnh Nhân Cần Chú Ý"
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        {patientsList
                          .filter((p) => p.status !== "stable")
                          .map((patient) => (
                            <div
                              key={patient.id}
                              className="patient-attention-card"
                            >
                              <div>
                                <div className="attention-patient-name">
                                  {patient.name}
                                </div>
                                <div className="attention-patient-info">
                                  Phòng {patient.room} • {patient.diagnosis}
                                </div>
                              </div>
                              <Badge
                                color={getPriorityColor(patient.priority)}
                                text={
                                  patient.priority === "high"
                                    ? "🔴 CAO"
                                    : "🟠 TRUNG"
                                }
                              />
                            </div>
                          ))}
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card className="card-modern" title="✅ Công Việc Hôm Nay">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        {[
                          "Kiểm tra sinh hiệu lúc 9h",
                          "Cấp thuốc cho 5 bệnh nhân",
                          "Thay băng cho bệnh nhân phòng 301",
                          "Báo cáo với bác sĩ",
                        ].map((task, i) => (
                          <div key={i} className="task-item-modern">
                            <CheckCircleOutlined
                              style={{
                                color: i < 3 ? "#22c55e" : "#94a3b8",
                                fontSize: "16px",
                              }}
                            />
                            <span
                              style={{
                                textDecoration: i < 3 ? "line-through" : "none",
                                color: i < 3 ? "#94a3b8" : "#1e293b",
                              }}
                            >
                              {task}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {/* ========== TAB 2: PATIENT LIST ========== */}
            {selectedKey === "2" && (
              <div>
                <Card
                  className="card-modern"
                  title="Danh Sách Bệnh Nhân Được Giao"
                >
                  <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col xs={24} sm={12} lg={8}>
                      <Input
                        placeholder="🔍 Tìm kiếm bệnh nhân..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-modern"
                      />
                    </Col>
                    <Col xs={24} sm={12} lg={8}>
                      <Select
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={[
                          { label: "Tất cả", value: "all" },
                          { label: "Đang chăm sóc", value: "care_in_progress" },
                          { label: "Cần chăm sóc", value: "needs_care" },
                          { label: "Ổn định", value: "stable" },
                        ]}
                        style={{ width: "100%" }}
                      />
                    </Col>
                    <Col xs={24} sm={12} lg={8}>
                      <Button
                        type="primary"
                        icon={<SyncOutlined />}
                        block
                        className="btn-modern"
                      >
                        Làm Mới
                      </Button>
                    </Col>
                  </Row>

                  <Table
                    columns={patientColumns}
                    dataSource={patientsList}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }}
                    className="table-modern"
                  />
                </Card>
              </div>
            )}

            {/* ========== TAB 3: MEDICAL RECORDS ========== */}
            {selectedKey === "3" && (
              <Card className="card-modern" title="Danh Sách Hồ Sơ Bệnh Án">
                <Table
                  columns={[
                    {
                      title: "Bệnh Nhân",
                      dataIndex: "name",
                      key: "name",
                      render: (text) => <strong>{text}</strong>,
                    },
                    {
                      title: "Tuổi",
                      dataIndex: "age",
                      key: "age",
                      width: 60,
                    },
                    {
                      title: "Phòng",
                      dataIndex: "room",
                      key: "room",
                      width: 70,
                    },
                    {
                      title: "Chẩn Đoán",
                      dataIndex: "diagnosis",
                      key: "diagnosis",
                    },
                    {
                      title: "Hành Động",
                      key: "action",
                      width: 120,
                      render: (_, record) => (
                        <Button
                          type="primary"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => showMedicalRecord(record)}
                          className="btn-modern"
                        >
                          Chi Tiết
                        </Button>
                      ),
                    },
                  ]}
                  dataSource={patientsList}
                  rowKey="id"
                  pagination={false}
                  className="table-modern"
                />
              </Card>
            )}

            {/* ========== TAB 4: VITAL SIGNS ========== */}
            {selectedKey === "4" && (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card
                    className="card-modern"
                    title="📊 Theo Dõi Sinh Hiệu"
                    extra={
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        className="btn-modern"
                      >
                        Thêm
                      </Button>
                    }
                  >
                    {patientsList.map((patient) => (
                      <div key={patient.id} style={{ marginBottom: 20 }}>
                        <div className="vital-patient-header">
                          {patient.name}
                        </div>
                        {vitalRecords[patient.id]
                          ?.slice(0, 2)
                          .map((vital, i) => (
                            <div key={i} className="vital-record-item">
                              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                                {vital.time}
                              </div>
                              <Row gutter={[12, 12]}>
                                <Col xs={12} sm={8}>
                                  <div className="vital-value">
                                    <div className="vital-icon">🌡️</div>
                                    <div>
                                      <div className="vital-label">
                                        Nhiệt độ
                                      </div>
                                      <div className="vital-data">
                                        {vital.temperature}°C
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                                <Col xs={12} sm={8}>
                                  <div className="vital-value">
                                    <div className="vital-icon">❤️</div>
                                    <div>
                                      <div className="vital-label">
                                        Nhịp tim
                                      </div>
                                      <div className="vital-data">
                                        {vital.heartRate} bpm
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                                <Col xs={12} sm={8}>
                                  <div className="vital-value">
                                    <div className="vital-icon">🫁</div>
                                    <div>
                                      <div className="vital-label">Hô hấp</div>
                                      <div className="vital-data">
                                        {vital.respiratoryRate}/min
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                                <Col xs={12} sm={8}>
                                  <div className="vital-value">
                                    <div className="vital-icon">💨</div>
                                    <div>
                                      <div className="vital-label">
                                        Huyết áp
                                      </div>
                                      <div className="vital-data">
                                        {vital.bloodPressure}
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                                <Col xs={12} sm={8}>
                                  <div className="vital-value">
                                    <div className="vital-icon">O₂</div>
                                    <div>
                                      <div className="vital-label">SpO₂</div>
                                      <div className="vital-data">
                                        {vital.oxygenSaturation}%
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          ))}
                        <Button
                          type="dashed"
                          block
                          size="small"
                          onClick={() => showVitalInput(patient)}
                          style={{ marginTop: 12 }}
                          className="btn-dashed-modern"
                        >
                          Nhập Sinh Hiệu Mới
                        </Button>
                        <Divider style={{ margin: "12px 0" }} />
                      </div>
                    ))}
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card className="card-modern" title="📝 Ghi Chú Điều Dưỡng">
                    {patientsList.map((patient) => (
                      <div key={patient.id} style={{ marginBottom: 20 }}>
                        <div className="vital-patient-header">
                          {patient.name}
                        </div>
                        {nursingNotes[patient.id]?.map((note, i) => (
                          <div
                            key={i}
                            className={`nursing-note ${note.category}`}
                          >
                            <div className="note-header">
                              <span className="note-time">{note.time}</span>
                              <span className="note-nurse">
                                Bác sĩ: {note.nurse}
                              </span>
                            </div>
                            <div className="note-content">{note.note}</div>
                          </div>
                        ))}
                        <Button
                          type="dashed"
                          block
                          size="small"
                          style={{ marginTop: 12 }}
                          className="btn-dashed-modern"
                        >
                          Thêm Ghi Chú
                        </Button>
                        <Divider style={{ margin: "12px 0" }} />
                      </div>
                    ))}
                  </Card>
                </Col>
              </Row>
            )}

            {/* ========== TAB 5: MEDICINE MANAGEMENT ========== */}
            {selectedKey === "5" && (
              <Card className="card-modern" title="Quản Lý Thuốc">
                <Alert
                  message="ℹ️ Công năng quản lý thuốc sẽ được phát triển thêm"
                  type="info"
                  showIcon
                  style={{ marginBottom: 20 }}
                />
                <Empty description="Chức năng sẽ sớm có sẵn" />
              </Card>
            )}
          </Spin>
        </Layout.Content>
      </Layout>

      {/* ========== DRAWERS & MODALS ========== */}
      {/* Medical Record Drawer */}
      <Drawer
        title={`📋 Hồ Sơ Bệnh Án - ${selectedPatient?.name}`}
        placement="right"
        onClose={() => setRecordDrawerVisible(false)}
        open={recordDrawerVisible}
        width={500}
        bodyStyle={{ padding: 0 }}
        headerStyle={{
          background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
          color: "white",
        }}
      >
        {selectedPatient && medicalRecords[selectedPatient.id] && (
          <div className="medical-record-drawer">
            <Collapse
              items={[
                {
                  key: "1",
                  label: "👤 Thông Tin Cá Nhân",
                  children: (
                    <div className="record-section">
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <div className="info-item">
                            <div className="info-label">Nhóm máu</div>
                            <div className="info-value">
                              {medicalRecords[selectedPatient.id].bloodType}
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div className="info-item">
                            <div className="info-label">Tuổi</div>
                            <div className="info-value">
                              {selectedPatient.age}
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div className="info-item">
                            <div className="info-label">Phòng</div>
                            <div className="info-value">
                              {selectedPatient.room}
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div className="info-item">
                            <div className="info-label">Điện thoại</div>
                            <div className="info-value">
                              {selectedPatient.phone}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ),
                },
                {
                  key: "2",
                  label: "⚠️ Dị Ứng",
                  children: (
                    <div className="record-section">
                      {medicalRecords[selectedPatient.id].allergies.length >
                      0 ? (
                        medicalRecords[selectedPatient.id].allergies.map(
                          (allergen, i) => (
                            <Tag
                              key={i}
                              color="red"
                              style={{ marginBottom: 8 }}
                            >
                              {allergen}
                            </Tag>
                          )
                        )
                      ) : (
                        <span style={{ color: "#999" }}>Không có dị ứng</span>
                      )}
                    </div>
                  ),
                },
                {
                  key: "3",
                  label: "🏥 Bệnh Lý Mãn Tính",
                  children: (
                    <div className="record-section">
                      {medicalRecords[selectedPatient.id].chronicConditions.map(
                        (cond, i) => (
                          <Tag key={i} color="blue" style={{ marginBottom: 8 }}>
                            {cond}
                          </Tag>
                        )
                      )}
                    </div>
                  ),
                },
                {
                  key: "4",
                  label: "💊 Thuốc Hiện Dùng",
                  children: (
                    <div className="record-section">
                      {medicalRecords[
                        selectedPatient.id
                      ].currentMedications.map((med, i) => (
                        <div key={i} className="medicine-item">
                          <div className="medicine-name">{med.name}</div>
                          <div className="medicine-details">
                            {med.dosage} • {med.frequency}
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  key: "5",
                  label: "📋 Chẩn Đoán & Điều Trị",
                  children: (
                    <div className="record-section">
                      <div className="info-item">
                        <div className="info-label">Bác sĩ</div>
                        <div className="info-value">
                          {medicalRecords[selectedPatient.id].doctor}
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Chẩn đoán</div>
                        <div className="info-value">
                          {medicalRecords[selectedPatient.id].diagnosis}
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Điều trị</div>
                        <div className="info-value">
                          {medicalRecords[selectedPatient.id].treatment}
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Ghi chú</div>
                        <div className="info-value">
                          {medicalRecords[selectedPatient.id].notes}
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Drawer>

      {/* Vital Signs Input Modal */}
      <Modal
        title={`💉 Nhập Sinh Hiệu - ${selectedPatient?.name}`}
        open={vitalDrawerVisible}
        onCancel={() => setVitalDrawerVisible(false)}
        onOk={() => vitalForm.submit()}
        width={600}
        okText="Lưu"
        cancelText="Hủy"
        className="modal-modern"
      >
        <Form form={vitalForm} layout="vertical" onFinish={handleAddVitalSigns}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="🌡️ Nhiệt Độ (°C)"
                name="temperature"
                rules={[{ required: true, message: "Vui lòng nhập nhiệt độ" }]}
              >
                <InputNumber
                  min={35}
                  max={43}
                  step={0.1}
                  placeholder="36.5"
                  className="input-modern"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="❤️ Nhịp Tim (bpm)"
                name="heartRate"
                rules={[{ required: true, message: "Vui lòng nhập nhịp tim" }]}
              >
                <InputNumber
                  min={30}
                  max={200}
                  placeholder="72"
                  className="input-modern"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="💨 Huyết Áp (mmHg)"
                name="bloodPressure"
                rules={[{ required: true, message: "Vui lòng nhập huyết áp" }]}
              >
                <Input placeholder="120/80" className="input-modern" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="🫁 Tần Số Hô Hấp (/min)"
                name="respiratoryRate"
                rules={[
                  { required: true, message: "Vui lòng nhập tần số hô hấp" },
                ]}
              >
                <InputNumber
                  min={5}
                  max={50}
                  placeholder="16"
                  className="input-modern"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="O₂ SpO₂ (%)"
                name="oxygenSaturation"
                rules={[{ required: true, message: "Vui lòng nhập SpO₂" }]}
              >
                <InputNumber
                  min={50}
                  max={100}
                  placeholder="98"
                  className="input-modern"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="📝 Ghi Chú" name="note">
                <Input.TextArea
                  rows={4}
                  placeholder="Ghi chú tình trạng bệnh nhân..."
                  className="input-modern"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  );
};

export default NurseDashboard;
