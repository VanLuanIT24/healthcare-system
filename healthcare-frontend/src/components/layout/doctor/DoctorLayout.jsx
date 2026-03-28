// src/components/layout/doctor/DoctorLayout.jsx - Layout cho bác sĩ
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import {
  BellOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  DownOutlined,
  FileTextOutlined,
  HeartOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  SettingOutlined,
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  FileProtectOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Breadcrumb, Button, Dropdown, Layout, Menu } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const DoctorLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Menu items cho Doctor Portal
  const menuItems = [
    {
      key: '/doctor/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: '/doctor/appointments',
      icon: <CalendarOutlined />,
      label: 'Lịch hẹn',
    },
    {
      key: '/doctor/schedule',
      icon: <ClockCircleOutlined />,
      label: 'Lịch làm việc',
    },
    {
      key: '/doctor/medical-records',
      icon: <FileTextOutlined />,
      label: 'Hồ sơ bệnh nhân',
    },
    {
      key: '/doctor/prescriptions',
      icon: <HeartOutlined />,
      label: 'Đơn thuốc',
    },
    {
      key: '/doctor/messages',
      icon: <MessageOutlined />,
      label: 'Tin nhắn',
    },
    {
      type: 'divider',
    },
    {
      key: '/doctor/consiliums',
      icon: <TeamOutlined />,
      label: 'Hội chẩn & Chuyển tuyến',
    },
    {
      key: '/doctor/certificates',
      icon: <FileProtectOutlined />,
      label: 'Biểu mẫu & Pháp lý',
    },
    {
      key: '/doctor/library',
      icon: <BookOutlined />,
      label: 'Thư viện Y khoa',
    },
    {
      type: 'divider',
    },
    {
      key: '/doctor/profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
    },
    {
      key: '/doctor/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <UserOutlined />,
      onClick: () => navigate('/doctor/profile'),
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
      onClick: () => navigate('/doctor/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  // Get current breadcrumb based on location
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [
      {
        title: <Link to="/doctor/dashboard">Bác sĩ</Link>,
      },
    ];

    const routeLabels = {
      dashboard: 'Tổng quan',
      appointments: 'Lịch hẹn',
      schedule: 'Lịch làm việc',
      'medical-records': 'Hồ sơ bệnh nhân',
      prescriptions: 'Đơn thuốc',
      messages: 'Tin nhắn',
      profile: 'Hồ sơ cá nhân',
      settings: 'Cài đặt',
    };

    if (segments.length > 1) {
      const label = routeLabels[segments[1]] || segments[1];
      breadcrumbs.push({
        title: label,
      });
    }

    return breadcrumbs;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        theme="dark"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'auto',
          background: '#001529',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
          <Link to="/doctor/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
            <h2 style={{ margin: 0, fontSize: collapsed ? '14px' : '18px' }}>
              {collapsed ? '👨‍⚕️' : 'HealthCare Doctor'}
            </h2>
          </Link>
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={(e) => {
            if (e.key.startsWith('/')) {
              navigate(e.key);
            }
          }}
        />
      </Sider>

      {/* Main Content */}
      <Layout style={{ marginLeft: collapsed ? 80 : 250 }}>
        {/* Header */}
        <Header
          style={{
            background: '#fff',
            padding: '0 20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px' }}
            />
            <Breadcrumb items={getBreadcrumbs()} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Notifications */}
            <Badge count={unreadCount} offset={[-5, 5]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: '18px' }} />}
                onClick={() => navigate('/doctor/messages')}
              />
            </Badge>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <Button
                type="text"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ padding: 0 }}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Avatar
                  size="large"
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                />
                <span className="hidden md:inline text-gray-700 font-medium text-sm">
                  {user?.fullName}
                </span>
              </Button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1 animate-in fade-in slide-in-from-top-1">
                  <button
                    onClick={() => { navigate('/doctor/profile'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm"
                  >
                    <UserOutlined className="text-base" />
                    <span>Hồ Sơ Cá Nhân</span>
                  </button>
                  <button
                    onClick={() => { navigate('/doctor/settings'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm"
                  >
                    <SettingOutlined className="text-base" />
                    <span>Cài Đặt</span>
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => { logout(); navigate('/login'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors text-sm"
                  >
                    <LogoutOutlined className="text-base" />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            padding: '24px',
            background: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DoctorLayout;
