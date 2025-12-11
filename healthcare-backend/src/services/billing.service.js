// src/services/billing.service.js
const Bill = require('../models/bill.model');
const Patient = require('../models/patient.model');
const { AppError } = require('../middlewares/error.middleware');

class BillingService {
  /**
   * 🎯 TẠO HÓA ĐƠN MỚI
   */
  async createBill(patientId, billData, createdBy) {
    try {
      // Kiểm tra bệnh nhân tồn tại và populate thông tin user
      const patient = await Patient.findById(patientId).populate('userId', 'personalInfo email');
      
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, 'PATIENT_NOT_FOUND');
      }

      // Tạo mã hóa đơn tự động
      const billCount = await Bill.countDocuments();
      const billId = `HD${String(billCount + 1).padStart(6, '0')}`;

      // Chuyển đổi items thành services format của model
      const services = (billData.items || []).map(item => ({
        serviceName: item.description,
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        discount: 0,
        taxRate: billData.taxRate || 0,
        total: (item.quantity || 1) * item.unitPrice
      }));

      // Tính toán các trường theo model
      const subtotal = services.reduce((sum, service) => sum + service.total, 0);
      const totalTax = subtotal * (billData.taxRate || 0) / 100;
      const grandTotal = subtotal + totalTax;
      const balanceDue = grandTotal; // Chưa thanh toán gì

      const bill = new Bill({
        billId,
        patientId,
        billType: (billData.items && billData.items[0] && billData.items[0].category) || 'OTHER',
        services,
        subtotal,
        totalTax,
        grandTotal,
        balanceDue,
        status: 'ISSUED',
        dueDate: billData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy,
        notes: billData.notes
      });

