// src/controllers/prescription.controller.js
const prescriptionService = require('../services/prescription.service');
const { AppError } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class PrescriptionController {
  async createPrescription(req, res, next) {
    try {
      const prescriptionData = req.body;
      const doctorId = req.user._id;

      const result = await prescriptionService.createPrescription(prescriptionData, doctorId);

      await auditLog(AUDIT_ACTIONS.PRESCRIPTION_CREATE, {
        resourceId: result.prescription._id,
        metadata: { patientId: result.prescription.patientId }
      })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Tạo đơn thuốc thành công',
        data: result.prescription,
        warnings: result.warnings || null
      });
    } catch (error) {
      next(error);
    }
  }

  async getPrescription(req, res, next) {
    try {
      const { id } = req.params;
      const prescription = await prescriptionService.getPrescription(id);

      await auditLog(AUDIT_ACTIONS.PRESCRIPTION_VIEW, { resourceId: id })(req, res, () => {});

      res.json({
        success: true,
        data: prescription
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePrescription(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedBy = req.user._id;

      const prescription = await prescriptionService.updatePrescription(id, updateData, updatedBy);

      await auditLog(AUDIT_ACTIONS.PRESCRIPTION_UPDATE, { resourceId: id })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cập nhật đơn thuốc thành công',
        data: prescription
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelPrescription(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const cancelledBy = req.user._id;

      const prescription = await prescriptionService.cancelPrescription(id, reason, cancelledBy);

      await auditLog(AUDIT_ACTIONS.PRESCRIPTION_CANCEL, { resourceId: id })(req, res, () => {});

      res.json({
        success: true,
        message: 'Hủy đơn thuốc thành công',
        data: prescription
      });
    } catch (error) {
      next(error);
    }
  }

  async getPrescriptions(req, res, next) {
    try {
      const filters = req.query;
      const prescriptions = await prescriptionService.getPrescriptions(filters);
      res.json({
        success: true,
        data: prescriptions.items,
        pagination: prescriptions.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getPatientPrescriptions(req, res, next) {
    try {
      const { patientId } = req.params;
      const filters = req.query;
      const result = await prescriptionService.getPatientPrescriptions(patientId, filters);
      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async printPrescription(req, res, next) {
    try {
      const { id } = req.params;
      const pdfBuffer = await prescriptionService.generatePrescriptionPDF(id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="DonThuoc_${id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async approvePrescription(req, res, next) {
    try {
      const { id } = req.params;
      const approvedBy = req.user._id;
      const prescription = await prescriptionService.approvePrescription(id, approvedBy);
      res.json({
        success: true,
        message: 'Duyệt đơn thuốc thành công',
        data: prescription
      });
    } catch (error) {
      next(error);
    }
  }

  async dispenseMedication(req, res, next) {
    try {
      const { id } = req.params;
      const dispenseData = req.body;
      const pharmacistId = req.user._id;

      const prescription = await prescriptionService.dispenseMedication(id, dispenseData, pharmacistId);

      await auditLog(AUDIT_ACTIONS.PRESCRIPTION_DISPENSE, { resourceId: id })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cấp phát thuốc thành công',
        data: prescription
      });
    } catch (error) {
      next(error);
    }
  }

  async getDispenseHistory(req, res, next) {
    try {
      const { id } = req.params;
      const history = await prescriptionService.getDispenseHistory(id);
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  async checkDrugInteractions(req, res, next) {
    try {
      const { medications } = req.body;
      const result = await prescriptionService.checkDrugInteractions(medications);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async checkPatientAllergies(req, res, next) {
    try {
      const { patientId } = req.params;
      const { medications } = req.body;
      const result = await prescriptionService.checkPatientAllergies(patientId, medications);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getDosageSuggestions(req, res, next) {
    try {
      const { medicationId } = req.params;
      const patientData = req.query;
      const suggestions = await prescriptionService.getDosageSuggestions(medicationId, patientData);
      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      next(error);
    }
  }

  // Medication catalog
  async searchMedications(req, res, next) {
    try {
      const { q, ...filters } = req.query;
      const results = await prescriptionService.searchMedications(q, filters);
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  async getMedications(req, res, next) {
    try {
      const filters = req.query;
      const result = await prescriptionService.getMedications(filters);
      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getMedicationById(req, res, next) {
    try {
      const { id } = req.params;
      const medication = await prescriptionService.getMedicationById(id);
      res.json({
        success: true,
        data: medication
      });
    } catch (error) {
      next(error);
    }
  }

  // Alerts
  async getLowStockAlerts(req, res, next) {
    try {
      const alerts = await prescriptionService.getLowStockAlerts();
      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpiringMedications(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const alerts = await prescriptionService.getExpiringMedications(parseInt(days));
      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecalledMedications(req, res, next) {
    try {
      const recalls = await prescriptionService.getRecalledMedications();
      res.json({
        success: true,
        data: recalls
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PrescriptionController();