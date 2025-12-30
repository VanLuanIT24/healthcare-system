// controllers/inventory.controller.js
const inventoryService = require('../services/inventory.service');
const { asyncHandler } = require('../middlewares/error.middleware');
const { manualAuditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class InventoryController {
  // Lấy danh sách vật tư
  getItems = asyncHandler(async (req, res) => {
    const params = req.query;
    const items = await inventoryService.getItems(params);
    res.json({
      success: true,
      data: items
    });
  });

  // Lấy vật tư theo ID
  getItemById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await inventoryService.getItemById(id);
    await manualAuditLog({
      action: AUDIT_ACTIONS.INVENTORY_VIEW,
      user: req.user,
      metadata: { itemId: id }
    });
    res.json({
      success: true,
      data: item
    });
  });

  // Tìm kiếm vật tư
  searchItems = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const params = req.query;
    const items = await inventoryService.searchItems(q, params);
    res.json({
      success: true,
      data: items
    });
  });

  // Tạo vật tư mới
  createItem = asyncHandler(async (req, res) => {
    const data = req.body;
    const createdBy = req.user._id;
    const item = await inventoryService.createItem(data, createdBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.INVENTORY_CREATE,
      user: req.user,
      metadata: { itemId: item._id }
    });
    res.status(201).json({
      success: true,
      message: 'Tạo vật tư thành công',
      data: item
    });
  });

  // Cập nhật vật tư
  updateItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const updatedBy = req.user._id;
    const item = await inventoryService.updateItem(id, data, updatedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.INVENTORY_UPDATE,
      user: req.user,
      metadata: { itemId: id }
    });
    res.json({
      success: true,
      message: 'Cập nhật vật tư thành công',
      data: item
    });
  });

  // Điều chỉnh tồn kho
  adjustStock = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const data = req.body;
    const performedBy = req.user._id;
    const item = await inventoryService.adjustStock(itemId, data, performedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.INVENTORY_ADJUST,
      user: req.user,
      metadata: { itemId, quantity: data.quantity }
    });
    res.json({
      success: true,
      message: 'Điều chỉnh tồn kho thành công',
      data: item
    });
  });

  // Nhập kho
  receiveStock = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const data = req.body;
    const performedBy = req.user._id;
    const item = await inventoryService.receiveStock(itemId, data, performedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.INVENTORY_RECEIVE,
      user: req.user,
      metadata: { itemId, quantity: data.quantity }
    });
    res.json({
      success: true,
      message: 'Nhập kho thành công',
      data: item
    });
  });

  // Xuất kho
  issueStock = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const data = req.body;
    const performedBy = req.user._id;
    const item = await inventoryService.issueStock(itemId, data, performedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.INVENTORY_ISSUE,
      user: req.user,
      metadata: { itemId, quantity: data.quantity }
    });
    res.json({
      success: true,
      message: 'Xuất kho thành công',
      data: item
    });
  });

  // Lấy cảnh báo tồn kho thấp
  getLowStockAlerts = asyncHandler(async (req, res) => {
    const alerts = await inventoryService.getLowStockAlerts();
    res.json({
      success: true,
      data: alerts
    });
  });

  // Lấy cảnh báo hết hạn
  getExpiringAlerts = asyncHandler(async (req, res) => {
    const { days } = req.query;
    const alerts = await inventoryService.getExpiringAlerts(days);
    res.json({
      success: true,
      data: alerts
    });
  });

  // Lấy giá trị tồn kho
  getInventoryValue = asyncHandler(async (req, res) => {
    const value = await inventoryService.getInventoryValue();
    res.json({
      success: true,
      data: value
    });
  });

  // Lấy thống kê sử dụng
  getUsageStats = asyncHandler(async (req, res) => {
    const params = req.query;
    const stats = await inventoryService.getUsageStats(params);
    res.json({
      success: true,
      data: stats
    });
  });

  // Xuất Excel tồn kho
  exportInventoryExcel = asyncHandler(async (req, res) => {
    const buffer = await inventoryService.exportInventoryExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory.xlsx');
    res.send(buffer);
  });
}

module.exports = new InventoryController();