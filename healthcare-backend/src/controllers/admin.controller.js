// src/controllers/admin.controller.js
const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const Bill = require('../models/bill.model');
const Medication = require('../models/medication.model');
const LabOrder = require('../models/labOrder.model');
const AuditLog = require('../models/auditLog.model');
const Patient = require('../models/patient.model');
const moment = require('moment');

/**
 * 🎯 ADMIN DASHBOARD CONTROLLER
 * Xử lý các API endpoints cho admin dashboard
 */

class AdminController {
  /**
   * GET /api/admin/dashboard/stats
   * Lấy thống kê tổng quan dashboard - CẢI TIẾN VỚI DỮ LIỆU THỰC TỪ DATABASE
   */
  async getDashboardStats(req, res) {
    try {
      const today = moment().startOf('day');
      const endOfDay = moment().endOf('day');

      console.log('📊 [ADMIN] Fetching dashboard stats for:', today.format('YYYY-MM-DD'));

      // 🎯 THỐNG KÊ BỆNH NHÂN HÔM NAY (bệnh nhân mới đăng ký)
      const patientsToday = await User.countDocuments({
        role: 'PATIENT',
        createdAt: { $gte: today.toDate(), $lte: endOfDay.toDate() }
      });

      // 🎯 TỔNG SỐ BỆNH NHÂN
      const totalPatients = await User.countDocuments({ role: 'PATIENT' });

      // 🎯 THỐNG KÊ LỊCH HẸN HÔM NAY
      const appointmentsToday = await Appointment.countDocuments({
        appointmentDate: { $gte: today.toDate(), $lte: endOfDay.toDate() },
        status: { $nin: ['CANCELLED'] }
      });

      // 🎯 THỐNG KÊ LỊCH HẸN THEO TRẠNG THÁI HÔM NAY
      const appointmentsByStatus = await Appointment.aggregate([
        {
          $match: {
            appointmentDate: { $gte: today.toDate(), $lte: endOfDay.toDate() }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // 🎯 DOANH THU HÔM NAY (đã thanh toán)
      const revenueToday = await Bill.aggregate([
        {
          $match: {
            createdAt: { $gte: today.toDate(), $lte: endOfDay.toDate() },
            status: { $in: ['PAID', 'PARTIAL'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$paidAmount' },
            count: { $sum: 1 }
          }
        }
      ]);

      // 🎯 TỔNG DOANH THU THÁNG NÀY
      const startOfMonth = moment().startOf('month');
      const revenueMonth = await Bill.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth.toDate(), $lte: endOfDay.toDate() },
            status: { $in: ['PAID', 'PARTIAL'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$paidAmount' }
          }
        }
      ]);

      // 🎯 GIƯỜNG BỆNH (tính theo số BN đang nhập viện)
      const totalBeds = 150;
      const occupiedBeds = await Patient.countDocuments({
        admissionStatus: 'ADMITTED'
      });
      const bedsAvailable = totalBeds - occupiedBeds;
      const bedOccupancyRate = ((occupiedBeds / totalBeds) * 100).toFixed(1);

      // 🎯 THỐNG KÊ BÁC SĨ
      const totalDoctors = await User.countDocuments({ role: 'DOCTOR', status: 'ACTIVE' });
      const totalNurses = await User.countDocuments({ role: 'NURSE', status: 'ACTIVE' });

      // 🎯 HÓA ĐƠN CHỜ THANH TOÁN
      const pendingBills = await Bill.countDocuments({ status: 'PENDING' });

      console.log('✅ [ADMIN] Dashboard stats fetched successfully');

      res.json({
        success: true,
        data: {
          // Statistics Cards
          patientsToday,
          totalPatients,
          appointmentsToday,
          appointmentsByStatus: appointmentsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          revenueToday: revenueToday[0]?.total || 0,
          revenueTodayCount: revenueToday[0]?.count || 0,
          revenueMonth: revenueMonth[0]?.total || 0,
          bedsAvailable,
          totalBeds,
          occupiedBeds,
          bedOccupancyRate: parseFloat(bedOccupancyRate),
          
          // Additional Stats
          totalDoctors,
          totalNurses,
          pendingBills,
          
          // Metadata
          timestamp: new Date(),
          date: today.format('YYYY-MM-DD')
        }
      });
    } catch (error) {
      console.error('❌ [ADMIN] Get dashboard stats error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Lỗi khi lấy thống kê dashboard',
        error: error.message 
      });
    }
  }

  /**
   * GET /api/admin/dashboard/revenue-chart
   * Lấy dữ liệu biểu đồ doanh thu 7 ngày - CẢI TIẾN VỚI ĐẦY ĐỦ THÔNG TIN
   */
  async getRevenueChart(req, res) {
    try {
      const last7Days = moment().subtract(6, 'days').startOf('day');
      const today = moment().endOf('day');

      console.log('📈 [ADMIN] Fetching revenue chart data from:', last7Days.format('YYYY-MM-DD'));

      const revenueData = await Bill.aggregate([
        {
          $match: {
            createdAt: { $gte: last7Days.toDate(), $lte: today.toDate() },
            status: { $in: ['PAID', 'PARTIAL'] }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            revenue: { $sum: '$paidAmount' },
            count: { $sum: 1 },
            avgAmount: { $avg: '$paidAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Đảm bảo có đủ 7 ngày (ngay cả những ngày không có dữ liệu)
      const fullDataMap = {};
      for (let i = 0; i < 7; i++) {
        const date = moment().subtract(6 - i, 'days').format('YYYY-MM-DD');
        fullDataMap[date] = {
          date: moment(date).format('DD/MM'),
          fullDate: date,
          revenue: 0,
          count: 0,
          avgAmount: 0
        };
      }

      // Gán dữ liệu thực vào
      revenueData.forEach(item => {
        if (fullDataMap[item._id]) {
          fullDataMap[item._id].revenue = item.revenue;
          fullDataMap[item._id].count = item.count;
          fullDataMap[item._id].avgAmount = Math.round(item.avgAmount);
        }
      });

      // Chuyển thành array và sort
      const formattedData = Object.values(fullDataMap).sort((a, b) => 
        moment(a.fullDate).diff(moment(b.fullDate))
      );

      console.log('✅ [ADMIN] Revenue chart data fetched:', formattedData.length, 'days');

      res.json({
        success: true,
        data: formattedData,
        summary: {
          totalRevenue: formattedData.reduce((sum, item) => sum + item.revenue, 0),
          totalBills: formattedData.reduce((sum, item) => sum + item.count, 0),
          avgDailyRevenue: Math.round(formattedData.reduce((sum, item) => sum + item.revenue, 0) / 7)
        }
      });
    } catch (error) {
      console.error('❌ [ADMIN] Get revenue chart error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Lỗi khi lấy dữ liệu biểu đồ doanh thu',
        error: error.message 
      });
    }
  }

  /**
   * GET /api/admin/dashboard/department-stats
   * Lấy thống kê số lượt khám theo khoa - CẢI TIẾN VỚI NHIỀU THÔNG TIN HƠN
   */
  async getDepartmentStats(req, res) {
    try {
      console.log('🏥 [ADMIN] Fetching department statistics');

      // Thống kê số lượt khám theo khoa (từ appointments)
      const appointmentStats = await User.aggregate([
        {
          $match: {
            role: 'DOCTOR',
            status: 'ACTIVE',
            'professionalInfo.department': { $exists: true }
          }
        },
        {
          $lookup: {
            from: 'appointments',
            localField: '_id',
            foreignField: 'doctorId',
            as: 'appointments'
          }
        },
        {
          $group: {
            _id: '$professionalInfo.department',
            totalAppointments: { $sum: { $size: '$appointments' } },
            doctorCount: { $sum: 1 }
          }
        },
        { $sort: { totalAppointments: -1 } },
        { $limit: 5 }
      ]);

      // Thống kê số bệnh nhân đang điều trị theo khoa
      const patientStats = await Patient.aggregate([
        {
          $match: {
            admissionStatus: 'ADMITTED',
            'currentAdmission.department': { $exists: true }
          }
        },
        {
          $group: {
            _id: '$currentAdmission.department',
            patientCount: { $sum: 1 }
          }
        }
      ]);

      // Kết hợp 2 thống kê
      const combinedStats = appointmentStats.map(dept => {
        const patientData = patientStats.find(p => p._id === dept._id);
        return {
          department: dept._id || 'Không xác định',
          count: dept.totalAppointments,
          doctorCount: dept.doctorCount,
          currentPatients: patientData?.patientCount || 0,
          avgAppointmentsPerDoctor: Math.round(dept.totalAppointments / dept.doctorCount)
        };
      });

      console.log('✅ [ADMIN] Department stats fetched:', combinedStats.length, 'departments');

      res.json({
        success: true,
        data: combinedStats,
        summary: {
          totalDepartments: combinedStats.length,
          totalAppointments: combinedStats.reduce((sum, item) => sum + item.count, 0),
          totalCurrentPatients: combinedStats.reduce((sum, item) => sum + item.currentPatients, 0)
        }
      });
    } catch (error) {
      console.error('❌ [ADMIN] Get department stats error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Lỗi khi lấy thống kê khoa',
        error: error.message 
      });
    }
  }

  /**
   * GET /api/admin/dashboard/patient-distribution
   * Lấy phân bố bệnh nhân - CẢI TIẾN VỚI NHIỀU LOẠI PHÂN BỐ
   */
  async getPatientDistribution(req, res) {
    try {
      const { type = 'admission' } = req.query; // admission, gender, age

      console.log('👥 [ADMIN] Fetching patient distribution by:', type);

      let distributionData = [];

      if (type === 'admission') {
        // Phân bố theo trạng thái nhập viện
        distributionData = await Patient.aggregate([
          {
            $group: {
              _id: '$admissionStatus',
              value: { $sum: 1 }
            }
          }
        ]);

        distributionData = distributionData.map(item => ({
          type: item._id === 'ADMITTED' ? 'Nội trú' : 
                item._id === 'DISCHARGED' ? 'Đã xuất viện' : 'Khác',
          value: item.value,
          status: item._id
        }));

      } else if (type === 'gender') {
        // Phân bố theo giới tính
        distributionData = await User.aggregate([
          {
            $match: { role: 'PATIENT', status: 'ACTIVE' }
          },
          {
            $group: {
              _id: '$personalInfo.gender',
              value: { $sum: 1 }
            }
          }
        ]);

        distributionData = distributionData.map(item => ({
          type: item._id === 'MALE' ? 'Nam' : 
                item._id === 'FEMALE' ? 'Nữ' : 'Khác',
          value: item.value,
          gender: item._id
        }));

      } else if (type === 'age') {
        // Phân bố theo độ tuổi
        distributionData = await User.aggregate([
          {
            $match: { 
              role: 'PATIENT', 
              status: 'ACTIVE',
              'personalInfo.dateOfBirth': { $exists: true }
            }
          },
          {
            $project: {
              age: {
                $dateDiff: {
                  startDate: '$personalInfo.dateOfBirth',
                  endDate: new Date(),
                  unit: 'year'
                }
              }
            }
          },
          {
            $bucket: {
              groupBy: '$age',
              boundaries: [0, 18, 40, 60, 150],
              default: 'Unknown',
              output: {
                count: { $sum: 1 }
              }
            }
          }
        ]);

        const ageLabels = {
          0: '0-17 tuổi (Trẻ em)',
          18: '18-39 tuổi (Thanh niên)',
          40: '40-59 tuổi (Trung niên)',
          60: '60+ tuổi (Cao tuổi)'
        };

        distributionData = distributionData.map(item => ({
          type: ageLabels[item._id] || 'Không xác định',
          value: item.count,
          ageGroup: item._id
        }));
      }

      console.log('✅ [ADMIN] Patient distribution fetched:', distributionData.length, 'groups');

      res.json({
        success: true,
        data: distributionData,
        type,
        total: distributionData.reduce((sum, item) => sum + item.value, 0)
      });

    } catch (error) {
      console.error('❌ [ADMIN] Get patient distribution error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Lỗi khi lấy phân bố bệnh nhân',
        error: error.message 
      });
    }
  }

  /**
   * GET /api/admin/dashboard/recent-activities
   * Lấy hoạt động gần đây - CẢI TIẾN VỚI THÔNG TIN CHI TIẾT HƠN
   */
  async getRecentActivities(req, res) {
    try {
      const { limit = 15 } = req.query;

      console.log('📝 [ADMIN] Fetching recent activities, limit:', limit);

      const activities = await AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('userId', 'email personalInfo.firstName personalInfo.lastName role');

      const formattedActivities = activities.map(activity => ({
        _id: activity._id,
        type: activity.action,
        category: AdminController.getCategoryFromAction(activity.action),
        message: AdminController.formatActivityMessage(activity),
        time: moment(activity.createdAt).fromNow(),
        fullTime: activity.createdAt,
        userId: activity.userId?._id,
        userName: activity.userId ? 
          `${activity.userId.personalInfo?.firstName} ${activity.userId.personalInfo?.lastName}` : 
          'Người dùng không xác định',
        userRole: activity.userId?.role || 'UNKNOWN',
        ipAddress: activity.ipAddress,
        metadata: activity.metadata
      }));

      console.log('✅ [ADMIN] Recent activities fetched:', formattedActivities.length, 'items');

      res.json({
        success: true,
        data: formattedActivities,
        total: formattedActivities.length
      });

    } catch (error) {
      console.error('❌ [ADMIN] Get recent activities error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Lỗi khi lấy hoạt động gần đây',
        error: error.message 
      });
    }
  }

  /**
   * Helper: Get category from action
   */
  static getCategoryFromAction(action) {
    if (action.includes('APPOINTMENT')) return 'APPOINTMENT';
    if (action.includes('PATIENT')) return 'PATIENT';
    if (action.includes('BILL') || action.includes('PAYMENT')) return 'BILLING';
    if (action.includes('USER') || action.includes('LOGIN')) return 'USER';
    if (action.includes('MEDICAL_RECORD')) return 'MEDICAL';
    if (action.includes('LAB')) return 'LABORATORY';
    if (action.includes('PRESCRIPTION')) return 'PHARMACY';
    return 'SYSTEM';
  }

  /**
   * Helper: Format activity message
   */
  static formatActivityMessage(activity) {
    const userName = activity.userId ? 
      `${activity.userId.personalInfo?.firstName} ${activity.userId.personalInfo?.lastName}` : 
      'Người dùng';

    switch (activity.action) {
      case 'CREATE_APPOINTMENT':
        return `${userName} đã tạo lịch hẹn mới`;
      case 'CREATE_USER':
        return `${userName} đã đăng ký tài khoản`;
      case 'UPDATE_BILL':
        return `Hóa đơn đã được cập nhật`;
      case 'CREATE_PRESCRIPTION':
        return `Đơn thuốc mới đã được tạo`;
      default:
        return `${userName} thực hiện ${activity.action}`;
    }
  }

  /**
   * GET /api/admin/system-health
   * Kiểm tra sức khỏe hệ thống - CẢI TIẾN VỚI PERFORMANCE METRICS
   */
  async getSystemHealth(req, res) {
    try {
      console.log('🏥 [ADMIN] Checking system health...');

      // Database connection status
      const mongoose = require('mongoose');
      const dbState = mongoose.connection.readyState;
      const dbStatus = {
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
        0: 'disconnected'
      }[dbState] || 'unknown';

      // Memory usage
      const memoryUsage = process.memoryUsage();
      const memoryStats = {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        heapUsedPercent: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      };

      // Uptime in human-readable format
      const uptimeSeconds = process.uptime();
      const days = Math.floor(uptimeSeconds / 86400);
      const hours = Math.floor((uptimeSeconds % 86400) / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);

      // Check database collections count
      let dbCollectionsCount = 0;
      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        dbCollectionsCount = collections.length;
      } catch (dbError) {
        console.warn('⚠️ Could not fetch collections count:', dbError.message);
      }

      // Check database size (approximate)
      let dbSize = 0;
      try {
        const dbStats = await mongoose.connection.db.stats();
        dbSize = Math.round(dbStats.dataSize / 1024 / 1024); // MB
      } catch (dbError) {
        console.warn('⚠️ Could not fetch database size:', dbError.message);
      }

      // Check collections document counts
      const collectionCounts = {
        users: await User.countDocuments(),
        appointments: await Appointment.countDocuments(),
        bills: await Bill.countDocuments(),
        patients: await Patient.countDocuments()
      };

      // Overall health status
      const isHealthy = dbState === 1 && memoryStats.heapUsedPercent < 90;

      const stats = {
        status: isHealthy ? 'healthy' : 'warning',
        timestamp: new Date(),
        uptime: {
          seconds: Math.round(uptimeSeconds),
          formatted: `${days}d ${hours}h ${minutes}m`
        },
        memory: memoryStats,
        database: {
          status: dbStatus,
          isConnected: dbState === 1,
          collectionsCount: dbCollectionsCount,
          sizeInMB: dbSize,
          host: mongoose.connection.host || 'N/A',
          name: mongoose.connection.name || 'N/A',
          collections: collectionCounts
        },
        server: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid
        }
      };

      console.log('✅ [ADMIN] System health check completed:', stats.status);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ [ADMIN] Get system health error:', error);
      res.status(500).json({ 
        success: false,
        status: 'unhealthy',
        message: 'Lỗi khi kiểm tra sức khỏe hệ thống',
        error: error.message
      });
    }
  }

  /**
   * GET /api/admin/audit-logs
   * Lấy danh sách audit logs
   */
  async getAuditLogs(req, res) {
    try {
      const { page = 1, limit = 20, action, module: moduleFilter, search = '', startDate, endDate } = req.query;
      
      console.log('📋 [ADMIN] Fetching audit logs:', { page, limit, action, module: moduleFilter });

      const query = {};
      
      if (action) query.action = action;
      if (moduleFilter) query.module = moduleFilter;
      
      if (search) {
        query.$or = [
          { 'user.email': { $regex: search, $options: 'i' } },
          { action: { $regex: search, $options: 'i' } },
          { module: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const logs = await AuditLog.find(query)
        .populate('user', 'firstName lastName email role')
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip(skip);

      const total = await AuditLog.countDocuments(query);

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('❌ [ADMIN] Get audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy audit logs',
        error: error.message
      });
    }
  }

  /**
   * GET /api/admin/audit-logs/:id
   * Lấy chi tiết một audit log
   */
  async getAuditLogById(req, res) {
    try {
      const { id } = req.params;
      
      const log = await AuditLog.findById(id)
        .populate('user', 'firstName lastName email role');

      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy audit log'
        });
      }

      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      console.error('❌ [ADMIN] Get audit log by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy chi tiết audit log',
        error: error.message
      });
    }
  }

  /**
   * GET /api/admin/audit-logs/export
   * Export audit logs as CSV
   */
  async exportAuditLogs(req, res) {
    try {
      const { action, startDate, endDate } = req.query;
      
      const query = {};
      if (action) query.action = action;
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const logs = await AuditLog.find(query)
        .populate('user', 'firstName lastName email role')
        .sort({ timestamp: -1 });

      // Convert to CSV
      let csv = 'Date,User,Email,Action,Module,Status,Metadata\n';
      
      logs.forEach(log => {
        const date = new Date(log.timestamp).toLocaleString('vi-VN');
        const user = log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown';
        const email = log.user?.email || '';
        const action = log.action || '';
        const module = log.module || '';
        const status = log.status || '';
        const metadata = JSON.stringify(log.metadata || {}).replace(/"/g, '""');
        
        csv += `"${date}","${user}","${email}","${action}","${module}","${status}","${metadata}"\n`;
      });

      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.send(csv);
    } catch (error) {
      console.error('❌ [ADMIN] Export audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi export audit logs',
        error: error.message
      });
    }
  }
}

module.exports = new AdminController();
