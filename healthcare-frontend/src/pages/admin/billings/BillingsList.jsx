import AdminLayout from '@/components/layout/admin/AdminLayout';
import billingAPI from '@/services/api/billingAPI';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Input, message, Space, Spin, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BillingsList = () => {
  const navigate = useNavigate();
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchBillings = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await billingAPI.getBills({
        page,
        limit,
        patientId: searchText || undefined,
      });
      
      // Extract bills array from response
      const billsArray = Array.isArray(response?.data?.bills) ? response.data.bills : [];
      setBillings(billsArray);
      
      // Extract pagination info
      if (response?.data?.pagination) {
        setPagination({
          current: page,
          pageSize: limit,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      console.error('Error fetching billings:', error);
      setBillings([]);
      message.error('Lỗi tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillings();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    fetchBillings(1, pagination.pageSize);
  };

  const handleTableChange = (newPagination) => {
    fetchBillings(newPagination.current, newPagination.pageSize);
  };

  const handleDelete = async (id) => {
    try {
      await billingAPI.voidBill(id, 'Deleted by admin');
      message.success('Xóa hóa đơn thành công');
      fetchBillings(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Lỗi xóa hóa đơn');
    }
  };

  const getPaymentStatusTag = (status) => {
    const statusMap = {
      PAID: { color: 'green', text: 'Đã thanh toán' },
      UNPAID: { color: 'red', text: 'Chưa thanh toán' },
      PARTIAL: { color: 'orange', text: 'Thanh toán một phần' },
      OVERDUE: { color: 'volcano', text: 'Quá hạn' },
      CANCELLED: { color: 'default', text: 'Đã hủy' },
    };
    return statusMap[status] || { color: 'default', text: status };
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
      title: 'Số tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount) => `${amount?.toLocaleString('vi-VN')} ₫`,
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 130,
      render: (method) => {
        const methods = {
          CASH: '💵 Tiền mặt',
          CARD: '💳 Thẻ',
          BANK_TRANSFER: '🏦 Chuyển khoản',
          INSURANCE: '📋 Bảo hiểm',
          CHEQUE: '✓ Séc',
        };
        return methods[method] || method;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 120,
      render: (status) => {
        const statusInfo = getPaymentStatusTag(status);
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
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
            onClick={() => navigate(`/admin/billings/${record._id}`)}
            title="Xem chi tiết"
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/admin/billings/${record._id}`)}
            title="Chỉnh sửa"
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record._id)}
            title="Xóa"
          />
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Quản lý Hóa đơn</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/billings/create')}
          >
            Tạo hóa đơn mới
          </Button>
        </div>

        <Card className="rounded-lg">
          <div className="mb-4">
            <Input
              placeholder="Tìm kiếm theo ID bệnh nhân hoặc ID hóa đơn..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </div>

          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={billings}
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

export default BillingsList;
