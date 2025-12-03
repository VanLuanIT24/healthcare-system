import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Layout,
  Button,
  Dropdown,
  Space,
  message,
  Row,
  Col,
  Badge,
  Menu,
  Table,
  Tag,
  Modal,
  Spin,
  Tabs,
  Avatar,
  Alert,
  Statistic,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  BellOutlined,
  IdcardOutlined,
  ReloadOutlined,
  EyeOutlined,
  DashboardOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import BookingAppointmentModal from "../../components/BookingAppointmentModal";
import axios from "axios";
import "../styles/PatientDashboard.css";

const { Header, Sider, Content } = Layout;

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [stats, setStats] = useState({});
  const [appointmentPagination, setAppointmentPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [prescriptionPagination, setPrescriptionPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [
    selectedKey,
    appointmentPagination.current,
    prescriptionPagination.current,
  ]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Lấy appointments
      const appointmentsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/patient-portal/appointments`,
        {
          params: {
            page: appointmentPagination.current,
            limit: appointmentPagination.pageSize,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (appointmentsRes.data.success) {
        setAppointments(appointmentsRes.data.data || []);
        if (appointmentsRes.data.pagination) {
          setAppointmentPagination((prev) => ({
            ...prev,
            total: appointmentsRes.data.pagination.total,
          }));
        }
      }

      // Lấy prescriptions
      const prescriptionsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/patient-portal/prescriptions`,
        {
          params: {
            page: prescriptionPagination.current,
            limit: prescriptionPagination.pageSize,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (prescriptionsRes.data.success) {
        setPrescriptions(prescriptionsRes.data.data || []);
        if (prescriptionsRes.data.pagination) {
          setPrescriptionPagination((prev) => ({
            ...prev,
            total: prescriptionsRes.data.pagination.total,
          }));
        }
      }

      // Lấy lab results
      const labRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/patient-portal/lab-results`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (labRes.data.success) {
        setLabResults(labRes.data.data || []);
      }

      // Tính toán stats
      const allAppointments = appointmentsRes.data.data || [];
      const allPrescriptions = prescriptionsRes.data.data || [];
      const allLabResults = labRes.data.data || [];

      setStats({
        upcomingAppointments: allAppointments.filter(
          (a) => a.status === "SCHEDULED"
        ).length,
        completedAppointments: allAppointments.filter(
          (a) => a.status === "COMPLETED"
        ).length,
        activePrescriptions: allPrescriptions.filter(
          (p) => p.status === "ACTIVE"
        ).length,
        pendingLabResults: allLabResults.filter((l) => l.status === "PENDING")
          .length,
      });
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn");
        logout();
        navigate("/login");
      } else {
        message.error("Không thể tải dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  const appointmentsColumns = [
    {
      title: "🏥 Bác sĩ",
      dataIndex: ["doctorId", "personalInfo"],
      key: "doctor",
      render: (personalInfo) =>
        personalInfo
          ? `${personalInfo.firstName} ${personalInfo.lastName}`
          : "-",
      width: 200,
    },
    {
      title: "📅 Ngày hẹn",
      dataIndex: "appointmentDate",
      key: "date",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
      width: 140,
    },
    {
      title: "⏰ Thời gian",
      dataIndex: "appointmentTime",
      key: "time",
      width: 100,
    },
    {
      title: "📝 Lý do",
      dataIndex: "reason",
      key: "reason",
      render: (reason) => reason || "-",
      ellipsis: true,
    },
    {
      title: "📊 Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          SCHEDULED: "processing",
          COMPLETED: "success",
          CANCELLED: "error",
          NO_SHOW: "error",
        };
        const labels = {
          SCHEDULED: "Chưa khám",
          COMPLETED: "Đã hoàn thành",
          CANCELLED: "Đã hủy",
          NO_SHOW: "Không đến",
        };
        return <Badge status={colors[status]} text={labels[status]} />;
      },
      width: 140,
    },
  ];

  const prescriptionsColumns = [
    {
      title: "🏥 Bác sĩ",
      dataIndex: ["doctorId", "personalInfo"],
      key: "doctor",
      render: (personalInfo) =>
        personalInfo
          ? `${personalInfo.firstName} ${personalInfo.lastName}`
          : "-",
      width: 200,
    },
    {
      title: "📅 Ngày cấp",
      dataIndex: "createdAt",
      key: "date",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
      width: 140,
    },
    {
      title: "📊 Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          ACTIVE: "success",
          EXPIRED: "error",
          PENDING: "processing",
        };
        const labels = {
          ACTIVE: "Còn hiệu lực",
          EXPIRED: "Hết hạn",
          PENDING: "Chờ xử lý",
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
      width: 120,
    },
  ];

  const labResultsColumns = [
    {
      title: "🔬 Loại xét nghiệm",
      dataIndex: "testName",
      key: "test",
      width: 200,
    },
    {
      title: "📅 Ngày thực hiện",
      dataIndex: "testDate",
      key: "date",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
      width: 140,
    },
    {
      title: "📊 Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          PENDING: "processing",
          COMPLETED: "success",
          ABNORMAL: "error",
        };
        const labels = {
          PENDING: "Đang xử lý",
          COMPLETED: "Hoàn thành",
          ABNORMAL: "Bất thường",
        };
        return <Badge status={colors[status]} text={labels[status]} />;
      },
      width: 140,
    },
  ];

  const handleLogout = () => {
    Modal.confirm({
      title: "Đăng xuất",
      content: "Bạn có chắc chắn muốn đăng xuất?",
      okText: "Có",
      cancelText: "Không",
      onOk() {
        logout();
        navigate("/login");
      },
    });
  };

  const renderDashboard = () => (
    <div
      style={{
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {/* Welcome Header */}
      <Card
        style={{
          marginBottom: "24px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          color: "white",
          borderRadius: "12px",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <h2
              style={{ color: "white", marginBottom: "8px", fontSize: "24px" }}
            >
              👋 Xin chào, {user?.personalInfo?.firstName}!
            </h2>
            <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: 0 }}>
              Chào mừng trở lại hệ thống quản lý bệnh án điện tử
            </p>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setBookingModalVisible(true)}
                size="large"
                style={{
                  background: "rgba(255,255,255,0.3)",
                  border: "1px solid rgba(255,255,255,0.5)",
                }}
              >
                Đặt Lịch Hẹn Mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "12px",
              color: "white",
            }}
            bodyStyle={{ padding: "24px", textAlign: "center" }}
          >
            <ClockCircleOutlined
              style={{ fontSize: "32px", marginBottom: "12px" }}
            />
            <Statistic
              value={stats.upcomingAppointments || 0}
              suffix="Lịch hẹn"
              valueStyle={{ color: "white", fontSize: "28px" }}
            />
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 0 }}>
              Sắp tới
            </p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              border: "none",
              borderRadius: "12px",
              color: "white",
            }}
            bodyStyle={{ padding: "24px", textAlign: "center" }}
          >
            <CheckCircleOutlined
              style={{ fontSize: "32px", marginBottom: "12px" }}
            />
            <Statistic
              value={stats.completedAppointments || 0}
              suffix="Lịch hẹn"
              valueStyle={{ color: "white", fontSize: "28px" }}
            />
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 0 }}>
              Đã hoàn thành
            </p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              border: "none",
              borderRadius: "12px",
              color: "white",
            }}
            bodyStyle={{ padding: "24px", textAlign: "center" }}
          >
            <MedicineBoxOutlined
              style={{ fontSize: "32px", marginBottom: "12px" }}
            />
            <Statistic
              value={stats.activePrescriptions || 0}
              suffix="Đơn"
              valueStyle={{ color: "white", fontSize: "28px" }}
            />
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 0 }}>
              Đang sử dụng
            </p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              border: "none",
              borderRadius: "12px",
              color: "white",
            }}
            bodyStyle={{ padding: "24px", textAlign: "center" }}
          >
            <ExperimentOutlined
              style={{ fontSize: "32px", marginBottom: "12px" }}
            />
            <Statistic
              value={stats.pendingLabResults || 0}
              suffix="Xét nghiệm"
              valueStyle={{ color: "white", fontSize: "28px" }}
            />
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 0 }}>
              Đang chờ
            </p>
          </Card>
        </Col>
      </Row>

      {/* Tabs Section */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "none",
        }}
      >
        <Tabs
          items={[
            {
              key: "1",
              label: (
                <span>
                  <CalendarOutlined style={{ marginRight: "8px" }} />
                  Lịch hẹn
                </span>
              ),
              children: (
                <div>
                  <div
                    style={{
                      marginBottom: "16px",
                      display: "flex",
                      gap: "10px",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ marginBottom: 0 }}>
                      Danh sách lịch hẹn của bạn
                    </h3>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={loadDashboardData}
                    >
                      Làm tươi
                    </Button>
                  </div>
                  <Table
                    columns={appointmentsColumns}
                    dataSource={appointments}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                      current: appointmentPagination.current,
                      pageSize: appointmentPagination.pageSize,
                      total: appointmentPagination.total,
                      onChange: (page) => {
                        setAppointmentPagination((prev) => ({
                          ...prev,
                          current: page,
                        }));
                      },
                    }}
                    scroll={{ x: 1200 }}
                    style={{ marginTop: "16px" }}
                  />
                </div>
              ),
            },
            {
              key: "2",
              label: (
                <span>
                  <MedicineBoxOutlined style={{ marginRight: "8px" }} />
                  Đơn thuốc
                </span>
              ),
              children: (
                <div>
                  <div
                    style={{
                      marginBottom: "16px",
                      display: "flex",
                      gap: "10px",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ marginBottom: 0 }}>Danh sách đơn thuốc</h3>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={loadDashboardData}
                    >
                      Làm tươi
                    </Button>
                  </div>
                  <Table
                    columns={prescriptionsColumns}
                    dataSource={prescriptions}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                      current: prescriptionPagination.current,
                      pageSize: prescriptionPagination.pageSize,
                      total: prescriptionPagination.total,
                      onChange: (page) => {
                        setPrescriptionPagination((prev) => ({
                          ...prev,
                          current: page,
                        }));
                      },
                    }}
                    scroll={{ x: 1200 }}
                    style={{ marginTop: "16px" }}
                  />
                </div>
              ),
            },
            {
              key: "3",
              label: (
                <span>
                  <ExperimentOutlined style={{ marginRight: "8px" }} />
                  Xét nghiệm
                </span>
              ),
              children: (
                <div>
                  <div
                    style={{
                      marginBottom: "16px",
                      display: "flex",
                      gap: "10px",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ marginBottom: 0 }}>Kết quả xét nghiệm</h3>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={loadDashboardData}
                    >
                      Làm tươi
                    </Button>
                  </div>
                  <Table
                    columns={labResultsColumns}
                    dataSource={labResults}
                    rowKey="_id"
                    loading={loading}
                    scroll={{ x: 1200 }}
                    style={{ marginTop: "16px" }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );

  return (
    <Layout className="role-dashboard-layout" style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="role-dashboard-sider"
        theme="dark"
        width={250}
        style={{
          background: "linear-gradient(180deg, #1f3a93 0%, #14254a 100%)",
        }}
      >
        <div
          className="logo-container"
          style={{
            padding: "16px",
            textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="logo-wrapper">
            <HeartOutlined
              style={{
                fontSize: "28px",
                color: "#fff",
                marginRight: collapsed ? 0 : "8px",
              }}
            />
            {!collapsed && (
              <span style={{ fontSize: "14px", fontWeight: "600" }}>
                HealthCare
              </span>
            )}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(e) => setSelectedKey(e.key)}
          style={{ background: "transparent", border: "none" }}
          items={[
            {
              key: "1",
              icon: <HomeOutlined />,
              label: "Trang chủ",
            },
            {
              key: "2",
              icon: <CalendarOutlined />,
              label: "Lịch hẹn",
            },
            {
              key: "3",
              icon: <MedicineBoxOutlined />,
              label: "Đơn thuốc",
            },
            {
              key: "4",
              icon: <FileTextOutlined />,
              label: "Hồ sơ bệnh án",
            },
            {
              key: "5",
              icon: <ExperimentOutlined />,
              label: "Xét nghiệm",
            },
            {
              key: "6",
              icon: <IdcardOutlined />,
              label: "Hồ sơ cá nhân",
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          className="role-dashboard-header"
          style={{
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "64px",
          }}
        >
          <h1 style={{ marginBottom: 0, fontSize: "18px", fontWeight: "600" }}>
            📋 Bệnh nhân - Quản lý sức khỏe
          </h1>
          <Space>
            <Badge count={stats.upcomingAppointments || 0}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: "18px" }} />}
              />
            </Badge>
            <Dropdown
              menu={{
                items: [
                  { label: "Hồ sơ cá nhân", icon: <UserOutlined /> },
                  { type: "divider" },
                  {
                    label: "Đăng xuất",
                    icon: <LogoutOutlined />,
                    onClick: handleLogout,
                  },
                ],
              }}
            >
              <Button type="text">
                <Avatar icon={<UserOutlined />} />
                {user?.personalInfo?.firstName}
              </Button>
            </Dropdown>
          </Space>
        </Header>

        <Content
          className="role-dashboard-content"
          style={{ padding: 0, background: "#f5f7fa" }}
        >
          <Spin spinning={loading}>{renderDashboard()}</Spin>
        </Content>
      </Layout>

      {/* Booking Appointment Modal */}
      <BookingAppointmentModal
        visible={bookingModalVisible}
        onClose={() => setBookingModalVisible(false)}
        onSuccess={loadDashboardData}
      />
    </Layout>
  );
};

export default PatientDashboard;
