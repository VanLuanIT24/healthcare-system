// 📊 System Reports - Clinical Reports
import {
    DownloadOutlined,
    ExperimentOutlined,
    LineChartOutlined,
    MedicineBoxOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import {
    Button,
    Card,
    Col,
    DatePicker,
    message,
    Row,
    Select,
    Space,
    Statistic,
    Table
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import reportAPI from '../../services/api/reportAPI';
import './Reports.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ClinicalReports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [reportType, setReportType] = useState('patient-statistics');

  useEffect(() => {
    loadReport();
  }, [dateRange, reportType]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getClinicalReport({
        type: reportType,
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
      });
      setReportData(response.data);
    } catch (error) {
      message.error('Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await reportAPI.exportReport({
        type: reportType,
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
        format: 'pdf',
      });
      message.success('Xuất báo cáo thành công');
    } catch (error) {
      message.error('Xuất báo cáo thất bại');
    }
  };

  const columnConfig = {
    data: reportData?.chartData || [],
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    label: {
      position: 'top',
      style: {
        fill: '#262626',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    legend: {
      position: 'top',
    },
    smooth: true,
  };

  const pieConfig = {
    data: reportData?.pieData || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const patientStatColumns = [
    {
      title: 'Chỉ số',
      dataIndex: 'metric',
      key: 'metric',
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      render: (val) => <strong style={{ color: '#1890ff' }}>{val}</strong>,
    },
    {
      title: 'So với tháng trước',
      dataIndex: 'change',
      key: 'change',
      render: (change) => {
        const isPositive = change > 0;
        return (
          <span style={{ color: isPositive ? '#52c41a' : '#ff4d4f' }}>
            {isPositive ? '+' : ''}
            {change}%
          </span>
        );
      },
    },
  ];

  return (
    <div className="page-container clinical-reports-container">
      <PageHeader
        title="Báo cáo lâm sàng"
        subtitle="Thống kê và phân tích hoạt động lâm sàng"
      />

      <Card className="filter-section">
        <Row gutter={16} align="middle">
          <Col xs={24} md={10}>
            <Space>
              <span>Loại báo cáo:</span>
              <Select
                style={{ width: 250 }}
                value={reportType}
                onChange={setReportType}
              >
                <Option value="patient-statistics">Thống kê bệnh nhân</Option>
                <Option value="appointment-analysis">Phân tích lịch hẹn</Option>
                <Option value="diagnosis-distribution">Phân bố chẩn đoán</Option>
                <Option value="doctor-performance">Hiệu suất bác sĩ</Option>
                <Option value="treatment-outcomes">Kết quả điều trị</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} md={10}>
            <Space>
              <span>Thời gian:</span>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
              />
            </Space>
          </Col>
          <Col xs={24} md={4}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              block
            >
              Xuất báo cáo
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng bệnh nhân"
              value={reportData?.summary?.totalPatients || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Lượt khám"
              value={reportData?.summary?.totalAppointments || 0}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đơn thuốc"
              value={reportData?.summary?.totalPrescriptions || 0}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Xét nghiệm"
              value={reportData?.summary?.totalLabTests || 0}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Biểu đồ thống kê" loading={loading}>
            <Column {...columnConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân bố" loading={loading}>
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      <Card title="Chi tiết thống kê" style={{ marginTop: 16 }} loading={loading}>
        <Table
          columns={patientStatColumns}
          dataSource={reportData?.detailedStats || []}
          pagination={false}
          rowKey="metric"
        />
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Top 5 chẩn đoán thường gặp" loading={loading}>
            <div className="diagnosis-list">
              {(reportData?.topDiagnoses || []).map((item, index) => (
                <div key={index} className="diagnosis-item">
                  <span className="diagnosis-rank">#{index + 1}</span>
                  <span className="diagnosis-name">{item.diagnosis}</span>
                  <span className="diagnosis-count">{item.count} ca</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Top 5 bác sĩ" loading={loading}>
            <div className="doctor-ranking-list">
              {(reportData?.topDoctors || []).map((doctor, index) => (
                <div key={index} className="doctor-ranking-item">
                  <span className="doctor-rank">#{index + 1}</span>
                  <span className="doctor-name">{doctor.name}</span>
                  <span className="doctor-patients">{doctor.patients} BN</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClinicalReports;
