// src/pages/admin/users/UserEdit.jsx - Chỉnh sửa thông tin user
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { userAPI } from '@/services/api';
import {
  ArrowLeftOutlined,
  LoadingOutlined,
  SaveOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Spin,
  Upload,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';

const UserEdit = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Load user detail for prefill
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
          firstName: userData.personalInfo?.firstName || '',
          lastName: userData.personalInfo?.lastName || '',
          email: userData.email,
          phone: userData.personalInfo?.phone || '',
          gender: userData.personalInfo?.gender || '',
          dateOfBirth: userData.personalInfo?.dateOfBirth,
          address: userData.personalInfo?.address?.street || '',
          city: userData.personalInfo?.address?.city || '',
          state: userData.personalInfo?.address?.state || '',
          country: userData.personalInfo?.address?.country || '',
          zipCode: userData.personalInfo?.address?.zipCode || '',
        };

        setUser(normalizedUser);

        // Prefill form
        form.setFieldsValue({
          name: normalizedUser.name,
          email: normalizedUser.email,
          phone: normalizedUser.phone,
          gender: normalizedUser.gender,
          dateOfBirth: normalizedUser.dateOfBirth
            ? dayjs(normalizedUser.dateOfBirth)
            : null,
          address: normalizedUser.address,
          city: normalizedUser.city,
          zipCode: normalizedUser.zipCode,
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
  }, [userId]);

  // Handle form submit
  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      const updateData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth?.toISOString(),
        address: values.address,
        city: values.city,
        zipCode: values.zipCode,
      };

      // Add avatar if file selected
      if (avatarFile) {
        const formData = new FormData();
        Object.keys(updateData).forEach((key) => {
          formData.append(key, updateData[key]);
        });
        formData.append('avatar', avatarFile);

        const res = await userAPI.updateUser(userId, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Update user state with new data including avatar
        if (res.data?.data) {
          const normalizedUser = {
            ...res.data.data,
            name: res.data.data.name || `${res.data.data.personalInfo?.firstName || ''} ${res.data.data.personalInfo?.lastName || ''}`.trim(),
          };
          setUser(normalizedUser);
          setAvatarFile(null); // Clear avatar file from state
        }
      } else {
        const res = await userAPI.updateUser(userId, updateData);
        if (res.data?.data) {
          const normalizedUser = {
            ...res.data.data,
            name: res.data.data.name || `${res.data.data.personalInfo?.firstName || ''} ${res.data.data.personalInfo?.lastName || ''}`.trim(),
          };
          setUser(normalizedUser);
        }
      }

      message.success('Cập nhật thông tin thành công');
      setTimeout(() => navigate(`/admin/users/${userId}`), 1000);
    } catch (error) {
      console.error('Error updating user:', error);
      message.error(
        error.response?.data?.message || 'Lỗi khi cập nhật thông tin'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = ({ file }) => {
    if (file.status === 'done' || file.originFileObj) {
      setAvatarFile(file.originFileObj || file);
      message.success('Avatar được chọn');
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
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Back Button */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/admin/users/${userId}`)}
          style={{ marginBottom: '20px' }}
        >
          Quay lại
        </Button>

        {/* Edit Form */}
        <Card
          title={`✏️ Chỉnh sửa thông tin ${user?.name}`}
          style={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            borderTop: '4px solid #f093fb'
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Họ tên"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập họ tên',
                    },
                  ]}
                >
                  <Input placeholder="Nhập họ tên" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                  ]}
                >
                  <Input placeholder="Nhập email" disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { pattern: /^[0-9\-\+\s]*$/, message: 'Số điện thoại không hợp lệ' },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giới tính"
                  name="gender"
                >
                  <CustomSelect
                    placeholder="Chọn giới tính"
                    options={[
                      { value: 'male', label: 'Nam' },
                      { value: 'female', label: 'Nữ' },
                      { value: 'other', label: 'Khác' },
                    ]}
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Ngày sinh"
                  name="dateOfBirth"
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày sinh"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Avatar"
                  name="avatar"
                >
                  <div>
                    <Upload
                      maxCount={1}
                      accept="image/*"
                      onChange={handleAvatarChange}
                      beforeUpload={() => false}
                      listType="picture-card"
                      showUploadList={true}
                    >
                      {!avatarFile && !user?.personalInfo?.profilePicture && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                        </div>
                      )}
                    </Upload>

                    {/* Preview current avatar from database */}
                    {!avatarFile && user?.personalInfo?.profilePicture && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '12px', marginBottom: '8px' }}>Ảnh hiện tại:</div>
                        <img
                          src={`/uploads/profiles/${user.personalInfo.profilePicture}`}
                          alt="current avatar"
                          style={{
                            maxHeight: '120px',
                            maxWidth: '120px',
                            borderRadius: '8px',
                            border: '1px solid #ddd'
                          }}
                        />
                      </div>
                    )}

                    {/* Preview selected avatar */}
                    {avatarFile && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '12px', marginBottom: '8px' }}>Ảnh mới:</div>
                        <img
                          src={URL.createObjectURL(avatarFile)}
                          alt="new preview"
                          style={{
                            maxHeight: '120px',
                            maxWidth: '120px',
                            borderRadius: '8px',
                            border: '1px solid #ddd'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Địa chỉ"
              name="address"
            >
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>

            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Thành phố"
                  name="city"
                >
                  <Input placeholder="Nhập thành phố" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Mã bưu chính"
                  name="zipCode"
                >
                  <Input placeholder="Nhập mã bưu chính" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={submitting}
                style={{ marginRight: '12px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: 'none', fontWeight: 'bold' }}
              >
                💾 Lưu lại
              </Button>
              <Button
                onClick={() => navigate(`/admin/users/${userId}`)}
              >
                ❌ Hủy
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UserEdit;
