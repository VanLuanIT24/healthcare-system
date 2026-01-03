// src/routes/public.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Appointment = require('../models/appointment.model');
const { ROLES } = require('../constants/roles');

/**
 * 🌐 PUBLIC ROUTES - Không cần authentication
 * Các endpoint này dùng cho landing pages
 */

/**
 * @swagger
 * /api/public/stats:
 *   get:
 *     summary: Lấy thống kê tổng quan cho trang chủ
 *     description: Trả về số liệu thống kê công khai (bệnh nhân, bác sĩ, lượt khám, độ hài lòng)
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Thống kê thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     patients:
 *                       type: integer
 *                       description: Tổng số bệnh nhân
 *                       example: 1500
 *                     doctors:
 *                       type: integer
 *                       description: Tổng số bác sĩ
 *                       example: 45
 *                     appointments:
 *                       type: integer
 *                       description: Số lượt khám hoàn thành
 *                       example: 5000
 *                     satisfaction:
 *                       type: integer
 *                       description: Tỷ lệ hài lòng (%)
 *                       example: 98
 *       500:
 *         description: Lỗi server
 */
// 🎯 HOMEPAGE STATS - GET /api/public/stats
router.get('/stats', async (req, res) => {
  try {
    // Đếm bệnh nhân
    const patientCount = await User.countDocuments({ 
      role: ROLES.PATIENT, 
      isDeleted: false,
      status: 'ACTIVE'
    });

    // Đếm bác sĩ
    const doctorCount = await User.countDocuments({ 
      role: ROLES.DOCTOR, 
      isDeleted: false,
      status: 'ACTIVE'
    });

    // Đếm lượt khám thành công
    const completedAppointments = await Appointment.countDocuments({ 
      status: 'COMPLETED' 
    });

    // Tính satisfaction rate (giả sử dựa trên completed appointments)
    const totalAppointments = await Appointment.countDocuments();
    const satisfactionRate = totalAppointments > 0 
      ? Math.round((completedAppointments / totalAppointments) * 100) 
      : 98; // Default 98%

    res.json({
      success: true,
      data: {
        patients: patientCount,
        doctors: doctorCount,
        appointments: completedAppointments,
        satisfaction: satisfactionRate
      }
    });
  } catch (error) {
    console.error('❌ Error fetching public stats:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể lấy thống kê',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/public/featured-doctors:
 *   get:
 *     summary: Lấy danh sách bác sĩ nổi bật
 *     description: Trả về danh sách bác sĩ để hiển thị trên trang chủ
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *         description: Số lượng bác sĩ cần lấy
 *     responses:
 *       200:
 *         description: Danh sách bác sĩ nổi bật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       name:
 *                         type: string
 *                         example: "BS. Nguyễn Văn A"
 *                       email:
 *                         type: string
 *                         example: "doctor@example.com"
 *                       specialty:
 *                         type: string
 *                         example: "Nội khoa"
 *                       degree:
 *                         type: string
 *                         example: "Tiến sĩ Y khoa"
 *                       experience:
 *                         type: string
 *                         example: "10 năm kinh nghiệm"
 *                       department:
 *                         type: string
 *                         example: "Khoa Nội"
 *                       image:
 *                         type: string
 *                         nullable: true
 *       500:
 *         description: Lỗi server
 */
// 🎯 FEATURED DOCTORS - GET /api/public/featured-doctors
router.get('/featured-doctors', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;

    const doctors = await User.find({
      role: ROLES.DOCTOR,
      isDeleted: false,
      status: 'ACTIVE'
    })
    .select('personalInfo professionalInfo email createdAt')
    .limit(limit)
    .sort({ createdAt: -1 });

    const featuredDoctors = doctors.map(doctor => ({
      id: doctor._id,
      name: doctor.fullName,
      email: doctor.email,
      specialty: doctor.professionalInfo?.specialization || 'Bác sĩ đa khoa',
      degree: doctor.professionalInfo?.qualifications?.[0] || 'Bác sĩ Y khoa',
      experience: doctor.professionalInfo?.yearsOfExperience 
        ? `${doctor.professionalInfo.yearsOfExperience} năm kinh nghiệm` 
        : 'Nhiều năm kinh nghiệm',
      department: doctor.professionalInfo?.department || 'Khoa Tổng hợp',
      image: doctor.personalInfo?.profilePicture || null,
      licenseNumber: doctor.professionalInfo?.licenseNumber
    }));

    res.json({
      success: true,
      data: featuredDoctors
    });
  } catch (error) {
    console.error('❌ Error fetching featured doctors:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể lấy danh sách bác sĩ',
      message: error.message
    });
  }
});

// 🎯 ALL DOCTORS (với filter) - GET /api/public/doctors
router.get('/doctors', async (req, res) => {
  try {
    const { 
      specialty, 
      department, 
      search,
      experienceMin,
      experienceMax,
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {
      role: ROLES.DOCTOR,
      isDeleted: false,
      status: 'ACTIVE'
    };

    // Filter by specialty
    if (specialty && specialty !== 'all') {
      query['professionalInfo.specialization'] = new RegExp(specialty, 'i');
    }

    // Filter by department
    if (department) {
      query['professionalInfo.department'] = new RegExp(department, 'i');
    }

    // Filter by experience (years)
    if (experienceMin || experienceMax) {
      query['professionalInfo.yearsOfExperience'] = {};
      if (experienceMin) {
        query['professionalInfo.yearsOfExperience'].$gte = parseInt(experienceMin);
      }
      if (experienceMax) {
        query['professionalInfo.yearsOfExperience'].$lte = parseInt(experienceMax);
      }
    }

    // Search by name
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': new RegExp(search, 'i') },
        { 'personalInfo.lastName': new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);

    const doctors = await User.find(query)
      .select('personalInfo professionalInfo email')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ 'professionalInfo.yearsOfExperience': -1, createdAt: -1 });

    const doctorsList = doctors.map(doctor => ({
      _id: doctor._id,
      id: doctor._id,
      name: doctor.fullName,
      email: doctor.email,
      personalInfo: doctor.personalInfo,
      professionalInfo: doctor.professionalInfo,
      specialty: doctor.professionalInfo?.specialization || 'Bác sĩ đa khoa',
      degree: doctor.professionalInfo?.qualifications?.[0] || 'Bác sĩ Y khoa',
      experience: doctor.professionalInfo?.yearsOfExperience || 0,
      departmentId: doctor.professionalInfo?.department,
      department: doctor.professionalInfo?.department || 'Khoa Tổng hợp',
      image: doctor.personalInfo?.profilePicture || null,
      phone: doctor.personalInfo?.phone
    }));

    res.json({
      success: true,
      data: {
        doctors: doctorsList,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể lấy danh sách bác sĩ',
      message: error.message
    });
  }
});

// 🎯 SPECIALTIES LIST - GET /api/public/specialties
router.get('/specialties', async (req, res) => {
  try {
    console.log('🔍 [API] GET /api/public/specialties called');
    
    let specialties = await User.distinct('professionalInfo.specialization', {
      role: ROLES.DOCTOR,
      isDeleted: false,
      status: 'ACTIVE',
      'professionalInfo.specialization': { $exists: true, $ne: null, $ne: '' }
    });

    console.log('📊 Specialties from DB:', specialties);

    // Fallback: provide default specialties if none found
    const fallbackSpecialties = [
      'Bác sĩ đa khoa',
      'Tim mạch',
      'Ngoại khoa',
      'Nhi khoa',
      'Sản phụ khoa',
      'Tâm thần',
      'Nha khoa',
      'Y học thể dục'
    ];

    if (!specialties || specialties.length === 0) {
      console.warn('⚠️ No specialties found from doctors, using fallback list');
      specialties = fallbackSpecialties;
    }

    const filtered = specialties.filter(s => s);
    console.log('✅ Specialties will return:', filtered);

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('❌ Error fetching specialties:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể lấy danh sách chuyên khoa',
      message: error.message
    });
  }
});

