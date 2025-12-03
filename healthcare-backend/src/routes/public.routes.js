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
      id: doctor._id,
      name: doctor.fullName,
      email: doctor.email,
      specialty: doctor.professionalInfo?.specialization || 'Bác sĩ đa khoa',
      degree: doctor.professionalInfo?.qualifications?.[0] || 'Bác sĩ Y khoa',
      experience: doctor.professionalInfo?.yearsOfExperience || 0,
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
    const specialties = await User.distinct('professionalInfo.specialization', {
      role: ROLES.DOCTOR,
      isDeleted: false,
      status: 'ACTIVE',
      'professionalInfo.specialization': { $exists: true, $ne: null, $ne: '' }
    });

    res.json({
      success: true,
      data: specialties.filter(s => s) // Remove empty values
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
    const departments = await User.distinct('professionalInfo.department', {
      role: ROLES.DOCTOR,
      isDeleted: false,
      status: 'ACTIVE',
      'professionalInfo.department': { $exists: true, $ne: null, $ne: '' }
    });

    res.json({
      success: true,
      data: departments.filter(d => d) // Remove empty values
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
