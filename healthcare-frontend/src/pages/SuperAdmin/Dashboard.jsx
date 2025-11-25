import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Spin,
  Table,
  Tabs,
  Badge,
  Tag,
  Empty,
  Drawer,
  Form,
  Input,
  Select,
  Modal,
} from "antd";
import {
  LogoutOutlined,
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  BarChartOutlined,
  HeartOutlined,
  DashboardOutlined,
  TeamOutlined,
  LockOutlined,
  BellOutlined,
  FileTextOutlined,
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import UserManagement from "../../components/UserManagement";
import UserProfile from "./UserProfile";
import ChangePassword from "./ChangePassword";
import axios from "axios";
import "../../styles/Dashboard.css";

const { Header, Sider, Content } = Layout;
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [selectedKey, setSelectedKey] = useState("1");
  const [users, setUsers] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);

  // Fetch system health on mount
  useEffect(() => {
    fetchSystemHealth();
    if (selectedKey === "3") {
      fetchUsers();
    }
  }, [selectedKey]);

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/super-admin/system-health`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSystemHealth(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching system health:", err);
      message.error("Không thể tải thông tin hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      message.error("Không thể tải danh sách người dùng");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      message.success("Đã đăng xuất");
      // Delay redirect slightly to ensure context updates
      setTimeout(() => {
        navigate("/superadmin/login", { replace: true });
      }, 100);
    } catch (err) {
      console.error("Logout error:", err);
      message.error("Lỗi khi đăng xuất");
      // Force redirect even if logout fails
      setTimeout(() => {
        navigate("/superadmin/login", { replace: true });
      }, 100);
    }
  };

  const handleDeleteUser = (userId) => {
    Modal.confirm({
      title: "Xóa người dùng",
      content: "Bạn có chắc chắn muốn xóa người dùng này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const token = localStorage.getItem("accessToken");
          await axios.delete(`${API_BASE_URL}/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          message.success("Đã xóa người dùng");
          fetchUsers();
        } catch (err) {
          message.error("Lỗi khi xóa người dùng");
        }
      },
    });
  };

  const userColumns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Họ tên",
      dataIndex: ["personalInfo", "firstName"],
      key: "name",
      render: (text, record) =>
        `${text} ${record.personalInfo?.lastName || ""}`,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const colors = {
          SUPER_ADMIN: "red",
          ADMIN: "orange",
          DOCTOR: "blue",
          PATIENT: "green",
        };
        return <Tag color={colors[role] || "gray"}>{role}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          ACTIVE: { color: "green", text: "Hoạt động" },
          INACTIVE: { color: "gray", text: "Bị khóa" },
          LOCKED: { color: "red", text: "Bị khoá" },
        };
        const config = statusConfig[status] || {
          color: "gray",
          text: "Không xác định",
        };
        return (
          <Badge
            status={config.color === "green" ? "success" : "error"}
            text={config.text}
          />
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteUser(record._id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: "Trang chủ",
    },
    {
      key: "2",
      icon: <BarChartOutlined />,
      label: "Thống kê hệ thống",
    },
    {
      key: "3",
      icon: <TeamOutlined />,
      label: "Quản lý người dùng",
    },
    {
      key: "4",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "5",
      icon: <KeyOutlined />,
      label: "Đổi mật khẩu",
    },
    {
      key: "6",
      icon: <SettingOutlined />,
      label: "Cài đặt hệ thống",
    },
  ];

  return (
    <Layout className="dashboard-layout min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="dashboard-sider"
        theme="dark"
      >
        <div className="logo-container">
          <div className="logo-wrapper">
            <HeartOutlined className="logo-icon" />
            {!collapsed && "Healthcare"}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={menuItems}
          selectedKeys={[selectedKey]}
          onSelect={({ key }) => setSelectedKey(key)}
          className="dashboard-menu"
        />
        <div className="menu-footer">
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="logout-btn"
            block
          >
            Đăng xuất
          </Button>
        </div>
      </Sider>

      <Layout className="dashboard-main">
        <Header className="dashboard-header">
          <div className="header-left">
            <Button
              type="text"
              className="toggle-btn"
              icon={collapsed ? "☰" : "✕"}
              onClick={() => setCollapsed(!collapsed)}
            />
            <h2 className="header-title">Super Admin Dashboard</h2>
          </div>

          <div className="header-right">
            <span className="user-btn">
              Xin chào, <strong>{user?.personalInfo?.firstName}</strong>
            </span>
          </div>
        </Header>

        <Content className="dashboard-content">
          <Spin spinning={loading}>
            {selectedKey === "1" && (
              <div>
                <div className="section-header">
                  <div>
                    <h3 className="section-title">📊 Bảng điều khiển</h3>
                    <p className="section-desc">Xem tổng quan hệ thống</p>
                  </div>
                </div>

                {/* System Health Stats */}
                <div className="stats-grid">
                  <Card className="stat-card">
                    <div className="stat-content">
                      <div className="stat-icon">
                        <HeartOutlined />
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">Phiên bản Node.js</p>
                        <p className="stat-value">
                          {systemHealth?.nodeVersion || "N/A"}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="stat-card">
                    <div className="stat-content">
                      <div className="stat-icon">
                        <DashboardOutlined />
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">Nền tảng</p>
                        <p className="stat-value">
                          {systemHealth?.platform || "N/A"}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="stat-card">
                    <div className="stat-content">
                      <div className="stat-icon">
                        <BarChartOutlined />
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">Thời gian hoạt động</p>
                        <p className="stat-value">
                          {Math.floor(systemHealth?.uptime || 0)}s
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="stat-card">
                    <div className="stat-content">
                      <div className="stat-icon">
                        <SettingOutlined />
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">Môi trường</p>
                        <p className="stat-value">
                          {systemHealth?.environment || "N/A"}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Memory Usage */}
                {systemHealth?.memory && (
                  <Card
                    title="💾 Sử dụng bộ nhớ"
                    className="mb-6 memory-card"
                    variant="borderless"
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12} lg={6}>
                        <Statistic
                          title="RSS (MB)"
                          value={(
                            systemHealth.memory.rss /
                            1024 /
                            1024
                          ).toFixed(2)}
                          precision={2}
                        />
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Statistic
                          title="Heap Used (MB)"
                          value={(
                            systemHealth.memory.heapUsed /
                            1024 /
                            1024
                          ).toFixed(2)}
                          precision={2}
                        />
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Statistic
                          title="Heap Total (MB)"
                          value={(
                            systemHealth.memory.heapTotal /
                            1024 /
                            1024
                          ).toFixed(2)}
                          precision={2}
                        />
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Statistic
                          title="External (MB)"
                          value={(
                            systemHealth.memory.external /
                            1024 /
                            1024
                          ).toFixed(2)}
                          precision={2}
                        />
                      </Col>
                    </Row>
                  </Card>
                )}

                {/* User Info */}
                <Card
                  title="👤 Thông tin tài khoản hiện tại"
                  className="settings-card mb-6"
                  variant="borderless"
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <p>
                        <strong>📧 Email:</strong> {user?.email}
                      </p>
                      <p>
                        <strong>🎯 Vai trò:</strong>{" "}
                        <Tag color="red">{user?.role}</Tag>
                      </p>
                    </Col>
                    <Col xs={24} sm={12}>
                      <p>
                        <strong>👤 Họ tên:</strong>{" "}
                        {user?.personalInfo?.firstName}{" "}
                        {user?.personalInfo?.lastName}
                      </p>
                      <p>
                        <strong>📱 Điện thoại:</strong>{" "}
                        {user?.personalInfo?.phone}
                      </p>
                    </Col>
                  </Row>
                </Card>
              </div>
            )}

            {selectedKey === "2" && (
              <Card
                title="📈 Thống kê hệ thống"
                bordered={false}
                extra={<Button type="primary">Làm mới</Button>}
              >
                <Row gutter={16} className="mb-6">
                  <Col xs={24} sm={12}>
                    <Card>
                      <Statistic
                        title="Tổng người dùng"
                        value={users.length || 0}
                        prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card>
                      <Statistic
                        title="Super Admin"
                        value={
                          users.filter((u) => u.role === "SUPER_ADMIN").length
                        }
                        prefix={<LockOutlined style={{ color: "#ff7875" }} />}
                      />
                    </Card>
                  </Col>
                </Row>
                <Empty description="Thêm dữ liệu thống kê sẽ được hiển thị ở đây" />
              </Card>
            )}

            {selectedKey === "3" && (
              <div>
                <h3 className="text-2xl font-bold mb-6">
                  👥 Quản lý người dùng
                </h3>
                <UserManagement />
              </div>
            )}

            {selectedKey === "4" && (
              <div>
                <h3 className="text-2xl font-bold mb-6">
                  👤 Thông tin cá nhân
                </h3>
                <UserProfile />
              </div>
            )}

            {selectedKey === "5" && (
              <div>
                <h3 className="text-2xl font-bold mb-6">🔑 Đổi mật khẩu</h3>
                <ChangePassword />
              </div>
            )}

            {selectedKey === "6" && (
              <Card
                title="⚙️ Cài đặt hệ thống"
                className="settings-card"
                bordered={false}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Card
                      title="🔐 Bảo mật"
                      className="settings-card"
                      type="inner"
                    >
                      <Form layout="vertical">
                        <Form.Item label="Số lần đăng nhập tối đa">
                          <Input value="5" disabled />
                        </Form.Item>
                        <Form.Item label="Thời gian khóa tài khoản">
                          <Input value="15 phút" disabled />
                        </Form.Item>
                        <Button type="primary" block className="mt-4">
                          Cập nhật
                        </Button>
                      </Form>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card
                      title="📧 Email"
                      className="settings-card"
                      type="inner"
                    >
                      <Form layout="vertical">
                        <Form.Item label="Email từ">
                          <Input value="support@healthcare.vn" disabled />
                        </Form.Item>
                        <Form.Item label="SMTP Host">
                          <Input value="smtp.gmail.com" disabled />
                        </Form.Item>
                        <Button type="primary" block className="mt-4">
                          Cập nhật
                        </Button>
                      </Form>
                    </Card>
                  </Col>
                </Row>
              </Card>
            )}
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SuperAdminDashboard;
