import { EnvironmentOutlined, FilterOutlined, MailOutlined, PhoneOutlined, SearchOutlined, StarFilled, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Divider, Empty, Input, Rate, Row, Select, Space, Spin, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { userAPI } from '../../services/api/userAPI';
import './DoctorSelection.css';

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

const DoctorSelectionPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Specializations and Departments
  const specializations = [
    'Nội khoa', 'Ngoại khoa', 'Nhi khoa', 'Sản khoa', 'Tim mạch',
    'Thần kinh', 'Da liễu', 'Mắt', 'Tai mũi họng', 'Răng hàm mặt',
    'Chấn thương chỉnh hình', 'Ung bướu', 'Nội tiết', 'Tiết niệu',
    'Hô hấp', 'Tiêu hóa', 'Y học cổ truyền', 'Phục hồi chức năng'
  ];

  const departments = [
    'Khoa Nội', 'Khoa Ngoại', 'Khoa Nhi', 'Khoa Sản', 'Khoa Tim mạch',
    'Khoa Thần kinh', 'Khoa Da liễu', 'Khoa Mắt', 'Khoa Tai mũi họng',
    'Khoa Răng hàm mặt', 'Khoa Chấn thương chỉnh hình', 'Khoa Ung bướu',
    'Khoa Nội tiết', 'Khoa Tiết niệu', 'Khoa Hô hấp', 'Khoa Tiêu hóa',
    'Khoa Y học cổ truyền', 'Khoa Phục hồi chức năng'
  ];

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    filterAndSortDoctors();
  }, [doctors, searchTerm, selectedSpecialization, selectedDepartment, selectedExperience, sortBy]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUsers({ role: 'DOCTOR' });
      // Mock additional data for doctors
      const doctorsWithDetails = response.data.map(doctor => ({
        ...doctor,
        specialization: doctor.specialization || specializations[Math.floor(Math.random() * specializations.length)],
        department: doctor.department || departments[Math.floor(Math.random() * departments.length)],
        experience: doctor.experience || Math.floor(Math.random() * 20) + 1,
        rating: doctor.rating || (Math.random() * 2 + 3).toFixed(1),
        consultationFee: doctor.consultationFee || Math.floor(Math.random() * 300000) + 200000,
        availability: doctor.availability || (Math.random() > 0.3 ? 'available' : 'busy'),
        bio: doctor.bio || `Bác sĩ chuyên khoa với nhiều năm kinh nghiệm trong lĩnh vực ${doctor.specialization || 'y khoa'}`,
        education: doctor.education || 'Đại học Y Hà Nội',
        languages: doctor.languages || ['Tiếng Việt', 'Tiếng Anh'],
        achievements: doctor.achievements || ['Bằng chuyên khoa I', 'Chứng chỉ hành nghề']
      }));
      setDoctors(doctorsWithDetails);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDoctors = () => {
    let filtered = [...doctors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Specialization filter
    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialization === selectedSpecialization);
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(doctor => doctor.department === selectedDepartment);
    }

    // Experience filter
    if (selectedExperience !== 'all') {
      const [min, max] = selectedExperience.split('-').map(Number);
      filtered = filtered.filter(doctor => {
        if (max) {
          return doctor.experience >= min && doctor.experience <= max;
        } else {
          return doctor.experience >= min;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.fullName || '').localeCompare(b.fullName || '');
        case 'experience':
          return (b.experience || 0) - (a.experience || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'fee':
          return (a.consultationFee || 0) - (b.consultationFee || 0);
        default:
          return 0;
      }
    });

    setFilteredDoctors(filtered);
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(selectedDoctor?._id === doctor._id ? null : doctor);
  };

  const handleBookAppointment = () => {
    if (selectedDoctor) {
      // Navigate to appointment booking with selected doctor
      window.location.href = `/appointments/book?doctorId=${selectedDoctor._id}`;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialization('all');
    setSelectedDepartment('all');
    setSelectedExperience('all');
    setSortBy('name');
  };

  return (
    <div className="doctor-selection-page">
      {/* Header */}
      <div className="selection-header">
        <Title level={1} className="text-gradient">Tìm kiếm Bác sĩ</Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Tìm bác sĩ phù hợp với nhu cầu của bạn
        </Text>
      </div>

      {/* Filters Section */}
      <Card className="filters-card glass">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm theo tên, chuyên khoa..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Chuyên khoa"
              value={selectedSpecialization}
              onChange={setSelectedSpecialization}
              size="large"
            >
              <Option value="all">Tất cả chuyên khoa</Option>
              {specializations.map(spec => (
                <Option key={spec} value={spec}>{spec}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Khoa"
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              size="large"
            >
              <Option value="all">Tất cả khoa</Option>
              {departments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Kinh nghiệm"
              value={selectedExperience}
              onChange={setSelectedExperience}
              size="large"
            >
              <Option value="all">Tất cả</Option>
              <Option value="0-5">0-5 năm</Option>
              <Option value="5-10">5-10 năm</Option>
              <Option value="10-20">10-20 năm</Option>
              <Option value="20">Trên 20 năm</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Sắp xếp"
              value={sortBy}
              onChange={setSortBy}
              size="large"
            >
              <Option value="name">Tên A-Z</Option>
              <Option value="experience">Kinh nghiệm</Option>
              <Option value="rating">Đánh giá</Option>
              <Option value="fee">Chi phí</Option>
            </Select>
          </Col>
        </Row>
        <Row style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Space>
              <FilterOutlined />
              <Text strong>Kết quả: {filteredDoctors.length} bác sĩ</Text>
              {(searchTerm || selectedSpecialization !== 'all' || selectedDepartment !== 'all' || selectedExperience !== 'all') && (
                <Button type="link" onClick={clearFilters}>Xóa bộ lọc</Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Doctors Grid */}
      <Spin spinning={loading} size="large">
        <div className="doctors-container">
          {filteredDoctors.length === 0 ? (
            <Empty
              description="Không tìm thấy bác sĩ phù hợp"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            />
          ) : (
            <Row gutter={[24, 24]}>
              {filteredDoctors.map(doctor => (
                <Col xs={24} sm={12} lg={8} key={doctor._id}>
                  <Card
                    className={`doctor-detail-card ${selectedDoctor?._id === doctor._id ? 'selected' : ''}`}
                    hoverable
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    {/* Availability Badge */}
                    <div className="availability-badge">
                      <Tag color={doctor.availability === 'available' ? 'success' : 'default'}>
                        {doctor.availability === 'available' ? 'Có thể khám' : 'Bận'}
                      </Tag>
                    </div>

                    {/* Doctor Avatar and Name */}
                    <div className="doctor-header">
                      <Avatar
                        size={80}
                        icon={<UserOutlined />}
                        src={doctor.avatar}
                        className="doctor-avatar-large"
                      />
                      <Title level={4} style={{ marginTop: '16px', marginBottom: '4px' }}>
                        BS. {doctor.fullName}
                      </Title>
                      <Tag color="blue">{doctor.specialization}</Tag>
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    {/* Rating */}
                    <div className="doctor-rating">
                      <Rate disabled defaultValue={parseFloat(doctor.rating)} allowHalf />
                      <Text strong style={{ marginLeft: '8px' }}>{doctor.rating}</Text>
                    </div>

                    {/* Info */}
                    <div className="doctor-info">
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div className="info-row">
                          <EnvironmentOutlined />
                          <Text>{doctor.department}</Text>
                        </div>
                        <div className="info-row">
                          <StarFilled style={{ color: '#faad14' }} />
                          <Text>{doctor.experience} năm kinh nghiệm</Text>
                        </div>
                        <div className="info-row">
                          <PhoneOutlined />
                          <Text>{doctor.phone || 'Chưa cập nhật'}</Text>
                        </div>
                        <div className="info-row">
                          <MailOutlined />
                          <Text>{doctor.email || 'Chưa cập nhật'}</Text>
                        </div>
                      </Space>
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    {/* Bio */}
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      {doctor.bio}
                    </Text>

                    <Divider style={{ margin: '16px 0' }} />

                    {/* Education & Languages */}
                    <div className="doctor-details">
                      <Text strong style={{ fontSize: '12px' }}>Đào tạo:</Text>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                        {doctor.education}
                      </Text>
                      <Text strong style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                        Ngôn ngữ:
                      </Text>
                      <Space size="small" style={{ marginTop: '4px' }}>
                        {doctor.languages.map(lang => (
                          <Tag key={lang} style={{ fontSize: '11px' }}>{lang}</Tag>
                        ))}
                      </Space>
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    {/* Fee */}
                    <div className="consultation-fee">
                      <Text type="secondary">Phí khám:</Text>
                      <Text strong style={{ fontSize: '18px', color: '#667eea' }}>
                        {doctor.consultationFee?.toLocaleString('vi-VN')} đ
                      </Text>
                    </div>

                    {/* Select Button */}
                    <Button
                      type={selectedDoctor?._id === doctor._id ? 'primary' : 'default'}
                      block
                      size="large"
                      style={{ marginTop: '16px', borderRadius: '12px' }}
                    >
                      {selectedDoctor?._id === doctor._id ? 'Đã chọn' : 'Chọn bác sĩ'}
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Spin>

      {/* Booking Action */}
      {selectedDoctor && (
        <div className="booking-action-bar">
          <Card className="action-card glass">
            <Row align="middle" justify="space-between">
              <Col>
                <Space>
                  <Avatar size={48} icon={<UserOutlined />} src={selectedDoctor.avatar} />
                  <div>
                    <Text strong style={{ fontSize: '16px' }}>BS. {selectedDoctor.fullName}</Text>
                    <br />
                    <Text type="secondary">{selectedDoctor.specialization}</Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleBookAppointment}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0 40px',
                    height: '48px',
                    fontWeight: 600
                  }}
                >
                  Đặt lịch khám
                </Button>
              </Col>
            </Row>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DoctorSelectionPage;
