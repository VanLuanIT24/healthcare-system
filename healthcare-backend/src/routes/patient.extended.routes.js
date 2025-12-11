// src/routes/patient.extended.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const Patient = require('../models/patient.model');

/**
 * 🏥 PATIENT EXTENDED ROUTES
 * Các endpoints bổ sung cho patient management
 */

router.use(authenticate);

/**
 * Insurance Management
 */
// GET /api/patients/:patientId/insurance
router.get('/patients/:patientId/insurance',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'BILLING_STAFF'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId)
        .select('insurance');

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: patient.insurance || []
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// PUT /api/patients/:patientId/insurance
router.put('/patients/:patientId/insurance',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'BILLING_STAFF'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      patient.insurance = req.body;
      await patient.save();

      res.json({
        success: true,
        message: 'Insurance information updated successfully',
        data: patient.insurance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// DELETE /api/patients/:patientId/insurance/:insuranceId
router.delete('/patients/:patientId/insurance/:insuranceId',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      if (Array.isArray(patient.insurance)) {
        patient.insurance = patient.insurance.filter(
          ins => ins._id.toString() !== req.params.insuranceId
        );
        await patient.save();
      }

      res.json({
        success: true,
        message: 'Insurance deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * Allergies Management
 */
// GET /api/patients/:patientId/allergies
router.get('/patients/:patientId/allergies',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId)
        .select('allergies');

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: patient.allergies || []
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// POST /api/patients/:patientId/allergies
router.post('/patients/:patientId/allergies',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      if (!patient.allergies) {
        patient.allergies = [];
      }

      patient.allergies.push({
        ...req.body,
        recordedAt: new Date(),
        recordedBy: req.user._id
      });

      await patient.save();

      res.status(201).json({
        success: true,
        message: 'Allergy added successfully',
        data: patient.allergies[patient.allergies.length - 1]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// PUT /api/patients/:patientId/allergies/:allergyId
router.put('/patients/:patientId/allergies/:allergyId',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const allergyIndex = patient.allergies?.findIndex(
        a => a._id.toString() === req.params.allergyId
      );

      if (allergyIndex === -1 || allergyIndex === undefined) {
        return res.status(404).json({
          success: false,
          message: 'Allergy not found'
        });
      }

      patient.allergies[allergyIndex] = {
        ...patient.allergies[allergyIndex],
        ...req.body,
        updatedAt: new Date()
      };

      await patient.save();

      res.json({
        success: true,
        message: 'Allergy updated successfully',
        data: patient.allergies[allergyIndex]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// DELETE /api/patients/:patientId/allergies/:allergyId
router.delete('/patients/:patientId/allergies/:allergyId',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      if (Array.isArray(patient.allergies)) {
        patient.allergies = patient.allergies.filter(
          a => a._id.toString() !== req.params.allergyId
        );
        await patient.save();
      }

      res.json({
        success: true,
        message: 'Allergy deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * Family History
 */
// GET /api/patients/:patientId/family-history
router.get('/patients/:patientId/family-history',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId)
        .select('familyHistory');

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: patient.familyHistory || []
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// POST /api/patients/:patientId/family-history
router.post('/patients/:patientId/family-history',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      if (!patient.familyHistory) {
        patient.familyHistory = [];
      }

      patient.familyHistory.push({
        ...req.body,
        recordedAt: new Date()
      });

      await patient.save();

      res.status(201).json({
        success: true,
        message: 'Family history added successfully',
        data: patient.familyHistory[patient.familyHistory.length - 1]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// PUT /api/patients/:patientId/family-history/:historyId
router.put('/patients/:patientId/family-history/:historyId',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const historyIndex = patient.familyHistory?.findIndex(
        h => h._id.toString() === req.params.historyId
      );

      if (historyIndex === -1 || historyIndex === undefined) {
        return res.status(404).json({
          success: false,
          message: 'Family history not found'
        });
      }

      patient.familyHistory[historyIndex] = {
        ...patient.familyHistory[historyIndex],
        ...req.body,
        updatedAt: new Date()
      };

      await patient.save();

      res.json({
        success: true,
        message: 'Family history updated successfully',
        data: patient.familyHistory[historyIndex]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// DELETE /api/patients/:patientId/family-history/:historyId
router.delete('/patients/:patientId/family-history/:historyId',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      if (Array.isArray(patient.familyHistory)) {
        patient.familyHistory = patient.familyHistory.filter(
          h => h._id.toString() !== req.params.historyId
        );
        await patient.save();
      }

      res.json({
        success: true,
        message: 'Family history deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * Emergency Contacts
 */
// GET /api/patients/:patientId/emergency-contacts
router.get('/patients/:patientId/emergency-contacts',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId)
        .select('emergencyContacts');

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: patient.emergencyContacts || []
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// POST /api/patients/:patientId/emergency-contacts
router.post('/patients/:patientId/emergency-contacts',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      if (!patient.emergencyContacts) {
        patient.emergencyContacts = [];
      }

      patient.emergencyContacts.push(req.body);
      await patient.save();

      res.status(201).json({
        success: true,
        message: 'Emergency contact added successfully',
        data: patient.emergencyContacts[patient.emergencyContacts.length - 1]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// PUT /api/patients/:patientId/emergency-contacts/:contactId
router.put('/patients/:patientId/emergency-contacts/:contactId',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const contactIndex = patient.emergencyContacts?.findIndex(
        c => c._id.toString() === req.params.contactId
      );

      if (contactIndex === -1 || contactIndex === undefined) {
        return res.status(404).json({
          success: false,
          message: 'Emergency contact not found'
        });
      }

      patient.emergencyContacts[contactIndex] = {
        ...patient.emergencyContacts[contactIndex],
        ...req.body
      };

      await patient.save();

      res.json({
        success: true,
        message: 'Emergency contact updated successfully',
        data: patient.emergencyContacts[contactIndex]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// DELETE /api/patients/:patientId/emergency-contacts/:contactId
router.delete('/patients/:patientId/emergency-contacts/:contactId',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST'),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      if (Array.isArray(patient.emergencyContacts)) {
        patient.emergencyContacts = patient.emergencyContacts.filter(
          c => c._id.toString() !== req.params.contactId
        );
        await patient.save();
      }

      res.json({
        success: true,
        message: 'Emergency contact deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * Advanced Search
 */
// POST /api/patients/advanced-search
router.post('/patients/advanced-search',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'),
  async (req, res) => {
    try {
      const {
        name,
        phoneNumber,
        email,
        dateOfBirth,
        gender,
        bloodGroup,
        minAge,
        maxAge,
        hasAllergies,
        hasInsurance
      } = req.body;

      const query = {};

      if (name) {
        query.$or = [
          { firstName: new RegExp(name, 'i') },
          { lastName: new RegExp(name, 'i') }
        ];
      }

      if (phoneNumber) query.phoneNumber = new RegExp(phoneNumber, 'i');
      if (email) query.email = new RegExp(email, 'i');
      if (dateOfBirth) query.dateOfBirth = new Date(dateOfBirth);
      if (gender) query.gender = gender;
      if (bloodGroup) query.bloodGroup = bloodGroup;

      if (minAge || maxAge) {
        query.dateOfBirth = {};
        if (minAge) {
          const maxDate = new Date();
          maxDate.setFullYear(maxDate.getFullYear() - minAge);
          query.dateOfBirth.$lte = maxDate;
        }
        if (maxAge) {
          const minDate = new Date();
          minDate.setFullYear(minDate.getFullYear() - maxAge);
          query.dateOfBirth.$gte = minDate;
        }
      }

      if (hasAllergies !== undefined) {
        query.allergies = hasAllergies ? { $exists: true, $ne: [] } : { $in: [null, []] };
      }

      if (hasInsurance !== undefined) {
        query.insurance = hasInsurance ? { $exists: true, $ne: [] } : { $in: [null, []] };
      }

      const patients = await Patient.find(query)
        .select('firstName lastName dateOfBirth gender phoneNumber email bloodGroup')
        .limit(50);

      res.json({
        success: true,
        data: patients,
        total: patients.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * Patient Statistics
 */
// GET /api/patients/:patientId/statistics
router.get('/patients/:patientId/statistics',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const Appointment = require('../models/appointment.model');
      const MedicalRecord = require('../models/medicalRecord.model');
      const Bill = require('../models/bill.model');
      const Prescription = require('../models/prescription.model');

      const patientId = req.params.patientId;

      const [
        totalAppointments,
        totalRecords,
        totalBills,
        totalPrescriptions,
        unpaidBills
      ] = await Promise.all([
        Appointment.countDocuments({ patient: patientId }),
        MedicalRecord.countDocuments({ patient: patientId }),
        Bill.countDocuments({ patient: patientId }),
        Prescription.countDocuments({ patient: patientId }),
        Bill.countDocuments({ patient: patientId, status: 'UNPAID' })
      ]);

      const totalSpent = await Bill.aggregate([
        { $match: { patient: patientId, status: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      res.json({
        success: true,
        data: {
          totalAppointments,
          totalRecords,
          totalBills,
          totalPrescriptions,
          unpaidBills,
          totalSpent: totalSpent[0]?.total || 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;
