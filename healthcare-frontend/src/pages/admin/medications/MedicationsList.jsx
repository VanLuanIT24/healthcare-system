import AdminLayout from '@/components/layout/admin/AdminLayout';
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Skeleton, Table, Tag, Tooltip, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMedications } from '@/services/api/medicationAPI';

const MedicationsList = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '' });
  const navigate = useNavigate();

  const fetchMedications = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const params = { page, limit, search: filters.search };
      const res = await getMedications(params);
      setMedications(res.data?.data || []);
      setPagination({
        current: res.data?.pagination?.currentPage || page,
        pageSize: res.data?.pagination?.pageSize || limit,
        total: res.data?.pagination?.total || 0,
      });
    } catch (error) {
      message.error('Lỗi tải danh sách dược phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications(1, pagination.pageSize);
    // eslint-disable-next-line
  }, [filters]);

  const handleTableChange = (pagination) => {
    fetchMedications(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: 'Tên thuốc',
      key: 'name',
      width: '25%',
      render: (_, record) => <strong>{record?.name}</strong>
    },
    {
      title: 'Loại',
      key: 'type',
      width: '10%',
      render: (_, record) => record?.type
    },
    {
      title: 'Tồn kho',
      key: 'stock',
      width: '10%',
      render: (_, record) => {
        const lowStock = record?.stock?.current <= (record?.stock?.reorderLevel || 20);
        return (
          <span>
            {record?.stock?.current}
            {lowStock && (
              <Tooltip title="Tồn kho thấp">
                <Tag color="red" style={{ marginLeft: 4 }}><ExclamationCircleOutlined /></Tag>
              </Tooltip>
            )}
          </span>
        );
      }
    },
    {
      title: 'Hạn sử dụng',
      key: 'expiry',
      width: '15%',
      render: (_, record) => record?.expiryDate ? <Tag color={new Date(record.expiryDate) < new Date(Date.now() + 1000*60*60*24*30) ? 'orange' : 'green'}>{record.expiryDate}</Tag> : '—'
    },
    {
      title: 'Giá bán',
      key: 'price',
      width: '10%',
      render: (_, record) => record?.pricing?.sellingPrice ? `${record.pricing.sellingPrice}₫` : '—'
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '15%',
      fixed: 'right',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => navigate(`/admin/medications/${record?._id}`)}>
          Chi tiết
        </Button>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Quản lý Dược phẩm / Kho</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/medications/create')}>
            Thêm thuốc
          </Button>
        </div>

        <Card className="rounded-lg">
          <Input placeholder="Tìm thuốc, vật tư..." prefix={<SearchOutlined />} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </Card>

        <Card className="rounded-lg">
          {loading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : (
            <Table columns={columns} dataSource={medications} rowKey="_id" pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total }} scroll={{ x: 1000 }} onChange={handleTableChange} />
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default MedicationsList;
