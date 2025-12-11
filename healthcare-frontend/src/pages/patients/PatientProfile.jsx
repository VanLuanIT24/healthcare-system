// 👤 Patient Profile Page
import {
    AlertOutlined,
    ContactsOutlined,
    DeleteOutlined,
    EditOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    HeartOutlined,
    MailOutlined,
    PhoneOutlined,
    PlusOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Empty,
    Form,
    Input,
    List,
    message,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tabs,
    Tag
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import clinicalExtendedAPI from '../../services/api/clinicalExtendedAPI';
import patientAPI from '../../services/api/patientAPI';
import patientExtendedAPI from '../../services/api/patientExtendedAPI';
import './PatientProfile.css';

const { Option } = Select;

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allergies, setAllergies] = useState([]);
  const [insurance, setInsurance] = useState(null);
  const [familyHistory, setFamilyHistory] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [allergyModal, setAllergyModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      // Load patient info
      const patientRes = await patientAPI.getPatient(id);
      setPatient(patientRes.data);

      // Load extended data
      const allergyRes = await patientExtendedAPI.getPatientAllergies(id);
      setAllergies(allergyRes.data || []);

      const insuranceRes = await patientExtendedAPI.getPatientInsurance(id);
      setInsurance(insuranceRes.data || null);

      const familyRes = await patientExtendedAPI.getPatientFamilyHistory(id);
      setFamilyHistory(familyRes.data || []);

      const contactRes = await patientExtendedAPI.getEmergencyContacts(id);
      setEmergencyContacts(contactRes.data || []);

      const vitalRes = await clinicalExtendedAPI.getVitalSigns(id);
      setVitalSigns(vitalRes.data || []);
    } catch (error) {
      message.error('Không thể tải thông tin bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllergy = async (values) => {
    try {
      await patientExtendedAPI.addPatientAllergy(id, values);
      message.success('Thêm dị ứng thành công');
      setAllergyModal(false);
      form.resetFields();
      loadPatientData();
    } catch (error) {
      message.error('Thêm dị ứng thất bại');
    }
  };

  const handleDeleteAllergy = (allergyId) => {
    Modal.confirm({
      title: 'Xóa dị ứng',
      content: 'Bạn có chắc chắn muốn xóa thông tin dị ứng này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await patientExtendedAPI.removePatientAllergy(id, allergyId);
          message.success('Đã xóa dị ứng');
          loadPatientData();
        } catch (error) {
          message.error('Xóa dị ứng thất bại');
        }
      },
    });
  };

  const handleDeleteEmergencyContact = (contactId) => {
    Modal.confirm({
      title: 'Xóa liên hệ khẩn cấp',
      content: 'Bạn có chắc chắn muốn xóa liên hệ khẩn cấp này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await patientExtendedAPI.removeEmergencyContact(id, contactId);
          message.success('Đã xóa liên hệ khẩn cấp');
          loadPatientData();
        } catch (error) {
          message.error('Xóa liên hệ khẩn cấp thất bại');
        }
      },
    });
  };

  if (loading) {
    return <div className="page-container">Đang tải...</div>;
  }

  if (!patient) {
    return (
      <div className="page-container">
        <Empty description="Bệnh nhân không tồn tại" />
      </div>
    );
  }

  const allergyColumns = [
    {
      title: 'Chất gây dị ứng',
      dataIndex: 'allergen',
      key: 'allergen',
      render: (allergen) => <strong>{allergen}</strong>,
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const colors = { mild: 'green', moderate: 'orange', severe: 'red' };
        const labels = { mild: 'Nhẹ', moderate: 'Trung bình', severe: 'Nặng' };
        return <Tag color={colors[severity]}>{labels[severity]}</Tag>;
      },
    },
    {
      title: 'Phản ứng',
      dataIndex: 'reaction',
      key: 'reaction',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteAllergy(record._id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const contactColumns = [
    {
      title: 'Mối quan hệ',
      dataIndex: 'relationship',
      key: 'relationship',
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteEmergencyContact(record._id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const vitalSignsColumns = [
    {
      title: 'Ngày giờ',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.timestamp).unix() - moment(b.timestamp).unix(),
    },
    {
      title: 'Huyết áp',
      key: 'bloodPressure',
      render: (_, record) => `${record.bloodPressure?.systolic || '-'}/${record.bloodPressure?.diastolic || '-'} mmHg`,
    },
    {
      title: 'Nhịp tim',
      dataIndex: 'heartRate',
      key: 'heartRate',
      render: (rate) => `${rate || '-'} bpm`,
    },
    {
      title: 'Nhiệt độ',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (temp) => `${temp || '-'}°C`,
    },
    {
      title: 'O₂',
      dataIndex: 'oxygenSaturation',
      key: 'oxygenSaturation',
      render: (O2) => `${O2 || '-'}%`,
    },
  ];

  return (
    <div className="page-container patient-profile-container">
      <PageHeader
        title={`Hồ sơ bệnh nhân: ${patient.fullName}`}
        subtitle={`Mã bệnh nhân: ${patient.patientId}`}
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/patients/${id}/edit`)}
            >
              Sửa thông tin
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => navigate(`/patients/${id}/medical-records`)}
            >
              Hồ sơ y tế
            </Button>
          </Space>
        }
      />

      {/* Patient Header Card */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <Avatar
              size={120}
              src={patient.profilePicture}
              icon={<UserOutlined />}
              style={{ marginBottom: 16 }}
            />
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{patient.fullName}</div>
            <Tag color="blue">{patient.gender === 'M' ? 'Nam' : 'Nữ'}</Tag>
          </Col>
          <Col xs={24} sm={18}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 12 }}>
                  <strong>
                    <PhoneOutlined /> Điện thoại:
                  </strong>
                  <div style={{ color: '#595959' }}>{patient.phone}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>
                    <MailOutlined /> Email:
                  </strong>
                  <div style={{ color: '#595959' }}>{patient.email}</div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 12 }}>
                  <strong>
                    <EnvironmentOutlined /> Địa chỉ:
                  </strong>
                  <div style={{ color: '#595959' }}>{patient.address}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Ngày sinh:</strong>
                  <div style={{ color: '#595959' }}>
                    {moment(patient.dateOfBirth).format('DD/MM/YYYY')} ({moment().diff(moment(patient.dateOfBirth), 'years')} tuổi)
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'info',
              label: '📋 Thông tin cơ bản',
              children: (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <div>
                        <strong>Dân tộc:</strong>
                        <div style={{ color: '#595959' }}>{patient.ethnicity || 'N/A'}</div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <strong>Nghề nghiệp:</strong>
                        <div style={{ color: '#595959' }}>{patient.occupation || 'N/A'}</div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <strong>Trạng thái hôn nhân:</strong>
                        <div style={{ color: '#595959' }}>{patient.maritalStatus || 'N/A'}</div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <strong>CMND/CCCD:</strong>
                        <div style={{ color: '#595959' }}>{patient.identityNumber || 'N/A'}</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: 'allergies',
              label: (
                <>
                  <AlertOutlined /> Dị ứng ({allergies.length})
                </>
              ),
              children: (
                <div>
                  {allergies.length > 0 ? (
                    <Table
                      columns={allergyColumns}
                      dataSource={allergies}
                      rowKey="_id"
                      pagination={false}
                      style={{ marginBottom: 16 }}
                    />
                  ) : (
                    <Empty description="Không có thông tin dị ứng" style={{ margin: '20px 0' }} />
                  )}
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setAllergyModal(true)}
                  >
                    Thêm dị ứng
                  </Button>
                </div>
              ),
            },
            {
              key: 'insurance',
              label: '🏥 Bảo hiểm',
              children: (
                <div>
                  {insurance ? (
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <div>
                          <strong>Công ty bảo hiểm:</strong>
                          <div style={{ color: '#595959' }}>{insurance.insuranceCompany}</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div>
                          <strong>Mã bảo hiểm:</strong>
                          <div style={{ color: '#595959' }}>{insurance.insuranceNumber}</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div>
                          <strong>Ngày hiệu lực:</strong>
                          <div style={{ color: '#595959' }}>
                            {moment(insurance.effectiveDate).format('DD/MM/YYYY')}
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div>
                          <strong>Ngày hết hạn:</strong>
                          <div style={{ color: '#595959' }}>
                            {moment(insurance.expiryDate).format('DD/MM/YYYY')}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  ) : (
                    <Empty description="Không có thông tin bảo hiểm" />
                  )}
                </div>
              ),
            },
            {
              key: 'family',
              label: '👨‍👩‍👧‍👦 Tiền sử gia đình',
              children: (
                <div>
                  {familyHistory.length > 0 ? (
                    <List
                      dataSource={familyHistory}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            title={`${item.relationshipToPatient}: ${item.condition}`}
                            description={`Tình trạng: ${item.status || 'N/A'}`}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="Không có tiền sử gia đình ghi nhận" />
                  )}
                </div>
              ),
            },
            {
              key: 'contacts',
              label: (
                <>
                  <ContactsOutlined /> Liên hệ khẩn cấp ({emergencyContacts.length})
                </>
              ),
              children: (
                <div>
                  {emergencyContacts.length > 0 ? (
                    <Table
                      columns={contactColumns}
                      dataSource={emergencyContacts}
                      rowKey="_id"
                      pagination={false}
                    />
                  ) : (
                    <Empty description="Không có liên hệ khẩn cấp" style={{ margin: '20px 0' }} />
                  )}
                </div>
              ),
            },
            {
              key: 'vitals',
              label: (
                <>
                  <HeartOutlined /> Dấu hiệu sinh tồn ({vitalSigns.length})
                </>
              ),
              children: (
                <div>
                  {vitalSigns.length > 0 ? (
                    <Table
                      columns={vitalSignsColumns}
                      dataSource={vitalSigns}
                      rowKey="_id"
                      pagination={{ pageSize: 10 }}
                    />
                  ) : (
                    <Empty description="Chưa có ghi nhận dấu hiệu sinh tồn" />
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Allergy Modal */}
      <Modal
        title="Thêm thông tin dị ứng"
        open={allergyModal}
        onCancel={() => {
          setAllergyModal(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddAllergy}>
          <Form.Item
            name="allergen"
            label="Chất gây dị ứng"
            rules={[{ required: true, message: 'Vui lòng nhập chất gây dị ứng' }]}
          >
            <Input placeholder="VD: Penicillin, Pollen..." />
          </Form.Item>

          <Form.Item
            name="severity"
            label="Mức độ"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
          >
            <Select>
              <Option value="mild">Nhẹ</Option>
              <Option value="moderate">Trung bình</Option>
              <Option value="severe">Nặng</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reaction"
            label="Phản ứng"
            rules={[{ required: true, message: 'Vui lòng mô tả phản ứng' }]}
          >
            <Input.TextArea rows={3} placeholder="Mô tả các triệu chứng dị ứng..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setAllergyModal(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PatientProfile;
