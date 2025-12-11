// 📝 Progress Notes
import {
    CalendarOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Empty,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Tag,
    Timeline
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import clinicalExtendedAPI from '../../services/api/clinicalExtendedAPI';
import './Clinical.css';

const { TextArea } = Input;
const { Option } = Select;

const ProgressNotes = () => {
  const { patientId } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    search: '',
    dateRange: null,
  });

  useEffect(() => {
    loadProgressNotes();
  }, [patientId, filters]);

  const loadProgressNotes = async () => {
    try {
      setLoading(true);
      const response = await clinicalExtendedAPI.getProgressNotes({
        patientId,
        search: filters.search,
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString(),
      });
      setNotes(response.data || []);
    } catch (error) {
      message.error('Không thể tải ghi chú tiến trình');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (note = null) => {
    setEditingNote(note);
    if (note) {
      form.setFieldsValue({
        title: note.title,
        content: note.content,
        noteType: note.noteType,
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingNote) {
        await clinicalExtendedAPI.updateProgressNote(editingNote._id, {
          ...values,
          patientId,
        });
        message.success('Cập nhật ghi chú thành công');
      } else {
        await clinicalExtendedAPI.createProgressNote({
          ...values,
          patientId,
        });
        message.success('Tạo ghi chú thành công');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingNote(null);
      loadProgressNotes();
    } catch (error) {
      message.error((error.response?.data?.message || 'Lỗi khi lưu ghi chú'));
    }
  };

  const handleDeleteNote = (noteId) => {
    Modal.confirm({
      title: 'Xóa ghi chú',
      content: 'Bạn có chắc chắn muốn xóa ghi chú này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // Assuming there's a delete method
          await clinicalExtendedAPI.deleteProgressNote?.(noteId);
          message.success('Đã xóa ghi chú');
          loadProgressNotes();
        } catch (error) {
          message.error('Xóa ghi chú thất bại');
        }
      },
    });
  };

  const getNoteTypeColor = (type) => {
    const colors = {
      clinical: 'blue',
      assessment: 'orange',
      treatment: 'green',
      follow_up: 'cyan',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  const getNoteTypeLabel = (type) => {
    const labels = {
      clinical: 'Ghi chú lâm sàng',
      assessment: 'Đánh giá',
      treatment: 'Điều trị',
      follow_up: 'Theo dõi',
      other: 'Khác',
    };
    return labels[type] || type;
  };

  return (
    <div className="page-container progress-notes-container">
      <PageHeader
        title="Ghi chú tiến trình"
        subtitle="Lịch sử ghi chú lâm sàng của bệnh nhân"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Thêm ghi chú
          </Button>
        }
      />

      {/* Filters */}
      <Card className="filter-section" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Input.Search
              placeholder="Tìm kiếm ghi chú..."
              allowClear
              prefix={<SearchOutlined />}
              onSearch={(value) =>
                setFilters({ ...filters, search: value })
              }
            />
          </Col>
          <Col xs={24} md={12}>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={(dates) =>
                setFilters({ ...filters, dateRange: dates })
              }
            />
          </Col>
        </Row>
      </Card>

      {/* Notes Timeline */}
      <Card loading={loading} title="📝 Danh sách ghi chú">
        {notes.length > 0 ? (
          <Timeline
            items={notes.map((note) => ({
              children: (
                <Card size="small" className="progress-note-card">
                  <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                    <Col>
                      <div>
                        <strong style={{ fontSize: 16 }}>{note.title}</strong>
                        <Tag
                          color={getNoteTypeColor(note.noteType)}
                          style={{ marginLeft: 8 }}
                        >
                          {getNoteTypeLabel(note.noteType)}
                        </Tag>
                      </div>
                      <div style={{ color: '#8c8c8c', marginTop: 4, fontSize: 12 }}>
                        <CalendarOutlined /> {moment(note.createdAt).format('DD/MM/YYYY HH:mm')}
                        {note.createdBy && (
                          <>
                            {' • '}
                            <UserOutlined /> {note.createdBy.fullName || 'Unknown'}
                          </>
                        )}
                      </div>
                    </Col>
                    <Space>
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenModal(note)}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteNote(note._id)}
                      >
                        Xóa
                      </Button>
                    </Space>
                  </Row>

                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: '#fafafa',
                      borderRadius: 4,
                      marginBottom: 12,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {note.content}
                  </div>

                  {note.updatedAt && note.updatedAt !== note.createdAt && (
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      Cập nhật lần cuối: {moment(note.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </div>
                  )}
                </Card>
              ),
              dot: (
                <span
                  style={{
                    backgroundColor: '#1890ff',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    display: 'block',
                    border: '2px solid white',
                  }}
                />
              ),
            }))}
          />
        ) : (
          <Empty description="Chưa có ghi chú nào" style={{ margin: '40px 0' }} />
        )}
      </Card>

      {/* Modal */}
      <Modal
        title={editingNote ? 'Sửa ghi chú' : 'Thêm ghi chú mới'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingNote(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="VD: Khám lâm sàng định kỳ" />
          </Form.Item>

          <Form.Item
            name="noteType"
            label="Loại ghi chú"
            rules={[{ required: true, message: 'Vui lòng chọn loại ghi chú' }]}
          >
            <Select placeholder="Chọn loại ghi chú">
              <Option value="clinical">Ghi chú lâm sàng</Option>
              <Option value="assessment">Đánh giá</Option>
              <Option value="treatment">Điều trị</Option>
              <Option value="follow_up">Theo dõi</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung ghi chú' },
              { min: 10, message: 'Nội dung phải ít nhất 10 ký tự' },
            ]}
          >
            <TextArea
              rows={10}
              placeholder="Nhập nội dung ghi chú chi tiết tại đây..."
              allowClear
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  setEditingNote(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingNote ? 'Cập nhật' : 'Tạo'} ghi chú
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Tips */}
      <Card style={{ marginTop: 16, backgroundColor: '#e6f7ff' }}>
        <div style={{ color: '#0050b3', fontSize: 12 }}>
          💡 <strong>Mẹo:</strong> Ghi chú tiến trình giúp theo dõi diễn biến bệnh của bệnh nhân.
          Hãy ghi chép đầy đủ, chính xác và kịp thời các thay đổi lâm sàng.
        </div>
      </Card>
    </div>
  );
};

export default ProgressNotes;
