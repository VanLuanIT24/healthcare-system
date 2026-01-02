// src/components/layout/admin/AdminLayout.jsx
import { useAuth } from '@/contexts/AuthContext';
import {
  BellOutlined,
  CalendarOutlined,
  DashboardOutlined,
  DownOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Breadcrumb, Button, Dropdown, Layout, Menu } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      type: 'divider',
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: 'Quản lý người dùng',
      children: [
        {
          key: '/admin/users/list',
          label: 'Danh sách người dùng',
        },
        {
          key: '/admin/users/deleted',
          label: 'Người dùng đã xóa',
        },
        {
          key: '/admin/users/stats',
          label: 'Thống kê',
        },
      ],
    },
    {
      key: 'admin-doctors',
      icon: <UserOutlined />,
      label: 'Quản lý bác sĩ',
      children: [
        {
          key: '/admin/doctors',
          label: 'Danh sách bác sĩ',
        },
        {
          key: '/admin/doctors/work-schedule',
          label: 'Đăng ký lịch làm việc',
        },
        {
          key: '/admin/doctors/schedule',
          label: 'Xem lịch hẹn',
        },
        {
          key: '/admin/doctors/stats',
          label: 'Thống kê',
        },
      ],
    },
    {
      key: '/admin/departments',
      icon: <TeamOutlined />,
      label: 'Quản lý khoa/bộ phận',
    },
    {
      key: '/admin/beds',
      icon: <HomeOutlined />,
      label: 'Quản lý giường bệnh',
    },
    {
      key: '/admin/medications',
      icon: <FileTextOutlined />,
      label: 'Quản lý dược phẩm',
    },
    {
      key: '/admin/laboratory',
      icon: <FileTextOutlined />,
      label: 'Quản lý xét nghiệm',
    },
    {
      key: '/admin/billings',
      icon: <FileTextOutlined />,
      label: 'Quản lý hóa đơn',
    },
    {
      key: '/admin/appointments',
      icon: <CalendarOutlined />,
      label: 'Quản lý lịch khám',
    },
    {
      key: '/admin/consultations',
      icon: <MedicineBoxOutlined />,
      label: 'Hỗ trợ tư vấn KH',
    },
    {
      key: '/admin/reports',
      icon: <FileTextOutlined />,
      label: 'Báo cáo',
    },
    {
      type: 'divider',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt hệ thống',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
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

  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const breadcrumbItems = [
      {
        title: <Link to="/admin/dashboard"><HomeOutlined /> Admin</Link>,
      },
    ];

    const nameMap = {
      'admin': 'Admin',
      'dashboard': 'Dashboard',
      'users': 'Người dùng',
      'doctors': 'Bác sĩ',
      'appointments': 'Lịch khám',
      'consultations': 'Hỗ trợ tư vấn',
      'reports': 'Báo cáo',
      'settings': 'Cài đặt',
      'list': 'Danh sách',
      'deleted': 'Đã xóa',
      'stats': 'Thống kê',
      'schedule': 'Lịch hẹn',
      'work-schedule': 'Lịch làm việc'
    };

    pathSnippets.forEach((snippet) => {
      breadcrumbItems.push({
        title: nameMap[snippet] || snippet,
      });
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
          background: 'linear-gradient(180deg, #0f1419 0%, #1f2937 100%)',
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
          onClick={() => navigate('/admin/dashboard')}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            {!collapsed && (
              <span className="text-white font-semibold text-lg">Admin</span>
            )}
          </div>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <Avatar
                size={40}
                src={user?.avatar}
                icon={<UserOutlined />}
                className="bg-red-500"
              />
              <div className="overflow-hidden">
                <div className="text-white font-medium truncate text-sm">
                  {user?.personalInfo?.firstName} {user?.personalInfo?.lastName}
                </div>
                <div className="text-gray-400 text-xs truncate">
                  {user?.role}
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
            if (key === 'logout') {
              logout();
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
      </Sider>

      {/* Main Layout */}
      <Layout style={{
        marginLeft: collapsed ? 80 : 260,
        transition: 'margin-left 0.2s',
        overflow: 'visible'
      }}>
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
              style={{ fontSize: '16px' }}
            />
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>

          <div className="flex items-center gap-4">
            <Badge count={5} color="#f5222d">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ fontSize: '16px' }}
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
                  className="bg-red-500"
                />
                <span className="hidden md:inline text-gray-700 font-medium text-sm">
                  {user?.fullName || `${user?.personalInfo?.firstName} ${user?.personalInfo?.lastName}`}
                </span>
              </Button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1 animate-in fade-in slide-in-from-top-1">
                  <button
                    onClick={() => { navigate('/admin/profile'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm"
                  >
                    <UserOutlined className="text-base" />
                    <span>Hồ Sơ Cá Nhân</span>
                  </button>
                  <button
                    onClick={() => { navigate('/admin/settings'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm"
                  >
                    <SettingOutlined className="text-base" />
                    <span>Cài Đặt</span>
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => { navigate('/'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm"
                  >
                    <HomeOutlined className="text-base" />
                    <span>Về Trang Chủ</span>
                  </button>
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
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
            margin: '24px 16px',
            padding: '24px',
            background: '#f5f7fa',
            minHeight: 'calc(100vh - 88px)',
            borderRadius: '8px',
            overflow: 'visible'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
