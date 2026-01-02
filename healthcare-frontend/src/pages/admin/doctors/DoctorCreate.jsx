// src/pages/admin/doctors/DoctorForm.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { departmentAPI } from '@/services/api/departmentAPI';
import { doctorAPI } from '@/services/api/doctorAPI';
import { ArrowLeftOutlined, DeleteOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button, Card,
  Col,
  Form, Input,
  InputNumber,
  Row,
  Space,
  Spin,
  Table,
  Upload,
  message
} from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';
import CustomDatePicker from '@/components/common/CustomDatePicker/CustomDatePicker';

const DoctorForm = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(!!doctorId);
  const [submitting, setSubmitting] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [newCertificate, setNewCertificate] = useState({ name: '', year: '', issuer: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [languages, setLanguages] = useState([]);

  const isEdit = !!doctorId;

  // Load filter options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Load departments from admin API
        const deptRes = await departmentAPI.getDepartments();
        const depts = deptRes.data?.data || deptRes.data || [];
        console.log('Loaded departments:', depts);
        setDepartments(depts);
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };

    loadOptions();
  }, []);

  // Load doctor if editing
  useEffect(() => {
    if (isEdit) {
      const loadDoctor = async () => {
        try {
          const res = await doctorAPI.getDoctorById(doctorId);
          if (res.data?.data) {
            const docData = res.data.data;
            setDoctor(docData);
            setCertificates(docData.certificates || []);
            setLanguages(docData.languages || []);

            form.setFieldsValue({
              firstName: docData.personalInfo?.firstName,
              lastName: docData.personalInfo?.lastName,
              email: docData.email,
              phone: docData.personalInfo?.phone,
              gender: docData.personalInfo?.gender,
              dateOfBirth: docData.personalInfo?.dateOfBirth ? dayjs(docData.personalInfo.dateOfBirth) : null,
              address: docData.personalInfo?.address?.street,
              city: docData.personalInfo?.address?.city,
              zipCode: docData.personalInfo?.address?.zipCode,
              departmentId: docData.department?._id,
              yearsOfExperience: docData.yearsOfExperience,
              bio: docData.bio,
            });
          }
        } catch (error) {
          message.error('Lỗi khi tải thông tin bác sĩ');
        } finally {
          setLoading(false);
        }
      };

      loadDoctor();
    }
  }, [doctorId, form, isEdit]);

  const handleAddCertificate = () => {
    if (!newCertificate.name || !newCertificate.year || !newCertificate.issuer) {
      message.warning('Vui lòng điền đầy đủ thông tin chứng chỉ');
      return;
    }
    setCertificates([...certificates, { ...newCertificate, id: Date.now() }]);
    setNewCertificate({ name: '', year: '', issuer: '' });
  };

  const handleRemoveCertificate = (id) => {
    setCertificates(certificates.filter(cert => cert.id !== id && cert._id !== id));
  };

  const handleAvatarChange = ({ file }) => {
    if (file.originFileObj) {
      setAvatarFile(file.originFileObj);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      let doctorData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth?.toISOString(),
        address: values.address,
        city: values.city,
        zipCode: values.zipCode,
        departmentId: values.departmentId,
        yearsOfExperience: values.yearsOfExperience,
        bio: values.bio,
        certificates: certificates.map(c => ({
          name: c.name,
          year: c.year,
          issuer: c.issuer
        })),
        languages: languages,
      };

      if (avatarFile) {
        const formData = new FormData();
        Object.keys(doctorData).forEach(key => {
          if (Array.isArray(doctorData[key])) {
            formData.append(key, JSON.stringify(doctorData[key]));
          } else {
            formData.append(key, doctorData[key]);
          }
        });
        formData.append('avatar', avatarFile);

        if (isEdit) {
          await doctorAPI.updateDoctor(doctorId, formData);
        } else {
          await doctorAPI.createDoctor(formData);
        }
      } else {
        if (isEdit) {
          await doctorAPI.updateDoctor(doctorId, doctorData);
        } else {
          await doctorAPI.createDoctor(doctorData);
        }
      }

      message.success(isEdit ? 'Cập nhật bác sĩ thành công' : 'Tạo bác sĩ mới thành công');
      navigate('/admin/doctors');
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi lưu thông tin');
    } finally {
      setSubmitting(false);
    }
  };

  const certificateColumns = [
    {
      title: 'Tên chứng chỉ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Năm cấp',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Cơ quan cấp',
      dataIndex: 'issuer',
      key: 'issuer',
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveCertificate(record._id || record.id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/doctors')}
          style={{ marginBottom: '20px' }}
        >
          Quay lại
        </Button>

        <Card
          title={isEdit ? '✏️ Chỉnh sửa bác sĩ' : '➕ Thêm bác sĩ mới'}
          style={{ borderRadius: '12px' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            {/* Ảnh đại diện */}
            <Form.Item label="Ảnh đại diện">
              <Upload
                accept="image/*"
                onChange={handleAvatarChange}
                beforeUpload={() => false}
                maxCount={1}
                listType="picture-card"
              >
                {!avatarFile && !doctor?.personalInfo?.profilePicture && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            {/* Thông tin cá nhân */}
            <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>👤 Thông tin cá nhân</h3>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Họ"
                  name="firstName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Tên"
                  name="lastName"
                  rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, type: 'email' }]}
                >
                  <Input disabled={isEdit} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    { required: !isEdit, message: 'Vui lòng nhập mật khẩu' },
                    { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' }
                  ]}
                  extra={isEdit ? 'Để trống nếu không muốn đổi mật khẩu' : 'Mặc định: Doctor@123'}
                >
                  <Input.Password placeholder={isEdit ? 'Nhập mật khẩu mới' : 'Doctor@123'} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Điện thoại"
                  name="phone"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giới tính"
                  name="gender"
                  rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                >
                  <CustomSelect
                    options={[
                      { label: 'Nam', value: 'MALE' },
                      { label: 'Nữ', value: 'FEMALE' },
                      { label: 'Khác', value: 'OTHER' },
                    ]}
                  />
                </Form.Item>

              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Ngày sinh"
                  name="dateOfBirth"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
                >
                  <CustomDatePicker 
                    placeholder="Chọn ngày sinh"
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Địa chỉ"
                  name="address"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Thành phố"
                  name="city"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Mã zip"
                  name="zipCode"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            {/* Thông tin chuyên môn */}
            <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>🏆 Thông tin chuyên môn</h3>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Khoa"
                  name="departmentId"
                  rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
                >
                  <CustomSelect
                    placeholder="Chọn khoa"
                    options={departments.map(d => ({ label: `${d.name} (${d.code || 'N/A'})`, value: d._id }))}
                  />
                </Form.Item>

              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Năm kinh nghiệm"
                  name="yearsOfExperience"
                >
                  <InputNumber min={0} max={100} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  label="Bio"
                  name="bio"
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>

            {/* Chứng chỉ */}
            <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>📜 Chứng chỉ</h3>
            <Card style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Input
                    placeholder="Tên chứng chỉ"
                    value={newCertificate.name}
                    onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Input
                    placeholder="Năm cấp"
                    value={newCertificate.year}
                    onChange={(e) => setNewCertificate({ ...newCertificate, year: e.target.value })}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Input
                    placeholder="Cơ quan cấp"
                    value={newCertificate.issuer}
                    onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
                  />
                </Col>
              </Row>
              <Button
                type="primary"
                style={{ marginTop: '12px' }}
                onClick={handleAddCertificate}
              >
                Thêm chứng chỉ
              </Button>
            </Card>

            {certificates.length > 0 && (
              <Table
                dataSource={certificates}
                columns={certificateColumns}
                pagination={false}
                rowKey={(record, idx) => record._id || record.id || idx}
                style={{ marginBottom: '24px' }}
              />
            )}

            {/* Submit */}
            <Form.Item style={{ marginTop: '24px' }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                >
                  {isEdit ? 'Cập nhật' : 'Tạo mới'}
                </Button>
                <Button
                  onClick={() => navigate('/admin/doctors')}
                  size="large"
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </AdminLayout>
  );
};

export default DoctorForm;
