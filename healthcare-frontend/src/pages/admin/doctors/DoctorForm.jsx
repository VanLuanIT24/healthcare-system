import {
  ArrowLeftOutlined,
  DeleteOutlined,
  LoadingOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Spin,
  Table,
  Upload
} from 'antd';
import App from 'antd/es/app';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/layout/admin/AdminLayout';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';
import { departmentAPI } from '../../../services/api/departmentAPI';
import { doctorAPI } from '../../../services/api/doctorAPI';

const DoctorForm = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { message: msg } = App.useApp();
  const [form] = Form.useForm();

  // States
  const [loading, setLoading] = useState(!!doctorId);
  const [submitting, setSubmitting] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [newCert, setNewCert] = useState({ name: '', year: '', issuer: '' });
  const [departments, setDepartments] = useState([]);

  const isEdit = !!doctorId;

  // Load departments from API
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await departmentAPI.getDepartments();
        const depts = res.data?.data || res.data || [];
        const formattedDepts = depts.map(d => ({
          value: d._id,
          label: `${d.name} (${d.code || 'N/A'})`
        }));
        setDepartments(formattedDepts);
      } catch (err) {
        console.error('Error loading departments:', err);
        // Fallback - empty array
      }
    };
    loadDepartments();
  }, []);

  // Load doctor data khi edit
  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    const loadDoctor = async () => {
      try {
        const res = await doctorAPI.getDoctorById(doctorId);
        const doc = res.data?.data;
        if (!doc) {
          msg.error('Không tìm thấy bác sĩ');
          navigate('/admin/doctors');
          return;
        }

        setDoctor(doc);

        // Set form values
        form.setFieldsValue({
          firstName: doc.firstName || doc.personalInfo?.firstName,
          lastName: doc.lastName || doc.personalInfo?.lastName,
          email: doc.email,
          phone: doc.phone || doc.personalInfo?.phone,
          gender: doc.gender || doc.personalInfo?.gender,
          dateOfBirth: doc.dateOfBirth || doc.personalInfo?.dateOfBirth ? dayjs(doc.dateOfBirth || doc.personalInfo?.dateOfBirth) : null,
          address: doc.address || doc.personalInfo?.address?.street,
          city: doc.city || doc.personalInfo?.address?.city,
          zipCode: doc.zipCode || doc.personalInfo?.address?.zipCode,
          specialization: doc.professionalInfo?.specialization,
          departmentId: doc.departmentId || doc.professionalInfo?.department,
          yearsOfExperience: doc.yearsOfExperience || doc.professionalInfo?.yearsOfExperience,
          bio: doc.bio
        });

        // Set certificates
        setCertificates(doc.certificates || []);
      } catch (err) {
        msg.error('Lỗi tải dữ liệu bác sĩ');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [doctorId, form, msg, navigate]);

  // Handle add extra specialty
  // Handle add certificate
  const handleAddCert = () => {
    if (!newCert.name || !newCert.year) {
      msg.warning('Vui lòng điền tên và năm cấp');
      return;
    }

    setCertificates([...certificates, { ...newCert, _id: Date.now() }]);
    setNewCert({ name: '', year: '', issuer: '' });
  };

  const handleRemoveCert = (id) => {
    setCertificates(certificates.filter(c => c._id !== id));
  };

  // Handle avatar upload
  const handleAvatarChange = (info) => {
    const file = info.fileList[0]?.originFileObj;
    if (file) {
      setAvatarFile(file);
    }
  };

  // Submit form
  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      const doctorData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth?.toISOString(),
        address: values.address,
        city: values.city,
        zipCode: values.zipCode,
        departmentId: values.departmentId,
        yearsOfExperience: values.yearsOfExperience,
        bio: values.bio,
        professionalInfo: {
          specialization: values.specialization,
          department: values.departmentId,
          yearsOfExperience: values.yearsOfExperience
        },
        certificates: certificates.map(c => ({
          name: c.name,
          year: c.year,
          issuer: c.issuer
        }))
      };

      if (avatarFile) {
        const formData = new FormData();
        Object.keys(doctorData).forEach(key => {
          if (Array.isArray(doctorData[key])) {
            formData.append(key, JSON.stringify(doctorData[key]));
          } else if (doctorData[key] !== null && doctorData[key] !== undefined) {
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

      msg.success(isEdit ? 'Cập nhật bác sĩ thành công' : 'Thêm bác sĩ mới thành công');
      setTimeout(() => {
        navigate('/admin/doctors');
      }, 500);
    } catch (err) {
      msg.error(err.response?.data?.message || 'Có lỗi xảy ra');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} />} />
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

        <Card title={isEdit ? '✏️ Chỉnh sửa bác sĩ' : '➕ Thêm bác sĩ mới'}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            {/* ========== THÔNG TIN CƠ BẢN ========== */}
            <Divider orientation="left">📋 Thông tin cơ bản</Divider>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
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
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Tên"
                  name="firstName"
                  rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Họ"
                  name="lastName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
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
                <Form.Item label="Điện thoại" name="phone">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Giới tính" name="gender">
                  <CustomSelect
                    options={[
                      { label: 'Nam', value: 'MALE' },
                      { label: 'Nữ', value: 'FEMALE' },
                      { label: 'Khác', value: 'OTHER' }
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Ngày sinh" name="dateOfBirth">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Địa chỉ" name="address">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Thành phố" name="city">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Mã zip" name="zipCode">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            {/* ========== THÔNG TIN CHUYÊN MÔN ========== */}
            <Divider orientation="left">🏆 Thông tin chuyên môn</Divider>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Chuyên khoa"
                  name="specialization"
                >
                  <Input placeholder="Nhập chuyên khoa (vd: Tim mạch, Ngoại khoa...)" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Khoa"
                  name="departmentId"
                  rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
                >
                  <CustomSelect
                    placeholder="Chọn khoa"
                    options={departments}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Năm kinh nghiệm" name="yearsOfExperience">
                  <InputNumber min={0} max={100} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="Bio" name="bio">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>

            {/* ========== CHỨNG CHỈ ========== */}
            <Divider orientation="left">📜 Chứng chỉ / Bằng cấp</Divider>
            <Card style={{ marginBottom: '16px' }}>
              <Row gutter={[12, 12]} style={{ marginBottom: '16px' }}>
                <Col xs={24} sm={8}>
                  <Input
                    placeholder="Tên chứng chỉ"
                    value={newCert.name}
                    onChange={e => setNewCert({ ...newCert, name: e.target.value })}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <InputNumber
                    min={1900}
                    max={2100}
                    placeholder="Năm"
                    style={{ width: '100%' }}
                    value={newCert.year || ''}
                    onChange={e => setNewCert({ ...newCert, year: e })}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Input
                    placeholder="Nơi cấp"
                    value={newCert.issuer}
                    onChange={e => setNewCert({ ...newCert, issuer: e.target.value })}
                  />
                </Col>
              </Row>
              <Button onClick={handleAddCert} style={{ marginBottom: '16px' }}>
                ➕ Thêm chứng chỉ
              </Button>

              {certificates.length > 0 && (
                <Table
                  dataSource={certificates}
                  columns={[
                    {
                      title: 'STT',
                      key: 'index',
                      width: 60,
                      render: (_, __, index) => index + 1
                    },
                    { title: 'Tên chứng chỉ', dataIndex: 'name' },
                    { title: 'Năm', dataIndex: 'year', width: 80 },
                    { title: 'Nơi cấp', dataIndex: 'issuer' },
                    {
                      title: 'Hành động',
                      key: 'action',
                      width: 100,
                      render: (_, record) => (
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveCert(record._id)}
                        >
                          Xóa
                        </Button>
                      )
                    }
                  ]}
                  rowKey="_id"
                  pagination={false}
                />
              )}
            </Card>

            {/* ========== SUBMIT ========== */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                size="large"
                block
              >
                {isEdit ? '💾 Cập nhật bác sĩ' : '➕ Thêm bác sĩ mới'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </AdminLayout>
  );
};

export default DoctorForm;
