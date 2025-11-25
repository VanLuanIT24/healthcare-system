const prescriptionService = require('../services/prescription.service');
const { asyncHandler } = require('../middlewares/error.middleware');

class PrescriptionController {
  
  // Tạo đơn thuốc cho bệnh nhân
  createPrescription = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const prescriptionData = req.body;
    const doctorId = req.user._id;

    const prescription = await prescriptionService.createPrescription(
      patientId, 
      prescriptionData, 
      doctorId
    );

    res.status(201).json({
      success: true,
      message: 'Tạo đơn thuốc thành công',
      data: prescription
    });
  });

  // Lấy thông tin đơn thuốc
  getPrescription = asyncHandler(async (req, res) => {
    const { prescriptionId } = req.params;

    const prescription = await prescriptionService.getPrescription(prescriptionId);

    res.json({
      success: true,
      data: prescription
    });
  });

  // Cập nhật đơn thuốc
  updatePrescription = asyncHandler(async (req, res) => {
    const { prescriptionId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;

    const prescription = await prescriptionService.updatePrescription(
      prescriptionId, 
      updateData, 
      userId
    );

    res.json({
      success: true,
      message: 'Cập nhật đơn thuốc thành công',
      data: prescription
    });
  });

  // Lấy tất cả đơn thuốc của bệnh nhân
  getPatientPrescriptions = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const { page, limit, status } = req.query;

    const result = await prescriptionService.getPatientPrescriptions(patientId, {
      page, limit, status
    });

    res.json({
      success: true,
      data: result
    });
  });

  // Phát thuốc cho bệnh nhân
  dispenseMedication = asyncHandler(async (req, res) => {
    const { prescriptionId } = req.params;
    const dispenseData = req.body;
    const pharmacistId = req.user._id;

    const prescription = await prescriptionService.dispenseMedication(
      prescriptionId,
      dispenseData,
      pharmacistId
    );

    res.json({
      success: true,
      message: 'Phát thuốc thành công',
      data: prescription
    });
  });

  // Lấy đơn thuốc theo trạng thái (cho nhà thuốc)
  getPharmacyOrders = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const { page, limit } = req.query;

    const result = await prescriptionService.getPharmacyOrders(status, {
      page, limit
    });

    res.json({
      success: true,
      data: result
    });
  });

  // Kiểm tra tương tác thuốc
  checkDrugInteraction = asyncHandler(async (req, res) => {
    const { drugs } = req.body;

    const interactions = await prescriptionService.checkDrugInteraction(drugs);

    res.json({
      success: true,
      data: {
        hasInteractions: interactions.length > 0,
        interactions
      }
    });
  });

  // Ghi nhận bệnh nhân đã dùng thuốc
  recordMedicationAdministration = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const medData = req.body;
    const nurseId = req.user._id;

    const record = await prescriptionService.recordMedicationAdministration(
      patientId,
      medData,
      nurseId
    );

    res.json({
      success: true,
      message: 'Ghi nhận dùng thuốc thành công',
      data: record
    });
  });

  // Hủy đơn thuốc
  cancelPrescription = asyncHandler(async (req, res) => {
    const { prescriptionId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const prescription = await prescriptionService.cancelPrescription(
      prescriptionId,
      reason,
      userId
    );

    res.json({
      success: true,
      message: 'Hủy đơn thuốc thành công',
      data: prescription
    });
  });

  // Lấy lịch sử sử dụng thuốc
  getMedicationHistory = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const { page, limit, medicationId } = req.query;

    const result = await prescriptionService.getMedicationHistory(patientId, {
      page, limit, medicationId
    });

    res.json({
      success: true,
      data: result
    });
  });

  // Kiểm tra thuốc có trong danh mục bảo hiểm
  checkMedicationCoverage = asyncHandler(async (req, res) => {
    const { patientId, medicationId } = req.params;

    const coverage = await prescriptionService.checkMedicationCoverage(
      patientId,
      medicationId
    );

    res.json({
      success: true,
      data: coverage
    });
  });

  // Cập nhật trạng thái phát thuốc
  updateDispenseStatus = asyncHandler(async (req, res) => {
    const { prescriptionId } = req.params;
    const { status } = req.body;
    const pharmacistId = req.user._id;

    const prescription = await prescriptionService.updateDispenseStatus(
      prescriptionId,
      status,
      pharmacistId
    );

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: prescription
    });
  });

  // Kiểm tra số lượng thuốc tồn kho
  getMedicationStock = asyncHandler(async (req, res) => {
    const { medicationId } = req.params;

    const stock = await prescriptionService.getMedicationStock(medicationId);

    res.json({
      success: true,
      data: stock
    });
  });

  // Thêm thuốc mới vào kho
  addMedication = asyncHandler(async (req, res) => {
    const medicationData = req.body;
    const userId = req.user._id;

    const medication = await prescriptionService.addMedication(medicationData, userId);

    res.status(201).json({
      success: true,
      message: 'Thêm thuốc thành công',
      data: medication
    });
  });

  // Cập nhật thông tin thuốc
  updateMedication = asyncHandler(async (req, res) => {
    const { medicationId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;

    const medication = await prescriptionService.updateMedication(
      medicationId,
      updateData,
      userId
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin thuốc thành công',
      data: medication
    });
  });
}

module.exports = new PrescriptionController();