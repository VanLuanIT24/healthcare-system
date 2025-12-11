// 🏥 Patient Insurance Tab Component
import { DeleteOutlined, EditOutlined, PlusOutlined, SafetyOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, message, Modal, Select, Space, Table, Tag } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import patientExtendedAPI from '../../services/api/patientExtendedAPI';
import designSystem from '../../theme/designSystem';

const { colors } = designSystem;

const PatientInsuranceTab = ({ patientId }) => {
  const [insuranceList, setInsuranceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadInsurance();
  }, [patientId]);

  const loadInsurance = async () => {
    try {
      setLoading(true);
      const response = await patientExtendedAPI.getPatientInsurance(patientId);
      setInsuranceList(response.data?.data || response.data || []);
    } catch (error) {
      message.error('Không thể tải thông tin bảo hiểm');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingInsurance(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingInsurance(record);
    form.setFieldsValue({
      ...record,
      startDate: moment(record.startDate),
      endDate: moment(record.endDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa thông tin bảo hiểm này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await patientExtendedAPI.deletePatientInsurance(patientId, id);
          message.success('Đã xóa thông tin bảo hiểm');
          loadInsurance();
        } catch (error) {
          message.error('Không thể xóa thông tin bảo hiểm');
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      const insuranceData = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };

      if (editingInsurance) {
        await patientExtendedAPI.updatePatientInsurance(patientId, insuranceData);
        message.success('Đã cập nhật thông tin bảo hiểm');
      } else {
        await patientExtendedAPI.updatePatientInsurance(patientId, insuranceData);
        message.success('Đã thêm thông tin bảo hiểm');
      }

      setIsModalVisible(false);
      loadInsurance();
    } catch (error) {
      message.error('Không thể lưu thông tin bảo hiểm');
    }
  };

  const columns = [
    {
      title: 'Loại bảo hiểm',
      dataIndex: 'insuranceType',
      key: 'insuranceType',
      render: (type) => {
        const typeMap = {
          'BHYT': { color: 'blue', text: 'Bảo hiểm y tế' },
          'COMMERCIAL': { color: 'green', text: 'Bảo hiểm thương mại' },
          'OTHER': { color: 'default', text: 'Khác' },
        };
        const config = typeMap[type] || typeMap.OTHER;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Số thẻ',
      dataIndex: 'cardNumber',
      key: 'cardNumber',
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'provider',
      key: 'provider',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => {
        const isExpired = moment(date).isBefore(moment());
        return (
          <span style={{ color: isExpired ? colors.error[500] : colors.text.primary }}>
            {moment(date).format('DD/MM/YYYY')}
            {isExpired && <Tag color="red" style={{ marginLeft: 8 }}>Hết hạn</Tag>}
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const isActive = moment().isBetween(moment(record.startDate), moment(record.endDate));
        return (
          <Tag color={isActive ? 'green' : 'default'}>
            {isActive ? 'Còn hiệu lực' : 'Không hiệu lực'}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <SafetyOutlined style={{ color: colors.primary[500] }} />
          <span>Thông tin bảo hiểm</span>
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm bảo hiểm
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={insuranceList}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editingInsurance ? 'Cập nhật bảo hiểm' : 'Thêm bảo hiểm'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Loại bảo hiểm"
            name="insuranceType"
            rules={[{ required: true, message: 'Vui lòng chọn loại bảo hiểm' }]}
          >
            <Select placeholder="Chọn loại bảo hiểm">
              <Select.Option value="BHYT">Bảo hiểm y tế</Select.Option>
              <Select.Option value="COMMERCIAL">Bảo hiểm thương mại</Select.Option>
              <Select.Option value="OTHER">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Số thẻ"
            name="cardNumber"
            rules={[{ required: true, message: 'Vui lòng nhập số thẻ' }]}
          >
            <Input placeholder="Nhập số thẻ bảo hiểm" />
          </Form.Item>

          <Form.Item
            label="Nhà cung cấp"
            name="provider"
            rules={[{ required: true, message: 'Vui lòng nhập nhà cung cấp' }]}
          >
            <Input placeholder="Ví dụ: BHXH Việt Nam, Bảo Việt" />
          </Form.Item>

          <Form.Item
            label="Ngày bắt đầu"
            name="startDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Ngày hết hạn"
            name="endDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Ghi chú thêm (nếu có)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingInsurance ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PatientInsuranceTab;
