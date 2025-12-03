/**
 * MEDICATION CONTROLLER
 * Xử lý quản lý thuốc và kho dược phẩm
 */

const Medication = require('../models/medication.model');
const moment = require('moment');

class MedicationController {
  /**
   * Lấy danh sách thuốc với phân trang và tìm kiếm
   * GET /api/medications
   */
  static async getMedications(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        keyword = '',
        category,
        status,
        type,
        stockStatus, // 'LOW', 'OUT', 'NORMAL', 'ALL'
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // 🔍 XÂY DỰNG QUERY
      const query = {};

      // Tìm kiếm theo từ khóa
      if (keyword && keyword.trim()) {
        query.$or = [
          { name: new RegExp(keyword, 'i') },
          { genericName: new RegExp(keyword, 'i') },
          { brandName: new RegExp(keyword, 'i') },
          { medicationId: new RegExp(keyword, 'i') }
        ];
      }

      // Lọc theo category
      if (category) {
        query.category = category;
      }

      // Lọc theo status
      if (status) {
        query.status = status;
      }

      // Lọc theo type
      if (type) {
        query.type = type;
      }

      // Lọc theo tình trạng tồn kho
      if (stockStatus) {
        switch (stockStatus) {
          case 'LOW':
            query.$expr = { $lte: ['$stock.current', '$stock.reorderLevel'] };
            break;
          case 'OUT':
            query['stock.current'] = { $lte: 0 };
            break;
          case 'NORMAL':
            query.$expr = { $gt: ['$stock.current', '$stock.reorderLevel'] };
            break;
        }
      }

      // 📊 THỰC HIỆN QUERY
      const [medications, total] = await Promise.all([
        Medication.find(query)
          .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Medication.countDocuments(query)
      ]);

      // 🎯 FORMAT DỮ LIỆU
      const formattedMedications = medications.map(med => ({
        ...med,
        isLowStock: med.stock.current <= med.stock.reorderLevel,
        isOutOfStock: med.stock.current <= 0,
        stockPercentage: med.stock.maximum > 0 
          ? ((med.stock.current / med.stock.maximum) * 100).toFixed(1)
          : 0
      }));

      res.json({
        success: true,
        data: formattedMedications,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          limit: limitNum,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1
        }
      });
    } catch (error) {
      console.error('❌ Get medications error:', error);
      res.status(500).json({
        success: false,
        error: 'Không thể lấy danh sách thuốc',
        message: error.message
      });
    }
  }

  /**
   * Lấy thông tin chi tiết một loại thuốc
   * GET /api/medications/:id
   */
  static async getMedicationById(req, res) {
    try {
      const { id } = req.params;

      const medication = await Medication.findById(id).lean();

      if (!medication) {
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy thuốc'
        });
      }

      // Thêm thông tin tính toán
      const enhancedMedication = {
        ...medication,
        isLowStock: medication.stock.current <= medication.stock.reorderLevel,
        isOutOfStock: medication.stock.current <= 0,
        stockPercentage: medication.stock.maximum > 0 
          ? ((medication.stock.current / medication.stock.maximum) * 100).toFixed(1)
          : 0,
        daysUntilRestock: medication.stock.lastRestocked 
          ? moment().diff(moment(medication.stock.lastRestocked), 'days')
          : null
      };

      res.json({
        success: true,
        data: enhancedMedication
      });
    } catch (error) {
      console.error('❌ Get medication by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Không thể lấy thông tin thuốc',
        message: error.message
      });
    }
  }

  /**
   * Lấy thống kê kho thuốc
   * GET /api/medications/stats
   */
  static async getMedicationStats(req, res) {
    try {
      const [
        totalMedications,
        activeMedications,
        lowStockCount,
        outOfStockCount,
        categories,
        recentlyAdded
      ] = await Promise.all([
        // Tổng số thuốc
        Medication.countDocuments(),
        
        // Thuốc đang active
        Medication.countDocuments({ status: 'ACTIVE' }),
        
        // Thuốc sắp hết (low stock)
        Medication.countDocuments({
          $expr: { $lte: ['$stock.current', '$stock.reorderLevel'] },
          status: 'ACTIVE'
        }),
        
        // Thuốc hết hàng
        Medication.countDocuments({
          'stock.current': { $lte: 0 },
          status: 'ACTIVE'
        }),
        
        // Thống kê theo danh mục
        Medication.aggregate([
          { $match: { status: 'ACTIVE' } },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              totalStock: { $sum: '$stock.current' },
              totalValue: { $sum: { $multiply: ['$stock.current', '$pricing.sellingPrice'] } }
            }
          },
          { $sort: { count: -1 } }
        ]),
        
        // Thuốc mới thêm gần đây (7 ngày)
        Medication.countDocuments({
          createdAt: { $gte: moment().subtract(7, 'days').toDate() }
        })
      ]);

      // Tính tổng giá trị kho
      const inventoryValue = await Medication.aggregate([
        { $match: { status: 'ACTIVE' } },
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: {
                $multiply: ['$stock.current', '$pricing.sellingPrice']
              }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            totalMedications,
            activeMedications,
            lowStockCount,
            outOfStockCount,
            recentlyAdded,
            inventoryValue: inventoryValue[0]?.totalValue || 0
          },
          categories: categories.map(cat => ({
            name: cat._id,
            count: cat.count,
            totalStock: cat.totalStock,
            totalValue: cat.totalValue || 0
          })),
          alerts: {
            lowStock: lowStockCount,
            outOfStock: outOfStockCount,
            needsAttention: lowStockCount + outOfStockCount
          }
        }
      });
    } catch (error) {
      console.error('❌ Get medication stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Không thể lấy thống kê',
        message: error.message
      });
    }
  }

  /**
   * Tạo thuốc mới
   * POST /api/medications
   */
  static async createMedication(req, res) {
    try {
      const medicationData = req.body;

      // Tạo medication ID tự động nếu không có
      if (!medicationData.medicationId) {
        const count = await Medication.countDocuments();
        medicationData.medicationId = `MED${String(count + 1).padStart(6, '0')}`;
      }

      // Kiểm tra trùng medication ID
      const existing = await Medication.findOne({ medicationId: medicationData.medicationId });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Mã thuốc đã tồn tại'
        });
      }

      // Thêm thông tin người tạo
      medicationData.createdBy = req.user.userId;

      const medication = new Medication(medicationData);
      await medication.save();

      res.status(201).json({
        success: true,
        message: 'Tạo thuốc mới thành công',
        data: medication
      });
    } catch (error) {
      console.error('❌ Create medication error:', error);
      res.status(500).json({
        success: false,
        error: 'Không thể tạo thuốc mới',
        message: error.message
      });
    }
  }

  /**
   * Cập nhật thông tin thuốc
   * PUT /api/medications/:id
   */
  static async updateMedication(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Không cho phép cập nhật medication ID
      delete updateData.medicationId;
      delete updateData.createdBy;

      const medication = await Medication.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!medication) {
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy thuốc'
        });
      }

      res.json({
        success: true,
        message: 'Cập nhật thuốc thành công',
        data: medication
      });
    } catch (error) {
      console.error('❌ Update medication error:', error);
      res.status(500).json({
        success: false,
        error: 'Không thể cập nhật thuốc',
        message: error.message
      });
    }
  }

  /**
   * Cập nhật tồn kho
   * POST /api/medications/:id/stock
   */
  static async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity, type, note } = req.body; // type: 'IN' hoặc 'OUT'

      const medication = await Medication.findById(id);

      if (!medication) {
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy thuốc'
        });
      }

      // Cập nhật tồn kho
      try {
        medication.updateStock(quantity, type);
      } catch (stockError) {
        return res.status(400).json({
          success: false,
          error: stockError.message
        });
      }

      // Cập nhật ngày nhập kho nếu là nhập hàng
      if (type === 'IN') {
        medication.stock.lastRestocked = new Date();
      }

      // Cập nhật status dựa trên tồn kho
      if (medication.stock.current <= 0) {
        medication.status = 'OUT_OF_STOCK';
      } else if (medication.status === 'OUT_OF_STOCK') {
        medication.status = 'ACTIVE';
      }

      await medication.save();

      res.json({
        success: true,
        message: `${type === 'IN' ? 'Nhập' : 'Xuất'} kho thành công`,
        data: {
          medication: medication,
          stockInfo: {
            currentStock: medication.stock.current,
            isLowStock: medication.stock.current <= medication.stock.reorderLevel,
            isOutOfStock: medication.stock.current <= 0
          }
        }
      });
    } catch (error) {
      console.error('❌ Update stock error:', error);
      res.status(500).json({
        success: false,
        error: 'Không thể cập nhật tồn kho',
        message: error.message
      });
    }
  }

  /**
   * Lấy danh sách thuốc sắp hết
   * GET /api/medications/low-stock
   */
  static async getLowStockMedications(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const medications = await Medication.find({
        $expr: { $lte: ['$stock.current', '$stock.reorderLevel'] },
        status: 'ACTIVE'
      })
        .sort({ 'stock.current': 1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await Medication.countDocuments({
        $expr: { $lte: ['$stock.current', '$stock.reorderLevel'] },
        status: 'ACTIVE'
      });

      res.json({
        success: true,
        data: medications.map(med => ({
          ...med,
          shortage: med.stock.reorderLevel - med.stock.current,
          urgencyLevel: med.stock.current <= 0 ? 'CRITICAL' : 
                       med.stock.current <= med.stock.minimum ? 'HIGH' : 'MEDIUM'
        })),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          limit: limitNum
        }
      });
    } catch (error) {
      console.error('❌ Get low stock medications error:', error);
      res.status(500).json({
        success: false,
        error: 'Không thể lấy danh sách thuốc sắp hết',
        message: error.message
      });
    }
  }

  /**
   * Xóa thuốc (soft delete - chuyển status)
   * DELETE /api/medications/:id
   */
  static async deleteMedication(req, res) {
    try {
      const { id } = req.params;

      const medication = await Medication.findByIdAndUpdate(
        id,
        { status: 'DISCONTINUED' },
        { new: true }
      );

      if (!medication) {
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy thuốc'
        });
      }

      res.json({
        success: true,
        message: 'Đã ngừng sử dụng thuốc',
        data: medication
      });
    } catch (error) {
      console.error('❌ Delete medication error:', error);
      res.status(500).json({
        success: false,
        error: 'Không thể xóa thuốc',
        message: error.message
      });
    }
  }

  /**
   * Tìm kiếm thuốc
   * GET /api/medications/search
   */
  static async searchMedications(req, res) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }

      const medications = await Medication.find({
        $or: [
          { name: new RegExp(q, 'i') },
          { genericName: new RegExp(q, 'i') },
          { brandName: new RegExp(q, 'i') },
          { medicationId: new RegExp(q, 'i') }
        ],
        status: 'ACTIVE'
      })
        .limit(parseInt(limit))
        .select('medicationId name genericName brandName stock pricing type')
        .lean();

      res.json({
        success: true,
        data: medications.map(med => ({
          ...med,
          available: med.stock.current > 0,
          lowStock: med.stock.current <= med.stock.reorderLevel
        }))
      });
    } catch (error) {
      console.error('❌ Search medications error:', error);
      res.status(500).json({
        success: false,
        error: 'Không thể tìm kiếm thuốc',
        message: error.message
      });
    }
  }
}

module.exports = MedicationController;
