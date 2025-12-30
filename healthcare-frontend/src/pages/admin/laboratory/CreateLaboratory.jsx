// src/pages/admin/laboratory/CreateLaboratory.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import laboratoryAPI from '@/services/api/laboratoryAPI';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Input, message, Row, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateLaboratory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const labTests = [
    { value: 'blood_test', label: 'Xét nghiệm máu' },
    { value: 'urine_test', label: 'Xét nghiệm nước tiểu' },
    { value: 'covid_test', label: 'Xét nghiệm COVID-19' },
    { value: 'glucose_test', label: 'Xét nghiệm đường huyết' },
    { value: 'cholesterol_test', label: 'Xét nghiệm cholesterol' },
    { value: 'liver_function', label: 'Xét nghiệm chức năng gan' },
    { value: 'kidney_function', label: 'Xét nghiệm chức năng thận' },
    { value: 'thyroid_test', label: 'Xét nghiệm tuyến giáp' },
    { value: 'cancer_marker', label: 'Xét nghiệm ung thư' },
    { value: 'pregnancy_test', label: 'Xét nghiệm thai' },
  ];

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const labData = {
        patientId: values.patientId,
        testType: values.testType,
        orderedDate: values.orderedDate?.format('YYYY-MM-DD'),
        status: 'PENDING',
        notes: values.notes || '',
      };

      await laboratoryAPI.createLabOrder(labData);
      message.success('Tạo đơn xét nghiệm thành công');
      navigate('/admin/laboratory');
    } catch (error) {
      console.error('Error creating lab order:', error);
      message.error(error.response?.data?.message || 'Lỗi tạo đơn xét nghiệm');
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
            onClick={() => navigate('/admin/laboratory')}
          >
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Tạo đơn xét nghiệm mới</h1>
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
                    label="ID Bệnh nhân"
                    name="patientId"
                    rules={[
                      { required: true, message: 'Vui lòng nhập ID bệnh nhân' },
                    ]}
                  >
                    <Input
                      placeholder="VD: PATIENT-001, P123, etc."
                      disabled={loading}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Loại xét nghiệm"
                    name="testType"
                    rules={[
                      { required: true, message: 'Vui lòng chọn loại xét nghiệm' },
                    ]}
                  >
                    <Select
                      placeholder="Chọn loại xét nghiệm"
                      disabled={loading}
                      options={labTests}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Ngày đặt"
                    name="orderedDate"
                    initialValue={dayjs()}
                    rules={[
                      { required: true, message: 'Vui lòng chọn ngày đặt' },
                    ]}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      disabled={loading}
                      style={{ width: '100%' }}
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
                      placeholder="Ghi chú về đơn xét nghiệm (tùy chọn)"
                      disabled={loading}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} className="flex gap-2 justify-end">
                  <Button onClick={() => navigate('/admin/laboratory')}>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                  >
                    Tạo đơn xét nghiệm
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

export default CreateLaboratory;
