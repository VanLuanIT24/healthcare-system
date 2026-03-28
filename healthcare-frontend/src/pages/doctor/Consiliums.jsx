import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import { TeamOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Tag, Avatar, List } from 'antd';

const mockConsiliums = [
  { id: 1, patient: 'Nguyễn Văn A', disease: 'Ung thư phổi giai đoạn 2', requestDate: '26/03/2026', status: 'pending', specialists: ['Tim mạch', 'Ung bướu'] },
  { id: 2, patient: 'Trần Thị B', disease: 'Suy thận mạn tính', requestDate: '25/03/2026', status: 'confirmed', specialists: ['Thận học', 'Dinh dưỡng'] },
  { id: 3, patient: 'Lê Văn C', disease: 'Đột quỵ nhồi máu não', requestDate: '24/03/2026', status: 'completed', specialists: ['Thần kinh', 'Phục hồi chức năng'] },
];

const statusMap = {
  pending: { color: 'orange', label: 'Đang chờ' },
  confirmed: { color: 'blue', label: 'Đã xác nhận' },
  completed: { color: 'green', label: 'Hoàn thành' },
};

const Consiliums = () => (
  <DoctorLayout>
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0">Hội chẩn & Chuyển tuyến</h1>
          <p className="text-gray-500 mt-1 m-0">Quản lý các ca hội chẩn nội bộ và yêu cầu chuyển tuyến chuyên khoa</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} className="bg-blue-600 border-none shadow-md">
          Tạo yêu cầu mới
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Chờ duyệt', value: 1, color: 'text-orange-500 bg-orange-50' },
          { label: 'Đã xác nhận', value: 1, color: 'text-blue-500 bg-blue-50' },
          { label: 'Hoàn thành', value: 1, color: 'text-green-500 bg-green-50' },
        ].map((s) => (
          <Card key={s.label} className="rounded-xl shadow-sm border-0">
            <div className={`text-3xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl shadow-sm border-0">
        <List
          dataSource={mockConsiliums}
          renderItem={(item) => (
            <List.Item
              className="hover:bg-gray-50 px-4 rounded-lg cursor-pointer transition-colors"
              actions={[
                <Button type="primary" size="small" className="bg-blue-600 border-none">Chi tiết</Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar className="bg-purple-100 text-purple-600 text-lg font-bold">{item.patient.charAt(0)}</Avatar>}
                title={<span className="font-semibold text-gray-800">{item.patient}</span>}
                description={
                  <div>
                    <div className="text-gray-600 text-sm mb-1">{item.disease}</div>
                    <div className="flex gap-2 flex-wrap">
                      {item.specialists.map((s) => <Tag key={s} color="purple">{s}</Tag>)}
                      <Tag color={statusMap[item.status].color}>{statusMap[item.status].label}</Tag>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  </DoctorLayout>
);

export default Consiliums;
