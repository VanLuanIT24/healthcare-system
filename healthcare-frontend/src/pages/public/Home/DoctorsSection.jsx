// src/pages/public/Home/DoctorsSection.jsx
import publicAPI from '@/services/api/publicAPI';
import { ArrowRightOutlined, CalendarOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Skeleton, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorsSection = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log('👨‍⚕️ Fetching featured doctors...');
        const response = await publicAPI.getFeaturedDoctors(4);
        console.log('✅ Doctors response:', response);
        // axios interceptor đã trả về data trực tiếp
        if (Array.isArray(response)) {
          console.log('📋 Doctors data:', response);
          setDoctors(response);
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách bác sĩ:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-blue-600 font-semibold uppercase tracking-wider">
            Đội ngũ bác sĩ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Bác sĩ tiêu biểu
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Đội ngũ bác sĩ giỏi, tận tâm với nhiều năm kinh nghiệm trong lĩnh vực y tế
          </p>
        </motion.div>

        {/* Doctors Grid */}
        <Row gutter={[24, 24]}>
          {loading ? (
            // Loading skeleton
            [1, 2, 3, 4].map(i => (
              <Col xs={24} sm={12} lg={6} key={i}>
                <Skeleton active />
              </Col>
            ))
          ) : doctors.length > 0 ? (
            // Render doctors
            doctors.map((doctor, index) => (
              <Col xs={24} sm={12} lg={6} key={doctor.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    hoverable
                    className="rounded-2xl border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                    styles={{ body: { padding: 0 } }}
                    cover={
                      <div className="relative">
                        <img
                          alt={doctor.name}
                          src={doctor.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300'}
                          className="w-full h-64 object-cover"
                        />
                        {/* Specialty Tag */}
                        <div className="absolute top-4 right-4">
                          <Tag 
                            color="blue"
                            className="rounded-full px-3"
                          >
                            {doctor.specialty}
                          </Tag>
                        </div>
                        {/* Gradient Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    }
                  >
                    <div className="p-5">
                      {/* Doctor Name */}
                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                        {doctor.name}
                      </h3>
                      
                      {/* Experience */}
                      <p className="text-sm text-gray-500 mb-2">
                        {doctor.experience}
                      </p>

                      {/* Degree */}
                      <p className="text-sm text-gray-500 mb-4">
                        {doctor.degree}
                      </p>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          type="default"
                          className="flex-1 rounded-lg"
                          onClick={() => navigate(`/services/${doctor.id}`)}
                        >
                          Xem hồ sơ
                        </Button>
                        <Button
                          type="primary"
                          icon={<CalendarOutlined />}
                          className="flex-1 rounded-lg"
                          onClick={() => navigate(`/booking?doctorId=${doctor.id}`)}
                        >
                          Đặt lịch
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))
          ) : (
            // No doctors found
            <Col xs={24} className="text-center py-8">
              <p className="text-gray-500">Không tìm thấy bác sĩ nổi bật</p>
            </Col>
          )}
        </Row>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/services')}
            className="h-12 px-8 rounded-xl font-semibold"
          >
            Xem tất cả bác sĩ <ArrowRightOutlined />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default DoctorsSection;
