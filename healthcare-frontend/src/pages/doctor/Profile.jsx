// src/pages/doctor/Profile.jsx - Trang hồ sơ bác sĩ (Medlink-style)
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import { useAuth } from '@/contexts/AuthContext';
import authAPI from '@/services/api/authAPI';
import publicAPI from '@/services/api/publicAPI';
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
  BankOutlined,
  StarFilled,
  RiseOutlined,
  TeamOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  FileDoneOutlined,
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
  Tag,
  Statistic,
  Progress,
  Rate,
} from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';
import './Profile.css';

const { Title, Text, Paragraph } = Typography;

const DoctorProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [departmentName, setDepartmentName] = useState('');
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
        licenseNumber: contextUser.professionalInfo?.licenseNumber,
        specialization: contextUser.professionalInfo?.specialization,
        department: contextUser.professionalInfo?.department,
        position: contextUser.professionalInfo?.position,
        yearsOfExperience: contextUser.professionalInfo?.yearsOfExperience,
        hireDate: contextUser.professionalInfo?.hireDate ? dayjs(contextUser.professionalInfo.hireDate) : null,
        street: contextUser.personalInfo?.address?.street,
        city: contextUser.personalInfo?.address?.city,
        state: contextUser.personalInfo?.address?.state,
        zipCode: contextUser.personalInfo?.address?.zipCode,
        country: contextUser.personalInfo?.address?.country,
      });
    }
  }, [contextUser, form]);

  // Resolve department name if it looks like a MongoDB ObjectId
  useEffect(() => {
    const deptValue = contextUser?.professionalInfo?.department;
    if (!deptValue) return;
    const isObjectId = /^[a-f\d]{24}$/i.test(deptValue);
    if (isObjectId) {
      publicAPI.getDepartments()
        .then(res => {
          const departments = res?.data?.data || res?.data || [];
          const matchedDepartment = Array.isArray(departments)
            ? departments.find((department) => department?._id === deptValue)
            : null;
          setDepartmentName(matchedDepartment?.name || deptValue);
        })
        .catch(() => setDepartmentName(deptValue));
    } else {
      setDepartmentName(deptValue);
    }
  }, [contextUser]);

  const handleSaveProfile = async (values) => {
    setLoading(true);
    try {
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
      message.error('❌ Cập nhật hồ sơ thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => navigate('/change-password');

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
        } catch {
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

  const fullName = `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`.trim();
  const specialization = user.professionalInfo?.specialization || 'Bác sĩ';
  const department = departmentName || user.professionalInfo?.department || 'N/A';
  const experience = user.professionalInfo?.yearsOfExperience || 0;
  const licenseNumber = user.professionalInfo?.licenseNumber || 'N/A';
  const address = [
    user.personalInfo?.address?.street,
    user.personalInfo?.address?.city,
    user.personalInfo?.address?.state,
    user.personalInfo?.address?.country,
  ].filter(Boolean).join(', ') || 'N/A';

  return (
    <DoctorLayout>
      <motion.div
        className="doctor-profile-page"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Row gutter={[20, 20]} align="stretch">
          {/* ===== LEFT COLUMN: Doctor Card ===== */}
          <Col xs={24} lg={6}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card className="doctor-card" bordered={false}>
                {/* Photo area */}
                <div className="doctor-card__photo-area">
                  <div className="doctor-card__photo-bg" />
                  <div className="doctor-card__avatar-wrap">
                    <Avatar
                      size={110}
                      src={avatar}
                      icon={<UserOutlined />}
                      className="doctor-card__avatar"
                    />
                    {!isEditing && (
                      <button className="doctor-card__edit-avatar" onClick={() => setIsEditing(true)}>
                        <CameraOutlined />
                      </button>
                    )}
                  </div>
                </div>

                {/* Doctor info */}
                <div className="doctor-card__info">
                  <Tag color="teal" className="doctor-card__id-tag">
                    #{licenseNumber}
                  </Tag>
                  <Title level={4} className="doctor-card__name">{fullName || 'Bác sĩ'}</Title>

                  <div className="doctor-card__meta">
                    <div className="doctor-card__meta-item">
                      <Text type="secondary" className="doctor-card__meta-label">Chuyên khoa</Text>
                      <Text strong className="doctor-card__meta-value">{specialization}</Text>
                    </div>
                    <div className="doctor-card__meta-item">
                      <Text type="secondary" className="doctor-card__meta-label">Kinh nghiệm</Text>
                      <Text strong className="doctor-card__meta-value">{experience}+ năm</Text>
                    </div>
                    <div className="doctor-card__meta-item">
                      <Text type="secondary" className="doctor-card__meta-label">Trạng thái</Text>
                      <Tag color="green" icon={<CheckCircleOutlined />}>Đang làm việc</Tag>
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* Actions */}
                <div className="doctor-card__actions">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    block
                    onClick={() => setIsEditing(true)}
                    className="doctor-card__btn-edit"
                    style={{ marginBottom: 8 }}
                  >
                    Chỉnh sửa hồ sơ
                  </Button>
                  <Button
                    icon={<LockOutlined />}
                    block
                    onClick={handleChangePassword}
                    style={{ marginBottom: 8 }}
                  >
                    Đổi mật khẩu
                  </Button>
                  <Button
                    danger
                    icon={<LogoutOutlined />}
                    block
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </Button>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* ===== CENTER COLUMN: Info + Details ===== */}
          <Col xs={24} lg={12}>
            {!isEditing ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                {/* About Card */}
                <Card className="profile-info-card" bordered={false} style={{ marginBottom: 20 }}>
                  <div className="profile-info-card__header">
                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>About</Text>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => setIsEditing(true)}
                      className="profile-info-card__edit-btn"
                    >
                      Chỉnh sửa
                    </Button>
                  </div>
                  <Paragraph className="profile-info-card__about" style={{ color: '#555', marginBottom: 20 }}>
                    {user.professionalInfo?.bio ||
                      `Bác sĩ chuyên khoa ${specialization}, công tác tại ${department}. Với ${experience} năm kinh nghiệm trong lĩnh vực y tế.`}
                  </Paragraph>

                  {/* Info grid */}
                  <div className="profile-detail-grid">
                    <div className="profile-detail-item">
                      <Text type="secondary" className="profile-detail-label">
                        <BankOutlined /> Phòng ban
                      </Text>
                      <Text strong className="profile-detail-value">{department}</Text>
                    </div>
                    <div className="profile-detail-item">
                      <Text type="secondary" className="profile-detail-label">
                        <PhoneOutlined /> Điện thoại
                      </Text>
                      <Text strong className="profile-detail-value">{user.personalInfo?.phone || 'N/A'}</Text>
                    </div>
                    <div className="profile-detail-item">
                      <Text type="secondary" className="profile-detail-label">
                        <MailOutlined /> Email
                      </Text>
                      <Text strong className="profile-detail-value">{user.email}</Text>
                    </div>
                    <div className="profile-detail-item">
                      <Text type="secondary" className="profile-detail-label">
                        <CalendarOutlined /> Ngày vào làm
                      </Text>
                      <Text strong className="profile-detail-value">
                        {user.professionalInfo?.hireDate
                          ? dayjs(user.professionalInfo.hireDate).format('DD MMMM YYYY')
                          : 'N/A'}
                      </Text>
                    </div>
                    <div className="profile-detail-item">
                      <Text type="secondary" className="profile-detail-label">
                        <UserOutlined /> Giới tính
                      </Text>
                      <Text strong className="profile-detail-value">
                        {user.personalInfo?.gender === 'male' ? 'Nam' :
                         user.personalInfo?.gender === 'female' ? 'Nữ' :
                         user.personalInfo?.gender || 'N/A'}
                      </Text>
                    </div>
                    <div className="profile-detail-item">
                      <Text type="secondary" className="profile-detail-label">
                        <EnvironmentOutlined /> Địa chỉ
                      </Text>
                      <Text strong className="profile-detail-value">{address}</Text>
                    </div>
                    <div className="profile-detail-item">
                      <Text type="secondary" className="profile-detail-label">
                        <IdcardOutlined /> Chứng chỉ hành nghề
                      </Text>
                      <Text strong className="profile-detail-value">{licenseNumber}</Text>
                    </div>
                    <div className="profile-detail-item">
                      <Text type="secondary" className="profile-detail-label">
                        <CalendarOutlined /> Ngày sinh
                      </Text>
                      <Text strong className="profile-detail-value">
                        {user.personalInfo?.dateOfBirth
                          ? dayjs(user.personalInfo.dateOfBirth).format('DD/MM/YYYY')
                          : 'N/A'}
                      </Text>
                    </div>
                  </div>
                </Card>

                {/* Professional Skills */}
                <Card className="profile-info-card" bordered={false}>
                  <div className="profile-info-card__header">
                    <Title level={5} style={{ margin: 0 }}>Thông tin chuyên môn</Title>
                  </div>
                  <div style={{ padding: '12px 0' }}>
                    <div className="skill-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text>Chuyên khoa: {specialization}</Text>
                        <Text type="secondary">{experience > 10 ? '95%' : experience > 5 ? '80%' : '65%'}</Text>
                      </div>
                      <Progress
                        percent={experience > 10 ? 95 : experience > 5 ? 80 : 65}
                        strokeColor={{ from: '#14b8a6', to: '#0891b2' }}
                        showInfo={false}
                        strokeWidth={8}
                      />
                    </div>
                    <div className="skill-item" style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text>Kinh nghiệm lâm sàng</Text>
                        <Text type="secondary">{experience}+ năm</Text>
                      </div>
                      <Progress
                        percent={Math.min(experience * 5, 100)}
                        strokeColor={{ from: '#8b5cf6', to: '#6366f1' }}
                        showInfo={false}
                        strokeWidth={8}
                      />
                    </div>
                    <div className="skill-item" style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text>Đánh giá bệnh nhân</Text>
                        <Text type="secondary">4.8 / 5.0</Text>
                      </div>
                      <Progress
                        percent={96}
                        strokeColor={{ from: '#f59e0b', to: '#ef4444' }}
                        showInfo={false}
                        strokeWidth={8}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card
                  className="profile-info-card"
                  bordered={false}
                  title={<Title level={4} style={{ margin: 0 }}>Chỉnh sửa hồ sơ</Title>}
                >
                  <Spin spinning={loading}>
                    <Form form={form} layout="vertical" onFinish={handleSaveProfile} autoComplete="off">
                      <Tabs
                        items={[
                          {
                            key: '1',
                            label: 'Thông tin cá nhân',
                            children: (
                              <>
                                <Row gutter={[16, 0]}>
                                  <Col xs={24} sm={12}>
                                    <Form.Item label="Tên" name="firstName" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                                      <Input prefix={<UserOutlined />} placeholder="Tên" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12}>
                                    <Form.Item label="Họ" name="lastName">
                                      <Input placeholder="Họ" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Row gutter={[16, 0]}>
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
                                <Row gutter={[16, 0]}>
                                  <Col xs={24} sm={12}>
                                    <Form.Item label="Giới tính" name="gender">
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
                                    <Form.Item label="Ngày sinh" name="dateOfBirth">
                                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Divider>Địa chỉ</Divider>
                                <Form.Item label="Đường" name="street">
                                  <Input prefix={<HomeOutlined />} placeholder="Tên đường" />
                                </Form.Item>
                                <Row gutter={[16, 0]}>
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
                                <Row gutter={[16, 0]}>
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
                                  <Input prefix={<IdcardOutlined />} disabled />
                                </Form.Item>
                                <Form.Item label="Chuyên khoa" name="specialization">
                                  <Input disabled />
                                </Form.Item>
                                <Form.Item label="Phòng ban" name="department">
                                  <Input prefix={<BankOutlined />} disabled />
                                </Form.Item>
                                <Form.Item label="Chức vụ" name="position">
                                  <Input disabled />
                                </Form.Item>
                                <Row gutter={[16, 0]}>
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
                                <p style={{ color: '#888', fontSize: 13 }}>
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
                        <Button onClick={() => setIsEditing(false)}>Hủy</Button>
                      </Space>
                    </Form>
                  </Spin>
                </Card>
              </motion.div>
            )}
          </Col>

          {/* ===== RIGHT COLUMN: Stats + Feedback ===== */}
          <Col xs={24} lg={6}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              {/* Performance */}
              <Card className="stats-card" bordered={false} style={{ marginBottom: 16 }}>
                <div className="stats-card__header">
                  <Text strong>Hiệu suất</Text>
                </div>
                <div className="stats-card__gauge">
                  <Progress
                    type="dashboard"
                    percent={88}
                    strokeColor={{ '0%': '#14b8a6', '100%': '#0ea5e9' }}
                    strokeWidth={10}
                    gapDegree={75}
                    format={(p) => (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{p}%</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Hài lòng</div>
                      </div>
                    )}
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ color: '#14b8a6', fontWeight: 600, fontSize: 13 }}>
                    <RiseOutlined /> +0.5%
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>Tăng so với tháng trước</Text>
                </div>
              </Card>

              {/* Total Appointments */}
              <Card className="stats-card" bordered={false} style={{ marginBottom: 16 }}>
                <div className="stats-card__header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ color: '#14b8a6' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>Tổng lịch hẹn</Text>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 8 }}>
                  <Title level={2} style={{ margin: 0, color: '#1e293b' }}>620</Title>
                  <Tag color="green" icon={<RiseOutlined />}>+9%</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>so với tháng trước</Text>
              </Card>

              {/* Total Patients */}
              <Card className="stats-card" bordered={false} style={{ marginBottom: 16 }}>
                <div className="stats-card__header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TeamOutlined style={{ color: '#8b5cf6' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>Tổng bệnh nhân</Text>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 8 }}>
                  <Title level={2} style={{ margin: 0, color: '#1e293b' }}>410</Title>
                  <Tag color="green" icon={<RiseOutlined />}>+6%</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>so với quý trước</Text>
              </Card>

              {/* Feedback */}
              <Card className="stats-card" bordered={false}>
                <div className="stats-card__header" style={{ marginBottom: 12 }}>
                  <Text strong>Phản hồi bệnh nhân</Text>
                </div>

                {[
                  { name: 'Nguyễn Văn A', rating: 4.8, text: 'Bác sĩ giải thích rõ ràng, tận tình và chu đáo, rất hài lòng!', date: '12 tháng 3, 2025' },
                  { name: 'Trần Thị B', rating: 5, text: 'Thái độ chuyên nghiệp, chẩn đoán chính xác, điều trị hiệu quả.', date: '10 tháng 3, 2025' },
                  { name: 'Lê Văn C', rating: 4.9, text: 'Rất hài lòng với cách khám và tư vấn của bác sĩ.', date: '8 tháng 3, 2025' },
                ].map((fb, i) => (
                  <div key={i} className="feedback-item">
                    <div className="feedback-item__header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar size={32} style={{ background: ['#14b8a6', '#8b5cf6', '#f59e0b'][i] }}>
                          {fb.name[0]}
                        </Avatar>
                        <div>
                          <Text strong style={{ fontSize: 13 }}>{fb.name}</Text>
                          <div>
                            <StarFilled style={{ color: '#f59e0b', fontSize: 11 }} />
                            <Text style={{ fontSize: 12, marginLeft: 4 }}>{fb.rating}</Text>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', margin: '6px 0 4px' }}>
                      {fb.text}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#14b8a6' }}>{fb.date}</Text>
                    {i < 2 && <Divider style={{ margin: '10px 0' }} />}
                  </div>
                ))}
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>
    </DoctorLayout>
  );
};

export default DoctorProfile;
