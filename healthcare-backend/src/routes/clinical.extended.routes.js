// src/routes/clinical.extended.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const MedicalRecord = require('../models/medicalRecord.model');
const Diagnosis = require('../models/diagnosis.model');
const Consultation = require('../models/consultation.model');
const Patient = require('../models/patient.model');

/**
 * 🩺 CLINICAL EXTENDED ROUTES
 * Các endpoints bổ sung cho clinical workflow
 */

router.use(authenticate);

/**
 * Progress Notes
 */
// POST /api/medical-records/:recordId/progress-notes
router.post('/medical-records/:recordId/progress-notes', 
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const { recordId } = req.params;
      const { note, type } = req.body;

      const record = await MedicalRecord.findById(recordId);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Medical record not found'
        });
      }

      if (!record.progressNotes) {
        record.progressNotes = [];
      }

      record.progressNotes.push({
        date: new Date(),
        note,
        type: type || 'GENERAL',
        recordedBy: req.user._id
      });

      await record.save();

      res.json({
        success: true,
        message: 'Progress note added successfully',
        data: record.progressNotes[record.progressNotes.length - 1]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// GET /api/medical-records/:recordId/progress-notes
router.get('/medical-records/:recordId/progress-notes',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const record = await MedicalRecord.findById(req.params.recordId)
        .populate('progressNotes.recordedBy', 'firstName lastName role');
      
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Medical record not found'
        });
      }

      res.json({
        success: true,
        data: record.progressNotes || []
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// PUT /api/medical-records/:recordId/progress-notes/:noteId
router.put('/medical-records/:recordId/progress-notes/:noteId',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const { recordId, noteId } = req.params;
      const { note, type } = req.body;

      const record = await MedicalRecord.findById(recordId);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Medical record not found'
        });
      }

      const noteIndex = record.progressNotes.findIndex(n => n._id.toString() === noteId);
      if (noteIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Progress note not found'
        });
      }

      record.progressNotes[noteIndex].note = note;
      record.progressNotes[noteIndex].type = type || record.progressNotes[noteIndex].type;
      record.progressNotes[noteIndex].updatedAt = new Date();

      await record.save();

      res.json({
        success: true,
        message: 'Progress note updated successfully',
        data: record.progressNotes[noteIndex]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// DELETE /api/medical-records/:recordId/progress-notes/:noteId
router.delete('/medical-records/:recordId/progress-notes/:noteId',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'),
  async (req, res) => {
    try {
      const { recordId, noteId } = req.params;

      const record = await MedicalRecord.findById(recordId);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Medical record not found'
        });
      }

      record.progressNotes = record.progressNotes.filter(
        n => n._id.toString() !== noteId
      );

      await record.save();

      res.json({
        success: true,
        message: 'Progress note deleted successfully'
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
 * Diagnosis Management (ICD-10)
 */
// GET /api/clinical/icd10/search
router.get('/clinical/icd10/search',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'),
  async (req, res) => {
    try {
      const { query } = req.query;
      
      // Mock ICD-10 data - trong thực tế nên dùng database hoặc external API
      const icd10Codes = [
        { code: 'A00', description: 'Cholera', category: 'Infectious' },
        { code: 'B00', description: 'Herpesviral infections', category: 'Infectious' },
        { code: 'E11', description: 'Type 2 diabetes mellitus', category: 'Endocrine' },
        { code: 'I10', description: 'Essential hypertension', category: 'Circulatory' },
        { code: 'J00', description: 'Acute nasopharyngitis', category: 'Respiratory' }
      ];

      const results = icd10Codes.filter(item =>
        item.code.toLowerCase().includes(query?.toLowerCase() || '') ||
        item.description.toLowerCase().includes(query?.toLowerCase() || '')
      );

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// POST /api/clinical/diagnoses
router.post('/clinical/diagnoses',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'),
  async (req, res) => {
    try {
      const diagnosis = await Diagnosis.create({
        ...req.body,
        diagnosedBy: req.user._id,
        diagnosedAt: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Diagnosis created successfully',
        data: diagnosis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// PUT /api/clinical/diagnoses/:diagnosisId
router.put('/clinical/diagnoses/:diagnosisId',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'),
  async (req, res) => {
    try {
      const diagnosis = await Diagnosis.findByIdAndUpdate(
        req.params.diagnosisId,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!diagnosis) {
        return res.status(404).json({
          success: false,
          message: 'Diagnosis not found'
        });
      }

      res.json({
        success: true,
        message: 'Diagnosis updated successfully',
        data: diagnosis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// GET /api/patients/:patientId/diagnoses
router.get('/patients/:patientId/diagnoses',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const diagnoses = await Diagnosis.find({ patient: req.params.patientId })
        .populate('diagnosedBy', 'firstName lastName')
        .sort({ diagnosedAt: -1 });

      res.json({
        success: true,
        data: diagnoses
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// DELETE /api/clinical/diagnoses/:diagnosisId
router.delete('/clinical/diagnoses/:diagnosisId',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'),
  async (req, res) => {
    try {
      const diagnosis = await Diagnosis.findByIdAndDelete(req.params.diagnosisId);

      if (!diagnosis) {
        return res.status(404).json({
          success: false,
          message: 'Diagnosis not found'
        });
      }

      res.json({
        success: true,
        message: 'Diagnosis deleted successfully'
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
 * Vital Signs
 */
// POST /api/medical-records/:recordId/vital-signs
router.post('/medical-records/:recordId/vital-signs',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const record = await MedicalRecord.findById(req.params.recordId);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Medical record not found'
        });
      }

      if (!record.vitalSigns) {
        record.vitalSigns = [];
      }

      record.vitalSigns.push({
        ...req.body,
        recordedAt: new Date(),
        recordedBy: req.user._id
      });

      await record.save();

      res.json({
        success: true,
        message: 'Vital signs recorded successfully',
        data: record.vitalSigns[record.vitalSigns.length - 1]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// GET /api/patients/:patientId/vital-signs
router.get('/patients/:patientId/vital-signs',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const { startDate, endDate, limit = 50 } = req.query;
      
      const query = { patient: req.params.patientId };
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const records = await MedicalRecord.find(query)
        .select('vitalSigns createdAt')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      // Flatten vital signs from all records
      const allVitalSigns = [];
      records.forEach(record => {
        if (record.vitalSigns && record.vitalSigns.length > 0) {
          allVitalSigns.push(...record.vitalSigns);
        }
      });

      res.json({
        success: true,
        data: allVitalSigns
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// GET /api/patients/:patientId/vital-signs/trend
router.get('/patients/:patientId/vital-signs/trend',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const { vitalType, days = 30 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const records = await MedicalRecord.find({
        patient: req.params.patientId,
        createdAt: { $gte: startDate }
      }).select('vitalSigns createdAt').sort({ createdAt: 1 });

      const trend = [];
      records.forEach(record => {
        if (record.vitalSigns && record.vitalSigns.length > 0) {
          record.vitalSigns.forEach(vs => {
            if (!vitalType || vs[vitalType]) {
              trend.push({
                date: vs.recordedAt || record.createdAt,
                value: vitalType ? vs[vitalType] : vs
              });
            }
          });
        }
      });

      res.json({
        success: true,
        data: {
          vitalType,
          days: parseInt(days),
          trend
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

/**
 * Consultation History
 */
// GET /api/patients/:patientId/consultations
router.get('/patients/:patientId/consultations',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const consultations = await Consultation.find({ patient: req.params.patientId })
        .populate('doctor', 'firstName lastName specialization')
        .sort({ consultationDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Consultation.countDocuments({ patient: req.params.patientId });

      res.json({
        success: true,
        data: {
          consultations,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
          }
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

// GET /api/clinical/consultations/:consultationId
router.get('/clinical/consultations/:consultationId',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const consultation = await Consultation.findById(req.params.consultationId)
        .populate('patient', 'firstName lastName dateOfBirth gender')
        .populate('doctor', 'firstName lastName specialization');

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: 'Consultation not found'
        });
      }

      res.json({
        success: true,
        data: consultation
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
 * Recent Medical Records
 */
// GET /api/medical-records/recent
router.get('/medical-records/recent',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const records = await MedicalRecord.find()
        .populate('patient', 'firstName lastName dateOfBirth')
        .populate('doctor', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: records
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
 * Clinical Templates
 */
// GET /api/clinical/templates
router.get('/clinical/templates',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'),
  async (req, res) => {
    try {
      const { type } = req.query;
      
      // Mock templates - trong thực tế nên lưu trong database
      const templates = [
        {
          id: '1',
          name: 'General Consultation',
          type: 'CONSULTATION',
          content: 'Chief Complaint:\n\nHistory of Present Illness:\n\nPhysical Examination:\n\nAssessment:\n\nPlan:'
        },
        {
          id: '2',
          name: 'Follow-up Visit',
          type: 'FOLLOWUP',
          content: 'Progress since last visit:\n\nCurrent Symptoms:\n\nMedication Compliance:\n\nPlan:'
        }
      ];

      const filtered = type ? templates.filter(t => t.type === type) : templates;

      res.json({
        success: true,
        data: filtered
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// POST /api/clinical/templates
router.post('/clinical/templates',
  requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'),
  async (req, res) => {
    try {
      // Mock save - trong thực tế nên lưu vào database
      const template = {
        id: Date.now().toString(),
        ...req.body,
        createdBy: req.user._id,
        createdAt: new Date()
      };

      res.status(201).json({
        success: true,
        message: 'Template saved successfully',
        data: template
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
