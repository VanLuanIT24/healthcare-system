// src/pages/doctor/Profile.jsx - Trang hồ sơ bác sĩ
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import { useAuth } from '@/contexts/AuthContext';
import authAPI from '@/services/api/authAPI';
import {
  CameraOutlined,
  EditOutlined,
  LockOutlined,
  LogoutOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined,
  HomeOutlined,
  IdcardOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BankOutlined,
} from '@ant-design/icons';
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Spin,
  Typography,
  Upload,
  Tabs,
  Descriptions,
} from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';

const { Title, Text, Paragraph } = Typography;

const DoctorProfile = () => {
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
        // Professional Info
        licenseNumber: contextUser.professionalInfo?.licenseNumber,
        specialization: contextUser.professionalInfo?.specialization,
        department: contextUser.professionalInfo?.department,
        position: contextUser.professionalInfo?.position,
        yearsOfExperience: contextUser.professionalInfo?.yearsOfExperience,
        hireDate: contextUser.professionalInfo?.hireDate ? dayjs(contextUser.professionalInfo.hireDate) : null,
        // Address
        street: contextUser.personalInfo?.address?.street,
        city: contextUser.personalInfo?.address?.city,
        state: contextUser.personalInfo?.address?.state,
        zipCode: contextUser.personalInfo?.address?.zipCode,
        country: contextUser.personalInfo?.address?.country,
      });
    }
  }, [contextUser, form]);

  const handleSaveProfile = async (values) => {
    setLoading(true);
    try {
      console.log('💾 DoctorProfile - Saving profile:', values);

      const profileData = {
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || '',
          gender: values.gender || 'OTHER',
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
          address: {
            street: values.street || '',
            city: values.city || '',
            state: values.state || '',
            zipCode: values.zipCode || '',
            country: values.country || '',
          },
        },
        professionalInfo: {
          licenseNumber: values.licenseNumber || '',
          specialization: values.specialization || '',
          department: values.department || '',
          position: values.position || '',
          yearsOfExperience: values.yearsOfExperience || 0,
          hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : null,
        },
      };

      console.log('📤 DoctorProfile - Sending to API:', profileData);

      const result = await updateContextProfile(profileData);

      if (result.success) {
        setUser(contextUser);
        form.setFieldsValue(values);
        message.success('✅ Cập nhật hồ sơ thành công!');
        setIsEditing(false);
      } else {
        message.error('❌ Cập nhật hồ sơ thất bại!');
      }
    } catch (error) {
      console.error('❌ DoctorProfile - Save error:', error);
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
          navigate('/login');
        } catch (error) {
          console.error('Logout error:', error);
          navigate('/login');
        }
      },
    });
  };

  if (!user) {
    return (
      <DoctorLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Row gutter={[24, 24]}>
          {/* Profile Header */}
          <Col span={24}>
            <Card className="profile-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px' }}>
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                  <Avatar
                    size={120}
                    src={avatar}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#fff', border: '4px solid white' }}
                  />
                </Col>
                <Col xs={24} sm={18}>
                  <Title level={2} style={{ color: 'white', marginBottom: 0 }}>
                    {user.personalInfo?.firstName} {user.personalInfo?.lastName}
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                    {user.professionalInfo?.specialization || 'Bác sĩ'}
                  </Text>
                  <div style={{ marginTop: '12px', color: 'rgba(255,255,255,0.8)' }}>
                    <p>📧 {user.email}</p>
                    <p>📞 {user.personalInfo?.phone || 'N/A'}</p>
                    <p>🏥 {user.professionalInfo?.department || 'N/A'}</p>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Main Profile Content */}
          <Col span={24}>
            {!isEditing ? (
              <Card
                title={<Title level={4}>Thông tin hồ sơ</Title>}
                extra={
                  <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                    Chỉnh sửa
                  </Button>
                }
              >
                <Tabs
                  items={[
                    {
                      key: '1',
                      label: 'Thông tin cá nhân',
                      children: (
                        <Descriptions column={2} bordered>
                          <Descriptions.Item label="Họ tên" span={2}>
                            {user.personalInfo?.firstName} {user.personalInfo?.lastName}
                          </Descriptions.Item>
                          <Descriptions.Item label="Email" span={2}>
                            {user.email}
                          </Descriptions.Item>
                          <Descriptions.Item label="Điện thoại">
                            {user.personalInfo?.phone || 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Giới tính">
                            {user.personalInfo?.gender || 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Ngày sinh">
                            {user.personalInfo?.dateOfBirth
                              ? dayjs(user.personalInfo.dateOfBirth).format('DD/MM/YYYY')
                              : 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Địa chỉ" span={2}>
                            {`${user.personalInfo?.address?.street || ''} ${user.personalInfo?.address?.city || ''} ${user.personalInfo?.address?.state || ''} ${user.personalInfo?.address?.zipCode || ''} ${user.personalInfo?.address?.country || ''}`}
                          </Descriptions.Item>
                        </Descriptions>
                      ),
                    },
                    {
                      key: '2',
                      label: 'Thông tin chuyên môn',
                      children: (
                        <Descriptions column={2} bordered>
                          <Descriptions.Item label="Chứng chỉ hành nghề" span={2}>
                            {user.professionalInfo?.licenseNumber || 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Chuyên khoa">
                            {user.professionalInfo?.specialization || 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Phòng ban">
                            {user.professionalInfo?.department || 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Chức vụ">
                            {user.professionalInfo?.position || 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Kinh nghiệm">
                            {user.professionalInfo?.yearsOfExperience || 0} năm
                          </Descriptions.Item>
                          <Descriptions.Item label="Ngày vào làm">
                            {user.professionalInfo?.hireDate
                              ? dayjs(user.professionalInfo.hireDate).format('DD/MM/YYYY')
                              : 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Bằng cấp" span={2}>
                            {user.professionalInfo?.qualifications?.join(', ') || 'N/A'}
                          </Descriptions.Item>
                        </Descriptions>
                      ),
                    },
                  ]}
                />

                <Divider />

                <Space>
                  <Button icon={<LockOutlined />} onClick={handleChangePassword}>
                    Đổi mật khẩu
                  </Button>
                  <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
                    Đăng xuất
                  </Button>
                </Space>
              </Card>
            ) : (
              <Card title={<Title level={4}>Chỉnh sửa hồ sơ</Title>}>
                <Spin spinning={loading}>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveProfile}
                    autoComplete="off"
                  >
                    <Tabs
                      items={[
                        {
                          key: '1',
                          label: 'Thông tin cá nhân',
                          children: (
                            <>
                              <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                  <Form.Item
                                    label="Tên"
                                    name="firstName"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                                  >
                                    <Input prefix={<UserOutlined />} placeholder="Tên" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                  <Form.Item label="Họ" name="lastName">
                                    <Input placeholder="Họ" />
                                  </Form.Item>
                                </Col>
                              </Row>

                              <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                  <Form.Item label="Email" name="email">
                                    <Input prefix={<MailOutlined />} disabled />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                  <Form.Item label="Điện thoại" name="phone">
                                    <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
                                  </Form.Item>
                                </Col>
                              </Row>

                              <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                  <Form.Item label="Giới tính" name="gender">
                                    <CustomSelect
                                      placeholder="Chọn giới tính"
                                      options={[
                                        { label: 'Nam', value: 'male' },
                                        { label: 'Nữ', value: 'female' },
                                        { label: 'Khác', value: 'other' }
                                      ]}
                                    />
                                  </Form.Item>
                                </Col>

                                <Col xs={24} sm={12}>
                                  <Form.Item label="Ngày sinh" name="dateOfBirth">
                                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                                  </Form.Item>
                                </Col>
                              </Row>

                              <Divider>Địa chỉ</Divider>

                              <Form.Item label="Đường" name="street">
                                <Input prefix={<HomeOutlined />} placeholder="Tên đường" />
                              </Form.Item>

                              <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                  <Form.Item label="Thành phố" name="city">
                                    <Input placeholder="Thành phố" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                  <Form.Item label="Tỉnh/Thành" name="state">
                                    <Input placeholder="Tỉnh/Thành" />
                                  </Form.Item>
                                </Col>
                              </Row>

                              <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                  <Form.Item label="Mã bưu chính" name="zipCode">
                                    <Input placeholder="Mã bưu chính" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                  <Form.Item label="Quốc gia" name="country">
                                    <Input placeholder="Quốc gia" />
                                  </Form.Item>
                                </Col>
                              </Row>
                            </>
                          ),
                        },
                        {
                          key: '2',
                          label: 'Thông tin chuyên môn',
                          children: (
                            <>
                              <Form.Item label="Chứng chỉ hành nghề" name="licenseNumber">
                                <Input prefix={<IdcardOutlined />} placeholder="Số chứng chỉ hành nghề" disabled />
                              </Form.Item>

                              <Form.Item label="Chuyên khoa" name="specialization">
                                <Input placeholder="Chuyên khoa" disabled />
                              </Form.Item>

                              <Form.Item label="Phòng ban" name="department">
                                <Input prefix={<BankOutlined />} placeholder="Phòng ban" disabled />
                              </Form.Item>

                              <Form.Item label="Chức vụ" name="position">
                                <Input placeholder="Chức vụ" disabled />
                              </Form.Item>

                              <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                  <Form.Item label="Kinh nghiệm (năm)" name="yearsOfExperience">
                                    <Input type="number" placeholder="0" disabled />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                  <Form.Item label="Ngày vào làm" name="hireDate">
                                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled />
                                  </Form.Item>
                                </Col>
                              </Row>

                              <p className="text-gray-500 text-sm">
                                💡 Thông tin chuyên môn không thể chỉnh sửa. Liên hệ quản trị viên để thay đổi.
                              </p>
                            </>
                          ),
                        },
                      ]}
                    />

                    <Divider />

                    <Space>
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                        Lưu thay đổi
                      </Button>
                      <Button onClick={() => setIsEditing(false)}>
                        Hủy
                      </Button>
                    </Space>
                  </Form>
                </Spin>
              </Card>
            )}
          </Col>
        </Row>
      </motion.div>
    </DoctorLayout>
  );
};

export default DoctorProfile;
