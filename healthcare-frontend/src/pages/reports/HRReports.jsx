// 👥 HR Reports Page - Human Resources Reports
import {
    CalendarOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Card,
    Col,
    DatePicker,
    message,
    Row,
    Select,
    Space,
    Spin,
    Statistic,
    Table,
    Tag
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import reportAPI from '../../services/api/reportAPI';
import '../reports/Reports.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const HRReports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState([
    moment().startOf('month'),
    moment().endOf('month'),
  ]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    loadHRReport();
  }, [dateRange, selectedDepartment]);

  const loadHRReport = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.getHRReport({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      });

      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      message.error('Không thể tải báo cáo HR');
      console.error('Load HR report error:', error);
    } finally {
      setLoading(false);
    }
  };

  const staffColumns = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>{record.fullName}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleColors = {
          DOCTOR: 'blue',
          NURSE: 'cyan',
          PHARMACIST: 'green',
          LAB_TECHNICIAN: 'purple',
          RECEPTIONIST: 'orange',
          BILLING_STAFF: 'gold',
        };
        return <Tag color={roleColors[role] || 'default'}>{role}</Tag>;
      },
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Số ca làm việc',
      dataIndex: 'shiftsWorked',
      key: 'shiftsWorked',
      align: 'center',
      sorter: (a, b) => a.shiftsWorked - b.shiftsWorked,
    },
    {
      title: 'Giờ làm việc',
      dataIndex: 'hoursWorked',
      key: 'hoursWorked',
      align: 'center',
      render: (hours) => `${hours}h`,
      sorter: (a, b) => a.hoursWorked - b.hoursWorked,
    },
    {
      title: 'Hiệu suất',
      dataIndex: 'performance',
      key: 'performance',
      align: 'center',
      render: (performance) => {
        let color = 'green';
        if (performance < 70) color = 'red';
        else if (performance < 85) color = 'orange';
        return <Tag color={color}>{performance}%</Tag>;
      },
      sorter: (a, b) => a.performance - b.performance,
    },
  ];

  const departmentColumns = [
    {
      title: 'Phòng ban',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Space>
          <TeamOutlined />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Số nhân viên',
      dataIndex: 'staffCount',
      key: 'staffCount',
      align: 'center',
    },
    {
      title: 'Tổng giờ làm',
      dataIndex: 'totalHours',
      key: 'totalHours',
      align: 'center',
      render: (hours) => `${hours}h`,
    },
    {
      title: 'Hiệu suất TB',
      dataIndex: 'avgPerformance',
      key: 'avgPerformance',
      align: 'center',
      render: (perf) => `${perf}%`,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Đang tải báo cáo HR..." />
      </div>
    );
  }

  return (
    <div className="hr-reports-page">
      <PageHeader
        title="Báo Cáo Nhân Sự"
        subtitle="Thống kê và phân tích nhân sự bệnh viện"
        icon={<TeamOutlined />}
      />

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large" wrap>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              <CalendarOutlined /> Khoảng thời gian
            </label>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              style={{ width: 300 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              <TeamOutlined /> Phòng ban
            </label>
            <Select
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              style={{ width: 200 }}
            >
              <Option value="all">Tất cả phòng ban</Option>
              <Option value="Emergency">Cấp cứu</Option>
              <Option value="Surgery">Phẫu thuật</Option>
              <Option value="Pediatrics">Nhi khoa</Option>
              <Option value="Cardiology">Tim mạch</Option>
              <Option value="Radiology">Chẩn đoán hình ảnh</Option>
              <Option value="Laboratory">Xét nghiệm</Option>
              <Option value="Pharmacy">Dược</Option>
            </Select>
          </div>
        </Space>
      </Card>

      {/* Statistics Cards */}
      {reportData && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng nhân viên"
                  value={reportData.overview?.totalStaff || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Nhân viên hoạt động"
                  value={reportData.overview?.activeStaff || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng giờ làm việc"
                  value={reportData.overview?.totalHoursWorked || 0}
                  suffix="giờ"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Hiệu suất TB"
                  value={reportData.overview?.avgPerformance || 0}
                  suffix="%"
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Department Performance Table */}
          <Card
            title="Hiệu suất theo phòng ban"
            style={{ marginBottom: 24 }}
            variant="borderless"
          >
            <Table
              columns={departmentColumns}
              dataSource={reportData.departments || []}
              rowKey="name"
              pagination={false}
              size="small"
            />
          </Card>

          {/* Staff Performance Table */}
          <Card title="Hiệu suất nhân viên" variant="borderless">
            <Table
              columns={staffColumns}
              dataSource={reportData.staff || []}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} nhân viên`,
              }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default HRReports;
