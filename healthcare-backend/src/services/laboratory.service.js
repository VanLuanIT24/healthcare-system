const LabOrder = require('../models/labOrder.model');
const LabTest = require('../models/labTest.model');
const Patient = require('../models/patient.model');
const { generateMedicalCode } = require('../utils/healthcare.utils');
const { AppError } = require('../middlewares/error.middleware');

class LaboratoryService {
  
  // Chỉ định xét nghiệm cho bệnh nhân
  async orderLabTest(patientId, testData, doctorId) {
    try {
      // Kiểm tra bệnh nhân tồn tại
      const patient = await Patient.findOne({ userId: patientId });
      if (!patient) {
        throw new AppError('Bệnh nhân không tồn tại', 404);
      }

      // Tạo order ID
      const orderId = await generateMedicalCode('LAB');

      // Kiểm tra thông tin xét nghiệm
      const testsWithDetails = [];
      for (let test of testData.tests) {
        const labTest = await LabTest.findById(test.testId);
        if (!labTest) {
          throw new AppError(`Xét nghiệm ${test.testId} không tồn tại`, 404);
        }

        testsWithDetails.push({
          testId: test.testId,
          testCode: labTest.code,
          testName: labTest.name,
          category: labTest.category,
          specimenType: test.specimenType,
          specimenRequirements: labTest.specimenRequirements,
          instructions: test.instructions,
          price: labTest.pricing.price,
          priority: test.priority
        });
      }

      const labOrder = new LabOrder({
        orderId,
        patientId,
        doctorId,
        tests: testsWithDetails,
        clinicalIndication: testData.clinicalIndication,
        differentialDiagnosis: testData.differentialDiagnosis,
        preTestConditions: testData.preTestConditions,
        notes: testData.notes,
        specialInstructions: testData.specialInstructions,
        priority: testData.tests.some(t => t.priority === 'STAT') ? 'STAT' : 
                 testData.tests.some(t => t.priority === 'URGENT') ? 'URGENT' : 'ROUTINE',
        createdBy: doctorId,
        status: 'ORDERED'
      });

      await labOrder.save();
      
      // Populate thông tin trước khi trả về
      await labOrder.populate('tests.testId');
      await labOrder.populate('patientId', 'personalInfo');
      
      return labOrder;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thông tin chỉ định xét nghiệm
  async getLabOrder(orderId) {
    const labOrder = await LabOrder.findOne({ orderId })
      .populate('patientId', 'personalInfo')
      .populate('doctorId', 'personalInfo')
      .populate('tests.testId')
      .populate('tests.collectedBy', 'personalInfo')
      .populate('tests.performedBy', 'personalInfo')
      .populate('tests.result.verifiedBy', 'personalInfo');

    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }

    return labOrder;
  }

  // Ghi kết quả xét nghiệm
  async recordLabResult(orderId, resultData, technicianId) {
    const labOrder = await LabOrder.findOne({ orderId });
    
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }

    // Tìm test trong order
    const test = labOrder.tests.id(resultData.testId);
    if (!test) {
      throw new AppError('Xét nghiệm không có trong chỉ định', 404);
    }

    if (test.status === 'COMPLETED') {
      throw new AppError('Xét nghiệm đã có kết quả', 400);
    }

    // Thêm kết quả
    labOrder.addTestResult(resultData.testId, resultData.result, technicianId);

    // Thêm thông tin methodology nếu có
    if (resultData.methodology) {
      test.methodology = resultData.methodology;
    }

    // Thêm thông tin quality control
    if (resultData.qualityControl) {
      test.qualityControl = resultData.qualityControl;
    }

    await labOrder.save();
    return labOrder;
  }

  // Lấy kết quả xét nghiệm theo ID
  async getLabResult(resultId) {
    // Trong cấu trúc hiện tại, resultId là testId trong LabOrder
    const labOrder = await LabOrder.findOne({ 'tests._id': resultId })
      .populate('patientId', 'personalInfo')
      .populate('doctorId', 'personalInfo')
      .populate('tests.testId')
      .populate('tests.performedBy', 'personalInfo')
      .populate('tests.result.verifiedBy', 'personalInfo');

    if (!labOrder) {
      throw new AppError('Kết quả xét nghiệm không tồn tại', 404);
    }

    const test = labOrder.tests.id(resultId);
    if (!test) {
      throw new AppError('Kết quả xét nghiệm không tồn tại', 404);
    }

    return {
      order: labOrder,
      test: test
    };
  }

