// src/services/medication.service.js
const Medication = require('../models/medication.model');
const { generateMedicalCode } = require('../utils/healthcare.utils');
const { AppError } = require('../middlewares/error.middleware');
const ExcelJS = require('exceljs');

class MedicationService {
  async getMedications(filters = {}) {
    const { page = 1, limit = 20, category, status, search } = filters;
    const skip = (page - 1) * limit;

    const query = { status: { $ne: 'DELETED' } };
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { genericName: new RegExp(search, 'i') },
        { medicationId: new RegExp(search, 'i') }
      ];
    }

    const [items, total] = await Promise.all([
      Medication.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Medication.countDocuments(query)
    ]);

    // Map data to match frontend expectations
    const mappedItems = items.map(item => {
      const doc = item.toObject ? item.toObject() : item;
      return {
        ...doc,
        // Map nested fields to flat fields for frontend compatibility
        quantity: doc.stock?.current || 0,
        minimumStock: doc.stock?.minimum || 10,
        maximumStock: doc.stock?.maximum || 1000,
        unit: doc.stock?.unit || 'units',
        code: doc.medicationId,
        price: doc.pricing?.costPrice || 0,
        sellingPrice: doc.pricing?.sellingPrice || 0,
        costPrice: doc.pricing?.costPrice || 0,
        expiryDate: doc.expiryDate || null
      };
    });

    const lowStockCount = await Medication.countDocuments({
      ...query,
      $expr: { $lte: ["$stock.current", "$stock.reorderLevel"] }
    });

    return {
      items: mappedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: { lowStockCount }
    };
  }

  async searchMedications(query, filters = {}) {
    if (!query || query.trim().length < 2) return [];

    const regex = new RegExp(query.trim(), 'i');
    return await Medication.find({
      $or: [
        { name: regex },
        { genericName: regex },
        { brandName: regex },
        { medicationId: regex }
      ],
      status: 'ACTIVE',
      ...filters
    })
      .select('medicationId name genericName brandName stock unit form')
      .limit(15);
  }

  async getMedicationById(id) {
    const medication = await Medication.findOne({
      $or: [{ _id: id }, { medicationId: id }]
    });

    if (!medication) throw new AppError('Không tìm thấy thuốc', 404);
    
    // Map data to match frontend expectations
    const doc = medication.toObject ? medication.toObject() : medication;
    return {
      ...doc,
      quantity: doc.stock?.current || 0,
      minimumStock: doc.stock?.minimum || 10,
      maximumStock: doc.stock?.maximum || 1000,
      unit: doc.stock?.unit || 'units',
      code: doc.medicationId,
      price: doc.pricing?.costPrice || 0,
      sellingPrice: doc.pricing?.sellingPrice || 0,
      costPrice: doc.pricing?.costPrice || 0,
      expiryDate: doc.expiryDate || null
    };
  }

  async createMedication(data, createdBy) {
    const medicationId = data.medicationId || `MED${generateMedicalCode(6)}`;

    const existing = await Medication.findOne({ medicationId });
    if (existing) throw new AppError('Mã thuốc đã tồn tại', 400);

    const medication = await Medication.create({
      medicationId,
      ...data,
      createdBy
    });

    return medication;
  }

  async updateMedication(id, data, updatedBy) {
    const medication = await this.getMedicationById(id);

    Object.assign(medication, data);
    medication.lastModifiedBy = updatedBy;
    await medication.save();

    return medication;
  }

  async adjustStock(id, quantity, reason, adjustedBy) {
    const medication = await Medication.findOne({
      $or: [{ _id: id }, { medicationId: id }]
    });
    
    if (!medication) throw new AppError('Không tìm thấy thuốc', 404);

    medication.stock.current += quantity;
    medication.stock.history = medication.stock.history || [];
    medication.stock.history.push({
      type: quantity > 0 ? 'ADJUST_IN' : 'ADJUST_OUT',
      quantity: Math.abs(quantity),
      reason,
      adjustedBy,
      date: new Date()
    });

    await medication.save();
    
    // Return mapped data
    const doc = medication.toObject ? medication.toObject() : medication;
    return {
      ...doc,
      quantity: doc.stock?.current || 0,
      minimumStock: doc.stock?.minimum || 10,
      maximumStock: doc.stock?.maximum || 1000,
      unit: doc.stock?.unit || 'units',
      code: doc.medicationId,
      price: doc.pricing?.costPrice || 0,
      sellingPrice: doc.pricing?.sellingPrice || 0,
      costPrice: doc.pricing?.costPrice || 0,
      expiryDate: doc.expiryDate || null
    };
  }

  async restockMedication(id, batchData, restockedBy) {
    const medication = await this.getMedicationById(id);

    medication.stock.current += batchData.quantity;
    medication.stock.batches.push({
      batchNumber: batchData.batchNumber,
      expiryDate: batchData.expiryDate,
      quantity: batchData.quantity,
      supplier: batchData.supplier
    });

    medication.stock.lastRestocked = new Date();
    medication.stock.history.push({
      type: 'RESTOCK',
      quantity: batchData.quantity,
      batchNumber: batchData.batchNumber,
      adjustedBy: restockedBy
    });

    await medication.save();
    return medication;
  }

  async writeOffMedication(id, quantity, reason, writtenOffBy) {
    const medication = await this.getMedicationById(id);

    if (medication.stock.current < quantity) {
      throw new AppError('Số lượng xuất hủy vượt quá tồn kho', 400);
    }

    medication.stock.current -= quantity;
    medication.stock.history.push({
      type: 'WRITEOFF',
      quantity,
      reason,
      adjustedBy: writtenOffBy
    });

    await medication.save();
    return medication;
  }

  async getLowStockAlerts() {
    return await Medication.find({
      status: 'ACTIVE',
      'stock.current': { $lte: { $expr: '$stock.reorderLevel' } }
    }).sort({ 'stock.current': 1 });
  }

  async getExpiringMedications(days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return await Medication.find({
      status: 'ACTIVE',
      'stock.batches.expiryDate': { $lte: cutoff }
    });
  }

  async getRecalledMedications() {
    return await Medication.find({ status: 'RECALLED' });
  }

  async getInventoryValue() {
    const result = await Medication.aggregate([
      { $match: { status: 'ACTIVE' } },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ['$stock.current', '$pricing.sellingPrice'] }
          },
          totalItems: { $sum: '$stock.current' }
        }
      }
    ]);

    return result[0] || { totalValue: 0, totalItems: 0 };
  }

  async getMedicationUsageStats(filters = {}) {
    // Implement based on dispense history from prescriptions
    // Placeholder
    return { topUsed: [], monthlyUsage: [] };
  }

  async exportInventoryExcel(filters = {}) {
    const medications = await this.getMedications({ ...filters, limit: 10000 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tồn kho thuốc');

    sheet.columns = [
      { header: 'Mã thuốc', key: 'medicationId', width: 15 },
      { header: 'Tên thuốc', key: 'name', width: 30 },
      { header: 'Tên generic', key: 'genericName', width: 25 },
      { header: 'Dạng bào chế', key: 'form', width: 15 },
      { header: 'Hàm lượng', key: 'strength', width: 15 },
      { header: 'Tồn hiện tại', key: 'currentStock', width: 12 },
      { header: 'Đơn vị', key: 'unit', width: 10 },
      { header: 'Giá bán', key: 'sellingPrice', width: 15 },
      { header: 'Tổng giá trị', key: 'totalValue', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 12 }
    ];

    medications.items.forEach(med => {
      sheet.addRow({
        medicationId: med.medicationId,
        name: med.name,
        genericName: med.genericName,
        form: med.form,
        strength: med.strength ? `${med.strength.value}${med.strength.unit}` : '',
        currentStock: med.stock.current,
        unit: med.stock.unit,
        sellingPrice: med.pricing?.sellingPrice || 0,
        totalValue: med.stock.current * (med.pricing?.sellingPrice || 0),
        status: med.stock.current <= med.stock.reorderLevel ? 'Cảnh báo hết' : 'Bình thường'
      });
    });

    return await workbook.xlsx.writeBuffer();
  }
}

module.exports = new MedicationService();