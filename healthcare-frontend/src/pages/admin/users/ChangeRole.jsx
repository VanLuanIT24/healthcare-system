// src/pages/admin/users/ChangeRole.jsx - Đổi role user
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/services/api';
import {
  ArrowLeftOutlined,
  LoadingOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Row,
  Select,
  Spin,
  Tag,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const ChangeRole = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  // Available roles for assignment (match backend ROLES constants)
  const availableRoles = [
    { value: 'PATIENT', label: '👨‍⚕️ Bệnh nhân', color: 'purple' },
    { value: 'DOCTOR', label: '👨‍⚕️ Bác sĩ', color: 'blue' },
    { value: 'NURSE', label: '👩‍⚕️ Y tá', color: 'green' },
    { value: 'RECEPTIONIST', label: '👤 Tiếp tân', color: 'geekblue' },
    { value: 'DEPARTMENT_HEAD', label: '👨‍💼 Trưởng khoa', color: 'cyan' },
    { value: 'HOSPITAL_ADMIN', label: '🏥 Hospital Admin', color: 'volcano' },
    { value: 'SYSTEM_ADMIN', label: '⚙️ System Admin', color: 'orange' },
    { value: 'CLINICAL_ADMIN', label: '👨‍⚕️ Bác sĩ trưởng', color: 'magenta' },
  ];

  const getRoleColor = (role) => {
    const found = availableRoles.find((r) => r.value === role);
    return found?.color || 'default';
  };

  const getRoleLabel = (role) => {
    const found = availableRoles.find((r) => r.value === role);
    return found?.label || role;
  };

  // Load user detail
  const loadUserDetail = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getUserById(userId);
      // API returns { success: true, data: user }
      const userData = res.data?.data;
      
      if (userData) {
        // Normalize data from MongoDB schema
        const normalizedUser = {
          ...userData,
          name: userData.name || `${userData.personalInfo?.firstName || ''} ${userData.personalInfo?.lastName || ''}`.trim(),
          email: userData.email,
          currentRole: userData.role
        };
        setUser(normalizedUser);

        // Set current role in form
        form.setFieldsValue({
          newRole: normalizedUser.role,
        });
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
  }, [userId, form]);

  // Handle form submit
  const onFinish = async (values) => {
    if (values.newRole === user.role) {
      message.warning('Vui lòng chọn role khác');
      return;
    }

    try {
      setSubmitting(true);
      await userAPI.changeUserRole(userId, {
        role: values.newRole,
      });

      message.success('Đổi role thành công');
      setTimeout(() => navigate(`/admin/users/${userId}`), 1000);
    } catch (error) {
      console.error('Error changing role:', error);
      message.error(
        error.response?.data?.message || 'Lỗi khi đổi role'
      );
    } finally {
      setSubmitting(false);
    }
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

  return (
    <AdminLayout>
      <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
        {/* Back Button */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/admin/users/${userId}`)}
          style={{ marginBottom: '20px' }}
        >
          Quay lại
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Current Role Info */}
          <Card style={{ 
            marginBottom: '24px', 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            borderTop: '4px solid #4facfe'
          }}>
            <h3>👤 Thông tin user</h3>
            <Descriptions
              items={[
                {
                  label: 'Tên',
                  children: user?.name,
                },
                {
                  label: 'Email',
                  children: user?.email,
                },
                {
                  label: 'Role hiện tại',
                  children: (
                    <Tag color={getRoleColor(user?.role)} style={{ fontSize: '14px', padding: '8px 16px' }}>
                      {getRoleLabel(user?.role)}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>

          {/* Change Role Form */}
          <Card
            title="🔄 Đổi Role"
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              borderTop: '4px solid #4facfe'
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Role mới"
                name="newRole"
                rules={[
                  { required: true, message: 'Vui lòng chọn role' },
                ]}
              >
                <Select
                  placeholder="Chọn role mới"
                  options={availableRoles}
                  optionLabelRender={(option) => (
                    <div>
                      <Tag color={option.data.color} style={{ fontSize: '13px', padding: '6px 12px' }}>
                        {option.data.label}
                      </Tag>
                    </div>
                  )}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  icon={<SwapOutlined />}
                  htmlType="submit"
                  loading={submitting}
                  style={{ marginRight: '12px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: 'none', color: '#fff', fontWeight: 'bold' }}
                >
                  ✔️ Xác nhận đổi role
                </Button>
                <Button
                  onClick={() => navigate(`/admin/users/${userId}`)}
                >
                  ❌ Hủy
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Info Box */}
          <Card
            style={{
              marginTop: '24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fff5e6 0%, #ffe4cc 100%)',
              border: '2px solid #ffb84d',
              boxShadow: '0 4px 12px rgba(255, 180, 77, 0.2)'
            }}
          >
            <div style={{ color: '#663c00', fontSize: '14px' }}>
              <strong>⚠️ Lưu ý quan trọng:</strong>
              <ul>
                <li>✓ Việc đổi role sẽ làm thay đổi quyền hạn của user ngay lập tức</li>
                <li>✓ User sẽ có quyền truy cập theo role mới</li>
                <li>✓ Lịch sử thay đổi sẽ được ghi lại trong hệ thống</li>
                <li>✓ Hành động này không thể hoàn tác</li>
              </ul>
            </div>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default ChangeRole;
