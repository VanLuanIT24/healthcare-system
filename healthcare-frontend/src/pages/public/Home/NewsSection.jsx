// src/pages/public/Home/NewsSection.jsx
import { ArrowRightOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const news = [
  {
    id: 1,
    title: 'Phương pháp mới trong điều trị bệnh tim mạch',
    excerpt: 'Các chuyên gia tim mạch tại HealthCare vừa áp dụng thành công phương pháp can thiệp tim mạch không xâm lấn...',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600',
    category: 'Chuyên môn',
    author: 'BS. Nguyễn Văn A',
    date: '25/12/2024',
    readTime: '5 phút đọc',
  },
  {
    id: 2,
    title: 'HealthCare đạt chứng nhận JCI lần thứ 3',
    excerpt: 'Bệnh viện HealthCare vinh dự được tái chứng nhận tiêu chuẩn chất lượng quốc tế JCI, khẳng định cam kết...',
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600',
    category: 'Sự kiện',
    author: 'Admin',
    date: '20/12/2024',
    readTime: '3 phút đọc',
  },
  {
    id: 3,
    title: 'Hướng dẫn chăm sóc sức khỏe mùa đông',
    excerpt: 'Mùa đông là thời điểm các bệnh về đường hô hấp gia tăng. Bác sĩ chia sẻ những lời khuyên hữu ích...',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600',
    category: 'Sức khỏe',
    author: 'BS. Trần Thị B',
    date: '18/12/2024',
    readTime: '7 phút đọc',
  },
];

const NewsSection = () => {
  const navigate = useNavigate();

  const getCategoryColor = (category) => {
    const colors = {
      'Chuyên môn': 'blue',
      'Sự kiện': 'green',
      'Sức khỏe': 'orange',
    };
    return colors[category] || 'default';
  };

  return (
    <section className="py-20 bg-gray-50">
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
            Tin tức & Sự kiện
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Tin tức mới nhất
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cập nhật những thông tin y tế, sự kiện và kiến thức sức khỏe hữu ích
          </p>
        </motion.div>

        {/* News Grid */}
        <Row gutter={[24, 24]}>
          {news.map((article, index) => (
            <Col xs={24} md={8} key={article.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  hoverable
                  className="h-full rounded-2xl border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  styles={{ body: { padding: 0 } }}
                  onClick={() => navigate(`/news/${article.id}`)}
                  cover={
                    <div className="relative overflow-hidden">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        alt={article.title}
                        src={article.image}
                        className="w-full h-48 object-cover"
                      />
                      <Tag 
                        color={getCategoryColor(article.category)}
                        className="absolute top-4 left-4 rounded-full px-3"
                      >
                        {article.category}
                      </Tag>
                    </div>
                  }
                >
                  <div className="p-5">
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <CalendarOutlined />
                        {article.date}
                      </span>
                      <span>{article.readTime}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <UserOutlined className="text-gray-400" />
                      <span className="text-sm text-gray-500">{article.author}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
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
            onClick={() => navigate('/news')}
            className="h-12 px-8 rounded-xl font-semibold"
          >
            Xem tất cả tin tức <ArrowRightOutlined />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
