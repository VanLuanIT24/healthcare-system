// 📝 Patient Registration Form
import {
    IdcardOutlined,
    MedicineBoxOutlined,
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
    Steps,
    Upload,
} from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import patientAPI from '../../services/api/patientAPI';
import './PatientManagement.css';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

const PatientRegister = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Thông tin cơ bản',
      icon: <UserOutlined />,
    },
    {
      title: 'Thông tin liên hệ',
      icon: <IdcardOutlined />,
    },
    {
      title: 'Thông tin y tế',
      icon: <MedicineBoxOutlined />,
    },
  ];

  const next = () => {
    form
      .validateFields()
      .then(() => {
        setCurrent(current + 1);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const patientData = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
        profilePicture: avatarUrl,
      };

      const response = await patientAPI.registerPatient(patientData);
      message.success('Đăng ký bệnh nhân thành công');
      navigate(`/patients/${response.data._id}`);
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <>
            <div className="avatar-upload-section">
              <Avatar size={100} src={avatarUrl} icon={<UserOutlined />} />
              <Upload
                beforeUpload={() => false}
                showUploadList={false}
                style={{ marginTop: 16 }}
              >
                <Button icon={<UploadOutlined />}>Tải ảnh đại diện</Button>
              </Upload>
            </div>

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
                  name="middleName"
                  label="Tên đệm"
                >
                  <Input placeholder="Văn" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="lastName"
                  label="Tên"
                  rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                >
                  <Input placeholder="A" />
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
                <Form.Item name="idNumber" label="Số CCCD/CMND">
                  <Input placeholder="Nhập số CCCD/CMND" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="nationalId" label="Số hộ chiếu (nếu có)">
                  <Input placeholder="Nhập số hộ chiếu" />
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
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
                  ]}
                >
                  <Input placeholder="0123456789" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                >
                  <Input placeholder="example@email.com" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="address"
                  label="Địa chỉ"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                >
                  <TextArea rows={2} placeholder="Nhập địa chỉ đầy đủ" />
                </Form.Item>
              </Col>
            </Row>

            <h3 className="form-section-title">Người liên hệ khẩn cấp</h3>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name={['emergencyContact', 'name']} label="Họ và tên">
                  <Input placeholder="Nguyễn Văn B" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={['emergencyContact', 'relationship']} label="Quan hệ">
                  <Input placeholder="Vợ/Chồng, Con, Anh/Chị..." />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name={['emergencyContact', 'phone']} label="Số điện thoại">
                  <Input placeholder="0123456789" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={['emergencyContact', 'address']} label="Địa chỉ">
                  <Input placeholder="Địa chỉ người liên hệ" />
                </Form.Item>
              </Col>
            </Row>
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
                  <Input type="number" placeholder="170" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="weight" label="Cân nặng (kg)">
                  <Input type="number" placeholder="65" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item name="allergies" label="Dị ứng">
                  <TextArea
                    rows={2}
                    placeholder="Mô tả các dị ứng (thuốc, thực phẩm, v.v.)"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item name="medicalHistory" label="Tiền sử bệnh">
                  <TextArea
                    rows={3}
                    placeholder="Mô tả các bệnh đã từng mắc, phẫu thuật..."
                  />
                </Form.Item>
              </Col>
            </Row>

            <h3 className="form-section-title">Thông tin bảo hiểm</h3>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name={['insurance', 'provider']} label="Nhà cung cấp BH">
                  <Input placeholder="BHYT, BHXH..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={['insurance', 'policyNumber']} label="Số thẻ BH">
                  <Input placeholder="Nhập số thẻ bảo hiểm" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name={['insurance', 'expiryDate']} label="Ngày hết hạn">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-container register-form-container">
      <Card>
        <h1 className="page-title" style={{ marginBottom: 24 }}>
          Đăng ký bệnh nhân mới
        </h1>

        <Steps current={current}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} icon={item.icon} />
          ))}
        </Steps>

        <div className="step-content">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              gender: 'male',
            }}
          >
            {renderStepContent()}
          </Form>
        </div>

        <div className="form-actions" style={{ marginTop: 24 }}>
          {current > 0 && (
            <Button onClick={prev} size="large">
              Quay lại
            </Button>
          )}
          {current < steps.length - 1 && (
            <Button type="primary" onClick={next} size="large">
              Tiếp theo
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
            >
              Hoàn tất đăng ký
            </Button>
          )}
          <Button onClick={() => navigate('/patients')} size="large">
            Hủy
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PatientRegister;
