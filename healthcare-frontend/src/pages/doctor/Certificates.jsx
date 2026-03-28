import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import { FileProtectOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Card, List, Tag, Avatar } from 'antd';

const templates = [
  { id: 1, name: 'Giấy nghỉ ốm (Hưởng BHXH)', icon: '🏥', color: 'bg-blue-50 text-blue-600', desc: 'Cấp giấy nghỉ ốm hưởng bảo hiểm xã hội theo mẫu chuẩn' },
  { id: 2, name: 'Giấy chứng nhận sức khỏe', icon: '💪', color: 'bg-green-50 text-green-600', desc: 'Xác nhận tình trạng sức khỏe tổng quát cho bệnh nhân' },
  { id: 3, name: 'Giấy giới thiệu khám chuyên khoa', icon: '📋', color: 'bg-purple-50 text-purple-600', desc: 'Chuyển bệnh nhân đến khám tại đơn vị chuyên khoa' },
  { id: 4, name: 'Tóm tắt bệnh án xuất viện', icon: '📄', color: 'bg-orange-50 text-orange-600', desc: 'Tóm tắt quá trình điều trị khi bệnh nhân xuất viện' },
  { id: 5, name: 'Cam kết trước phẫu thuật', icon: '✍️', color: 'bg-red-50 text-red-600', desc: 'Phiếu cam kết chấp thuận phẫu thuật của bệnh nhân/người giám hộ' },
  { id: 6, name: 'Chỉ định xét nghiệm & Chẩn đoán hình ảnh', icon: '🔬', color: 'bg-cyan-50 text-cyan-600', desc: 'Biểu mẫu chỉ định các xét nghiệm và MRI/X-quang/CT' },
];

const Certificates = () => (
  <DoctorLayout>
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0">Biểu mẫu & Pháp lý</h1>
          <p className="text-gray-500 mt-1 m-0">Tạo và in ấn các loại giấy tờ y tế chính thống cho bệnh nhân</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((t) => (
          <Card
            key={t.id}
            hoverable
            className="rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${t.color.split(' ')[0]}`}>
              {t.icon}
            </div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">{t.name}</h3>
            <p className="text-gray-500 text-xs leading-relaxed mb-4">{t.desc}</p>
            <div className="flex gap-2">
              <Button size="small" type="primary" icon={<FileProtectOutlined />} className="bg-blue-600 border-none text-xs">
                Tạo mới
              </Button>
              <Button size="small" icon={<PrinterOutlined />} className="text-xs">In</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </DoctorLayout>
);

export default Certificates;
