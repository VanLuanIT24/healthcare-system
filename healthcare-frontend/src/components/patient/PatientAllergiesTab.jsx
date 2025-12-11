// 🏥 Patient Allergies Tab Component
import { AlertOutlined, DeleteOutlined, EditOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, List, message, Modal, Select, Space, Tag } from 'antd';
import { useEffect, useState } from 'react';
import patientExtendedAPI from '../../services/api/patientExtendedAPI';
import designSystem from '../../theme/designSystem';

const { colors } = designSystem;

const PatientAllergiesTab = ({ patientId }) => {
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAllergies();
  }, [patientId]);

  const loadAllergies = async () => {
    try {
      setLoading(true);
      const response = await patientExtendedAPI.getPatientAllergies(patientId);
      setAllergies(response.data?.data || response.data || []);
    } catch (error) {
      message.error('Không thể tải thông tin dị ứng');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAllergy(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingAllergy(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa thông tin dị ứng này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await patientExtendedAPI.deletePatientAllergy(patientId, id);
          message.success('Đã xóa thông tin dị ứng');
          loadAllergies();
        } catch (error) {
          message.error('Không thể xóa thông tin dị ứng');
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (editingAllergy) {
        await patientExtendedAPI.updatePatientAllergy(patientId, editingAllergy._id, values);
        message.success('Đã cập nhật thông tin dị ứng');
      } else {
        await patientExtendedAPI.addPatientAllergy(patientId, values);
        message.success('Đã thêm thông tin dị ứng');
      }

      setIsModalVisible(false);
      loadAllergies();
    } catch (error) {
      message.error('Không thể lưu thông tin dị ứng');
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      MILD: 'blue',
      MODERATE: 'orange',
      SEVERE: 'red',
    };
    return colors[severity] || 'default';
  };

  return (
    <Card
      title={
        <Space>
          <AlertOutlined style={{ color: colors.error[500] }} />
          <span>Thông tin dị ứng</span>
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm dị ứng
        </Button>
      }
    >
      {allergies.length > 0 && (
        <Alert
          message="Cảnh báo"
          description={`Bệnh nhân có ${allergies.length} loại dị ứng được ghi nhận. Vui lòng kiểm tra kỹ trước khi kê đơn thuốc.`}
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <List
        loading={loading}
        dataSource={allergies}
        locale={{ emptyText: 'Không có thông tin dị ứng' }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(item)}
              >
                Sửa
              </Button>,
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(item._id)}
              >
                Xóa
              </Button>,
            ]}
            style={{
              padding: 16,
              marginBottom: 8,
              background: colors.background.paper,
              borderRadius: 8,
              border: `1px solid ${colors.border.default}`,
            }}
          >
            <List.Item.Meta
              avatar={
                <AlertOutlined
                  style={{
                    fontSize: 32,
                    color: item.severity === 'SEVERE' ? colors.error[500] : colors.warning[500],
                  }}
                />
              }
              title={
                <Space>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{item.allergen}</span>
                  <Tag color={getSeverityColor(item.severity)}>
                    {item.severity === 'MILD' && 'Nhẹ'}
                    {item.severity === 'MODERATE' && 'Trung bình'}
                    {item.severity === 'SEVERE' && 'Nghiêm trọng'}
                  </Tag>
                  {item.type && (
                    <Tag>{item.type === 'DRUG' ? 'Thuốc' : item.type === 'FOOD' ? 'Thực phẩm' : 'Khác'}</Tag>
                  )}
                </Space>
              }
              description={
                <Space direction="vertical" size={4}>
                  {item.reaction && (
                    <span><strong>Phản ứng:</strong> {item.reaction}</span>
                  )}
                  {item.notes && (
                    <span style={{ color: colors.text.secondary }}>{item.notes}</span>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title={editingAllergy ? 'Cập nhật dị ứng' : 'Thêm dị ứng'}
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
            label="Loại dị ứng"
            name="type"
            rules={[{ required: true, message: 'Vui lòng chọn loại dị ứng' }]}
          >
            <Select placeholder="Chọn loại dị ứng">
              <Select.Option value="DRUG">Thuốc</Select.Option>
              <Select.Option value="FOOD">Thực phẩm</Select.Option>
              <Select.Option value="ENVIRONMENTAL">Môi trường</Select.Option>
              <Select.Option value="OTHER">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Chất gây dị ứng"
            name="allergen"
            rules={[{ required: true, message: 'Vui lòng nhập chất gây dị ứng' }]}
          >
            <Input placeholder="Ví dụ: Penicillin, tôm, phấn hoa" />
          </Form.Item>

          <Form.Item
            label="Mức độ nghiêm trọng"
            name="severity"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
          >
            <Select placeholder="Chọn mức độ">
              <Select.Option value="MILD">Nhẹ</Select.Option>
              <Select.Option value="MODERATE">Trung bình</Select.Option>
              <Select.Option value="SEVERE">Nghiêm trọng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Phản ứng"
            name="reaction"
            rules={[{ required: true, message: 'Vui lòng mô tả phản ứng' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: Nổi mẩn đỏ, ngứa, sưng phù"
            />
          </Form.Item>

          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <Input.TextArea rows={2} placeholder="Thông tin bổ sung" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAllergy ? 'Cập nhật' : 'Thêm mới'}
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

export default PatientAllergiesTab;
