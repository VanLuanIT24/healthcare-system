// 🚨 Allergy Manager
import {
    AlertOutlined,
    DeleteOutlined,
    EditOutlined,
    InfoCircleOutlined,
    PlusOutlined,
    SearchOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Empty,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Tooltip
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import patientExtendedAPI from '../../services/api/patientExtendedAPI';
import './Patient.css';

const { Option } = Select;

const AllergyManager = () => {
  const { patientId } = useParams();
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const severityLevels = {
    mild: { label: 'Nhẹ', color: 'green', icon: '✓', level: 1 },
    moderate: { label: 'Trung bình', color: 'orange', icon: '⚠', level: 2 },
    severe: { label: 'Nặng', color: 'red', icon: '✕', level: 3 },
  };

  useEffect(() => {
    loadAllergies();
  }, [patientId]);

  const loadAllergies = async () => {
    try {
      setLoading(true);
      const response = await patientExtendedAPI.getPatientAllergies(patientId);
      setAllergies(response.data || []);
    } catch (error) {
      message.error('Không thể tải danh sách dị ứng');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (allergy = null) => {
    setEditingAllergy(allergy);
    if (allergy) {
      form.setFieldsValue({
        allergen: allergy.allergen,
        severity: allergy.severity,
        reaction: allergy.reaction,
        medications: allergy.medications?.join(', '),
        notes: allergy.notes,
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        medications: values.medications
          ?.split(',')
          .map((m) => m.trim())
          .filter(Boolean),
      };

      if (editingAllergy) {
        await patientExtendedAPI.updatePatientAllergy(
          patientId,
          editingAllergy._id,
          data
        );
        message.success('Cập nhật dị ứng thành công');
      } else {
        await patientExtendedAPI.addPatientAllergy(patientId, data);
        message.success('Thêm dị ứng thành công');
      }
      setModalOpen(false);
      setEditingAllergy(null);
      form.resetFields();
      loadAllergies();
    } catch (error) {
      message.error(
        error.response?.data?.message || 'Lỗi khi lưu thông tin dị ứng'
      );
    }
  };

  const handleDeleteAllergy = (allergyId) => {
    Modal.confirm({
      title: 'Xóa dị ứng',
      content: 'Bạn có chắc chắn muốn xóa thông tin dị ứng này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      icon: <AlertOutlined style={{ color: '#ff4d4f' }} />,
      onOk: async () => {
        try {
          await patientExtendedAPI.removePatientAllergy(patientId, allergyId);
          message.success('Đã xóa dị ứng');
          loadAllergies();
        } catch (error) {
          message.error('Xóa dị ứng thất bại');
        }
      },
    });
  };

  const filteredAllergies = allergies.filter((allergy) =>
    allergy.allergen?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Sort by severity (severe first)
  const sortedAllergies = [...filteredAllergies].sort((a, b) => {
    const severityOrder = { severe: 0, moderate: 1, mild: 2 };
    return (
      (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3)
    );
  });

  const allergyColumns = [
    {
      title: 'Chất gây dị ứng',
      dataIndex: 'allergen',
      key: 'allergen',
      width: 150,
      render: (allergen) => <strong>{allergen}</strong>,
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      width: 120,
      render: (severity) => {
        const s = severityLevels[severity] || severityLevels.mild;
        return (
          <Tag
            color={s.color}
            icon={<AlertOutlined />}
            style={{ cursor: 'default' }}
          >
            {s.label}
          </Tag>
        );
      },
    },
    {
      title: 'Phản ứng',
      dataIndex: 'reaction',
      key: 'reaction',
      render: (reaction) => (
        <div style={{ maxWidth: 250 }}>
          <Tooltip title={reaction}>
            <span style={{ color: '#595959' }}>{reaction}</span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Thuốc cảnh báo',
      dataIndex: 'medications',
      key: 'medications',
      render: (medications) =>
        medications?.length > 0 ? (
          <Space wrap>
            {medications.map((med, idx) => (
              <Tag key={idx} color="red">
                {med}
              </Tag>
            ))}
          </Space>
        ) : (
          <span style={{ color: '#8c8c8c' }}>Không có</span>
        ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAllergy(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Count severe allergies
  const severeCount = allergies.filter((a) => a.severity === 'severe').length;
  const moderateCount = allergies.filter((a) => a.severity === 'moderate').length;

  return (
    <div className="page-container allergy-manager-container">
      <PageHeader
        title="Quản lý dị ứng"
        subtitle="Thông tin dị ứng và cảnh báo thuốc"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Thêm dị ứng
          </Button>
        }
      />

      {/* Alert for severe allergies */}
      {severeCount > 0 && (
        <Card
          style={{
            marginBottom: 24,
            backgroundColor: '#fff1f0',
            borderColor: '#ffccc7',
            borderWidth: 1,
          }}
        >
          <Row align="middle" gutter={16}>
            <Col>
              <WarningOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
            </Col>
            <Col flex="auto">
              <div>
                <strong style={{ color: '#ff4d4f' }}>Cảnh báo: Dị ứng nặng</strong>
                <div style={{ color: '#8c8c8c', marginTop: 4 }}>
                  Bệnh nhân có {severeCount} dị ứng mức độ nặng. Cần thận trọng khi
                  kê đơn thuốc.
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600 }}>
                {allergies.length}
              </div>
              <div style={{ color: '#8c8c8c', marginTop: 8 }}>Tổng dị ứng</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#ff4d4f' }}>
                {severeCount}
              </div>
              <div style={{ color: '#8c8c8c', marginTop: 8 }}>Dị ứng nặng</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14' }}>
                {moderateCount}
              </div>
              <div style={{ color: '#8c8c8c', marginTop: 8 }}>Dị ứng trung bình</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#52c41a',
                }}
              >
                {allergies.filter((a) => a.severity === 'mild').length}
              </div>
              <div style={{ color: '#8c8c8c', marginTop: 8 }}>Dị ứng nhẹ</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Allergy List */}
      <Card
        title="📋 Danh sách dị ứng"
        extra={
          <Input.Search
            placeholder="Tìm kiếm dị ứng..."
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
        }
        loading={loading}
      >
        {sortedAllergies.length > 0 ? (
          <Table
            columns={allergyColumns}
            dataSource={sortedAllergies}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        ) : (
          <Empty
            description={
              searchText ? 'Không tìm thấy dị ứng phù hợp' : 'Chưa có dị ứng nào ghi nhận'
            }
            style={{ margin: '40px 0' }}
          >
            {!searchText && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal()}
              >
                Thêm dị ứng đầu tiên
              </Button>
            )}
          </Empty>
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={editingAllergy ? 'Sửa dị ứng' : 'Thêm dị ứng mới'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingAllergy(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="allergen"
            label="Chất gây dị ứng"
            rules={[{ required: true, message: 'Vui lòng nhập chất gây dị ứng' }]}
          >
            <Input
              placeholder="VD: Penicillin, Pollen, Seafood..."
              prefix={<AlertOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="severity"
            label="Mức độ dị ứng"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
          >
            <Select placeholder="Chọn mức độ dị ứng">
              <Option value="mild">🟢 Nhẹ - Triệu chứng nhẹ, tự hết</Option>
              <Option value="moderate">
                🟠 Trung bình - Triệu chứng rõ rệt, cần điều trị
              </Option>
              <Option value="severe">
                🔴 Nặng - Triệu chứng nặng, có thể nguy hiểm
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reaction"
            label="Phản ứng dị ứng"
            rules={[{ required: true, message: 'Vui lòng mô tả phản ứng' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Mô tả chi tiết các triệu chứng dị ứng: phát疹, ngứa, phù nề, khó thở..."
            />
          </Form.Item>

          <Form.Item
            name="medications"
            label="Thuốc cảnh báo (phân cách bằng dấu phẩy)"
          >
            <Input placeholder="VD: Amoxicillin, Aspirin, Ibuprofen" />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú bổ sung">
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú thêm về dị ứng này (nếu có)"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  setEditingAllergy(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingAllergy ? 'Cập nhật' : 'Thêm'} dị ứng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Information Card */}
      <Card
        style={{ marginTop: 16, backgroundColor: '#f0f5ff' }}
        title={
          <>
            <InfoCircleOutlined /> Lưu ý quan trọng
          </>
        }
      >
        <ul style={{ margin: 0, paddingLeft: 20, color: '#0050b3' }}>
          <li>Luôn kiểm tra dị ứng trước khi kê đơn thuốc mới</li>
          <li>Cập nhật thông tin dị ứng khi phát hiện thêm dị ứng mới</li>
          <li>Dị ứng nặng cần được ghi chú rõ ràng để cảnh báo nhân viên y tế</li>
          <li>Nếu bệnh nhân có phản ứng dị ứng nặng, cần chuẩn bị sẵn thuốc chống sốc phaphylaxis</li>
        </ul>
      </Card>
    </div>
  );
};

export default AllergyManager;
