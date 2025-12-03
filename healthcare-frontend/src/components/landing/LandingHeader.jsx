import {
    CalendarOutlined,
    DownOutlined,
    HeartFilled,
    HomeOutlined,
    LockOutlined,
    LogoutOutlined,
    SettingOutlined,
    UserOutlined
} from "@ant-design/icons";
import { Avatar, Badge, Button, Dropdown, Layout, Menu, Space } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Header } = Layout;

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LandingHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profilePicture, setProfilePicture] = useState(null);
  const [activeSessions, setActiveSessions] = useState(0);

  // Fetch user profile picture and sessions
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      // Fetch profile
      const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (profileResponse.data.success) {
        setProfilePicture(profileResponse.data.data.profilePicture);
      }

      // Fetch sessions count
      const sessionsResponse = await axios.get(`${API_BASE_URL}/auth/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (sessionsResponse.data.success) {
        // Response structure: data.data.sessions (array)
        const sessions = sessionsResponse.data.data?.sessions || [];
        setActiveSessions(sessions.length);
      }
    } catch (error) {
      console.error("Error fetching user data in header:", error);
      // Không hiển thị lỗi cho user, chỉ log để debug
    }
  };

  // Navigation menu items
  const navMenuItems = [
    {
      key: "home",
      label: (
        <span onClick={() => navigate("/")}>
          <HomeOutlined /> Trang chủ
        </span>
      )
    },
    {
      key: "about",
      label: (
        <span>
          Giới thiệu <DownOutlined />
        </span>
      ),
      children: [
        {
          key: "about-us",
          label: "Về chúng tôi",
          onClick: () => navigate("/about")
        },
        {
          key: "doctors",
          label: "Đội ngũ bác sĩ",
          onClick: () => navigate("/doctors")
        }
      ]
    },
    {
      key: "services",
      label: (
        <span>
          Dịch vụ <DownOutlined />
        </span>
      ),
      children: [
        {
          key: "services-all",
          label: "Tất cả dịch vụ",
          onClick: () => navigate("/services")
        },
        {
          key: "consultation",
          label: "Tư vấn trực tuyến",
          onClick: () => navigate("/consultation")
        }
      ]
    },
    {
      key: "news",
      label: <span onClick={() => navigate("/news")}>Tin tức</span>
    },
    {
      key: "contact",
      label: <span onClick={() => navigate("/contact")}>Liên hệ</span>
    }
  ];

  // User menu items
  const userMenuItems = [
    {
      key: "account",
      icon: <UserOutlined />,
      label: (
        <Space>
          Quản lý tài khoản
          {activeSessions > 1 && (
            <Badge count={activeSessions} style={{ backgroundColor: '#52c41a' }} />
          )}
        </Space>
      ),
      onClick: () => navigate("/account")
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ bệnh nhân",
      onClick: () => navigate("/patient/profile")
    },
    {
      key: "appointments",
      icon: <CalendarOutlined />,
      label: "Lịch hẹn khám",
      onClick: () => navigate("/patient/appointments")
    },
    {
      key: "security",
      icon: <LockOutlined />,
      label: "Bảo mật",
      onClick: () => navigate("/account?tab=security")
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/account?tab=settings")
    },
    {
      type: "divider"
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: logout
    }
  ];

  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        padding: "0 50px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1890ff",
            cursor: "pointer"
          }}
          onClick={() => navigate("/")}
        >
          <HeartFilled /> MediCare
        </div>
      </div>

      <Menu
        mode="horizontal"
        items={navMenuItems}
        style={{
          flex: 1,
          minWidth: 0,
          border: "none",
          justifyContent: "center"
        }}
      />

      <Space size="large">
        {user ? (
          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
            <Space style={{ cursor: "pointer" }}>
              <Badge count={activeSessions > 1 ? activeSessions : 0} offset={[-5, 5]}>
                <Avatar 
                  icon={<UserOutlined />} 
                  src={profilePicture || user.avatar}
                  style={{ backgroundColor: profilePicture ? 'transparent' : '#1890ff' }}
                />
              </Badge>
              <span style={{ fontWeight: 500 }}>
                {user.personalInfo?.firstName 
                  ? `${user.personalInfo.firstName} ${user.personalInfo.lastName || ''}`
                  : user.fullName || user.email}
              </span>
              <DownOutlined />
            </Space>
          </Dropdown>
        ) : (
          <>
            <Button type="link" onClick={() => navigate("/login")}>
              Đăng nhập
            </Button>
            <Button type="primary" onClick={() => navigate("/register")}>
              Đăng ký
            </Button>
          </>
        )}
      </Space>
    </Header>
  );
};

export default LandingHeader;
