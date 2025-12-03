import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Badge,
  message,
  Spin,
  Avatar,
  Space,
  Menu,
  Modal,
  Form,
  Input,
  Select,
  Descriptions,
  Empty,
  Tooltip,
  Divider,
  Tabs,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  HomeOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  TeamOutlined,
  PhoneOutlined,
  PrinterOutlined,
  DownloadOutlined,
  SearchOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import "./DoctorDashboard.css";

const API_URL = "http://localhost:5000/api";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const [consultationForm] = Form.useForm();
  const [prescriptionForm] = Form.useForm();

  const [dashboardData, setDashboardData] = useState({
    appointmentsToday: 0,  
    patientsWaiting: 0, 
    consultationsCompleted: 0,
    pendingPrescriptions: 0,
    recentAppointments: [],
    patients: [],
    medicalRecords: [],
  });

  const [modals, setModals] = useState({
    consultation: false,
    prescription: false,
    patientDetail: false,
    medicalRecordDetail: false,
  });

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [user?._id]);

  const loadDashboardData = async () => {
    if (!user?._id) {
      console.log("❌ Không có user._id", user);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      console.log(
        "🔐 Token:",
        token ? `${token.substring(0, 20)}...` : "❌ Không có token"
      );
      console.log("👤 User:", user);

      const headers = { Authorization: `Bearer ${token}` };

      // Load danh sách bệnh nhân - Backend không filter theo doctorId
      console.log("👥 Gọi API: /patients/search?limit=100");
      const patientsRes = await axios.get(
        `${API_URL}/patients/search?limit=100`,
        { headers }
      );
      console.log("👥 Patients response:", patientsRes.data);

      const patientsFromAPI = patientsRes.data.data?.patients || [];
      console.log(
        "📋 Danh sách bệnh nhân từ API:",
        patientsFromAPI.length,
        "bệnh nhân",
        patientsFromAPI
      );

      // Transform dữ liệu từ API vào format phù hợp cho columns
      const patients = patientsFromAPI.map((p) => {
        const age = p.userId?.dateOfBirth
          ? new Date().getFullYear() -
            new Date(p.userId.dateOfBirth).getFullYear()
          : null;

        return {
          _id: p._id,
          patientId: p.patientId,
          name: p.userId?.name || "Chưa cập nhật",
          userId: p.userId,
          firstName: p.userId?.firstName || "",
          lastName: p.userId?.lastName || "",
          email: p.userId?.email || "",
          phone: p.userId?.phone || "Chưa cập nhật",
          dateOfBirth: p.userId?.dateOfBirth,
          gender: p.userId?.gender,
          address: p.userId?.address,
          age: age,
          bloodType: p.bloodType || "Không xác định",
          height: p.height,
          weight: p.weight,
          allergies: p.allergies || [],
          chronicConditions: p.chronicConditions || [],
          status: "ACTIVE",
          lastVisit: p.lastVisit || null,
          personalInfo: {
            firstName: p.userId?.firstName || "",
            lastName: p.userId?.lastName || "",
            dateOfBirth: p.userId?.dateOfBirth,
            phone: p.userId?.phone || "Chưa cập nhật",
            address: p.userId?.address,
            gender: p.userId?.gender,
          },
        };
      });

      console.log("✅ Transformed patients:", patients);

      // Load lịch hẹn - Try but don't fail if not available
      let appointments = [];
      try {
        console.log(`📅 Gọi API: /appointments/doctor/${user._id}`);
        const appointmentsRes = await axios.get(
          `${API_URL}/appointments/doctor/${user._id}?date=${
            new Date().toISOString().split("T")[0]
          }`,
          { headers }
        );
        appointments = appointmentsRes.data.data || [];
        console.log("📅 Appointments response:", appointmentsRes.data);
      } catch (appointmentError) {
        console.warn(
          "⚠️ Appointments API error (non-blocking):",
          appointmentError.message
        );
        appointments = [];
      }

      // Tính toán statistics
      const appointmentsToday = appointments.length;
      const patientsWaiting = appointments.filter(
        (a) => a.status === "PENDING"
      ).length;
      const consultationsCompleted = appointments.filter(
        (a) => a.status === "COMPLETED"
      ).length;
      setDashboardData((prev) => ({
        ...prev,
        appointmentsToday,
        patientsWaiting,
        consultationsCompleted,
        pendingPrescriptions: 5, // Mock, cần API riêng
        recentAppointments: appointments.map((apt) => ({
          id: apt._id,
          patientId: apt.patientId,
          patientName: apt.patientName || "Chưa cập nhật",
          patientPhone: apt.patientPhone || "Chưa cập nhật",
          time: new Date(apt.appointmentTime).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: apt.appointmentType || "Khám bệnh",
          status: apt.status,
          reason: apt.reason || "Không có",
        })),
        patients: patients,
      }));

      message.success("✅ Tải dữ liệu thành công");
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
      console.error("📋 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      message.error(
        error.response?.data?.message || "❌ Lỗi tải dữ liệu dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Modal.confirm({
      title: "Xác nhận đăng xuất",
      content: "Bạn có chắc chắn muốn đăng xuất?",
      okText: "Có",
      cancelText: "Không",
      onOk: async () => {
        try {
          await logout();
          message.success("Đã đăng xuất");
        } catch (error) {
          message.error("Lỗi đăng xuất");
        }
      },
    });
  };

  const handleConsultation = (patient) => {
    setSelectedPatient(patient);
    consultationForm.resetFields();
    setModals({ ...modals, consultation: true });
  };

  const handleSaveConsultation = async (values) => {
    if (!selectedPatient) {
      message.error("Chưa chọn bệnh nhân");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const consultationData = {
        patientId: selectedPatient.patientId || selectedPatient.id,
        doctorId: user._id,
        symptoms: values.symptoms,
        diagnosis: values.diagnosis,
        treatment: values.treatment,
        prescription: values.prescription,
        tests: values.tests,
        followUp: values.followUp,
        notes: values.notes,
        temperature: values.temperature,
        bloodPressure: values.bloodPressure,
        visitDate: values.visitDate || new Date(),
      };

      // Gọi API lưu bệnh án
      const res = await axios.post(
        `${API_URL}/medical-records`,
        consultationData,
        { headers }
      );

      if (res.status === 201) {
        message.success("✅ Lưu bệnh án thành công!");
        setModals({ ...modals, consultation: false });
        consultationForm.resetFields();
        loadDashboardData(); // Reload data
      }
    } catch (error) {
      console.error("Error saving consultation:", error);
      message.error(error.response?.data?.message || "❌ Lỗi lưu bệnh án");
    } finally {
      setLoading(false);
    }
  };

  const handlePrescription = (patient) => {
    setSelectedPatient(patient);
    prescriptionForm.resetFields();
    setModals({ ...modals, prescription: true });
  };

  const handleSavePrescription = async (values) => {
    if (!selectedPatient) {
      message.error("Chưa chọn bệnh nhân");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const prescriptionData = {
        patientId: selectedPatient.patientId || selectedPatient.id,
        doctorId: user._id,
        medications: values.medications,
        instructions: values.instructions,
        warnings: values.warnings,
        duration: values.duration,
        prescriptionDate: new Date(),
      };

      // Gọi API lưu đơn thuốc
      const res = await axios.post(
        `${API_URL}/prescriptions`,
        prescriptionData,
        { headers }
      );

      if (res.status === 201) {
        message.success("✅ Kê đơn thuốc thành công!");
        setModals({ ...modals, prescription: false });
        prescriptionForm.resetFields();
        loadDashboardData(); // Reload data
      }
    } catch (error) {
      console.error("Error saving prescription:", error);
      message.error(error.response?.data?.message || "❌ Lỗi kê đơn thuốc");
    } finally {
      setLoading(false);
    }
  };

  const appointmentColumns = [
    {
      title: "👤 Bệnh Nhân",
      dataIndex: "patientName",
      key: "patientName",
      width: 180,
      render: (text, record) => (
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: "#1890ff" }}>{text}</p>
          <small style={{ color: "#999" }}>
            <PhoneOutlined /> {record.patientPhone}
          </small>
        </div>
      ),
    },
    {
      title: "⏰ Giờ",
      dataIndex: "time",
      key: "time",
      width: 100,
      render: (time) => (
        <span style={{ fontWeight: 600, color: "#ff7a45" }}>
          <ClockCircleOutlined /> {time}
        </span>
      ),
    },
    {
      title: "🔍 Lý Do",
      dataIndex: "reason",
      key: "reason",
      render: (reason) => <span style={{ color: "#333" }}>{reason}</span>,
    },
    {
      title: "📌 Trạng Thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => {
        const colors = {
          PENDING: "orange",
          COMPLETED: "green",
          CANCELLED: "red",
        };
        const labels = {
          PENDING: "⏳ Chờ",
          COMPLETED: "✅ Đã khám",
          CANCELLED: "❌ Hủy",
        };
        return (
          <Tag color={colors[status] || "blue"} style={{ fontWeight: 600 }}>
            {labels[status] || status}
          </Tag>
        );
      },
    },
    {
      title: "⚙️ Hành Động",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="Khám bệnh & lưu bệnh án">
            <Button
              type="primary"
              size="small"
              icon={<HeartOutlined />}
              onClick={() => handleConsultation(record)}
              style={{ background: "#1890ff" }}
            >
              Khám
            </Button>
          </Tooltip>
          <Tooltip title="Kê đơn thuốc">
            <Button
              size="small"
              icon={<MedicineBoxOutlined />}
              onClick={() => handlePrescription(record)}
              style={{ borderColor: "#52c41a", color: "#52c41a" }}
            >
              Đơn
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const patientColumns = [
    {
      title: "👤 Tên Bệnh Nhân",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (text) => (
        <div style={{ fontWeight: 600, color: "#1890ff" }}>{text}</div>
      ),
    },
    {
      title: "🎂 Tuổi",
      dataIndex: "age",
      key: "age",
      width: 60,
    },
    {
      title: "📱 Điện Thoại",
      render: (_, record) => record.personalInfo?.phone || "Chưa cập nhật",
      key: "phone",
    },
    {
      title: "📅 Khám Lần Cuối",
      render: (_, record) =>
        record.lastVisit
          ? new Date(record.lastVisit).toLocaleDateString("vi-VN")
          : "Chưa khám",
      key: "lastVisit",
    },
    {
      title: "🏥 Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>
          {status === "ACTIVE" ? "✅ Hoạt động" : "❌ Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "⚙️ Hành Động",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết bệnh nhân">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedPatient(record);
                setModals({ ...modals, patientDetail: true });
              }}
            >
              Chi Tiết
            </Button>
          </Tooltip>
          <Tooltip title="Khám bệnh">
            <Button
              size="small"
              icon={<HeartOutlined />}
              onClick={() => handleConsultation(record)}
            >
              Khám
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* SIDEBAR */}
      <Layout.Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        style={{
          background: "linear-gradient(180deg, #1e3a8a 0%, #3b82f6 100%)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 999,
        }}
        width={250}
      >
        <div
          style={{
            color: "white",
            padding: "20px 16px",
            textAlign: "center",
            marginBottom: "24px",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {!collapsed && (
            <div>
              <Avatar
                size={56}
                icon={<UserOutlined />}
                style={{
                  background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
                  marginBottom: "12px",
                  border: "3px solid rgba(255,255,255,0.3)",
                }}
              />
              <h2
                style={{
                  margin: "8px 0 4px 0",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                {user?.personalInfo?.firstName} {user?.personalInfo?.lastName}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  opacity: 0.8,
                }}
              >
                👨‍⚕️ Bác Sĩ
              </p>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(e) => setSelectedKey(e.key)}
          style={{
            background: "transparent",
            borderRight: "none",
          }}
          items={[
            {
              key: "1",
              icon: <HomeOutlined style={{ fontSize: "18px" }} />,
              label: "📊 Tổng Quan",
              style: { marginTop: "8px" },
            },
            {
              key: "2",
              icon: <CalendarOutlined style={{ fontSize: "18px" }} />,
              label: "📅 Lịch Hẹn",
            },
            {
              key: "3",
              icon: <TeamOutlined style={{ fontSize: "18px" }} />,
              label: "👥 Bệnh Nhân",
            },
            {
              key: "4",
              icon: <HeartOutlined style={{ fontSize: "18px" }} />,
              label: "🩺 Khám Bệnh",
            },
            {
              key: "5",
              icon: <FileTextOutlined style={{ fontSize: "18px" }} />,
              label: "📋 Hồ Sơ Bệnh Án",
            },
            {
              key: "6",
              icon: <MedicineBoxOutlined style={{ fontSize: "18px" }} />,
              label: "💊 Kê Đơn Thuốc",
            },
            {
              type: "divider",
            },
            {
              key: "7",
              icon: <LogoutOutlined style={{ fontSize: "18px" }} />,
              label: "🚪 Đăng Xuất",
              danger: true,
              onClick: handleLogout,
            },
          ]}
        />
      </Layout.Sider>

      {/* MAIN LAYOUT */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 250,
          transition: "margin-left 0.2s",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: "white",
            padding: "16px 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <HeartOutlined style={{ fontSize: "32px", color: "#3b82f6" }} />
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#1e3a8a",
                }}
              >
                🏥 Phòng Khám Bác Sĩ
              </h1>
              <small style={{ color: "#999" }}>
                Quản lý bệnh nhân & khám bệnh hiệu quả
              </small>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Badge
              count={dashboardData.patientsWaiting}
              color="#ff4d4f"
              style={{ cursor: "pointer" }}
            >
              <Button
                type="text"
                icon={<UserOutlined />}
                style={{ color: "#666", fontSize: "14px" }}
              >
                Chờ Khám
              </Button>
            </Badge>
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              }}
            />
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "24px", overflowY: "auto" }}>
          <Spin spinning={loading}>
            {/* DASHBOARD TAB */}
            {selectedKey === "1" && (
              <div>
                {/* STATISTICS CARDS */}
                <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: "16px",
                        color: "white",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                      }}
                      hoverable
                    >
                      <Statistic
                        title={
                          <span
                            style={{
                              color: "rgba(255,255,255,0.9)",
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            📅 Lịch Hẹn Hôm Nay
                          </span>
                        }
                        value={dashboardData.appointmentsToday}
                        valueStyle={{
                          color: "white",
                          fontSize: "36px",
                          fontWeight: 700,
                        }}
                      />
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        background:
                          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        border: "none",
                        borderRadius: "16px",
                        color: "white",
                        boxShadow: "0 4px 15px rgba(245, 87, 108, 0.4)",
                      }}
                      hoverable
                    >
                      <Statistic
                        title={
                          <span
                            style={{
                              color: "rgba(255,255,255,0.9)",
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            ⏳ Đang Chờ Khám
                          </span>
                        }
                        value={dashboardData.patientsWaiting}
                        valueStyle={{
                          color: "white",
                          fontSize: "36px",
                          fontWeight: 700,
                        }}
                      />
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        background:
                          "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                        border: "none",
                        borderRadius: "16px",
                        color: "white",
                        boxShadow: "0 4px 15px rgba(79, 172, 254, 0.4)",
                      }}
                      hoverable
                    >
                      <Statistic
                        title={
                          <span
                            style={{
                              color: "rgba(255,255,255,0.9)",
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            ✅ Đã Khám
                          </span>
                        }
                        value={dashboardData.consultationsCompleted}
                        valueStyle={{
                          color: "white",
                          fontSize: "36px",
                          fontWeight: 700,
                        }}
                      />
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        background:
                          "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                        border: "none",
                        borderRadius: "16px",
                        color: "white",
                        boxShadow: "0 4px 15px rgba(250, 112, 154, 0.4)",
                      }}
                      hoverable
                    >
                      <Statistic
                        title={
                          <span
                            style={{
                              color: "rgba(255,255,255,0.9)",
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            💊 Đơn Chờ Kê
                          </span>
                        }
                        value={dashboardData.pendingPrescriptions}
                        valueStyle={{
                          color: "white",
                          fontSize: "36px",
                          fontWeight: 700,
                        }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* QUICK ACTIONS */}
                <Card
                  title="⚡ Thao Tác Nhanh"
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #e0e7ff",
                    marginBottom: "24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                  extra={
                    <span style={{ color: "#666", fontSize: "12px" }}>
                      Nhấn để thực hiện
                    </span>
                  }
                >
                  <Row gutter={[12, 12]}>
                    <Col xs={24} sm={12} lg={6}>
                      <Button
                        block
                        size="large"
                        type="primary"
                        icon={<HeartOutlined />}
                        onClick={() => setSelectedKey("4")}
                        style={{
                          height: "50px",
                          background:
                            "linear-gradient(135deg, #667eea, #764ba2)",
                        }}
                      >
                        <strong>Khám Bệnh</strong>
                      </Button>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Button
                        block
                        size="large"
                        icon={<MedicineBoxOutlined />}
                        onClick={() => setSelectedKey("6")}
                        style={{
                          height: "50px",
                          borderColor: "#52c41a",
                          color: "#52c41a",
                        }}
                      >
                        <strong>Kê Đơn Thuốc</strong>
                      </Button>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Button
                        block
                        size="large"
                        icon={<FileTextOutlined />}
                        onClick={() => setSelectedKey("5")}
                        style={{
                          height: "50px",
                          borderColor: "#1890ff",
                          color: "#1890ff",
                        }}
                      >
                        <strong>Hồ Sơ Bệnh Án</strong>
                      </Button>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Button
                        block
                        size="large"
                        icon={<UserOutlined />}
                        onClick={() => setSelectedKey("3")}
                        style={{
                          height: "50px",
                          borderColor: "#faad14",
                          color: "#faad14",
                        }}
                      >
                        <strong>Bệnh Nhân</strong>
                      </Button>
                    </Col>
                  </Row>
                </Card>

                {/* APPOINTMENTS TABLE */}
                <Card
                  title="📅 Lịch Hẹn Hôm Nay"
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #e0e7ff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                  extra={
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => setSelectedKey("2")}
                    >
                      Xem Tất Cả
                    </Button>
                  }
                >
                  {dashboardData.recentAppointments.length > 0 ? (
                    <Table
                      columns={appointmentColumns}
                      dataSource={dashboardData.recentAppointments}
                      pagination={false}
                      size="middle"
                      rowKey="id"
                      bordered={false}
                    />
                  ) : (
                    <Empty description="Không có lịch hẹn hôm nay" />
                  )}
                </Card>
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {selectedKey === "2" && (
              <Card
                title="📅 Quản Lý Lịch Hẹn"
                style={{
                  borderRadius: "16px",
                  border: "1px solid #e0e7ff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {dashboardData.recentAppointments.length > 0 ? (
                  <Table
                    columns={appointmentColumns}
                    dataSource={dashboardData.recentAppointments}
                    pagination={{ pageSize: 15 }}
                    rowKey="id"
                  />
                ) : (
                  <Empty description="Không có lịch hẹn" />
                )}
              </Card>
            )}

            {/* PATIENTS TAB */}
            {selectedKey === "3" && (
              <Card
                title="👥 Danh Sách Bệnh Nhân Của Tôi"
                style={{
                  borderRadius: "16px",
                  border: "1px solid #e0e7ff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
                extra={
                  <Button type="primary" size="small" icon={<SearchOutlined />}>
                    Tìm Kiếm
                  </Button>
                }
              >
                {dashboardData.patients.length > 0 ? (
                  <Table
                    columns={patientColumns}
                    dataSource={dashboardData.patients}
                    pagination={{ pageSize: 15 }}
                    rowKey="_id"
                    size="middle"
                  />
                ) : (
                  <Empty description="Không có bệnh nhân" />
                )}
              </Card>
            )}

            {/* CONSULTATION TAB */}
            {selectedKey === "4" && (
              <Card
                title="🩺 Khám Bệnh (Nhập Triệu Chứng & Chẩn Đoán)"
                style={{
                  borderRadius: "16px",
                  border: "1px solid #e0e7ff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <Form layout="vertical" onFinish={handleSaveConsultation}>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label={<strong>👤 Chọn Bệnh Nhân</strong>}
                        name="patient"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn bệnh nhân",
                          },
                        ]}
                      >
                        <Select
                          placeholder={`Chọn bệnh nhân từ danh sách (${dashboardData.patients.length} bệnh nhân)`}
                          optionLabelProp="label"
                          options={
                            dashboardData.patients &&
                            dashboardData.patients.length > 0
                              ? dashboardData.patients.map((p) => {
                                  const displayName =
                                    p.name ||
                                    p.firstName ||
                                    p.userId?.name ||
                                    "Chưa cập nhật";
                                  const displayAge =
                                    p.age ||
                                    (p.dateOfBirth
                                      ? new Date().getFullYear() -
                                        new Date(p.dateOfBirth).getFullYear()
                                      : "?");
                                  return {
                                    label: `${displayName} (${displayAge} tuổi)`,
                                    value: p._id,
                                  };
                                })
                              : []
                          }
                          onChange={(value) => {
                            const patient = dashboardData.patients.find(
                              (p) => p._id === value
                            );
                            setSelectedPatient(patient);
                            console.log("Bệnh nhân được chọn:", patient);
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label={<strong>📅 Ngày Khám</strong>}
                        name="visitDate"
                      >
                        <Input
                          type="date"
                          defaultValue={new Date().toISOString().split("T")[0]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider orientation="left">📋 THÔNG TIN KHÁM</Divider>

                  <Form.Item
                    name="symptoms"
                    label={<strong>🔍 Triệu Chứng Chính</strong>}
                    rules={[
                      { required: true, message: "Vui lòng nhập triệu chứng" },
                    ]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Mô tả chi tiết triệu chứng của bệnh nhân (sốt, ho, đau bụng, v.v)..."
                      style={{ fontSize: "14px" }}
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="temperature"
                        label={<strong>🌡️ Nhiệt Độ (°C)</strong>}
                      >
                        <Input
                          placeholder="VD: 37.5"
                          type="number"
                          step="0.1"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="bloodPressure"
                        label={<strong>🩸 Huyết Áp</strong>}
                      >
                        <Input placeholder="VD: 120/80" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="diagnosis"
                    label={<strong>🩺 Chẩn Đoán (QUAN TRỌNG)</strong>}
                    rules={[
                      { required: true, message: "Vui lòng nhập chẩn đoán" },
                    ]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Kết quả chẩn đoán sau khi khám (bệnh gì, mức độ nặng, v.v)..."
                      style={{
                        fontSize: "14px",
                        backgroundColor: "#fffbe6",
                      }}
                    />
                  </Form.Item>

                  <Divider orientation="left">💊 CHỈ ĐỊNH & ĐIỀU TRỊ</Divider>

                  <Form.Item
                    name="treatment"
                    label={<strong>💉 Hướng Điều Trị</strong>}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập hướng điều trị",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Mô tả cách điều trị, hướng chăm sóc, theo dõi..."
                      style={{ fontSize: "14px" }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="prescription"
                    label={<strong>💊 Chỉ Định Thuốc</strong>}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Liệt kê các loại thuốc cần kê (tên thuốc, liều lượng, cách dùng)"
                      style={{ fontSize: "14px" }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="tests"
                    label={<strong>🔬 Chỉ Định Xét Nghiệm</strong>}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Xét nghiệm máu, nước tiểu, chụp X-ray, siêu âm, v.v..."
                      style={{ fontSize: "14px" }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="followUp"
                    label={<strong>📞 Tái Khám</strong>}
                  >
                    <Input placeholder="VD: Tái khám sau 3 ngày, nếu không hết sốt thì đi cấp cứu..." />
                  </Form.Item>

                  <Form.Item
                    name="notes"
                    label={<strong>📝 Ghi Chú Thêm</strong>}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Ghi chú riêng của bác sĩ..."
                      style={{ fontSize: "14px" }}
                    />
                  </Form.Item>

                  <Row gutter={16} style={{ marginTop: "24px" }}>
                    <Col xs={24} sm={12}>
                      <Button
                        block
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={loading}
                        style={{
                          height: "50px",
                          fontSize: "16px",
                          fontWeight: 600,
                          background:
                            "linear-gradient(135deg, #667eea, #764ba2)",
                        }}
                      >
                        💾 LƯU BỆnh ÁN
                      </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Button
                        block
                        size="large"
                        icon={<PrinterOutlined />}
                        style={{ height: "50px", fontSize: "16px" }}
                      >
                        🖨️ IN BỆnh ÁN
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card>
            )}

            {/* MEDICAL RECORDS TAB */}
            {selectedKey === "5" && (
              <Card
                title="📋 Hồ Sơ Bệnh Án Chi Tiết"
                style={{
                  borderRadius: "16px",
                  border: "1px solid #e0e7ff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
                extra={
                  <Button type="primary" icon={<SearchOutlined />}>
                    Tìm Kiếm
                  </Button>
                }
              >
                <Empty
                  description="Chức năng đang phát triển"
                  style={{ marginTop: "48px" }}
                />
              </Card>
            )}

            {/* PRESCRIPTIONS TAB */}
            {selectedKey === "6" && (
              <Card
                title="💊 Kê Đơn Thuốc Cho Bệnh Nhân"
                style={{
                  borderRadius: "16px",
                  border: "1px solid #e0e7ff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <Form
                  form={prescriptionForm}
                  layout="vertical"
                  onFinish={handleSavePrescription}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label={<strong>👤 Chọn Bệnh Nhân</strong>}
                        name="patient"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn bệnh nhân",
                          },
                        ]}
                      >
                        <Select
                          placeholder={`Chọn bệnh nhân (${dashboardData.patients.length} bệnh nhân)`}
                          optionLabelProp="label"
                          options={
                            dashboardData.patients &&
                            dashboardData.patients.length > 0
                              ? dashboardData.patients.map((p) => {
                                  const displayName =
                                    p.name ||
                                    p.firstName ||
                                    p.userId?.name ||
                                    "Chưa cập nhật";
                                  const displayAge =
                                    p.age ||
                                    (p.dateOfBirth
                                      ? new Date().getFullYear() -
                                        new Date(p.dateOfBirth).getFullYear()
                                      : "?");
                                  return {
                                    label: `${displayName} (${displayAge} tuổi)`,
                                    value: p._id,
                                  };
                                })
                              : []
                          }
                          onChange={(value) => {
                            const patient = dashboardData.patients.find(
                              (p) => p._id === value
                            );
                            setSelectedPatient(patient);
                            console.log("Bệnh nhân được chọn:", patient);
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<strong>📅 Ngày Kê</strong>}>
                        <Input
                          disabled
                          value={new Date().toLocaleDateString("vi-VN")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="medications"
                    label={<strong>💊 Danh Sách Thuốc</strong>}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập danh sách thuốc",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={6}
                      placeholder="Nhập danh sách thuốc (mỗi dòng một loại)&#10;- Tên thuốc | Liều lượng | Cách dùng&#10;- VD: Paracetamol | 500mg | Uống 3 lần/ngày&#10;..."
                      style={{ fontSize: "14px" }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="instructions"
                    label={<strong>📖 Hướng Dẫn Sử Dụng</strong>}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Hướng dẫn chi tiết cách sử dụng, lưu ý khi dùng..."
                      style={{ fontSize: "14px" }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="warnings"
                    label={<strong>⚠️ Chú Ý / Cảnh Báo</strong>}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Các cảnh báo về tác dụng phụ, tương tác thuốc, chống chỉ định..."
                      style={{ fontSize: "14px" }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="duration"
                    label={<strong>⏱️ Thời Hạn Sử Dụng</strong>}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn thời hạn",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn thời hạn"
                      options={[
                        { label: "3 ngày", value: "3" },
                        { label: "1 tuần (7 ngày)", value: "7" },
                        { label: "2 tuần (14 ngày)", value: "14" },
                        { label: "1 tháng (30 ngày)", value: "30" },
                      ]}
                    />
                  </Form.Item>

                  <Row gutter={16} style={{ marginTop: "24px" }}>
                    <Col xs={24} sm={12}>
                      <Button
                        block
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={loading}
                        style={{
                          height: "50px",
                          fontSize: "16px",
                          fontWeight: 600,
                          background:
                            "linear-gradient(135deg, #52c41a, #85ce61)",
                        }}
                      >
                        💾 LƯU ĐƠN THUỐC
                      </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Button
                        block
                        size="large"
                        icon={<PrinterOutlined />}
                        style={{ height: "50px", fontSize: "16px" }}
                      >
                        🖨️ IN ĐƠN THUỐC
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card>
            )}
          </Spin>
        </div>
      </Layout>

      {/* PATIENT DETAIL MODAL */}
      <Modal
        title="👤 Chi Tiết Bệnh Nhân"
        open={modals.patientDetail}
        onCancel={() => setModals({ ...modals, patientDetail: false })}
        footer={[
          <Button
            key="close"
            onClick={() => setModals({ ...modals, patientDetail: false })}
          >
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedPatient && (
          <Descriptions
            column={2}
            bordered
            style={{ marginTop: "16px" }}
            size="small"
          >
            <Descriptions.Item label="👤 Tên" span={2}>
              <strong>
                {selectedPatient.name ||
                  `${selectedPatient.personalInfo?.firstName} ${selectedPatient.personalInfo?.lastName}`}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="🎂 Tuổi">
              {selectedPatient.personalInfo?.dateOfBirth
                ? new Date().getFullYear() -
                  new Date(
                    selectedPatient.personalInfo.dateOfBirth
                  ).getFullYear()
                : "Không xác định"}
            </Descriptions.Item>
            <Descriptions.Item label="👨‍⚕️ Giới Tính">
              {selectedPatient.personalInfo?.gender === "MALE" ? "Nam" : "Nữ"}
            </Descriptions.Item>
            <Descriptions.Item label="📱 Điện Thoại">
              {selectedPatient.personalInfo?.phone}
            </Descriptions.Item>
            <Descriptions.Item label="📧 Email" span={2}>
              {selectedPatient.personalInfo?.email}
            </Descriptions.Item>
            <Descriptions.Item label="📍 Địa Chỉ" span={2}>
              {selectedPatient.personalInfo?.address}
            </Descriptions.Item>
            <Descriptions.Item label="🏥 Trạng Thái" span={2}>
              <Tag
                color={selectedPatient.status === "ACTIVE" ? "green" : "red"}
              >
                {selectedPatient.status === "ACTIVE"
                  ? "✅ Hoạt động"
                  : "❌ Không hoạt động"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Layout>
  );
};

export default DoctorDashboard;
