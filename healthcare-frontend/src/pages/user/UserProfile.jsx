// 👤 User Profile Page - Trang profile cá nhân
import {
    CameraOutlined,
    CloseOutlined,
    EditOutlined,
    HomeOutlined,
    IdcardOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    SafetyOutlined,
    SaveOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Form,
    Input,
    message,
    Modal,
    Row,
    Space,
    Tabs,
    Tag,
    Upload,
} from 'antd';
import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import authAPI from '../../services/api/authAPI';
import userAPI from '../../services/api/userAPI';
import './UserProfile.css';

const { TabPane } = Tabs;
const { TextArea } = Input;

const UserProfile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Fetch user profile
  useEffect(() => {
    fetchUserProfile();
    fetchUserPermissions();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserProfile();
      setProfileData(response.data.data);
      setAvatarUrl(response.data.data.avatar || '');
      form.setFieldsValue({
        email: response.data.data.email,
        fullName: response.data.data.fullName,
        phone: response.data.data.phone,
        address: response.data.data.contactInfo?.address || '',
        bio: response.data.data.bio || '',
      });
    } catch (error) {
      message.error('Không thể tải thông tin profile');
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async () => {
    try {
      const response = await userAPI.getUserPermissions(user._id);
      setPermissions(response.data.data || []);
    } catch (error) {
      console.error('Fetch permissions error:', error);
    }
  };

  // Update profile
  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      const updateData = {
        fullName: values.fullName,
        phone: values.phone,
        contactInfo: {
          address: values.address,
        },
        bio: values.bio,
      };

      const response = await userAPI.updateUserProfile(updateData);
      message.success('Cập nhật profile thành công');
      setProfileData(response.data.data);
      setEditMode(false);
      
      // Update context
      updateUser(response.data.data);
    } catch (error) {
      message.error('Không thể cập nhật profile');
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload avatar
  const handleAvatarChange = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      const formData = new FormData();
      formData.append('avatar', info.file.originFileObj);

      try {
        const response = await userAPI.uploadAvatar(formData);
        setAvatarUrl(response.data.data.avatar);
        message.success('Cập nhật ảnh đại diện thành công');
        
        // Update context
        updateUser({ ...user, avatar: response.data.data.avatar });
      } catch (error) {
        message.error('Không thể upload ảnh đại diện');
        console.error('Upload avatar error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Change password
  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      await authAPI.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Đổi mật khẩu thành công');
      setChangePasswordVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
      console.error('Change password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div className="avatar-upload-button">
      <CameraOutlined style={{ fontSize: 24 }} />
      <div style={{ marginTop: 8 }}>Đổi ảnh</div>
    </div>
  );

  const getRoleColor = (role) => {
    const colors = {
      SUPER_ADMIN: 'red',
      HOSPITAL_ADMIN: 'orange',
      DOCTOR: 'blue',
      NURSE: 'cyan',
      RECEPTIONIST: 'green',
      BILLING_STAFF: 'purple',
      PHARMACIST: 'magenta',
      LAB_TECHNICIAN: 'geekblue',
      PATIENT: 'default',
    };
    return colors[role] || 'default';
  };

  const getRoleText = (role) => {
    const texts = {
      SUPER_ADMIN: 'Super Admin',
      HOSPITAL_ADMIN: 'Quản trị viên',
      DOCTOR: 'Bác sĩ',
      NURSE: 'Điều dưỡng',
      RECEPTIONIST: 'Lễ tân',
      BILLING_STAFF: 'Nhân viên kế toán',
      PHARMACIST: 'Dược sĩ',
      LAB_TECHNICIAN: 'Kỹ thuật viên XN',
      PATIENT: 'Bệnh nhân',
    };
    return texts[role] || role;
  };

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile-container">
      <Row gutter={[24, 24]}>
        {/* Left Column - Avatar & Basic Info */}
        <Col xs={24} md={8}>
          <Card className="profile-card">
            <div className="avatar-section">
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleAvatarChange}
              >
                <div className="avatar-wrapper">
                  <Avatar
                    size={150}
                    src={avatarUrl}
                    icon={<UserOutlined />}
                    className="profile-avatar"
                  />
                  <div className="avatar-overlay">
                    {uploadButton}
                  </div>
                </div>
              </Upload>

              <h2 className="profile-name">{profileData.fullName}</h2>
              <Tag color={getRoleColor(profileData.role)} style={{ marginBottom: 16 }}>
                {getRoleText(profileData.role)}
              </Tag>
              
              <div className="profile-meta">
                <p><MailOutlined /> {profileData.email}</p>
                <p><PhoneOutlined /> {profileData.phone || 'Chưa cập nhật'}</p>
                <p><IdcardOutlined /> ID: {profileData.userId}</p>
                <p>
                  <SafetyOutlined /> 
                  <Tag color={profileData.status === 'ACTIVE' ? 'success' : 'default'} style={{ marginLeft: 8 }}>
                    {profileData.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                  </Tag>
                </p>
              </div>

              <Divider />

              <Button
                type="primary"
                icon={<LockOutlined />}
                block
                onClick={() => setChangePasswordVisible(true)}
              >
                Đổi mật khẩu
              </Button>
            </div>
          </Card>
        </Col>

        {/* Right Column - Detailed Info */}
        <Col xs={24} md={16}>
          <Card
            title="Thông tin chi tiết"
            extra={
              <Space>
                {editMode ? (
                  <>
                    <Button
                      icon={<SaveOutlined />}
                      type="primary"
                      loading={loading}
                      onClick={() => form.submit()}
                    >
                      Lưu
                    </Button>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={() => {
                        setEditMode(false);
                        form.resetFields();
                      }}
                    >
                      Hủy
                    </Button>
                  </>
                ) : (
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setEditMode(true)}
                  >
                    Chỉnh sửa
                  </Button>
                )}
              </Space>
            }
          >
            <Tabs defaultActiveKey="1">
              <TabPane tab="Thông tin cơ bản" key="1">
                {editMode ? (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                  >
                    <Form.Item
                      label="Email"
                      name="email"
                    >
                      <Input disabled prefix={<MailOutlined />} />
                    </Form.Item>

                    <Form.Item
                      label="Họ và tên"
                      name="fullName"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item
                      label="Số điện thoại"
                      name="phone"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
                      ]}
                    >
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>

                    <Form.Item
                      label="Địa chỉ"
                      name="address"
                    >
                      <Input prefix={<HomeOutlined />} />
                    </Form.Item>

                    <Form.Item
                      label="Giới thiệu bản thân"
                      name="bio"
                    >
                      <TextArea rows={4} placeholder="Viết vài dòng về bản thân..." />
                    </Form.Item>
                  </Form>
                ) : (
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Email">
                      {profileData.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Họ và tên">
                      {profileData.fullName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      {profileData.phone || 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">
                      {profileData.contactInfo?.address || 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới thiệu">
                      {profileData.bio || 'Chưa có thông tin'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tham gia">
                      {moment(profileData.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cập nhật lần cuối">
                      {moment(profileData.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </TabPane>

              <TabPane tab="Quyền hạn" key="2">
                <Card size="small" title="Danh sách quyền">
                  {permissions.length > 0 ? (
                    <div className="permissions-list">
                      {permissions.map((permission, index) => (
                        <Tag key={index} color="blue" style={{ margin: 4, padding: '4px 12px' }}>
                          {permission}
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#999', textAlign: 'center' }}>
                      Chưa có quyền nào được gán
                    </p>
                  )}
                </Card>

                <Card size="small" title="Vai trò" style={{ marginTop: 16 }}>
                  <Tag color={getRoleColor(profileData.role)} style={{ fontSize: 14, padding: '4px 16px' }}>
                    {getRoleText(profileData.role)}
                  </Tag>
                  <Divider />
                  <p style={{ color: '#666', fontSize: 13 }}>
                    Vai trò xác định các quyền và chức năng bạn có thể truy cập trong hệ thống.
                    Liên hệ quản trị viên nếu cần thay đổi vai trò hoặc quyền hạn.
                  </p>
                </Card>
              </TabPane>

              {profileData.professionalInfo && (
                <TabPane tab="Thông tin chuyên môn" key="3">
                  <Descriptions bordered column={1}>
                    {profileData.professionalInfo.specialization && (
                      <Descriptions.Item label="Chuyên khoa">
                        {profileData.professionalInfo.specialization}
                      </Descriptions.Item>
                    )}
                    {profileData.professionalInfo.department && (
                      <Descriptions.Item label="Khoa">
                        {profileData.professionalInfo.department}
                      </Descriptions.Item>
                    )}
                    {profileData.professionalInfo.licenseNumber && (
                      <Descriptions.Item label="Số chứng chỉ hành nghề">
                        {profileData.professionalInfo.licenseNumber}
                      </Descriptions.Item>
                    )}
                    {profileData.professionalInfo.degree && (
                      <Descriptions.Item label="Bằng cấp">
                        {profileData.professionalInfo.degree}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </TabPane>
              )}
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Change Password Modal */}
      <Modal
        title="Đổi mật khẩu"
        open={changePasswordVisible}
        onCancel={() => {
          setChangePasswordVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setChangePasswordVisible(false);
                passwordForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Đổi mật khẩu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;
