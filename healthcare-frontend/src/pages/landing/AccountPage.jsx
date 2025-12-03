import {
    BellOutlined,
    CalendarOutlined,
    CameraOutlined,
    CheckCircleOutlined,
    CloseOutlined,
    DesktopOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    GlobalOutlined,
    HomeOutlined,
    LockOutlined,
    LogoutOutlined,
    MailOutlined,
    ManOutlined,
    MobileOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    SaveOutlined,
    TabletOutlined,
    UserOutlined,
    WomanOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Divider,
    Form,
    Input,
    Layout,
    message,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Switch,
    Table,
    Tabs,
    Tag,
    Typography,
    Upload,
} from "antd";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingFooter from "../../components/landing/LandingFooter";
import LandingHeader from "../../components/landing/LandingHeader";
import { useAuth } from "../../contexts/AuthContext";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Check URL params for tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["profile", "security", "settings", "sessions"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Fetch user profile
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserSessions();
    }
  }, [user]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  // Fetch user profile from API
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching profile...", {
        url: `${API_BASE_URL}/users/profile`,
        token: localStorage.getItem("accessToken")?.substring(0, 20) + "...",
        user: user
      });
      
      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: getAuthHeaders(),
      });

      console.log("✅ Profile response:", response.data);

      if (response.data.success) {
        const profile = response.data.data;
        setProfileData(profile);

        // Fill form with profile data
        profileForm.setFieldsValue({
          email: profile.email,
          firstName: profile.personalInfo?.firstName,
          lastName: profile.personalInfo?.lastName,
          phone: profile.personalInfo?.phone,
          dateOfBirth: profile.personalInfo?.dateOfBirth
            ? moment(profile.personalInfo.dateOfBirth)
            : null,
          gender: profile.personalInfo?.gender,
          street: profile.personalInfo?.address?.street,
          city: profile.personalInfo?.address?.city,
          state: profile.personalInfo?.address?.state,
          zipCode: profile.personalInfo?.address?.zipCode,
          country: profile.personalInfo?.address?.country || "Vietnam",
          emergencyName: profile.personalInfo?.emergencyContact?.name,
          emergencyRelationship: profile.personalInfo?.emergencyContact?.relationship,
          emergencyPhone: profile.personalInfo?.emergencyContact?.phone,
          emailNotifications: profile.settings?.notifications?.email ?? true,
          smsNotifications: profile.settings?.notifications?.sms ?? false,
          pushNotifications: profile.settings?.notifications?.push ?? true,
          language: profile.settings?.language || "vi",
          theme: profile.settings?.theme || "light",
          timezone: profile.settings?.timezone || "Asia/Ho_Chi_Minh",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching profile:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      message.error(
        error.response?.data?.error || 
        error.response?.data?.message ||
        "Không thể tải thông tin tài khoản"
      );
      
      // If 401, redirect to login
      if (error.response?.status === 401) {
        message.warning("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch user sessions
  const fetchUserSessions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/sessions`, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setSessions(response.data.data.sessions || []);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  // Update profile
  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);

      const updateData = {
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.toISOString()
            : null,
          gender: values.gender,
          address: {
            street: values.street,
            city: values.city,
            state: values.state,
            zipCode: values.zipCode,
            country: values.country,
          },
          emergencyContact: {
            name: values.emergencyName,
            relationship: values.emergencyRelationship,
            phone: values.emergencyPhone,
          },
        },
        settings: {
          notifications: {
            email: values.emailNotifications,
            sms: values.smsNotifications,
            push: values.pushNotifications,
          },
          language: values.language,
          theme: values.theme,
          timezone: values.timezone,
        },
      };

      const response = await axios.put(
        `${API_BASE_URL}/users/profile`,
        updateData,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        message.success("Cập nhật thông tin thành công!");
        setEditing(false);
        fetchUserProfile();
        if (updateUser) {
          updateUser(response.data.data);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error(
        error.response?.data?.message || "Không thể cập nhật thông tin"
      );
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (values) => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/auth/change-password`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        message.success("Đổi mật khẩu thành công!");
        passwordForm.resetFields();
      }
    } catch (error) {
      console.error("Error changing password:", error);
      message.error(
        error.response?.data?.message || "Không thể đổi mật khẩu"
      );
    } finally {
      setLoading(false);
    }
  };

  // Upload profile picture
  const handleUploadAvatar = async (info) => {
    if (info.file.status === "uploading") {
      setUploadLoading(true);
      return;
    }

    if (info.file.status === "done") {
      try {
        const formData = new FormData();
        formData.append("profilePicture", info.file.originFileObj);

        const response = await axios.post(
          `${API_BASE_URL}/users/profile/picture`,
          formData,
          {
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          message.success("Cập nhật ảnh đại diện thành công!");
          fetchUserProfile();
        }
      } catch (error) {
        console.error("Error uploading avatar:", error);
        message.error("Không thể tải lên ảnh đại diện");
      } finally {
        setUploadLoading(false);
      }
    }
  };

  // Revoke session
  const handleRevokeSession = async (sessionId) => {
    Modal.confirm({
      title: "Xác nhận đăng xuất",
      content: "Bạn có chắc chắn muốn đăng xuất khỏi thiết bị này?",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/sessions/revoke`,
            { sessionId },
            { headers: getAuthHeaders() }
          );

          if (response.data.success) {
            message.success("Đăng xuất thiết bị thành công!");
            fetchUserSessions();
          }
        } catch (error) {
          console.error("Error revoking session:", error);
          message.error("Không thể đăng xuất thiết bị");
        }
      },
    });
  };

  // Logout all sessions
  const handleLogoutAll = () => {
    Modal.confirm({
      title: "Đăng xuất tất cả thiết bị",
      content:
        "Bạn có chắc chắn muốn đăng xuất khỏi tất cả thiết bị? Bạn sẽ cần đăng nhập lại.",
      okText: "Đăng xuất tất cả",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/sessions/logout-all`,
            {},
            { headers: getAuthHeaders() }
          );

          if (response.data.success) {
            message.success("Đã đăng xuất khỏi tất cả thiết bị!");
            logout();
            navigate("/login");
          }
        } catch (error) {
          console.error("Error logging out all:", error);
          message.error("Không thể đăng xuất");
        }
      },
    });
  };

  // Resend verification email
  const handleResendVerification = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/users/profile/resend-verification`,
        {},
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        message.success("Email xác thực đã được gửi!");
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      message.error("Không thể gửi email xác thực");
    } finally {
      setLoading(false);
    }
  };

  // Get device icon based on user agent
  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return <DesktopOutlined />;
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android")) return <MobileOutlined />;
    if (ua.includes("tablet") || ua.includes("ipad")) return <TabletOutlined />;
    return <DesktopOutlined />;
  };

  // Sessions table columns
  const sessionColumns = [
    {
      title: "Thiết bị",
      dataIndex: "userAgent",
      key: "device",
      render: (userAgent) => (
        <Space>
          {getDeviceIcon(userAgent)}
          <Text>{userAgent || "Unknown Device"}</Text>
        </Space>
      ),
    },
    {
      title: "Địa chỉ IP",
      dataIndex: "ipAddress",
      key: "ip",
      render: (ip) => <Tag color="blue">{ip || "N/A"}</Tag>,
    },
    {
      title: "Đăng nhập lúc",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Lần cuối hoạt động",
      dataIndex: "lastActivity",
      key: "lastActivity",
      render: (date) => moment(date).fromNow(),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "status",
      render: (isActive) =>
        isActive ? (
          <Badge status="success" text="Đang hoạt động" />
        ) : (
          <Badge status="default" text="Không hoạt động" />
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<LogoutOutlined />}
          onClick={() => handleRevokeSession(record._id)}
        >
          Đăng xuất
        </Button>
      ),
    },
  ];

  // Profile tab content
  const ProfileTab = () => (
    <Card>
      <Row gutter={24}>
        <Col xs={24} md={8} style={{ textAlign: "center" }}>
          <Upload
            name="avatar"
            showUploadList={false}
            customRequest={({ file, onSuccess }) => {
              setTimeout(() => {
                onSuccess("ok");
              }, 0);
            }}
            onChange={handleUploadAvatar}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith("image/");
              if (!isImage) {
                message.error("Chỉ cho phép tải lên file ảnh!");
              }
              const isLt2M = file.size / 1024 / 1024 < 2;
              if (!isLt2M) {
                message.error("Ảnh phải nhỏ hơn 2MB!");
              }
              return isImage && isLt2M;
            }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                src={profileData?.profilePictureUrl}
                style={{ cursor: "pointer" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  background: "#1890ff",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <CameraOutlined style={{ color: "white", fontSize: 16 }} />
              </div>
            </div>
          </Upload>

          <Title level={4} style={{ marginTop: 16 }}>
            {profileData?.personalInfo?.firstName}{" "}
            {profileData?.personalInfo?.lastName}
          </Title>
          <Tag color="blue">{profileData?.role}</Tag>

          <Divider />

          {!profileData?.isEmailVerified && (
            <Alert
              message="Email chưa xác thực"
              description={
                <Space direction="vertical" size="small">
                  <Text>Vui lòng xác thực email để sử dụng đầy đủ tính năng</Text>
                  <Button
                    type="link"
                    size="small"
                    onClick={handleResendVerification}
                    loading={loading}
                  >
                    Gửi lại email xác thực
                  </Button>
                </Space>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 16, textAlign: "left" }}
            />
          )}

          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Trạng thái">
              <Badge
                status={profileData?.status === "ACTIVE" ? "success" : "default"}
                text={profileData?.status || "N/A"}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tham gia">
              {profileData?.createdAt
                ? moment(profileData.createdAt).format("DD/MM/YYYY")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Đăng nhập lần cuối">
              {profileData?.lastLogin
                ? moment(profileData.lastLogin).fromNow()
                : "Chưa đăng nhập"}
            </Descriptions.Item>
          </Descriptions>
        </Col>

        <Col xs={24} md={16}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Title level={4}>Thông tin cá nhân</Title>
            {!editing ? (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditing(true)}
              >
                Chỉnh sửa
              </Button>
            ) : (
              <Space>
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setEditing(false);
                    profileForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => profileForm.submit()}
                  loading={loading}
                >
                  Lưu
                </Button>
              </Space>
            )}
          </div>

          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleUpdateProfile}
            disabled={!editing}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Họ"
                  name="lastName"
                  rules={[{ required: true, message: "Vui lòng nhập họ" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Nguyễn" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Tên"
                  name="firstName"
                  rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Văn A" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="email@example.com"
                disabled
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="0123456789"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Ngày sinh"
                  name="dateOfBirth"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày sinh"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Select placeholder="Chọn giới tính">
                <Option value="MALE">
                  <ManOutlined /> Nam
                </Option>
                <Option value="FEMALE">
                  <WomanOutlined /> Nữ
                </Option>
                <Option value="OTHER">Khác</Option>
              </Select>
            </Form.Item>

            <Divider orientation="left">Địa chỉ</Divider>

            <Form.Item label="Địa chỉ" name="street">
              <Input
                prefix={<HomeOutlined />}
                placeholder="Số nhà, tên đường"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Thành phố" name="city">
                  <Input placeholder="TP. Hồ Chí Minh" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Quận/Huyện" name="state">
                  <Input placeholder="Quận 1" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Mã bưu điện" name="zipCode">
                  <Input placeholder="700000" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Quốc gia" name="country">
                  <Input placeholder="Vietnam" />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Liên hệ khẩn cấp</Divider>

            <Form.Item label="Tên người liên hệ" name="emergencyName">
              <Input placeholder="Người thân" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Mối quan hệ" name="emergencyRelationship">
                  <Select placeholder="Chọn mối quan hệ">
                    <Option value="FATHER">Bố</Option>
                    <Option value="MOTHER">Mẹ</Option>
                    <Option value="SPOUSE">Vợ/Chồng</Option>
                    <Option value="SIBLING">Anh/Chị/Em</Option>
                    <Option value="CHILD">Con</Option>
                    <Option value="OTHER">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Số điện thoại" name="emergencyPhone">
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="0123456789"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Card>
  );

  // Security tab content
  const SecurityTab = () => (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Card title="Đổi mật khẩu">
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              label="Mật khẩu hiện tại"
              name="currentPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới"
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu mới"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
              >
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>

          <Alert
            message="Lưu ý bảo mật"
            description={
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>Mật khẩu phải có ít nhất 8 ký tự</li>
                <li>Nên sử dụng kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                <li>Không sử dụng mật khẩu đơn giản hoặc dễ đoán</li>
                <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </Card>
      </Col>

      <Col xs={24} md={12}>
        <Card title="Thông tin bảo mật">
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Text strong>Xác thực email</Text>
              <div style={{ marginTop: 8 }}>
                {profileData?.isEmailVerified ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    Đã xác thực
                  </Tag>
                ) : (
                  <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                    Chưa xác thực
                  </Tag>
                )}
              </div>
              {!profileData?.isEmailVerified && (
                <Button
                  type="link"
                  size="small"
                  onClick={handleResendVerification}
                  loading={loading}
                  style={{ paddingLeft: 0 }}
                >
                  Gửi lại email xác thực
                </Button>
              )}
            </div>

            <Divider />

            <div>
              <Text strong>Đăng nhập lần cuối</Text>
              <div style={{ marginTop: 8 }}>
                <Text>
                  {profileData?.lastLogin
                    ? moment(profileData.lastLogin).format(
                        "DD/MM/YYYY HH:mm:ss"
                      )
                    : "Chưa có thông tin"}
                </Text>
              </div>
            </div>

            <Divider />

            <div>
              <Text strong>Trạng thái tài khoản</Text>
              <div style={{ marginTop: 8 }}>
                <Badge
                  status={
                    profileData?.status === "ACTIVE" ? "success" : "default"
                  }
                  text={profileData?.status || "N/A"}
                />
              </div>
            </div>

            <Divider />

            <div>
              <Text strong>Đăng xuất tất cả thiết bị</Text>
              <div style={{ marginTop: 8 }}>
                <Button danger onClick={handleLogoutAll}>
                  Đăng xuất khỏi tất cả thiết bị
                </Button>
              </div>
              <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                Thao tác này sẽ đăng xuất khỏi tất cả các thiết bị và phiên đăng nhập
              </Text>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // Settings tab content
  const SettingsTab = () => (
    <Card title="Cài đặt">
      <Form
        form={profileForm}
        layout="vertical"
        onFinish={handleUpdateProfile}
      >
        <Title level={5}>Thông báo</Title>
        <Paragraph type="secondary">
          Chọn cách bạn muốn nhận thông báo từ hệ thống
        </Paragraph>

        <Form.Item
          name="emailNotifications"
          valuePropName="checked"
          style={{ marginBottom: 16 }}
        >
          <Space>
            <Switch defaultChecked />
            <div>
              <Text strong>Thông báo qua Email</Text>
              <br />
              <Text type="secondary">
                Nhận thông báo về lịch hẹn, kết quả xét nghiệm qua email
              </Text>
            </div>
          </Space>
        </Form.Item>

        <Form.Item
          name="smsNotifications"
          valuePropName="checked"
          style={{ marginBottom: 16 }}
        >
          <Space>
            <Switch />
            <div>
              <Text strong>Thông báo qua SMS</Text>
              <br />
              <Text type="secondary">
                Nhận tin nhắn nhắc nhở về lịch hẹn sắp tới
              </Text>
            </div>
          </Space>
        </Form.Item>

        <Form.Item
          name="pushNotifications"
          valuePropName="checked"
          style={{ marginBottom: 24 }}
        >
          <Space>
            <Switch defaultChecked />
            <div>
              <Text strong>Thông báo đẩy</Text>
              <br />
              <Text type="secondary">
                Nhận thông báo trực tiếp trên trình duyệt
              </Text>
            </div>
          </Space>
        </Form.Item>

        <Divider />

        <Title level={5}>Giao diện</Title>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Ngôn ngữ" name="language">
              <Select>
                <Option value="vi">
                  <GlobalOutlined /> Tiếng Việt
                </Option>
                <Option value="en">
                  <GlobalOutlined /> English
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Chủ đề" name="theme">
              <Select>
                <Option value="light">Sáng</Option>
                <Option value="dark">Tối</Option>
                <Option value="auto">Tự động</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Múi giờ" name="timezone">
          <Select>
            <Option value="Asia/Ho_Chi_Minh">
              <CalendarOutlined /> Asia/Ho_Chi_Minh (GMT+7)
            </Option>
            <Option value="Asia/Bangkok">
              <CalendarOutlined /> Asia/Bangkok (GMT+7)
            </Option>
            <Option value="Asia/Singapore">
              <CalendarOutlined /> Asia/Singapore (GMT+8)
            </Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu cài đặt
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  // Sessions tab content
  const SessionsTab = () => (
    <Card
      title="Phiên đăng nhập"
      extra={
        <Button danger onClick={handleLogoutAll}>
          Đăng xuất tất cả
        </Button>
      }
    >
      <Alert
        message="Quản lý các thiết bị đã đăng nhập"
        description="Bạn có thể xem và quản lý tất cả các thiết bị đang đăng nhập vào tài khoản của mình"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Table
        columns={sessionColumns}
        dataSource={sessions}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        loading={loading}
      />
    </Card>
  );

  // Tab items
  const tabItems = [
    {
      key: "profile",
      label: (
        <span>
          <UserOutlined /> Thông tin cá nhân
        </span>
      ),
      children: <ProfileTab />,
    },
    {
      key: "security",
      label: (
        <span>
          <SafetyCertificateOutlined /> Bảo mật
        </span>
      ),
      children: <SecurityTab />,
    },
    {
      key: "settings",
      label: (
        <span>
          <BellOutlined /> Cài đặt
        </span>
      ),
      children: <SettingsTab />,
    },
    {
      key: "sessions",
      label: (
        <span>
          <DesktopOutlined /> Phiên đăng nhập
        </span>
      ),
      children: <SessionsTab />,
    },
  ];

  // Redirect if not logged in
  if (!user) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <LandingHeader />
        <Content style={{ padding: "50px" }}>
          <Card style={{ textAlign: "center" }}>
            <Title level={3}>Vui lòng đăng nhập để xem trang này</Title>
            <Button type="primary" onClick={() => navigate("/login")}>
              Đăng nhập
            </Button>
          </Card>
        </Content>
        <LandingFooter />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <LandingHeader />

      <Content style={{ padding: "50px", background: "#f0f2f5" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Card
            style={{
              marginBottom: 24,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <Row align="middle" gutter={16}>
              <Col>
                <Avatar
                  size={64}
                  icon={<UserOutlined />}
                  src={profileData?.profilePictureUrl}
                />
              </Col>
              <Col flex="auto">
                <Title level={3} style={{ color: "white", margin: 0 }}>
                  Xin chào, {profileData?.personalInfo?.firstName}{" "}
                  {profileData?.personalInfo?.lastName}!
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                  Quản lý thông tin tài khoản và cài đặt của bạn
                </Text>
              </Col>
              <Col>
                <Space direction="vertical">
                  <Statistic
                    title={<span style={{ color: "white" }}>Tài khoản</span>}
                    value={profileData?.role || "N/A"}
                    valueStyle={{ color: "white" }}
                  />
                </Space>
              </Col>
            </Row>
          </Card>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />
        </div>
      </Content>

      <LandingFooter />
    </Layout>
  );
};

export default AccountPage;
