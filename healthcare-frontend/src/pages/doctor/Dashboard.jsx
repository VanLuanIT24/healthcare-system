// src/pages/doctor/Dashboard.jsx - Dashboard cho bác sĩ
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  DownloadOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  PaperClipOutlined,
  SendOutlined,
  FilePdfOutlined,
  UserOutlined,
  RightOutlined,
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Avatar, Button, Card, Col, List, Row, Input, Typography, Tag, Skeleton, Badge } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentAPI from '@/services/api/appointmentAPI';
import userAPI from '@/services/api/userAPI';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Text, Title } = Typography;

// Mock data for charts and UI
const revenueData = [
  { name: 'Jan', week: 4000, month: 2400 },
  { name: 'Feb', week: 3000, month: 1398 },
  { name: 'Mar', week: 2000, month: 9800 },
  { name: 'Apr', week: 2780, month: 3908 },
  { name: 'May', week: 1890, month: 4800 },
  { name: 'Jun', week: 2390, month: 3800 },
  { name: 'Jul', week: 3490, month: 4300 },
  { name: 'Aug', week: 4000, month: 6500 },
  { name: 'Sep', week: 4500, month: 7800 },
  { name: 'Oct', week: 3000, month: 8000 },
  { name: 'Nov', week: 4800, month: 6000 },
  { name: 'Dec', week: 5500, month: 9000 },
];

