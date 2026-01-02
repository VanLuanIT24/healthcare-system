// src/pages/admin/doctors/DoctorListEnhanced.jsx
// Enhanced Doctor List with Bulk Operations & Advanced Features

import AdminLayout from '@/components/layout/admin/AdminLayout';
import { doctorAPI } from '@/services/api/doctorAPI';
import publicAPI from '@/services/api/publicAPI';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  DisconnectOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Modal,
  Row,
  Segmented,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip
} from 'antd';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorListEnhanced = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // table, card, stats
  const [stats, setStats] = useState(null);

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [specRes, deptRes, statsRes] = await Promise.all([
          publicAPI.getSpecialties(),
          publicAPI.getDepartments(),
          doctorAPI.getAllDoctorsStats()
        ]);

        if (specRes?.data?.data) {
          setSpecialties(specRes.data.data || []);
        }
        if (deptRes?.data?.data) {
          setDepartments(deptRes.data.data || []);
        }
        if (statsRes?.data?.data) {
          setStats(statsRes.data.data);
        }
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };

    loadFilterOptions();
  }, []);

  // Load doctors
  const loadDoctors = async () => {
    try {
      setLoading(true);
      const params = {
        page: pageNumber,
        limit: pageSize,
      };

      if (searchText) params.search = searchText;
      if (selectedSpecialty) params.specialty_id = selectedSpecialty;
      if (selectedDepartment) params.department_id = selectedDepartment;
      if (selectedGender) params.gender = selectedGender;
      if (selectedStatus) params.status = selectedStatus;

      const res = await doctorAPI.getDoctors(params);

      if (res.data?.data) {
        setDoctors(Array.isArray(res.data.data) ? res.data.data : []);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      message.error('Lỗi khi tải danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [pageNumber, pageSize, searchText, selectedSpecialty, selectedDepartment, selectedGender, selectedStatus]);

  // ============ BULK OPERATIONS ============

  const handleBulkEnable = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một bác sĩ');
      return;
    }

    Modal.confirm({
      title: 'Kích hoạt bác sĩ',
      content: `Bạn chắc chắn muốn kích hoạt ${selectedRowKeys.length} bác sĩ?`,
      async onOk() {
        try {
          await doctorAPI.bulkEnableDoctors(selectedRowKeys);
          message.success(`Kích hoạt ${selectedRowKeys.length} bác sĩ thành công`);
          setSelectedRowKeys([]);
          loadDoctors();
        } catch (error) {
          message.error('Lỗi khi kích hoạt bác sĩ');
        }
      },
    });
  };

  const handleBulkDisable = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một bác sĩ');
      return;
    }

    Modal.confirm({
      title: 'Vô hiệu hóa bác sĩ',
      content: `Bạn chắc chắn muốn vô hiệu hóa ${selectedRowKeys.length} bác sĩ?`,
      async onOk() {
        try {
          await doctorAPI.bulkDisableDoctors(selectedRowKeys);
          message.success(`Vô hiệu hóa ${selectedRowKeys.length} bác sĩ thành công`);
          setSelectedRowKeys([]);
          loadDoctors();
        } catch (error) {
          message.error('Lỗi khi vô hiệu hóa bác sĩ');
        }
      },
    });
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một bác sĩ');
      return;
    }

    Modal.confirm({
      title: 'Xóa bác sĩ',
      content: `Bạn chắc chắn muốn xóa ${selectedRowKeys.length} bác sĩ?`,
      okButtonProps: { danger: true },
      okText: 'Xóa',
      async onOk() {
        try {
          await doctorAPI.bulkDeleteDoctors(selectedRowKeys);
          message.success(`Xóa ${selectedRowKeys.length} bác sĩ thành công`);
          setSelectedRowKeys([]);
          loadDoctors();
        } catch (error) {
          message.error('Lỗi khi xóa bác sĩ');
        }
      },
    });
  };

  // ============ INDIVIDUAL OPERATIONS ============

  const handleDeleteDoctor = (doctorId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn chắc chắn muốn xóa bác sĩ này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await doctorAPI.deleteDoctor(doctorId);
          message.success('Xóa bác sĩ thành công');
          loadDoctors();
        } catch (error) {
          message.error('Lỗi khi xóa bác sĩ');
        }
      },
    });
  };

  const handleDisableDoctor = (doctorId) => {
    Modal.confirm({
      title: 'Tắt tài khoản bác sĩ',
      content: 'Bác sĩ này sẽ không thể đăng nhập',
      okText: 'Tắt',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await doctorAPI.disableDoctor(doctorId);
          message.success('Tắt tài khoản bác sĩ thành công');
          loadDoctors();
        } catch (error) {
          message.error('Lỗi khi tắt tài khoản');
        }
      },
    });
  };

  // ============ TABLE COLUMNS ============

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'personalInfo',
      key: 'avatar',
      width: 60,
      render: (personalInfo) => (
        <img
          src={personalInfo?.profilePicture
            ? `/uploads/profiles/${personalInfo.profilePicture}`
            : 'https://via.placeholder.com/50'
          }
          alt="avatar"
          style={{ width: 50, height: 50, borderRadius: '50%' }}
        />
      ),
    },
    {
      title: 'Tên bác sĩ',
      key: 'name',
      render: (_, record) => (
        `${record.personalInfo?.firstName || ''} ${record.personalInfo?.lastName || ''}`.trim()
      ),
      sorter: true,
    },
    {
      title: 'Chuyên khoa',
      dataIndex: ['specialties', 0, 'name'],
      key: 'specialty',
      render: (specialty, record) => (
        <span>{specialty || 'N/A'}</span>
      ),
    },
    {
      title: 'Khoa/Phòng',
      dataIndex: ['professionalInfo', 'department', 'name'],
      key: 'department',
      render: (dept) => dept || 'N/A',
    },
    {
      title: 'Kinh nghiệm',
      dataIndex: 'yearsOfExperience',
      key: 'experience',
      render: (years) => `${years || 0} năm`,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => `${(rating || 0).toFixed(1)}/5`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? 'Hoạt động' : 'Tắt'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/doctors/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/doctors/${record._id}/edit`)}
            />
          </Tooltip>
          {record.status === 'ACTIVE' ? (
            <Tooltip title="Tắt tài khoản">
              <Button
                size="small"
                danger
                icon={<DisconnectOutlined />}
                onClick={() => handleDisableDoctor(record._id)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Bật tài khoản">
              <Button
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Bật tài khoản',
                    content: 'Bác sĩ này sẽ có thể đăng nhập?',
                    onOk: async () => {
                      try {
                        await doctorAPI.enableDoctor(record._id);
                        message.success('Bật tài khoản thành công');
                        loadDoctors();
                      } catch (error) {
                        message.error('Lỗi khi bật tài khoản');
                      }
                    },
                  });
                }}
              />
            </Tooltip>
          )}
          <Tooltip title="Xóa">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteDoctor(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ padding: '24px' }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>👨‍⚕️ Quản lý Danh sách bác sĩ</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/doctors/create')}
            size="large"
          >
            Thêm bác sĩ mới
          </Button>
        </div>

        {/* Statistics */}
        {stats && (
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng bác sĩ"
                  value={stats.totalDoctors || 0}
                  prefix="👨‍⚕️"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Hoạt động"
                  value={stats.totalDoctors - (stats.inactiveDoctors || 0) || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tắt"
                  value={stats.inactiveDoctors || 0}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Đánh giá trung bình"
                  value={stats.averageRating || 0}
                  precision={1}
                  suffix="/5"
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Bulk Actions */}
        {selectedRowKeys.length > 0 && (
          <Card style={{ marginBottom: '24px', backgroundColor: '#e6f7ff' }}>
            <Space>
              <span>Đã chọn {selectedRowKeys.length} bác sĩ</span>
              <Button type="primary" onClick={handleBulkEnable}>
                <CheckCircleOutlined /> Kích hoạt
              </Button>
              <Button onClick={handleBulkDisable}>
                <DisconnectOutlined /> Vô hiệu hóa
              </Button>
              <Button danger onClick={handleBulkDelete}>
                <DeleteOutlined /> Xóa
              </Button>
              <Button onClick={() => setSelectedRowKeys([])}>
                Hủy chọn
              </Button>
            </Space>
          </Card>
        )}

        {/* View Mode */}
        <Card style={{ marginBottom: '24px' }}>
          <Segmented
            options={[
              { label: '📊 Bảng', value: 'table' },
              { label: '🎴 Thẻ', value: 'card' },
              { label: '📈 Thống kê', value: 'stats' }
            ]}
            value={viewMode}
            onChange={(value) => setViewMode(value)}
            style={{ marginRight: '16px' }}
          />
        </Card>

        {/* Filters */}
        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Tìm kiếm tên bác sĩ..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <CustomSelect
                placeholder="Chọn chuyên khoa"
                value={selectedSpecialty || undefined}
                onChange={(value) => setSelectedSpecialty(value)}
                options={specialties.map(s => ({ label: s.name, value: s._id }))}
                allowClear
              />

            </Col>
            <Col xs={24} sm={12} md={6}>
              <CustomSelect
                placeholder="Chọn khoa"
                value={selectedDepartment || undefined}
                onChange={(value) => setSelectedDepartment(value)}
                options={departments.map(d => ({ label: d.name, value: d._id }))}
                allowClear
              />

            </Col>
            <Col xs={24} sm={12} md={6}>
              <CustomSelect
                placeholder="Chọn trạng thái"
                value={selectedStatus || undefined}
                onChange={(value) => setSelectedStatus(value)}
                options={[
                  { label: 'Hoạt động', value: 'ACTIVE' },
                  { label: 'Tắt', value: 'INACTIVE' },
                ]}
                allowClear
              />

            </Col>
          </Row>
        </Card>

        {/* Table View */}
        {viewMode === 'table' && (
          <Card style={{ borderRadius: '12px' }}>
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
              spinning={loading}
            >
              <Table
                columns={columns}
                dataSource={doctors}
                rowKey="_id"
                rowSelection={rowSelection}
                pagination={{
                  current: pageNumber,
                  pageSize: pageSize,
                  total: total,
                  onChange: (page, size) => {
                    setPageNumber(page);
                    setPageSize(size);
                  },
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} bác sĩ`,
                }}
                scroll={{ x: 1200 }}
              />
            </Spin>
          </Card>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default DoctorListEnhanced;
