// src/pages/admin/doctors/DoctorForm.jsx - Shared form component for Create/Edit
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { doctorAPI } from '@/services/api/doctorAPI';
import publicAPI from '@/services/api/publicAPI';
import { ArrowLeftOutlined, DeleteOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import {
  App,
  Button, Card,
  Col,
  DatePicker,
  Empty,
  Form, Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Upload
} from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DoctorForm = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(!!doctorId);
  const [submitting, setSubmitting] = useState(false);
  const [doctor, setDoctor] = useState(null);
  
  // Initialize with fallback data immediately
  const [specialties, setSpecialties] = useState([
    { _id: 'Bác sĩ đa khoa', name: 'Bác sĩ đa khoa' },
    { _id: 'Tim mạch', name: 'Tim mạch' },
    { _id: 'Ngoại khoa', name: 'Ngoại khoa' },
    { _id: 'Nhi khoa', name: 'Nhi khoa' },
    { _id: 'Sản phụ khoa', name: 'Sản phụ khoa' },
    { _id: 'Tâm thần', name: 'Tâm thần' },
    { _id: 'Nha khoa', name: 'Nha khoa' },
    { _id: 'Y học thể dục', name: 'Y học thể dục' }
  ]);

  const [departments, setDepartments] = useState([
    { _id: 'Khoa Nội', name: 'Khoa Nội' },
    { _id: 'Khoa Ngoại', name: 'Khoa Ngoại' },
    { _id: 'Khoa Nhi', name: 'Khoa Nhi' },
    { _id: 'Khoa Sản - Phụ khoa', name: 'Khoa Sản - Phụ khoa' },
    { _id: 'Khoa Tâm thần', name: 'Khoa Tâm thần' },
    { _id: 'Khoa Nha khoa', name: 'Khoa Nha khoa' }
  ]);

  const [certificates, setCertificates] = useState([]);
  const [newCertificate, setNewCertificate] = useState({ name: '', year: '', issuer: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [doctorSpecialties, setDoctorSpecialties] = useState([]);
  const [newSpecialty, setNewSpecialty] = useState(undefined);

  const isEdit = !!doctorId;

  // Mapping English to Vietnamese specialties/departments
  const specializationMap = {
    'CARDIOLOGY': 'Tim mạch',
    'Cardiology': 'Tim mạch',
    'GENERAL': 'Tổng quát',
    'General': 'Tổng quát',
    'General Practice': 'Y học tổng quát',
    'ORTHOPEDICS': 'Chấn thương chỉnh hình',
    'Orthopedics': 'Chấn thương chỉnh hình',
    'PEDIATRICS': 'Nhi khoa',
    'Pediatrics': 'Nhi khoa',
    'SURGERY': 'Ngoại khoa',
    'Surgery': 'Ngoại khoa'
  };

  // Convert specialty name to Vietnamese
  const translateSpecialty = (name) => {
    return specializationMap[name] || name;
  };

  // Load filter options - try to get from API, fallback already in initial state
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [specRes, deptRes] = await Promise.all([
          publicAPI.getSpecialties(),
          publicAPI.getDepartments()
        ]);

        // Handle multiple response formats
        let specs = [];
        let depts = [];

        if (Array.isArray(specRes?.data?.data)) {
          specs = specRes.data.data;
        } else if (Array.isArray(specRes?.data)) {
          specs = specRes.data;
        } else if (Array.isArray(specRes)) {
          specs = specRes;
        }

        if (Array.isArray(deptRes?.data?.data)) {
          depts = deptRes.data.data;
        } else if (Array.isArray(deptRes?.data)) {
          depts = deptRes.data;
        } else if (Array.isArray(deptRes)) {
          depts = deptRes;
        }

        // Convert string arrays to object arrays if needed
        const convertToObjects = (arr) => {
          if (!Array.isArray(arr)) {
            return [];
          }
          return arr.map((item) => {
            if (typeof item === 'string') {
              return { _id: item, name: item };
            }
            if (item && !item._id) {
              item._id = item.name || item;
            }
            if (item && !item.name) {
              item.name = item._id || item;
            }
            return item;
          }).filter(item => item);
        };

        specs = convertToObjects(specs);
        depts = convertToObjects(depts);

        // Only update if we got real data from API
        if (specs.length > 0) {
          setSpecialties(specs);
        }

        if (depts.length > 0) {
          setDepartments(depts);
        }
        
      } catch (error) {
        // Use fallback data
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
            
            // Handle specialties - could be array of objects or strings
            const specialtiesArray = docData.specialties || [];
            const formattedSpecialties = specialtiesArray.map(s => {
              if (typeof s === 'string') {
                return { _id: s, name: s };
              }
              return s;
            });
            setDoctorSpecialties(formattedSpecialties);

            // Get primary specialty from either specialties[0] or professionalInfo.specialization
            let specialtyValue = docData.professionalInfo?.specialization;
            if (docData.specialties && docData.specialties.length > 0) {
              specialtyValue = docData.specialties[0]?._id || docData.specialties[0];
            }

            const departmentValue = docData.professionalInfo?.department;

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
              specialtyId: specialtyValue,
              departmentId: departmentValue,
              yearsOfExperience: docData.yearsOfExperience || docData.professionalInfo?.yearsOfExperience,
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

  const handleAddSpecialty = () => {
    if (!newSpecialty) {
      message.warning('Vui lòng chọn chuyên khoa');
      return;
    }
    
    const isDuplicate = doctorSpecialties.some(s => {
      const sId = typeof s === 'string' ? s : (s._id || s);
      return sId === newSpecialty;
    });
    
    if (isDuplicate) {
      message.warning('Chuyên khoa này đã được thêm');
      return;
    }
    
    let specialty = specialties.find(s => {
      const specId = typeof s === 'string' ? s : (s._id || s);
      return specId === newSpecialty;
    });
    
    if (!specialty) {
      specialty = { _id: newSpecialty, name: newSpecialty };
    }
    
    setDoctorSpecialties([...doctorSpecialties, specialty]);
    setNewSpecialty(undefined);
  };

  const handleRemoveSpecialty = (specialtyId) => {
    setDoctorSpecialties(doctorSpecialties.filter(s => {
      const sId = typeof s === 'string' ? s : (s._id || s);
      return sId !== specialtyId;
    }));
  };

  const handleAvatarChange = ({ file }) => {
    if (file.originFileObj) {
      setAvatarFile(file.originFileObj);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      // Get department and specialty names from lists
      // Handle both object format and string format from API
      let deptName = values.departmentId;
      let specName = values.specialtyId;

      // If departmentId is an ID, find the name
      const selectedDept = departments.find(d => {
        if (typeof d === 'string') return d === values.departmentId;
        return d._id === values.departmentId;
      });
      if (selectedDept) {
        deptName = typeof selectedDept === 'string' ? selectedDept : selectedDept.name;
      }

      // If specialtyId is an ID, find the name
      const selectedSpec = specialties.find(s => {
        if (typeof s === 'string') return s === values.specialtyId;
        return s._id === values.specialtyId;
      });
      if (selectedSpec) {
        specName = typeof selectedSpec === 'string' ? selectedSpec : selectedSpec.name;
      }

      let doctorData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth?.toISOString(),
        address: values.address,
        city: values.city,
        zipCode: values.zipCode,
        specialtyId: values.specialtyId,
        departmentId: values.departmentId,
        // Ensure professionalInfo is saved with department and specialization
        professionalInfo: {
          department: deptName,
          specialization: specName,
          yearsOfExperience: values.yearsOfExperience
        },
        yearsOfExperience: values.yearsOfExperience,
        bio: values.bio,
        specialties: doctorSpecialties.map(s => {
          if (typeof s === 'string') {
            return { _id: s, name: s };
          }
          return { _id: s._id || s.name, name: s.name || s };
        }),
        certificates: certificates.map(c => ({
          name: c.name,
          year: c.year,
          issuer: c.issuer
        })),
      };

      let createdDoctorId = doctorId;

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
          const res = await doctorAPI.createDoctor(formData);
          createdDoctorId = res.data?.data?._id || res.data?._id;
        }
      } else {
        if (isEdit) {
          await doctorAPI.updateDoctor(doctorId, doctorData);
        } else {
          const res = await doctorAPI.createDoctor(doctorData);
          createdDoctorId = res.data?.data?._id || res.data?._id;
        }
      }

      message.success(isEdit ? 'Cập nhật bác sĩ thành công' : 'Tạo bác sĩ mới thành công');
      
      // Reload data if editing, else redirect to list
      if (isEdit) {
        // Reload doctor data to show updated information
        const res = await doctorAPI.getDoctorById(doctorId);
        if (res.data?.data) {
          const docData = res.data.data;
          setDoctor(docData);
          setCertificates(docData.certificates || []);
          
          // Handle specialties - could be array of objects or strings
          const specialtiesArray = docData.specialties || [];
          const formattedSpecialties = specialtiesArray.map(s => {
            if (typeof s === 'string') {
              return { _id: s, name: s };
            }
            return s;
          });
          setDoctorSpecialties(formattedSpecialties);
          
          // Get primary specialty from either specialties[0] or professionalInfo.specialization
          let specialtyValue = docData.professionalInfo?.specialization;
          if (docData.specialties && docData.specialties.length > 0) {
            specialtyValue = docData.specialties[0]?._id || docData.specialties[0];
          }

          const departmentValue = docData.professionalInfo?.department;
          
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
            specialtyId: specialtyValue,
            departmentId: departmentValue,
            yearsOfExperience: docData.yearsOfExperience || docData.professionalInfo?.yearsOfExperience,
            bio: docData.bio,
          });
        }
      } else {
        navigate('/admin/doctors');
      }
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
                >
                  <Select
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
                >
                  <DatePicker style={{ width: '100%' }} />
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
                  label="Chuyên khoa chính"
                  name="specialtyId"
                  rules={[{ required: true, message: 'Vui lòng chọn chuyên khoa' }]}
                >
                  <Select
                    placeholder="Chọn chuyên khoa"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={'Không tìm thấy'}
                  >
                    {[
                      { _id: 'Bác sĩ đa khoa', name: 'Bác sĩ đa khoa' },
                      { _id: 'Tim mạch', name: 'Tim mạch' },
                      { _id: 'Ngoại khoa', name: 'Ngoại khoa' },
                      { _id: 'Nhi khoa', name: 'Nhi khoa' },
                      { _id: 'Sản phụ khoa', name: 'Sản phụ khoa' },
                      { _id: 'Tâm thần', name: 'Tâm thần' },
                      { _id: 'Nha khoa', name: 'Nha khoa' },
                      { _id: 'Y học thể dục', name: 'Y học thể dục' }
                    ].map((s) => (
                      <Select.Option key={s._id} value={s._id} label={s.name}>
                        {s.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Khoa"
                  name="departmentId"
                  rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
                >
                  <Select
                    placeholder="Chọn khoa"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={'Không tìm thấy'}
                  >
                    {[
                      { _id: 'Khoa Nội', name: 'Khoa Nội' },
                      { _id: 'Khoa Ngoại', name: 'Khoa Ngoại' },
                      { _id: 'Khoa Nhi', name: 'Khoa Nhi' },
                      { _id: 'Khoa Sản - Phụ khoa', name: 'Khoa Sản - Phụ khoa' },
                      { _id: 'Khoa Tâm thần', name: 'Khoa Tâm thần' },
                      { _id: 'Khoa Nha khoa', name: 'Khoa Nha khoa' }
                    ].map((d) => (
                      <Select.Option key={d._id} value={d._id} label={d.name}>
                        {d.name}
                      </Select.Option>
                    ))}
                  </Select>
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

            {/* Các chuyên khoa khác */}
            <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>🏅 Chuyên khoa thêm</h3>
            <Card style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
                  Thêm chuyên khoa khác
                </label>
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={16}>
                    <Form.Item noStyle>
                      <Select
                        placeholder="Chọn chuyên khoa để thêm"
                        value={newSpecialty}
                        onChange={setNewSpecialty}
                        allowClear
                      >
                        <Select.Option value="Bác sĩ đa khoa">Bác sĩ đa khoa</Select.Option>
                        <Select.Option value="Tim mạch">Tim mạch</Select.Option>
                        <Select.Option value="Ngoại khoa">Ngoại khoa</Select.Option>
                        <Select.Option value="Nhi khoa">Nhi khoa</Select.Option>
                        <Select.Option value="Sản phụ khoa">Sản phụ khoa</Select.Option>
                        <Select.Option value="Tâm thần">Tâm thần</Select.Option>
                        <Select.Option value="Nha khoa">Nha khoa</Select.Option>
                        <Select.Option value="Y học thể dục">Y học thể dục</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Button 
                      type="primary"
                      block
                      onClick={handleAddSpecialty}
                    >
                      ➕ Thêm
                    </Button>
                  </Col>
                </Row>
              </div>

              {/* Danh sách chuyên khoa đã thêm */}
              {doctorSpecialties.length > 0 ? (
                <div>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
                    Các chuyên khoa được thêm ({doctorSpecialties.length})
                  </label>
                  <Table
                    dataSource={doctorSpecialties}
                    columns={[
                      {
                        title: 'STT',
                        key: 'index',
                        width: 60,
                        render: (_, __, index) => index + 1,
                      },
                      {
                        title: 'Chuyên khoa',
                        key: 'name',
                        render: (_, record) => {
                          const name = typeof record === 'string' ? record : (record.name || record._id || record);
                          return name;
                        }
                      },
                      {
                        title: 'Hành động',
                        key: 'action',
                        width: 100,
                        render: (_, record) => {
                          const specId = typeof record === 'string' ? record : (record._id || record);
                          return (
                            <Button
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveSpecialty(specId)}
                            >
                              Xóa
                            </Button>
                          );
                        }
                      },
                    ]}
                    rowKey={(record, index) => {
                      if (typeof record === 'string') return `specialty-${record}-${index}`;
                      return `specialty-${record._id || record.name || index}-${index}`;
                    }}
                    pagination={false}
                  />
                </div>
              ) : (
                <Empty 
                  description="Chưa thêm chuyên khoa nào" 
                  style={{ padding: '20px 0' }}
                />
              )}
            </Card>

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
