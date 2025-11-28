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
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

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
      title: "Bác sĩ",
      dataIndex: ["doctorId", "personalInfo"],
      key: "doctor",
      render: (personalInfo) =>
        personalInfo
          ? `${personalInfo.firstName} ${personalInfo.lastName}`
          : "-",
    },
    {
      title: "Ngày hẹn",
      dataIndex: "appointmentDate",
      key: "date",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Thời gian",
      dataIndex: "appointmentTime",
      key: "time",
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      render: (reason) => reason || "-",
    },
    {
      title: "Trạng thái",
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
    },
  ];

  const prescriptionsColumns = [
    {
      title: "Bác sĩ",
      dataIndex: ["doctorId", "personalInfo"],
      key: "doctor",
      render: (personalInfo) =>
        personalInfo
          ? `${personalInfo.firstName} ${personalInfo.lastName}`
          : "-",
    },
    {
      title: "Ngày cấp",
      dataIndex: "createdAt",
      key: "date",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Trạng thái",
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
    },
  ];

  const labResultsColumns = [
    {
      title: "Loại xét nghiệm",
      dataIndex: "testName",
      key: "test",
    },
    {
      title: "Ngày thực hiện",
      dataIndex: "testDate",
      key: "date",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Trạng thái",
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
    <div>
      <Alert
        message="✓ Dữ liệu được tải từ backend API"
        type="info"
        showIcon
        closable
        style={{ marginBottom: "24px" }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ borderTop: "4px solid #1890ff", textAlign: "center" }}
          >
            <div
              style={{ fontSize: "24px", color: "#1890ff", fontWeight: "bold" }}
            >
              {stats.upcomingAppointments || 0}
            </div>
            <div style={{ color: "#666" }}>Lịch hẹn sắp tới</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ borderTop: "4px solid #52c41a", textAlign: "center" }}
          >
            <div
              style={{ fontSize: "24px", color: "#52c41a", fontWeight: "bold" }}
            >
              {stats.completedAppointments || 0}
            </div>
            <div style={{ color: "#666" }}>Đã hoàn thành</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ borderTop: "4px solid #faad14", textAlign: "center" }}
          >
            <div
              style={{ fontSize: "24px", color: "#faad14", fontWeight: "bold" }}
            >
              {stats.activePrescriptions || 0}
            </div>
            <div style={{ color: "#666" }}>Đơn thuốc hoạt động</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ borderTop: "4px solid #13c2c2", textAlign: "center" }}
          >
            <div
              style={{ fontSize: "24px", color: "#13c2c2", fontWeight: "bold" }}
            >
              {stats.pendingLabResults || 0}
            </div>
            <div style={{ color: "#666" }}>Xét nghiệm đang chờ</div>
          </Card>
        </Col>
      </Row>

      <Tabs
        items={[
          {
            key: "1",
            label: "Lịch hẹn",
            children: (
              <Card title="Danh Sách Lịch Hẹn">
                <div style={{ marginBottom: "16px" }}>
                  <Button icon={<ReloadOutlined />} onClick={loadDashboardData}>
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
                />
              </Card>
            ),
          },
          {
            key: "2",
            label: "Đơn thuốc",
            children: (
              <Card title="Danh Sách Đơn Thuốc">
                <div style={{ marginBottom: "16px" }}>
                  <Button icon={<ReloadOutlined />} onClick={loadDashboardData}>
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
                />
              </Card>
            ),
          },
          {
            key: "3",
            label: "Xét nghiệm",
            children: (
              <Card title="Kết Quả Xét Nghiệm">
                <div style={{ marginBottom: "16px" }}>
                  <Button icon={<ReloadOutlined />} onClick={loadDashboardData}>
                    Làm tươi
                  </Button>
                </div>
                <Table
                  columns={labResultsColumns}
                  dataSource={labResults}
                  rowKey="_id"
                  loading={loading}
                  scroll={{ x: 1200 }}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );

  return (
    <Layout className="role-dashboard-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="role-dashboard-sider"
        theme="dark"
        width={250}
      >
        <div className="logo-container">
          <div className="logo-wrapper">
            <DashboardOutlined className="logo-icon" />
            {!collapsed && <span>Bệnh nhân</span>}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(e) => setSelectedKey(e.key)}
          items={[
            {
              key: "1",
              icon: <HomeOutlined />,
              label: "Bảng điều khiển",
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
              icon: <HeartOutlined />,
              label: "Xét nghiệm",
            },
            {
              key: "6",
              icon: <IdcardOutlined />,
              label: "Hồ sơ",
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header className="role-dashboard-header">
          <div className="header-content">
            <h1>🏥 Hệ Thống Quản Lý Bệnh Nhân</h1>
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
                    { label: "Hồ sơ", icon: <UserOutlined /> },
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
          </div>
        </Header>

        <Content className="role-dashboard-content">
          <Spin spinning={loading}>{renderDashboard()}</Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PatientDashboard;