const patientFiles = [
  { name: 'Prescription.pdf', size: '2.4 MB' },
  { name: 'X-ray report.pdf', size: '4.1 MB' },
  { name: 'Checkup.pdf', size: '1.2 MB' },
  { name: 'Screening.pdf', size: '3.5 MB' },
];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Đảm bảo không còn màu nền tối
    document.body.style.backgroundColor = '#f9fafb';
    
    const loadDoctorData = async () => {
      try {
        setLoading(true);
        const profileRes = await userAPI.getMyProfile();
        setProfileData(profileRes.data);

        const todayRes = await appointmentAPI.getTodayAppointments({ limit: 5 });
        const todayData = todayRes.data?.data || todayRes.data || [];
        setTodayAppointments(Array.isArray(todayData) ? todayData : []);

        const upcomingRes = await appointmentAPI.getUpcomingAppointments({ limit: 4 });
        const upcomingData = upcomingRes.data?.data || upcomingRes.data || [];
        setUpcomingAppointments(Array.isArray(upcomingData) ? upcomingData.slice(0, 4) : []);
      } catch (error) {
        console.error('Error loading doctor dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDoctorData();

    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <DoctorLayout>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 min-h-screen p-4 space-y-6"
      >
        {/* Quick Actions (Enterprise Feature) */}
        <Row gutter={[16, 16]}>
          {[
            { title: 'Tạo ca khám mới', icon: <UserOutlined />, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
            { title: 'Cấp giấy nghỉ ốm / Biểu mẫu', icon: <FileTextOutlined />, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
            { title: 'Yêu cầu Hội chẩn ca khó', icon: <TeamOutlined />, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
            { title: 'Tra cứu danh mục Thuốc', icon: <BookOutlined />, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' }
          ].map((action, idx) => (
            <Col xs={12} md={6} key={idx}>
              <Card 
                className={`hover:bg-white cursor-pointer transition-all border ${action.border} h-full shadow-sm hover:shadow-md rounded-xl`}
                bodyStyle={{ padding: '16px' }}
              >
                <div className="flex flex-col items-center justify-center text-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${action.color}`}>
                    {action.icon}
                  </div>
                  <span className="font-semibold text-gray-700 text-sm">{action.title}</span>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Top Row: Revenue & Patient List */}
        <Row gutter={[24, 24]}>
          {/* Revenue Chart */}
          <Col xs={24} lg={16}>
            <Card 
              className="h-full rounded-2xl shadow-sm border-0"
              title={<span className="text-gray-800 font-semibold text-lg">Doanh thu / Bệnh nhân</span>}
              extra={
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Tuần này
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Tháng này
                  </div>
                  <Button type="text" className="text-gray-400">Năm ▾</Button>
                </div>
              }
            >
              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Line type="monotone" dataKey="month" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="week" stroke="#22d3ee" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Patient List */}
          <Col xs={24} lg={8}>
            <Card 
              className="h-full rounded-2xl shadow-sm border-0 bg-white"
              title={<span className="text-gray-800 font-semibold text-lg">Danh sách cuộc hẹn hôm nay</span>}
              extra={<Button type="text" icon={<MoreOutlined className="text-lg text-gray-400" />} />}
              bodyStyle={{ padding: '0 24px 24px', overflowY: 'auto' }}
            >
              {loading ? <Skeleton active /> : (
                <List
                  dataSource={todayAppointments}
                  renderItem={(apt) => (
                    <List.Item className="border-b border-gray-100 last:border-0 py-3 hover:bg-gray-50 px-2 rounded-lg transition-colors cursor-pointer">
                      <List.Item.Meta
                        avatar={
                          <Avatar size={40} className="bg-blue-100 text-blue-600 border border-blue-200">
                            {apt.patientId?.personalInfo?.firstName?.[0] || 'U'}
                          </Avatar>
                        }
                        title={<span className="text-gray-800 font-medium">{apt.patientId?.personalInfo?.lastName} {apt.patientId?.personalInfo?.firstName}</span>}
                        description={
                          <span className="text-gray-500 text-xs">
                            {apt.patientId?.personalInfo?.gender === 'MALE' ? 'Nam' : 'Nữ'} • {dayjs(apt.appointmentDate).format('HH:mm')}
                          </span>
                        }
                      />
                      <Button title="Chi tiết" onClick={() => navigate(`/doctor/appointments/${apt._id}`)} type="text" icon={<MoreOutlined />} className="text-gray-400 hover:text-blue-500" />
                    </List.Item>
                  )}
                  locale={{ emptyText: <span className="text-gray-400">Không có bệnh nhân hôm nay</span> }}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* Bottom Area */}
        <Row gutter={[24, 24]}>
          {/* Left Column: History & Photos */}
          <Col xs={24} lg={6} className="space-y-6 flex flex-col h-full">
            <Card 
              className="rounded-2xl shadow-sm border-0 bg-white flex-1"
              title={<span className="text-gray-800 font-semibold text-lg">Lịch sử khám sắp tới</span>}
              extra={<Button type="link" size="small" onClick={() => navigate('/doctor/appointments')} className="text-blue-500 font-medium hover:text-blue-600">Xem tất cả</Button>}
            >
              {loading ? <Skeleton active paragraph={{rows: 2}} /> : (
                <List
                  dataSource={upcomingAppointments.length ? upcomingAppointments : [
                    { reason: 'Khám tổng quát', appointmentDate: new Date() },
                    { reason: 'Tầm soát', appointmentDate: new Date() },
                    { reason: 'Tư vấn trực tuyến', appointmentDate: new Date() },
                  ]}
                  renderItem={(apt) => (
                    <List.Item 
                      onClick={() => {
                        if (apt.reason === 'Tư vấn trực tuyến' || apt.reason === 'Chat Consultation') {
                          navigate('/doctor/messages');
                        } else if (apt._id) {
                          navigate(`/doctor/appointments/${apt._id}`);
                        } else {
                          navigate('/doctor/messages');
                        }
                      }}
                      className="border-b border-gray-100 py-3 last:border-0 hover:bg-gray-50 cursor-pointer rounded-lg px-2 transition-colors"
                    >
                      <List.Item.Meta
                        avatar={<Avatar size={36} className="bg-blue-50 text-blue-500 border border-blue-100" icon={<CalendarOutlined />} />}
                        title={<span className="text-gray-800 font-medium">{apt.reason || 'Khám bệnh'}</span>}
                        description={<span className="text-gray-500 text-xs">{dayjs(apt.appointmentDate).format('MMM DD - HH:mm')}</span>}
                      />
                      <RightOutlined className="text-gray-300 text-xs" />
                    </List.Item>
                  )}
                  locale={{ emptyText: <span className="text-gray-400">Không có lịch sử</span> }}
                />
              )}
            </Card>

            <Card className="rounded-2xl shadow-sm border-0 bg-white" title={<span className="text-gray-800 font-semibold text-lg">Chia sẻ hình ảnh</span>}>
              <Row gutter={12}>
                <Col span={12}>
                  <div className="h-32 bg-gray-100 rounded-xl overflow-hidden relative shadow-sm hover:opacity-90 transition-opacity cursor-pointer border border-gray-200">
                    <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=300&auto=format&fit=crop" alt="medical" className="w-full h-full object-cover" />
                  </div>
                </Col>
                <Col span={12} className="space-y-3">
                  <div className="h-14 bg-gray-100 rounded-xl overflow-hidden relative shadow-sm hover:opacity-90 transition-opacity cursor-pointer border border-gray-200">
                    <img src="https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=200&auto=format&fit=crop" alt="medical" className="w-full h-full object-cover" />
                  </div>
                  <div className="h-15 bg-gray-100 rounded-xl overflow-hidden relative shadow-sm hover:opacity-90 transition-opacity cursor-pointer border border-gray-200">
                    <img src="https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=200&auto=format&fit=crop" alt="medical" className="w-full h-full object-cover" />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Center Column: Video / Chat */}
          <Col xs={24} lg={12}>
            <Card className="h-full rounded-2xl shadow-sm border-0 overflow-hidden bg-white flex flex-col" bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Video/Image Area */}
              <div className="h-64 sm:h-[18rem] bg-gray-200 relative">
                <img 
                  src="https://plus.unsplash.com/premium_photo-1661766718556-13c2efac1388?q=80&w=1200&auto=format&fit=crop" 
                  alt="Doctor Consult" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
              
              {/* Chat Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <Badge dot color="#52c41a" offset={[-4, 28]}>
                    <Avatar src="https://images.unsplash.com/photo-1594824432258-f584e1b8cfee?q=80&w=100&auto=format&fit=crop" size={40} className="border border-gray-200 shadow-sm" />
                  </Badge>
                  <div>
                    <h3 className="font-semibold text-gray-800 m-0 leading-tight">Bệnh nhân Hồ Ngọc D.</h3>
                    <span className="text-xs text-green-500 font-medium">Đang trực tuyến</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="text" shape="circle" icon={<PhoneOutlined className="text-gray-500" />} className="hover:bg-gray-100" />
                  <Button type="text" shape="circle" icon={<VideoCameraOutlined className="text-gray-500" />} className="hover:bg-gray-100" />
                  <Button type="text" shape="circle" icon={<MoreOutlined className="text-gray-500" />} className="hover:bg-gray-100" />
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-4 shadow-inner" style={{ minHeight: '220px' }}>
                <div className="flex justify-start">
                  <div className="bg-white text-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 max-w-[85%] text-sm">
                    Chào bác sĩ, dạo này tôi hay bị đau đầu về chiều tối. Không biết có phải do làm việc máy tính nhiều không ạ?
                    <div className="text-[10px] text-gray-400 text-right mt-1">09:25</div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] text-sm">
                    Chào bạn. Triệu chứng này đã kéo dài bao lâu rồi? Bạn có bị căng thẳng công việc gần đây không?
                    <div className="text-[10px] text-blue-200 text-right mt-1">09:41</div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] text-sm">
                    Tôi có lịch hẹn với bạn vào mổ chiều mai, nhớ có mặt sớm 30 phút nhé.
                    <div className="text-[10px] text-blue-200 text-right mt-1">09:41</div>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2 items-center bg-gray-50 rounded-full p-1 pr-2 border border-gray-200 transition-colors focus-within:border-blue-400 focus-within:bg-white shadow-sm">
                  <Input 
                    placeholder="Nhập tin nhắn..." 
                    bordered={false} 
                    className="bg-transparent text-gray-800"
                  />
                  <Button type="text" shape="circle" icon={<PaperClipOutlined className="text-gray-500" />} className="hover:text-blue-500" />
                  <Button type="primary" shape="circle" className="bg-blue-600 hover:bg-blue-700 border-none shadow-md" size="middle" icon={<SendOutlined />} />
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Column: Patient File & To-Do List */}
          <Col xs={24} lg={6} className="space-y-6 flex flex-col h-full">
            
            {/* To-Do List (Enterprise Feature) */}
            <Card 
              className="rounded-2xl shadow-sm border-0 bg-white"
              title={<span className="text-gray-800 font-semibold text-lg">Việc cần làm hôm nay</span>}
              extra={<span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">3</span>}
            >
              <List
                dataSource={[
                  { task: 'Gọi lại cho bệnh nhân A hỏi tình trạng dị ứng', time: '14:00', urgent: true },
                  { task: 'Kiểm tra sinh thiết ca Nguyễn Văn B', time: '15:30', urgent: false },
                  { task: 'Phê duyệt 5 đơn thuốc nội trú', time: '16:00', urgent: false }
                ]}
                renderItem={(item) => (
                  <List.Item className="border-b border-gray-100 py-3 last:border-0 hover:bg-gray-50 px-2 rounded-lg cursor-pointer transition-colors flex items-start gap-3">
                    <CheckCircleOutlined className="text-gray-300 mt-1 hover:text-green-500 transition-colors" />
                    <div className="flex-1">
                      <div className={`text-sm ${item.urgent ? 'text-red-600 font-medium' : 'text-gray-700'}`}>{item.task}</div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1"><ClockCircleOutlined /> {item.time}</div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>

            <Card 
              className="rounded-2xl shadow-sm border-0 bg-white flex-1"
              title={<span className="text-gray-800 font-semibold text-lg">Tài liệu tham khảo</span>}
              extra={<Button type="link" size="small" onClick={() => navigate('/doctor/medical-records/preview')} className="text-blue-500 font-medium hover:text-blue-600">Xem tất cả</Button>}
            >
              <List
                dataSource={patientFiles}
                renderItem={(file) => (
                  <List.Item className="border-b border-gray-100 py-3 last:border-0 hover:bg-gray-50 px-2 rounded-lg cursor-pointer transition-colors">
                    <List.Item.Meta
                      avatar={<Avatar className="bg-red-50 text-red-500 shadow-sm border border-red-100" icon={<FilePdfOutlined />} />}
                      title={<span className="text-gray-800 font-medium text-sm">{file.name}</span>}
                      description={<span className="text-gray-500 text-xs">{file.size}</span>}
                    />
                    <Button type="text" shape="circle" icon={<DownloadOutlined className="text-blue-500" />} className="hover:bg-blue-100" />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

        </Row>
      </motion.div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
