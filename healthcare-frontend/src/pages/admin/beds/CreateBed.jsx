// src/pages/admin/beds/CreateBed.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { createBed } from '@/services/api/bedAPI';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Row, Select, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateBed = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Hardcoded departments list (since backend endpoint doesn't exist)
  const departments = [
    { _id: '1', name: 'Khoa Ngoại' },
    { _id: '2', name: 'Khoa Nội' },
    { _id: '3', name: 'Khoa Sản Phụ Khoa' },
    { _id: '4', name: 'Khoa Nhi' },
    { _id: '5', name: 'Khoa Tim Mạch' },
    { _id: '6', name: 'Khoa Tâm Thần' },
    { _id: '7', name: 'Khoa Hồi sức Tích cực' },
    { _id: '8', name: 'Khoa Phòng chống Nhiễm khuẩn' },
    { _id: '9', name: 'Khoa Chẩn Đoán Hình ảnh' },
    { _id: '10', name: 'Khoa Xét Nghiệm' },
  ];

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const bedData = {
        code: values.code,
        department: values.department,
        status: 'AVAILABLE',
        notes: values.notes || '',
      };

      const response = await createBed(bedData);

      message.success('Thêm giường bệnh thành công');
      navigate('/admin/beds');
    } catch (error) {
      console.error('Error creating bed:', error);
      message.error(error.response?.data?.message || 'Lỗi thêm giường bệnh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/beds')}
          >
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Thêm giường bệnh mới</h1>
        </div>

        <Card className="rounded-lg">
          <Spin spinning={false}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Mã giường"
                    name="code"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mã giường' },
                      { min: 1, message: 'Mã giường không được để trống' },
                    ]}
                  >
                    <Input
                      placeholder="VD: BED-001, A-101, etc."
                      disabled={loading}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Khoa/Bộ phận"
                    name="department"
                    rules={[
                      { required: true, message: 'Vui lòng chọn khoa' },
                    ]}
                  >
                    <Select
                      placeholder="Chọn khoa"
                      disabled={loading}
                      options={departments.map((dept) => ({
                        label: dept.name || dept.departmentName,
                        value: dept._id || dept.id,
                      }))}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label="Ghi chú"
                    name="notes"
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Ghi chú về giường (tùy chọn)"
                      disabled={loading}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} className="flex gap-2 justify-end">
                  <Button onClick={() => navigate('/admin/beds')}>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                  >
                    Thêm giường
                  </Button>
                </Col>
              </Row>
            </Form>
          </Spin>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CreateBed;
