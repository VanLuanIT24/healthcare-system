// services/laboratory.service.js
const LabOrder = require('../models/labOrder.model');
const LabTest = require('../models/labTest.model');
const Patient = require('../models/patient.model');
const { generateMedicalCode } = require('../utils/healthcare.utils');
const { AppError } = require('../middlewares/error.middleware');

class LaboratoryService {
  // Tạo chỉ định xét nghiệm mới
  async createLabOrder(data, doctorId) {
    const patient = await Patient.findOne({ userId: data.patientId });
    if (!patient) {
      throw new AppError('Bệnh nhân không tồn tại', 404);
    }

    const orderId = await generateMedicalCode('LAB');
    const testsWithDetails = await this.processTests(data.tests);

    const labOrder = new LabOrder({
      orderId,
      patientId: data.patientId,
      doctorId,
      tests: testsWithDetails,
      clinicalIndication: data.clinicalIndication,
      differentialDiagnosis: data.differentialDiagnosis,
      preTestConditions: data.preTestConditions,
      notes: data.notes,
      specialInstructions: data.specialInstructions,
      priority: this.determinePriority(data.tests),
      createdBy: doctorId,
      status: 'ORDERED'
    });

    await labOrder.save();
    await labOrder.populate('tests.testId patientId doctorId');
    return labOrder;
  }

  // Xử lý danh sách xét nghiệm
  async processTests(tests) {
    const testsWithDetails = [];
    for (const test of tests) {
      let labTest = await LabTest.findOne({ $or: [{ _id: test.testId }, { code: test.testCode }] });
      if (!labTest) {
        if (test.testCode && test.testName && test.category) {
          labTest = new LabTest({
            code: test.testCode,
            name: test.testName,
            category: test.category,
            specimenType: test.specimenType || 'BLOOD',
            specimenRequirements: test.specimenRequirements,
            description: test.instructions
          });
          await labTest.save();
        } else {
          throw new AppError(`Xét nghiệm ${test.testId || test.testCode} không tồn tại`, 404);
        }
      }
      testsWithDetails.push({
        testId: labTest._id,
        testCode: labTest.code,
        testName: labTest.name,
        category: labTest.category,
        specimenType: test.specimenType || labTest.specimenType,
        specimenRequirements: labTest.specimenRequirements,
        instructions: test.instructions,
        price: labTest.pricing?.price || 0,
        priority: test.priority || 'ROUTINE'
      });
    }
    return testsWithDetails;
  }

  // Xác định mức độ ưu tiên tổng thể
  determinePriority(tests) {
    if (tests.some(t => t.priority === 'STAT')) return 'STAT';
    if (tests.some(t => t.priority === 'URGENT')) return 'URGENT';
    return 'ROUTINE';
  }