// 🎯 DEPARTMENTS LIST - GET /api/public/departments
router.get('/departments', async (req, res) => {
  try {
    console.log('🔍 [API] GET /api/public/departments called');
    
    // Get departments from Department model instead of doctor's professionalInfo
    const Department = require('../models/department.model');
    
    const departments = await Department.find({
      status: 'ACTIVE',
      isDeleted: { $ne: true }
    })
    .select('_id name code description')
    .sort({ name: 1 });

    console.log('📊 Departments from DB:', departments.length);

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('❌ Error fetching departments:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể lấy danh sách khoa',
      message: error.message
    });
  }
});

// 🎯 DOCTOR DETAIL - GET /api/public/doctors/:doctorId
router.get('/doctors/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await User.findOne({
      _id: doctorId,
      role: ROLES.DOCTOR,
      isDeleted: false,
      status: 'ACTIVE'
    }).select('personalInfo professionalInfo email createdAt');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy bác sĩ'
      });
    }

    // Get appointment count for this doctor
    const appointmentCount = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: 'COMPLETED'
    });

    const doctorDetail = {
      id: doctor._id,
      name: doctor.fullName,
      email: doctor.email,
      phone: doctor.personalInfo?.phone,
      specialty: doctor.professionalInfo?.specialization || 'Bác sĩ đa khoa',
      degree: doctor.professionalInfo?.qualifications?.[0] || 'Bác sĩ Y khoa',
      qualifications: doctor.professionalInfo?.qualifications || [],
      experience: doctor.professionalInfo?.yearsOfExperience || 0,
      department: doctor.professionalInfo?.department || 'Khoa Tổng hợp',
      licenseNumber: doctor.professionalInfo?.licenseNumber,
      image: doctor.personalInfo?.profilePicture || null,
      joinedDate: doctor.createdAt,
      completedAppointments: appointmentCount
    };

    res.json({
      success: true,
      data: doctorDetail
    });
  } catch (error) {
    console.error('❌ Error fetching doctor detail:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể lấy thông tin bác sĩ',
      message: error.message
    });
  }
});

module.exports = router;
