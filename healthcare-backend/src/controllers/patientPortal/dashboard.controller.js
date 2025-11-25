const Patient = require("../../models/patient.model");
const Visit = require("../../models/visit.model");
const Appointment = require("../../models/appointment.model");
const Prescription = require("../../models/prescription.model");
const Billing = require("../../models/billing.model");
const Communication = require("../../models/communication.model");
const MedicalRecord = require("../../models/medicalRecord.model");
const Admission = require("../../models/admission.model");
const LabOrder = require("../../models/labOrder.model");
const AppError = require("../../utils/appError");
const { successResponse } = require("../../utils/responseHandler");

/**
 * Patient Dashboard Controller
 * Hiển thị tổng quan thông tin bệnh nhân
 */

class PatientDashboardController {
  /**
   * Lấy dashboard overview
   */
  static async getDashboardOverview(req, res, next) {
    try {
      const { patientId } = req.user;

      // Get appointments summary
      const upcomingAppointments = await Appointment.countDocuments({
        patientId,
        appointmentDate: { $gte: new Date() },
        status: "SCHEDULED",
      });

      const pastAppointments = await Appointment.countDocuments({
        patientId,
        appointmentDate: { $lt: new Date() },
        status: "COMPLETED",
      });

      // Get recent visits
      const recentVisits = await Visit.find({
        patientId,
      })
        .sort({ visitDate: -1 })
        .limit(5)
        .select("visitDate diagnosis doctorId");

      // Get active prescriptions
      const activePrescriptions = await Prescription.countDocuments({
        patientId,
        status: "ACTIVE",
      });

      // Get pending prescriptions
      const pendingPrescriptions = await Prescription.countDocuments({
        patientId,
        status: "PENDING",
      });

      // Get unread messages count
      const unreadMessages = await Communication.countDocuments({
        patientId,
        read: false,
        messageType: "CHAT",
      });

      // Get pending billing
      const pendingBillings = await Billing.countDocuments({
        patientId,
        paymentStatus: { $in: ["UNPAID", "PARTIALLY_PAID"] },
      });

      // Get pending lab results
      const pendingLabResults = await LabOrder.countDocuments({
        patientId,
        status: "PENDING",
      });

      // Get current admission status
      const currentAdmission = await Admission.findOne({
        patientId,
        status: "ACTIVE",
      }).select("admissionDate ward department");

      const overview = {
        appointments: {
          upcoming: upcomingAppointments,
          past: pastAppointments,
        },
        visits: {
          recentCount: recentVisits.length,
          recent: recentVisits,
        },
        prescriptions: {
          active: activePrescriptions,
          pending: pendingPrescriptions,
        },
        messages: {
          unread: unreadMessages,
        },
        billing: {
          pending: pendingBillings,
        },
        labResults: {
          pending: pendingLabResults,
        },
        admission: currentAdmission
          ? {
              status: "ACTIVE",
              admissionDate: currentAdmission.admissionDate,
              ward: currentAdmission.ward,
              department: currentAdmission.department,
            }
          : {
              status: "NONE",
            },
      };

      successResponse(
        res,
        overview,
        "Dashboard overview retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thống kê sức khỏe
   */
  static async getHealthStats(req, res, next) {
    try {
      const { patientId } = req.user;
      const { days = 30 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get vital signs from recent visits
      const visits = await Visit.find({
        patientId,
        visitDate: { $gte: startDate },
      }).select("vitalSigns visitDate");

      // Calculate average vitals
      const vitalStats = {
        bloodPressure: [],
        heartRate: [],
        temperature: [],
        respiratoryRate: [],
        oxygenSaturation: [],
        bmi: [],
      };

      visits.forEach((visit) => {
        if (visit.vitalSigns) {
          if (visit.vitalSigns.bloodPressure) {
            vitalStats.bloodPressure.push(visit.vitalSigns.bloodPressure);
          }
          if (visit.vitalSigns.heartRate) {
            vitalStats.heartRate.push(visit.vitalSigns.heartRate);
          }
          if (visit.vitalSigns.temperature) {
            vitalStats.temperature.push(visit.vitalSigns.temperature);
          }
          if (visit.vitalSigns.respiratoryRate) {
            vitalStats.respiratoryRate.push(visit.vitalSigns.respiratoryRate);
          }
          if (visit.vitalSigns.oxygenSaturation) {
            vitalStats.oxygenSaturation.push(visit.vitalSigns.oxygenSaturation);
          }
          if (visit.vitalSigns.bmi) {
            vitalStats.bmi.push(visit.vitalSigns.bmi);
          }
        }
      });

      // Calculate averages
      const calculateAverage = (arr) => {
        if (arr.length === 0) return null;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
      };

      const healthStats = {
        period: `Last ${days} days`,
        visitCount: visits.length,
        vitals: {
          bloodPressure: calculateAverage(vitalStats.bloodPressure),
          heartRate: calculateAverage(vitalStats.heartRate),
          temperature: calculateAverage(vitalStats.temperature),
          respiratoryRate: calculateAverage(vitalStats.respiratoryRate),
          oxygenSaturation: calculateAverage(vitalStats.oxygenSaturation),
          bmi: calculateAverage(vitalStats.bmi),
        },
        trend: {
          improving: true,
          lastUpdated: new Date(),
        },
      };

      successResponse(
        res,
        healthStats,
        "Health statistics retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy upcoming appointments
   */
  static async getUpcomingAppointments(req, res, next) {
    try {
      const { patientId } = req.user;
      const { limit = 5 } = req.query;

      const appointments = await Appointment.find({
        patientId,
        appointmentDate: { $gte: new Date() },
        status: "SCHEDULED",
      })
        .sort({ appointmentDate: 1 })
        .limit(parseInt(limit))
        .populate("doctorId", "name specialization email")
        .select("appointmentDate doctorId reason department reason type");

      successResponse(
        res,
        appointments,
        "Upcoming appointments retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy recent medical records
   */
  static async getRecentMedicalRecords(req, res, next) {
    try {
      const { patientId } = req.user;
      const { limit = 10 } = req.query;

      const records = await MedicalRecord.find({ patientId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select("recordType title date description");

      successResponse(
        res,
        records,
        "Recent medical records retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy current health alerts
   */
  static async getHealthAlerts(req, res, next) {
    try {
      const { patientId } = req.user;

      const alerts = [];

      // Check for pending appointments
      const pendingAppointments = await Appointment.countDocuments({
        patientId,
        appointmentDate: { $gte: new Date() },
        status: "SCHEDULED",
      });

      if (pendingAppointments > 0) {
        alerts.push({
          id: "appointment-pending",
          type: "APPOINTMENT",
          severity: "INFO",
          title: `You have ${pendingAppointments} upcoming appointment(s)`,
          message: "Please ensure you arrive on time",
          actionUrl: "/appointments",
        });
      }

      // Check for pending prescriptions
      const pendingPrescriptions = await Prescription.countDocuments({
        patientId,
        status: "PENDING",
      });

      if (pendingPrescriptions > 0) {
        alerts.push({
          id: "prescription-pending",
          type: "PRESCRIPTION",
          severity: "WARNING",
          title: `You have ${pendingPrescriptions} pending prescription(s)`,
          message: "Please refill your medications",
          actionUrl: "/prescriptions",
        });
      }

      // Check for pending bills
      const pendingBills = await Billing.countDocuments({
        patientId,
        paymentStatus: { $in: ["UNPAID", "PARTIALLY_PAID"] },
      });

      if (pendingBills > 0) {
        alerts.push({
          id: "billing-pending",
          type: "BILLING",
          severity: "WARNING",
          title: `You have ${pendingBills} pending bill(s)`,
          message: "Please complete payment",
          actionUrl: "/billing",
        });
      }

      // Check for lab results
      const completedLabOrders = await LabOrder.countDocuments({
        patientId,
        status: "COMPLETED",
        resultReviewed: false,
      });

      if (completedLabOrders > 0) {
        alerts.push({
          id: "lab-results-ready",
          type: "LAB_RESULT",
          severity: "INFO",
          title: `You have ${completedLabOrders} new lab result(s) ready`,
          message: "Please review your results",
          actionUrl: "/lab-results",
        });
      }

      // Check for unread messages
      const unreadMessages = await Communication.countDocuments({
        patientId,
        read: false,
        messageType: "CHAT",
      });

      if (unreadMessages > 0) {
        alerts.push({
          id: "unread-messages",
          type: "MESSAGE",
          severity: "INFO",
          title: `You have ${unreadMessages} unread message(s)`,
          message: "Check your messages",
          actionUrl: "/messages",
        });
      }

      successResponse(res, alerts, "Health alerts retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy medication reminders
   */
  static async getMedicationReminders(req, res, next) {
    try {
      const { patientId } = req.user;

      const prescriptions = await Prescription.find({
        patientId,
        status: "ACTIVE",
      }).select("medicationName dosage frequency startDate endDate");

      const reminders = prescriptions.map((prescription) => ({
        medicationName: prescription.medicationName,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        nextDueTime: new Date(),
        status: "PENDING",
        instructions: `Take ${prescription.dosage} ${prescription.frequency}`,
      }));

      successResponse(
        res,
        reminders,
        "Medication reminders retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy activity history (timeline)
   */
  static async getActivityHistory(req, res, next) {
    try {
      const { patientId } = req.user;
      const { limit = 20, page = 1 } = req.query;

      const skip = (page - 1) * limit;

      // Aggregate data from multiple sources
      const activities = [];

      // Recent visits
      const visits = await Visit.find({ patientId })
        .sort({ visitDate: -1 })
        .limit(10)
        .select("visitDate diagnosis doctorId")
        .lean();

      visits.forEach((visit) => {
        activities.push({
          id: `visit-${visit._id}`,
          type: "VISIT",
          title: "Medical Visit",
          description: `Visited for ${visit.diagnosis || "consultation"}`,
          date: visit.visitDate,
          icon: "stethoscope",
        });
      });

      // Recent prescriptions
      const prescriptions = await Prescription.find({ patientId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("medicationName createdAt status")
        .lean();

      prescriptions.forEach((prescription) => {
        activities.push({
          id: `prescription-${prescription._id}`,
          type: "PRESCRIPTION",
          title: "New Prescription",
          description: `Prescribed ${prescription.medicationName}`,
          date: prescription.createdAt,
          icon: "pill",
        });
      });

      // Recent lab orders
      const labOrders = await LabOrder.find({ patientId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("testName createdAt status")
        .lean();

      labOrders.forEach((labOrder) => {
        activities.push({
          id: `lab-${labOrder._id}`,
          type: "LAB_ORDER",
          title: "Lab Test Ordered",
          description: `Ordered test: ${labOrder.testName}`,
          date: labOrder.createdAt,
          icon: "flask",
        });
      });

      // Sort by date descending
      activities.sort((a, b) => b.date - a.date);

      // Paginate
      const paginatedActivities = activities.slice(skip, skip + limit);

      successResponse(
        res,
        paginatedActivities,
        "Activity history retrieved successfully",
        200,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          total: activities.length,
          pages: Math.ceil(activities.length / limit),
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy quick actions
   */
  static async getQuickActions(req, res, next) {
    try {
      const actions = [
        {
          id: "schedule-appointment",
          title: "Schedule Appointment",
          icon: "calendar-plus",
          description: "Book a new appointment with a doctor",
          url: "/appointments/new",
          color: "#4A90E2",
        },
        {
          id: "view-prescriptions",
          title: "View Prescriptions",
          icon: "pill-bottle",
          description: "Check your active prescriptions",
          url: "/prescriptions",
          color: "#16A34A",
        },
        {
          id: "lab-results",
          title: "Lab Results",
          icon: "flask",
          description: "View your lab test results",
          url: "/lab-results",
          color: "#00BCD4",
        },
        {
          id: "messaging",
          title: "Message Doctor",
          icon: "message-square",
          description: "Send a message to your healthcare provider",
          url: "/messages",
          color: "#FF6B6B",
        },
        {
          id: "view-billing",
          title: "Billing",
          icon: "credit-card",
          description: "Check your invoices and payments",
          url: "/billing",
          color: "#F77F00",
        },
        {
          id: "medical-records",
          title: "Medical Records",
          icon: "file-medical",
          description: "Access your complete medical history",
          url: "/medical-records",
          color: "#7C3AED",
        },
      ];

      successResponse(
        res,
        actions,
        "Quick actions retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PatientDashboardController;
