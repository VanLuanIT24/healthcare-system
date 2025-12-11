// 💊 Create/Edit Medication Page
import {
    CheckCircleOutlined,
    InfoCircleOutlined,
    MedicineBoxOutlined,
    SaveOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    InputNumber,
    message,
    Row,
    Select,
    Space,
    Switch
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import medicationAPI from '../../services/api/medicationAPI';

const { TextArea } = Input;
const { Option } = Select;

const MedicationCreate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      loadMedication();
    }
  }, [id]);

  const loadMedication = async () => {
    try {
      setLoading(true);
      const response = await medicationAPI.getMedicationById(id);
      if (response.data.success) {
        const med = response.data.data;
        form.setFieldsValue({
          ...med,
          expiryDate: med.expiryDate ? moment(med.expiryDate) : null,
        });
      }
    } catch (error) {
      message.error('Không thể tải thông tin thuốc');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const medicationData = {
        ...values,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
      };

      if (isEdit) {
        await medicationAPI.updateMedication(id, medicationData);
        message.success('Cập nhật thuốc thành công');
      } else {
        await medicationAPI.createMedication(medicationData);
        message.success('Thêm thuốc mới thành công');
      }

      navigate('/pharmacy/medications');
    } catch (error) {
      message.error(
        isEdit ? 'Cập nhật thuốc thất bại' : 'Thêm thuốc thất bại'
      );
      console.error('Submit medication error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medication-create-page">
      <PageHeader
        title={isEdit ? 'Cập nhật thuốc' : 'Thêm thuốc mới'}
        subtitle={isEdit ? 'Chỉnh sửa thông tin thuốc' : 'Nhập thông tin thuốc mới'}
        icon={<MedicineBoxOutlined />}
        onBack={() => navigate('/pharmacy/medications')}
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'ACTIVE',
            type: 'TABLET',
            category: 'OTHER',
            requiresPrescription: true,
            'stock.minimum': 10,
            'stock.maximum': 1000,
            'stock.reorderLevel': 50,
            'stock.current': 0,
            'insurance.covered': false,
            'insurance.priorAuthorization': false,
          }}
        >
          <Row gutter={24}>
            {/* Basic Information */}
            <Col span={24}>
              <Card
                type="inner"
                title={
                  <Space>
                    <InfoCircleOutlined />
                    <span>Thông tin cơ bản</span>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="name"
                      label="Tên thuốc"
                      rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
                    >
                      <Input placeholder="VD: Paracetamol 500mg" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="genericName" label="Tên khoa học">
                      <Input placeholder="VD: Acetaminophen" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="brandName" label="Tên thương mại">
                      <Input placeholder="VD: Tylenol" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      name="category"
                      label="Danh mục"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        <Option value="ANTIBIOTIC">Kháng sinh</Option>
                        <Option value="ANALGESIC">Giảm đau</Option>
                        <Option value="ANTIHYPERTENSIVE">Hạ huyết áp</Option>
                        <Option value="ANTIDIABETIC">Chống tiểu đường</Option>
                        <Option value="ANTACID">Kháng acid</Option>
                        <Option value="ANTIHISTAMINE">Kháng histamine</Option>
                        <Option value="ANTIVIRAL">Kháng virus</Option>
                        <Option value="VACCINE">Vắc xin</Option>
                        <Option value="VITAMIN">Vitamin</Option>
                        <Option value="SUPPLEMENT">Thực phẩm chức năng</Option>
                        <Option value="OTHER">Khác</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="type" label="Dạng thuốc" rules={[{ required: true }]}>
                      <Select>
                        <Option value="TABLET">Viên nén</Option>
                        <Option value="CAPSULE">Viên nang</Option>
                        <Option value="SYRUP">Siro</Option>
                        <Option value="INJECTION">Tiêm</Option>
                        <Option value="CREAM">Kem</Option>
                        <Option value="OINTMENT">Thuốc mỡ</Option>
                        <Option value="DROPS">Nhỏ giọt</Option>
                        <Option value="INHALER">Xịt</Option>
                        <Option value="POWDER">Bột</Option>
                        <Option value="OTHER">Khác</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="manufacturer" label="Nhà sản xuất">
                      <Input placeholder="VD: Sanofi" />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item name="description" label="Mô tả">
                      <TextArea rows={3} placeholder="Mô tả chi tiết về thuốc" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Pricing */}
            <Col xs={24} md={12}>
              <Card
                type="inner"
                title="Giá cả"
                style={{ marginBottom: 16, height: '100%' }}
              >
                <Form.Item
                  name={['pricing', 'costPrice']}
                  label="Giá nhập"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    addonAfter="VNĐ"
                  />
                </Form.Item>

                <Form.Item
                  name={['pricing', 'sellingPrice']}
                  label="Giá bán"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    addonAfter="VNĐ"
                  />
                </Form.Item>

                <Form.Item name={['pricing', 'insurancePrice']} label="Giá bảo hiểm">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    addonAfter="VNĐ"
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* Stock Management */}
            <Col xs={24} md={12}>
              <Card
                type="inner"
                title="Quản lý tồn kho"
                style={{ marginBottom: 16, height: '100%' }}
              >
                <Form.Item
                  name={['stock', 'current']}
                  label="Số lượng hiện tại"
                  rules={[{ required: true }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>

                <Form.Item name={['stock', 'minimum']} label="Tồn kho tối thiểu">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>

                <Form.Item name={['stock', 'reorderLevel']} label="Mức đặt hàng lại">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>

                <Form.Item name={['stock', 'maximum']} label="Tồn kho tối đa">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Card>
            </Col>

            {/* Additional Settings */}
            <Col span={24}>
              <Card type="inner" title="Cài đặt khác" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item name="requiresPrescription" label="Yêu cầu đơn thuốc" valuePropName="checked">
                      <Switch checkedChildren="Có" unCheckedChildren="Không" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name={['insurance', 'covered']} label="Bảo hiểm chi trả" valuePropName="checked">
                      <Switch checkedChildren="Có" unCheckedChildren="Không" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="status" label="Trạng thái">
                      <Select>
                        <Option value="ACTIVE">Hoạt động</Option>
                        <Option value="DISCONTINUED">Ngừng kinh doanh</Option>
                        <Option value="OUT_OF_STOCK">Hết hàng</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Submit Buttons */}
            <Col span={24}>
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={isEdit ? <SaveOutlined /> : <CheckCircleOutlined />}
                    size="large"
                  >
                    {isEdit ? 'Cập nhật' : 'Thêm thuốc'}
                  </Button>
                  <Button size="large" onClick={() => navigate('/pharmacy/medications')}>
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default MedicationCreate;
