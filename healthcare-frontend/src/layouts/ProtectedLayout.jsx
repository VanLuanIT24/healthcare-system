// 🏥 Protected Layout (for authenticated users)
import {
    BarChartOutlined,
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
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Dropdown, Layout, Menu, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ProtectedLayout.css';

const { Header, Sider, Content } = Layout;

const ProtectedLayout = () => {
  const { user, isAuthenticated, logout, getDashboardRoute } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Menu items based on role
  const getMenuItems = () => {
    const baseItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => navigate(getDashboardRoute()),
      },
    ];

    const roleMenus = {
      SUPER_ADMIN: [
        ...baseItems,
        {
          key: 'users',
          icon: <TeamOutlined />,
          label: 'User Management',
          children: [
            { key: 'users-list', label: 'All Users', onClick: () => navigate('/users') },
            { key: 'users-create', label: 'Create User', onClick: () => navigate('/users/create') },
            { key: 'roles', label: 'Roles & Permissions', onClick: () => navigate('/roles') },
          ],
        },
        {
          key: 'patients',
          icon: <UserOutlined />,
          label: 'Patients',
          children: [
            { key: 'patients-list', label: 'All Patients', onClick: () => navigate('/patients') },
            { key: 'patients-register', label: 'Register Patient', onClick: () => navigate('/patients/register') },
          ],
        },
        {
          key: 'reports',
          icon: <BarChartOutlined />,
          label: 'Reports',
          children: [
            { key: 'reports-clinical', label: 'Clinical Reports', onClick: () => navigate('/reports/clinical') },
            { key: 'reports-financial', label: 'Financial Reports', onClick: () => navigate('/reports/financial') },
            { key: 'reports-pharmacy', label: 'Pharmacy Reports', onClick: () => navigate('/reports/pharmacy') },
          ],
        },
        {
          key: 'admin',
          icon: <SettingOutlined />,
          label: 'Administration',
          children: [
            { key: 'admin-settings', label: 'System Settings', onClick: () => navigate('/admin/settings') },
            { key: 'admin-audit', label: 'Audit Logs', onClick: () => navigate('/admin/audit-logs') },
            { key: 'admin-monitoring', label: 'Monitoring', onClick: () => navigate('/admin/monitoring') },
          ],
        },
      ],
      HOSPITAL_ADMIN: [
        ...baseItems,
        {
          key: 'users',
          icon: <TeamOutlined />,
          label: 'Users',
          onClick: () => navigate('/users'),
        },
        {
          key: 'patients',
          icon: <UserOutlined />,
          label: 'Patients',
          onClick: () => navigate('/patients'),
        },
        {
          key: 'appointments',
          icon: <CalendarOutlined />,
          label: 'Appointments',
          onClick: () => navigate('/appointments'),
        },
        {
          key: 'reports',
          icon: <BarChartOutlined />,
          label: 'Reports',
          children: [
            { key: 'reports-clinical', label: 'Clinical', onClick: () => navigate('/reports/clinical') },
            { key: 'reports-financial', label: 'Financial', onClick: () => navigate('/reports/financial') },
          ],
        },
      ],
      DOCTOR: [
        ...baseItems,
        {
          key: 'appointments',
          icon: <CalendarOutlined />,
          label: 'Appointments',
          onClick: () => navigate('/appointments'),
        },
        {
          key: 'patients',
          icon: <UserOutlined />,
          label: 'Patients',
          onClick: () => navigate('/patients'),
        },
        {
          key: 'medical-records',
          icon: <FileTextOutlined />,
          label: 'Medical Records',
          onClick: () => navigate('/medical-records'),
        },
        {
          key: 'prescriptions',
          icon: <MedicineBoxOutlined />,
          label: 'Prescriptions',
          onClick: () => navigate('/prescriptions'),
        },
        {
          key: 'lab',
          icon: <ExperimentOutlined />,
          label: 'Laboratory',
          onClick: () => navigate('/lab/orders'),
        },
      ],
      NURSE: [
        ...baseItems,
        {
          key: 'appointments',
          icon: <CalendarOutlined />,
          label: 'Appointments',
          onClick: () => navigate('/appointments'),
        },
        {
          key: 'patients',
          icon: <UserOutlined />,
          label: 'Patients',
          onClick: () => navigate('/patients'),
        },
        {
          key: 'medical-records',
          icon: <FileTextOutlined />,
          label: 'Medical Records',
          onClick: () => navigate('/medical-records'),
        },
      ],
      PHARMACIST: [
        ...baseItems,
        {
          key: 'prescriptions',
          icon: <MedicineBoxOutlined />,
          label: 'Prescriptions',
          onClick: () => navigate('/prescriptions'),
        },
        {
          key: 'medications',
          icon: <SafetyOutlined />,
          label: 'Medications',
          onClick: () => navigate('/pharmacy/medications'),
        },
        {
          key: 'inventory',
          icon: <BarChartOutlined />,
          label: 'Inventory',
          onClick: () => navigate('/pharmacy/inventory'),
        },
        {
          key: 'dispense',
          icon: <MedicineBoxOutlined />,
          label: 'Dispense',
          onClick: () => navigate('/pharmacy/dispense'),
        },
      ],
      LAB_TECHNICIAN: [
        ...baseItems,
        {
          key: 'lab-orders',
          icon: <ExperimentOutlined />,
          label: 'Lab Orders',
          onClick: () => navigate('/lab/orders'),
        },
        {
          key: 'lab-results',
          icon: <FileTextOutlined />,
          label: 'Results Entry',
          onClick: () => navigate('/lab/orders'), // Will filter for pending results
        },
      ],
      RECEPTIONIST: [
        ...baseItems,
        {
          key: 'appointments',
          icon: <CalendarOutlined />,
          label: 'Appointments',
          onClick: () => navigate('/appointments'),
        },
        {
          key: 'patients',
          icon: <UserOutlined />,
          label: 'Patients',
          onClick: () => navigate('/patients'),
        },
        {
          key: 'register-patient',
          icon: <UserOutlined />,
          label: 'Register Patient',
          onClick: () => navigate('/patients/register'),
        },
      ],
      BILLING_STAFF: [
        ...baseItems,
        {
          key: 'billing',
          icon: <DollarOutlined />,
          label: 'Billing',
          onClick: () => navigate('/billing'),
        },
        {
          key: 'patients',
          icon: <UserOutlined />,
          label: 'Patients',
          onClick: () => navigate('/patients'),
        },
      ],
      PATIENT: [
        ...baseItems,
        {
          key: 'appointments',
          icon: <CalendarOutlined />,
          label: 'My Appointments',
          onClick: () => navigate('/appointments'),
        },
        {
          key: 'medical-records',
          icon: <FileTextOutlined />,
          label: 'Medical Records',
          onClick: () => navigate('/medical-records'),
        },
        {
          key: 'prescriptions',
          icon: <MedicineBoxOutlined />,
          label: 'Prescriptions',
          onClick: () => navigate('/prescriptions'),
        },
        {
          key: 'billing',
          icon: <DollarOutlined />,
          label: 'Billing',
          onClick: () => navigate('/billing'),
        },
      ],
    };

    return roleMenus[user?.role] || baseItems;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      message.error('Đăng xuất thất bại');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate(`/users/${user._id}`),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => message.info('Coming soon'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const getRoleDisplayName = (role) => {
    const roleNames = {
      SUPER_ADMIN: 'Super Admin',
      HOSPITAL_ADMIN: 'Hospital Admin',
      DEPARTMENT_HEAD: 'Department Head',
      DOCTOR: 'Doctor',
      NURSE: 'Nurse',
      PHARMACIST: 'Pharmacist',
      LAB_TECHNICIAN: 'Lab Technician',
      RECEPTIONIST: 'Receptionist',
      BILLING_STAFF: 'Billing Staff',
      PATIENT: 'Patient',
    };
    return roleNames[role] || role;
  };

  return (
    <Layout className="protected-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="layout-sider"
        width={250}
      >
        <div className="logo">
          <h2>{collapsed ? 'HC' : 'Healthcare'}</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
        />
      </Sider>
      <Layout>
        <Header className="layout-header">
          <div className="header-left">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
            })}
            <h3 className="page-title">Healthcare Management System</h3>
          </div>
          <div className="header-right">
            <Badge count={0} className="notification-badge">
              <BellOutlined className="header-icon" />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div className="user-profile">
                <Avatar
                  src={user.profilePicture}
                  icon={<UserOutlined />}
                  className="user-avatar"
                />
                {!collapsed && (
                  <div className="user-info">
                    <span className="user-name">{user.fullName || user.firstName}</span>
                    <span className="user-role">{getRoleDisplayName(user.role)}</span>
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="layout-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProtectedLayout;
