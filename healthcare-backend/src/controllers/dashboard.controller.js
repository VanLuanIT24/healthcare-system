// controllers/dashboard.controller.js
const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const Bill = require('../models/bill.model');
const Department = require('../models/department.model');
const { asyncHandler } = require('../middlewares/error.middleware');
const { manualAuditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class DashboardController {
  // Thống kê users
  getUsersStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const activeUsers = await User.countDocuments({ isDeleted: false, isActive: true });
    const inactiveUsers = await User.countDocuments({ isDeleted: false, isActive: false });
    
    const roleStats = await User.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        roleStats,
        byRole: roleStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  });

  // Thống kê lịch khám
  getAppointmentsStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $ne: 'CANCELLED' }
    });

    const todayRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: 'PAID'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Last 7 days revenue
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last7DaysRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: 'PAID'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        todayAppointments,
        todayRevenue: todayRevenue[0]?.total || 0,
        appointmentsByStatus: appointmentsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        last7DaysRevenue
      }
    });
  });

  // Thống kê departments
  getDepartmentsStats = asyncHandler(async (req, res) => {
    const departments = await Department.find({ isDeleted: false });

    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const appointmentsCount = await Appointment.countDocuments({
          departmentId: dept._id,
          status: { $ne: 'CANCELLED' }
        });

        const doctorsCount = await User.countDocuments({
          role: 'DOCTOR',
          'professionalInfo.department': dept.name,
          isDeleted: false,
          isActive: true
        });

        return {
          name: dept.name,
          appointments: appointmentsCount,
          doctors: doctorsCount
        };
      })
    );

    const activeDoctors = await User.countDocuments({
      role: 'DOCTOR',
      isDeleted: false,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        departments: departmentStats,
        activeDoctors,
        totalDepartments: departments.length
      }
    });
  });

  // Overview reports
  getReportsOverview = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalPatients = await User.countDocuments({ role: 'PATIENT', isDeleted: false });
    const newPatientsToday = await User.countDocuments({
      role: 'PATIENT',
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const totalRevenue = await Bill.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingBills = await Bill.countDocuments({ status: 'PENDING' });

    res.json({
      success: true,
      data: {
        totalPatients,
        newPatientsToday,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingBills
      }
    });
  });

  // Recent appointments
  getRecentAppointments = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    const appointments = await Appointment.find()
      .populate('patientId', 'personalInfo.firstName personalInfo.lastName')
      .populate('doctorId', 'personalInfo.firstName personalInfo.lastName professionalInfo.specialty')
      .limit(limit)
      .sort({ appointmentDate: -1 })
      .lean();

    // Format data for frontend
    const formattedAppointments = appointments.map(apt => ({
      _id: apt._id,
      patientName: apt.patientId 
        ? `${apt.patientId.personalInfo?.lastName || ''} ${apt.patientId.personalInfo?.firstName || ''}`.trim() 
        : 'N/A',
      doctorName: apt.doctorId 
        ? `${apt.doctorId.personalInfo?.lastName || ''} ${apt.doctorId.personalInfo?.firstName || ''}`.trim() 
        : 'N/A',
      department: apt.specialty || apt.doctorId?.professionalInfo?.specialty || 'N/A',
      datetime: apt.appointmentDate,
      status: apt.status
    }));

    res.json({
      success: true,
      data: formattedAppointments
    });
  });
}

module.exports = new DashboardController();
