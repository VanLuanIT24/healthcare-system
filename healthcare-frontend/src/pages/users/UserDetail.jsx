// 👤 User Detail Page
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    DeleteOutlined,
    EditOutlined,
    HomeOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    UnlockOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Descriptions,
    Modal,
    Space,
    Table,
    Tabs,
    Tag,
    message,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROLE_LABELS } from '../../constants/roles';
import userAPI from '../../services/api/userAPI';
import './UserManagement.css';

const { TabPane } = Tabs;

const UserDetail = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    loadUser();
    loadActivityLogs();
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await userAPI.getUserById(id);
      setUser(response.data);
    } catch (error) {
      message.error('Không thể tải thông tin người dùng');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    // Mock data for activity logs
    setActivityLogs([
      {
        key: '1',
        action: 'Đăng nhập',
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
      },
      {
        key: '2',
        action: 'Cập nhật hồ sơ',
        timestamp: new Date(Date.now() - 3600000),
        ipAddress: '192.168.1.1',
      },
    ]);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa người dùng này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await userAPI.deleteUser(id);
          message.success('Đã xóa người dùng');
          navigate('/users');
        } catch (error) {
          message.error('Xóa người dùng thất bại');
        }
      },
    });
  };

  const handleToggleStatus = async () => {
    try {
      if (user.status === 'active') {
        await userAPI.disableUser(id);
        message.success('Đã vô hiệu hóa người dùng');
      } else {
        await userAPI.enableUser(id);
        message.success('Đã kích hoạt người dùng');
      }
      loadUser();
    } catch (error) {
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  const activityColumns = [
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time) => moment(time).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
  ];

  if (loading) {
    return <Card loading />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/users')}
            style={{ marginBottom: 8 }}
          >
            Quay lại
          </Button>
          <h1 className="page-title">Thông tin người dùng</h1>
        </div>
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/users/${id}/edit`)}
          >
            Chỉnh sửa
          </Button>
          <Button
            icon={user?.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
            onClick={handleToggleStatus}
          >
            {user?.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            Xóa
          </Button>
        </Space>
      </div>

      <Card>
        <div className="user-detail-avatar">
          <Avatar size={120} src={user?.profilePicture} icon={<UserOutlined />} />
          <h2 style={{ marginTop: 16, marginBottom: 4 }}>{user?.fullName}</h2>
          <Space>
            <Tag color="blue">{ROLE_LABELS[user?.role] || user?.role}</Tag>
            <Tag color={user?.status === 'active' ? 'green' : 'red'}>
              {user?.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
            </Tag>
          </Space>
        </div>

        <Tabs defaultActiveKey="1" style={{ marginTop: 32 }}>
          <TabPane tab="Thông tin cơ bản" key="1">
            <Descriptions bordered column={1}>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {user?.email}
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                {user?.phone || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Khác'}
              </Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined /> Ngày sinh</>}>
                {user?.dateOfBirth ? moment(user.dateOfBirth).format('DD/MM/YYYY') : 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label={<><HomeOutlined /> Địa chỉ</>}>
                {user?.address || 'Chưa cập nhật'}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Thông tin công việc" key="2">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Vai trò">
                <Tag color="blue">{ROLE_LABELS[user?.role] || user?.role}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Chức vụ">
                {user?.position || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Khoa">
                {user?.department || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia">
                {moment(user?.createdAt).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {moment(user?.updatedAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Lịch sử hoạt động" key="3">
            <Table
              columns={activityColumns}
              dataSource={activityLogs}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default UserDetail;
