// src/routes/services.routes.js - Phiên bản CHUYÊN NGHIỆP, ĐẦY ĐỦ 2025
// Sử dụng model Service thật từ database thay vì hardcode
// Hỗ trợ filter, search, phân trang, sort

const express = require('express');
const router = express.Router();
const Service = require('../models/service.model');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/rbac.middleware');
const { PERMISSIONS } = require('../constants/roles');
const { asyncHandler } = require('../middlewares/error.middleware');
const { manualAuditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

/**
 * 🏥 SERVICES ROUTES
 * Quản lý danh mục dịch vụ y tế (dùng cho tạo hóa đơn, khám bệnh, lab, imaging...)
 * 
 * Quyền truy cập:
 * - BILLING_STAFF: cần để tạo hóa đơn
 * - RECEPTIONIST: cần để đăng ký khám
 * - DOCTOR / NURSE: cần để chỉ định dịch vụ
 * - HOSPITAL_ADMIN: quản lý danh mục
 */

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

/**
 * GET /api/services
 * Lấy danh sách dịch vụ y tế
 * 
 * Query params:
 * - category: EXAMINATION | LAB | IMAGING | PROCEDURE | TEST | OTHER
 * - search: tìm theo tên, code, description
 * - page: phân trang (default 1)
 * - limit: số lượng mỗi trang (default 50, max 100)
 * - sortBy: name | price | code | createdAt (default name)
 * - sortOrder: asc | desc (default asc)
 */
router.get(
  '/',
  requirePermission(PERMISSIONS['BILL_VIEW']), // Hoặc mở rộng cho DOCTOR, NURSE nếu cần
  asyncHandler(async (req, res) => {
    const {
      category,
      search,
      page = 1,
      limit = 50,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Xây dựng query
    const query = { isActive: true };

    if (category) {
      query.category = category.toUpperCase();
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { description: searchRegex }
      ];
    }

    // Phân trang & sort
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    const validSortFields = ['name', 'code', 'price', 'createdAt', 'category'];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.name = 1; // default
    }

    // Query database
    const [services, total] = await Promise.all([
      Service.find(query)
        .select('code name price category unit description')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Service.countDocuments(query)
    ]);

    await manualAuditLog({
      action: AUDIT_ACTIONS.SERVICE_VIEW,
      user: req.user,
      metadata: { 
        filters: { category, search, page, limit },
        resultCount: services.length
      }
    });

    res.json({
      success: true,
      data: services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    });
  })
);

/**
 * GET /api/services/categories
 * Lấy danh sách các category dịch vụ có sẵn (dùng cho filter dropdown)
 */
router.get(
  '/categories',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  asyncHandler(async (req, res) => {
    const categories = await Service.distinct('category', { isActive: true });

    const categoryLabels = {
      EXAMINATION: 'Khám bệnh',
      LAB: 'Xét nghiệm',
      IMAGING: 'Chẩn đoán hình ảnh',
      PROCEDURE: 'Thủ thuật',
      TEST: 'Chức năng',
      OTHER: 'Khác'
    };

    const formatted = categories.map(cat => ({
      value: cat,
      label: categoryLabels[cat] || cat
    }));

    res.json({
      success: true,
      data: formatted.sort((a, b) => a.label.localeCompare(b.label))
    });
  })
);

/**
 * GET /api/services/:id
 * Lấy chi tiết một dịch vụ theo ID
 */
router.get(
  '/:id',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    let service;
    if (mongoose.Types.ObjectId.isValid(id)) {
      service = await Service.findById(id);
    } else {
      // Hỗ trợ tìm theo code (thường dùng hơn)
      service = await Service.findOne({ code: id.toUpperCase(), isActive: true });
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ'
      });
    }

    await manualAuditLog({
      action: AUDIT_ACTIONS.SERVICE_VIEW,
      user: req.user,
      metadata: { serviceId: service._id, code: service.code }
    });

    res.json({
      success: true,
      data: service
    });
  })
);

/**
 * POST /api/services
 * Tạo dịch vụ mới (chỉ admin)
 */
router.post(
  '/',
  requirePermission(PERMISSIONS['SERVICE_MANAGE']), // Tạo permission mới nếu cần
  asyncHandler(async (req, res) => {
    const data = req.body;

    // Validate required fields
    if (!data.code || !data.name || !data.price || !data.category) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: code, name, price, category'
      });
    }

    // Check duplicate code
    const existing = await Service.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Mã dịch vụ đã tồn tại'
      });
    }

    const service = new Service({
      ...data,
      code: data.code.toUpperCase(),
      createdBy: req.user._id
    });

    await service.save();

    await manualAuditLog({
      action: AUDIT_ACTIONS.SERVICE_CREATE,
      user: req.user,
      metadata: { serviceId: service._id, code: service.code }
    });

    res.status(201).json({
      success: true,
      message: 'Tạo dịch vụ thành công',
      data: service
    });
  })
);

/**
 * PUT /api/services/:id
 * Cập nhật dịch vụ (chỉ admin)
 */
router.put(
  '/:id',
  requirePermission(PERMISSIONS['SERVICE_MANAGE']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ'
      });
    }

    // Không cho phép đổi code
    if (data.code && data.code !== service.code) {
      return res.status(400).json({
        success: false,
        message: 'Không được thay đổi mã dịch vụ'
      });
    }

    Object.assign(service, data);
    service.updatedBy = req.user._id;
    await service.save();

    await manualAuditLog({
      action: AUDIT_ACTIONS.SERVICE_UPDATE,
      user: req.user,
      metadata: { serviceId: id, updatedFields: Object.keys(data) }
    });

    res.json({
      success: true,
      message: 'Cập nhật dịch vụ thành công',
      data: service
    });
  })
);

/**
 * DELETE /api/services/:id
 * Xóa mềm dịch vụ (chỉ admin)
 */
router.delete(
  '/:id',
  requirePermission(PERMISSIONS['SERVICE_MANAGE']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ'
      });
    }

    service.isActive = false;
    service.updatedBy = req.user._id;
    await service.save();

    await manualAuditLog({
      action: AUDIT_ACTIONS.SERVICE_DELETE,
      user: req.user,
      metadata: { serviceId: id }
    });

    res.json({
      success: true,
      message: 'Vô hiệu hóa dịch vụ thành công'
    });
  })
);

module.exports = router;