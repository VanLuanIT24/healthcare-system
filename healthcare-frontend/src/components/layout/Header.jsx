// src/components/layout/Header.jsx
import Logo from '@/components/common/Logo';
import { useAuth } from '@/contexts/AuthContext';
import {
  BellOutlined,
  CalendarOutlined,
  DashboardOutlined,
  DownOutlined,
  HeartOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  AutoComplete,
  Avatar,
  Badge,
  Button,
  Drawer,
  Input,
  Layout,
  Menu,
  Space,
  Tooltip
} from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navItems = [
    { key: '/', label: 'Trang Chủ' },
    { key: '/services', label: 'Dịch Vụ' },
    { key: '/doctors', label: 'Bác Sĩ' },
    { key: '/booking', label: 'Đặt Lịch' },
    { key: '/news', label: 'Tin Tức' },
    { key: '/faq', label: 'FAQ' },
    { key: '/about', label: 'Về Chúng Tôi' },
  ];

  const getDashboardLink = () => {
    if (!user?.role) return '/';
    switch (user.role) {
      case 'SUPER_ADMIN':
      case 'SYSTEM_ADMIN':
      case 'HOSPITAL_ADMIN':
        return '/admin/dashboard';
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'NURSE':
      case 'PHARMACIST':
      case 'LAB_TECHNICIAN':
        return '/staff/dashboard';
      case 'PATIENT':
        return '/patient/dashboard';
      default:
        return '/';
    }
  };

  const getProfileLink = () => {
    if (!user?.role) return '/';
    switch (user.role) {
      case 'DOCTOR':
        return '/doctor/profile';
      case 'PATIENT':
        return '/patient/profile';
      default:
        return '/profile'; // General profile or redirect
    }
  };

  const userMenuItems = [
    {
      key: 'dashboard',
      label: 'Bảng Điều Khiển',
      icon: <DashboardOutlined />,
      onClick: () => navigate(getDashboardLink()),
    },
    {
      key: 'profile',
      label: 'Hồ Sơ Cá Nhân',
      icon: <UserOutlined />,
      onClick: () => navigate(getProfileLink()),
    },
    // Patient specific items
    ...(user?.role === 'PATIENT' ? [
      {
        key: 'appointments',
        label: 'Lịch Hẹn',
        icon: <CalendarOutlined />,
        onClick: () => navigate('/patient/appointments'),
      },
      {
        key: 'messages',
        label: 'Tin Nhắn',
        icon: <MessageOutlined />,
        onClick: () => navigate('/patient/messages'),
      },
      {
        key: 'favorites',
        label: 'Yêu Thích',
        icon: <HeartOutlined />,
        onClick: () => navigate('/patient/favorites'),
      },
    ] : []),
    { type: 'divider' },
    {
      key: 'settings',
      label: 'Cài Đặt',
      icon: <SettingOutlined />,
      onClick: () => navigate(user?.role === 'DOCTOR' ? '/doctor/settings' : '/patient/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Đăng Xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => navigate('/logout'),
    },
  ];

  return (
    <>
      <AntHeader
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-xl'
          : 'bg-white shadow-sm'
          }`}
        style={{
          height: '72px',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {/* Logo and Navigation Group */}
        <div className="flex items-center gap-8">
          <Logo size="medium" showText={true} className="no-underline" />

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.key;
              return (
                <motion.button
                  key={item.key}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.key)}
                  className={`px-3.5 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${isActive
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search Bar - Hidden on smaller screens */}
          <motion.div
            animate={{ width: searchFocused ? '260px' : '180px' }}
            className="hidden lg:block"
          >
            <AutoComplete
              className="w-full"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onSearch={(value) => {
                if (value.trim()) navigate(`/search?q=${encodeURIComponent(value)}`);
              }}
            >
              <Input
                placeholder="Tìm kiếm..."
                size="middle"
                className="rounded-full"
                prefix={<SearchOutlined className="text-gray-400 text-xs" />}
                allowClear
              />
            </AutoComplete>
          </motion.div>

          {/* Book Appointment Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="primary"
              className="flex items-center gap-2 rounded-full font-semibold shadow-md hover:shadow-lg px-7 h-11"
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
              }}
              onClick={() => navigate('/booking')}
            >
              <CalendarOutlined className="text-base" />
              <span className="hidden sm:inline text-sm">Đặt Lịch</span>
            </Button>
          </motion.div>

          {/* Notification */}
          {isAuthenticated && (
            <Tooltip title="Thông báo">
              <Badge
                count={5}
                size="small"
                className="cursor-pointer"
                onClick={() => navigate('/patient/notifications')}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100"
                >
                  <BellOutlined className="text-blue-600" />
                </motion.div>
              </Badge>
            </Tooltip>
          )}

          {/* User Menu */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <Button 
                type="text"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-0 hover:bg-blue-50 transition-all"
                style={{ height: 'auto' }}
              >
                <Avatar
                  src={user?.avatar}
                  icon={!user?.avatar && <UserOutlined />}
                  size={40}
                  className="border-2 border-blue-100 shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #1890ff, #52c41a)',
                  }}
                />
                <div className="hidden lg:block text-left">
                  <div className="font-semibold text-gray-800 text-sm">
                    {user?.fullName?.split(' ')[0] || 'Người dùng'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Tài khoản
                  </div>
                </div>
              </Button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1 animate-in fade-in slide-in-from-top-1">
                  <button
                    onClick={() => { navigate(getDashboardLink()); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm"
                  >
                    <DashboardOutlined className="text-base" />
                    <span>Bảng Điều Khiển</span>
                  </button>
                  <button
                    onClick={() => { navigate(getProfileLink()); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm"
                  >
                    <UserOutlined className="text-base" />
                    <span>Hồ Sơ Cá Nhân</span>
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => { navigate('/logout'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors text-sm"
                  >
                    <LogoutOutlined className="text-base" />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Space size={2}>
              <Button
                type="default"
                className="rounded-full border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 font-semibold"
                style={{ height: '44px', display: 'flex', alignItems: 'center' }}
                onClick={() => navigate('/login')}
              >
                Đăng Nhập
              </Button>
              <Button
                type="primary"
                className="rounded-full font-semibold"
                style={{
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  border: 'none',
                }}
                onClick={() => navigate('/register')}
              >
                Đăng Ký
              </Button>
            </Space>
          )}

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(true)}
            className="xl:hidden w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <MenuOutlined className="text-gray-700 text-lg" />
          </motion.button>
        </div>
      </AntHeader>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={<Logo />}
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={320}
        styles={{
          body: { padding: '24px' }
        }}
      >
        <div className="space-y-6">
          {/* Mobile Search */}
          <Input
            placeholder="Tìm kiếm..."
            size="large"
            className="rounded-lg"
            prefix={<SearchOutlined />}
            onPressEnter={(e) => {
              if (e.target.value.trim()) {
                navigate(`/search?q=${encodeURIComponent(e.target.value)}`);
                setMobileMenuOpen(false);
              }
            }}
          />

          {/* Mobile Navigation */}
          <div className="space-y-1">
            {navItems.map((item) => (
              <motion.button
                key={item.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigate(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all ${location.pathname === item.key
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
                  }`}
              >
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* User Section */}
          {isAuthenticated ? (
            <div className="border-t pt-6">
              <div className="flex items-center gap-3 mb-6 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <Avatar
                  src={user?.avatar}
                  size={40}
                  className="border-2 border-white flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-semibold text-gray-800 text-sm truncate">{user?.fullName}</div>
                  <div className="text-xs text-gray-600 truncate">{user?.email}</div>
                </div>
              </div>

              <Button
                block
                type="primary"
                size="large"
                className="rounded-lg mb-3"
                onClick={() => { navigate('/booking'); setMobileMenuOpen(false); }}
              >
                <CalendarOutlined /> Đặt Lịch Ngay
              </Button>

              <Button
                block
                danger
                size="large"
                className="rounded-lg"
                onClick={() => { navigate('/logout'); setMobileMenuOpen(false); }}
              >
                <LogoutOutlined /> Đăng Xuất
              </Button>
            </div>
          ) : (
            <div className="border-t pt-6 space-y-3">
              <Button
                block
                type="primary"
                size="large"
                className="rounded-lg h-12"
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
              >
                Đăng Nhập
              </Button>
              <Button
                block
                size="large"
                className="rounded-lg h-12 border-blue-300 text-blue-600"
                onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
              >
                Đăng Ký
              </Button>
            </div>
          )}
        </div>
      </Drawer>

      {/* Spacer */}
      <div style={{ height: '72px' }} />
    </>
  );
};

export default Header;