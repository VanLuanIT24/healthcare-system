import {
    ArrowLeftOutlined,
    HomeOutlined,
    MailOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    SaveOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Row,
    Select,
    Space,
    Steps,
    Typography
} from 'antd';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreatePatient = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Thông tin cá nhân' },
    { title: 'Thông tin bảo hiểm' },
    { title: 'Thông tin y tế' }
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // 🎯 SỬ DỤNG API ĐĂNG KÝ MỚI VỚI VALIDATION ĐẦY ĐỦ
      const registrationData = {
        // Thông tin user
        email: values.email,
        password: values.password || 'Patient@123',
        
        // Thông tin cá nhân
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
        gender: values.gender,
        phone: values.phone,
        
        // Địa chỉ
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country || 'Vietnam'
        },
        
        // CMND/CCCD - SẼ ĐƯỢC VALIDATE UNIQUE
        identityCard: values.identityCard,
        
        // Liên hệ khẩn cấp
        emergencyContact: {
          name: values.emergencyContactName,
          phone: values.emergencyContactPhone,
          relationship: values.emergencyContactRelationship || 'FAMILY'
        },
        
        // Thông tin y tế
        bloodType: values.bloodType,
        height: values.height,
        weight: values.weight,
        
        // Dị ứng
        allergies: values.allergies ? values.allergies.split(',').map(a => ({
          allergen: a.trim(),
          severity: 'MILD',
          reaction: 'Chưa xác định',
          isActive: true
        })) : [],
        
        // Bệnh mạn tính
        chronicConditions: values.chronicConditions ? values.chronicConditions.split(',').map(c => ({
          condition: c.trim(),
          diagnosedDate: new Date(),
          status: 'ACTIVE'
        })) : [],
        
        // Bảo hiểm - SỐ THẺ SẼ ĐƯỢC VALIDATE UNIQUE
        insurance: {
          provider: values.insuranceProvider,
          policyNumber: values.policyNumber,
          groupNumber: values.groupNumber,
          effectiveDate: values.insuranceEffectiveDate?.format('YYYY-MM-DD'),
          expirationDate: values.insuranceExpirationDate?.format('YYYY-MM-DD'),
          verificationStatus: 'PENDING'
        }
      };

      // GỌI API ĐĂNG KÝ MỚI - TỰ ĐỘNG TẠO MÃ BỆNH NHÂN
      const response = await axios.post(
        `${API_BASE_URL}/patients/register`,
        registrationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // XỬ LÝ RESPONSE
      if (response.data.success || response.data.patient) {
        const patient = response.data.patient || response.data.data;
        message.success(
          `Đăng ký bệnh nhân thành công! Mã BN: ${patient.patientId || patient.patientCode}`
        );
        navigate('/admin/patients');
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Create patient error:', error);
      
      // HIỂN THỊ LỖI CHI TIẾT
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Không thể đăng ký bệnh nhân';
      
      // NẾU LÀ LỖI VALIDATION
      if (error.response?.status === 400) {
        message.error(errorMessage, 5);
      } else {
        message.error(errorMessage);
      }
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
                  name="dateOfBirth"
                  label="Ngày sinh"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày sinh"
                  />
                </Form.Item>
              </Col>
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
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="identityCard"
                  label="CCCD/CMND"
                  rules={[
                    { required: true, message: 'Vui lòng nhập CCCD/CMND' },
                    { 
                      pattern: /^\d{9,12}$/, 
                      message: 'CMND (9 số) hoặc CCCD (12 số)' 
                    }
                  ]}
                  extra="Sẽ được kiểm tra trùng lặp với hệ thống"
                >
                  <Input 
                    prefix={<SafetyCertificateOutlined />} 
                    placeholder="001234567890" 
                    maxLength={12}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^0\d{9}$/, message: 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)' }
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="0123456789" maxLength={10} />
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
                  <Input prefix={<MailOutlined />} placeholder="patient@example.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu (để trống sẽ dùng mặc định)"
                >
                  <Input.Password placeholder="Mật khẩu tạm thời" />
                </Form.Item>
              </Col>
            </Row>

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
                <Form.Item name="state" label="Quận/Huyện">
                  <Input placeholder="Quận 1" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="emergencyContactName" label="Người liên hệ khẩn cấp">
                  <Input prefix={<UserOutlined />} placeholder="Họ tên" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="emergencyContactPhone" label="SĐT khẩn cấp">
                  <Input prefix={<PhoneOutlined />} placeholder="0987654321" />
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      case 1:
        return (
          <>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="insuranceProvider"
                  label="Nhà cung cấp bảo hiểm"
                  extra="Thông tin không bắt buộc"
                >
                  <Select placeholder="Chọn nhà cung cấp" allowClear>
                    <Option value="BHYT">Bảo hiểm y tế (BHYT)</Option>
                    <Option value="BHTN">Bảo hiểm tư nhân</Option>
                    <Option value="PRUDENTIAL">Prudential</Option>
                    <Option value="BAOVIET">Bảo Việt</Option>
                    <Option value="OTHER">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="policyNumber"
                  label="Số thẻ bảo hiểm"
                  rules={[
                    {
                      pattern: /^[A-Z0-9\-]{10,20}$/,
                      message: 'Số thẻ BHYT không hợp lệ'
                    }
                  ]}
                  extra="Sẽ được kiểm tra trùng lặp. Ví dụ: VN1234567890123"
                >
                  <Input 
                    prefix={<SafetyCertificateOutlined />} 
                    placeholder="VN1234567890123" 
                    maxLength={20}
                    style={{ textTransform: 'uppercase' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="groupNumber" label="Mã nhóm">
                  <Input placeholder="GR-001" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="insuranceEffectiveDate" label="Ngày hiệu lực">
                  <DatePicker 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="insuranceExpirationDate" label="Ngày hết hạn">
                  <DatePicker 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                  />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ background: '#f0f2f5', padding: 16, borderRadius: 8, marginTop: 16 }}>
              <Text type="secondary">
                💡 Lưu ý: Thông tin bảo hiểm sẽ được xác minh sau khi đăng ký
              </Text>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="bloodType" label="Nhóm máu">
                  <Select placeholder="Chọn nhóm máu">
                    <Option value="A+">A+</Option>
                    <Option value="A-">A-</Option>
                    <Option value="B+">B+</Option>
                    <Option value="B-">B-</Option>
                    <Option value="AB+">AB+</Option>
                    <Option value="AB-">AB-</Option>
                    <Option value="O+">O+</Option>
                    <Option value="O-">O-</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="height" label="Chiều cao (cm)">
                  <InputNumber 
                    style={{ width: '100%' }}
                    min={30}
                    max={250}
                    placeholder="170"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="weight" label="Cân nặng (kg)">
                  <InputNumber 
                    style={{ width: '100%' }}
                    min={2}
                    max={300}
                    placeholder="65"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="allergies"
                  label="Dị ứng (ngăn cách bởi dấu phẩy)"
                  tooltip="Ví dụ: Penicillin, Hải sản, Phấn hoa"
                >
                  <TextArea 
                    rows={2}
                    placeholder="Penicillin, Hải sản, Phấn hoa"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="chronicConditions"
                  label="Bệnh mãn tính (ngăn cách bởi dấu phẩy)"
                  tooltip="Ví dụ: Tiểu đường, Cao huyết áp"
                >
                  <TextArea 
                    rows={2}
                    placeholder="Tiểu đường, Cao huyết áp"
                  />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ background: '#e6f7ff', padding: 16, borderRadius: 8, marginTop: 16 }}>
              <Space direction="vertical">
                <Text strong>
                  <SafetyCertificateOutlined /> Thông tin bảo mật
                </Text>
                <Text type="secondary">
                  Tất cả thông tin y tế được mã hóa và bảo vệ theo tiêu chuẩn HIPAA
                </Text>
              </Space>
            </div>
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
            onClick={() => navigate('/admin/patients')}
            style={{ marginBottom: 16 }}
          >
            Quay lại
          </Button>
          <Title level={3}>Đăng ký bệnh nhân mới</Title>
          <Text type="secondary">Điền thông tin đầy đủ để đăng ký bệnh nhân</Text>
        </div>

        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {StepContent()}

          <Row justify="space-between" style={{ marginTop: 24 }}>
            <Col>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  Quay lại
                </Button>
              )}
            </Col>
            <Col>
              <Space>
                <Button onClick={() => navigate('/admin/patients')}>
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
                    Đăng ký bệnh nhân
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

export default CreatePatient;
