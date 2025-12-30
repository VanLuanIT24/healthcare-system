// src/components/layout/doctor/DoctorLayout.jsx - Layout cho bác sĩ
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import {
  BellOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  FileTextOutlined,
  HeartOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Breadcrumb, Button, Dropdown, Layout, Menu } from 'antd';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const DoctorLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
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
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <Button type="text" style={{ padding: 0 }}>
                <Avatar
                  size="large"
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                />
              </Button>
            </Dropdown>
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
