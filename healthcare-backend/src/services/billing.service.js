// services/billing.service.js - Phiên bản ĐẦY ĐỦ, CHUYÊN NGHIỆP, CHI TIẾT 2025
const Bill = require('../models/bill.model');
const Patient = require('../models/patient.model');
const { AppError } = require('../middlewares/error.middleware');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const { format } = require('date-fns');

class BillingService {
  /**
   * 🎯 TẠO HÓA ĐƠN MỚI - ĐẦY ĐỦ LOGIC TÍNH TOÁN
   */
  async createBill(patientId, billData, createdBy) {
    // Validate patientId
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      throw new AppError('ID bệnh nhân không hợp lệ', 400);
    }

    // Kiểm tra bệnh nhân tồn tại
    const patient = await Patient.findById(patientId).select('personalInfo patientId insurance');
    if (!patient) {
      throw new AppError('Không tìm thấy bệnh nhân', 404);
    }

    // Require department
    if (!billData.department || !mongoose.Types.ObjectId.isValid(billData.department)) {
      throw new AppError('Thiếu hoặc sai department khi tạo hóa đơn', 400);
    }

    // Tính toán chi tiết từ services
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const processedServices = billData.services.map(service => {
      const serviceTotal = service.quantity * service.unitPrice;
      const discountAmount = service.discount || 0;
      const afterDiscount = serviceTotal - discountAmount;
      const taxAmount = afterDiscount * (service.taxRate || billData.taxRate || 0) / 100;

      subtotal += afterDiscount;
      totalDiscount += discountAmount;
      totalTax += taxAmount;

      return {
        serviceCode: service.serviceCode || null,
        serviceName: service.serviceName,
        description: service.description || '',
        quantity: service.quantity,
        unitPrice: service.unitPrice,
        discount: discountAmount,
        taxRate: service.taxRate || billData.taxRate || 0,
        total: afterDiscount + taxAmount
      };
    });

    const grandTotal = subtotal + totalTax;
    const balanceDue = grandTotal;

    // Tạo billId duy nhất
    const billCount = await Bill.countDocuments();
    const billId = `HD${format(new Date(), 'yyyyMMdd')}-${String(billCount + 1).padStart(5, '0')}`;

    const newBill = new Bill({
      billId,
      patientId,
      department: billData.department,
      issueDate: new Date(),
      dueDate: billData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày mặc định
      billType: billData.billType,
      services: processedServices,
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal,
      amountPaid: 0,
      balanceDue,
      insurance: billData.insurance || patient.insurance || null,
      notes: billData.notes || '',
      terms: billData.terms || '',
      status: 'ISSUED',
      createdBy
    });

    await newBill.save();
    await newBill.populate('patientId', 'personalInfo patientId');
    await newBill.populate('createdBy', 'personalInfo');

