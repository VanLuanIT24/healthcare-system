// src/controllers/patient.controller.js
const patientService = require('../services/patient.service');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class PatientController {
  async registerPatient(req, res, next) {
    try {
      const patientData = req.body;
      const patient = await patientService.registerPatient(patientData);
      await auditLog(AUDIT_ACTIONS.PATIENT_CREATE, { metadata: { patientId: patient._id } })(req, res, () => {});
      res.status(201).json({ success: true, data: patient });
    } catch (error) {
      next(error);
    }
  }

  async searchPatients(req, res, next) {
    try {
      const query = req.query;
      const patients = await patientService.searchPatients(query);
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, { metadata: { type: 'search' } })(req, res, () => {});
      res.json({ success: true, data: patients });
    } catch (error) {
      next(error);
    }
  }

  async advancedSearch(req, res, next) {
    try {
      const params = req.body;
      const patients = await patientService.advancedSearch(params);
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, { metadata: { type: 'advanced_search' } })(req, res, () => {});
      res.json({ success: true, data: patients });
    } catch (error) {
      next(error);
    }
  }

  async getPatients(req, res, next) {
    try {
      const params = req.query;
      const patients = await patientService.getPatients(params);
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, { metadata: { type: 'list' } })(req, res, () => {});
      res.json({ success: true, data: patients });
    } catch (error) {
      next(error);
    }
  }

  async getPatientById(req, res, next) {
    try {
      const { patientId } = req.params;
      const patient = await patientService.getPatientById(patientId);
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, { metadata: { patientId } })(req, res, () => {});
      res.json({ success: true, data: patient });
    } catch (error) {
      next(error);
    }
  }

  async getPatientSensitiveData(req, res, next) {
    try {
      const { patientId } = req.params;
      const emergencyReason = req.query.emergencyReason;
      const data = await patientService.getPatientSensitiveData(patientId, emergencyReason);
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, { metadata: { patientId, sensitive: true } })(req, res, () => {});
      res.json({ success: true, data: data });
    } catch (error) {
      next(error);
    }
  }

  async updatePatient(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = req.body;
      const updated = await patientService.updatePatient(patientId, data);
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, { metadata: { patientId } })(req, res, () => {});
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deletePatient(req, res, next) {
    try {
      const { patientId } = req.params;
      const deleted = await patientService.deletePatient(patientId);
      await auditLog(AUDIT_ACTIONS.PATIENT_DELETE, { metadata: { patientId } })(req, res, () => {});
      res.json({ success: true, data: deleted });
    } catch (error) {
      next(error);
    }
  }

  async admitPatient(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = req.body;
      const admitted = await patientService.admitPatient(patientId, data);
      await auditLog(AUDIT_ACTIONS.PATIENT_ADMIT, { metadata: { patientId } })(req, res, () => {});
      res.json({ success: true, data: admitted });
    } catch (error) {
      next(error);
    }
  }

  async dischargePatient(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = req.body;
      const discharged = await patientService.dischargePatient(patientId, data);
      await auditLog(AUDIT_ACTIONS.PATIENT_DISCHARGE, { metadata: { patientId } })(req, res, () => {});
      res.json({ success: true, data: discharged });
    } catch (error) {
      next(error);
    }
  }

  async getPatientInsurance(req, res, next) {
    try {
      const { patientId } = req.params;
      const insurance = await patientService.getPatientInsurance(patientId);
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, { metadata: { patientId, type: 'insurance' } })(req, res, () => {});
      res.json({ success: true, data: insurance });
    } catch (error) {
      next(error);
    }
  }

  async updatePatientInsurance(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = req.body;
      const updated = await patientService.updatePatientInsurance(patientId, data);
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, { metadata: { patientId, type: 'insurance' } })(req, res, () => {});
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async getPatientAllergies(req, res, next) {
    try {
      const { patientId } = req.params;
      const allergies = await patientService.getPatientAllergies(patientId);
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, { metadata: { patientId, type: 'allergies' } })(req, res, () => {});
      res.json({ success: true, data: allergies });
    } catch (error) {
      next(error);
    }
  }

  async addPatientAllergy(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = req.body;
      const added = await patientService.addPatientAllergy(patientId, data);
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, { metadata: { patientId, type: 'allergies' } })(req, res, () => {});
      res.json({ success: true, data: added });
    } catch (error) {
      next(error);
    }
  }

  async updatePatientAllergy(req, res, next) {
    try {
      const { patientId, allergyId } = req.params;
      const data = req.body;
      const updated = await patientService.updatePatientAllergy(patientId, allergyId, data);
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, { metadata: { patientId, type: 'allergies' } })(req, res, () => {});
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deletePatientAllergy(req, res, next) {
    try {
      const { patientId, allergyId } = req.params;
      const deleted = await patientService.deletePatientAllergy(patientId, allergyId);
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, { metadata: { patientId, type: 'allergies' } })(req, res, () => {});
      res.json({ success: true, data: deleted });
    } catch (error) {
      next(error);
    }
  }

  async getPatientFamilyHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const history = await patientService.getPatientFamilyHistory(patientId);
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, { metadata: { patientId, type: 'family_history' } })(req, res, () => {});
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async addFamilyHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = req.body;
      const added = await patientService.addFamilyHistory(patientId, data);
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, { metadata: { patientId, type: 'family_history' } })(req, res, () => {});
      res.json({ success: true, data: added });
    } catch (error) {
      next(error);
    }
  }

  async updateFamilyHistory(req, res, next) {
    try {
      const { patientId, historyId } = req.params;
      const data = req.body;
      const updated = await patientService.updateFamilyHistory(patientId, historyId, data);
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, { metadata: { patientId, type: 'family_history' } })(req, res, () => {});
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteFamilyHistory(req, res, next) {
    try {
      const { patientId, historyId } = req.params;
      const deleted = await patientService.deleteFamilyHistory(patientId, historyId);
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, { metadata: { patientId, type: 'family_history' } })(req, res, () => {});
      res.json({ success: true, data: deleted });
    } catch (error) {
      next(error);
    }
  }

  async getEmergencyContacts(req, res, next) {
    try {
      const { patientId } = req.params;
      const contacts = await patientService.getEmergencyContacts(patientId);
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, { metadata: { patientId, type: 'emergency_contacts' } })(req, res, () => {});
      res.json({ success: true, data: contacts });
    } catch (error) {
      next(error);
    }
  }

  async addEmergencyContact(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = req.body;
      const added = await patientService.addEmergencyContact(patientId, data);
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, { metadata: { patientId, type: 'emergency_contacts' } })(req, res, () => {});
      res.json({ success: true, data: added });
    } catch (error) {
      next(error);
    }
  }

  async updateEmergencyContact(req, res, next) {
    try {
      const { patientId, contactId } = req.params;
      const data = req.body;
      const updated = await patientService.updateEmergencyContact(patientId, contactId, data);
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, { metadata: { patientId, type: 'emergency_contacts' } })(req, res, () => {});
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmergencyContact(req, res, next) {
    try {
      const { patientId, contactId } = req.params;
      const deleted = await patientService.deleteEmergencyContact(patientId, contactId);
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, { metadata: { patientId, type: 'emergency_contacts' } })(req, res, () => {});
      res.json({ success: true, data: deleted });
    } catch (error) {
      next(error);
    }
  }

  async getPatientConsents(req, res, next) {
    try {
      const { patientId } = req.params;
      const consents = await patientService.getPatientConsents(patientId);
      await auditLog(AUDIT_ACTIONS.PATIENT_VIEW, { metadata: { patientId, type: 'consents' } })(req, res, () => {});
      res.json({ success: true, data: consents });
    } catch (error) {
      next(error);
    }
  }

  async addPatientConsent(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = req.body;
      const added = await patientService.addPatientConsent(patientId, data);
      await auditLog(AUDIT_ACTIONS.PATIENT_UPDATE, { metadata: { patientId, type: 'consents' } })(req, res, () => {});
      res.json({ success: true, data: added });
    } catch (error) {
      next(error);
    }
  }

  async exportPatientRecordPDF(req, res, next) {
    try {
      const { patientId } = req.params;
      const pdfBuffer = await patientService.exportPatientRecordPDF(patientId);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async generatePatientQRCode(req, res, next) {
    try {
      const { patientId } = req.params;
      const qrCode = await patientService.generatePatientQRCode(patientId);
      res.setHeader('Content-Type', 'image/png');
      res.send(qrCode);
    } catch (error) {
      next(error);
    }
  }

  async getPatientAccessLogs(req, res, next) {
    try {
      const { patientId } = req.params;
      const params = req.query;
      const logs = await patientService.getPatientAccessLogs(patientId, params);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  async getPatientStats(req, res, next) {
    try {
      const stats = await patientService.getPatientStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getPatientStatistics(req, res, next) {
    try {
      const { patientId } = req.params;
      const stats = await patientService.getPatientStatistics(patientId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getPatientAppointments(req, res, next) {
    try {
      const { patientId } = req.params;
      const params = req.query;
      const appointments = await patientService.getPatientAppointments(patientId, params);
      res.json({ success: true, data: appointments });
    } catch (error) {
      next(error);
    }
  }

  async getPatientMedicalRecords(req, res, next) {
    try {
      const { patientId } = req.params;
      const params = req.query;
      const records = await patientService.getPatientMedicalRecords(patientId, params);
      res.json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  }

  async getPatientPrescriptions(req, res, next) {
    try {
      const { patientId } = req.params;
      const params = req.query;
      const prescriptions = await patientService.getPatientPrescriptions(patientId, params);
      res.json({ success: true, data: prescriptions });
    } catch (error) {
      next(error);
    }
  }

  async getPatientBills(req, res, next) {
    try {
      const { patientId } = req.params;
      const params = req.query;
      const bills = await patientService.getPatientBills(patientId, params);
      res.json({ success: true, data: bills });
    } catch (error) {
      next(error);
    }
  }

  async getPatientLabResults(req, res, next) {
    try {
      const { patientId } = req.params;
      const params = req.query;
      const results = await patientService.getPatientLabResults(patientId, params);
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PatientController();