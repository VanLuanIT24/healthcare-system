// src/pages/admin/departments/DepartmentForm.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import adminAPI from '@/services/api/admin/adminAPI';
import axios from '@/services/axios';
import { Button, Card, Col, Form, Input, message, Row, Space, Spin, TimePicker } from 'antd';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DepartmentForm = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doctors, setDoctors] = useState([]);

  const departmentTypes = [
    { value: 'inpatient', label: 'Nội trú' },
    { value: 'outpatient', label: 'Ngoài trú' },
    { value: 'emergency', label: 'Cấp cứu' },
    { value: 'icu', label: 'ICU' }
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: 'Thứ 2',
    tuesday: 'Thứ 3',
    wednesday: 'Thứ 4',
    thursday: 'Thứ 5',
    friday: 'Thứ 6',
    saturday: 'Thứ 7',
    sunday: 'Chủ nhật'
  };

  // Fetch department if editing
  useEffect(() => {
    const fetchDepartment = async () => {
      if (id) {
        try {
          setLoading(true);
          const res = await adminAPI.getDepartmentById(id);
          const dept = res.data?.data || res.data;

          // Format working hours for form
          const formattedWorkingHours = {};
          if (dept?.workingHours) {
            days.forEach(day => {
              if (dept.workingHours[day]) {
                formattedWorkingHours[`${day}_start`] = dayjs(dept.workingHours[day].start, 'HH:mm');
                formattedWorkingHours[`${day}_end`] = dayjs(dept.workingHours[day].end, 'HH:mm');
              }
            });
          }

          form.setFieldsValue({
            ...dept,
            ...formattedWorkingHours,
            headOfDepartment: dept?.headOfDepartment?._id || dept?.head?._id
          });
        } catch (error) {
          console.error('Error fetching department:', error);
          message.error('Lỗi khi tải dữ liệu khoa');
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchDoctors = async () => {
      try {
        const res = await axios.get('/api/admin/doctors');
        const doctorList = res.data?.data || res.data || [];
        setDoctors(Array.isArray(doctorList) ? doctorList : []);
      } catch (error) {
        console.error('Error fetching doctors:', error?.response?.data || error?.message);
        setDoctors([]);
      }
    };

    fetchDepartment();
    fetchDoctors();
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      // Format working hours
      const workingHours = {};
      days.forEach(day => {
        if (values[`${day}_start`] && values[`${day}_end`]) {
          workingHours[day] = {
            start: values[`${day}_start`].format('HH:mm'),
            end: values[`${day}_end`].format('HH:mm')
          };
        }
      });

      // Remove time fields from values
      const submitData = { ...values };
      days.forEach(day => {
        delete submitData[`${day}_start`];
        delete submitData[`${day}_end`];
      });

      submitData.workingHours = workingHours;

      if (id) {
        await adminAPI.updateDepartment(id, submitData);
        message.success('Cập nhật khoa thành công');
      } else {
        await adminAPI.createDepartment(submitData);
        message.success('Tạo khoa thành công');
      }

      navigate('/admin/departments');
    } catch (error) {
      console.error('Error saving department:', error);
      message.error(id ? 'Lỗi khi cập nhật khoa' : 'Lỗi khi tạo khoa');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">
            {id ? 'Sửa khoa' : 'Tạo khoa mới'}
          </h1>
          <Button onClick={() => navigate('/admin/departments')}>
            Quay lại
          </Button>
        </div>

        <Card className="rounded-lg">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            {/* Basic Info */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="code"
                  label="Mã khoa"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mã khoa' },
                    { pattern: /^[A-Z0-9]+$/, message: 'Mã khoa chỉ chứa chữ cái hoa và số' }
                  ]}
                >
                  <Input placeholder="VD: KHP001" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="name"
                  label="Tên khoa"
                  rules={[{ required: true, message: 'Vui lòng nhập tên khoa' }]}
                >
                  <Input placeholder="Khoa Nội" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="type"
                  label="Loại khoa"
                  rules={[{ required: true, message: 'Vui lòng chọn loại khoa' }]}
                >
                  <CustomSelect
                    placeholder="Chọn loại khoa"
                    options={departmentTypes}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="headOfDepartment"
                  label="Trưởng khoa"
                  rules={[{ required: true, message: 'Vui lòng chọn trưởng khoa' }]}
                >
                  <CustomSelect
                    placeholder="Chọn trưởng khoa"
                    options={doctors.map(doc => ({
                      value: doc._id,
                      label: doc.fullName || doc.username
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>


            <Form.Item
              name="description"
              label="Mô tả"
            >
              <Input.TextArea
                placeholder="Mô tả về khoa"
                rows={3}
              />
            </Form.Item>

            {/* Contact Info */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="location"
                  label="Vị trí"
                >
                  <Input placeholder="Tòa nhà A, Tầng 2" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="floor"
                  label="Tầng"
                  rules={[{ type: 'number', message: 'Tầng phải là số' }]}
                >
                  <Input type="number" placeholder="2" min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="contactNumber"
                  label="Số điện thoại"
                >
                  <Input placeholder="0123456789" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { type: 'email', message: 'Email không hợp lệ' }
                  ]}
                >
                  <Input placeholder="khoa@hospital.com" />
                </Form.Item>
              </Col>
            </Row>

            {/* Working Hours */}
            <div style={{ marginTop: '24px', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '16px' }}>Giờ làm việc</h3>
              <Row gutter={16}>
                {days.map(day => (
                  <Col xs={24} sm={12} key={day}>
                    <Row gutter={8} align="middle">
                      <Col span={6}>
                        <label style={{ fontWeight: '500' }}>{dayLabels[day]}</label>
                      </Col>
                      <Col span={9}>
                        <Form.Item
                          name={`${day}_start`}
                          noStyle
                        >
                          <TimePicker
                            format="HH:mm"
                            placeholder="Bắt đầu"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={9}>
                        <Form.Item
                          name={`${day}_end`}
                          noStyle
                        >
                          <TimePicker
                            format="HH:mm"
                            placeholder="Kết thúc"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Buttons */}
            <Form.Item style={{ marginTop: '24px' }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                >
                  {id ? 'Cập nhật' : 'Tạo'}
                </Button>
                <Button onClick={() => navigate('/admin/departments')}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DepartmentForm;
