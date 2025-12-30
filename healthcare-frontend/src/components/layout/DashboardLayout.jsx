// src/components/layout/DashboardLayout.jsx
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import {
    BellOutlined,
    CalendarOutlined,
    DashboardOutlined,
    ExperimentOutlined,
    FileTextOutlined,
    HeartOutlined,
    HomeOutlined,
    LogoutOutlined,
    MedicineBoxOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MessageOutlined,
    SettingOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Breadcrumb, Button, Dropdown, Layout, Menu } from 'antd';
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Menu items cho Patient Portal
  const menuItems = [
    {
      key: '/patient/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: '/patient/appointments',
      icon: <CalendarOutlined />,
      label: 'Lịch hẹn',
    },
    {
      key: '/patient/medical-records',
      icon: <FileTextOutlined />,
      label: 'Hồ sơ bệnh án',
    },
    {
      key: '/patient/prescriptions',
      icon: <MedicineBoxOutlined />,
      label: 'Đơn thuốc',
    },
    {
      key: '/patient/lab-results',
      icon: <ExperimentOutlined />,
      label: 'Kết quả xét nghiệm',
    },
    {
      key: '/patient/messages',
      icon: <MessageOutlined />,
      label: 'Tin nhắn',
    },
    {
      key: '/patient/health-tracking',
      icon: <HeartOutlined />,
      label: 'Theo dõi sức khỏe',
    },
    {
      type: 'divider',
    },
    {
      key: 'dashboard-profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
    },
    {
      key: '/patient/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <UserOutlined />,
      onClick: () => navigate('/patient/profile'),
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
      onClick: () => navigate('/patient/settings'),
    },
    { type: 'divider' },
    {
      key: 'home',
      label: 'Về trang chủ',
      icon: <HomeOutlined />,
      onClick: () => navigate('/'),
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: logout,
    },
  ];

  // Generate breadcrumb items
  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const breadcrumbItems = [
      {
        title: <Link to="/patient/dashboard"><HomeOutlined /> Dashboard</Link>,
      },
    ];

    const nameMap = {
      'patient': 'Bệnh nhân',
      'dashboard': 'Tổng quan',
      'appointments': 'Lịch hẹn',
      'medical-records': 'Hồ sơ bệnh án',
      'prescriptions': 'Đơn thuốc',
      'lab-results': 'Kết quả XN',
      'messages': 'Tin nhắn',
      'health-tracking': 'Theo dõi SK',
      'profile': 'Hồ sơ',
      'settings': 'Cài đặt',
    };

    pathSnippets.forEach((snippet, index) => {
      if (snippet !== 'patient' && index > 0) {
        breadcrumbItems.push({
          title: nameMap[snippet] || snippet,
        });
      }
    });

    return breadcrumbItems;
  };

  return (
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        className="shadow-lg"
        style={{
          background: 'linear-gradient(180deg, #001529 0%, #003a70 100%)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div 
          className="h-16 flex items-center justify-center border-b border-gray-700 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            {!collapsed && (
              <span className="text-white font-semibold text-lg">HealthCare</span>
            )}
          </div>
        </div>

        {/* User Info - Collapsed View */}
        {!collapsed && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <Avatar 
                size={40} 
                src={user?.avatar} 
                icon={<UserOutlined />}
                className="bg-blue-500"
              />
              <div className="overflow-hidden">
                <div className="text-white font-medium truncate">
                  {user?.fullName || 'Bệnh nhân'}
                </div>
                <div className="text-gray-400 text-xs truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            if (key === 'dashboard-profile') {
              navigate('/patient/dashboard?tab=profile');
            } else {
              navigate(key);
            }
          }}
          style={{ 
            background: 'transparent',
            borderRight: 'none',
            marginTop: '8px',
          }}
        />

        {/* Book Appointment Button */}
        {!collapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <Button
              type="primary"
              block
              size="large"
              icon={<CalendarOutlined />}
              onClick={() => navigate('/booking')}
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                borderRadius: '8px',
              }}
            >
              Đặt lịch khám
            </Button>
          </div>
        )}
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header
          className="bg-white shadow-sm flex items-center justify-between px-6"
          style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 99,
            height: '64px',
            padding: '0 24px',
          }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg"
            />
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Badge count={unreadCount} size="small">
              <Button
                type="text"
                icon={<BellOutlined className="text-lg" />}
                onClick={() => navigate('/patient/notifications')}
              />
            </Badge>

            {/* User Dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                <Avatar 
                  src={user?.avatar} 
                  icon={<UserOutlined />}
                  className="bg-blue-500"
                />
                <span className="hidden md:inline text-gray-700 font-medium">
                  {user?.fullName}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content className="m-4 md:m-6">
          <div className="bg-white rounded-xl shadow-sm min-h-full p-4 md:p-6">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
