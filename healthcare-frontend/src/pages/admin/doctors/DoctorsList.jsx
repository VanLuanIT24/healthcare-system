// src/pages/admin/doctors/DoctorsList.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { doctorAPI } from '@/services/api/doctorAPI';
import publicAPI from '@/services/api/publicAPI';
import { CheckCircleOutlined, DeleteOutlined, DisconnectOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Tag,
    Tooltip
} from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorsList = () => {
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

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Get specialties and departments from public API
        const specRes = await publicAPI.getSpecialties();
        const deptRes = await publicAPI.getDepartments();
        
        if (specRes?.data?.data) {
          setSpecialties(specRes.data.data || []);
        }
        if (deptRes?.data?.data) {
          setDepartments(deptRes.data.data || []);
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

      // Use correct parameter names matching backend API
      if (searchText) params.search = searchText;
      if (selectedSpecialty) params.specialty_id = selectedSpecialty;
      if (selectedDepartment) params.department_id = selectedDepartment;
      if (selectedGender) params.gender = selectedGender;
      if (selectedStatus) params.status = selectedStatus;

      console.log('📊 Loading doctors with params:', params);
      
      const res = await doctorAPI.getDoctors(params);
      
      console.log('📦 Response received:', res.data);
      
      if (res.data?.data) {
        // Backend returns: { success: true, data: [], pagination: { total, ... } }
        const doctorList = Array.isArray(res.data.data) ? res.data.data : [];
        console.log('👨‍⚕️ Doctors loaded:', doctorList.length, doctorList);
        
        setDoctors(doctorList);
        setTotal(res.data.pagination?.total || 0);
        
        if (doctorList.length === 0 && !searchText && !selectedDepartment && !selectedSpecialty) {
          message.info('Không có dữ liệu bác sĩ');
        }
      } else {
        console.warn('Unexpected response structure:', res.data);
        setDoctors([]);
        setTotal(0);
        message.warning('Không lấy được dữ liệu từ server');
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      message.error('Lỗi khi tải danh sách bác sĩ: ' + error.message);
      setDoctors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [pageNumber, pageSize, searchText, selectedSpecialty, selectedDepartment, selectedGender, selectedStatus]);

  // Handle delete doctor
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

  // Handle disable doctor
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

  // Columns definition with better rendering
  const columns = [
    {
      title: 'Ảnh',
      dataIndex: ['personalInfo', 'profilePicture'],
      key: 'avatar',
      width: 70,
      align: 'center',
      render: (profilePicture, record) => {
        const firstName = record.personalInfo?.firstName || '';
        const lastName = record.personalInfo?.lastName || '';
        const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];
        const hashCode = (firstName + lastName).split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const bgColor = colors[Math.abs(hashCode) % colors.length];
        
        return (
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 45,
              height: 45,
              borderRadius: '50%',
              backgroundColor: bgColor,
              color: 'white',
              fontWeight: 'bold',
              fontSize: 14,
              overflow: 'hidden'
            }}
            title={`${firstName} ${lastName}`}
          >
            {profilePicture ? (
              <img 
                src={`/uploads/profiles/${profilePicture}`}
                alt="avatar"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const container = e.target.parentElement;
                  container.textContent = initials || '?';
                }}
              />
            ) : (
              <span>{initials || '?'}</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Tên bác sĩ',
      key: 'name',
      width: 200,
      render: (_, record) => {
        const fullName = `${record.personalInfo?.firstName || ''} ${record.personalInfo?.lastName || ''}`.trim();
        return (
          <div style={{ fontWeight: 500, color: '#262626' }}>
            {fullName || 'N/A'}
          </div>
        );
      },
      sorter: (a, b) => {
        const nameA = `${a.personalInfo?.firstName || ''} ${a.personalInfo?.lastName || ''}`;
        const nameB = `${b.personalInfo?.firstName || ''} ${b.personalInfo?.lastName || ''}`;
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email) => (
        <span style={{ color: '#262626' }}>{email || 'N/A'}</span>
      ),
    },
    {
      title: 'Điện thoại',
      dataIndex: ['personalInfo', 'phone'],
      key: 'phone',
      width: 120,
      render: (phone) => (
        <span style={{ color: '#262626' }}>{phone || 'N/A'}</span>
      ),
    },
    {
      title: 'Kinh nghiệm',
      dataIndex: ['professionalInfo', 'yearsOfExperience'],
      key: 'experience',
      width: 120,
      align: 'center',
      render: (years) => (
        <span style={{ color: '#262626', fontWeight: 500 }}>
          {years || 0} năm
        </span>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      align: 'center',
      render: (rating) => (
        <span style={{ 
          color: '#faad14', 
          fontWeight: 'bold',
          fontSize: 14
        }}>
          ⭐ {(rating || 0).toFixed(1)}/5
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status) => {
        if (status === 'ACTIVE') {
          return <Tag color="green">✓ Hoạt động</Tag>;
        } else if (status === 'INACTIVE') {
          return <Tag color="red">✕ Tắt</Tag>;
        } else {
          return <Tag color="orange">{status}</Tag>;
        }
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 320,
      fixed: 'right',
      render: (_, record) => (
        <Space wrap size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/doctors/${record._id}`)}
            >
              Chi tiết
            </Button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa thông tin">
            <Button 
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/doctors/${record._id}/edit`)}
            >
              Sửa
            </Button>
          </Tooltip>
          {record.status === 'ACTIVE' ? (
            <Tooltip title="Tắt tài khoản">
              <Button 
                size="small" 
                danger
                icon={<DisconnectOutlined />}
                onClick={() => handleDisableDoctor(record._id)}
              >
                Tắt
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Bật lại tài khoản">
              <Button 
                size="small"
                type="dashed"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Bật tài khoản',
                    content: 'Bác sĩ này sẽ có thể đăng nhập?',
                    okText: 'Bật',
                    cancelText: 'Hủy',
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
              >
                Bật
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Xóa bác sĩ">
            <Button 
              size="small" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteDoctor(record._id)}
            >
              Xóa
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

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
          <h1>👨‍⚕️ Danh sách bác sĩ</h1>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/doctors/create')}
            size="large"
          >
            Thêm bác sĩ mới
          </Button>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm tên bác sĩ..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Chọn trạng thái"
                value={selectedStatus || undefined}
                onChange={(value) => setSelectedStatus(value)}
                options={[
                  { label: 'Hoạt động', value: 'ACTIVE' },
                  { label: 'Tắt', value: 'INACTIVE' },
                ]}
                allowClear
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card style={{ borderRadius: '12px', backgroundColor: '#fff' }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              flexDirection: 'column',
              gap: 16
            }}>
              <Spin size="large" />
              <p style={{ color: '#8c8c8c', marginTop: 16 }}>Đang tải danh sách bác sĩ...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              flexDirection: 'column',
              gap: 16
            }}>
              <div style={{ fontSize: 48 }}>📋</div>
              <h3 style={{ color: '#262626', marginBottom: 8 }}>Chưa có dữ liệu bác sĩ</h3>
              <p style={{ color: '#8c8c8c', marginBottom: 16 }}>Hãy thêm bác sĩ mới để bắt đầu</p>
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/admin/doctors/create')}
              >
                Thêm bác sĩ mới
              </Button>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={doctors}
              rowKey="_id"
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
              style={{ backgroundColor: '#fff' }}
            />
          )}
        </Card>
      </motion.div>
    </AdminLayout>
  );
};

export default DoctorsList;