  // Lấy tất cả kết quả XN của bệnh nhân
  async getPatientLabResults(patientId, options = {}) {
    const { page = 1, limit = 20, startDate, endDate, category } = options;
    const skip = (page - 1) * limit;

    const query = { patientId };
    
    // Filter theo thời gian
    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }

    // Filter theo category
    if (category) {
      query['tests.category'] = category;
    }

    const labOrders = await LabOrder.find(query)
      .populate('doctorId', 'personalInfo')
      .populate('tests.testId')
      .populate('tests.performedBy', 'personalInfo')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    // Lọc chỉ các test đã có kết quả
    const results = labOrders.flatMap(order => 
      order.tests
        .filter(test => test.status === 'COMPLETED' && test.result)
        .map(test => ({
          orderId: order.orderId,
          testId: test._id,
          testName: test.testName,
          testCode: test.testCode,
          category: test.category,
          result: test.result,
          orderDate: order.orderDate,
          completedDate: test.completedDate,
          performedBy: test.performedBy,
          verifiedBy: test.result.verifiedBy
        }))
    );

    const total = await LabOrder.countDocuments(query);

    return {
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Lấy danh sách xét nghiệm đang chờ xử lý
  async getPendingTests(options = {}) {
    const { page = 1, limit = 20, department, priority } = options;
    const skip = (page - 1) * limit;

    const query = {
      status: { $in: ['ORDERED', 'IN_PROGRESS'] }
    };

    if (department) {
      query.department = department;
    }

    if (priority) {
      query.priority = priority;
    }

    const labOrders = await LabOrder.find(query)
      .populate('patientId', 'personalInfo')
      .populate('doctorId', 'personalInfo')
      .populate('tests.testId')
      .sort({ 
        priority: -1, // STAT, URGENT first
        orderDate: 1 
      })
      .skip(skip)
      .limit(limit);

    // Tách các test pending
    const pendingTests = labOrders.flatMap(order => 
      order.tests
        .filter(test => test.status !== 'COMPLETED' && test.status !== 'CANCELLED')
        .map(test => ({
          orderId: order.orderId,
          testId: test._id,
          testName: test.testName,
          testCode: test.testCode,
          category: test.category,
          specimenType: test.specimenType,
          status: test.status,
          priority: order.priority,
          orderDate: order.orderDate,
          patient: order.patientId,
          doctor: order.doctorId,
          clinicalIndication: order.clinicalIndication
        }))
    );

    const total = await LabOrder.countDocuments(query);

    return {
      pendingTests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Cập nhật thông tin chỉ định XN
  async updateLabOrder(orderId, updateData, userId) {
    const labOrder = await LabOrder.findOne({ orderId });
    
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }

    if (labOrder.status !== 'DRAFT' && labOrder.status !== 'ORDERED') {
      throw new AppError('Chỉ có thể cập nhật chỉ định ở trạng thái DRAFT hoặc ORDERED', 400);
    }

    Object.assign(labOrder, updateData);
    labOrder.lastModifiedBy = userId;

    await labOrder.save();
    return labOrder;
  }

  // Hủy chỉ định xét nghiệm
  async cancelLabOrder(orderId, reason, userId) {
    const labOrder = await LabOrder.findOne({ orderId });
    
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }

    if (!['DRAFT', 'ORDERED'].includes(labOrder.status)) {
      throw new AppError('Không thể hủy chỉ định ở trạng thái hiện tại', 400);
    }

    labOrder.status = 'CANCELLED';
    labOrder.notes = labOrder.notes ? 
      `${labOrder.notes}\nHủy: ${reason}` : `Hủy: ${reason}`;
    labOrder.lastModifiedBy = userId;

    // Hủy tất cả tests chưa hoàn thành
    labOrder.tests.forEach(test => {
      if (test.status !== 'COMPLETED') {
        test.status = 'CANCELLED';
      }
    });

    await labOrder.save();
    return labOrder;
  }

  // Cập nhật kết quả xét nghiệm (sửa lỗi)
  async updateLabResult(orderId, testId, updateData, userId) {
    const labOrder = await LabOrder.findOne({ orderId });
    
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }

    const test = labOrder.tests.id(testId);
    if (!test) {
      throw new AppError('Xét nghiệm không tồn tại', 404);
    }

    if (test.status !== 'COMPLETED') {
      throw new AppError('Chỉ có thể cập nhật kết quả đã hoàn thành', 400);
    }

    // Cập nhật kết quả
    if (updateData.result) {
      Object.assign(test.result, updateData.result);
    }

    if (updateData.methodology) {
      test.methodology = updateData.methodology;
    }

    // Ghi log sửa đổi
    test.modifiedBy = userId;
    test.modifiedAt = new Date();

    await labOrder.save();
    return labOrder;
  }

