// src/pages/public/Services/ServicesList.jsx
import { PageHeader } from '@/components/common';
import {
    AppstoreOutlined,
    CalendarOutlined,
    SearchOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Input, Pagination, Rate, Row, Select, Tabs, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Option } = Select;

// Mock data cho services
const servicesData = [
  {
    id: 'cardiology',
    name: 'Tim mạch',
    icon: '🫀',
    description: 'Chẩn đoán và điều trị các bệnh lý tim mạch với công nghệ hiện đại',
    doctors: 12,
    price: 'Từ 300.000đ',
    rating: 4.9,
    reviews: 256,
  },
  {
    id: 'pediatrics',
    name: 'Nhi khoa',
    icon: '👶',
    description: 'Chăm sóc sức khỏe toàn diện cho trẻ em từ sơ sinh đến tuổi vị thành niên',
    doctors: 15,
    price: 'Từ 250.000đ',
    rating: 4.8,
    reviews: 312,
  },
  {
    id: 'obstetrics',
    name: 'Sản phụ khoa',
    icon: '🤰',
    description: 'Theo dõi thai kỳ, sinh đẻ an toàn và chăm sóc sức khỏe phụ nữ',
    doctors: 10,
    price: 'Từ 350.000đ',
    rating: 4.9,
    reviews: 189,
  },
  {
    id: 'neurology',
    name: 'Thần kinh',
    icon: '🧠',
    description: 'Khám và điều trị các bệnh lý về thần kinh, đột quỵ, đau đầu',
    doctors: 8,
    price: 'Từ 400.000đ',
    rating: 4.7,
    reviews: 156,
  },
  {
    id: 'orthopedics',
    name: 'Chấn thương chỉnh hình',
    icon: '🦴',
    description: 'Điều trị các chấn thương xương khớp, phẫu thuật chỉnh hình',
    doctors: 9,
    price: 'Từ 350.000đ',
    rating: 4.8,
    reviews: 201,
  },
  {
    id: 'dermatology',
    name: 'Da liễu',
    icon: '🩺',
    description: 'Điều trị các bệnh về da, thẩm mỹ da và laser trị liệu',
    doctors: 7,
    price: 'Từ 280.000đ',
    rating: 4.6,
    reviews: 178,
  },
  {
    id: 'ophthalmology',
    name: 'Mắt',
    icon: '👁️',
    description: 'Khám và điều trị các bệnh về mắt, phẫu thuật laser',
    doctors: 6,
    price: 'Từ 300.000đ',
    rating: 4.8,
    reviews: 145,
  },
  {
    id: 'dentistry',
    name: 'Răng hàm mặt',
    icon: '🦷',
    description: 'Chăm sóc răng miệng toàn diện, chỉnh nha và thẩm mỹ',
    doctors: 11,
    price: 'Từ 200.000đ',
    rating: 4.7,
    reviews: 267,
  },
];

// Mock data cho doctors
const doctorsData = [
  {
    id: 1,
    name: 'PGS.TS.BS Nguyễn Văn Anh',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300',
    specialty: 'Tim mạch',
    specialtyId: 'cardiology',
    experience: '20 năm',
    hospital: 'Bệnh viện HealthCare',
    rating: 4.9,
    reviews: 256,
    price: '500.000đ',
    available: true,
  },
  {
    id: 2,
    name: 'ThS.BS Trần Thị Bình',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300',
    specialty: 'Nhi khoa',
    specialtyId: 'pediatrics',
    experience: '15 năm',
    hospital: 'Bệnh viện HealthCare',
    rating: 4.8,
    reviews: 189,
    price: '400.000đ',
    available: true,
  },
  {
    id: 3,
    name: 'TS.BS Lê Hoàng Cường',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300',
    specialty: 'Thần kinh',
    specialtyId: 'neurology',
    experience: '18 năm',
    hospital: 'Bệnh viện HealthCare',
    rating: 4.9,
    reviews: 312,
    price: '550.000đ',
    available: false,
  },
  {
    id: 4,
    name: 'BS.CKII Phạm Minh Đức',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300',
    specialty: 'Chấn thương chỉnh hình',
    specialtyId: 'orthopedics',
    experience: '12 năm',
    hospital: 'Bệnh viện HealthCare',
    rating: 4.7,
    reviews: 156,
    price: '450.000đ',
    available: true,
  },
  {
    id: 5,
    name: 'BS.CKI Ngô Thị Em',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300',
    specialty: 'Sản phụ khoa',
    specialtyId: 'obstetrics',
    experience: '10 năm',
    hospital: 'Bệnh viện HealthCare',
    rating: 4.8,
    reviews: 198,
    price: '400.000đ',
    available: true,
  },
  {
    id: 6,
    name: 'ThS.BS Vũ Văn Phát',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300',
    specialty: 'Da liễu',
    specialtyId: 'dermatology',
    experience: '8 năm',
    hospital: 'Bệnh viện HealthCare',
    rating: 4.6,
    reviews: 134,
    price: '350.000đ',
    available: true,
  },
];

