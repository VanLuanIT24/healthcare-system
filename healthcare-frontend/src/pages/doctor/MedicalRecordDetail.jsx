// src/pages/doctor/MedicalRecordDetail.jsx - Chi tiết hồ sơ bệnh nhân (Dark Theme Template)
import { useAuth } from '@/contexts/AuthContext';
import { appointmentAPI, userAPI } from '@/services/api';
import {
  ArrowLeftOutlined,
  LoadingOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  CheckOutlined,
  MoreOutlined,
  HeartOutlined,
  TeamOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Spin,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

dayjs.extend(relativeTime);
dayjs.locale('vi');

// --- DARK THEME COLORS ---
const colors = {
  bgApp: '#151b2c',
  bgPanel: '#1a233a',
  textMain: '#ffffff',
  textMuted: '#8b9bb4',
  textAccent: '#6754e2',
  border: '#2a3553',
  panelInner: '#222e4c'
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const MedicalRecordDetail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load chi tiết bệnh nhân
  const loadPatientDetail = async () => {
    try {
      if (!patientId || !user?._id) return;
      setLoading(true);

      if (patientId === 'preview') {
        setPatient({
          _id: '12458796',
          fullName: 'Nguyễn Văn A',
          createdAt: new Date(),
          address: '123 Đường Điện Biên Phủ, Quận 1, Tp.Hồ Chí Minh',
          weight: '75',
          height: "175",
        });
        setLoading(false);
        return;
      }

      const patientRes = await userAPI.getUserById(patientId);
      const patientData = patientRes.data?.data || patientRes.data;
      setPatient(patientData);
    } catch (error) {
      console.error('Lỗi khi tải thông tin bệnh nhân:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId && user?._id) {
      loadPatientDetail();
    }
    
    // Set body background for immersive dark theme
    document.body.style.backgroundColor = colors.bgApp;
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [patientId, user?._id]);

  if (loading) {
    return (
      <DoctorLayout>
        <div style={{ backgroundColor: colors.bgApp, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: colors.textAccent }} spin />} />
        </div>
      </DoctorLayout>
    );
  }

  if (!patient) return null;

  // Mock data cho giao diện tiếng Việt đẹp mắt
  const pName = patient.personalInfo?.firstName ? `${patient.personalInfo.lastName} ${patient.personalInfo.firstName}` : patient.fullName || 'Nguyễn Văn A';
  const pId = patient._id?.substring(0, 8).toUpperCase() || '12458796';
  const disease = 'Viêm đường hô hấp';
  const admissionDate = dayjs(patient.createdAt || new Date()).format('DD Thg MM, YYYY - HH:mm');
  
  const statsData = [
    { name: 'Phẫu thuật', value: 20 },
    { name: 'Vật lý trị liệu', value: 15 },
    { name: 'Đơn thuốc', value: 30 },
    { name: 'Mỡ máu', value: 10 },
    { name: 'Tim mạch', value: 25 },
  ];

  return (
    <DoctorLayout>
      <div 
        className="p-4 lg:p-6 min-h-[calc(100vh-64px)] font-sans overflow-x-hidden" 
        style={{ backgroundColor: colors.bgApp, color: colors.textMain }}
      >
        <div className="flex items-center mb-6">
          <Button
            type="text"
            icon={<ArrowLeftOutlined style={{ color: colors.textMain }} />}
            onClick={() => navigate(-1)}
            className="hover:bg-white/10"
            style={{ color: colors.textMain }}
          >
            Quay lại
          </Button>
          <h2 className="m-0 ml-4 text-xl font-semibold" style={{ color: colors.textMain }}>Chi tiết hồ sơ bệnh nhân</h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* CỘT TRÁI */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Địa chỉ & Mạng xã hội */}
            <div className="rounded-lg p-5 border" style={{ backgroundColor: colors.bgPanel, borderColor: colors.border }}>
              <div className="mb-4 text-sm font-medium" style={{ color: colors.textMuted }}>
                Địa chỉ : <span style={{ color: colors.textMain }}>{patient.address || '123 Đường Số 1, Quận 1, TP. HCM'}</span>
              </div>
              <div className="mb-3 text-sm font-medium" style={{ color: colors.textMuted }}>Mạng xã hội</div>
              <div className="flex gap-2 mb-5">
                <Button shape="circle" type="primary" className="bg-blue-600 border-none" icon={<FacebookOutlined />} />
                <Button shape="circle" type="primary" className="bg-sky-500 border-none" icon={<TwitterOutlined />} />
                <Button shape="circle" type="primary" className="bg-pink-600 border-none" icon={<InstagramOutlined />} />
              </div>
              
              {/* Bản đồ Placeholder */}
              <div className="w-full h-32 bg-gray-700 rounded overflow-hidden relative" style={{ backgroundImage: 'url("https://www.google.com/maps/d/thumbnail?mid=1vXtvT-1A-F5yG1Q7S_ZlE1uA1hE&hl=en_US")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute top-2 left-2 bg-white text-blue-600 text-xs px-2 py-1 rounded shadow cursor-pointer font-bold">
                  Bản đồ <EnvironmentOutlined />
                </div>
              </div>
            </div>

            {/* Lịch sử bệnh */}
            <div className="rounded-lg p-5 border" style={{ backgroundColor: colors.bgPanel, borderColor: colors.border }}>
              <h3 className="m-0 mb-6 text-base font-semibold" style={{ color: colors.textMain }}>Lịch sử bệnh lý</h3>
              
              <div className="relative pl-4 border-l-2" style={{ borderColor: colors.border }}>
                {[
                  { title: 'Tiểu đường', date: 'T2, 10 Th03 2021, 11:15 AM' },
                  { title: 'Chứng mất ngủ', date: 'T3, 21 Th06 2020, 03:22 PM' },
                  { title: 'Nha khoa', date: 'T4, 15 Th11 2020, 02:11 PM' },
                  { title: 'Suy nhược', date: 'CN, 11 Th01 2020, 12:24 PM' },
                ].map((item, i) => (
                  <div key={i} className="mb-6 relative">
                    <div className="absolute -left-[27px] w-6 h-6 rounded-full flex items-center justify-center bg-[#6754e2] shadow-[0_0_0_4px_#1a233a]">
                      <HeartOutlined className="text-white text-[10px]" />
                    </div>
                    <h4 className="m-0 text-sm font-semibold" style={{ color: colors.textMain }}>{item.title}</h4>
                    <span className="text-xs" style={{ color: colors.textMuted }}>{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bác sĩ phụ trách */}
            <div className="rounded-lg p-5 border" style={{ backgroundColor: colors.bgPanel, borderColor: colors.border }}>
              <h3 className="m-0 mb-6 text-base font-semibold" style={{ color: colors.textMain }}>Quản lý Bệnh án</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar size={48} src={user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"} />
                  <div>
                    <h4 className="m-0 text-sm font-semibold truncate max-w-[100px]" style={{ color: colors.textMain }}>BS. {user?.fullName || 'Trần Văn B'}</h4>
                    <span className="text-xs" style={{ color: colors.textMuted }}>Khoa nội tổng hợp</span>
                  </div>
                </div>
                <Button size="small" className="bg-white text-gray-800 border-none rounded font-semibold text-xs h-7">Sửa</Button>
              </div>
              <Button className="w-full mt-5 bg-purple-500/20 text-purple-400 border-none font-semibold rounded h-9 hover:bg-purple-500/30 flex items-center justify-center gap-2">
                <TeamOutlined /> Yêu cầu Hội chẩn
              </Button>
              <Button className="w-full mt-3 bg-blue-500/20 text-blue-400 border-none font-semibold rounded h-9 hover:bg-blue-500/30 flex items-center justify-center gap-2">
                <ArrowLeftOutlined style={{ transform: 'rotate(135deg)' }} /> Chuyển tuyến chuyên khoa
              </Button>
            </div>

          </div>

          {/* CỘT PHẢI */}
          <div className="xl:col-span-9 space-y-6">
            
            {/* Banner hiển thị tên */}
            <div className="rounded-lg overflow-hidden border" style={{ backgroundColor: colors.bgPanel, borderColor: colors.border }}>
              <div className="h-28 w-full bg-blue-100 relative" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
              
              <div className="px-6 pb-6 relative">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Avatar 
                    size={110} 
                    className="border-4 shrink-0 -mt-12 bg-blue-600 font-bold text-4xl"
                    style={{ borderColor: colors.bgPanel }}
                  >
                    {pName.charAt(0)}
                  </Avatar>
                  
                  <div className="pt-3 flex-1">
                    <h2 className="m-0 text-xl font-bold" style={{ color: colors.textMain }}>{pName}</h2>
                    <div className="text-sm font-semibold mt-1" style={{ color: '#8b9bb4' }}>Mã BN: #P- {pId}</div>
                    
                    <div className="flex flex-wrap items-center mt-3 gap-x-8 gap-y-2">
                      <div>
                        <span className="text-xs block" style={{ color: colors.textMuted }}>Chẩn đoán hiện tại</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-semibold text-white">{disease}</span>
                          <span className="bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded text-xs border border-blue-700/50 font-mono">ICD-10: J00</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs block" style={{ color: colors.textMuted }}>Khai báo lúc</span>
                        <span className="text-sm font-semibold mt-0.5 inline-block" style={{ color: colors.textMuted }}>{admissionDate}</span>
                      </div>
                      <div>
                        <span className="text-xs block" style={{ color: colors.textMuted }}>Mức chi trả BHYT</span>
                        <span className="text-sm font-semibold text-green-400 mt-0.5 inline-block flex items-center gap-1">80% <CheckOutlined /></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t pt-6" style={{ borderColor: colors.border }}>
                  <h3 className="m-0 text-base font-semibold mb-3" style={{ color: colors.textMain }}>Mô tả tình trạng bệnh</h3>
                  <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>
                    Bệnh nhân nhập viện trong tình trạng sốt cao, ho dai dẳng trên 1 tuần và đã uống thuốc nhưng không thuyên giảm. Các triệu chứng ban đầu bao gồm đau họng, nhức mỏi cơ, mệt mỏi và chán ăn. Tiền sử chưa ghi nhận bệnh lý liên quan nền nào khác.
                  </p>
                  <p className="text-sm leading-relaxed mt-3" style={{ color: colors.textMuted }}>
                    Yêu cầu thực hiện xét nghiệm tổng quát và chụp X-quang phổi để kiểm tra chính xác các diễn biến trước khi lên phác đồ điều trị kéo dài. Bệnh nhân có dấu hiệu mất ngủ nhẹ về đêm.
                  </p>
                </div>
              </div>
            </div>

            {/* Chỉ số sinh tồn & Biểu đồ thống kê */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chỉ số hiện tại */}
              <div className="rounded-lg p-6 border flex flex-col" style={{ backgroundColor: colors.bgPanel, borderColor: colors.border }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="m-0 text-base font-semibold" style={{ color: colors.textMain }}>Chỉ số sinh tồn</h3>
                  <MoreOutlined style={{ color: colors.textMuted }} className="cursor-pointer" />
                </div>
                
                <div className="flex justify-between items-center text-sm font-medium mb-6 pb-4 border-b" style={{ borderColor: colors.border }}>
                  <span style={{ color: colors.textMuted }}>Bệnh nhân: <span style={{ color: colors.textMain }}>{pName}</span></span>
                  <span style={{ color: colors.textMuted }}>Mã số: <span style={{ color: colors.textMain }}>{pId}</span></span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center mb-6 border-b pb-6" style={{ borderColor: colors.border }}>
                  <div>
                    <div className="text-xs mb-1" style={{ color: colors.textMuted }}>Cân nặng</div>
                    <div className="text-xl font-bold" style={{ color: colors.textMain }}>{patient.weight || '75'} <span className="text-sm font-normal" style={{ color: colors.textMuted }}>kg</span></div>
                  </div>
                  <div className="border-x" style={{ borderColor: colors.border }}>
                    <div className="text-xs mb-1" style={{ color: colors.textMuted }}>Chiều cao</div>
                    <div className="text-xl font-bold" style={{ color: colors.textMain }}>{patient.height || "175"} <span className="text-sm font-normal" style={{ color: colors.textMuted }}>cm</span></div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: colors.textMuted }}>BMI</div>
                    <div className="text-xl font-bold" style={{ color: colors.textMain }}>24.49</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-sm mb-2 font-medium" style={{ color: '#ef4444' }}>Chỉ số huyết áp</div>
                  <div className="flex justify-between items-center bg-[#222e4c] p-4 rounded-lg">
                    <div>
                      <span className="text-2xl font-bold" style={{ color: colors.textMain }}>120</span>
                      <span className="text-xs ml-1" style={{ color: colors.textMuted }}>Tâm thu (mmHg)</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold" style={{ color: colors.textMain }}>80</span>
                      <span className="text-xs ml-1" style={{ color: colors.textMuted }}>Tâm trương (mmHg)</span>
                    </div>
                  </div>
                  <div className="text-xs mt-3 text-right" style={{ color: colors.textMuted }}>Đo lần cuối: 25/03/2026</div>
                </div>

                <div className="mt-auto rounded p-4 flex items-center gap-3" style={{ backgroundColor: colors.textAccent }}>
                  <span className="text-white text-lg">🚬</span>
                  <span className="text-sm font-medium text-white">Thói quen hút thuốc: Đã bỏ 5 năm.</span>
                </div>
              </div>

              {/* Thống kê y tế của bạn */}
              <div className="rounded-lg p-6 border flex flex-col" style={{ backgroundColor: colors.bgPanel, borderColor: colors.border }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="m-0 text-base font-semibold" style={{ color: colors.textMain }}>Thống kê phân bổ bệnh án</h3>
                  <MoreOutlined style={{ color: colors.textMuted }} className="cursor-pointer" />
                </div>
                
                <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {statsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a233a', borderColor: '#2a3553', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  {statsData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold" style={{ color: colors.textMuted }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </DoctorLayout>
  );
};

export default MedicalRecordDetail;
