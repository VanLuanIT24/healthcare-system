// src/pages/admin/medications/MedicationForm.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import medicationInventoryAPI from '@/services/api/medicationInventoryAPI';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, message, Row, Select, Space, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const MedicationForm = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { label: 'Kháng sinh', value: 'antibiotic' },
    { label: 'Giảm đau', value: 'painkiller' },
    { label: 'Chống viêm', value: 'antiinflammatory' },
    { label: 'Vitamin', value: 'vitamin' },
    { label: 'Thần kinh', value: 'neurological' },
    { label: 'Tim mạch', value: 'cardiovascular' },
    { label: 'Tiêu hóa', value: 'digestive' },
    { label: 'Khác', value: 'other' }
  ];

  const units = [
    { label: 'Viên', value: 'tablet' },
    { label: 'Chai', value: 'bottle' },
    { label: 'Vial', value: 'vial' },
    { label: 'Lọ', value: 'jar' },
    { label: 'Hộp', value: 'box' },
    { label: 'Vắc', value: 'strip' },
    { label: 'Ống', value: 'ampule' },
    { label: 'Gói', value: 'sachet' }
  ];

  // Fetch medication if editing
  useEffect(() => {
    const fetchMedication = async () => {
      if (id) {
        try {
          setLoading(true);
          const res = await medicationInventoryAPI.getMedicationById(id);
          const medication = res.data?.data || res.data;
          
          if (medication) {
            form.setFieldsValue({
              name: medication.name,
              code: medication.code,
              category: medication.category,
              genericName: medication.genericName,
              manufacturer: medication.manufacturer,
              unit: medication.unit,
              quantity: medication.quantity,
              minimumStock: medication.minimumStock,
              price: medication.price,
              sellingPrice: medication.sellingPrice,
              expiryDate: medication.expiryDate ? dayjs(medication.expiryDate) : null,
              description: medication.description
            });
          }
        } catch (error) {
          console.error('Error fetching medication:', error);
          message.error('Lỗi khi tải dữ liệu dược liệu');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMedication();
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      const submitData = {
        name: values.name,
        medicationId: values.code,
        category: values.category,
        genericName: values.genericName,
        manufacturer: values.manufacturer,
        stock: {
          current: values.quantity || 0,
          minimum: values.minimumStock || 10
        },
        pricing: {
          costPrice: values.price || 0,
          sellingPrice: values.sellingPrice || 0
        },
        expiryDate: values.expiryDate?.toISOString(),
        description: values.description
      };

      if (id) {
        await medicationInventoryAPI.updateMedication(id, submitData);
        message.success('Cập nhật dược liệu thành công');
      } else {
        await medicationInventoryAPI.createMedication(submitData);
        message.success('Tạo dược liệu thành công');
      }

      navigate('/admin/medications');
    } catch (error) {
      console.error('Error saving medication:', error);
      message.error(id ? 'Lỗi khi cập nhật dược liệu' : 'Lỗi khi tạo dược liệu');
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
            {id ? 'Sửa dược liệu' : 'Tạo dược liệu mới'}
          </h1>
          <Button onClick={() => navigate('/admin/medications')}>
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
                  name="name"
                  label="Tên dược liệu"
                  rules={[{ required: true, message: 'Vui lòng nhập tên dược liệu' }]}
                >
                  <Input placeholder="VD: Aspirin" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="code"
                  label="Mã dược liệu"
                  rules={[{ required: true, message: 'Vui lòng nhập mã dược liệu' }]}
                >
                  <Input placeholder="VD: ASP001" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="genericName"
                  label="Tên chung"
                >
                  <Input placeholder="VD: Acetylsalicylic acid" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="manufacturer"
                  label="Nhà sản xuất"
                >
                  <Input placeholder="VD: Bayer" />
                </Form.Item>
              </Col>
            </Row>

            {/* Category and Unit */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="category"
                  label="Phân loại"
                  rules={[{ required: true, message: 'Vui lòng chọn phân loại' }]}
                >
                  <Select
                    placeholder="Chọn phân loại"
                    options={categories}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="unit"
                  label="Đơn vị"
                  rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
                  initialValue="tablet"
                >
                  <Select
                    placeholder="Chọn đơn vị"
                    options={units}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Stock Info */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="quantity"
                  label="Số lượng hiện tại"
                  rules={[{ type: 'number', message: 'Phải là số' }]}
                >
                  <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="minimumStock"
                  label="Tồn kho tối thiểu"
                  rules={[{ type: 'number', message: 'Phải là số' }]}
                  initialValue={10}
                >
                  <InputNumber min={0} placeholder="10" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            {/* Pricing */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="price"
                  label="Giá vốn (VNĐ)"
                  rules={[{ required: true, type: 'number', message: 'Vui lòng nhập giá' }]}
                >
                  <InputNumber
                    min={0}
                    placeholder="0"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => parseInt(value.replace(/,/g, ''))}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="sellingPrice"
                  label="Giá bán (VNĐ)"
                >
                  <InputNumber
                    min={0}
                    placeholder="0"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => parseInt(value.replace(/,/g, ''))}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Expiry Date */}
            <Form.Item
              name="expiryDate"
              label="Hạn sử dụng"
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Chọn ngày hạn sử dụng"
                style={{ width: '100%' }}
              />
            </Form.Item>

            {/* Description */}
            <Form.Item
              name="description"
              label="Mô tả"
            >
              <Input.TextArea
                placeholder="Mô tả về dược liệu"
                rows={3}
              />
            </Form.Item>

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
                <Button onClick={() => navigate('/admin/medications')}>
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

export default MedicationForm;
