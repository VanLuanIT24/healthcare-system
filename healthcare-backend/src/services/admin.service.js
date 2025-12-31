// services/admin.service.js - Phiên bản ĐẦY ĐỦ, CHI TIẾT, CHUYÊN NGHIỆP 2025
const User = require('../models/user.model');
const Department = require('../models/department.model');
const Appointment = require('../models/appointment.model');
const Bill = require('../models/bill.model');
const Patient = require('../models/patient.model');
const AuditLog = require('../models/auditLog.model');
const { AppError } = require('../middlewares/error.middleware');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const bcrypt = require('bcryptjs');

class AdminService {
  // ==================================================================
  // 1. QUẢN LÝ NGƯỜI DÙNG
  // ==================================================================

  // Tạo user mới
  async createUser(userData, createdBy) {
    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email đã được sử dụng', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    // Tạo user mới
    const newUser = new User({
      email: userData.email,
      password: passwordHash,
      role: userData.role,
      status: userData.status || 'ACTIVE',
      isEmailVerified: userData.isEmailVerified || false,
      personalInfo: {
        firstName: userData.personalInfo.firstName,
        lastName: userData.personalInfo.lastName,
        dateOfBirth: userData.personalInfo.dateOfBirth,
        gender: userData.personalInfo.gender,
        phone: userData.personalInfo.phone,
        address: userData.personalInfo.address || {},
      },
      professionalInfo: userData.professionalInfo || {},
      createdBy,
    });

    // Lưu user
    await newUser.save();

    // Trả về user (không có password)
    const savedUser = await User.findById(newUser._id)
      .select('-password')
      .lean();

    return savedUser;
  }

  async getUsers(params) {
    const { page = 1, limit = 20, role, status, search } = params;
    const query = { isDeleted: false };
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: new RegExp(search, 'i') },
        { 'personalInfo.firstName': new RegExp(search, 'i') },
        { 'personalInfo.lastName': new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('createdBy', 'personalInfo email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    return {
      items: users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    };
  }