    return newBill;
  }

  /**
   * 🎯 LẤY THÔNG TIN HÓA ĐƠN CHI TIẾT
   */
  async getBill(billId) {
    const bill = await Bill.findById(billId)
      .populate('patientId', 'personalInfo patientId insurance')
      .populate('createdBy', 'personalInfo')
      .populate('payments.processedBy', 'personalInfo');

    if (!bill) {
      throw new AppError('Không tìm thấy hóa đơn', 404);
    }

    return bill;
  }

  /**
   * 🎯 LẤY DANH SÁCH HÓA ĐƠN VỚI PHÂN TRANG & FILTER
   */
  async getBills(filters = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      billType,
      startDate,
      endDate,
      patientId,
      sortBy = 'issueDate',
      sortOrder = 'desc'
    } = filters;

    const query = {};

    if (status) query.status = status;
    if (billType) query.billType = billType;
    if (patientId) query.patientId = patientId;
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [bills, total] = await Promise.all([
      Bill.find(query)
        .populate('patientId', 'personalInfo patientId')
        .populate('createdBy', 'personalInfo')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Bill.countDocuments(query)
    ]);

    return {
      bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * 🎯 CẬP NHẬT HÓA ĐƠN (chỉ khi chưa thanh toán hết hoặc chưa hủy)
   */
  async updateBill(billId, updateData, updatedBy) {
    const bill = await Bill.findById(billId);
    if (!bill) {
      throw new AppError('Không tìm thấy hóa đơn', 404);
    }

    if (bill.status === 'PAID') {
      throw new AppError('Không thể cập nhật hóa đơn đã thanh toán hoàn tất', 400);
    }

    if (bill.status === 'VOIDED') {
      throw new AppError('Không thể cập nhật hóa đơn đã hủy', 400);
    }

    // Cập nhật services nếu có
    if (updateData.services) {
      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      bill.services = updateData.services.map(service => {
        const serviceTotal = service.quantity * service.unitPrice;
        const discountAmount = service.discount || 0;
        const afterDiscount = serviceTotal - discountAmount;
        const taxAmount = afterDiscount * (service.taxRate || bill.taxRate || 0) / 100;

        subtotal += afterDiscount;
        totalDiscount += discountAmount;
        totalTax += taxAmount;

        return {
          ...service,
          discount: discountAmount,
          total: afterDiscount + taxAmount
        };
      });

      bill.subtotal = subtotal;
      bill.totalDiscount = totalDiscount;
      bill.totalTax = totalTax;
      bill.grandTotal = subtotal + totalTax;
      bill.balanceDue = bill.grandTotal - bill.amountPaid;
    }

    // Cập nhật các trường khác
    if (updateData.dueDate) bill.dueDate = updateData.dueDate;
    if (updateData.notes !== undefined) bill.notes = updateData.notes;
    if (updateData.terms !== undefined) bill.terms = updateData.terms;
    if (updateData.insurance) bill.insurance = { ...bill.insurance, ...updateData.insurance };

    bill.updatedBy = updatedBy;
    bill.updatedAt = new Date();

    await bill.save();
    await bill.populate('patientId createdBy');

    return bill;
  }

  /**
   * 🎯 HỦY HÓA ĐƠN
   */
  async voidBill(billId, reason, voidedBy) {
    const bill = await Bill.findById(billId);
    if (!bill) {
      throw new AppError('Không tìm thấy hóa đơn', 404);
    }

    if (bill.status === 'PAID') {
      throw new AppError('Không thể hủy hóa đơn đã thanh toán hoàn tất', 400);
    }

    if (bill.status === 'VOIDED') {
      throw new AppError('Hóa đơn đã được hủy trước đó', 400);
    }

    bill.status = 'VOIDED';
    bill.voidReason = reason;
    bill.voidedBy = voidedBy;
    bill.voidedAt = new Date();
    bill.updatedBy = voidedBy;

    await bill.save();
    return bill;
  }

  /**
   * 🎯 XỬ LÝ THANH TOÁN
   */
  async processPayment(billId, paymentData, processedBy) {
    const bill = await Bill.findById(billId);
    if (!bill) {
      throw new AppError('Không tìm thấy hóa đơn', 404);
    }

    if (bill.status === 'VOIDED') {
      throw new AppError('Không thể thanh toán hóa đơn đã hủy', 400);
    }

    if (bill.status === 'PAID') {
      throw new AppError('Hóa đơn đã được thanh toán hoàn tất', 400);
    }

    const remaining = bill.balanceDue;
    if (paymentData.amount > remaining) {
      throw new AppError(`Số tiền thanh toán (${paymentData.amount}) vượt quá số dư còn lại (${remaining})`, 400);
    }

    const payment = {
      paymentDate: new Date(),
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference || null,
      notes: paymentData.notes || '',
      processedBy,
      status: 'COMPLETED'
    };

    bill.payments.push(payment);
    bill.amountPaid += paymentData.amount;
    bill.balanceDue = bill.grandTotal - bill.amountPaid;

    // Cập nhật trạng thái
    if (bill.balanceDue <= 0) {
      bill.status = 'PAID';
      bill.paidAt = new Date();
    } else {
      bill.status = 'PARTIAL';
    }

    bill.updatedBy = processedBy;
    await bill.save();

    await bill.populate('payments.processedBy', 'personalInfo');
    return bill;
  }

  /**
   * 🎯 LẤY LỊCH SỬ THANH TOÁN CỦA HÓA ĐƠN
   */
  async getPaymentHistory(billId) {
    const bill = await Bill.findById(billId)
      .select('payments billId grandTotal amountPaid balanceDue')
      .populate('payments.processedBy', 'personalInfo');

    if (!bill) {
      throw new AppError('Không tìm thấy hóa đơn', 404);
    }

    return {
      billId: bill.billId,
      totalAmount: bill.grandTotal,
      paidAmount: bill.amountPaid,
      balanceDue: bill.balanceDue,
      payments: bill.payments
    };
  }

  /**
   * 🎯 HOÀN TIỀN THANH TOÁN
   */
  async refundPayment(paymentId, refundData, refundedBy) {
    const bill = await Bill.findOne({ 'payments._id': paymentId });
    if (!bill) {
      throw new AppError('Không tìm thấy thanh toán', 404);
    }

    const payment = bill.payments.id(paymentId);
    if (!payment) {
      throw new AppError('Không tìm thấy thanh toán', 404);
    }

    if (payment.status === 'REFUNDED') {
      throw new AppError('Thanh toán này đã được hoàn tiền trước đó', 400);
    }

    const refundAmount = refundData.amount || payment.amount;

    if (refundAmount > payment.amount) {
      throw new AppError('Số tiền hoàn vượt quá số tiền thanh toán ban đầu', 400);
    }

    // Tạo bản ghi hoàn tiền
    payment.refund = {
      amount: refundAmount,
      reason: refundData.reason,
      notes: refundData.notes || '',
      refundDate: new Date(),
      refundedBy
    };
    payment.status = 'REFUNDED';

    // Cập nhật tổng tiền
    bill.amountPaid -= refundAmount;
    bill.balanceDue = bill.grandTotal - bill.amountPaid;

    // Cập nhật trạng thái hóa đơn
    if (bill.balanceDue >= bill.grandTotal) {
      bill.status = 'ISSUED';
    } else if (bill.balanceDue > 0) {
      bill.status = 'PARTIAL';
    }

    bill.updatedBy = refundedBy;
    await bill.save();

    return {
      billId: bill.billId,
      paymentId,
      refundAmount,
      newBalance: bill.balanceDue,
      billStatus: bill.status
    };
  }

  /**
   * 🎯 LẤY HÓA ĐƠN CỦA BỆNH NHÂN
   */
  async getPatientBills(patientId, filters = {}) {
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      throw new AppError('ID bệnh nhân không hợp lệ', 400);
    }

    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate
    } = filters;

    const query = { patientId };
    if (status) query.status = status;
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [bills, total] = await Promise.all([
      Bill.find(query)
        .sort({ issueDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('billId issueDate dueDate grandTotal amountPaid balanceDue status billType'),
      Bill.countDocuments(query)
    ]);

    return {
      bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 🎯 XÁC MINH BẢO HIỂM
   */
  async verifyInsurance(patientId, insuranceData) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new AppError('Không tìm thấy bệnh nhân', 404);
    }

    patient.insurance = {
      ...patient.insurance,
      ...insuranceData,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      verifiedBy: insuranceData.verifiedBy || null
    };

    await patient.save();
    return patient.insurance;
  }

  /**
   * 🎯 GỬI YÊU CẦU BẢO HIỂM
   */
  async submitInsuranceClaim(billId, claimData, submittedBy) {
    const bill = await Bill.findById(billId);
    if (!bill) {
      throw new AppError('Không tìm thấy hóa đơn', 404);
    }

    if (!bill.insurance || !bill.insurance.policyNumber) {
      throw new AppError('Hóa đơn chưa có thông tin bảo hiểm', 400);
    }

    bill.insurance.claim = {
      ...claimData,
      claimId: `CLAIM-${Date.now()}`,
      status: 'SUBMITTED',
      submittedAt: new Date(),
      submittedBy
    };

    await bill.save();
    return bill.insurance.claim;
  }

  /**
   * 🎯 LẤY HÓA ĐƠN CHƯA THANH TOÁN
   */
  async getOutstandingBills(filters = {}) {
    const { page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const query = {
      status: { $in: ['ISSUED', 'PARTIAL'] },
      balanceDue: { $gt: 0 }
    };

    const [bills, total] = await Promise.all([
      Bill.find(query)
        .populate('patientId', 'personalInfo patientId')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Bill.countDocuments(query)
    ]);

    return {
      bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 🎯 THỐNG KÊ DOANH THU
   */
  async getRevenueStats(filters = {}) {
    const { startDate, endDate, groupBy = 'day' } = filters;

    const match = { status: { $in: ['PAID', 'PARTIAL'] } };
    if (startDate || endDate) {
      match.issueDate = {};
      if (startDate) match.issueDate.$gte = new Date(startDate);
      if (endDate) match.issueDate.$lte = new Date(endDate);
    }

    const groupFormat = groupBy === 'month' ? '%Y-%m' : groupBy === 'day' ? '%Y-%m-%d' : '%Y';

    const stats = await Bill.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$issueDate' } },
          totalRevenue: { $sum: '$amountPaid' },
          totalBills: { $sum: 1 },
          paidBills: { $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalRevenue = stats.reduce((sum, item) => sum + item.totalRevenue, 0);

    return {
      period: { startDate, endDate },
      totalRevenue,
      totalBills: stats.reduce((sum, item) => sum + item.totalBills, 0),
      dailyStats: stats
    };
  }

  /**
   * 🎯 XUẤT HÓA ĐƠN PDF CHI TIẾT
   */
  async generateInvoicePDF(billId) {
    const bill = await this.getBill(billId);

    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Header
    doc.fontSize(20).text('HÓA ĐƠN DỊCH VỤ Y TẾ', { align: 'center' });
    doc.moveDown();

    // Thông tin hóa đơn
    doc.fontSize(12).text(`Số hóa đơn: ${bill.billId}`);
    doc.text(`Ngày lập: ${format(new Date(bill.issueDate), 'dd/MM/yyyy')}`);
    doc.text(`Hạn thanh toán: ${format(new Date(bill.dueDate), 'dd/MM/yyyy')}`);
    doc.moveDown();

    // Thông tin bệnh nhân
    doc.text('THÔNG TIN BỆNH NHÂN', { underline: true });
    doc.text(`Họ tên: ${bill.patientId.personalInfo.firstName} ${bill.patientId.personalInfo.lastName}`);
    doc.text(`Mã BN: ${bill.patientId.patientId}`);
    doc.moveDown();

    // Bảng dịch vụ
    const tableTop = doc.y + 20;
    const tableLeft = 50;

    // Header bảng
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('STT', tableLeft, tableTop);
    doc.text('Dịch vụ', tableLeft + 40, tableTop);
    doc.text('SL', tableLeft + 200, tableTop, { width: 50, align: 'center' });
    doc.text('Đơn giá', tableLeft + 250, tableTop, { width: 80, align: 'right' });
    doc.text('Chiết khấu', tableLeft + 330, tableTop, { width: 80, align: 'right' });
    doc.text('Thành tiền', tableLeft + 410, tableTop, { width: 80, align: 'right' });

    doc.moveTo(tableLeft, tableTop + 15).lineTo(500, tableTop + 15).stroke();

    // Dòng dịch vụ
    let y = tableTop + 30;
    bill.services.forEach((service, i) => {
      doc.font('Helvetica').fontSize(10);
      doc.text(i + 1, tableLeft, y);
      doc.text(service.serviceName, tableLeft + 40, y, { width: 150 });
      doc.text(service.quantity, tableLeft + 200, y, { width: 50, align: 'center' });
      doc.text(service.unitPrice.toLocaleString('vi-VN'), tableLeft + 250, y, { width: 80, align: 'right' });
      doc.text(service.discount.toLocaleString('vi-VN'), tableLeft + 330, y, { width: 80, align: 'right' });
      doc.text(service.total.toLocaleString('vi-VN'), tableLeft + 410, y, { width: 80, align: 'right' });
      y += 20;
    });

    // Tổng cộng
    y += 20;
    doc.font('Helvetica-Bold');
    doc.text('Tổng cộng:', tableLeft + 300, y);
    doc.text(bill.grandTotal.toLocaleString('vi-VN') + ' VND', tableLeft + 410, y, { width: 80, align: 'right' });

    doc.end();

    return Buffer.concat(buffers);
  }

  /**
   * 🎯 XUẤT BIÊN LAI THANH TOÁN PDF
   */
  async generateReceiptPDF(paymentId) {
    const bill = await Bill.findOne({ 'payments._id': paymentId });
    if (!bill) throw new AppError('Không tìm thấy thanh toán', 404);

    const payment = bill.payments.id(paymentId);

    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    doc.fontSize(20).text('BIÊN LAI THU TIỀN', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Số biên lai: BL${payment._id.toString().slice(-8).toUpperCase()}`);
    doc.text(`Ngày thu: ${format(new Date(payment.paymentDate), 'dd/MM/yyyy HH:mm')}`);
    doc.text(`Hóa đơn: ${bill.billId}`);
    doc.moveDown();

    doc.text(`Số tiền thanh toán: ${payment.amount.toLocaleString('vi-VN')} VND`);
    doc.text(`Phương thức: ${payment.method}`);
    if (payment.reference) doc.text(`Tham chiếu: ${payment.reference}`);
    if (payment.notes) doc.text(`Ghi chú: ${payment.notes}`);

    doc.end();

    return Buffer.concat(buffers);
  }
}

module.exports = new BillingService();