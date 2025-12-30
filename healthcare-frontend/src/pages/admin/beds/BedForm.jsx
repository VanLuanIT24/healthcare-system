// src/pages/admin/beds/BedForm.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import adminAPI from '@/services/api/adminAPI';
import bedAPI from '@/services/api/bedAPI';
import { Button, Card, Checkbox, Col, Form, Input, InputNumber, message, Row, Select, Space, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BedForm = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);

  const bedTypes = [
    { value: 'standard', label: 'Thường' },
    { value: 'vip', label: 'VIP' },
    { value: 'icu', label: 'ICU' },
    { value: 'isolation', label: 'Cách ly' },
    { value: 'intensive', label: 'Chuyên sâu' }
  ];

  const bedStatuses = [
    { value: 'AVAILABLE', label: 'Trống' },
    { value: 'OCCUPIED', label: 'Đang dùng' },
    { value: 'CLEANING', label: 'Vệ sinh' },
    { value: 'MAINTENANCE', label: 'Bảo trì' }
  ];

  // Fetch bed if editing
  useEffect(() => {
    const fetchBed = async () => {
      if (id) {
        try {
          setLoading(true);
          const res = await bedAPI.getBedById(id);
          const bed = res.data?.data || res.data;
          
          form.setFieldsValue({
            bedNumber: bed?.bedNumber,
            roomNumber: bed?.roomNumber,
            ward: bed?.ward,
            floor: bed?.floor,
            bedType: bed?.bedType || 'standard',
            department: bed?.department?._id || bed?.department,
            status: bed?.status || 'AVAILABLE',
            dailyRate: bed?.dailyRate || 0,
            airConditioning: bed?.amenities?.airConditioning || false,
            television: bed?.amenities?.television || false,
            wifi: bed?.amenities?.wifi || false,
            sideTable: bed?.amenities?.sideTable !== false,
            privateToilet: bed?.amenities?.privateToilet || false,
            showerFacility: bed?.amenities?.showerFacility || false,
            oxygen: bed?.amenities?.oxygen !== false,
            monitoring: bed?.amenities?.monitoring || false
          });
        } catch (error) {
          console.error('Error fetching bed:', error);
          message.error('Lỗi khi tải dữ liệu giường');
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchDepartments = async () => {
      try {
        const res = await adminAPI.getDepartments({ page: 1, limit: 100 });
        const deptList = res.data?.data || res.data || [];
        setDepartments(Array.isArray(deptList) ? deptList : []);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchBed();
    fetchDepartments();
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      // Format amenities
      const submitData = {
        bedNumber: values.bedNumber,
        roomNumber: values.roomNumber,
        ward: values.ward,
        floor: values.floor,
        bedType: values.bedType,
        department: values.department,
        status: values.status,
        dailyRate: values.dailyRate,
        amenities: {
          airConditioning: values.airConditioning || false,
          television: values.television || false,
          wifi: values.wifi || false,
          sideTable: values.sideTable !== false,
          privateToilet: values.privateToilet || false,
          showerFacility: values.showerFacility || false,
          oxygen: values.oxygen !== false,
          monitoring: values.monitoring || false
        }
      };

      if (id) {
        if (bedAPI.updateBed) {
          await bedAPI.updateBed(id, submitData);
        }
        message.success('Cập nhật giường thành công');
      } else {
        if (bedAPI.createBed) {
          await bedAPI.createBed(submitData);
        }
        message.success('Tạo giường thành công');
      }

      navigate('/admin/beds');
    } catch (error) {
      console.error('Error saving bed:', error);
      message.error(id ? 'Lỗi khi cập nhật giường' : 'Lỗi khi tạo giường');
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
            {id ? 'Sửa giường' : 'Tạo giường mới'}
          </h1>
          <Button onClick={() => navigate('/admin/beds')}>
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
                  name="bedNumber"
                  label="Mã giường"
                  rules={[{ required: true, message: 'Vui lòng nhập mã giường' }]}
                >
                  <Input placeholder="VD: B001" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="roomNumber"
                  label="Số phòng"
                  rules={[{ required: true, message: 'Vui lòng nhập số phòng' }]}
                >
                  <Input placeholder="101" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="ward"
                  label="Khu"
                >
                  <Input placeholder="A" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="floor"
                  label="Tầng"
                  rules={[{ type: 'number', message: 'Tầng phải là số' }]}
                >
                  <InputNumber min={0} placeholder="1" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="department"
                  label="Khoa"
                  rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
                >
                  <Select
                    placeholder="Chọn khoa"
                    options={departments.map(dept => ({
                      value: dept._id,
                      label: dept.name
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Bed Type and Status */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="bedType"
                  label="Loại giường"
                  rules={[{ required: true, message: 'Vui lòng chọn loại giường' }]}
                >
                  <Select
                    placeholder="Chọn loại giường"
                    options={bedTypes}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                >
                  <Select
                    placeholder="Chọn trạng thái"
                    options={bedStatuses}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Daily Rate */}
            <Form.Item
              name="dailyRate"
              label="Giá hàng ngày (VNĐ)"
              rules={[{ type: 'number', message: 'Giá phải là số' }]}
            >
              <InputNumber
                min={0}
                placeholder="0"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => parseInt(value.replace(/,/g, ''))}
                style={{ width: '100%' }}
              />
            </Form.Item>

            {/* Amenities */}
            <div style={{ marginTop: '24px', marginBottom: '16px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '16px' }}>Tiện nghi</h3>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="airConditioning"
                    valuePropName="checked"
                  >
                    <Checkbox>Điều hòa không khí</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="television"
                    valuePropName="checked"
                  >
                    <Checkbox>Tivi</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="wifi"
                    valuePropName="checked"
                  >
                    <Checkbox>WiFi</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="sideTable"
                    valuePropName="checked"
                  >
                    <Checkbox>Bàn cạnh giường</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="privateToilet"
                    valuePropName="checked"
                  >
                    <Checkbox>Phòng tắm riêng</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="showerFacility"
                    valuePropName="checked"
                  >
                    <Checkbox>Vòi sen</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="oxygen"
                    valuePropName="checked"
                  >
                    <Checkbox>Oxy</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="monitoring"
                    valuePropName="checked"
                  >
                    <Checkbox>Thiết bị theo dõi</Checkbox>
                  </Form.Item>
                </Col>
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
                <Button onClick={() => navigate('/admin/beds')}>
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

export default BedForm;
