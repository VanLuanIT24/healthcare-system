// src/pages/patient/MyProfileContent.jsx
import { useAuth } from '@/contexts/AuthContext';
import authAPI from '@/services/api/authAPI';
import { CameraOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { App, Avatar, Button, Col, DatePicker, Divider, Form, Input, Modal, Row, Select, Space, Spin, Typography, Upload } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const MyProfileContent = () => {
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
      console.log('💾 MyProfileContent - Saving profile:', values);
      
      const profileData = {
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || '',
          gender: values.gender || 'OTHER',
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        }
      };
      
      console.log('📤 MyProfileContent - Sending to API:', profileData);
      
      const result = await updateContextProfile(profileData);
      
      if (result.success) {
        setUser(contextUser);
        form.setFieldsValue(values);
        
        message.success('✅ Cập nhật hồ sơ thành công!');
        setIsEditing(false);
        console.log('✅ MyProfileContent - Profile updated successfully');
      } else {
        message.error('❌ Cập nhật hồ sơ thất bại!');
      }
    } catch (error) {
      console.error('❌ MyProfileContent - Save error:', error);
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
      console.log('📤 MyProfileContent - Uploading avatar:', file.name);
      
      const response = await authAPI.uploadAvatar(file);
      console.log('✅ Avatar upload response:', response);
      
      if (response?.data?.success) {
        let avatarUrl = response?.data?.data?.profilePictureUrl;
        
        if (avatarUrl && !avatarUrl.startsWith('http')) {
          avatarUrl = `http://localhost:5000${avatarUrl}`;
        }
        
        if (avatarUrl) {
          console.log('🖼️ Setting avatar URL:', avatarUrl);
          setAvatar(avatarUrl);
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

  return (
    <Spin spinning={loading} tip="Đang cập nhật...">
      <div className="space-y-6">
        {/* Avatar Section */}
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar
                  size={120}
                  src={avatar}
                  icon={null}
                  style={{ backgroundColor: '#1890ff' }}
                >
                  {!avatar && <span className="text-4xl">👤</span>}
                </Avatar>
                <Upload
                  beforeUpload={(file) => {
                    handleUploadAvatar(file);
                    return false;
                  }}
                  maxCount={1}
                  showUploadList={false}
                >
                  <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<CameraOutlined />}
                    className="absolute bottom-0 right-0"
                  />
                </Upload>
              </div>
              <Text className="text-center text-gray-600">
                {user?.personalInfo?.firstName} {user?.personalInfo?.lastName}
              </Text>
              <Text className="text-center text-gray-400 text-sm">
                {user?.email}
              </Text>
            </div>
          </Col>

          {/* Profile Form */}
          <Col xs={24} sm={16}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveProfile}
              disabled={!isEditing}
              requiredMark={isEditing}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Họ"
                    name="lastName"
                    rules={[{ required: isEditing, message: 'Vui lòng nhập họ' }]}
                  >
                    <Input placeholder="Họ" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tên"
                    name="firstName"
                    rules={[{ required: isEditing, message: 'Vui lòng nhập tên' }]}
                  >
                    <Input placeholder="Tên" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email"
                name="email"
              >
                <Input disabled type="email" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Giới tính"
                    name="gender"
                  >
                    <Select placeholder="Chọn giới tính">
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
                    <DatePicker format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
              </Row>

              <Space>
                {!isEditing ? (
                  <Button type="primary" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa
                  </Button>
                ) : (
                  <>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Lưu
                    </Button>
                    <Button onClick={() => setIsEditing(false)}>
                      Hủy
                    </Button>
                  </>
                )}
              </Space>
            </Form>
          </Col>
        </Row>

        <Divider />

        {/* Security & Actions */}
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Title level={5}>🔒 Bảo mật</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="default"
                icon={<LockOutlined />}
                block
                onClick={handleChangePassword}
              >
                Đổi mật khẩu
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider />

        {/* Logout */}
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Button
              danger
              block
              size="large"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default MyProfileContent;
