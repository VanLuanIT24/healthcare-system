// 👤 User Create/Edit Form
import {
    ArrowLeftOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    SaveOutlined,
    UploadOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    message,
    Radio,
    Row,
    Select,
    Upload,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROLE_LABELS, ROLES } from '../../constants/roles';
import userAPI from '../../services/api/userAPI';
import './UserManagement.css';

const { Option } = Select;
const { TextArea } = Input;

const UserForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await userAPI.getUserById(id);
      const user = response.data;
      form.setFieldsValue({
        ...user,
        dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth) : null,
      });
      setAvatarUrl(user.profilePicture);
    } catch (error) {
      message.error('Không thể tải thông tin người dùng');
      navigate('/users');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
      };

      if (isEdit) {
        await userAPI.updateUser(id, formData);
        message.success('Cập nhật người dùng thành công');
      } else {
        await userAPI.createUser(formData);
        message.success('Thêm người dùng thành công');
      }
      navigate('/users');
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const response = await userAPI.uploadAvatar(id || 'temp', formData);
      setAvatarUrl(response.data.avatarUrl);
      message.success('Tải ảnh đại diện thành công');
    } catch (error) {
      message.error('Tải ảnh thất bại');
    }
    return false; // Prevent default upload
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/users')}
            style={{ marginBottom: 8 }}
          >
            Quay lại
          </Button>
          <h1 className="page-title">
            {isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </h1>
        </div>
      </div>

      <Card>
        {!isEdit && (
          <div className="avatar-upload-section">
            <Avatar size={100} src={avatarUrl} icon={<UserOutlined />} className="avatar-preview" />
            <Upload beforeUpload={handleUpload} showUploadList={false}>
              <Button icon={<UploadOutlined />}>Tải ảnh đại diện</Button>
            </Upload>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            role: 'PATIENT',
            status: 'active',
            gender: 'male',
          }}
        >
          <div className="form-section">
            <h3 className="form-section-title">Thông tin đăng nhập</h3>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="example@email.com" />
                </Form.Item>
              </Col>

              {!isEdit && (
                <Col xs={24} md={12}>
                  <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu' },
                      { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="******" />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Thông tin cá nhân</h3>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="firstName"
                  label="Họ"
                  rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                >
                  <Input placeholder="Nguyễn" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="lastName"
                  label="Tên"
                  rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                >
                  <Input placeholder="Văn A" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="gender" label="Giới tính">
                  <Radio.Group>
                    <Radio value="male">Nam</Radio>
                    <Radio value="female">Nữ</Radio>
                    <Radio value="other">Khác</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="dateOfBirth" label="Ngày sinh">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày sinh"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="0123456789" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item name="address" label="Địa chỉ">
                  <TextArea rows={2} placeholder="Nhập địa chỉ..." />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Thông tin công việc</h3>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="role"
                  label="Vai trò"
                  rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                >
                  <Select placeholder="Chọn vai trò">
                    {Object.keys(ROLES).map((key) => (
                      <Option key={key} value={ROLES[key]}>
                        {ROLE_LABELS[key]}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="position" label="Chức vụ">
                  <Input placeholder="Ví dụ: Bác sĩ tim mạch" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="department" label="Khoa">
                  <Input placeholder="Ví dụ: Khoa tim mạch" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="status" label="Trạng thái">
                  <Select>
                    <Option value="active">Hoạt động</Option>
                    <Option value="inactive">Không hoạt động</Option>
                    <Option value="locked">Bị khóa</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="form-actions">
            <Button size="large" onClick={() => navigate('/users')}>
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              {isEdit ? 'Cập nhật' : 'Thêm người dùng'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default UserForm;
