// 🧪 Lab Result Entry - Enter test results
import { SaveOutlined, WarningOutlined } from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    Col,
    Descriptions,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Tag,
    message
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import laboratoryAPI from '../../services/api/laboratoryAPI';
import './Laboratory.css';

const { TextArea } = Input;
const { Option } = Select;

const LabResultEntry = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [results, setResults] = useState({});
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await laboratoryAPI.getLabOrderById(orderId);
      setOrder(response.data);
      
      // Initialize results with empty values
      const initialResults = {};
      response.data.tests?.forEach((test) => {
        test.parameters?.forEach((param) => {
          initialResults[param._id] = {
            value: '',
            status: 'normal',
          };
        });
      });
      setResults(initialResults);
    } catch (error) {
      message.error('Không thể tải thông tin phiếu xét nghiệm');
    }
  };

  const handleResultChange = (paramId, field, value) => {
    setResults({
      ...results,
      [paramId]: {
        ...results[paramId],
        [field]: value,
      },
    });
  };

  const checkResultStatus = (value, normalRange) => {
    if (!normalRange || !value) return 'normal';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'normal';
    
    const [min, max] = normalRange.split('-').map((v) => parseFloat(v.trim()));
    
    if (numValue < min * 0.7 || numValue > max * 1.3) return 'critical';
    if (numValue < min || numValue > max) return 'abnormal';
    return 'normal';
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const resultData = Object.keys(results).map((paramId) => ({
        parameter: paramId,
        value: results[paramId].value,
        status: results[paramId].status,
      }));

      await laboratoryAPI.submitLabResults(orderId, {
        results: resultData,
        conclusion: values.conclusion,
        performedBy: values.performedBy,
      });

      message.success('Nhập kết quả xét nghiệm thành công');
      navigate(`/lab/orders/${orderId}`);
    } catch (error) {
      message.error('Nhập kết quả thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return <Card loading />;
  }

  return (
    <div className="page-container lab-result-container">
      <PageHeader
        title="Nhập kết quả xét nghiệm"
        subtitle={`Phiếu ${order.orderNumber}`}
        onBack={() => navigate('/lab/orders')}
      />

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={3}>
          <Descriptions.Item label="Bệnh nhân">
            <strong>{order.patient?.fullName}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Mã BN">
            {order.patient?.patientId}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {moment(order.patient?.dateOfBirth).format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Bác sĩ chỉ định">
            {order.doctor?.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Độ ưu tiên">
            <Tag color={order.priority === 'emergency' ? 'red' : order.priority === 'urgent' ? 'orange' : 'default'}>
              {order.priority === 'emergency' ? 'Khẩn cấp' : order.priority === 'urgent' ? 'Ưu tiên' : 'Thường'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {order.clinicalInfo && (
        <Alert
          message="Thông tin lâm sàng"
          description={order.clinicalInfo}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {order.tests?.map((test, testIndex) => (
          <Card
            key={test._id}
            title={`${testIndex + 1}. ${test.name}`}
            style={{ marginBottom: 16 }}
          >
            <div className="result-entry-form">
              {test.parameters?.map((param) => {
                const paramId = param._id;
                const status = checkResultStatus(results[paramId]?.value, param.normalRange);
                
                return (
                  <div
                    key={paramId}
                    className={`result-parameter ${status === 'abnormal' ? 'result-abnormal' : ''} ${
                      status === 'critical' ? 'result-critical' : ''
                    }`}
                  >
                    <div className="result-parameter-name">{param.name}</div>
                    <div className="result-parameter-input">
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập kết quả"
                        value={results[paramId]?.value}
                        onChange={(value) => {
                          handleResultChange(paramId, 'value', value);
                          const newStatus = checkResultStatus(value, param.normalRange);
                          handleResultChange(paramId, 'status', newStatus);
                        }}
                      />
                    </div>
                    <div className="result-parameter-unit">{param.unit}</div>
                    <div className="result-parameter-range">
                      {param.normalRange && (
                        <>
                          <div style={{ fontSize: 11, color: '#8c8c8c' }}>Bình thường:</div>
                          <div>{param.normalRange}</div>
                        </>
                      )}
                    </div>
                    {status !== 'normal' && (
                      <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                        <Tag
                          icon={<WarningOutlined />}
                          color={status === 'critical' ? 'red' : 'orange'}
                        >
                          {status === 'critical' ? 'Bất thường nghiêm trọng' : 'Bất thường'}
                        </Tag>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        <Card title="Kết luận và thực hiện">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="performedBy"
                label="Người thực hiện"
                rules={[{ required: true, message: 'Vui lòng nhập người thực hiện' }]}
              >
                <Input placeholder="Tên kỹ thuật viên" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="reviewedBy" label="Người duyệt">
                <Input placeholder="Tên người duyệt kết quả" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="conclusion"
            label="Kết luận"
            rules={[{ required: true, message: 'Vui lòng nhập kết luận' }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập kết luận tổng quát về kết quả xét nghiệm..."
            />
          </Form.Item>

          <Form.Item name="recommendations" label="Khuyến nghị">
            <TextArea
              rows={3}
              placeholder="Khuyến nghị cho bác sĩ điều trị..."
            />
          </Form.Item>

          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={loading}
              size="large"
            >
              Lưu kết quả
            </Button>
            <Button onClick={() => navigate('/lab/orders')} size="large">
              Hủy
            </Button>
          </Space>
        </Card>
      </Form>
    </div>
  );
};

export default LabResultEntry;
