const moment = require('moment');
const Appointment = require('../models/appointment.model');
const Bill = require('../models/bill.model');
const Prescription = require('../models/prescription.model');
const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const AuditLog = require('../models/auditLog.model');

class ReportController {
  // Clinical Reports
  static async getClinicalReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? moment(startDate).startOf('day').toDate() : moment().subtract(30, 'days').startOf('day').toDate();
      const end = endDate ? moment(endDate).endOf('day').toDate() : moment().endOf('day').toDate();

      // Get appointment statistics
      const appointments = await Appointment.find({
        appointmentDate: { $gte: start, $lte: end }
      }).populate('doctorId patientId');

      const appointmentStats = {
        total: appointments.length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length,
        cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
        pending: appointments.filter(a => a.status === 'SCHEDULED').length
      };

      // Get patient statistics
      const newPatients = await Patient.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });

      // Get top doctors by appointment count
      const doctorStats = {};
      appointments.forEach(apt => {
        if (apt.doctorId) {
          const doctorId = apt.doctorId._id.toString();
          if (!doctorStats[doctorId]) {
            doctorStats[doctorId] = {
              doctor: apt.doctorId,
              count: 0,
              completed: 0
            };
          }
          doctorStats[doctorId].count++;
          if (apt.status === 'COMPLETED') {
            doctorStats[doctorId].completed++;
          }
        }
      });

      const topDoctors = Object.values(doctorStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      res.json({
        success: true,
        data: {
          dateRange: { start, end },
          appointmentStats,
          newPatients,
          topDoctors,
          totalPatients: await Patient.countDocuments()
        }
      });
    } catch (error) {
      console.error('Get clinical report error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo báo cáo lâm sàng'
      });
    }
  }

  // Financial Reports
  static async getFinancialReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? moment(startDate).startOf('day').toDate() : moment().subtract(30, 'days').startOf('day').toDate();
      const end = endDate ? moment(endDate).endOf('day').toDate() : moment().endOf('day').toDate();

      // Get bill statistics
      const bills = await Bill.find({
        createdAt: { $gte: start, $lte: end }
      }).populate('patientId');

      const totalRevenue = bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
      const paidAmount = bills
        .filter(b => b.paymentStatus === 'PAID')
        .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
      const unpaidAmount = bills
        .filter(b => b.paymentStatus === 'UNPAID')
        .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

      // Revenue by day
      const revenueByDay = {};
      bills.forEach(bill => {
        const day = moment(bill.createdAt).format('YYYY-MM-DD');
        if (!revenueByDay[day]) {
          revenueByDay[day] = 0;
        }
        revenueByDay[day] += bill.totalAmount || 0;
      });

      const revenueChart = Object.entries(revenueByDay)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Revenue by payment method
      const paymentMethods = {};
      bills.forEach(bill => {
        const method = bill.paymentMethod || 'CASH';
        if (!paymentMethods[method]) {
          paymentMethods[method] = 0;
        }
        paymentMethods[method] += bill.totalAmount || 0;
      });

      res.json({
        success: true,
        data: {
          dateRange: { start, end },
          summary: {
            totalBills: bills.length,
            totalRevenue,
            paidAmount,
            unpaidAmount,
            averageBillAmount: bills.length > 0 ? totalRevenue / bills.length : 0
          },
          revenueChart,
          paymentMethods
        }
      });
    } catch (error) {
      console.error('Get financial report error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo báo cáo tài chính'
      });
    }
  }

  // Pharmacy Reports
  static async getPharmacyReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? moment(startDate).startOf('day').toDate() : moment().subtract(30, 'days').startOf('day').toDate();
      const end = endDate ? moment(endDate).endOf('day').toDate() : moment().endOf('day').toDate();

      // Get prescription statistics
      const prescriptions = await Prescription.find({
        createdAt: { $gte: start, $lte: end }
      }).populate('patientId doctorId');

      const totalPrescriptions = prescriptions.length;
      const dispensedPrescriptions = prescriptions.filter(p => p.status === 'DISPENSED').length;
      const pendingPrescriptions = prescriptions.filter(p => p.status === 'PENDING').length;

      // Medication usage statistics
      const medicationStats = {};
      prescriptions.forEach(prescription => {
        if (prescription.medications && Array.isArray(prescription.medications)) {
          prescription.medications.forEach(med => {
            const medName = med.medicationName || med.name;
            if (medName) {
              if (!medicationStats[medName]) {
                medicationStats[medName] = {
                  name: medName,
                  count: 0,
                  totalQuantity: 0
                };
              }
              medicationStats[medName].count++;
              medicationStats[medName].totalQuantity += parseInt(med.quantity) || 0;
            }
          });
        }
      });

      const topMedications = Object.values(medicationStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      res.json({
        success: true,
        data: {
          dateRange: { start, end },
          summary: {
            totalPrescriptions,
            dispensedPrescriptions,
            pendingPrescriptions
          },
          topMedications
        }
      });
    } catch (error) {
      console.error('Get pharmacy report error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo báo cáo dược'
      });
    }
  }

  // HR Reports
  static async getHRReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? moment(startDate).startOf('day').toDate() : moment().subtract(30, 'days').startOf('day').toDate();
      const end = endDate ? moment(endDate).endOf('day').toDate() : moment().endOf('day').toDate();

      // Get staff statistics
      const totalStaff = await User.countDocuments({ isActive: true });
      const doctors = await User.countDocuments({ role: 'DOCTOR', isActive: true });
      const nurses = await User.countDocuments({ role: 'NURSE', isActive: true });
      const admins = await User.countDocuments({ role: 'ADMIN', isActive: true });

      // Get activity logs for staff
      const activityLogs = await AuditLog.find({
        createdAt: { $gte: start, $lte: end }
      }).populate('userId');

      // Staff activity statistics
      const staffActivity = {};
      activityLogs.forEach(log => {
        if (log.userId) {
          const userId = log.userId._id.toString();
          if (!staffActivity[userId]) {
            staffActivity[userId] = {
              user: log.userId,
              activities: 0
            };
          }
          staffActivity[userId].activities++;
        }
      });

      const mostActiveStaff = Object.values(staffActivity)
        .sort((a, b) => b.activities - a.activities)
        .slice(0, 10);

      // New staff hired
      const newStaff = await User.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });

      res.json({
        success: true,
        data: {
          dateRange: { start, end },
          summary: {
            totalStaff,
            doctors,
            nurses,
            admins,
            newStaff
          },
          mostActiveStaff,
          totalActivities: activityLogs.length
        }
      });
    } catch (error) {
      console.error('Get HR report error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo báo cáo nhân sự'
      });
    }
  }
}

module.exports = ReportController;
