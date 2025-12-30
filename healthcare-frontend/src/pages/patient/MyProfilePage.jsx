// src/pages/patient/MyProfilePage.jsx
import { CameraOutlined, EditOutlined, LockOutlined, LogoutOutlined, MailOutlined, PhoneOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { App, Avatar, Button, Card, Col, DatePicker, Divider, Form, Input, Modal, Row, Select, Space, Spin, Typography, Upload } from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authAPI from '../../services/api/authAPI';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const MyProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState('');
  const { logout, user: contextUser, updateProfile: updateContextProfile } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      const profilePicture = contextUser.personalInfo?.profilePicture;
      if (profilePicture) {
        const avatarUrl = profilePicture.startsWith('http') 
          ? profilePicture 
          : `http://localhost:5000/uploads/profiles/${profilePicture}`;
        setAvatar(avatarUrl);
      }
      
      form.setFieldsValue({
        email: contextUser.email,
        firstName: contextUser.personalInfo?.firstName,
        lastName: contextUser.personalInfo?.lastName,
        phone: contextUser.personalInfo?.phone,
        gender: contextUser.personalInfo?.gender?.toLowerCase(),
        dateOfBirth: contextUser.personalInfo?.dateOfBirth ? dayjs(contextUser.personalInfo.dateOfBirth) : null,
      });
    }
  }, [contextUser, form]);

  const handleSaveProfile = async (values) => {
    setLoading(true);
    try {
      console.log('💾 MyProfilePage - Saving profile:', values);
      
      // Prepare data to send
      const profileData = {
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || '',
          gender: values.gender || 'OTHER',
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        }
      };
      
      console.log('📤 MyProfilePage - Sending to API:', profileData);
      
      // Call AuthContext's updateProfile to persist changes globally
      const result = await updateContextProfile(profileData);
      
      if (result.success) {
        // Update local state from context
        setUser(contextUser);
        form.setFieldsValue(values);
        
        message.success('✅ Cập nhật hồ sơ thành công!');
        setIsEditing(false);
        console.log('✅ MyProfilePage - Profile updated successfully');
      } else {
        message.error('❌ Cập nhật hồ sơ thất bại!');
      }
    } catch (error) {
      console.error('❌ MyProfilePage - Save error:', error);
      message.error('❌ Cập nhật hồ sơ thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Đăng xuất',
      content: 'Bạn có chắc chắn muốn đăng xuất?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await authAPI.logout(localStorage.getItem('refreshToken'));
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          logout();
          navigate('/login', { replace: true });
        } catch (error) {
          message.error({ content: '❌ Đăng xuất thất bại!', key: 'logout-error' });
        }
      }
    });
  };

  const handleUploadAvatar = async (file) => {
    try {
      setLoading(true);
      console.log('📤 MyProfilePage - Uploading avatar:', file.name);
      
      // Upload file to server using authAPI
      const response = await authAPI.uploadAvatar(file);
      console.log('✅ Avatar upload response:', response);
      
      if (response?.data?.success) {
        // Get the full URL from response or construct it
        let avatarUrl = response?.data?.data?.profilePictureUrl;
        
        // If it's a relative path, make it absolute
        if (avatarUrl && !avatarUrl.startsWith('http')) {
          avatarUrl = `http://localhost:5000${avatarUrl}`;
        }
        
        // If we have a full URL, set it
        if (avatarUrl) {
          console.log('🖼️ Setting avatar URL:', avatarUrl);
          setAvatar(avatarUrl);
          // Update user data with new avatar
          setUser(prev => ({
            ...prev,
            personalInfo: {
              ...prev?.personalInfo,
              profilePicture: response?.data?.data?.profilePicture
            }
          }));
        }
        
        message.success('✅ Tải lên ảnh đại diện thành công!');
        console.log('✅ Avatar uploaded successfully');
      } else {
        message.error(response?.data?.message || '❌ Tải lên ảnh đại diện thất bại!');
      }
    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      message.error('❌ Tải lên ảnh đại diện thất bại!');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: '16px', color: '#fff' }}>Đang tải hồ sơ...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingTop: '60px',
      paddingBottom: '40px',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header Card with Avatar */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card
            style={{
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              marginBottom: '30px',
              border: 'none',
              overflow: 'hidden',
            }}
            styles={{ body: { padding: '40px' } }}
          >
            <Row gutter={40} align="middle">
              <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    size={150}
                    src={avatar}
                    icon={<UserOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      border: '5px solid white',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                    }}
                  />
                  {isEditing && (
                    <Upload
                      beforeUpload={(file) => {
                        handleUploadAvatar(file);
                        return false; // Prevent default upload
                      }}
                      maxCount={1}
                      showUploadList={false}
                    >
                      <Button
                        shape="circle"
                        size="large"
                        icon={<CameraOutlined />}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          border: 'none',
                        }}
                      />
                    </Upload>
                  )}
                </div>
              </Col>
              <Col xs={24} sm={16}>
                <Title level={2} style={{ margin: '0 0 8px 0' }}>
                  {user?.personalInfo?.firstName} {user?.personalInfo?.lastName}
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  {user?.role === 'PATIENT' ? '🏥 Bệnh nhân' : user?.role}
                </Text>
                <Divider style={{ margin: '16px 0' }} />
                <Space direction="vertical" size="small">
                  <Text>
                    <MailOutlined style={{ color: '#667eea', marginRight: '8px' }} />
                    {user?.email}
                  </Text>
                  <Text>
                    <PhoneOutlined style={{ color: '#667eea', marginRight: '8px' }} />
                    {user?.personalInfo?.phone || 'Chưa cập nhật'}
                  </Text>
                </Space>
              </Col>
            </Row>

            {/* Action Buttons */}
            <Row gutter={12} style={{ marginTop: '30px' }} justify="end">
              {!isEditing ? (
                <>
                  <Col>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        borderRadius: '10px',
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      icon={<LockOutlined />}
                      onClick={handleChangePassword}
                      style={{ borderRadius: '10px' }}
                    >
                      Đổi mật khẩu
                    </Button>
                  </Col>
                </>
              ) : (
                <>
                  <Col>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        loadUserProfile();
                      }}
                      style={{ borderRadius: '10px' }}
                    >
                      Hủy
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={() => form.submit()}
                      loading={loading}
                      style={{
                        background: 'linear-gradient(135deg, #52c41a, #95de64)',
                        borderRadius: '10px',
                      }}
                    >
                      Lưu
                    </Button>
                  </Col>
                </>
              )}
            </Row>
          </Card>
        </motion.div>

        {/* Profile Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card
            title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>👤 Thông tin cá nhân</span>}
            style={{
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              marginBottom: '30px',
              border: 'none',
            }}
            styles={{ body: { padding: '30px' } }}
          >
            <Spin spinning={loading}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSaveProfile}
              >
                <Row gutter={20}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Họ"
                      name="firstName"
                      rules={[{ required: true, message: '❌ Vui lòng nhập họ' }]}
                    >
                      <Input
                        disabled={!isEditing}
                        placeholder="Nguyễn"
                        prefix={<UserOutlined />}
                        style={{ borderRadius: '10px' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Tên"
                      name="lastName"
                      rules={[{ required: true, message: '❌ Vui lòng nhập tên' }]}
                    >
                      <Input
                        disabled={!isEditing}
                        placeholder="Văn A"
                        prefix={<UserOutlined />}
                        style={{ borderRadius: '10px' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={20}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                    >
                      <Input
                        disabled
                        prefix={<MailOutlined />}
                        style={{ borderRadius: '10px' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Số điện thoại"
                      name="phone"
                    >
                      <Input
                        disabled={!isEditing}
                        placeholder="0912345678"
                        prefix={<PhoneOutlined />}
                        style={{ borderRadius: '10px' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={20}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Giới tính"
                      name="gender"
                    >
                      <Select
                        disabled={!isEditing}
                        placeholder="Chọn giới tính"
                        style={{ borderRadius: '10px' }}
                      >
                        <Option value="male">Nam</Option>
                        <Option value="female">Nữ</Option>
                        <Option value="other">Khác</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Ngày sinh"
                      name="dateOfBirth"
                    >
                      <DatePicker
                        disabled={!isEditing}
                        style={{ width: '100%', borderRadius: '10px' }}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Spin>
          </Card>
        </motion.div>

        {/* Logout Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card
            style={{
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              border: 'none',
              background: '#fff5f5',
            }}
            styles={{ body: { padding: '30px' } }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>
                  🚪 Đăng xuất
                </Title>
                <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
                  Bạn sẽ bị đăng xuất khỏi tất cả các thiết bị của bạn
                </Paragraph>
              </Col>
              <Col>
                <Button
                  danger
                  size="large"
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  style={{ borderRadius: '10px' }}
                >
                  Đăng xuất
                </Button>
              </Col>
            </Row>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MyProfilePage;
