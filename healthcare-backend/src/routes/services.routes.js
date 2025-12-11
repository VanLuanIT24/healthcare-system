// src/routes/services.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { ROLES } = require('../constants/roles');

/**
 * 🏥 SERVICES ROUTES
 * Routes cho danh sách dịch vụ y tế
 */

router.use(authenticate);

// Lấy danh sách dịch vụ (cho CreateBill form và các chức năng khác)
router.get('/', 
  requireRole(ROLES.BILLING_STAFF, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE),
  async (req, res, next) => {
    try {
      // Trả về danh sách dịch vụ mẫu
      const services = [
        { 
          _id: 'S001', 
          code: 'KTQ',
          name: 'Khám tổng quát', 
          price: 200000, 
          category: 'EXAMINATION',
          description: 'Khám sức khỏe tổng quát',
          unit: 'Lần'
        },
        { 
          _id: 'S002', 
          code: 'KCK',
          name: 'Khám chuyên khoa', 
          price: 300000, 
          category: 'EXAMINATION',
          description: 'Khám bệnh chuyên sâu theo khoa',
          unit: 'Lần'
        },
        { 
          _id: 'S003', 
          code: 'XNM',
          name: 'Xét nghiệm máu', 
          price: 150000, 
          category: 'LAB',
          description: 'Xét nghiệm máu tổng quát',
          unit: 'Lần'
        },
        { 
          _id: 'S004', 
          code: 'XQ',
          name: 'Chụp X-quang', 
          price: 250000, 
          category: 'IMAGING',
          description: 'Chụp X-quang',
          unit: 'Phim'
        },
        { 
          _id: 'S005', 
          code: 'SA',
          name: 'Siêu âm', 
          price: 350000, 
          category: 'IMAGING',
          description: 'Siêu âm tổng quát',
          unit: 'Lần'
        },
        { 
          _id: 'S006', 
          code: 'DT',
          name: 'Điện tim', 
          price: 100000, 
          category: 'TEST',
          description: 'Đo điện tim',
          unit: 'Lần'
        },
        { 
          _id: 'S007', 
          code: 'NS',
          name: 'Nội soi', 
          price: 500000, 
          category: 'PROCEDURE',
          description: 'Nội soi dạ dày',
          unit: 'Lần'
        },
        { 
          _id: 'S008', 
          code: 'CT',
          name: 'Chụp CT Scanner', 
          price: 1200000, 
          category: 'IMAGING',
          description: 'Chụp CT Scanner',
          unit: 'Lần'
        },
        { 
          _id: 'S009', 
          code: 'MRI',
          name: 'Chụp MRI', 
          price: 2500000, 
          category: 'IMAGING',
          description: 'Chụp cộng hưởng từ MRI',
          unit: 'Lần'
        },
        { 
          _id: 'S010', 
          code: 'XNSH',
          name: 'Xét nghiệm sinh hóa', 
          price: 200000, 
          category: 'LAB',
          description: 'Xét nghiệm sinh hóa máu',
          unit: 'Lần'
        }
      ];

      // Lọc theo category nếu có query
      let filteredServices = services;
      if (req.query.category) {
        filteredServices = services.filter(s => s.category === req.query.category);
      }

      // Tìm kiếm nếu có
      if (req.query.search) {
        const searchTerm = req.query.search.toLowerCase();
        filteredServices = filteredServices.filter(s => 
          s.name.toLowerCase().includes(searchTerm) ||
          s.code.toLowerCase().includes(searchTerm) ||
          s.description.toLowerCase().includes(searchTerm)
        );
      }

      res.json({
        success: true,
        data: filteredServices,
        total: filteredServices.length
      });
    } catch (error) {
      next(error);
    }
  }
);

// Lấy chi tiết dịch vụ theo ID
router.get('/:id', 
  requireRole(ROLES.BILLING_STAFF, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Mock data - trong thực tế sẽ query từ database
      const allServices = [
        { _id: 'S001', code: 'KTQ', name: 'Khám tổng quát', price: 200000, category: 'EXAMINATION', unit: 'Lần' },
        { _id: 'S002', code: 'KCK', name: 'Khám chuyên khoa', price: 300000, category: 'EXAMINATION', unit: 'Lần' },
        { _id: 'S003', code: 'XNM', name: 'Xét nghiệm máu', price: 150000, category: 'LAB', unit: 'Lần' },
        { _id: 'S004', code: 'XQ', name: 'Chụp X-quang', price: 250000, category: 'IMAGING', unit: 'Phim' },
        { _id: 'S005', code: 'SA', name: 'Siêu âm', price: 350000, category: 'IMAGING', unit: 'Lần' },
        { _id: 'S006', code: 'DT', name: 'Điện tim', price: 100000, category: 'TEST', unit: 'Lần' },
        { _id: 'S007', code: 'NS', name: 'Nội soi', price: 500000, category: 'PROCEDURE', unit: 'Lần' }
      ];

      const service = allServices.find(s => s._id === id);
      
      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      res.json({
        success: true,
        data: service
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
