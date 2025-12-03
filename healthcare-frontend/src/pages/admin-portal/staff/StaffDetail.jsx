import {
    ArrowLeftOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    TrophyOutlined,
    UnlockOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Descriptions,
    List,
    message,
    Modal,
    Progress,
    Row,
    Space,
    Spin,
    Statistic,
    Table,
    Tabs,
    Tag,
    Timeline,
    Typography
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { staffApi } from '../../../services/adminApi';
import EditStaffModal from './EditStaffModal';

const { Title, Text } = Typography;
const { confirm } = Modal;

const StaffDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('1');
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    fetchStaffDetail();
  }, [id]);

  const fetchStaffDetail = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getById(id);
      
      if (response.success && response.data) {
        setStaff(response.data.user || response.data);
      }
    } catch (error) {
      console.error('❌ [STAFF DETAIL] Fetch error:', error);
      message.error('Không thể tải thông tin nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const handleDisable = () => {
    confirm({
      title: 'Xác nhận vô hiệu hóa nhân viên',
      content: `Bạn có chắc chắn muốn vô hiệu hóa nhân viên ${staff?.personalInfo?.firstName} ${staff?.personalInfo?.lastName}?`,
      okText: 'Vô hiệu hóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await staffApi.disable(id, 'Vô hiệu hóa bởi admin');
          message.success('Đã vô hiệu hóa nhân viên thành công');
          fetchStaffDetail();
        } catch (error) {
          message.error(error.response?.data?.message || 'Không thể vô hiệu hóa nhân viên');
        }
      }
    });
  };

  const handleEnable = () => {
    confirm({
      title: 'Xác nhận kích hoạt lại nhân viên',
      content: `Bạn có chắc chắn muốn kích hoạt lại nhân viên ${staff?.personalInfo?.firstName} ${staff?.personalInfo?.lastName}?`,
      okText: 'Kích hoạt',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await staffApi.enable(id);
          message.success('Đã kích hoạt lại nhân viên thành công');
          fetchStaffDetail();
        } catch (error) {
          message.error(error.response?.data?.message || 'Không thể kích hoạt nhân viên');
        }
      }
    });
  };

  const handleDelete = () => {
    confirm({
      title: 'Xác nhận xóa nhân viên',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa nhân viên <strong>{staff?.personalInfo?.firstName} {staff?.personalInfo?.lastName}</strong>?</p>
          <p style={{ color: 'red' }}>⚠️ Hành động này không thể hoàn tác!</p>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await staffApi.delete(id, 'Xóa bởi admin');
          message.success('Đã xóa nhân viên thành công');
          navigate('/admin/staff');
        } catch (error) {
          message.error(error.response?.data?.message || 'Không thể xóa nhân viên');
        }
      }
    });
  };

  const getRoleLabel = (role) => {
    const labels = {
      SUPER_ADMIN: 'Super Admin',
      HOSPITAL_ADMIN: 'Quản trị viên',
      DEPARTMENT_HEAD: 'Trưởng khoa',
      DOCTOR: 'Bác sĩ',
      NURSE: 'Y tá',
      PHARMACIST: 'Dược sĩ',
      LAB_TECHNICIAN: 'Kỹ thuật viên XN',
      RECEPTIONIST: 'Lễ tân',
      BILLING_STAFF: 'Kế toán'
    };
    return labels[role] || role;
  };

  // Tab 1: Thông tin chung
  const GeneralInfoTab = () => (
    <Card>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8} style={{ textAlign: 'center' }}>
          <Avatar 
            size={120} 
            src={staff?.personalInfo?.profilePicture}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
          >
            {staff?.personalInfo?.firstName?.[0]}
          </Avatar>
          <Title level={4}>
            {staff?.personalInfo?.firstName} {staff?.personalInfo?.lastName}
          </Title>
          <Tag color="blue" style={{ marginBottom: 8 }}>
            {getRoleLabel(staff?.role)}
          </Tag>
          <div style={{ marginTop: 16 }}>
            <Badge status={staff?.status === 'ACTIVE' ? 'success' : 'default'} 
                   text={staff?.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'} />
          </div>
        </Col>

        <Col xs={24} md={16}>
          <Descriptions title="Thông tin cá nhân" bordered column={1}>
            <Descriptions.Item label="Email">
              <Space>
                <MailOutlined />
                {staff?.email}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Space>
                <PhoneOutlined />
                {staff?.personalInfo?.phone || 'Chưa cập nhật'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {staff?.personalInfo?.dateOfBirth 
                ? moment(staff.personalInfo.dateOfBirth).format('DD/MM/YYYY')
                : 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {staff?.personalInfo?.gender === 'MALE' ? 'Nam' : 
               staff?.personalInfo?.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {staff?.personalInfo?.address?.street}, {staff?.personalInfo?.address?.city}
            </Descriptions.Item>
          </Descriptions>

          {['DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECHNICIAN'].includes(staff?.role) && (
            <Descriptions title="Thông tin chuyên môn" bordered column={1} style={{ marginTop: 24 }}>
              <Descriptions.Item label="Số giấy phép">
                {staff?.professionalInfo?.licenseNumber || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Chuyên môn">
                {staff?.professionalInfo?.specialization || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Khoa/Phòng">
                {staff?.professionalInfo?.department || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Số năm kinh nghiệm">
                {staff?.professionalInfo?.yearsOfExperience || 0} năm
              </Descriptions.Item>
              <Descriptions.Item label="Ngày vào làm">
                {staff?.professionalInfo?.hireDate 
                  ? moment(staff.professionalInfo.hireDate).format('DD/MM/YYYY')
                  : 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Bằng cấp">
                {staff?.professionalInfo?.qualifications?.join(', ') || 'Chưa cập nhật'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Col>
      </Row>
    </Card>
  );

  // Tab 2: Phân quyền
  const PermissionsTab = () => {
    const permissions = [
      { module: 'Quản lý người dùng', permissions: ['Xem', 'Tạo', 'Sửa', 'Xóa'] },
      { module: 'Quản lý bệnh nhân', permissions: ['Xem', 'Tạo', 'Sửa'] },
      { module: 'Quản lý lịch hẹn', permissions: ['Xem', 'Tạo', 'Sửa', 'Hủy'] },
      { module: 'Hồ sơ bệnh án', permissions: ['Xem', 'Tạo', 'Sửa'] },
      { module: 'Đơn thuốc', permissions: ['Xem', 'Tạo'] },
      { module: 'Xét nghiệm', permissions: ['Xem'] },
      { module: 'Hóa đơn', permissions: ['Xem'] },
    ];

    const columns = [
      {
        title: 'Module',
        dataIndex: 'module',
        key: 'module',
      },
      {
        title: 'Quyền truy cập',
        dataIndex: 'permissions',
        key: 'permissions',
        render: (perms) => (
          <Space wrap>
            {perms.map((perm, idx) => (
              <Tag color="green" key={idx}>{perm}</Tag>
            ))}
          </Space>
        )
      }
    ];

    return (
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Phân quyền theo vai trò: {getRoleLabel(staff?.role)}</Title>
          <Text type="secondary">
            Các quyền được gán tự động dựa trên vai trò trong hệ thống
          </Text>
        </div>
        <Table 
          columns={columns} 
          dataSource={permissions}
          pagination={false}
          rowKey="module"
        />
      </Card>
    );
  };

  // Tab 3: Lịch làm việc
  const ScheduleTab = () => {
    const scheduleData = [
      { day: 'Thứ 2', shift: 'Sáng: 8:00 - 12:00, Chiều: 13:30 - 17:30', status: 'active' },
      { day: 'Thứ 3', shift: 'Sáng: 8:00 - 12:00, Chiều: 13:30 - 17:30', status: 'active' },
      { day: 'Thứ 4', shift: 'Sáng: 8:00 - 12:00', status: 'active' },
      { day: 'Thứ 5', shift: 'Sáng: 8:00 - 12:00, Chiều: 13:30 - 17:30', status: 'active' },
      { day: 'Thứ 6', shift: 'Sáng: 8:00 - 12:00, Chiều: 13:30 - 17:30', status: 'active' },
      { day: 'Thứ 7', shift: 'Nghỉ', status: 'off' },
      { day: 'Chủ nhật', shift: 'Nghỉ', status: 'off' },
    ];

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Lịch làm việc hàng tuần">
            <List
              dataSource={scheduleData}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text strong>{item.day}</Text>}
                    description={
                      <Text type={item.status === 'off' ? 'secondary' : 'default'}>
                        {item.shift}
                      </Text>
                    }
                  />
                  <Badge 
                    status={item.status === 'active' ? 'processing' : 'default'} 
                    text={item.status === 'active' ? 'Làm việc' : 'Nghỉ'}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Thông tin ca trực">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Statistic 
                title="Tổng giờ làm việc tuần này" 
                value={40} 
                suffix="giờ"
                prefix={<ClockCircleOutlined />}
              />
              <Statistic 
                title="Ca trực trong tháng" 
                value={4} 
                suffix="ca"
                prefix={<CalendarOutlined />}
              />
              <Timeline>
                <Timeline.Item color="green">Ca trực: 15/11/2024 - 18:00 đến 06:00</Timeline.Item>
                <Timeline.Item color="blue">Ca trực: 22/11/2024 - 18:00 đến 06:00</Timeline.Item>
                <Timeline.Item>Ca trực dự kiến: 29/11/2024 - 18:00 đến 06:00</Timeline.Item>
              </Timeline>
            </Space>
          </Card>
        </Col>
      </Row>
    );
  };

  // Tab 4: Hiệu suất
  const PerformanceTab = () => {
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic 
              title="Số ca khám tháng này" 
              value={156} 
              prefix={<UserOutlined />}
            />
            <Progress percent={78} status="active" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic 
              title="Đánh giá trung bình" 
              value={4.8} 
              suffix="/ 5"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <Progress percent={96} status="success" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic 
              title="Tỷ lệ hài lòng" 
              value={98} 
              suffix="%"
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={98} style={{ marginTop: 8 }} />
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Phản hồi gần đây từ bệnh nhân">
            <List
              dataSource={[
                { 
                  patient: 'Nguyễn Văn A', 
                  rating: 5, 
                  comment: 'Bác sĩ rất tận tâm và chu đáo',
                  date: '25/11/2024'
                },
                { 
                  patient: 'Trần Thị B', 
                  rating: 5, 
                  comment: 'Khám bệnh kỹ lưỡng, giải thích rõ ràng',
                  date: '24/11/2024'
                },
                { 
                  patient: 'Lê Văn C', 
                  rating: 4, 
                  comment: 'Dịch vụ tốt',
                  date: '23/11/2024'
                }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{item.patient}</Text>
                        <Tag color="gold">{'⭐'.repeat(item.rating)}</Tag>
                      </Space>
                    }
                    description={
                      <>
                        <div>{item.comment}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.date}
                        </Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  const tabItems = [
    {
      key: '1',
      label: 'Thông tin chung',
      children: <GeneralInfoTab />
    },
    {
      key: '2',
      label: 'Phân quyền',
      children: <PermissionsTab />
    },
    {
      key: '3',
      label: 'Lịch làm việc',
      children: <ScheduleTab />
    },
    {
      key: '4',
      label: 'Hiệu suất',
      children: staff?.role === 'DOCTOR' ? <PerformanceTab /> : (
        <Card>
          <Text type="secondary">Chức năng này chỉ áp dụng cho bác sĩ</Text>
        </Card>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header với các nút hành động */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/staff')}
            >
              Quay lại
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              Chi tiết nhân viên
            </Title>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button 
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              Chỉnh sửa
            </Button>
            {staff?.status === 'ACTIVE' ? (
              <Button 
                icon={<LockOutlined />}
                onClick={handleDisable}
                danger
              >
                Vô hiệu hóa
              </Button>
            ) : (
              <Button 
                icon={<UnlockOutlined />}
                onClick={handleEnable}
                type="primary"
              >
                Kích hoạt
              </Button>
            )}
            <Button 
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              danger
            >
              Xóa
            </Button>
          </Space>
        </Col>
      </Row>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* Modal chỉnh sửa */}
      <EditStaffModal
        visible={editModalVisible}
        staff={staff}
        onClose={() => setEditModalVisible(false)}
        onSuccess={() => {
          fetchStaffDetail();
          setEditModalVisible(false);
        }}
      />
    </div>
  );
};

export default StaffDetail;