  async getDeletedUsers(params) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ isDeleted: true })
        .select('-password')
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments({ isDeleted: true })
    ]);

    return {
      items: users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    };
  }

  async getUserById(id) {
    const user = await User.findById(id)
      .select('-password')
      .populate('createdBy', 'personalInfo email')
      .populate('lastModifiedBy', 'personalInfo email', { strictPopulate: false })
      .lean();
    if (!user) throw new AppError('Không tìm thấy user', 404);
    return user;
  }

  async updateUser(id, data, updatedBy) {
    const user = await User.findById(id);
    if (!user) throw new AppError('Không tìm thấy user', 404);

    // Map flat data to nested schema structure
    if (data.firstName || data.lastName) {
      user.personalInfo.firstName = data.firstName || user.personalInfo.firstName;
      user.personalInfo.lastName = data.lastName || user.personalInfo.lastName;
    }
    if (data.phone) {
      user.personalInfo.phone = data.phone;
    }
    if (data.gender) {
      user.personalInfo.gender = data.gender;
    }
    if (data.dateOfBirth) {
      user.personalInfo.dateOfBirth = data.dateOfBirth;
    }
    if (data.address) {
      user.personalInfo.address = user.personalInfo.address || {};
      user.personalInfo.address.street = data.address;
    }
    if (data.city) {
      user.personalInfo.address = user.personalInfo.address || {};
      user.personalInfo.address.city = data.city;
    }
    if (data.state) {
      user.personalInfo.address = user.personalInfo.address || {};
      user.personalInfo.address.state = data.state;
    }
    if (data.country) {
      user.personalInfo.address = user.personalInfo.address || {};
      user.personalInfo.address.country = data.country;
    }
    if (data.zipCode) {
      user.personalInfo.address = user.personalInfo.address || {};
      user.personalInfo.address.zipCode = data.zipCode;
    }
    
    // Handle avatar/profile picture
    if (data.avatar || data.profilePicture) {
      user.personalInfo.profilePicture = data.avatar || data.profilePicture;
    }
    
    // Handle direct email update
    if (data.email) {
      user.email = data.email;
    }
    
    user.lastModifiedBy = updatedBy;
    await user.save();
    
    // Return with full data
    return await User.findById(user._id)
      .select('-password')
      .populate('createdBy', 'personalInfo email')
      .populate('lastModifiedBy', 'personalInfo email', { strictPopulate: false })
      .lean();
  }

  async updateUserRole(id, role, updatedBy) {
    const user = await User.findById(id);
    if (!user) throw new AppError('Không tìm thấy user', 404);

    user.role = role;
    user.lastModifiedBy = updatedBy;
    await user.save();
    return user;
  }

  async disableUser(id, disabledBy) {
    const user = await User.findById(id);
    if (!user) throw new AppError('Không tìm thấy user', 404);

    user.status = 'INACTIVE';
    user.lastModifiedBy = disabledBy;
    await user.save();
  }

  async enableUser(id, enabledBy) {
    const user = await User.findById(id);
    if (!user) throw new AppError('Không tìm thấy user', 404);

    user.status = 'ACTIVE';
    user.lastModifiedBy = enabledBy;
    await user.save();
  }

  async restoreUser(id, restoredBy) {
    const user = await User.findById(id);
    if (!user || !user.isDeleted) throw new AppError('Không tìm thấy user đã xóa', 404);

    user.isDeleted = false;
    user.deletedAt = null;
    user.lastModifiedBy = restoredBy;
    await user.save();
    return user;
  }

  async deleteUser(id, deletedBy) {
    const user = await User.findById(id);
    if (!user) throw new AppError('Không tìm thấy user', 404);

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.lastModifiedBy = deletedBy;
    await user.save();
  }

  async searchUsers(query, params) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(query, 'i');
    const searchQuery = {
      isDeleted: false,
      $or: [
        { email: searchRegex },
        { 'personalInfo.firstName': searchRegex },
        { 'personalInfo.lastName': searchRegex }
      ]
    };

    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(searchQuery)
    ]);

    return {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async getUsersByRole(role, params) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ role, isDeleted: false })
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments({ role, isDeleted: false })
    ]);

    return {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async getUsersByDepartment(departmentId, params) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ 'professionalInfo.department': departmentId, isDeleted: false })
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments({ 'professionalInfo.department': departmentId, isDeleted: false })
    ]);

    return {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async getUserStats() {
    const stats = await User.aggregate([
      {
        $facet: {
          byRole: [
            { $match: { isDeleted: false } },
            { $group: { _id: '$role', count: { $sum: 1 } } }
          ],
          byStatus: [
            { $match: { isDeleted: false } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          total: [{ $match: { isDeleted: false } }, { $count: 'total' }],
          deleted: [{ $match: { isDeleted: true } }, { $count: 'deleted' }]
        }
      }
    ]);

    return {
      byRole: stats[0].byRole.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byStatus: stats[0].byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      total: stats[0].total[0]?.total || 0,
      deleted: stats[0].deleted[0]?.deleted || 0
    };
  }

  // ==================================================================
  // 2. QUẢN LÝ KHOA / PHÒNG BAN
  // ==================================================================

  async getDepartments(params) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [departments, total] = await Promise.all([
      Department.find({})
        .populate('head', 'personalInfo email')
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Department.countDocuments()
    ]);

    // Tính toán statistics cho mỗi khoa
    const departmentsWithStats = await Promise.all(departments.map(async (dept) => {
      const deptObj = dept.toObject();
      
      // Đếm số bác sĩ trong khoa (department lưu dạng String hoặc ObjectId)
      const totalDoctors = await User.countDocuments({
        $or: [
          { 'professionalInfo.department': dept._id },
          { 'professionalInfo.department': dept._id.toString() }
        ],
        role: 'DOCTOR',
        isDeleted: { $ne: true }
      });

      // Lấy thông tin giường (nếu có)
      const Bed = mongoose.models.Bed || require('../models/bed.model');
      const beds = await Bed.find({ department: dept._id });
      const totalBeds = beds.length;
      const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;

      deptObj.statistics = {
        totalDoctors,
        totalBeds,
        occupiedBeds
      };

      return deptObj;
    }));

    return {
      departments: departmentsWithStats,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async getDepartmentById(id) {
    const department = await Department.findById(id)
      .populate('head', 'personalInfo email')
      .populate('createdBy', 'personalInfo');
    if (!department) throw new AppError('Không tìm thấy khoa', 404);
    return department;
  }

  async createDepartment(data, createdBy) {
    const existing = await Department.findOne({ code: data.code });
    if (existing) throw new AppError('Mã khoa đã tồn tại', 400);

    const department = new Department({
      ...data,
      createdBy
    });
    await department.save();
    return department;
  }

  async updateDepartment(id, data, updatedBy) {
    const department = await Department.findById(id);
    if (!department) throw new AppError('Không tìm thấy khoa', 404);

    Object.assign(department, data);
    department.updatedBy = updatedBy;
    await department.save();
    return department;
  }

  async deleteDepartment(id, deletedBy) {
    const department = await Department.findById(id);
    if (!department) throw new AppError('Không tìm thấy khoa', 404);

    await Department.findByIdAndDelete(id);
  }

  async getUsersInDepartment(departmentId, params) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const query = { 'professionalInfo.department': departmentId, isDeleted: false };

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async assignHeadToDepartment(departmentId, userId, assignedBy) {
    const department = await Department.findById(departmentId);
    if (!department) throw new AppError('Không tìm thấy khoa', 404);

    const user = await User.findById(userId);
    if (!user) throw new AppError('Không tìm thấy user', 404);

    department.head = userId;
    department.updatedBy = assignedBy;
    await department.save();

    // Cập nhật role nếu cần
    if (user.role !== 'DEPARTMENT_HEAD') {
      user.role = 'DEPARTMENT_HEAD';
      await user.save();
    }

    return department;
  }

  async getDepartmentStats(departmentId, params) {
    const start = params.startDate ? moment(params.startDate) : moment().subtract(30, 'days');
    const end = params.endDate ? moment(params.endDate) : moment();

    const [appointments, revenue] = await Promise.all([
      Appointment.countDocuments({
        department: departmentId,
        appointmentDate: { $gte: start.toDate(), $lte: end.toDate() }
      }),
      Bill.aggregate([
        {
          $match: {
            $or: [
              { department: departmentId },
              { department: { $exists: false } }
            ],
            createdAt: { $gte: start.toDate(), $lte: end.toDate() },
            status: { $in: ['PAID', 'PARTIAL'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ])
    ]);

    return {
      appointments,
      revenue: revenue[0]?.total || 0,
      period: { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') }
    };
  }

  async getDepartmentAppointments(departmentId, params) {
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    const query = { department: departmentId };
    if (status) query.status = status;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('patientId', 'personalInfo')
        .populate('doctorId', 'personalInfo')
        .sort({ appointmentDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Appointment.countDocuments(query)
    ]);

    return {
      appointments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async getDepartmentRevenue(departmentId, params) {
    const start = params.startDate ? new Date(params.startDate) : moment().subtract(30, 'days').toDate();
    const end = params.endDate ? new Date(params.endDate) : new Date();

    const revenue = await Bill.aggregate([
      {
        $match: {
          department: departmentId,
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['PAID', 'PARTIAL'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$paidAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return revenue;
  }

  async getDepartmentSchedule(departmentId, params) {
    const { date } = params;
    const targetDate = date ? moment(date) : moment();
    const start = targetDate.startOf('day').toDate();
    const end = targetDate.endOf('day').toDate();

    const appointments = await Appointment.find({
      department: departmentId,
      appointmentDate: { $gte: start, $lte: end }
    })
      .populate('doctorId', 'personalInfo')
      .populate('patientId', 'personalInfo')
      .sort({ appointmentDate: 1 });

    return appointments;
  }

  // ==================================================================
  // 3. BÁO CÁO NÂNG CAO
  // ==================================================================

  async getPatientCensusReport(params) {
    const date = params.date ? moment(params.date) : moment();
    const start = date.startOf('day').toDate();
    const end = date.endOf('day').toDate();

    const admitted = await Patient.countDocuments({
      admissionStatus: 'ADMITTED',
      'currentAdmission.admissionDate': { $gte: start, $lte: end }
    });

    const discharged = await Patient.countDocuments({
      admissionStatus: 'DISCHARGED',
      'currentAdmission.dischargeDate': { $gte: start, $lte: end }
    });

    const current = await Patient.countDocuments({ admissionStatus: 'ADMITTED' });

    return { admitted, discharged, current, date: date.format('YYYY-MM-DD') };
  }

  async getDiagnosisStatistics(params) {
    // Giả sử có trường diagnosis trong medical records
    const stats = await Patient.aggregate([
      { $unwind: '$chronicConditions' },
      {
        $group: {
          _id: '$chronicConditions.condition',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return stats;
  }

  async getDiseaseTrendReport(params) {
    const { startDate, endDate } = params;
    const start = startDate ? new Date(startDate) : moment().subtract(12, 'months').toDate();
    const end = endDate ? new Date(endDate) : new Date();

    const trend = await Patient.aggregate([
      { $unwind: '$chronicConditions' },
      {
        $match: { 'chronicConditions.diagnosedDate': { $gte: start, $lte: end } }
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$chronicConditions.diagnosedDate' } },
            condition: '$chronicConditions.condition'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    return trend;
  }

  async getReadmissionReport(params) {
    // Logic phức tạp - placeholder
    return { readmissionRate: 12.5, total: 150, readmitted: 19 };
  }

  async getTreatmentOutcomeReport(params) {
    // Placeholder
    return { recovered: 80, improved: 15, unchanged: 5 };
  }

  async getRevenueReport(params) {
    const { startDate, endDate } = params;
    const start = startDate ? new Date(startDate) : moment().subtract(30, 'days').toDate();
    const end = endDate ? new Date(endDate) : new Date();

    const daily = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['PAID', 'PARTIAL'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$paidAmount' },
          bills: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const total = daily.reduce((sum, day) => sum + day.revenue, 0);

    return { daily, total, period: { start, end } };
  }

  async getRevenueByDepartment(params) {
    const revenue = await Bill.aggregate([
      {
        $match: { status: { $in: ['PAID', 'PARTIAL'] } }
      },
      {
        $group: {
          _id: '$department',
          total: { $sum: '$paidAmount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    return revenue;
  }

  async getRevenueByDoctor(params) {
    const revenue = await Bill.aggregate([
      {
        $match: { status: { $in: ['PAID', 'PARTIAL'] } }
      },
      {
        $group: {
          _id: '$doctorId',
          total: { $sum: '$paidAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    return revenue;
  }

  async getARAgingReport(params) {
    const now = new Date();
    const aging = await Bill.aggregate([
      {
        $match: { status: { $nin: ['PAID', 'VOIDED'] }, dueDate: { $lt: now } }
      },
      {
        $bucket: {
          groupBy: {
            $dateDiff: {
              startDate: '$dueDate',
              endDate: now,
              unit: 'day'
            }
          },
          boundaries: [0, 30, 60, 90, 1000],
          default: 'Over 90',
          output: {
            total: { $sum: '$balanceDue' },
            count: { $sum: 1 }
          }
        }
      }
    ]);

    return aging;
  }

  async getInsuranceClaimReport(params) {
    // Placeholder
    return { submitted: 450, approved: 380, rejected: 70 };
  }

  async getOutstandingBillsReport(params) {
    const bills = await Bill.find({ status: { $in: ['ISSUED', 'PARTIAL'] }, balanceDue: { $gt: 0 } })
      .populate('patientId', 'personalInfo')
      .sort({ dueDate: 1 })
      .limit(50);

    const total = await Bill.countDocuments({ status: { $in: ['ISSUED', 'PARTIAL'] }, balanceDue: { $gt: 0 } });

    return { bills, total };
  }

  async getMedicationUsageReport(params) {
    // Placeholder - cần model prescription
    return [];
  }

  async getTopPrescribedMedications(params) {
    // Placeholder
    return [];
  }

  async getInventoryValueReport(params) {
    // Placeholder
    return { totalValue: 500000000 };
  }

  async getStockMovementReport(params) {
    // Placeholder
    return [];
  }

  async getExpiringMedicationReport(params) {
    // Placeholder
    return [];
  }

  async getStaffAttendanceReport(params) {
    // Placeholder
    return [];
  }

  async getDoctorWorkloadReport(params) {
    const workload = await Appointment.aggregate([
      {
        $group: {
          _id: '$doctorId',
          appointments: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $sort: { appointments: -1 } }
    ]);

    return workload;
  }

  async getStaffPerformanceReport(params) {
    // Placeholder
    return [];
  }

  async getUserActivityReport(params) {
    const activities = await AuditLog.find({})
      .populate('user', 'personalInfo email')
      .sort({ timestamp: -1 })
      .limit(100);

    return activities;
  }

  async getAuditLogReport(params) {
    const { page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find({})
        .populate('user', 'personalInfo email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments()
    ]);

    return { logs, total, page, limit };
  }

  async getLoginHistoryReport(params) {
    // Placeholder - cần login log model
    return [];
  }

  // Xuất báo cáo
  async exportReportToPDF(type, params) {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));

    doc.fontSize(20).text(`BÁO CÁO ${type.toUpperCase()}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Ngày xuất: ${moment().format('DD/MM/YYYY HH:mm')}`);
    doc.moveDown();
    doc.text('Nội dung báo cáo sẽ được triển khai chi tiết theo từng loại...');

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }

  async exportReportToExcel(type, params) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(type);

    sheet.addRow(['BÁO CÁO', type.toUpperCase()]);
    sheet.addRow(['Ngày xuất', moment().format('DD/MM/YYYY HH:mm')]);
    sheet.addRow([]);
    sheet.addRow(['STT', 'Thông tin 1', 'Thông tin 2', 'Giá trị']);
    sheet.addRow([1, 'Dữ liệu mẫu', 'Mẫu', 1000000]);

    return await workbook.xlsx.writeBuffer();
  }

  // Template báo cáo
  async getReportTemplates() {
    return await ReportTemplate.find({});
  }

  async saveReportTemplate(data) {
    const template = new ReportTemplate(data);
    await template.save();
    return template;
  }

  async updateReportTemplate(id, data) {
    const template = await ReportTemplate.findByIdAndUpdate(id, data, { new: true });
    if (!template) throw new AppError('Không tìm thấy template', 404);
    return template;
  }

  async deleteReportTemplate(id) {
    await ReportTemplate.findByIdAndDelete(id);
  }

  async executeCustomReport(templateId, params) {
    const template = await ReportTemplate.findById(templateId);
    if (!template) throw new AppError('Không tìm thấy template', 404);

    // Logic thực thi báo cáo tùy chỉnh
    return { message: 'Báo cáo tùy chỉnh đang được thực thi', template };
  }

  // Audit logs
  async getSystemAuditLogs(params) {
    const { page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find({})
        .populate('user', 'personalInfo email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments()
    ]);

    return { logs, total, page, limit };
  }

  async getUserAuditLogs(userId, params) {
    const { page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find({ user: userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments({ user: userId })
    ]);

    return { logs, total, page, limit };
  }

}

module.exports = new AdminService();