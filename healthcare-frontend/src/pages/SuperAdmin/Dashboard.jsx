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
  Modal,
  Space,
  Avatar,
  Dropdown,
  Alert,
  Descriptions,
  Form,
  Input,
  Select,
  Drawer,
  Empty,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  LogoutOutlined,
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  BarChartOutlined,
  DashboardOutlined,
  TeamOutlined,
  BellOutlined,
  FileTextOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  BuildOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  SaveOutlined,
  PrinterOutlined,
  DownloadOutlined,
  LaptopOutlined,
  SafetyOutlined,
  MailOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import "../../styles/RoleDashboards.css";
import "../../styles/SuperAdminDashboard.css";
import "../../styles/SuperAdminAnimations.css";

const { Header, Sider, Content } = Layout;

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [userDrawer, setUserDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    loadDashboardData();
  }, [pagination.current, filterRole, filterStatus]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Lấy danh sách người dùng từ API backend
      const usersResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/users`,
        {
          params: {
            page: pagination.current,
            limit: pagination.pageSize,
            role: filterRole || undefined,
            status: filterStatus || undefined,
            search: searchText || undefined,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data || []);
        if (usersResponse.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: usersResponse.data.pagination.total,
          }));
        }
      }

      // Tính toán stats từ dữ liệu người dùng
      const roleStats = {};
      const statusStats = {};

      (usersResponse.data.data || []).forEach((u) => {
        roleStats[u.role] = (roleStats[u.role] || 0) + 1;
        statusStats[u.status] = (statusStats[u.status] || 0) + 1;
      });

      setSystemStats({
        totalUsers: usersResponse.data.pagination?.total || 0,
        activeUsers: statusStats["ACTIVE"] || 0,
        inactiveUsers: statusStats["INACTIVE"] || 0,
        lockedUsers: statusStats["LOCKED"] || 0,
        pendingUsers: statusStats["PENDING_APPROVAL"] || 0,
        doctors: roleStats["DOCTOR"] || 0,
        nurses: roleStats["NURSE"] || 0,
        pharmacists: roleStats["PHARMACIST"] || 0,
        labTechs: roleStats["LAB_TECHNICIAN"] || 0,
      });

      // Lấy audit logs
      try {
        const auditResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/audit-logs`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            params: { limit: 20 },
          }
        );

        if (auditResponse.data.success) {
          setAuditLogs(auditResponse.data.data || []);
        }
      } catch (auditError) {
        console.log("Audit logs not available");
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
        logout();
        navigate("/login");
      } else {
        message.error("Không thể tải dữ liệu người dùng");
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddUser = () => {
    setSelectedUser(null);
    form.resetFields();
    form.setFieldsValue({
      status: "ACTIVE",
    });
    setUserDrawer(true);
  };

  const handleEditUser = (userData) => {
    setSelectedUser(userData);
    form.setFieldsValue({
      email: userData.email,
      role: userData.role,
      status: userData.status,
      firstName: userData.personalInfo?.firstName || "",
      lastName: userData.personalInfo?.lastName || "",
      phone: userData.personalInfo?.phone || "",
    });
    setUserDrawer(true);
  };

  const handleSaveUser = async () => {
    try {
      const formData = await form.validateFields();

      // Xây dựng personalInfo payload chỉ với các trường không rỗng
      const personalInfo = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      // Chỉ thêm phone nếu có giá trị
      if (formData.phone) {
        personalInfo.phone = formData.phone;
      }

      const payload = {
        email: formData.email,
        role: formData.role,
        status: formData.status,
        personalInfo,
      };

      if (selectedUser) {
        // Cập nhật user - không bao gồm password
        await axios.put(
          `${import.meta.env.VITE_API_URL}/users/${selectedUser._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        message.success("Cập nhật người dùng thành công");
      } else {
        // Tạo user mới - bắt buộc có password
        if (!formData.password) {
          message.error("Mật khẩu là bắt buộc khi tạo user mới");
          return;
        }
        payload.password = formData.password;

        await axios.post(`${import.meta.env.VITE_API_URL}/users`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        message.success("Tạo người dùng thành công");
      }

      setUserDrawer(false);
      form.resetFields();
      setPagination({ current: 1, pageSize: 10 });
      loadDashboardData();
    } catch (error) {
      console.error("Lỗi lưu người dùng:", error);
      message.error(
        error.response?.data?.message || "Không thể lưu người dùng"
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        data: { reason: "Xóa từ dashboard" },
      });
      message.success("Xóa người dùng thành công");
      loadDashboardData();
    } catch (error) {
      console.error("Lỗi xóa người dùng:", error);
      message.error("Không thể xóa người dùng");
    }
  };

  const handleDisableUser = async (userId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/${userId}/disable`,
        { reason: "Vô hiệu hóa từ dashboard" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      message.success("Vô hiệu hóa người dùng thành công");
      loadDashboardData();
    } catch (error) {
      console.error("Lỗi vô hiệu hóa:", error);
      message.error("Không thể vô hiệu hóa người dùng");
    }
  };

  const handleEnableUser = async (userId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/${userId}/enable`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      message.success("Kích hoạt người dùng thành công");
      loadDashboardData();
    } catch (error) {
      console.error("Lỗi kích hoạt:", error);
      message.error("Không thể kích hoạt người dùng");
    }
  };

  const usersColumns = [
    {
      title: "👤 Tên",
      dataIndex: ["personalInfo", "firstName"],
      key: "name",
      render: (firstName, record) => (
        <div>
          <div style={{ fontWeight: "700", color: "#1f2937" }}>
            {record.personalInfo?.firstName} {record.personalInfo?.lastName}
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
            {record.email}
          </div>
        </div>
      ),
    },
    {
      title: "🎯 Vai Trò",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const roleEmojis = {
          SUPER_ADMIN: "👑",
          HOSPITAL_ADMIN: "👔",
          DOCTOR: "👨‍⚕️",
          NURSE: "👩‍⚕️",
          PHARMACIST: "💊",
          LAB_TECHNICIAN: "🧪",
          RECEPTIONIST: "🛎️",
          BILLING_STAFF: "💰",
          PATIENT: "🧑",
        };
        const roleColors = {
          SUPER_ADMIN: "red",
          HOSPITAL_ADMIN: "purple",
          DEPARTMENT_HEAD: "blue",
          DOCTOR: "blue",
          NURSE: "cyan",
          PHARMACIST: "orange",
          LAB_TECHNICIAN: "green",
          RECEPTIONIST: "magenta",
          BILLING_STAFF: "volcano",
          PATIENT: "default",
        };
        return (
          <Tag color={roleColors[role] || "default"}>
            {roleEmojis[role] || "👤"} {role.replace(/_/g, " ")}
          </Tag>
        );
      },
    },
    {
      title: "📊 Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusColors = {
          ACTIVE: "success",
          INACTIVE: "default",
          SUSPENDED: "error",
          LOCKED: "error",
          PENDING_APPROVAL: "warning",
        };
        const statusLabels = {
          ACTIVE: "✅ Hoạt động",
          INACTIVE: "⏸️ Không hoạt động",
          SUSPENDED: "🚫 Tạm dừng",
          LOCKED: "🔒 Bị khóa",
          PENDING_APPROVAL: "⏳ Chờ duyệt",
        };
        return (
          <Badge status={statusColors[status]} text={statusLabels[status]} />
        );
      },
    },
    {
      title: "📱 Điện Thoại",
      dataIndex: ["personalInfo", "phone"],
      key: "phone",
      render: (phone) => phone || "-",
    },
    {
      title: "🕐 Đăng Nhập Lần Cuối",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (date) => {
        if (!date)
          return <span style={{ color: "#9ca3af" }}>Chưa đăng nhập</span>;
        return new Date(date).toLocaleString("vi-VN");
      },
    },
    {
      title: "⚡ Hành Động",
      key: "action",
      width: 220,
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="Xem chi tiết người dùng">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                Modal.info({
                  title: `👤 Chi Tiết Người Dùng: ${record.personalInfo?.firstName} ${record.personalInfo?.lastName}`,
                  width: 600,
                  content: (
                    <Descriptions bordered size="small" column={1}>
                      <Descriptions.Item label="📧 Email">
                        {record.email}
                      </Descriptions.Item>
                      <Descriptions.Item label="👤 Họ Tên">
                        {record.personalInfo?.firstName}{" "}
                        {record.personalInfo?.lastName}
                      </Descriptions.Item>
                      <Descriptions.Item label="⚧ Giới Tính">
                        {record.personalInfo?.gender === "MALE"
                          ? "👨 Nam"
                          : record.personalInfo?.gender === "FEMALE"
                          ? "👩 Nữ"
                          : "🧑 Khác"}
                      </Descriptions.Item>
                      <Descriptions.Item label="📱 Điện Thoại">
                        {record.personalInfo?.phone || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="🎯 Vai Trò">
                        <Tag color="blue">{record.role}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="📊 Trạng Thái">
                        <Badge
                          status={
                            record.status === "ACTIVE" ? "success" : "error"
                          }
                          text={record.status}
                        />
                      </Descriptions.Item>
                      <Descriptions.Item label="🕐 Đăng Nhập Lần Cuối">
                        {record.lastLogin
                          ? new Date(record.lastLogin).toLocaleString("vi-VN")
                          : "Chưa đăng nhập"}
                      </Descriptions.Item>
                      <Descriptions.Item label="📅 Ngày Tạo">
                        {new Date(record.createdAt).toLocaleString("vi-VN")}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                  okText: "Đóng",
                });
              }}
            >
              Chi Tiết
            </Button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa thông tin người dùng">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            >
              Sửa
            </Button>
          </Tooltip>
          {record.status === "ACTIVE" && (
            <Tooltip title="Vô hiệu hóa người dùng này">
              <Popconfirm
                title="Vô Hiệu Hóa Người Dùng?"
                description="Người dùng sẽ không thể đăng nhập"
                onConfirm={() => handleDisableUser(record._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button size="small" danger>
                  Tắt
                </Button>
              </Popconfirm>
            </Tooltip>
          )}
          {record.status === "INACTIVE" && (
            <Tooltip title="Kích hoạt người dùng này">
              <Button
                size="small"
                type="primary"
                onClick={() => handleEnableUser(record._id)}
              >
                Bật
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Xóa vĩnh viễn người dùng này">
            <Popconfirm
              title="Xóa Người Dùng?"
              description="⚠️ Hành động này không thể hoàn tác"
              onConfirm={() => handleDeleteUser(record._id)}
              okText="Xóa"
              okButtonProps={{ danger: true }}
              cancelText="Hủy"
            >
              <Button size="small" icon={<DeleteOutlined />} danger>
                Xóa
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const auditLogsColumns = [
    {
      title: "👤 Người Dùng",
      dataIndex: "userId",
      key: "userId",
      render: (userId) => {
        const userRecord = users.find((u) => u._id === userId);
        return userRecord
          ? `${userRecord.personalInfo?.firstName} ${userRecord.personalInfo?.lastName}`
          : userId;
      },
    },
    {
      title: "⚡ Hành Động",
      dataIndex: "action",
      key: "action",
      render: (action) => {
        const actionIcons = {
          CREATE: "➕",
          UPDATE: "✏️",
          DELETE: "🗑️",
          LOGIN: "🔓",
          LOGOUT: "🔐",
          VIEW: "👁️",
        };
        return (
          <Tag color="blue">
            {actionIcons[action] || "⚡"} {action}
          </Tag>
        );
      },
    },
    {
      title: "📦 Tài Nguyên",
      dataIndex: "resource",
      key: "resource",
      render: (resource) => <Tag>{resource}</Tag>,
    },
    {
      title: "🕐 Thời Gian",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleString("vi-VN");
      },
    },
    {
      title: "✅ Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          SUCCESS: "green",
          FAILURE: "red",
          WARNING: "orange",
        };
        const labels = {
          SUCCESS: "✅ Thành công",
          FAILURE: "❌ Thất bại",
          WARNING: "⚠️ Cảnh báo",
        };
        return (
          <Tag color={colors[status] || "default"}>
            {labels[status] || status}
          </Tag>
        );
      },
    },
  ];

  const renderDashboard = () => {
    return (
      <div>
        <Alert
          message="✅ Dữ liệu được tải từ backend API. Tất cả thay đổi sẽ được lưu vào cơ sở dữ liệu."
          type="success"
          showIcon
          closable
          style={{ marginBottom: "24px", borderRadius: "8px" }}
          icon={<CheckCircleOutlined />}
        />

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="stat-card"
              hoverable
              style={{ borderTop: "4px solid #1890ff" }}
            >
              <Statistic
                title="Tổng Người Dùng"
                value={systemStats.totalUsers}
                prefix={<TeamOutlined style={{ marginRight: "8px" }} />}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="stat-card"
              hoverable
              style={{ borderTop: "4px solid #52c41a" }}
            >
              <Statistic
                title="Người Dùng Hoạt Động"
                value={systemStats.activeUsers}
                prefix={
                  <CheckCircleOutlined
                    style={{ marginRight: "8px", color: "#52c41a" }}
                  />
                }
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="stat-card"
              hoverable
              style={{ borderTop: "4px solid #faad14" }}
            >
              <Statistic
                title="Chưa Hoạt Động"
                value={systemStats.inactiveUsers}
                prefix={
                  <ClockCircleOutlined
                    style={{ marginRight: "8px", color: "#faad14" }}
                  />
                }
                valueStyle={{
                  color: "#faad14",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="stat-card"
              hoverable
              style={{ borderTop: "4px solid #f5222d" }}
            >
              <Statistic
                title="Bị Khóa/Tạm Dừng"
                value={
                  (systemStats.lockedUsers || 0) +
                  (systemStats.pendingUsers || 0)
                }
                prefix={
                  <StopOutlined
                    style={{ marginRight: "8px", color: "#f5222d" }}
                  />
                }
                valueStyle={{
                  color: "#f5222d",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" hoverable>
              <Statistic
                title="👨‍⚕️ Bác Sĩ"
                value={systemStats.doctors}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "28px",
                  fontWeight: "700",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" hoverable>
              <Statistic
                title="👩‍⚕️ Y Tá"
                value={systemStats.nurses}
                valueStyle={{
                  color: "#13c2c2",
                  fontSize: "28px",
                  fontWeight: "700",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" hoverable>
              <Statistic
                title="💊 Dược Sĩ"
                value={systemStats.pharmacists}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "28px",
                  fontWeight: "700",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" hoverable>
              <Statistic
                title="🧪 Lab Technician"
                value={systemStats.labTechs}
                valueStyle={{
                  color: "#faad14",
                  fontSize: "28px",
                  fontWeight: "700",
                }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="⚡ Tác Vụ Nhanh"
          style={{ marginBottom: "24px" }}
          extra={<Badge count={2} color="#faad14" />}
        >
          <Space wrap style={{ gap: "16px" }}>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleAddUser}
              style={{ minWidth: "180px" }}
            >
              Thêm Người Dùng
            </Button>
            <Button
              icon={<ReloadOutlined />}
              size="large"
              onClick={() => loadDashboardData()}
              style={{ minWidth: "140px" }}
            >
              Làm Tươi
            </Button>
            <Button
              icon={<PrinterOutlined />}
              size="large"
              style={{ minWidth: "140px" }}
            >
              In Báo Cáo
            </Button>
            <Button
              icon={<DownloadOutlined />}
              size="large"
              style={{ minWidth: "160px" }}
            >
              Xuất Excel
            </Button>
          </Space>
        </Card>

        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: `👥 Người Dùng (${users.length})`,
              children: (
                <Card>
                  <div
                    style={{
                      marginBottom: "16px",
                      display: "flex",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <Input
                      placeholder="🔍 Tìm kiếm theo email hoặc tên..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onPressEnter={() => {
                        setPagination({ current: 1, pageSize: 10 });
                        loadDashboardData();
                      }}
                      style={{ width: "220px" }}
                    />
                    <Select
                      placeholder="🎯 Vai trò"
                      style={{ width: "150px" }}
                      allowClear
                      value={filterRole}
                      onChange={setFilterRole}
                      options={[
                        { label: "Tất cả vai trò", value: "" },
                        { label: "👨‍⚕️ Bác sĩ", value: "DOCTOR" },
                        { label: "👩‍⚕️ Y tá", value: "NURSE" },
                        { label: "💊 Dược sĩ", value: "PHARMACIST" },
                        { label: "🧪 Lab Technician", value: "LAB_TECHNICIAN" },
                        { label: "🛎️ Lễ tân", value: "RECEPTIONIST" },
                        {
                          label: "💰 Nhân viên kế toán",
                          value: "BILLING_STAFF",
                        },
                        { label: "👔 Admin", value: "HOSPITAL_ADMIN" },
                        { label: "🧑 Bệnh nhân", value: "PATIENT" },
                      ]}
                    />
                    <Select
                      placeholder="📊 Trạng thái"
                      style={{ width: "150px" }}
                      allowClear
                      value={filterStatus}
                      onChange={setFilterStatus}
                      options={[
                        { label: "Tất cả", value: "" },
                        { label: "✅ Hoạt động", value: "ACTIVE" },
                        { label: "⏸️ Không hoạt động", value: "INACTIVE" },
                        { label: "🔒 Bị khóa", value: "LOCKED" },
                      ]}
                    />
                    <Button
                      icon={<SearchOutlined />}
                      onClick={() => {
                        setPagination({ current: 1, pageSize: 10 });
                        loadDashboardData();
                      }}
                    >
                      Tìm Kiếm
                    </Button>
                  </div>
                  <Table
                    columns={usersColumns}
                    dataSource={users}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                      current: pagination.current,
                      pageSize: pagination.pageSize,
                      total: pagination.total,
                      onChange: (page, pageSize) => {
                        setPagination({ current: page, pageSize });
                      },
                    }}
                    scroll={{ x: 1200 }}
                  />
                </Card>
              ),
            },
            {
              key: "2",
              label: `📋 Nhật Ký (${auditLogs.length})`,
              children: (
                <Card>
                  <Table
                    columns={auditLogsColumns}
                    dataSource={auditLogs}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 20 }}
                    scroll={{ x: 1000 }}
                  />
                </Card>
              ),
            },
          ]}
        />
      </div>
    );
  };

  return (
    <Layout className="role-dashboard-layout superadmin-dashboard">
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
            <DashboardOutlined
              className="logo-icon"
              style={{ fontSize: "28px" }}
            />
            {!collapsed && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                <span style={{ fontSize: "14px", fontWeight: "700" }}>
                  Siêu Quản Trị
                </span>
                <span style={{ fontSize: "11px", opacity: "0.8" }}>
                  Admin Panel
                </span>
              </div>
            )}
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
              label: "📊 Bảng Điều Khiển",
            },
            {
              key: "2",
              icon: <TeamOutlined />,
              label: "👥 Quản Lý Người Dùng",
            },
            {
              key: "3",
              icon: <FileTextOutlined />,
              label: "📋 Nhật Ký Kiểm Toán",
            },
            {
              key: "4",
              icon: <BarChartOutlined />,
              label: "📈 Báo Cáo Hệ Thống",
            },
            {
              key: "5",
              icon: <SettingOutlined />,
              label: "⚙️ Cài Đặt Hệ Thống",
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header className="role-dashboard-header">
          <div className="header-content">
            <h1>🏥 Bảng Điều Khiển Siêu Quản Trị Viên</h1>
            <Space size={24}>
              <Badge count={0} color="#ff4d4f">
                <Button
                  type="text"
                  icon={
                    <BellOutlined
                      style={{ fontSize: "20px", color: "#1890ff" }}
                    />
                  }
                />
              </Badge>
              <Dropdown
                menu={{
                  items: [
                    {
                      label: "👤 Hồ Sơ Cá Nhân",
                      icon: <UserOutlined />,
                    },
                    {
                      type: "divider",
                    },
                    {
                      label: "🔒 Đổi Mật Khẩu",
                      icon: <SettingOutlined />,
                    },
                    {
                      type: "divider",
                    },
                    {
                      label: "Đăng Xuất",
                      icon: <LogoutOutlined />,
                      onClick: handleLogout,
                    },
                  ],
                }}
              >
                <Button type="text">
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                  <span
                    style={{
                      marginLeft: "8px",
                      color: "#1f2937",
                      fontWeight: "600",
                    }}
                  >
                    {user?.email}
                  </span>
                </Button>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content className="role-dashboard-content">
          <Spin spinning={loading}>
            {selectedKey === "1" && renderDashboard()}
            {selectedKey === "2" && (
              <Card
                title="👥 Quản Lý Người Dùng"
                style={{ marginBottom: "24px" }}
              >
                <div
                  style={{
                    marginBottom: "20px",
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleAddUser}
                  >
                    Thêm Người Dùng Mới
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => loadDashboardData()}
                  >
                    Làm Tươi
                  </Button>
                </div>
                <Table
                  columns={usersColumns}
                  dataSource={users}
                  rowKey="_id"
                  loading={loading}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: (page, pageSize) => {
                      setPagination({ current: page, pageSize });
                    },
                  }}
                  scroll={{ x: 1200 }}
                />
              </Card>
            )}
            {selectedKey === "3" && (
              <Card title="📋 Nhật Ký Kiểm Toán">
                <div style={{ marginBottom: "16px" }}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => loadDashboardData()}
                  >
                    Làm Tươi
                  </Button>
                </div>
                <Table
                  columns={auditLogsColumns}
                  dataSource={auditLogs}
                  rowKey="_id"
                  loading={loading}
                  pagination={{ pageSize: 20 }}
                  scroll={{ x: 1000 }}
                />
              </Card>
            )}
            {selectedKey === "4" && (
              <Card title="📊 Báo Cáo Hệ Thống">
                <div
                  style={{
                    marginBottom: "20px",
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <Button type="primary" icon={<DownloadOutlined />}>
                    Tải Xuống Báo Cáo
                  </Button>
                  <Button icon={<PrinterOutlined />}>In Báo Cáo</Button>
                  <Select
                    style={{ width: 200 }}
                    placeholder="Chọn loại báo cáo"
                    options={[
                      { label: "📱 Báo cáo người dùng", value: "users" },
                      { label: "📈 Báo cáo hoạt động", value: "activity" },
                      { label: "🔐 Báo cáo bảo mật", value: "security" },
                      { label: "⚙️ Báo cáo hệ thống", value: "system" },
                    ]}
                  />
                </div>
                <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        textAlign: "center",
                        borderTop: "4px solid #1890ff",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "28px",
                          color: "#1890ff",
                          fontWeight: "bold",
                          marginBottom: "8px",
                        }}
                      >
                        {systemStats?.totalUsers || 0}
                      </div>
                      <div style={{ color: "#666", fontSize: "13px" }}>
                        👥 Tổng Người Dùng
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        textAlign: "center",
                        borderTop: "4px solid #52c41a",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "28px",
                          color: "#52c41a",
                          fontWeight: "bold",
                          marginBottom: "8px",
                        }}
                      >
                        {systemStats?.activeUsers || 0}
                      </div>
                      <div style={{ color: "#666", fontSize: "13px" }}>
                        ✅ Hoạt Động
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        textAlign: "center",
                        borderTop: "4px solid #faad14",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "28px",
                          color: "#faad14",
                          fontWeight: "bold",
                          marginBottom: "8px",
                        }}
                      >
                        {systemStats?.inactiveUsers || 0}
                      </div>
                      <div style={{ color: "#666", fontSize: "13px" }}>
                        ⏸️ Không Hoạt Động
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        textAlign: "center",
                        borderTop: "4px solid #f5222d",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "28px",
                          color: "#f5222d",
                          fontWeight: "bold",
                          marginBottom: "8px",
                        }}
                      >
                        {systemStats?.lockedUsers || 0}
                      </div>
                      <div style={{ color: "#666", fontSize: "13px" }}>
                        🔒 Bị Khóa
                      </div>
                    </Card>
                  </Col>
                </Row>
                <Card title="📈 Hoạt động gần đây">
                  <Table
                    columns={[
                      {
                        title: "👤 Người Dùng",
                        dataIndex: ["userId", "email"],
                        key: "user",
                      },
                      {
                        title: "⚡ Hành Động",
                        dataIndex: "action",
                        key: "action",
                        render: (action) => <Tag color="blue">{action}</Tag>,
                      },
                      {
                        title: "🕐 Thời Gian",
                        dataIndex: "timestamp",
                        key: "time",
                        render: (time) =>
                          time ? new Date(time).toLocaleString("vi-VN") : "-",
                      },
                    ]}
                    dataSource={auditLogs.slice(0, 10)}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                    scroll={{ x: 1000 }}
                  />
                </Card>
              </Card>
            )}
            {selectedKey === "5" && (
              <Card title="⚙️ Cài Đặt Hệ Thống">
                <Tabs
                  items={[
                    {
                      key: "1",
                      label: "🖥️ Thông Tin Hệ Thống",
                      children: (
                        <Form layout="vertical">
                          <Alert
                            message="ℹ️ Thông tin cấu hình hệ thống và phiên bản"
                            type="info"
                            showIcon
                            style={{ marginBottom: "20px" }}
                          />
                          <Form.Item label="Tên Hệ Thống">
                            <Input
                              value="Healthcare Management System"
                              disabled
                              style={{ backgroundColor: "#f5f5f5" }}
                            />
                          </Form.Item>
                          <Form.Item label="Phiên Bản">
                            <Input
                              value="v1.0.0"
                              disabled
                              style={{ backgroundColor: "#f5f5f5" }}
                            />
                          </Form.Item>
                          <Form.Item label="Môi Trường">
                            <Input
                              value="Production"
                              disabled
                              style={{ backgroundColor: "#f5f5f5" }}
                            />
                          </Form.Item>
                          <Form.Item label="Cơ Sở Dữ Liệu">
                            <Input
                              value="MongoDB"
                              disabled
                              style={{ backgroundColor: "#f5f5f5" }}
                            />
                          </Form.Item>
                          <Form.Item label="API Server">
                            <Input
                              value={import.meta.env.VITE_API_URL}
                              disabled
                              style={{ backgroundColor: "#f5f5f5" }}
                            />
                          </Form.Item>
                        </Form>
                      ),
                    },
                    {
                      key: "2",
                      label: "🔐 Bảo Mật",
                      children: (
                        <Form layout="vertical">
                          <Alert
                            message="⚠️ Cài đặt bảo mật và quyền truy cập hệ thống"
                            type="warning"
                            showIcon
                            style={{ marginBottom: "20px" }}
                          />
                          <Form.Item label="Cho phép đăng ký người dùng mới">
                            <Space>
                              <Button type="primary">Bật</Button>
                              <Button>Tắt</Button>
                            </Space>
                          </Form.Item>
                          <Form.Item label="Yêu cầu xác minh email">
                            <Space>
                              <Button type="primary">Bật</Button>
                              <Button>Tắt</Button>
                            </Space>
                          </Form.Item>
                          <Form.Item label="Thời gian hết hạn phiên (phút)">
                            <Input type="number" defaultValue={60} />
                          </Form.Item>
                          <Form.Item label="Số lần đăng nhập tối đa">
                            <Input type="number" defaultValue={5} />
                          </Form.Item>
                          <Button type="primary" icon={<SaveOutlined />}>
                            Lưu Cài Đặt Bảo Mật
                          </Button>
                        </Form>
                      ),
                    },
                    {
                      key: "3",
                      label: "📧 Email",
                      children: (
                        <Form layout="vertical">
                          <Alert
                            message="ℹ️ Cài đặt máy chủ email cho thông báo hệ thống"
                            type="info"
                            showIcon
                            style={{ marginBottom: "20px" }}
                          />
                          <Form.Item label="SMTP Server">
                            <Input placeholder="ví dụ: smtp.gmail.com" />
                          </Form.Item>
                          <Form.Item label="SMTP Port">
                            <Input type="number" placeholder="ví dụ: 587" />
                          </Form.Item>
                          <Form.Item label="Email Từ">
                            <Input placeholder="ví dụ: noreply@healthcare.com" />
                          </Form.Item>
                          <Form.Item label="Tên Hiển Thị">
                            <Input placeholder="Healthcare System" />
                          </Form.Item>
                          <Button type="primary" icon={<SaveOutlined />}>
                            Lưu Cài Đặt Email
                          </Button>
                        </Form>
                      ),
                    },
                  ]}
                />
              </Card>
            )}
          </Spin>
        </Content>
      </Layout>

      {/* User Drawer */}
      <Drawer
        title={
          selectedUser ? "✏️ Chỉnh Sửa Người Dùng" : "➕ Thêm Người Dùng Mới"
        }
        placement="right"
        onClose={() => {
          setUserDrawer(false);
          form.resetFields();
        }}
        open={userDrawer}
        width={500}
        footer={
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
          >
            <Button onClick={() => setUserDrawer(false)}>Hủy</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveUser}
            >
              Lưu
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="📧 Email"
            name="email"
            rules={[
              { required: true, message: "Email là bắt buộc" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input
              placeholder="Nhập email"
              disabled={!!selectedUser}
              prefix={<MailOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="👤 Họ"
            name="firstName"
            rules={[{ required: true, message: "Họ là bắt buộc" }]}
          >
            <Input placeholder="Nhập họ" />
          </Form.Item>

          <Form.Item
            label="👤 Tên"
            name="lastName"
            rules={[{ required: true, message: "Tên là bắt buộc" }]}
          >
            <Input placeholder="Nhập tên" />
          </Form.Item>

          <Form.Item label="📱 Điện Thoại" name="phone">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          {!selectedUser && (
            <Form.Item
              label="🔐 Mật Khẩu"
              name="password"
              rules={[
                {
                  required: !selectedUser,
                  message: "Mật khẩu là bắt buộc khi tạo user mới",
                },
                {
                  min: 8,
                  message: "Mật khẩu phải có ít nhất 8 ký tự",
                },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                  message:
                    "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt",
                },
              ]}
            >
              <Input.Password
                placeholder="Nhập mật khẩu (min 8 ký tự, chứa chữ hoa, thường, số, ký tự đặc biệt)"
                prefix={<LockOutlined />}
              />
            </Form.Item>
          )}

          <Form.Item
            label="🎯 Vai Trò"
            name="role"
            rules={[{ required: true, message: "Vai trò là bắt buộc" }]}
          >
            <Select
              placeholder="Chọn vai trò"
              options={[
                { label: "👨‍⚕️ Bác sĩ", value: "DOCTOR" },
                { label: "👩‍⚕️ Y tá", value: "NURSE" },
                { label: "💊 Dược sĩ", value: "PHARMACIST" },
                { label: "🧪 Lab Technician", value: "LAB_TECHNICIAN" },
                { label: "🛎️ Lễ tân", value: "RECEPTIONIST" },
                { label: "💰 Nhân viên kế toán", value: "BILLING_STAFF" },
                { label: "👔 Admin", value: "HOSPITAL_ADMIN" },
                { label: "🧑 Bệnh nhân", value: "PATIENT" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="📊 Trạng Thái"
            name="status"
            rules={[{ required: true, message: "Trạng thái là bắt buộc" }]}
          >
            <Select
              placeholder="Chọn trạng thái"
              options={[
                { label: "✅ Hoạt động", value: "ACTIVE" },
                { label: "⏸️ Không hoạt động", value: "INACTIVE" },
                { label: "⏳ Chờ duyệt", value: "PENDING_APPROVAL" },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </Layout>
  );
};

export default SuperAdminDashboard;
