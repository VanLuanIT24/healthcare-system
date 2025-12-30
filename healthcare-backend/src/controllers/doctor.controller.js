// src/controllers/doctor.controller.js
const User = require('../models/user.model');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');
const { ROLES } = require('../constants/roles');

class DoctorController {
  /**
   * Get all doctors with filters and pagination
   */
  async getDoctors(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        specialty_id,
        department_id,
        status,
        gender
      } = req.query;

      console.log('🎯 [DOCTOR CONTROLLER] Getting doctors list:', {
        page,
        limit,
        search,
        specialty_id,
        department_id,
        status,
        gender
      });

      // Build query
      const query = {
        role: ROLES.DOCTOR,
        isDeleted: false
      };

      // Filter by status (don't set default to ACTIVE, allow all if not specified)
      if (status && status !== 'all') {
        query.status = status;
      }

      // Search by name or email
      if (search) {
        query.$or = [
          { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Filter by department - CORRECT FIELD NAME
      if (department_id && department_id !== '') {
        query['professionalInfo.department'] = department_id;
      }

      // Filter by gender
      if (gender && gender !== '') {
        query['personalInfo.gender'] = gender;
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get total count
      const total = await User.countDocuments(query);

      // Get doctors
      const doctors = await User.find(query)
        .select('-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires -loginAttempts -lockUntil')
        .populate('professionalInfo.department', 'name code description')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      // Add additional data for frontend
      const doctorsWithData = doctors.map(doctor => ({
        _id: doctor._id,
        email: doctor.email,
        role: doctor.role,
        status: doctor.status || 'ACTIVE',
        personalInfo: doctor.personalInfo,
        professionalInfo: doctor.professionalInfo,
        specialties: doctor.specialties || [],
        certificates: doctor.certificates || [],
        // Extract department correctly
        department: doctor.professionalInfo?.department || null,
        // Add safe defaults
        yearsOfExperience: doctor.professionalInfo?.yearsOfExperience || 0,
        rating: 4.5
      }));

      res.json({
        success: true,
        data: doctorsWithData,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error in getDoctors:', error);
      next(error);
    }
  }

  /**
   * Get single doctor by ID
   */
  async getDoctorById(req, res, next) {
    try {
      const { doctorId } = req.params;

      console.log('🎯 [DOCTOR CONTROLLER] Getting doctor by ID:', doctorId);

      const doctor = await User.findById(doctorId)
        .select('-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires -loginAttempts -lockUntil')
        .populate('professionalInfo.department', 'name code')
        .lean();

      if (!doctor || doctor.role !== ROLES.DOCTOR) {
        throw new AppError('Không tìm thấy bác sĩ', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      // Add rating
      const doctorWithRating = {
        ...doctor,
        rating: 4.5
      };

      res.json({
        success: true,
        data: doctorWithRating
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new doctor
   */
  async createDoctor(req, res, next) {
    try {
      const doctorData = req.body;
      const createdBy = req.user;

      console.log('🎯 [DOCTOR CONTROLLER] Creating doctor:', doctorData.email);
      console.log('📝 Doctor data:', doctorData);

      // Ensure role is DOCTOR
      doctorData.role = ROLES.DOCTOR;

      // Build personalInfo from flat fields
      if (!doctorData.personalInfo) {
        doctorData.personalInfo = {};
      }
      if (doctorData.firstName) {
        doctorData.personalInfo.firstName = doctorData.firstName;
      }
      if (doctorData.lastName) {
        doctorData.personalInfo.lastName = doctorData.lastName;
      }
      if (doctorData.gender) {
        doctorData.personalInfo.gender = doctorData.gender;
      }
      if (doctorData.dateOfBirth) {
        doctorData.personalInfo.dateOfBirth = doctorData.dateOfBirth;
      }
      if (doctorData.phone) {
        doctorData.personalInfo.phone = doctorData.phone;
      }
      // Build address
      if (doctorData.address || doctorData.city || doctorData.zipCode) {
        doctorData.personalInfo.address = {
          street: doctorData.address,
          city: doctorData.city,
          zipCode: doctorData.zipCode
        };
      }

      // Generate default password if not provided
      if (!doctorData.password) {
        doctorData.password = 'Doctor@123';
      }

      // Prepare professional info
      if (!doctorData.professionalInfo) {
        doctorData.professionalInfo = {};
      }
      
      // Set department and specialization from form
      if (doctorData.departmentId) {
        doctorData.professionalInfo.department = doctorData.departmentId;
      }
      if (doctorData.specialtyId) {
        doctorData.professionalInfo.specialization = doctorData.specialtyId;
      }
      if (doctorData.yearsOfExperience) {
        doctorData.professionalInfo.yearsOfExperience = doctorData.yearsOfExperience;
      }

      // Handle specialties array - convert to proper format
      if (doctorData.specialties && Array.isArray(doctorData.specialties)) {
        doctorData.specialties = doctorData.specialties.map(s => {
          if (typeof s === 'string') {
            return { name: s };
          }
          return {
            _id: s._id || undefined,
            name: s.name || s
          };
        });
        console.log('📋 Formatted specialties:', doctorData.specialties);
      }

      // Handle certificates array
      if (doctorData.certificates && Array.isArray(doctorData.certificates)) {
        doctorData.certificates = doctorData.certificates.map(c => ({
          name: c.name,
          year: c.year,
          issuer: c.issuer,
          id: c.id || undefined
        }));
        console.log('📄 Formatted certificates:', doctorData.certificates);
      }

      // Create user (doctor)
      const doctor = await User.create({
        ...doctorData,
        createdBy: createdBy._id
      });

      console.log('✅ Doctor created successfully:', doctor._id);

      await auditLog(AUDIT_ACTIONS.USER_CREATE, {
        metadata: {
          createdUserId: doctor._id,
          role: doctor.role,
          email: doctor.email,
          createdBy: createdBy._id
        }
      })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Tạo bác sĩ thành công',
        data: doctor
      });
    } catch (error) {
      console.error('❌ Error creating doctor:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      if (error.errors) {
        console.error('❌ Validation errors:', JSON.stringify(error.errors, null, 2));
      }
      next(error);
    }
  }

  /**
   * Update doctor
   */
  async updateDoctor(req, res, next) {
    try {
      const { doctorId } = req.params;
      let updateData = req.body;
      const updater = req.user;

      console.log('🎯 [DOCTOR CONTROLLER] Updating doctor:', doctorId);
      console.log('📝 Update data received:', updateData);

      // Prevent changing role
      delete updateData.role;
      updateData.lastModifiedBy = updater._id;

      // Prepare update data with proper nesting
      let finalUpdateData = {};

      // Handle top-level fields
      const topLevelFields = ['email', 'phone', 'yearsOfExperience', 'bio', 'status', 'isActive'];
      topLevelFields.forEach(field => {
        if (updateData[field] !== undefined) {
          finalUpdateData[field] = updateData[field];
        }
      });

      // Handle personalInfo fields
      if (updateData.firstName || updateData.lastName || updateData.gender || updateData.dateOfBirth || updateData.address || updateData.city || updateData.zipCode) {
        finalUpdateData.personalInfo = updateData.personalInfo || {};
        if (updateData.firstName) finalUpdateData.personalInfo.firstName = updateData.firstName;
        if (updateData.lastName) finalUpdateData.personalInfo.lastName = updateData.lastName;
        if (updateData.gender) finalUpdateData.personalInfo.gender = updateData.gender;
        if (updateData.dateOfBirth) finalUpdateData.personalInfo.dateOfBirth = updateData.dateOfBirth;
        if (updateData.address) {
          finalUpdateData.personalInfo.address = finalUpdateData.personalInfo.address || {};
          finalUpdateData.personalInfo.address.street = updateData.address;
        }
        if (updateData.city) {
          finalUpdateData.personalInfo.address = finalUpdateData.personalInfo.address || {};
          finalUpdateData.personalInfo.address.city = updateData.city;
        }
        if (updateData.zipCode) {
          finalUpdateData.personalInfo.address = finalUpdateData.personalInfo.address || {};
          finalUpdateData.personalInfo.address.zipCode = updateData.zipCode;
        }
      }

      // Handle professionalInfo fields
      if (updateData.specialtyId || updateData.departmentId || updateData.yearsOfExperience) {
        finalUpdateData.professionalInfo = finalUpdateData.professionalInfo || {};
        if (updateData.specialtyId) {
          finalUpdateData.professionalInfo.specialization = updateData.specialtyId;
        }
        if (updateData.departmentId) {
          finalUpdateData.professionalInfo.department = updateData.departmentId;
        }
        if (updateData.yearsOfExperience) {
          finalUpdateData.professionalInfo.yearsOfExperience = updateData.yearsOfExperience;
        }
      }

      // Handle specialties array
      if (updateData.specialties && Array.isArray(updateData.specialties)) {
        console.log('📋 Updating specialties array:', updateData.specialties);
        finalUpdateData.specialties = updateData.specialties;
      }

      // Handle certificates array
      if (updateData.certificates && Array.isArray(updateData.certificates)) {
        console.log('📄 Updating certificates array:', updateData.certificates);
        finalUpdateData.certificates = updateData.certificates;
      }

      // Add last modified tracking
      finalUpdateData.lastModifiedBy = updater._id;
      finalUpdateData.lastModifiedAt = new Date();

      console.log('🔧 Final update data:', finalUpdateData);

      const doctor = await User.findByIdAndUpdate(doctorId, finalUpdateData, {
        new: true,
        runValidators: true
      }).select('-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires');

      if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      console.log('✅ Doctor updated successfully:', doctor._id);

      await auditLog(AUDIT_ACTIONS.USER_UPDATE, {
        metadata: {
          updatedUserId: doctorId,
          updatedFields: Object.keys(updateData),
          updatedBy: updater._id
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cập nhật bác sĩ thành công',
        data: doctor
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete doctor (soft delete)
   */
  async deleteDoctor(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { reason } = req.body;
      const deleter = req.user;

      console.log('🎯 [DOCTOR CONTROLLER] Deleting doctor:', doctorId);

      const doctor = await User.findByIdAndUpdate(
        doctorId,
        {
          isDeleted: true,
          isActive: false,
          status: 'DELETED',
          deletedBy: deleter._id,
          deletedAt: new Date(),
          deletionReason: reason
        },
        { new: true }
      );

      if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      await auditLog(AUDIT_ACTIONS.USER_DELETE, {
        metadata: {
          deletedUserId: doctorId,
          reason,
          deletedBy: deleter._id
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Xóa bác sĩ thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Disable doctor
   */
  async disableDoctor(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { reason } = req.body;
      const disabler = req.user;

      console.log('🎯 [DOCTOR CONTROLLER] Disabling doctor:', doctorId);

      const doctor = await User.findByIdAndUpdate(
        doctorId,
        {
          isActive: false,
          status: 'INACTIVE'
        },
        { new: true }
      );

      if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      await auditLog(AUDIT_ACTIONS.USER_DISABLE, {
        metadata: {
          disabledUserId: doctorId,
          reason,
          disabledBy: disabler._id
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Vô hiệu hóa bác sĩ thành công',
        data: doctor
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enable doctor
   */
  async enableDoctor(req, res, next) {
    try {
      const { doctorId } = req.params;
      const enabler = req.user;

      console.log('🎯 [DOCTOR CONTROLLER] Enabling doctor:', doctorId);

      const doctor = await User.findByIdAndUpdate(
        doctorId,
        {
          isActive: true,
          status: 'ACTIVE'
        },
        { new: true }
      );

      if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      await auditLog(AUDIT_ACTIONS.USER_ENABLE, {
        metadata: {
          enabledUserId: doctorId,
          enabledBy: enabler._id
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Kích hoạt bác sĩ thành công',
        data: doctor
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add specialty to doctor
   */
  async addSpecialty(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { specialtyId } = req.body;

      console.log('🎯 [DOCTOR CONTROLLER] Adding specialty to doctor:', doctorId);

      // This is a placeholder - specialty management would be implemented based on your schema
      res.json({
        success: true,
        message: 'Thêm chuyên khoa thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove specialty from doctor
   */
  async removeSpecialty(req, res, next) {
    try {
      const { doctorId, specialtyId } = req.params;

      console.log('🎯 [DOCTOR CONTROLLER] Removing specialty from doctor:', doctorId);

      res.json({
        success: true,
        message: 'Xóa chuyên khoa thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get doctor statistics
   */
  async getDoctorStats(req, res, next) {
    try {
      const { doctorId } = req.params;

      console.log('🎯 [DOCTOR CONTROLLER] Getting doctor stats:', doctorId);

      const doctor = await User.findById(doctorId).lean();

      if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      const stats = {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        noShowAppointments: 0,
        averageRating: 4.5,
        patientCount: 0
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all doctors statistics
   */
  async getAllDoctorsStats(req, res, next) {
    try {
      console.log('🎯 [DOCTOR CONTROLLER] Getting all doctors stats');

      const totalDoctors = await User.countDocuments({
        role: ROLES.DOCTOR,
        isDeleted: false
      });

      const activeDoctors = await User.countDocuments({
        role: ROLES.DOCTOR,
        isActive: true,
        isDeleted: false
      });

      const stats = {
        totalDoctors,
        activeDoctors,
        inactiveDoctors: totalDoctors - activeDoctors,
        totalAppointments: 0,
        averageRating: 4.5
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add credential to doctor
   */
  async addCredential(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { name, issuedBy, issuedDate, expiryDate } = req.body;

      const doctor = await User.findByIdAndUpdate(
        doctorId,
        {
          $push: {
            credentials: {
              name,
              issuedBy,
              issuedDate,
              expiryDate,
              createdAt: new Date()
            }
          }
        },
        { new: true }
      );

      if (!doctor) {
        throw new AppError('Bác sĩ không tìm thấy', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      res.json({
        success: true,
        message: 'Thêm chứng chỉ thành công',
        data: doctor
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update doctor credential
   */
  async updateCredential(req, res, next) {
    try {
      const { doctorId, credentialId } = req.params;
      const updateData = req.body;

      const doctor = await User.findByIdAndUpdate(
        doctorId,
        {
          $set: {
            'credentials.$[elem]': updateData
          }
        },
        {
          arrayFilters: [{ 'elem._id': credentialId }],
          new: true
        }
      );

      if (!doctor) {
        throw new AppError('Bác sĩ không tìm thấy', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      res.json({
        success: true,
        message: 'Cập nhật chứng chỉ thành công',
        data: doctor
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete doctor credential
   */
  async deleteCredential(req, res, next) {
    try {
      const { doctorId, credentialId } = req.params;

      const doctor = await User.findByIdAndUpdate(
        doctorId,
        {
          $pull: {
            credentials: { _id: credentialId }
          }
        },
        { new: true }
      );

      if (!doctor) {
        throw new AppError('Bác sĩ không tìm thấy', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      res.json({
        success: true,
        message: 'Xóa chứng chỉ thành công',
        data: doctor
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set consultation fees
   */
  async setConsultationFees(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { inPersonFee, onlineFee, checkupFee } = req.body;

      const doctor = await User.findByIdAndUpdate(
        doctorId,
        {
          'professionalInfo.consultationFees': {
            inPerson: inPersonFee,
            online: onlineFee,
            checkup: checkupFee
          }
        },
        { new: true }
      );

      if (!doctor) {
        throw new AppError('Bác sĩ không tìm thấy', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      res.json({
        success: true,
        message: 'Cập nhật phí tư vấn thành công',
        data: doctor
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get consultation fees
   */
  async getConsultationFees(req, res, next) {
    try {
      const { doctorId } = req.params;

      const doctor = await User.findById(doctorId);

      if (!doctor) {
        throw new AppError('Bác sĩ không tìm thấy', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      res.json({
        success: true,
        data: doctor.professionalInfo?.consultationFees || {}
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password - send reset email
   */
  async resetPassword(req, res, next) {
    try {
      const { doctorId } = req.params;

      const doctor = await User.findById(doctorId);

      if (!doctor) {
        throw new AppError('Bác sĩ không tìm thấy', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      // TODO: Send reset password email
      // const resetToken = crypto.randomBytes(32).toString('hex');
      // Save token and expiry to database

      res.json({
        success: true,
        message: 'Email reset password đã được gửi'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get doctor login history
   */
  async getLoginHistory(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // TODO: Implement login history tracking in separate collection
      const skip = (parseInt(page) - 1) * parseInt(limit);

      res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Force logout doctor
   */
  async forceLogout(req, res, next) {
    try {
      const { doctorId } = req.params;

      const doctor = await User.findById(doctorId);

      if (!doctor) {
        throw new AppError('Bác sĩ không tìm thấy', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      // TODO: Invalidate all sessions/tokens for this doctor

      res.json({
        success: true,
        message: 'Bác sĩ đã bị đăng xuất từ tất cả thiết bị'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get doctor activity log
   */
  async getActivityLog(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // TODO: Implement activity log tracking
      res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get doctor performance metrics
   */
  async getPerformanceMetrics(req, res, next) {
    try {
      const { doctorId } = req.params;

      const doctor = await User.findById(doctorId);

      if (!doctor) {
        throw new AppError('Bác sĩ không tìm thấy', 404, ERROR_CODES.USER_NOT_FOUND);
      }

      const metrics = {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        averageRating: 4.5,
        totalPatients: 0,
        noShowRate: 2.5,
        cancellationRate: 3.8,
        avgResponseTime: '2.5 giờ',
        avgConsultationTime: '25 phút'
      };

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get doctor reviews
   */
  async getDoctorReviews(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // TODO: Implement review tracking
      res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get doctor patients
   */
  async getDoctorPatients(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // TODO: Get patients who have appointments with this doctor
      res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk enable doctors
   */
  async bulkEnableDoctors(req, res, next) {
    try {
      const { doctorIds } = req.body;

      const result = await User.updateMany(
        { _id: { $in: doctorIds }, role: ROLES.DOCTOR },
        { status: 'ACTIVE' }
      );

      res.json({
        success: true,
        message: `Kích hoạt ${result.modifiedCount} bác sĩ thành công`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk disable doctors
   */
  async bulkDisableDoctors(req, res, next) {
    try {
      const { doctorIds } = req.body;

      const result = await User.updateMany(
        { _id: { $in: doctorIds }, role: ROLES.DOCTOR },
        { status: 'INACTIVE' }
      );

      res.json({
        success: true,
        message: `Vô hiệu hóa ${result.modifiedCount} bác sĩ thành công`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk delete doctors
   */
  async bulkDeleteDoctors(req, res, next) {
    try {
      const { doctorIds } = req.body;

      const result = await User.updateMany(
        { _id: { $in: doctorIds }, role: ROLES.DOCTOR },
        { isDeleted: true }
      );

      res.json({
        success: true,
        message: `Xóa ${result.modifiedCount} bác sĩ thành công`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DoctorController();
