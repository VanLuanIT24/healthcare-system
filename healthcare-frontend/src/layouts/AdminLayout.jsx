import {
    BellOutlined,
    CalendarOutlined,
    DashboardOutlined,
    DollarOutlined,
    ExperimentOutlined,
    FileTextOutlined,
    LogoutOutlined,
    MedicineBoxOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SafetyOutlined,
    SettingOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown, Layout, Menu, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserInfo(user);
  }, []);

  // Check user role and permissions
  const hasPermission = (requiredRoles) => {
    if (!userInfo?.role) return false;
    
    // Super admin has access to everything
    if (userInfo.role === 'SUPER_ADMIN') return true;
    
    return requiredRoles.includes(userInfo.role);
  };

  // Menu items based on role
  const getMenuItems = () => {
    const items = [];

    // Dashboard - All admin roles
    if (hasPermission(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD', 'RECEPTIONIST', 'BILLING_STAFF'])) {
      items.push({
        key: '/admin/dashboard',
        icon: <DashboardOutlined />,
        label: 'Tổng quan'
      });
    }

    // Staff Management - Admin roles only
    if (hasPermission(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD'])) {
      items.push({
        key: '/admin/staff',
        icon: <TeamOutlined />,
        label: 'Quản lý nhân viên',
        children: [
          {
            key: '/admin/staff/list',
            label: 'Danh sách nhân viên'
          },
          {
            key: '/admin/staff/create',
            label: 'Thêm nhân viên'
          }
        ]
      });
    }

    // Patient Management - Most roles
    if (hasPermission(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD', 'RECEPTIONIST', 'DOCTOR', 'NURSE'])) {
      items.push({
        key: '/admin/patients',
        icon: <UserOutlined />,
        label: 'Quản lý bệnh nhân',
        children: [
          {
            key: '/admin/patients/list',
            label: 'Danh sách bệnh nhân'
          },
          {
            key: '/admin/patients/create',
            label: 'Đăng ký bệnh nhân'
          }
        ]
      });
    }

    // Appointments - Clinical and admin roles
    if (hasPermission(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD', 'RECEPTIONIST', 'DOCTOR'])) {
      items.push({
        key: '/admin/appointments',
        icon: <CalendarOutlined />,
        label: 'Quản lý lịch hẹn',
        children: [
          {
            key: '/admin/appointments/list',
            label: 'Danh sách lịch hẹn'
          },
          {
            key: '/admin/appointments/create',
            label: 'Tạo lịch hẹn'
          },
          {
            key: '/admin/schedules',
            label: 'Lịch làm việc'
          }
        ]
      });
    }

    // Billing - Billing staff and admin
    if (hasPermission(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'BILLING_STAFF'])) {
      items.push({
        key: '/admin/billing',
        icon: <DollarOutlined />,
        label: 'Quản lý thanh toán',
        children: [
          {
            key: '/admin/billing/list',
            label: 'Danh sách hóa đơn'
          },
          {
            key: '/admin/billing/create',
            label: 'Tạo hóa đơn'
          }
        ]
      });
    }

    // Pharmacy - Pharmacists and admin
    if (hasPermission(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACIST'])) {
      items.push({
        key: '/admin/pharmacy',
        icon: <MedicineBoxOutlined />,
        label: 'Quản lý nhà thuốc',
        children: [
          {
            key: '/admin/pharmacy/dashboard',
            label: 'Kho thuốc'
          },
          {
            key: '/admin/pharmacy/prescriptions',
            label: 'Đơn thuốc chờ cấp'
          }
        ]
      });
    }

    // Laboratory - Lab technicians and admin
    if (hasPermission(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'LAB_TECHNICIAN'])) {
      items.push({
        key: '/admin/laboratory',
        icon: <ExperimentOutlined />,
        label: 'Quản lý xét nghiệm',
        children: [
          {
            key: '/admin/laboratory/dashboard',
            label: 'Danh sách xét nghiệm'
          }
        ]
      });
    }

    // Reports - Admin roles
    if (hasPermission(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD'])) {
      items.push({
        key: '/admin/reports',
        icon: <FileTextOutlined />,
        label: 'Báo cáo'
      });
    }

    // Settings - Admin only
    if (hasPermission(['SUPER_ADMIN', 'HOSPITAL_ADMIN'])) {
      items.push({
        key: '/admin/settings',
        icon: <SettingOutlined />,
        label: 'Cài đặt hệ thống'
      });
    }

    // Permissions - Super admin only
    if (hasPermission(['SUPER_ADMIN'])) {
      items.push({
        key: '/admin/permissions',
        icon: <SafetyOutlined />,
        label: 'Quản lý phân quyền'
      });
    }

    return items;
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/admin/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => navigate('/admin/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout
    }
  ];

  const getRoleName = (role) => {
    const roleNames = {
      SUPER_ADMIN: 'Quản trị viên cấp cao',
      HOSPITAL_ADMIN: 'Quản trị viên bệnh viện',
      DEPARTMENT_HEAD: 'Trưởng khoa',
      DOCTOR: 'Bác sĩ',
      NURSE: 'Điều dưỡng',
      PHARMACIST: 'Dược sĩ',
      LAB_TECHNICIAN: 'Kỹ thuật viên XN',
      RECEPTIONIST: 'Lễ tân',
      BILLING_STAFF: 'Nhân viên thu ngân'
    };
    return roleNames[role] || role;
  };

  // Get active menu key from current path
  const getSelectedKey = () => {
    const path = location.pathname;
    
    // Match exact paths first
    if (path === '/admin/dashboard') return '/admin/dashboard';
    if (path === '/admin/reports') return '/admin/reports';
    if (path === '/admin/settings') return '/admin/settings';
    if (path === '/admin/permissions') return '/admin/permissions';
    
    // Match parent paths
    if (path.startsWith('/admin/staff')) {
      if (path.includes('/create')) return '/admin/staff/create';
      return '/admin/staff/list';
    }
    if (path.startsWith('/admin/patients')) {
      if (path.includes('/create')) return '/admin/patients/create';
      return '/admin/patients/list';
    }
    if (path.startsWith('/admin/appointments')) {
      if (path.includes('/create')) return '/admin/appointments/create';
      return '/admin/appointments/list';
    }
    if (path.startsWith('/admin/schedules')) return '/admin/schedules';
    if (path.startsWith('/admin/billing')) {
      if (path.includes('/create')) return '/admin/billing/create';
      return '/admin/billing/list';
    }
    if (path.startsWith('/admin/pharmacy')) {
      if (path.includes('/prescriptions')) return '/admin/pharmacy/prescriptions';
      return '/admin/pharmacy/dashboard';
    }
    if (path.startsWith('/admin/laboratory')) return '/admin/laboratory/dashboard';
    
    return '/admin/dashboard';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 18 : 20,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {collapsed ? '🏥' : '🏥 Healthcare Admin'}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          defaultOpenKeys={['/admin/staff', '/admin/patients', '/admin/appointments']}
          items={getMenuItems()}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 18 }}
          />

          <Space size="large">
            <Badge count={notifications.length} offset={[-5, 5]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 20 }} />}
                onClick={() => navigate('/admin/notifications')}
              />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                {!collapsed && (
                  <div>
                    <div>
                      <Text strong>
                        {userInfo?.personalInfo?.firstName} {userInfo?.personalInfo?.lastName}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {getRoleName(userInfo?.role)}
                      </Text>
                    </div>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: 0,
            minHeight: 'calc(100vh - 64px)',
            background: '#f0f2f5'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
