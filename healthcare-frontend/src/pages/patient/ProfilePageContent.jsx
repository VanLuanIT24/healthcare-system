// src/pages/patient/ProfilePageContent.jsx
import { useAuth } from '@/contexts/AuthContext';
import authAPI from '@/services/api/authAPI';
import { CameraOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { App, Avatar, Button, Card, Col, DatePicker, Divider, Form, Input, Modal, Row, Space, Spin, Typography, Upload } from 'antd';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;


const ProfilePageContent = () => {
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
      console.log('📌 ProfilePageContent - contextUser loaded:', contextUser);
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
    } else {
      console.log('⚠️ ProfilePageContent - contextUser not available yet');
    }
  }, [contextUser, form]);

  const handleSaveProfile = async (values) => {
    setLoading(true);
    try {
      console.log('💾 ProfilePageContent - Saving profile:', values);

      const profileData = {
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || '',
          gender: values.gender || 'OTHER',
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        }
      };

      console.log('📤 ProfilePageContent - Sending to API:', profileData);

      const result = await updateContextProfile(profileData);

      if (result.success) {
        setUser(contextUser);
        form.setFieldsValue(values);

        message.success('✅ Cập nhật hồ sơ thành công!');
        setIsEditing(false);
        console.log('✅ ProfilePageContent - Profile updated successfully');
      } else {
        message.error('❌ Cập nhật hồ sơ thất bại!');
      }
    } catch (error) {
      console.error('❌ ProfilePageContent - Save error:', error);
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
      console.log('📤 ProfilePageContent - Uploading avatar:', file.name);

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
    <Spin spinning={loading && !user} tip="Đang tải hồ sơ...">
      {!contextUser && !user ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Text>Đang tải thông tin hồ sơ...</Text>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Header Card with Avatar */}
          <Card
            style={{
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
            styles={{ body: { padding: '30px' } }}
          >
            <Row gutter={30} align="middle">
              <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    size={120}
                    src={avatar}
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
                      style={{ position: 'absolute', bottom: 0, right: 0 }}
                    />
                  </Upload>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Title level={4} style={{ marginBottom: '4px' }}>
                    {user?.personalInfo?.firstName} {user?.personalInfo?.lastName}
                  </Title>
                  <Text type="secondary">{user?.email}</Text>
                </div>
              </Col>

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
                        <CustomSelect
                          placeholder="Chọn giới tính"
                          options={[
                            { label: 'Nam', value: 'male' },
                            { label: 'Nữ', value: 'female' },
                            { label: 'Khác', value: 'other' },
                          ]}
                        />

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
          </Card>

          <Divider />

          {/* Security Section */}
          <Card>
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
          </Card>

          <Divider />

          {/* Logout Section */}
          <Button
            danger
            block
            size="large"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </div>
      )}
    </Spin>
  );
};

export default ProfilePageContent;
