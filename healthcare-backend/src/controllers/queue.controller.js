// src/controllers/queue.controller.js
const queueService = require('../services/queue.service');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class QueueController {
  async getQueue(req, res, next) {
    try {
      const filters = req.query;
      const result = await queueService.getQueue(filters);

      await auditLog(AUDIT_ACTIONS.QUEUE_VIEW, {
        metadata: { filters }
      })(req, res, () => {});

      res.json({
        success: true,
        data: result.entries,
        pagination: result.pagination,
        summary: result.summary
      });
    } catch (error) {
      next(error);
    }
  }

  async getTodayQueue(req, res, next) {
    try {
      const filters = { ...req.query, today: true };
      const result = await queueService.getQueue(filters);

      res.json({
        success: true,
        data: result.entries,
        summary: result.summary
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentPatient(req, res, next) {
    try {
      const { doctorId } = req.params;
      const patient = await queueService.getCurrentPatient(doctorId);

      res.json({
        success: true,
        data: patient || null
      });
    } catch (error) {
      next(error);
    }
  }

  async callNext(req, res, next) {
    try {
      const { doctorId } = req.params;
      const calledBy = req.user._id;

      const nextPatient = await queueService.callNext(doctorId, calledBy);

      await auditLog(AUDIT_ACTIONS.QUEUE_CALL_NEXT, {
        metadata: { doctorId, queueId: nextPatient.queueId }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Đã gọi bệnh nhân tiếp theo',
        data: nextPatient
      });
    } catch (error) {
      next(error);
    }
  }

  async skipPatient(req, res, next) {
    try {
      const { queueId } = req.params;
      const { reason } = req.body;
      const skippedBy = req.user._id;

      const skipped = await queueService.skipPatient(queueId, reason, skippedBy);

      await auditLog(AUDIT_ACTIONS.QUEUE_SKIP, {
        metadata: { queueId, reason }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Đã bỏ qua bệnh nhân',
        data: skipped
      });
    } catch (error) {
      next(error);
    }
  }

  async recallPatient(req, res, next) {
    try {
      const { queueId } = req.params;
      const recalledBy = req.user._id;

      const recalled = await queueService.recallPatient(queueId, recalledBy);

      await auditLog(AUDIT_ACTIONS.QUEUE_RECALL, {
        metadata: { queueId }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Đã gọi lại bệnh nhân',
        data: recalled
      });
    } catch (error) {
      next(error);
    }
  }

  async completePatient(req, res, next) {
    try {
      const { queueId } = req.params;
      const { notes } = req.body;
      const completedBy = req.user._id;

      const completed = await queueService.completePatient(queueId, completedBy, notes);

      await auditLog(AUDIT_ACTIONS.QUEUE_COMPLETE, {
        metadata: { queueId }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Hoàn thành khám',
        data: completed
      });
    } catch (error) {
      next(error);
    }
  }

  async addToQueue(req, res, next) {
    try {
      const { appointmentId } = req.body;
      const addedBy = req.user._id;

      const entry = await queueService.addToQueue({ appointmentId, addedBy });

      await auditLog(AUDIT_ACTIONS.QUEUE_ADD, {
        metadata: { appointmentId, queueId: entry.queueId }
      })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Đã thêm vào hàng đợi',
        data: entry
      });
    } catch (error) {
      next(error);
    }
  }

  async addWalkIn(req, res, next) {
    try {
      const payload = { ...req.body, addedBy: req.user._id };
      const entry = await queueService.addWalkIn(payload);

      await auditLog(AUDIT_ACTIONS.QUEUE_ADD, {
        metadata: { patientId: payload.patientId, queueId: entry.queueId, type: 'WALK_IN' }
      })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Bệnh nhân tự do đã vào hàng đợi',
        data: entry
      });
    } catch (error) {
      next(error);
    }
  }

  async getQueueStats(req, res, next) {
    try {
      const filters = req.query;
      const stats = await queueService.getQueueStats(filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getEstimatedWaitTime(req, res, next) {
    try {
      const { doctorId } = req.params;
      const estimate = await queueService.getEstimatedWaitTime(doctorId);

      res.json({
        success: true,
        data: estimate
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QueueController();