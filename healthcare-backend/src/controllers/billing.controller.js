// src/controllers/billing.controller.js
const billingService = require('../services/billing.service');
const { validateBilling } = require('../validations/billing.validation');
const { AppError } = require('../middlewares/error.middleware');
const { manualAuditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

/**
 * 🎯 TẠO HÓA ĐƠN CHO BỆNH NHÂN
 */
const createBill = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const billData = req.body;

    console.log('💰 [BILLING] Creating bill for patient:', patientId);

    // Validate input data
    const { error } = validateBilling.createBill(billData);
    if (error) {
      throw new AppError('Dữ liệu không hợp lệ', 400, 'VALIDATION_ERROR', error.details);
    }

    // Create bill using service
    const bill = await billingService.createBill(patientId, billData, req.user._id);

    // Audit log
    await manualAuditLog({
      action: AUDIT_ACTIONS.BILL_CREATE,
      user: req.user,
      metadata: {
        billId: bill._id,
        billNumber: bill.billNumber,
        patientId: patientId,
        amount: bill.finalAmount
      }
    });

    console.log(`✅ Bill created: ${bill.billNumber} for patient ${patientId}`);

    res.status(201).json({
      success: true,
      message: 'Tạo hóa đơn thành công',
      data: bill
    });

  } catch (error) {
    next(error);
  }
};

/**
 * 🎯 LẤY THÔNG TIN HÓA ĐƠN
 */
const getBill = async (req, res, next) => {
  try {
    const { billId } = req.params;

    console.log('💰 [BILLING] Getting bill:', billId);

    const bill = await billingService.getBill(billId, req.user._id, req.user.role);

    // Audit log
    await manualAuditLog({
      action: AUDIT_ACTIONS.BILL_VIEW,
      user: req.user,
      metadata: {
        billId: bill._id,
        billNumber: bill.billNumber
      }
    });

    res.json({
      success: true,
      data: bill
    });

  } catch (error) {
    next(error);
  }
};

/**
 * 🎯 CẬP NHẬT HÓA ĐƠN
 */
const updateBill = async (req, res, next) => {
  try {
    const { billId } = req.params;
    const updateData = req.body;

    console.log('💰 [BILLING] Updating bill:', billId);

    // Validate input data
    const { error } = validateBilling.updateBill(updateData);
    if (error) {
      throw new AppError('Dữ liệu không hợp lệ', 400, 'VALIDATION_ERROR', error.details);
    }

    // Update bill using service
    const bill = await billingService.updateBill(billId, updateData, req.user._id);

    // Audit log
    await manualAuditLog({
      action: AUDIT_ACTIONS.BILL_UPDATE,
      user: req.user,
      metadata: {
        billId: bill._id,
        billNumber: bill.billNumber,
        updates: Object.keys(updateData)
      }
    });

    console.log(`✅ Bill updated: ${bill.billNumber}`);

    res.json({
      success: true,
      message: 'Cập nhật hóa đơn thành công',
      data: bill
    });

  } catch (error) {
    next(error);
  }
};

/**
 * 🎯 LẤY TẤT CẢ HÓA ĐƠN CỦA BỆNH NHÂN
 */
const getPatientBills = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const queryParams = req.query;

    console.log('💰 [BILLING] Getting bills for patient:', patientId);

    // Validate query params
    const { error } = validateBilling.billQuery(queryParams);
    if (error) {
      throw new AppError('Query parameters không hợp lệ', 400, 'VALIDATION_ERROR', error.details);
    }

    // Get bills using service
    const bills = await billingService.getPatientBills(
      patientId, 
      req.user._id, 
      req.user.role, 
      queryParams
    );

    // Audit log
    await manualAuditLog({
      action: AUDIT_ACTIONS.BILL_VIEW,
      user: req.user,
      metadata: {
        patientId: patientId,
        billCount: bills.totalDocs,
        filters: queryParams
      }
    });

    res.json({
      success: true,
      data: bills
    });

  } catch (error) {
    next(error);
  }
};

/**
 * 🎯 XỬ LÝ THANH TOÁN HÓA ĐƠN
 */
const processPayment = async (req, res, next) => {
  try {
    const { billId } = req.params;
    const paymentData = req.body;

    console.log('💰 [BILLING] Processing payment for bill:', billId);

    // Validate payment data
    const { error } = validateBilling.processPayment(paymentData);
    if (error) {
      throw new AppError('Dữ liệu thanh toán không hợp lệ', 400, 'VALIDATION_ERROR', error.details);
    }

    // Process payment using service
    const bill = await billingService.processPayment(billId, paymentData, req.user._id);

    // Audit log
    await manualAuditLog({
      action: AUDIT_ACTIONS.PAYMENT_PROCESS,
      user: req.user,
      metadata: {
        billId: bill._id,
        billNumber: bill.billNumber,
        paymentAmount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        newStatus: bill.status
      }
    });

    console.log(`✅ Payment processed for bill: ${bill.billNumber}, Amount: ${paymentData.amount}`);

    res.json({
      success: true,
      message: 'Xử lý thanh toán thành công',
      data: {
        bill,
        payment: bill.payments[bill.payments.length - 1] // Last payment
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * 🎯 LẤY LỊCH SỬ THANH TOÁN
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const queryParams = req.query;

    console.log('💰 [BILLING] Getting payment history for patient:', patientId);

    // Validate query params
    const { error } = validateBilling.paymentQuery(queryParams);
    if (error) {
      throw new AppError('Query parameters không hợp lệ', 400, 'VALIDATION_ERROR', error.details);
    }

    // Get payment history using service
    const paymentHistory = await billingService.getPaymentHistory(
      patientId,
      req.user._id,
      req.user.role,
      queryParams
    );

    // Audit log
    await manualAuditLog({
      action: AUDIT_ACTIONS.BILL_VIEW,
      user: req.user,
      metadata: {
        patientId: patientId,
        paymentCount: paymentHistory.pagination.totalPayments,
        filters: queryParams
      }
    });

    res.json({
      success: true,
      data: paymentHistory
    });

  } catch (error) {
    next(error);
  }
};

/**
 * 🎯 HỦY HÓA ĐƠN
 */
const voidBill = async (req, res, next) => {
  try {
    const { billId } = req.params;
    const { reason } = req.body;

    console.log('💰 [BILLING] Voiding bill:', billId);

    // Validate void data
    const { error } = validateBilling.voidBill({ reason });
    if (error) {
      throw new AppError('Dữ liệu hủy không hợp lệ', 400, 'VALIDATION_ERROR', error.details);
    }

    // Void bill using service
    const bill = await billingService.voidBill(billId, reason, req.user._id);

    // Audit log
    await manualAuditLog({
      action: AUDIT_ACTIONS.BILL_UPDATE,
      user: req.user,
      metadata: {
        billId: bill._id,
        billNumber: bill.billNumber,
        action: 'VOIDED',
        reason: reason
      }
    });

    console.log(`✅ Bill voided: ${bill.billNumber}, Reason: ${reason}`);

    res.json({
      success: true,
      message: 'Hủy hóa đơn thành công',
      data: bill
    });

  } catch (error) {
    next(error);
  }
};

/**
 * 🎯 LẤY THỐNG KÊ DOANH THU
 */
const getRevenueStats = async (req, res, next) => {
  try {
    const { timeRange = 'month' } = req.query;

    console.log('💰 [BILLING] Getting revenue stats for:', timeRange);

    const stats = await billingService.getRevenueStats(timeRange);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBill,
  getBill,
  updateBill,
  getPatientBills,
  processPayment,
  getPaymentHistory,
  voidBill,
  getRevenueStats
};