  // Duyệt kết quả xét nghiệm
  async approveLabResult(orderId, testId, approverId) {
    const labOrder = await LabOrder.findOne({ orderId });
    
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }

    const test = labOrder.tests.id(testId);
    if (!test) {
      throw new AppError('Xét nghiệm không tồn tại', 404);
    }

    if (test.status !== 'COMPLETED') {
      throw new AppError('Chỉ có thể duyệt kết quả đã hoàn thành', 400);
    }

    if (!test.result) {
      throw new AppError('Không có kết quả để duyệt', 400);
    }

    // Duyệt kết quả
    labOrder.verifyTestResult(testId, approverId);

    await labOrder.save();
    return labOrder;
  }

  // Lấy xét nghiệm đã hoàn thành trong khoảng thời gian
  async getCompletedTests(timeframe = '7d', options = {}) {
    const { page = 1, limit = 20, department } = options;
    const skip = (page - 1) * limit;

    // Tính khoảng thời gian
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const query = {
      status: 'COMPLETED',
      orderDate: {
        $gte: startDate,
        $lte: now
      }
    };

    if (department) {
      query.department = department;
    }

    const labOrders = await LabOrder.find(query)
      .populate('patientId', 'personalInfo')
      .populate('doctorId', 'personalInfo')
      .populate('tests.testId')
      .populate('tests.performedBy', 'personalInfo')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    // Lấy tất cả tests đã hoàn thành
    const completedTests = labOrders.flatMap(order => 
      order.tests
        .filter(test => test.status === 'COMPLETED')
        .map(test => ({
          orderId: order.orderId,
          testId: test._id,
          testName: test.testName,
          testCode: test.testCode,
          category: test.category,
          result: test.result,
          orderDate: order.orderDate,
          completedDate: test.completedDate,
          performedBy: test.performedBy,
          verifiedBy: test.result.verifiedBy,
          patient: order.patientId,
          doctor: order.doctorId
        }))
    );

    const total = await LabOrder.countDocuments(query);

    return {
      completedTests,
      timeframe,
      startDate,
      endDate: now,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Đánh dấu test đang được thực hiện
  async markTestInProgress(orderId, testId, technicianId) {
    const labOrder = await LabOrder.findOne({ orderId });
    
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }

    const test = labOrder.tests.id(testId);
    if (!test) {
      throw new AppError('Xét nghiệm không tồn tại', 404);
    }

    if (test.status !== 'ORDERED' && test.status !== 'COLLECTED') {
      throw new AppError('Không thể bắt đầu xét nghiệm ở trạng thái hiện tại', 400);
    }

    labOrder.markTestInProgress(testId, technicianId);
    await labOrder.save();
    return labOrder;
  }

  // Đánh dấu đã thu thập mẫu
  async markSampleCollected(orderId, testId, collectorId) {
    const labOrder = await LabOrder.findOne({ orderId });
    
    if (!labOrder) {
      throw new AppError('Chỉ định xét nghiệm không tồn tại', 404);
    }

    const test = labOrder.tests.id(testId);
    if (!test) {
      throw new AppError('Xét nghiệm không tồn tại', 404);
    }

    if (test.status !== 'ORDERED') {
      throw new AppError('Không thể thu thập mẫu ở trạng thái hiện tại', 400);
    }

    test.status = 'COLLECTED';
    test.collectedBy = collectorId;
    test.collectionDate = new Date();

    await labOrder.save();
    return labOrder;
  }
}

module.exports = new LaboratoryService();