      return await bill.save();
    } catch (error) {
      console.error('❌ [BILLING SERVICE] Create bill error:', error);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN HÓA ĐƠN
   */
  async getBill(billId, userId, userRole) {
    try {
      const bill = await Bill.findById(billId)
        .populate('patientId', 'personalInfo patientId');

      if (!bill) {
        throw new AppError('Không tìm thấy hóa đơn', 404, 'BILL_NOT_FOUND');
      }

      // Kiểm tra quyền truy cập
      if (userRole === 'PATIENT' && bill.patientId._id.toString() !== userId) {
        throw new AppError('Bạn chỉ được xem hóa đơn của chính mình', 403, 'ACCESS_DENIED');
      }

      return bill;
    } catch (error) {
      console.error('❌ [BILLING SERVICE] Get bill error:', error);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT HÓA ĐƠN
   */
  async updateBill(billId, updateData, updatedBy) {
    try {
      const bill = await Bill.findById(billId);
      if (!bill) {
        throw new AppError('Không tìm thấy hóa đơn', 404, 'BILL_NOT_FOUND');
      }

      // Kiểm tra trạng thái hóa đơn
      if (bill.status === 'PAID') {
        throw new AppError('Không thể cập nhật hóa đơn đã thanh toán', 400, 'BILL_ALREADY_PAID');
      }

      if (bill.status === 'VOIDED') {
        throw new AppError('Không thể cập nhật hóa đơn đã hủy', 400, 'BILL_VOIDED');
      }

      // Cập nhật thông tin
      if (updateData.items) {
        bill.items = updateData.items;
        bill.totalAmount = this.calculateTotalAmount(updateData.items);
        bill.taxAmount = this.calculateTax(bill.totalAmount, bill.taxRate);
        bill.finalAmount = bill.totalAmount + bill.taxAmount;
      }

      if (updateData.taxRate !== undefined) {
        bill.taxRate = updateData.taxRate;
        bill.taxAmount = this.calculateTax(bill.totalAmount, bill.taxRate);
        bill.finalAmount = bill.totalAmount + bill.taxAmount;
      }

      if (updateData.dueDate) {
        bill.dueDate = updateData.dueDate;
      }

      if (updateData.notes !== undefined) {
        bill.notes = updateData.notes;
      }

      bill.updatedBy = updatedBy;
      bill.updatedAt = new Date();

      return await bill.save();
    } catch (error) {
      console.error('❌ [BILLING SERVICE] Update bill error:', error);
      throw error;
    }
  }

  /**
   * 🎯 LẤY DANH SÁCH HÓA ĐƠN CỦA BỆNH NHÂN
   */
  async getPatientBills(patientId, userId, userRole, filters = {}) {
    try {
      // Kiểm tra bệnh nhân tồn tại
      const patient = await Patient.findById(patientId);
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, 'PATIENT_NOT_FOUND');
      }

      // Kiểm tra quyền truy cập
      if (userRole === 'PATIENT' && patientId !== userId) {
        throw new AppError('Bạn chỉ được xem hóa đơn của chính mình', 403, 'ACCESS_DENIED');
      }

      // Xây dựng query
      const query = { patientId };
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const skip = (page - 1) * limit;

      // Manual pagination
      const [bills, totalDocs] = await Promise.all([
        Bill.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('createdBy', 'name email'),
        Bill.countDocuments(query)
      ]);

      return {
        docs: bills,
        totalDocs,
        limit,
        page,
        totalPages: Math.ceil(totalDocs / limit),
        hasNextPage: page < Math.ceil(totalDocs / limit),
        hasPrevPage: page > 1
      };
    } catch (error) {
      console.error('❌ [BILLING SERVICE] Get patient bills error:', error);
      throw error;
    }
  }

  /**
   * 🎯 XỬ LÝ THANH TOÁN
   */
  async processPayment(billId, paymentData, processedBy) {
    try {
      const bill = await Bill.findById(billId);
      if (!bill) {
        throw new AppError('Không tìm thấy hóa đơn', 404, 'BILL_NOT_FOUND');
      }

      // Kiểm tra trạng thái hóa đơn
      if (bill.status === 'PAID') {
        throw new AppError('Hóa đơn đã được thanh toán', 400, 'BILL_ALREADY_PAID');
      }

      if (bill.status === 'VOIDED') {
        throw new AppError('Không thể thanh toán hóa đơn đã hủy', 400, 'BILL_VOIDED');
      }

      // Kiểm tra số tiền thanh toán
      const remainingAmount = bill.finalAmount - bill.paidAmount;
      if (paymentData.amount > remainingAmount) {
        throw new AppError('Số tiền thanh toán vượt quá số tiền còn nợ', 400, 'PAYMENT_AMOUNT_EXCEEDED');
      }

      // Tạo giao dịch thanh toán
      const payment = {
        paymentDate: new Date(),
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber,
        notes: paymentData.notes,
        processedBy
      };

      bill.payments.push(payment);
      bill.paidAmount += paymentData.amount;

      // Cập nhật trạng thái hóa đơn
      if (bill.paidAmount >= bill.finalAmount) {
        bill.status = 'PAID';
        bill.paidAt = new Date();
      } else if (bill.paidAmount > 0) {
        bill.status = 'PARTIAL';
      }

      bill.updatedBy = processedBy;
      bill.updatedAt = new Date();

      return await bill.save();
    } catch (error) {
      console.error('❌ [BILLING SERVICE] Process payment error:', error);
      throw error;
    }
  }

  /**
   * 🎯 LẤY LỊCH SỬ THANH TOÁN
   */
  async getPaymentHistory(patientId, userId, userRole, filters = {}) {
    try {
      // Kiểm tra bệnh nhân tồn tại
      const patient = await Patient.findById(patientId);
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, 'PATIENT_NOT_FOUND');
      }

      // Kiểm tra quyền truy cập
      if (userRole === 'PATIENT' && patientId !== userId) {
        throw new AppError('Bạn chỉ được xem lịch sử thanh toán của chính mình', 403, 'ACCESS_DENIED');
      }

      // Xây dựng query
      const paymentQuery = { 
        patientId,
        'payments.0': { $exists: true }
      };

      if (filters.startDate || filters.endDate) {
        paymentQuery['payments.paymentDate'] = {};
        if (filters.startDate) {
          paymentQuery['payments.paymentDate'].$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          paymentQuery['payments.paymentDate'].$lte = new Date(filters.endDate);
        }
      }

      const bills = await Bill.find(paymentQuery)
        .select('billNumber payments patientInfo finalAmount paidAmount status createdAt')
        .sort({ 'payments.paymentDate': -1 })
        .lean();

      // Xử lý dữ liệu payments
      let allPayments = [];
      bills.forEach(bill => {
        bill.payments.forEach(payment => {
          allPayments.push({
            billNumber: bill.billNumber,
            billId: bill._id,
            patientInfo: bill.patientInfo,
            paymentDate: payment.paymentDate,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            referenceNumber: payment.referenceNumber,
            totalAmount: bill.finalAmount,
            paidAmount: bill.paidAmount,
            status: bill.status,
            billCreatedAt: bill.createdAt
          });
        });
      });

      // Lọc theo payment method nếu có
      if (filters.paymentMethod) {
        allPayments = allPayments.filter(
          payment => payment.paymentMethod === filters.paymentMethod
        );
      }

      // Phân trang
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);

      return {
        payments: allPayments.slice(startIndex, endIndex),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(allPayments.length / limit),
          totalPayments: allPayments.length,
          hasNext: endIndex < allPayments.length,
          hasPrev: startIndex > 0
        }
      };
    } catch (error) {
      console.error('❌ [BILLING SERVICE] Get payment history error:', error);
      throw error;
    }
  }

  /**
   * 🎯 HỦY HÓA ĐƠN
   */
  async voidBill(billId, reason, voidedBy) {
    try {
      const bill = await Bill.findById(billId);
      if (!bill) {
        throw new AppError('Không tìm thấy hóa đơn', 404, 'BILL_NOT_FOUND');
      }

      // Kiểm tra trạng thái hóa đơn
      if (bill.status === 'PAID') {
        throw new AppError('Không thể hủy hóa đơn đã thanh toán', 400, 'BILL_ALREADY_PAID');
      }

      if (bill.status === 'VOIDED') {
        throw new AppError('Hóa đơn đã được hủy trước đó', 400, 'BILL_ALREADY_VOIDED');
      }

      // Hủy hóa đơn
      bill.status = 'VOIDED';
      bill.voidReason = reason.trim();
      bill.voidedBy = voidedBy;
      bill.voidedAt = new Date();
      bill.updatedBy = voidedBy;
      bill.updatedAt = new Date();

      return await bill.save();
    } catch (error) {
      console.error('❌ [BILLING SERVICE] Void bill error:', error);
      throw error;
    }
  }

  /**
   * 🎯 TÍNH TỔNG TIỀN
   */
  calculateTotalAmount(items) {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  }

  /**
   * 🎯 TÍNH THUẾ
   */
  calculateTax(amount, taxRate = 0) {
    return amount * (taxRate / 100);
  }

  /**
   * 🎯 LẤY THỐNG KÊ DOANH THU
   */
  async getRevenueStats(timeRange = 'month') {
    try {
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const stats = await Bill.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $in: ['PAID', 'PARTIAL'] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$paidAmount' },
            totalBills: { $sum: 1 },
            averageBillAmount: { $avg: '$finalAmount' }
          }
        }
      ]);

      return stats[0] || { totalRevenue: 0, totalBills: 0, averageBillAmount: 0 };
    } catch (error) {
      console.error('❌ [BILLING SERVICE] Get revenue stats error:', error);
      throw error;
    }
  }

  /**
   * 🎯 LẤY TẤT CẢ HÓA ĐƠN
   */
  async getAllBills(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 10,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const filter = {};

      if (status) {
        filter.status = status;
      }

      const bills = await Bill.find(filter)
        .populate('patientId', 'personalInfo patientId')
        .populate('createdBy', 'personalInfo email')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit);

      const total = await Bill.countDocuments(filter);

      return {
        bills,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ [BILLING SERVICE] Get all bills error:', error);
      throw error;
    }
  }

  /**
   * 🎯 HỒI TIỀN
   */
  async refundPayment(paymentId, refundData, userId) {
    try {
      const Bill = require('../models/bill.model');
      
      // Tìm hóa đơn có payment này
      const bill = await Bill.findOne({ 
        'payments._id': paymentId 
      });

      if (!bill) {
        throw new AppError('Không tìm thấy thanh toán', 404, 'PAYMENT_NOT_FOUND');
      }

      // Tìm payment
      const payment = bill.payments.id(paymentId);
      if (!payment) {
        throw new AppError('Không tìm thấy thanh toán', 404, 'PAYMENT_NOT_FOUND');
      }

      // Kiểm tra có thể hoàn tiền
      if (payment.status === 'REFUNDED') {
        throw new AppError('Thanh toán này đã được hoàn tiền', 400, 'PAYMENT_ALREADY_REFUNDED');
      }

      // Tạo refund
      const refund = {
        _id: require('mongoose').Types.ObjectId(),
        amount: refundData.amount || payment.amount,
        reason: refundData.reason || 'Customer request',
        refundDate: new Date(),
        refundedBy: userId,
        status: 'COMPLETED'
      };

      // Cập nhật payment
      payment.status = 'REFUNDED';
      payment.refund = refund;

      // Tính toán lại balanceDue
      const totalPaid = bill.payments
        .filter(p => p.status !== 'REFUNDED')
        .reduce((sum, p) => sum + p.amount, 0);

      bill.balanceDue = bill.grandTotal - totalPaid + refund.amount;
      if (bill.balanceDue === 0) {
        bill.status = 'PAID';
      } else if (bill.balanceDue < bill.grandTotal && bill.balanceDue > 0) {
        bill.status = 'PARTIAL';
      }

      await bill.save();

      return {
        paymentId,
        refund,
        newBalance: bill.balanceDue
      };
    } catch (error) {
      console.error('❌ [BILLING SERVICE] Refund payment error:', error);
      throw error;
    }
  }

  /**
   * 🎯 LẤY CÁC HÓA ĐƠN CHƯA THANH TOÁN
   */
  async getOutstandingBills(options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const bills = await Bill.find({
        status: { $in: ['ISSUED', 'PARTIAL'] },
        balanceDue: { $gt: 0 }
      })
        .populate('patientId', 'personalInfo patientId')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit);

      const total = await Bill.countDocuments({
        status: { $in: ['ISSUED', 'PARTIAL'] },
        balanceDue: { $gt: 0 }
      });

      return {
        bills,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ [BILLING SERVICE] Get outstanding bills error:', error);
      throw error;
    }
  }
}

module.exports = new BillingService();