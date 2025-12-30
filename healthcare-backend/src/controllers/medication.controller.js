// src/controllers/medication.controller.js
const medicationService = require('../services/medication.service');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class MedicationController {
  async getMedications(req, res, next) {
    try {
      const filters = req.query;
      const result = await medicationService.getMedications(filters);

      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        summary: result.summary
      });
    } catch (error) {
      next(error);
    }
  }

  async searchMedications(req, res, next) {
    try {
      const { q, ...filters } = req.query;
      const results = await medicationService.searchMedications(q, filters);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  async getMedicationById(req, res, next) {
    try {
      const { id } = req.params;
      const medication = await medicationService.getMedicationById(id);

      await auditLog(AUDIT_ACTIONS.MEDICATION_VIEW, { resourceId: id })(req, res, () => {});

      res.json({
        success: true,
        data: medication
      });
    } catch (error) {
      next(error);
    }
  }

  async createMedication(req, res, next) {
    try {
      const data = req.body;
      const createdBy = req.user._id;

      const medication = await medicationService.createMedication(data, createdBy);

      await auditLog(AUDIT_ACTIONS.MEDICATION_CREATE, { resourceId: medication._id })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Thêm thuốc mới thành công',
        data: medication
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMedication(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedBy = req.user._id;

      const medication = await medicationService.updateMedication(id, data, updatedBy);

      await auditLog(AUDIT_ACTIONS.MEDICATION_UPDATE, { resourceId: id })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cập nhật thông tin thuốc thành công',
        data: medication
      });
    } catch (error) {
      next(error);
    }
  }

  async adjustStock(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, reason } = req.body;
      const adjustedBy = req.user._id;

      const result = await medicationService.adjustStock(id, quantity, reason, adjustedBy);

      await auditLog(AUDIT_ACTIONS.INVENTORY_ADJUST, { resourceId: id, metadata: { quantity, reason } })(req, res, () => {});

      res.json({
        success: true,
        message: 'Điều chỉnh tồn kho thành công',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async restockMedication(req, res, next) {
    try {
      const { id } = req.params;
      const batchData = req.body;
      const restockedBy = req.user._id;

      const result = await medicationService.restockMedication(id, batchData, restockedBy);

      await auditLog(AUDIT_ACTIONS.INVENTORY_RESTOCK, { resourceId: id })(req, res, () => {});

      res.json({
        success: true,
        message: 'Nhập kho thành công',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async writeOffMedication(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, reason } = req.body;
      const writtenOffBy = req.user._id;

      const result = await medicationService.writeOffMedication(id, quantity, reason, writtenOffBy);

      await auditLog(AUDIT_ACTIONS.INVENTORY_WRITEOFF, { resourceId: id, metadata: { quantity, reason } })(req, res, () => {});

      res.json({
        success: true,
        message: 'Xuất hủy thành công',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getLowStock(req, res, next) {
    try {
      const alerts = await medicationService.getLowStockAlerts();
      res.json({
        success: true,
        data: alerts,
        count: alerts.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpiringSoon(req, res, next) {
    try {
      const { days = 60 } = req.query;
      const alerts = await medicationService.getExpiringMedications(parseInt(days));
      res.json({
        success: true,
        data: alerts,
        count: alerts.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecalledMedications(req, res, next) {
    try {
      const recalls = await medicationService.getRecalledMedications();
      res.json({
        success: true,
        data: recalls
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryValue(req, res, next) {
    try {
      const value = await medicationService.getInventoryValue();
      res.json({
        success: true,
        data: value
      });
    } catch (error) {
      next(error);
    }
  }

  async getMedicationUsageStats(req, res, next) {
    try {
      const filters = req.query;
      const stats = await medicationService.getMedicationUsageStats(filters);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async exportInventoryExcel(req, res, next) {
    try {
      const filters = req.query;
      const buffer = await medicationService.exportInventoryExcel(filters);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="TonKhoThuoc.xlsx"');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MedicationController();