// src/pages/admin/users/UserDetail.jsx - Chi tiết user
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/services/api';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  SwapOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Modal,
  Row,
  Space,
  Spin,
  Tabs,
  Tag,
  message,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const UserDetail = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Load user detail
  const loadUserDetail = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getUserById(userId);
      // API returns { success: true, data: user }
      const userData = res.data?.data;
      
      // Normalize data from MongoDB schema
      if (userData) {
        const normalizedUser = {
          ...userData,
          // Flatten personalInfo fields to top level for UI compatibility
          name: userData.name || `${userData.personalInfo?.firstName || ''} ${userData.personalInfo?.lastName || ''}`.trim(),
          email: userData.email,
          phone: userData.personalInfo?.phone || '',
          gender: userData.personalInfo?.gender || '',
          dateOfBirth: userData.personalInfo?.dateOfBirth,
          avatar: userData.personalInfo?.profilePicture || userData.avatar,
          address: userData.personalInfo?.address?.street || userData.address || '',
          city: userData.personalInfo?.address?.city || userData.city || '',
          zipCode: userData.personalInfo?.address?.zipCode || userData.zipCode || '',
          // Professional info
          department: userData.professionalInfo?.department || '',
          position: userData.professionalInfo?.position || '',
          licenseNumber: userData.professionalInfo?.licenseNumber || '',
          // Keep original data intact
          personalInfo: userData.personalInfo,
          professionalInfo: userData.professionalInfo,
          settings: userData.settings,
          documents: userData.documents
        };
        setUser(normalizedUser);
      } else {
        message.error('Không nhận được dữ liệu user từ server');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      message.error('Không thể tải thông tin user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserDetail();
    }
  }, [userId]);

  // Disable user
  const handleDisableUser = () => {
    Modal.confirm({
      title: 'Vô hiệu hóa user',
      content: `Bạn có chắc chắn muốn vô hiệu hóa user "${user.name}"?`,
      okText: 'Vô hiệu hóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setActionLoading(true);
          await userAPI.disableUser(userId);
          message.success('User đã bị vô hiệu hóa');
          setUser({ ...user, isActive: false });
        } catch (error) {
          message.error('Lỗi khi vô hiệu hóa user');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Enable user
  const handleEnableUser = () => {
    Modal.confirm({
      title: 'Kích hoạt user',
      content: `Bạn có chắc chắn muốn kích hoạt user "${user.name}"?`,
      okText: 'Kích hoạt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setActionLoading(true);
          await userAPI.enableUser(userId);
          message.success('User đã được kích hoạt');
          setUser({ ...user, isActive: true });
        } catch (error) {
          message.error('Lỗi khi kích hoạt user');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Delete user
  const handleDeleteUser = () => {
    Modal.confirm({
      title: 'Xóa user',
      content: `Bạn có chắc chắn muốn xóa user "${user.name}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setActionLoading(true);
          await userAPI.deleteUser(userId);
          message.success('User đã bị xóa');
          setTimeout(() => navigate('/admin/users'), 1500);
        } catch (error) {
          message.error('Lỗi khi xóa user');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            tip="Đang tải thông tin user..."
          />
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div style={{ padding: '24px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/users')}
            style={{ marginBottom: '20px' }}
          >
            Quay lại
          </Button>
          <Card>
            <Empty description="Không tìm thấy user" />
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const getRoleColor = (role) => {
    const roleColors = {
      super_admin: 'red',
      system_admin: 'orange',
      hospital_admin: 'volcano',
      department_head: 'cyan',
      doctor: 'blue',
      nurse: 'green',
      receptionist: 'geekblue',
      patient: 'purple',
    };
    return roleColors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const roleLabels = {
      super_admin: 'Super Admin',
      system_admin: 'System Admin',
      hospital_admin: 'Hospital Admin',
      department_head: 'Trưởng khoa',
      doctor: 'Bác sĩ',
      nurse: 'Y tá',
      receptionist: 'Tiếp tân',
      patient: 'Bệnh nhân',
    };
    return roleLabels[role] || role;
  };

  // Tab: Personal Info
  const PersonalInfoTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
        <Row gutter={24} align="middle" style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={4}>
            <Avatar
              size={100}
              src={user.personalInfo?.profilePicture ? `${API_URL}/uploads/profiles/${user.personalInfo.profilePicture}` : ''}
              style={{ 
                backgroundColor: '#1890ff',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)'
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Col>
          <Col xs={24} sm={20}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user.name}
            </h2>
            <div style={{ marginBottom: '8px' }}>
              <Tag color={getRoleColor(user.role)} style={{ fontSize: '14px', padding: '8px 16px' }}>
                {getRoleLabel(user.role)}
              </Tag>
              {!user.isActive && <Tag color="red" style={{ fontSize: '14px', padding: '8px 16px', marginLeft: '8px' }}>Đã vô hiệu hóa</Tag>}
            </div>
          </Col>
        </Row>

        <Divider />

        <Descriptions
          items={[
            {
              label: '📧 Email',
              children: user.email,
            },
            {
              label: '📱 Điện thoại',
              children: user.phone || 'N/A',
            },
            {
              label: '👨 Giới tính',
              children: user.gender
                ? user.gender === 'M'
                  ? 'Nam'
                  : 'Nữ'
                : 'N/A',
            },
            {
              label: '🎂 Ngày sinh',
              children: user.dateOfBirth
                ? dayjs(user.dateOfBirth).format('DD/MM/YYYY')
                : 'N/A',
            },
            {
              label: '🏠 Địa chỉ',
              children: user.address || 'N/A',
              span: 3,
            },
            {
              label: '🏙️ Thành phố',
              children: user.city || 'N/A',
            },
            {
              label: '📮 Mã bưu chính',
              children: user.zipCode || 'N/A',
            },
          ]}
        />
      </Card>
    </motion.div>
  );

  // Tab: Role & Permissions
  const RolePermissionsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <h3>👤 Role hiện tại</h3>
          <div style={{ marginTop: '12px' }}>
            <Tag color={getRoleColor(user.role)} style={{ fontSize: '14px', padding: '8px 16px' }}>
              {getRoleLabel(user.role)}
            </Tag>
          </div>
        </div>

        <Divider />

        <h3>🔐 Quyền hạn</h3>
        <div style={{ marginTop: '12px' }}>
          {user.permissions && user.permissions.length > 0 ? (
            <div>
              {user.permissions.map((perm, idx) => (
                <Tag key={idx} style={{ marginBottom: '8px' }}>
                  {perm}
                </Tag>
              ))}
            </div>
          ) : (
            <Empty description="Chưa có quyền hạn cụ thể" style={{ padding: '40px' }} />
          )}
        </div>

        <Divider />

        <h3>💼 Thông tin công việc</h3>
        <Descriptions
          items={[
            {
              label: 'Department',
              children: user.department?.name || 'N/A',
            },
            {
              label: 'Position',
              children: user.position || 'N/A',
            },
            {
              label: 'License/ID',
              children: user.licenseNumber || 'N/A',
            },
          ]}
        />
      </Card>
    </motion.div>
  );

  // Tab: Activity Log
  const ActivityLogTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <Descriptions
          items={[
            {
              label: 'Ngày tạo',
              children: user.createdAt
                ? dayjs(user.createdAt).format('DD/MM/YYYY HH:mm')
                : 'N/A',
            },
            {
              label: 'Lần đăng nhập cuối',
              children: user.lastLogin
                ? dayjs(user.lastLogin).format('DD/MM/YYYY HH:mm')
                : 'Chưa đăng nhập',
            },
            {
              label: 'Cập nhật lần cuối',
              children: user.updatedAt
                ? dayjs(user.updatedAt).format('DD/MM/YYYY HH:mm')
                : 'N/A',
            },
          ]}
        />

        <Divider />

        <h3>📊 Active Sessions</h3>
        {user.activeSessions && user.activeSessions.length > 0 ? (
          <div>
            {user.activeSessions.map((session, idx) => (
              <Card
                key={idx}
                style={{ marginBottom: '12px', backgroundColor: '#f9f9f9' }}
                size="small"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div>🌐 {session.deviceType || 'Unknown Device'}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {session.ipAddress}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '12px', color: '#999' }}>
                    {dayjs(session.lastActive).fromNow()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty description="Chưa có session nào" />
        )}
      </Card>
    </motion.div>
  );

  const tabItems = [
    {
      key: 'personal',
      label: '👤 Thông tin cá nhân',
      children: <PersonalInfoTab />,
    },
    {
      key: 'role',
      label: '🔐 Role & Quyền hạn',
      children: <RolePermissionsTab />,
    },
    {
      key: 'activity',
      label: '📊 Lịch sử hoạt động',
      children: <ActivityLogTab />,
    },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        {/* Back Button */}
        <div style={{ marginBottom: '20px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/users')}
          >
            Quay lại
          </Button>
        </div>

        {/* Tabs */}
        <Card style={{ borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderTop: '4px solid #667eea' }}>
          <Tabs items={tabItems} />
        </Card>

        {/* Actions */}
        <Card
          style={{
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/users/${userId}/edit`)}
              disabled={actionLoading}
              style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: 'none', fontWeight: 'bold', color: '#fff' }}
            >
              ✏️ Chỉnh sửa
            </Button>
            <Button
              icon={<SwapOutlined />}
              onClick={() => navigate(`/admin/users/${userId}/change-role`)}
              disabled={actionLoading}
              style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: 'none', color: '#fff', fontWeight: 'bold' }}
            >
              🔄 Đổi Role
            </Button>
            {user.isActive ? (
              <Button
                danger
                icon={<LockOutlined />}
                onClick={handleDisableUser}
                loading={actionLoading}
                style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', border: 'none', color: '#fff', fontWeight: 'bold' }}
              >
                🔒 Vô hiệu hóa
              </Button>
            ) : (
              <Button
                icon={<UnlockOutlined />}
                onClick={handleEnableUser}
                loading={actionLoading}
                style={{ background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)', border: 'none', color: '#fff', fontWeight: 'bold' }}
              >
                🔓 Kích hoạt
              </Button>
            )}
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteUser}
              loading={actionLoading}
              style={{ background: 'linear-gradient(135deg, #fa5252 0%, #d9480f 100%)', border: 'none', color: '#fff', fontWeight: 'bold' }}
            >
              🗑️ Xóa
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UserDetail;
