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
  ExperimentOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  BarChartOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../utils/api";

const { Header, Sider, Content } = Layout;

const LabTechnicianDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedToday: 0,
    pendingOrders: 0,
    failedTests: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Tạm thời dùng dummy data, thực tế sẽ call API
      setStats({
        totalOrders: 234,
        completedToday: 18,
        pendingOrders: 7,
        failedTests: 2,
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
      icon: <ExperimentOutlined />,
      label: "Đơn Xét Nghiệm Mới",
    },
    {
      key: "3",
      icon: <FileTextOutlined />,
      label: "Kết Quả Xét Nghiệm",
    },
    {
      key: "4",
      icon: <BarChartOutlined />,
      label: "Báo Cáo Chất Lượng",
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
          <ExperimentOutlined style={{ fontSize: "32px", color: "#fff" }} />
          {!collapsed && (
            <div
              style={{ color: "#fff", marginTop: "10px", fontWeight: "bold" }}
            >
              Xét Nghiệm Dashboard
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
            Hệ Thống Quản Lý Y Tế - Kỹ Thuật Viên Xét Nghiệm
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
                        title="Tổng Đơn Xét Nghiệm"
                        value={stats.totalOrders}
                        prefix={<FileTextOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Hoàn Thành Hôm Nay"
                        value={stats.completedToday}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Đang Xử Lý"
                        value={stats.pendingOrders}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: "#faad14" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Xét Nghiệm Lỗi"
                        value={stats.failedTests}
                        prefix={<WarningOutlined />}
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
              <Card title="Đơn Xét Nghiệm Mới">
                <Empty description="Không có đơn xét nghiệm nào" />
              </Card>
            )}

            {selectedKey === "3" && (
              <Card title="Kết Quả Xét Nghiệm">
                <Empty description="Không có kết quả nào" />
              </Card>
            )}

            {selectedKey === "4" && (
              <Card title="Báo Cáo Chất Lượng">
                <Empty description="Không có báo cáo nào" />
              </Card>
            )}
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LabTechnicianDashboard;
