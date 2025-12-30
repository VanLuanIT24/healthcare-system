// services/inventory.service.js
const InventoryItem = require('../models/inventoryItem.model');
const { AppError } = require('../middlewares/error.middleware');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');

class InventoryService {
  // Lấy danh sách vật tư với filter và phân trang
  async getItems(params) {
    const { page = 1, limit = 20, category, minQuantity, maxQuantity } = params;
    const query = {};
    if (category) query.category = category;
    if (minQuantity) query.currentQuantity = { $gte: parseInt(minQuantity) };
    if (maxQuantity) query.currentQuantity.$lte = parseInt(maxQuantity);

    const items = await InventoryItem.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 });

    const total = await InventoryItem.countDocuments(query);

    return { items, total, page, limit };
  }

  // Lấy vật tư theo ID
  async getItemById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID vật tư không hợp lệ', 400);
    }
    const item = await InventoryItem.findById(id).populate('logs.createdBy', 'personalInfo');
    if (!item) {
      throw new AppError('Không tìm thấy vật tư', 404);
    }
    return item;
  }

  // Tìm kiếm vật tư
  async searchItems(query, params) {
    const { page = 1, limit = 20 } = params;
    const searchQuery = { $text: { $search: query } };

    const items = await InventoryItem.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ score: { $meta: 'textScore' } });

    const total = await InventoryItem.countDocuments(searchQuery);

    return { items, total, page, limit };
  }

  // Tạo vật tư mới
  async createItem(data, createdBy) {
    const item = new InventoryItem({
      ...data,
      createdBy
    });
    await item.save();
    return item;
  }

  // Cập nhật vật tư
  async updateItem(id, data, updatedBy) {
    const item = await this.getItemById(id);
    Object.assign(item, data);
    item.updatedBy = updatedBy;
    await item.save();
    return item;
  }

  // Điều chỉnh tồn kho
  async adjustStock(itemId, data, performedBy) {
    const item = await this.getItemById(itemId);
    const newQuantity = item.currentQuantity + data.quantity;
    if (newQuantity < 0) {
      throw new AppError('Tồn kho không thể âm', 400);
    }
    item.currentQuantity = newQuantity;
    item.logs.push({
      type: 'ADJUST',
      quantity: data.quantity,
      reason: data.reason,
      performedBy
    });
    item.updatedBy = performedBy;
    await item.save();
    return item;
  }

  // Nhập kho
  async receiveStock(itemId, data, performedBy) {
    const item = await this.getItemById(itemId);
    item.currentQuantity += data.quantity;
    item.logs.push({
      type: 'RECEIVE',
      quantity: data.quantity,
      batch: data.batch,
      supplier: data.supplier,
      performedBy
    });
    item.updatedBy = performedBy;
    await item.save();
    return item;
  }

  // Xuất kho
  async issueStock(itemId, data, performedBy) {
    const item = await this.getItemById(itemId);
    if (item.currentQuantity < data.quantity) {
      throw new AppError('Không đủ tồn kho', 400);
    }
    item.currentQuantity -= data.quantity;
    item.logs.push({
      type: 'ISSUE',
      quantity: -data.quantity,
      department: data.department,
      performedBy
    });
    item.updatedBy = performedBy;
    await item.save();
    return item;
  }

  // Lấy cảnh báo tồn kho thấp
  async getLowStockAlerts() {
    return await InventoryItem.find({ currentQuantity: { $lte: 10 } }).sort({ currentQuantity: 1 });
  }

  // Lấy cảnh báo hết hạn
  async getExpiringAlerts(days = 30) {
    const date = new Date();
    date.setDate(date.getDate() + parseInt(days));
    return await InventoryItem.find({ expirationDate: { $lte: date } }).sort({ expirationDate: 1 });
  }

  // Lấy giá trị tồn kho
  async getInventoryValue() {
    const aggregate = await InventoryItem.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$currentQuantity', '$unitPrice'] } }
        }
      }
    ]);
    return aggregate[0]?.totalValue || 0;
  }

  // Lấy thống kê sử dụng
  async getUsageStats(params) {
    const { startDate, endDate } = params;
    const match = {};
    if (startDate) match.createdAt = { $gte: new Date(startDate) };
    if (endDate) match.createdAt.$lte = new Date(endDate);

    const stats = await InventoryItem.aggregate([
      { $unwind: '$logs' },
      { $match: match },
      {
        $group: {
          _id: '$logs.type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$logs.quantity' }
        }
      }
    ]);

    return stats;
  }

  // Xuất Excel tồn kho
  async exportInventoryExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Inventory');

    sheet.addRow(['ID', 'Name', 'SKU', 'Quantity', 'Unit Price', 'Total Value']);

    const items = await InventoryItem.find({});
    items.forEach(item => {
      sheet.addRow([item._id, item.name, item.sku, item.currentQuantity, item.unitPrice, item.currentQuantity * item.unitPrice]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

module.exports = new InventoryService();