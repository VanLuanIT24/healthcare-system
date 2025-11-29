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

  // Dashboard Stats
  const [stats, setStats] = useState({
    assignedPatients: 12,
    todayAppointments: 5,
    pendingCare: 3,
    vitalAnomalies: 1,
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
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: "linear-gradient(180deg, #001529 0%, #0a2540 100%)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "rgba(255,255,255,0.05)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <HeartOutlined style={{ fontSize: "32px", color: "#52c41a" }} />
          {!collapsed && (
            <>
              <div
                style={{
                  color: "#fff",
                  marginTop: "10px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Điều Dưỡng
              </div>
              <div
                style={{ fontSize: "11px", color: "#bbb", marginTop: "4px" }}
              >
                v1.0 Pro
              </div>
            </>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          selectedKeys={[selectedKey]}
          onClick={(e) => setSelectedKey(e.key)}
          items={menuItems}
          style={{ background: "transparent" }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div>
            <div
              style={{ fontSize: "18px", fontWeight: "700", color: "#001529" }}
            >
              Hệ Thống Quản Lý Y Tế - Điều Dưỡng
            </div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>
              Quản lý chăm sóc bệnh nhân và theo dõi sinh hiệu
            </div>
          </div>
          <Space size="large">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Avatar
                size={40}
                style={{ background: "#52c41a" }}
                icon={<UserOutlined />}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>
                  {user?.personalInfo?.firstName || "Y Tá"}
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>
                  Điều Dưỡng
                </div>
              </div>
            </div>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Đăng Xuất
            </Button>
          </Space>
        </Header>

        <Content style={{ padding: "24px", background: "#f8f9fa" }}>
          <Spin spinning={loading}>
            {/* DASHBOARD TAB */}
            {selectedKey === "1" && (
              <>
                <Alert
                  message="Bạn có 1 bệnh nhân cần chú ý - Huyết áp cao"
                  type="warning"
                  showIcon
                  closable
                  style={{ marginBottom: "24px" }}
                />

                <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        borderTop: "4px solid #1890ff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <Statistic
                        title="Bệnh Nhân Được Giao"
                        value={stats.assignedPatients}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: "#1890ff", fontSize: "28px" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        borderTop: "4px solid #52c41a",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <Statistic
                        title="Lịch Hẹn Hôm Nay"
                        value={stats.todayAppointments}
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: "#52c41a", fontSize: "28px" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        borderTop: "4px solid #faad14",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <Statistic
                        title="Cần Chăm Sóc"
                        value={stats.pendingCare}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: "#faad14", fontSize: "28px" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        borderTop: "4px solid #f5222d",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <Statistic
                        title="Dị Thường Sinh Hiệu"
                        value={stats.vitalAnomalies}
                        prefix={<HeartOutlined />}
                        valueStyle={{ color: "#f5222d", fontSize: "28px" }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="Bệnh Nhân Cần Chú Ý" size="large">
                      {patientsList
                        .filter((p) => p.status !== "stable")
                        .map((patient) => (
                          <Card
                            key={patient.id}
                            size="small"
                            style={{ marginBottom: "12px" }}
                            hoverable
                          >
                            <Row justify="space-between" align="middle">
                              <Col>
                                <div style={{ fontWeight: 600 }}>
                                  {patient.name}
                                </div>
                                <div
                                  style={{ fontSize: "12px", color: "#999" }}
                                >
                                  P. {patient.room} • {patient.diagnosis}
                                </div>
                              </Col>
                              <Col>
                                <Badge
                                  color={getPriorityColor(patient.priority)}
                                  text={
                                    patient.priority === "high"
                                      ? "🔴 Cao"
                                      : "🟠 Trung"
                                  }
                                />
                              </Col>
                            </Row>
                          </Card>
                        ))}
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card title="Tác Vụ Hôm Nay" size="large">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {[
                          "Kiểm tra sinh hiệu lúc 9h",
                          "Cấp thuốc cho 5 bệnh nhân",
                          "Thay băng cho bệnh nhân phòng 301",
                          "Báo cáo với bác sĩ",
                        ].map((task, i) => (
                          <div
                            key={i}
                            style={{
                              padding: "12px",
                              background: "#f5f5f5",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <CheckCircleOutlined
                              style={{ color: "#52c41a", fontSize: "16px" }}
                            />
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </>
            )}

            {/* PATIENT LIST TAB */}
            {selectedKey === "2" && (
              <Card
                title="Danh Sách Bệnh Nhân Được Giao"
                size="large"
                style={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Table
                  columns={patientColumns}
                  dataSource={patientsList}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1000 }}
                />
              </Card>
            )}

            {/* MEDICAL RECORDS TAB */}
            {selectedKey === "3" && (
              <Card
                title="Danh Sách Hồ Sơ Bệnh Án"
                size="large"
                style={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Table
                  columns={[
                    { title: "Bệnh Nhân", dataIndex: "name", key: "name" },
                    {
                      title: "Phòng",
                      dataIndex: "room",
                      key: "room",
                      width: 80,
                    },
                    {
                      title: "Hành Động",
                      key: "action",
                      render: (_, record) => (
                        <Button
                          type="primary"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => showMedicalRecord(record)}
                        >
                          Xem Chi Tiết
                        </Button>
                      ),
                    },
                  ]}
                  dataSource={patientsList}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            )}

            {/* VITAL SIGNS & NOTES TAB */}
            {selectedKey === "4" && (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card
                    title="Theo Dõi Sinh Hiệu"
                    size="large"
                    extra={
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                      >
                        Thêm
                      </Button>
                    }
                  >
                    {patientsList.map((patient) => (
                      <div key={patient.id} style={{ marginBottom: "16px" }}>
                        <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                          {patient.name}
                        </div>
                        {vitalRecords[patient.id]
                          ?.slice(0, 2)
                          .map((vital, i) => (
                            <div
                              key={i}
                              style={{
                                padding: "12px",
                                background: "#f5f5f5",
                                marginBottom: "8px",
                                borderRadius: "6px",
                                fontSize: "12px",
                              }}
                            >
                              <div
                                style={{ fontWeight: 600, marginBottom: "6px" }}
                              >
                                {vital.time}
                              </div>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: "6px",
                                }}
                              >
                                <div>🌡️ T: {vital.temperature}°C</div>
                                <div>❤️ HR: {vital.heartRate} bpm</div>
                                <div>💨 BP: {vital.bloodPressure}</div>
                                <div>🫁 RR: {vital.respiratoryRate}/min</div>
                                <div>O₂: {vital.oxygenSaturation}%</div>
                              </div>
                            </div>
                          ))}
                        <Button
                          type="dashed"
                          block
                          size="small"
                          onClick={() => showVitalInput(patient)}
                        >
                          Nhập Sinh Hiệu Mới
                        </Button>
                        <Divider style={{ margin: "12px 0" }} />
                      </div>
                    ))}
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="Ghi Chú Điều Dưỡng" size="large">
                    {patientsList.map((patient) => (
                      <div key={patient.id} style={{ marginBottom: "16px" }}>
                        <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                          {patient.name}
                        </div>
                        {nursingNotes[patient.id]?.map((note, i) => (
                          <div
                            key={i}
                            style={{
                              padding: "12px",
                              background:
                                note.category === "assessment"
                                  ? "#e6f7ff"
                                  : "#f6ffed",
                              marginBottom: "8px",
                              borderRadius: "6px",
                              borderLeft: `3px solid ${
                                note.category === "assessment"
                                  ? "#1890ff"
                                  : "#52c41a"
                              }`,
                              fontSize: "12px",
                            }}
                          >
                            <div
                              style={{ fontWeight: 600, marginBottom: "4px" }}
                            >
                              {note.time} • {note.nurse}
                            </div>
                            <div>{note.note}</div>
                          </div>
                        ))}
                        <Button type="dashed" block size="small">
                          Thêm Ghi Chú
                        </Button>
                        <Divider style={{ margin: "12px 0" }} />
                      </div>
                    ))}
                  </Card>
                </Col>
              </Row>
            )}
          </Spin>
        </Content>
      </Layout>

      {/* MEDICAL RECORD DRAWER */}
      <Drawer
        title={`Hồ Sơ Bệnh Án - ${selectedPatient?.name}`}
        placement="right"
        onClose={() => setRecordDrawerVisible(false)}
        open={recordDrawerVisible}
        width={500}
        bodyStyle={{ padding: "24px" }}
      >
        {selectedPatient && medicalRecords[selectedPatient.id] && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                Thông Tin Bản Thân
              </div>
              <div style={{ display: "grid", gap: "6px", fontSize: "14px" }}>
                <div>
                  <span style={{ color: "#999" }}>Nhóm máu:</span>{" "}
                  {medicalRecords[selectedPatient.id].bloodType}
                </div>
                <div>
                  <span style={{ color: "#999" }}>Tuổi:</span>{" "}
                  {selectedPatient.age}
                </div>
                <div>
                  <span style={{ color: "#999" }}>Phòng:</span>{" "}
                  {selectedPatient.room}
                </div>
              </div>
            </div>

            <Divider />

            <div>
              <div style={{ fontWeight: 600, marginBottom: "8px" }}>Dị Ứng</div>
              <div>
                {medicalRecords[selectedPatient.id].allergies.length > 0 ? (
                  medicalRecords[selectedPatient.id].allergies.map(
                    (allergen, i) => (
                      <Tag key={i} color="red">
                        {allergen}
                      </Tag>
                    )
                  )
                ) : (
                  <span style={{ color: "#999" }}>Không có dị ứng</span>
                )}
              </div>
            </div>

            <Divider />

            <div>
              <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                Bệnh Lý Mãn Tính
              </div>
              {medicalRecords[selectedPatient.id].chronicConditions.map(
                (cond, i) => (
                  <Tag key={i} color="blue">
                    {cond}
                  </Tag>
                )
              )}
            </div>

            <Divider />

            <div>
              <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                Thuốc Hiện Dùng
              </div>
              {medicalRecords[selectedPatient.id].currentMedications.map(
                (med, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px",
                      background: "#f5f5f5",
                      marginBottom: "6px",
                      borderRadius: "4px",
                      fontSize: "13px",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{med.name}</div>
                    <div style={{ color: "#666", fontSize: "12px" }}>
                      {med.dosage} • {med.frequency}
                    </div>
                  </div>
                )
              )}
            </div>

            <Divider />

            <div>
              <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                Chẩn Đoán & Điều Trị
              </div>
              <div
                style={{
                  fontSize: "13px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div>
                  <span style={{ color: "#999" }}>Bác sĩ:</span>{" "}
                  {medicalRecords[selectedPatient.id].doctor}
                </div>
                <div>
                  <span style={{ color: "#999" }}>Chẩn đoán:</span>{" "}
                  {medicalRecords[selectedPatient.id].diagnosis}
                </div>
                <div>
                  <span style={{ color: "#999" }}>Điều trị:</span>{" "}
                  {medicalRecords[selectedPatient.id].treatment}
                </div>
                <div>
                  <span style={{ color: "#999" }}>Ghi chú:</span>{" "}
                  {medicalRecords[selectedPatient.id].notes}
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* VITAL SIGNS INPUT MODAL */}
      <Modal
        title={`Nhập Sinh Hiệu - ${selectedPatient?.name}`}
        open={vitalDrawerVisible}
        onCancel={() => setVitalDrawerVisible(false)}
        onOk={() => vitalForm.submit()}
        width={500}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={vitalForm} layout="vertical" onFinish={handleAddVitalSigns}>
          <Form.Item
            label="Nhiệt Độ (°C)"
            name="temperature"
            rules={[{ required: true }]}
          >
            <InputNumber min={35} max={43} step={0.1} placeholder="36.5" />
          </Form.Item>

          <Form.Item
            label="Huyết Áp (mmHg)"
            name="bloodPressure"
            rules={[{ required: true }]}
            tooltip="Ví dụ: 120/80"
          >
            <Input placeholder="120/80" />
          </Form.Item>

          <Form.Item
            label="Nhịp Tim (bpm)"
            name="heartRate"
            rules={[{ required: true }]}
          >
            <InputNumber min={30} max={200} placeholder="72" />
          </Form.Item>

          <Form.Item
            label="Tần Số Hô Hấp (/min)"
            name="respiratoryRate"
            rules={[{ required: true }]}
          >
            <InputNumber min={5} max={50} placeholder="16" />
          </Form.Item>

          <Form.Item
            label="SpO₂ (%)"
            name="oxygenSaturation"
            rules={[{ required: true }]}
          >
            <InputNumber min={50} max={100} placeholder="98" />
          </Form.Item>

          <Form.Item label="Ghi Chú" name="note">
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú tình trạng bệnh nhân"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default NurseDashboard;
