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
} from "antd";
import {
  LogoutOutlined,
  HomeOutlined,
  UserOutlined,
  HeartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../utils/api";

const { Header, Sider, Content } = Layout;

const NurseDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingVisits: 0,
    vitalMonitoring: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Tạm thời dùng dummy data, thực tế sẽ call API
      setStats({
        totalPatients: 24,
        todayAppointments: 5,
        pendingVisits: 3,
        vitalMonitoring: 8,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      message.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/superadmin/login", { replace: true });
  };

  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Tổng Quan",
    },
    {
      key: "2",
      icon: <CalendarOutlined />,
      label: "Lịch Hẹn Hôm Nay",
    },
    {
      key: "3",
      icon: <HeartOutlined />,
      label: "Theo Dõi Dấu Hiệu Sống",
    },
    {
      key: "4",
      icon: <FileTextOutlined />,
      label: "Hồ Sơ Bệnh Nhân",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: "#001529" }}
      >
        <div style={{ padding: "20px", textAlign: "center" }}>
          <HeartOutlined style={{ fontSize: "32px", color: "#fff" }} />
          {!collapsed && (
            <div
              style={{ color: "#fff", marginTop: "10px", fontWeight: "bold" }}
            >
              Y Tá Dashboard
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          selectedKeys={[selectedKey]}
          onClick={(e) => setSelectedKey(e.key)}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>
            Hệ Thống Quản Lý Y Tế - Y Tá
          </div>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <span>{user?.personalInfo?.firstName}</span>
            <Button
              type="text"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Đăng Xuất
            </Button>
          </Space>
        </Header>

        <Content style={{ padding: "20px", background: "#f5f5f5" }}>
          <Spin spinning={loading}>
            {selectedKey === "1" && (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Bệnh Nhân Được Giao"
                        value={stats.totalPatients}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Lịch Hẹn Hôm Nay"
                        value={stats.todayAppointments}
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Chuyến Thăm Khám Chưa Xong"
                        value={stats.pendingVisits}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: "#faad14" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Theo Dõi Dấu Hiệu Sống"
                        value={stats.vitalMonitoring}
                        prefix={<HeartOutlined />}
                        valueStyle={{ color: "#f5222d" }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Card style={{ marginTop: "20px" }}>
                  <Empty
                    description="Không có dữ liệu"
                    style={{ marginTop: "50px" }}
                  />
                </Card>
              </>
            )}

            {selectedKey === "2" && (
              <Card title="Lịch Hẹn Hôm Nay">
                <Empty description="Không có lịch hẹn nào" />
              </Card>
            )}

            {selectedKey === "3" && (
              <Card title="Theo Dõi Dấu Hiệu Sống">
                <Empty description="Không có dữ liệu theo dõi" />
              </Card>
            )}

            {selectedKey === "4" && (
              <Card title="Hồ Sơ Bệnh Nhân">
                <Empty description="Không có bệnh nhân nào" />
              </Card>
            )}
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default NurseDashboard;
