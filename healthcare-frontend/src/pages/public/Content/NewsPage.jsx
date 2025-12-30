// src/pages/public/Content/NewsPage.jsx
import { PageHeader } from '@/components/common';
import { CalendarOutlined, EyeOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Input, Pagination, Row, Select, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const categories = [
  { key: 'all', name: 'Tất cả' },
  { key: 'health', name: 'Sức khỏe' },
  { key: 'medical', name: 'Chuyên môn' },
  { key: 'event', name: 'Sự kiện' },
  { key: 'promotion', name: 'Khuyến mãi' },
];

const newsData = [
  {
    id: 1,
    title: 'Phương pháp mới trong điều trị bệnh tim mạch',
    excerpt: 'Các chuyên gia tim mạch tại HealthCare vừa áp dụng thành công phương pháp can thiệp tim mạch không xâm lấn, mở ra hy vọng mới cho bệnh nhân...',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600',
    category: 'medical',
    author: 'BS. Nguyễn Văn A',
    date: '25/12/2024',
    views: 1250,
    featured: true,
  },
  {
    id: 2,
    title: 'HealthCare đạt chứng nhận JCI lần thứ 3',
    excerpt: 'Bệnh viện HealthCare vinh dự được tái chứng nhận tiêu chuẩn chất lượng quốc tế JCI, khẳng định cam kết không ngừng nâng cao chất lượng dịch vụ...',
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600',
    category: 'event',
    author: 'Admin',
    date: '20/12/2024',
    views: 890,
    featured: true,
  },
  {
    id: 3,
    title: 'Hướng dẫn chăm sóc sức khỏe mùa đông',
    excerpt: 'Mùa đông là thời điểm các bệnh về đường hô hấp gia tăng. Bác sĩ chia sẻ những lời khuyên hữu ích để bảo vệ sức khỏe cho cả gia đình...',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600',
    category: 'health',
    author: 'BS. Trần Thị B',
    date: '18/12/2024',
    views: 2340,
    featured: false,
  },
  {
    id: 4,
    title: 'Chương trình khám sức khỏe ưu đãi cuối năm',
    excerpt: 'Nhân dịp cuối năm, HealthCare triển khai chương trình khám sức khỏe tổng quát với nhiều ưu đãi hấp dẫn dành cho khách hàng...',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600',
    category: 'promotion',
    author: 'Marketing',
    date: '15/12/2024',
    views: 3200,
    featured: false,
  },
  {
    id: 5,
    title: 'Cách phòng ngừa bệnh tiểu đường hiệu quả',
    excerpt: 'Tiểu đường đang trở thành căn bệnh phổ biến ở Việt Nam. Hãy cùng tìm hiểu cách phòng ngừa và kiểm soát bệnh hiệu quả...',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600',
    category: 'health',
    author: 'BS. Lê Văn C',
    date: '12/12/2024',
    views: 1560,
    featured: false,
  },
  {
    id: 6,
    title: 'Hội thảo chuyên đề về ung thư vú',
    excerpt: 'HealthCare phối hợp với Hội Ung thư Việt Nam tổ chức hội thảo chuyên đề về phòng chống và điều trị ung thư vú...',
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600',
    category: 'event',
    author: 'Admin',
    date: '10/12/2024',
    views: 780,
    featured: false,
  },
];

const NewsPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const getCategoryColor = (category) => {
    const colors = {
      health: 'green',
      medical: 'blue',
      event: 'purple',
      promotion: 'orange',
    };
    return colors[category] || 'default';
  };

  const getCategoryName = (category) => {
    return categories.find(c => c.key === category)?.name || category;
  };

  const filteredNews = newsData.filter(news => {
    const matchSearch = news.title.toLowerCase().includes(searchText.toLowerCase()) ||
                       news.excerpt.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = selectedCategory === 'all' || news.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const featuredNews = filteredNews.filter(n => n.featured);
  const regularNews = filteredNews.filter(n => !n.featured);

  return (
    <div>
      <PageHeader
        title="Tin tức & Sự kiện"
        subtitle="Cập nhật thông tin y tế và các hoạt động của HealthCare"
        backgroundImage="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Filter */}
        <Card className="mb-8 rounded-xl">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Input
                placeholder="Tìm kiếm bài viết..."
                prefix={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="rounded-lg"
              />
            </Col>
            <Col xs={24} md={12}>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Tag
                    key={cat.key}
                    color={selectedCategory === cat.key ? 'blue' : 'default'}
                    className="cursor-pointer px-4 py-1 rounded-full text-sm"
                    onClick={() => setSelectedCategory(cat.key)}
                  >
                    {cat.name}
                  </Tag>
                ))}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tin nổi bật</h2>
            <Row gutter={[24, 24]}>
              {featuredNews.map((news, index) => (
                <Col xs={24} md={12} key={news.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      hoverable
                      className="h-full rounded-xl overflow-hidden"
                      cover={
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={news.image}
                            alt={news.title}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                          />
                          <Tag
                            color={getCategoryColor(news.category)}
                            className="absolute top-4 left-4 rounded-full"
                          >
                            {getCategoryName(news.category)}
                          </Tag>
                        </div>
                      }
                      onClick={() => navigate(`/news/${news.id}`)}
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{news.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <CalendarOutlined /> {news.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserOutlined /> {news.author}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <EyeOutlined /> {news.views.toLocaleString()}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* All News */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tất cả bài viết</h2>
          {regularNews.length > 0 ? (
            <>
              <Row gutter={[24, 24]}>
                {regularNews.map((news, index) => (
                  <Col xs={24} sm={12} lg={8} key={news.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        hoverable
                        className="h-full rounded-xl overflow-hidden"
                        cover={
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={news.image}
                              alt={news.title}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            />
                            <Tag
                              color={getCategoryColor(news.category)}
                              className="absolute top-3 left-3 rounded-full text-xs"
                            >
                              {getCategoryName(news.category)}
                            </Tag>
                          </div>
                        }
                        onClick={() => navigate(`/news/${news.id}`)}
                      >
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{news.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{news.date}</span>
                          <span className="flex items-center gap-1">
                            <EyeOutlined /> {news.views.toLocaleString()}
                          </span>
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
                  pageSize={9}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                />
              </div>
            </>
          ) : (
            <Empty description="Không tìm thấy bài viết" />
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
