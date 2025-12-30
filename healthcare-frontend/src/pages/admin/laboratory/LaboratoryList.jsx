import AdminLayout from '@/components/layout/admin/AdminLayout';
import laboratoryAPI from '@/services/api/laboratoryAPI';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Input, message, Space, Spin, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LaboratoryList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchOrders = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await laboratoryAPI.getLabOrders({
        page,
        limit,
        patientId: searchText || undefined,
      });
      
      // Extract orders array from response
      const ordersArray = Array.isArray(response?.data?.orders) ? response.data.orders : [];
      setOrders(ordersArray);
      
      // Extract pagination info
      if (response?.data?.pagination) {
        setPagination({
          current: page,
          pageSize: limit,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      console.error('Error fetching lab orders:', error);
      setOrders([]);
      message.error('Lỗi tải danh sách xét nghiệm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    fetchOrders(1, pagination.pageSize);
  };

  const handleTableChange = (newPagination) => {
    fetchOrders(newPagination.current, newPagination.pageSize);
  };

  const handleDelete = async (id) => {
    try {
      await laboratoryAPI.cancelLabOrder(id, 'Deleted by admin');
      message.success('Hủy đơn xét nghiệm thành công');
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Lỗi hủy đơn xét nghiệm');
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      PENDING: { color: 'orange', text: 'Chờ xử lý' },
      COMPLETED: { color: 'green', text: 'Hoàn thành' },
      APPROVED: { color: 'blue', text: 'Đã duyệt' },
      SAMPLE_COLLECTED: { color: 'purple', text: 'Đã lấy mẫu' },
      CANCELLED: { color: 'red', text: 'Đã hủy' },
      CRITICAL: { color: 'volcano', text: 'Nguy hiểm' },
    };
    return statusMap[status] || { color: 'default', text: status };
  };

  const testTypeMap = {
    blood_test: '🩸 Xét nghiệm máu',
    urine_test: '💧 Xét nghiệm nước tiểu',
    covid_test: '🦠 COVID-19',
    glucose_test: '🍬 Đường huyết',
    cholesterol_test: '❤️ Cholesterol',
    liver_function: '🏥 Chức năng gan',
    kidney_function: '🏥 Chức năng thận',
    thyroid_test: '⚡ Tuyến giáp',
    cancer_marker: '⚠️ Ung thư',
    pregnancy_test: '🤰 Thai',
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (text) => <span className="font-mono text-xs">{text?.slice(-8) || 'N/A'}</span>,
    },
    {
      title: 'ID Bệnh nhân',
      dataIndex: 'patientId',
      key: 'patientId',
      width: 130,
    },
    {
      title: 'Loại xét nghiệm',
      dataIndex: 'testType',
      key: 'testType',
      width: 150,
      render: (type) => testTypeMap[type] || type,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusInfo = getStatusTag(status);
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderedDate',
      key: 'orderedDate',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/admin/laboratory/${record._id}`)}
            title="Xem chi tiết"
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/admin/laboratory/${record._id}`)}
            title="Chỉnh sửa"
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record._id)}
            title="Hủy"
          />
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Quản lý Xét nghiệm</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/laboratory/create')}
          >
            Tạo đơn xét nghiệm mới
          </Button>
        </div>

        <Card className="rounded-lg">
          <div className="mb-4">
            <Input
              placeholder="Tìm kiếm theo ID bệnh nhân hoặc ID xét nghiệm..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </div>

          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="_id"
              pagination={pagination}
              onChange={handleTableChange}
              bordered
              size="middle"
              scroll={{ x: 1200 }}
            />
          </Spin>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default LaboratoryList;