const ServicesList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('services');
  const [searchText, setSearchText] = useState('');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data
  const filteredServices = servicesData.filter(service => 
    service.name.toLowerCase().includes(searchText.toLowerCase()) &&
    (!specialty || service.id === specialty)
  );

  const filteredDoctors = doctorsData.filter(doctor =>
    doctor.name.toLowerCase().includes(searchText.toLowerCase()) &&
    (!specialty || doctor.specialtyId === specialty)
  ).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.reviews - a.reviews;
    if (sortBy === 'experience') return parseInt(b.experience) - parseInt(a.experience);
    return 0;
  });

  const tabItems = [
    {
      key: 'services',
      label: 'Dịch vụ / Chuyên khoa',
      children: (
        <Row gutter={[24, 24]}>
          {filteredServices.map((service, index) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={service.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  hoverable
                  className="h-full rounded-xl border-0 shadow-sm hover:shadow-lg transition-all"
                  onClick={() => navigate(`/services/${service.id}`)}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl">
                      {service.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.description}</p>
                    
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-500">{service.doctors} bác sĩ</span>
                      <span className="font-semibold text-blue-600">{service.price}</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2">
                      <Rate disabled defaultValue={service.rating} allowHalf className="text-xs" />
                      <span className="text-xs text-gray-500">({service.reviews})</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      ),
    },
    {
      key: 'doctors',
      label: 'Bác sĩ',
      children: (
        <>
          <Row gutter={[24, 24]}>
            {filteredDoctors.map((doctor, index) => (
              <Col xs={24} sm={12} lg={viewMode === 'grid' ? 6 : 12} key={doctor.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    hoverable
                    className={`rounded-xl border-0 shadow-sm hover:shadow-lg transition-all ${
                      viewMode === 'list' ? 'flex-row' : ''
                    }`}
                  >
                    <div className={viewMode === 'list' ? 'flex gap-4' : ''}>
                      <div className={viewMode === 'list' ? 'flex-shrink-0' : 'text-center'}>
                        <img
                          src={doctor.avatar}
                          alt={doctor.name}
                          className={`object-cover rounded-xl ${
                            viewMode === 'list' ? 'w-24 h-24' : 'w-full h-48 mb-4'
                          }`}
                        />
                      </div>
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <div className="flex items-start justify-between mb-2">
                          <Tag color={doctor.available ? 'success' : 'default'} className="rounded-full">
                            {doctor.available ? 'Có lịch' : 'Hết lịch'}
                          </Tag>
                        </div>
                        <Tag color="blue" className="mb-2">{doctor.specialty}</Tag>
                        <h3 className="font-bold text-gray-900 mb-1">{doctor.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{doctor.experience} kinh nghiệm</p>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Rate disabled defaultValue={doctor.rating} allowHalf className="text-xs" />
                          <span className="text-xs text-gray-500">({doctor.reviews})</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-blue-600">{doctor.price}</span>
                          <div className="flex gap-2">
                            <Button size="small" onClick={() => navigate(`/doctors/${doctor.id}`)}>
                              Xem hồ sơ
                            </Button>
                            <Button 
                              type="primary" 
                              size="small"
                              icon={<CalendarOutlined />}
                              disabled={!doctor.available}
                              onClick={() => navigate(`/booking?doctorId=${doctor.id}`)}
                            >
                              Đặt lịch
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
          
          <div className="mt-8 text-center">
            <Pagination
              current={currentPage}
              total={50}
              pageSize={12}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          </div>
        </>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dịch vụ & Bác sĩ"
        subtitle="Tìm kiếm dịch vụ y tế và đặt lịch khám với bác sĩ phù hợp"
        backgroundImage="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Filter Section */}
        <Card className="mb-6 rounded-xl shadow-sm">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="Tìm kiếm bác sĩ, dịch vụ..."
                prefix={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="rounded-lg"
              />
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Chuyên khoa"
                size="large"
                allowClear
                className="w-full"
                value={specialty || undefined}
                onChange={setSpecialty}
              >
                {servicesData.map(s => (
                  <Option key={s.id} value={s.id}>{s.name}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Sắp xếp theo"
                size="large"
                className="w-full"
                value={sortBy}
                onChange={setSortBy}
              >
                <Option value="rating">Đánh giá cao nhất</Option>
                <Option value="reviews">Lượt đánh giá</Option>
                <Option value="experience">Kinh nghiệm</Option>
              </Select>
            </Col>
            <Col xs={24} md={6} className="flex justify-end gap-2">
              <Button 
                icon={<AppstoreOutlined />} 
                type={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              />
              <Button 
                icon={<UnorderedListOutlined />}
                type={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              />
            </Col>
          </Row>
        </Card>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          className="services-tabs"
        />
      </div>
    </div>
  );
};

export default ServicesList;
