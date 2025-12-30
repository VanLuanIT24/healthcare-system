// src/pages/staff/Dashboard.jsx
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout';
import {
    CalendarOutlined,
    MedicineBoxOutlined,
    ExperimentOutlined,
    UserOutlined,
    BellOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Statistic, Typography, Avatar, List, Tag, Button } from 'antd';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const StaffDashboard = () => {
    const { user } = useAuth();

    // Get role-specific content
    const getRoleInfo = () => {
        switch (user?.role) {
            case 'NURSE':
                return {
                    title: 'Bảng điều khiển Y tá',
                    icon: <MedicineBoxOutlined />,
                    color: '#52c41a',
                    tasks: [
                        { title: 'Xem lịch trực hôm nay', link: '/admin/appointments/today', icon: <CalendarOutlined /> },
                        { title: 'Quản lý bệnh nhân', link: '/admin/patients', icon: <UserOutlined /> },
                        { title: 'Cập nhật hồ sơ bệnh án', link: '/admin/patients', icon: <MedicineBoxOutlined /> },
                    ],
                };
            case 'PHARMACIST':
                return {
                    title: 'Bảng điều khiển Dược sĩ',
                    icon: <MedicineBoxOutlined />,
                    color: '#1890ff',
                    tasks: [
                        { title: 'Quản lý kho thuốc', link: '/admin/medications', icon: <MedicineBoxOutlined /> },
                        { title: 'Xem đơn thuốc cần phát', link: '/admin/medications', icon: <ExperimentOutlined /> },
                        { title: 'Kiểm tra tồn kho', link: '/admin/medications', icon: <MedicineBoxOutlined /> },
                    ],
                };
            case 'LAB_TECHNICIAN':
                return {
                    title: 'Bảng điều khiển Kỹ thuật viên xét nghiệm',
                    icon: <ExperimentOutlined />,
                    color: '#722ed1',
                    tasks: [
                        { title: 'Xem yêu cầu xét nghiệm', link: '/admin/laboratory', icon: <ExperimentOutlined /> },
                        { title: 'Cập nhật kết quả', link: '/admin/laboratory', icon: <ExperimentOutlined /> },
                        { title: 'Xem lịch sử xét nghiệm', link: '/admin/laboratory', icon: <CalendarOutlined /> },
                    ],
                };
            default:
                return {
                    title: 'Bảng điều khiển Nhân viên',
                    icon: <UserOutlined />,
                    color: '#faad14',
                    tasks: [],
                };
        }
    };

    const roleInfo = getRoleInfo();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <DashboardLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="p-6"
            >
                {/* Welcome Header */}
                <motion.div variants={itemVariants} className="mb-8">
                    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-none">
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Title level={2} className="!text-white !mb-2">
                                    👋 Xin chào, {user?.personalInfo?.firstName || user?.email}!
                                </Title>
                                <Text className="text-white/80 text-lg">
                                    {roleInfo.title}
                                </Text>
                                <div className="mt-2">
                                    <Tag color={roleInfo.color} className="text-base px-3 py-1">
                                        {user?.role?.replace('_', ' ')}
                                    </Tag>
                                </div>
                            </Col>
                            <Col>
                                <Avatar
                                    size={80}
                                    icon={roleInfo.icon}
                                    style={{ backgroundColor: roleInfo.color }}
                                />
                            </Col>
                        </Row>
                    </Card>
                </motion.div>

                {/* Quick Stats */}
                <motion.div variants={itemVariants}>
                    <Row gutter={[16, 16]} className="mb-8">
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Công việc hôm nay"
                                    value={12}
                                    prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Đã hoàn thành"
                                    value={8}
                                    prefix={<MedicineBoxOutlined style={{ color: '#52c41a' }} />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Đang chờ xử lý"
                                    value={4}
                                    prefix={<ExperimentOutlined style={{ color: '#faad14' }} />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Thông báo mới"
                                    value={3}
                                    prefix={<BellOutlined style={{ color: '#722ed1' }} />}
                                />
                            </Card>
                        </Col>
                    </Row>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <Card title="Truy cập nhanh" className="mb-8">
                        <List
                            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3 }}
                            dataSource={roleInfo.tasks}
                            renderItem={(item) => (
                                <List.Item>
                                    <Link to={item.link}>
                                        <Card
                                            hoverable
                                            className="text-center hover:border-blue-400 transition-all"
                                        >
                                            <div className="text-3xl mb-3 text-blue-500">{item.icon}</div>
                                            <Text strong>{item.title}</Text>
                                        </Card>
                                    </Link>
                                </List.Item>
                            )}
                        />
                    </Card>
                </motion.div>

                {/* Settings Link */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Text className="text-gray-600">
                                    Cần thay đổi cài đặt tài khoản?
                                </Text>
                            </Col>
                            <Col>
                                <Link to="/patient/profile">
                                    <Button icon={<SettingOutlined />}>
                                        Cài đặt hồ sơ
                                    </Button>
                                </Link>
                            </Col>
                        </Row>
                    </Card>
                </motion.div>
            </motion.div>
        </DashboardLayout>
    );
};

export default StaffDashboard;
