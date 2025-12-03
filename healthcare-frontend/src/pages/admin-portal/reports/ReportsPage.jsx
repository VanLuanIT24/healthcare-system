import {
    FileExcelOutlined,
    FilePdfOutlined
} from '@ant-design/icons';
import { Column, Line, Pie } from '@ant-design/plots';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tabs,
    Typography,
    message
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { getAuthHeaders } from '../../../services/adminApi';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [clinicalData, setClinicalData] = useState({
    appointmentStats: [],
    departmentStats: [],
    doctorPerformance: []
  });
  const [financialData, setFinancialData] = useState({
    revenueChart: [],
    paymentMethods: [],
    topServices: []
  });
  const [pharmacyData, setPharmacyData] = useState({
    topMedications: [],
    categoryRevenue: [],
    prescriptionStats: []
  });
  const [hrData, setHRData] = useState({
    staffByRole: [],
    departmentStaff: [],
    performance: []
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const config = {
        ...getAuthHeaders(),
        params: {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        }
      };

      // Fetch all reports data
      const [clinical, financial, pharmacy, hr] = await Promise.all([
        axios.get(`${API_BASE_URL}/reports/clinical`, config).catch(() => ({ data: getMockClinicalData() })),
        axios.get(`${API_BASE_URL}/reports/financial`, config).catch(() => ({ data: getMockFinancialData() })),
        axios.get(`${API_BASE_URL}/reports/pharmacy`, config).catch(() => ({ data: getMockPharmacyData() })),
        axios.get(`${API_BASE_URL}/reports/hr`, config).catch(() => ({ data: getMockHRData() }))
      ]);

      setClinicalData(clinical.data);
      setFinancialData(financial.data);
      setPharmacyData(pharmacy.data);
      setHRData(hr.data);
    } catch (error) {
      message.error('Không thể tải báo cáo');
      console.error('Fetch reports error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const getMockClinicalData = () => ({
    appointmentStats: [
      { date: '2025-11-20', total: 45, completed: 40, cancelled: 5 },
      { date: '2025-11-21', total: 52, completed: 48, cancelled: 4 },
      { date: '2025-11-22', total: 48, completed: 45, cancelled: 3 },
      { date: '2025-11-23', total: 55, completed: 52, cancelled: 3 },
      { date: '2025-11-24', total: 50, completed: 47, cancelled: 3 }
    ],
    departmentStats: [
      { department: 'Tim mạch', patients: 120, revenue: 150000000 },
      { department: 'Nhi khoa', patients: 95, revenue: 120000000 },
      { department: 'Nội tổng quát', patients: 88, revenue: 110000000 }
    ],
    doctorPerformance: [
      { doctor: 'BS. Nguyễn Văn A', appointments: 45, rating: 4.8 },
      { doctor: 'BS. Trần Thị B', appointments: 42, rating: 4.7 }
    ]
  });

  const getMockFinancialData = () => ({
    revenueChart: [
      { date: '2025-11-20', revenue: 25000000 },
      { date: '2025-11-21', revenue: 28000000 },
      { date: '2025-11-22', revenue: 30000000 },
      { date: '2025-11-23', revenue: 27000000 },
      { date: '2025-11-24', revenue: 32000000 }
    ],
    paymentMethods: [
      { method: 'Tiền mặt', value: 45 },
      { method: 'Thẻ', value: 35 },
      { method: 'Chuyển khoản', value: 20 }
    ],
    topServices: [
      { service: 'Khám tổng quát', revenue: 50000000, count: 200 },
      { service: 'Xét nghiệm máu', revenue: 35000000, count: 350 }
    ]
  });

  const getMockPharmacyData = () => ({
    topMedications: [
      { name: 'Paracetamol', quantity: 500, revenue: 10000000 },
      { name: 'Amoxicillin', quantity: 300, revenue: 15000000 }
    ],
    categoryRevenue: [
      { category: 'Kháng sinh', revenue: 45000000 },
      { category: 'Giảm đau', revenue: 30000000 }
    ],
    prescriptionStats: [
      { date: '2025-11-20', count: 45 },
      { date: '2025-11-21', count: 52 }
    ]
  });

  const getMockHRData = () => ({
    staffByRole: [
      { role: 'Bác sĩ', count: 25 },
      { role: 'Điều dưỡng', count: 40 },
      { role: 'Dược sĩ', count: 15 }
    ],
    departmentStaff: [
      { department: 'Tim mạch', staff: 12 },
      { department: 'Nhi khoa', staff: 10 }
    ],
    performance: [
      { staff: 'Nguyễn Văn A', rating: 4.8, tasks: 45 }
    ]
  });

  const exportReport = async (type, format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/reports/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            type,
            format,
            startDate: dateRange[0].format('YYYY-MM-DD'),
            endDate: dateRange[1].format('YYYY-MM-DD')
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${type}_${moment().format('YYYYMMDD')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      message.success('Xuất báo cáo thành công');
    } catch (error) {
      message.error('Không thể xuất báo cáo');
    }
  };

  // Clinical Report Tab
  const ClinicalReport = () => {
    const appointmentColumns = [
      {
        title: 'Khoa',
        dataIndex: 'department',
        key: 'department'
      },
      {
        title: 'Tổng lượt khám',
        dataIndex: 'totalAppointments',
        key: 'total',
        sorter: (a, b) => a.totalAppointments - b.totalAppointments
      },
      {
        title: 'Hoàn thành',
        dataIndex: 'completed',
        key: 'completed'
      },
      {
        title: 'Đã hủy',
        dataIndex: 'cancelled',
        key: 'cancelled'
      },
      {
        title: 'Tỷ lệ hoàn thành',
        key: 'rate',
        render: (_, record) => {
          const rate = ((record.completed / record.totalAppointments) * 100).toFixed(1);
          return `${rate}%`;
        }
      }
    ];

    const appointmentConfig = {
      data: clinicalData.appointmentStats || [],
      xField: 'date',
      yField: 'count',
      seriesField: 'status',
      smooth: true,
      legend: { position: 'top' }
    };

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng lượt khám"
                value={clinicalData.departmentStats?.reduce((sum, d) => sum + d.totalAppointments, 0) || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Lượt khám hoàn thành"
                value={clinicalData.departmentStats?.reduce((sum, d) => sum + d.completed, 0) || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tỷ lệ hoàn thành"
                value={
                  clinicalData.departmentStats?.length
                    ? ((clinicalData.departmentStats.reduce((sum, d) => sum + d.completed, 0) /
                        clinicalData.departmentStats.reduce((sum, d) => sum + d.totalAppointments, 0)) *
                        100).toFixed(1)
                    : 0
                }
                suffix="%"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Biểu đồ lượt khám theo thời gian">
          <Line {...appointmentConfig} />
        </Card>

        <Card title="Thống kê theo khoa">
          <Table
            columns={appointmentColumns}
            dataSource={clinicalData.departmentStats || []}
            rowKey="department"
            pagination={false}
          />
        </Card>
      </Space>
    );
  };

  // Financial Report Tab
  const FinancialReport = () => {
    const revenueConfig = {
      data: financialData.revenueChart || [],
      xField: 'date',
      yField: 'revenue',
      smooth: true,
      color: '#52c41a'
    };

    const paymentConfig = {
      data: financialData.paymentMethods || [],
      angleField: 'amount',
      colorField: 'method',
      radius: 0.8,
      label: {
        type: 'outer',
        content: '{name} {percentage}'
      }
    };

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={financialData.revenueChart?.reduce((sum, r) => sum + r.revenue, 0) || 0}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                suffix="VNĐ"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Doanh thu trung bình/ngày"
                value={
                  financialData.revenueChart?.length
                    ? financialData.revenueChart.reduce((sum, r) => sum + r.revenue, 0) /
                      financialData.revenueChart.length
                    : 0
                }
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                suffix="VNĐ"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Số hóa đơn"
                value={financialData.totalBills || 0}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Biểu đồ doanh thu">
          <Line {...revenueConfig} />
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Phương thức thanh toán">
              <Pie {...paymentConfig} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Top dịch vụ">
              <Column
                data={financialData.topServices || []}
                xField="service"
                yField="revenue"
                label={{
                  position: 'top'
                }}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    );
  };

  // Pharmacy Report Tab
  const PharmacyReport = () => {
    const medColumns = [
      {
        title: 'Thuốc',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: 'Số lượng bán',
        dataIndex: 'quantity',
        key: 'quantity',
        sorter: (a, b) => a.quantity - b.quantity
      },
      {
        title: 'Doanh thu',
        dataIndex: 'revenue',
        key: 'revenue',
        render: (amount) =>
          new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(amount),
        sorter: (a, b) => a.revenue - b.revenue
      }
    ];

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đơn thuốc"
                value={pharmacyData.prescriptionStats?.total || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={pharmacyData.topMedications?.reduce((sum, m) => sum + m.revenue, 0) || 0}
                precision={0}
                valueStyle={{ color: '#52c41a' }}
                suffix="VNĐ"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Số loại thuốc bán"
                value={pharmacyData.topMedications?.length || 0}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Top thuốc bán chạy">
          <Table
            columns={medColumns}
            dataSource={pharmacyData.topMedications || []}
            rowKey="name"
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <Card title="Doanh thu theo danh mục">
          <Column
            data={pharmacyData.categoryRevenue || []}
            xField="category"
            yField="revenue"
            label={{
              position: 'top'
            }}
          />
        </Card>
      </Space>
    );
  };

  // HR Report Tab
  const HRReport = () => {
    const staffConfig = {
      data: hrData.staffByRole || [],
      angleField: 'count',
      colorField: 'role',
      radius: 0.8,
      label: {
        type: 'outer',
        content: '{name} ({value})'
      }
    };

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng nhân viên"
                value={hrData.staffByRole?.reduce((sum, s) => sum + s.count, 0) || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Bác sĩ"
                value={hrData.staffByRole?.find(s => s.role === 'DOCTOR')?.count || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Điều dưỡng"
                value={hrData.staffByRole?.find(s => s.role === 'NURSE')?.count || 0}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Phân bổ theo vai trò">
              <Pie {...staffConfig} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Phân bổ theo khoa">
              <Column
                data={hrData.departmentStaff || []}
                xField="department"
                yField="count"
                label={{
                  position: 'top'
                }}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    );
  };

  const tabItems = [
    {
      key: 'clinical',
      label: 'Báo cáo lâm sàng',
      children: <ClinicalReport />
    },
    {
      key: 'financial',
      label: 'Báo cáo tài chính',
      children: <FinancialReport />
    },
    {
      key: 'pharmacy',
      label: 'Báo cáo nhà thuốc',
      children: <PharmacyReport />
    },
    {
      key: 'hr',
      label: 'Báo cáo nhân sự',
      children: <HRReport />
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Báo cáo thống kê
            </Title>
          </Col>
          <Col>
            <Space>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
              />
              <Button icon={<FileExcelOutlined />} onClick={() => exportReport('all', 'xlsx')}>
                Xuất Excel
              </Button>
              <Button icon={<FilePdfOutlined />} onClick={() => exportReport('all', 'pdf')}>
                Xuất PDF
              </Button>
            </Space>
          </Col>
        </Row>

        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default ReportsPage;
