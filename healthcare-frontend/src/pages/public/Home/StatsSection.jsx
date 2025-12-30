// src/pages/public/Home/StatsSection.jsx
import publicAPI from '@/services/api/publicAPI';
import {
    HeartOutlined,
    MedicineBoxOutlined,
    TeamOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import { Col, Row, Skeleton } from 'antd';
import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Animated counter component
const Counter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const incrementTime = (duration * 1000) / end;
      
      // Tối ưu cho số lớn
      const step = Math.ceil(end / 100);
      
      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, incrementTime * step);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

const StatsSection = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('📊 Fetching stats from API...');
        const response = await publicAPI.getStats();
        console.log('✅ Stats response:', response);
        // axios interceptor đã trả về data trực tiếp
        const data = response;
        console.log('📈 Stats data:', data);
        if (data && typeof data === 'object') {
          setStats([
            {
              icon: <TeamOutlined />,
              value: data.doctors || 0,
              suffix: '+',
              label: 'Bác sĩ chuyên khoa',
              color: '#1890ff',
              bgColor: '#e6f7ff',
            },
            {
              icon: <HeartOutlined />,
              value: data.patients || 0,
              suffix: '+',
              label: 'Bệnh nhân đã khám',
              color: '#eb2f96',
              bgColor: '#fff0f6',
            },
            {
              icon: <MedicineBoxOutlined />,
              value: data.appointments || 0,
              suffix: '+',
              label: 'Ca khám thành công',
              color: '#52c41a',
              bgColor: '#f6ffed',
            },
            {
              icon: <TrophyOutlined />,
              value: data.satisfaction || 98,
              suffix: '%',
              label: 'Độ hài lòng bệnh nhân',
              color: '#faad14',
              bgColor: '#fffbe6',
            },
          ]);
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy thống kê:', error.message);
        console.error('📍 Error details:', error.response?.data || error);
        // Fallback default stats
        setStats([
          {
            icon: <TeamOutlined />,
            value: 150,
            suffix: '+',
            label: 'Bác sĩ chuyên khoa',
            color: '#1890ff',
            bgColor: '#e6f7ff',
          },
          {
            icon: <HeartOutlined />,
            value: 50000,
            suffix: '+',
            label: 'Bệnh nhân đã khám',
            color: '#eb2f96',
            bgColor: '#fff0f6',
          },
          {
            icon: <MedicineBoxOutlined />,
            value: 100000,
            suffix: '+',
            label: 'Ca khám thành công',
            color: '#52c41a',
            bgColor: '#f6ffed',
          },
          {
            icon: <TrophyOutlined />,
            value: 98,
            suffix: '%',
            label: 'Độ hài lòng bệnh nhân',
            color: '#faad14',
            bgColor: '#fffbe6',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Row gutter={[32, 32]}>
            {[1, 2, 3, 4].map(i => (
              <Col xs={12} md={6} key={i}>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Col>
            ))}
          </Row>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <Row gutter={[32, 32]}>
          {stats?.map((stat, index) => (
            <Col xs={12} md={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    backgroundColor: stat.bgColor,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </motion.div>
                <div className="text-4xl font-bold text-gray-900">
                  <Counter value={stat.value} />
                  <span className="text-2xl ml-1">{stat.suffix}</span>
                </div>
                <p className="text-gray-600 mt-2 font-medium">{stat.label}</p>
              </motion.div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default StatsSection;
