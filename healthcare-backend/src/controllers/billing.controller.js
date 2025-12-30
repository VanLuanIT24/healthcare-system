// controllers/billing.controller.js
const billingService = require('../services/billing.service');
const { asyncHandler } = require('../middlewares/error.middleware');
const { validateBilling } = require('../validations/billing.validation');
const { manualAuditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class BillingController {
  // Tạo hóa đơn mới
  createBill = asyncHandler(async (req, res) => {
    const billData = req.body;
    const createdBy = req.user._id;
    const { error } = validateBilling.createBill(billData);
    if (error) {
      throw new AppError('Dữ liệu hóa đơn không hợp lệ', 400, 'VALIDATION_ERROR', error.details);
    }
    const bill = await billingService.createBill(billData.patientId, billData, createdBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.BILL_CREATE,
      user: req.user,
      metadata: { billId: bill._id, patientId: bill.patientId, amount: bill.grandTotal }
    });
    res.status(201).json({
      success: true,
      message: 'Tạo hóa đơn thành công',
      data: bill
    });
  });

  // Lấy thông tin hóa đơn theo ID
  getBill = asyncHandler(async (req, res) => {
    const { billId } = req.params;
    const bill = await billingService.getBill(billId);
    await manualAuditLog({
      action: AUDIT_ACTIONS.BILL_VIEW,
      user: req.user,
      metadata: { billId: bill._id }
    });
    res.json({
      success: true,
      data: bill
    });
  });

  // Lấy danh sách hóa đơn
  getBills = asyncHandler(async (req, res) => {
    const params = req.query;
    const bills = await billingService.getBills(params);
    res.json({
      success: true,
      data: bills
    });
  });

  // Cập nhật hóa đơn
  updateBill = asyncHandler(async (req, res) => {
    const { billId } = req.params;
    const updateData = req.body;
    const updatedBy = req.user._id;
    const { error } = validateBilling.updateBill(updateData);
    if (error) {
      throw new AppError('Dữ liệu cập nhật không hợp lệ', 400, 'VALIDATION_ERROR', error.details);
    }
    const bill = await billingService.updateBill(billId, updateData, updatedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.BILL_UPDATE,
      user: req.user,
      metadata: { billId: bill._id, updates: Object.keys(updateData) }
    });
    res.json({
      success: true,
      message: 'Cập nhật hóa đơn thành công',
      data: bill
    });
  });

  // Hủy hóa đơn
  voidBill = asyncHandler(async (req, res) => {
    const { billId } = req.params;
    const { reason } = req.body;
    const voidedBy = req.user._id;
    const { error } = validateBilling.voidBill({ reason });
    if (error) {
      throw new AppError('Dữ liệu hủy không hợp lệ', 400, 'VALIDATION_ERROR', error.details);
    }
    const bill = await billingService.voidBill(billId, reason, voidedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.BILL_UPDATE,
      user: req.user,
      metadata: { billId: bill._id, action: 'VOIDED', reason }
    });
    res.json({
      success: true,
      message: 'Hủy hóa đơn thành công',
      data: bill
    });
  });

  // Xử lý thanh toán
  processPayment = asyncHandler(async (req, res) => {
    const { billId } = req.params;
    const paymentData = req.body;
    const processedBy = req.user._id;
    const { error } = validateBilling.processPayment(paymentData);
    if (error) {
      throw new AppError('Dữ liệu thanh toán không hợp lệ', 400, 'VALIDATION_ERROR', error.details);
    }
    const bill = await billingService.processPayment(billId, paymentData, processedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.PAYMENT_PROCESS,
      user: req.user,
      metadata: { billId: bill._id, paymentAmount: paymentData.amount, method: paymentData.method }
    });
    res.json({
      success: true,
      message: 'Xử lý thanh toán thành công',
      data: bill
    });
  });

  // Lấy lịch sử thanh toán
  getPaymentHistory = asyncHandler(async (req, res) => {
    const { billId } = req.params;
    const history = await billingService.getPaymentHistory(billId);
    res.json({
      success: true,
      data: history
    });
  });

  // Hoàn tiền
  refundPayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const refundData = req.body;
    const refundedBy = req.user._id;
    const { error } = validateBilling.refundPayment(refundData);
    if (error) {
      throw new AppError('Dữ liệu hoàn tiền không hợp lệ', 400, 'VALIDATION_ERROR', error.details);
    }
    const refund = await billingService.refundPayment(paymentId, refundData, refundedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.BILL_REFUND,
      user: req.user,
      metadata: { paymentId, refundAmount: refundData.amount, reason: refundData.reason }
    });
    res.json({
      success: true,
      message: 'Hoàn tiền thành công',
      data: refund
    });
  });

  // Lấy hóa đơn của bệnh nhân
  getPatientBills = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const params = req.query;
    const bills = await billingService.getPatientBills(patientId, params);
    res.json({
      success: true,
      data: bills
    });
  });

  // Xác minh bảo hiểm
  verifyInsurance = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const insuranceData = req.body;
    const { error } = validateBilling.verifyInsurance(insuranceData);
    if (error) {
      throw new AppError('Dữ liệu bảo hiểm không hợp lệ', 400, 'VALIDATION_ERROR', error.details);
    }
    const result = await billingService.verifyInsurance(patientId, insuranceData);
    res.json({
      success: true,
      message: 'Xác minh bảo hiểm thành công',
      data: result
    });
  });

  // Gửi yêu cầu bảo hiểm
  submitInsuranceClaim = asyncHandler(async (req, res) => {
    const { billId } = req.params;
    const claimData = req.body;
    const { error } = validateBilling.insuranceClaim(claimData);
    if (error) {
      throw new AppError('Dữ liệu yêu cầu bảo hiểm không hợp lệ', 400, 'VALIDATION_ERROR', error.details);
    }
    const claim = await billingService.submitInsuranceClaim(billId, claimData);
    res.status(201).json({
      success: true,
      message: 'Gửi yêu cầu bảo hiểm thành công',
      data: claim
    });
  });

  // Lấy hóa đơn chưa thanh toán
  getOutstandingBills = asyncHandler(async (req, res) => {
    const params = req.query;
    const bills = await billingService.getOutstandingBills(params);
    res.json({
      success: true,
      data: bills
    });
  });

  // Lấy thống kê doanh thu
  getRevenueStats = asyncHandler(async (req, res) => {
    const params = req.query;
    const stats = await billingService.getRevenueStats(params);
    res.json({
      success: true,
      data: stats
    });
  });

  // Xuất hóa đơn PDF
  generateInvoicePDF = asyncHandler(async (req, res) => {
    const { billId } = req.params;
    const pdf = await billingService.generateInvoicePDF(billId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${billId}.pdf`);
    res.send(pdf);
  });

  // Xuất biên lai PDF
  generateReceiptPDF = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const pdf = await billingService.generateReceiptPDF(paymentId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${paymentId}.pdf`);
    res.send(pdf);
  });
}

module.exports = new BillingController();