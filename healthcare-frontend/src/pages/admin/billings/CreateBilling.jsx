// src/pages/admin/billings/CreateBilling.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import billingAPI from '@/services/api/billingAPI';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, message, Row, Spin } from 'antd';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateBilling = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { value: 'CASH', label: 'Tiền mặt' },
    { value: 'CARD', label: 'Thẻ tín dụng' },
    { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
    { value: 'INSURANCE', label: 'Bảo hiểm' },
    { value: 'CHEQUE', label: 'Séc' },
  ];

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const billData = {
        patientId: values.patientId,
        totalAmount: values.totalAmount,
        paymentMethod: values.paymentMethod,
        paymentStatus: 'UNPAID',
        description: values.description || '',
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
      };

      await billingAPI.createBill(billData);
      message.success('Tạo hóa đơn thành công');
      navigate('/admin/billings');
    } catch (error) {
      console.error('Error creating bill:', error);
      message.error(error.response?.data?.message || 'Lỗi tạo hóa đơn');
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
            onClick={() => navigate('/admin/billings')}
          >
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Tạo hóa đơn mới</h1>
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
                    label="Số tiền"
                    name="totalAmount"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số tiền' },
                    ]}
                  >
                    <InputNumber
                      placeholder="VD: 500000"
                      disabled={loading}
                      style={{ width: '100%' }}
                      min={0}
                      step={10000}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => parseInt(value.replace(/,/g, ''))}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Phương thức thanh toán"
                    name="paymentMethod"
                    rules={[
                      { required: true, message: 'Vui lòng chọn phương thức thanh toán' },
                    ]}
                  >
                    <CustomSelect
                      placeholder="Chọn phương thức thanh toán"
                      disabled={loading}
                      options={paymentMethods}
                    />

                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Ngày đến hạn"
                    name="dueDate"
                    initialValue={dayjs().add(30, 'days')}
                    rules={[
                      { required: true, message: 'Vui lòng chọn ngày đến hạn' },
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
                    label="Mô tả"
                    name="description"
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Mô tả hóa đơn (tùy chọn)"
                      disabled={loading}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} className="flex gap-2 justify-end">
                  <Button onClick={() => navigate('/admin/billings')}>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                  >
                    Tạo hóa đơn
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

export default CreateBilling;