  // Lấy thông tin chỉ định xét nghiệm theo ID
  async getLabOrder(id) {
    const labOrder = await LabOrder.findById(id)
      .populate('patientId doctorId tests.testId tests.collectedBy tests.performedBy tests.result.verifiedBy');
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }
    return labOrder;
  }

  // Lấy danh sách chỉ định xét nghiệm
  async getLabOrders(params) {
    const { page = 1, limit = 10, status, priority } = params;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const labOrders = await LabOrder.find(query)
      .populate('patientId doctorId')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ orderDate: -1 });

    const total = await LabOrder.countDocuments(query);
    return { labOrders, total, page, limit };
  }

  // Cập nhật chỉ định xét nghiệm
  async updateLabOrder(id, data, userId) {
    const labOrder = await LabOrder.findById(id);
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }
    Object.assign(labOrder, data);
    labOrder.updatedBy = userId;
    await labOrder.save();
    return labOrder;
  }

  // Hủy chỉ định xét nghiệm
  async cancelLabOrder(id, reason, userId) {
    const labOrder = await LabOrder.findById(id);
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }
    labOrder.status = 'CANCELLED';
    labOrder.notes = `${labOrder.notes || ''}\nLý do hủy: ${reason}`;
    labOrder.updatedBy = userId;
    await labOrder.save();
    return labOrder;
  }

  // Ghi kết quả xét nghiệm
  async recordLabResult(orderId, results, technicianId) {
    const labOrder = await LabOrder.findById(orderId);
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }
    labOrder.tests.forEach(test => {
      const result = results.find(r => r.testId === test._id.toString());
      if (result) {
        test.result = result;
        test.performedBy = technicianId;
        test.completedDate = new Date();
        test.status = 'COMPLETED';
      }
    });
    await labOrder.save();
    return labOrder;
  }

  // Cập nhật kết quả xét nghiệm
  async updateLabResult(orderId, testId, result, userId) {
    const labOrder = await LabOrder.findById(orderId);
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }
    const test = labOrder.tests.id(testId);
    if (!test) {
      throw new AppError('Xét nghiệm không tồn tại', 404);
    }
    Object.assign(test.result, result);
    test.updatedBy = userId;
    await labOrder.save();
    return labOrder;
  }

  // Duyệt kết quả xét nghiệm
  async approveLabResult(orderId, testId, approverId) {
    const labOrder = await LabOrder.findById(orderId);
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }
    const test = labOrder.tests.id(testId);
    if (!test) {
      throw new AppError('Xét nghiệm không tồn tại', 404);
    }
    test.result.approvedBy = approverId;
    test.result.approvedAt = new Date();
    await labOrder.save();
    return labOrder;
  }

  // Đánh dấu mẫu đã được thu thập
  async markSampleCollected(orderId) {
    const labOrder = await LabOrder.findById(orderId);
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }
    labOrder.tests.forEach(test => {
      test.collectionDate = new Date();
      test.status = 'COLLECTED';
    });
    await labOrder.save();
    return labOrder;
  }

  // Đánh dấu xét nghiệm hoàn thành
  async markTestCompleted(orderId, testId) {
    const labOrder = await LabOrder.findById(orderId);
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }
    const test = labOrder.tests.id(testId);
    if (!test) {
      throw new AppError('Xét nghiệm không tồn tại', 404);
    }
    test.completedDate = new Date();
    test.status = 'COMPLETED';
    await labOrder.save();
    return labOrder;
  }

  // Lấy danh sách xét nghiệm
  async getLabTests(params) {
    const { category, status = 'ACTIVE' } = params;
    const query = { status };
    if (category) query.category = category;
    return await LabTest.find(query).sort({ name: 1 });
  }

  // Tìm kiếm xét nghiệm
  async searchLabTests(query) {
    return await LabTest.find({ name: new RegExp(query, 'i'), status: 'ACTIVE' });
  }

  // Lấy chỉ định đang chờ xử lý
  async getPendingOrders() {
    return await LabOrder.find({ status: 'PENDING' }).populate('patientId doctorId');
  }

  // Lấy kết quả nghiêm trọng
  async getCriticalResults() {
    return await LabOrder.find({ 'tests.result.flag': 'CRITICAL' }).populate('patientId doctorId');
  }

  // Lấy thống kê phòng xét nghiệm
  async getLabStats(params) {
    const { startDate, endDate } = params;
    const query = {};
    if (startDate) query.orderDate = { $gte: new Date(startDate) };
    if (endDate) query.orderDate.$lte = new Date(endDate);

    const [total, pending, completed] = await Promise.all([
      LabOrder.countDocuments(query),
      LabOrder.countDocuments({ ...query, status: 'PENDING' }),
      LabOrder.countDocuments({ ...query, status: 'COMPLETED' })
    ]);

    return { total, pending, completed };
  }

  // Xuất báo cáo PDF kết quả xét nghiệm (giả sử sử dụng thư viện pdfkit hoặc tương tự)
  async exportLabResultsPDF(orderId) {
    // Ở đây implement logic tạo PDF, ví dụ sử dụng pdfkit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    // Thêm nội dung PDF...
    doc.text(`Báo cáo kết quả xét nghiệm cho order ${orderId}`);
    // ...
    return doc;
  }
}

module.exports = new LaboratoryService();