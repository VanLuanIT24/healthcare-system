import {
    ArrowLeftOutlined,
    HomeOutlined,
    IdcardOutlined,
    MailOutlined,
    MedicineBoxOutlined,
    PhoneOutlined,
    SaveOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    message,
    Row,
    Select,
    Space,
    Steps,
    Typography
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateStaff = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);

  const steps = [
    { title: 'Thông tin cơ bản' },
    { title: 'Thông tin liên hệ' },
    { title: 'Thông tin chuyên môn' }
  ];

  const handleRoleChange = (value) => {
    setSelectedRole(value);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Format data for API
      const staffData = {
        email: values.email,
        password: values.password,
        role: values.role,
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
          gender: values.gender,
          phone: values.phone,
          address: {
            street: values.street,
            city: values.city,
            state: values.state,
            zipCode: values.zipCode,
            country: values.country || 'Vietnam'
          },
          emergencyContact: {
            name: values.emergencyContactName,
            phone: values.emergencyContactPhone,
            relationship: values.emergencyContactRelationship
          }
        },
        professionalInfo: {}
      };

      // Add professional info based on role
      if (['DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECHNICIAN'].includes(values.role)) {
        staffData.professionalInfo = {
          licenseNumber: values.licenseNumber,
          specialization: values.specialization,
          department: values.department,
          qualifications: values.qualifications?.split(',').map(q => q.trim()),
          yearsOfExperience: values.yearsOfExperience,
          hireDate: values.hireDate?.format('YYYY-MM-DD'),
          position: values.position
        };
      }

      const response = await axios.post(
        `${API_BASE_URL}/users/create`,
        staffData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success('Tạo nhân viên thành công!');
      navigate('/admin/staff');

    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tạo nhân viên');
      console.error('Create staff error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="firstName"
                  label="Họ"
                  rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Nguyễn" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="lastName"
                  label="Tên"
                  rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Văn A" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="example@hospital.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu tạm thời"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
                  ]}
                >
                  <Input.Password placeholder="Mật khẩu tạm thời" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="role"
                  label="Vai trò"
                  rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                >
                  <Select 
                    placeholder="Chọn vai trò"
                    onChange={handleRoleChange}
                  >
                    <Option value="DOCTOR">Bác sĩ</Option>
                    <Option value="NURSE">Y tá</Option>
                    <Option value="PHARMACIST">Dược sĩ</Option>
                    <Option value="LAB_TECHNICIAN">Kỹ thuật viên xét nghiệm</Option>
                    <Option value="RECEPTIONIST">Lễ tân</Option>
                    <Option value="BILLING_STAFF">Nhân viên kế toán</Option>
                    <Option value="DEPARTMENT_HEAD">Trưởng khoa</Option>
                    <Option value="HOSPITAL_ADMIN">Quản trị viên bệnh viện</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="dateOfBirth"
                  label="Ngày sinh"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày sinh"
                    disabledDate={(current) => current && current > moment().subtract(18, 'years')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                >
                  <Select placeholder="Chọn giới tính">
                    <Option value="MALE">Nam</Option>
                    <Option value="FEMALE">Nữ</Option>
                    <Option value="OTHER">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="0123456789" />
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      case 1:
        return (
          <>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="street"
                  label="Địa chỉ"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                >
                  <Input prefix={<HomeOutlined />} placeholder="123 Đường ABC" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="city"
                  label="Thành phố"
                  rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}
                >
                  <Input placeholder="Hồ Chí Minh" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="state"
                  label="Quận/Huyện"
                >
                  <Input placeholder="Quận 1" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="zipCode"
                  label="Mã bưu điện"
                >
                  <Input placeholder="700000" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="country"
                  label="Quốc gia"
                  initialValue="Vietnam"
                >
                  <Input placeholder="Vietnam" />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Liên hệ khẩn cấp</Divider>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="emergencyContactName"
                  label="Tên người liên hệ"
                >
                  <Input prefix={<UserOutlined />} placeholder="Họ tên người thân" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="emergencyContactPhone"
                  label="Số điện thoại khẩn cấp"
                >
                  <Input prefix={<PhoneOutlined />} placeholder="0987654321" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="emergencyContactRelationship"
                  label="Mối quan hệ"
                >
                  <Select placeholder="Chọn mối quan hệ">
                    <Option value="SPOUSE">Vợ/Chồng</Option>
                    <Option value="PARENT">Cha/Mẹ</Option>
                    <Option value="CHILD">Con</Option>
                    <Option value="SIBLING">Anh/Chị/Em</Option>
                    <Option value="FRIEND">Bạn bè</Option>
                    <Option value="OTHER">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      case 2:
        return (
          <>
            {['DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECHNICIAN'].includes(selectedRole) && (
              <>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="licenseNumber"
                      label="Số giấy phép hành nghề"
                      rules={[{ required: true, message: 'Vui lòng nhập số giấy phép' }]}
                    >
                      <Input prefix={<IdcardOutlined />} placeholder="GPL-123456" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="department"
                      label="Khoa/Phòng"
                      rules={[{ required: true, message: 'Vui lòng nhập khoa/phòng' }]}
                    >
                      <Select placeholder="Chọn khoa/phòng">
                        <Option value="Cardiology">Khoa Tim mạch</Option>
                        <Option value="Neurology">Khoa Thần kinh</Option>
                        <Option value="Pediatrics">Khoa Nhi</Option>
                        <Option value="Surgery">Khoa Phẫu thuật</Option>
                        <Option value="Emergency">Khoa Cấp cứu</Option>
                        <Option value="Radiology">Khoa X-quang</Option>
                        <Option value="Laboratory">Phòng Xét nghiệm</Option>
                        <Option value="Pharmacy">Phòng Dược</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="specialization"
                      label="Chuyên môn"
                    >
                      <Input prefix={<MedicineBoxOutlined />} placeholder="Tim mạch can thiệp" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="position"
                      label="Chức vụ"
                    >
                      <Input placeholder="Trưởng khoa, Bác sĩ chính..." />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="yearsOfExperience"
                      label="Số năm kinh nghiệm"
                    >
                      <Input type="number" placeholder="5" min={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="hireDate"
                      label="Ngày bắt đầu làm việc"
                    >
                      <DatePicker 
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24}>
                    <Form.Item
                      name="qualifications"
                      label="Bằng cấp / Chứng chỉ"
                      tooltip="Nhập các bằng cấp, ngăn cách bởi dấu phẩy"
                    >
                      <TextArea 
                        rows={3}
                        placeholder="Bác sĩ đa khoa, Chứng chỉ hành nghề, Chứng chỉ chuyên khoa cấp I"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {!['DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECHNICIAN'].includes(selectedRole) && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">
                  Vai trò này không yêu cầu thông tin chuyên môn chi tiết
                </Text>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/admin/staff')}
            style={{ marginBottom: 16 }}
          >
            Quay lại
          </Button>
          <Title level={3}>Tạo nhân viên mới</Title>
          <Text type="secondary">Điền thông tin để tạo tài khoản nhân viên mới</Text>
        </div>

        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {StepContent()}

          <Divider />

          <Row justify="space-between">
            <Col>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  Quay lại
                </Button>
              )}
            </Col>
            <Col>
              <Space>
                <Button onClick={() => navigate('/admin/staff')}>
                  Hủy
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                    Tiếp theo
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Tạo nhân viên
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default CreateStaff;
