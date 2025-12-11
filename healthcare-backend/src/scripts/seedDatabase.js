/**
 * 🌱 DATABASE SEEDING SCRIPT
 * Thêm dữ liệu mẫu vào database để test
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const moment = require('moment');

// Import models
const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Appointment = require('../models/appointment.model');
const Bill = require('../models/bill.model');
const Medication = require('../models/medication.model');
const Prescription = require('../models/prescription.model');
const LabTest = require('../models/labTest.model');
const LabOrder = require('../models/labOrder.model');
const MedicalRecord = require('../models/medicalRecord.model');

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luanvo100404_db_user:Maicodon1@healthcare.cbkysul.mongodb.net/healthcare?retryWrites=true&w=majority';

// Kết nối database
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Xóa dữ liệu cũ
async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Bill.deleteMany({});
    await Medication.deleteMany({});
    await Prescription.deleteMany({});
    await LabTest.deleteMany({});
    await LabOrder.deleteMany({});
    await MedicalRecord.deleteMany({});
    console.log('🗑️  Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}

// Tạo Super Admin
async function createSuperAdmin() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const superAdmin = new User({
    email: 'admin@hospital.com',
    password: hashedPassword,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    personalInfo: {
      firstName: 'Super',
      lastName: 'Admin',
      phone: '0900000000',
      dateOfBirth: '1980-01-01',
      gender: 'MALE'
    }
  });

  await superAdmin.save();
  console.log('✅ Super Admin created: admin@hospital.com / Admin@123');
  return superAdmin;
}

// Tạo Doctors
async function createDoctors() {
  const hashedPassword = await bcrypt.hash('Doctor@123', 10);
  const departments = ['CARDIOLOGY', 'PEDIATRICS', 'GENERAL', 'SURGERY', 'ORTHOPEDICS'];
  const doctors = [];

  for (let i = 1; i <= 10; i++) {
    const doctor = new User({
      email: `doctor${i}@hospital.com`,
      password: hashedPassword,
      role: 'DOCTOR',
      status: 'ACTIVE',
      personalInfo: {
        firstName: `Bác sĩ ${i}`,
        lastName: i % 2 === 0 ? 'Nguyễn' : 'Trần',
        phone: `090000${String(i).padStart(4, '0')}`,
        dateOfBirth: `198${i % 10}-0${(i % 12) + 1}-15`,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE'
      },
      professionalInfo: {
        specialization: departments[i % departments.length],
        department: departments[i % departments.length],
        licenseNumber: `MD-${String(i).padStart(6, '0')}`,
        yearsOfExperience: 5 + (i % 10)
      }
    });

    await doctor.save();
    doctors.push(doctor);
  }

  console.log(`✅ Created ${doctors.length} doctors`);
  return doctors;
}

// Tạo Nurses
async function createNurses() {
  const hashedPassword = await bcrypt.hash('Nurse@123', 10);
  const nurses = [];

  for (let i = 1; i <= 15; i++) {
    const nurse = new User({
      email: `nurse${i}@hospital.com`,
      password: hashedPassword,
      role: 'NURSE',
      status: 'ACTIVE',
      personalInfo: {
        firstName: `Điều dưỡng ${i}`,
        lastName: i % 3 === 0 ? 'Lê' : i % 3 === 1 ? 'Phạm' : 'Hoàng',
        phone: `091000${String(i).padStart(4, '0')}`,
        dateOfBirth: `199${i % 10}-0${(i % 12) + 1}-20`,
        gender: i % 3 === 0 ? 'MALE' : 'FEMALE'
      },
      professionalInfo: {
        department: ['CARDIOLOGY', 'PEDIATRICS', 'GENERAL'][i % 3],
        licenseNumber: `RN-${String(i).padStart(6, '0')}`,
        yearsOfExperience: 2 + (i % 8)
      }
    });

    await nurse.save();
    nurses.push(nurse);
  }

  console.log(`✅ Created ${nurses.length} nurses`);
  return nurses;
}

// Tạo Receptionists
async function createReceptionists() {
  const hashedPassword = await bcrypt.hash('Reception@123', 10);
  const receptionists = [];

  for (let i = 1; i <= 5; i++) {
    const receptionist = new User({
      email: `receptionist${i}@hospital.com`,
      password: hashedPassword,
      role: 'RECEPTIONIST',
      status: 'ACTIVE',
      personalInfo: {
        firstName: `Lễ tân ${i}`,
        lastName: i % 2 === 0 ? 'Vũ' : 'Đỗ',
        phone: `092000${String(i).padStart(4, '0')}`,
        dateOfBirth: `199${i % 10}-0${(i % 12) + 1}-10`,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE'
      }
    });

    await receptionist.save();
    receptionists.push(receptionist);
  }

  console.log(`✅ Created ${receptionists.length} receptionists`);
  return receptionists;
}

// Tạo Lab Technicians
async function createLabTechnicians() {
  const hashedPassword = await bcrypt.hash('Lab@123', 10);
  const labTechs = [];
  const departments = ['HEMATOLOGY', 'BIOCHEMISTRY', 'MICROBIOLOGY'];

  for (let i = 1; i <= 5; i++) {
    const labTech = new User({
      email: `lab${i}@hospital.com`,
      password: hashedPassword,
      role: 'LAB_TECHNICIAN',
      status: 'ACTIVE',
      personalInfo: {
        firstName: `KTV ${i}`,
        lastName: i % 2 === 0 ? 'Ngô' : 'Dương',
        phone: `093000${String(i).padStart(4, '0')}`,
        dateOfBirth: `199${i % 10}-0${(i % 12) + 1}-05`,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE'
      },
      professionalInfo: {
        department: departments[i % departments.length],
        licenseNumber: `LT-${String(i).padStart(6, '0')}`,
        yearsOfExperience: 2 + (i % 5)
      }
    });

    await labTech.save();
    labTechs.push(labTech);
  }

  console.log(`✅ Created ${labTechs.length} lab technicians`);
  return labTechs;
}

// Tạo Pharmacists
async function createPharmacists() {
  const hashedPassword = await bcrypt.hash('Pharmacy@123', 10);
  const pharmacists = [];

  for (let i = 1; i <= 3; i++) {
    const pharmacist = new User({
      email: `pharmacist${i}@hospital.com`,
      password: hashedPassword,
      role: 'PHARMACIST',
      status: 'ACTIVE',
      personalInfo: {
        firstName: `Dược sĩ ${i}`,
        lastName: i % 2 === 0 ? 'Lý' : 'Trịnh',
        phone: `094000${String(i).padStart(4, '0')}`,
        dateOfBirth: `198${i % 10}-0${(i % 12) + 1}-15`,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE'
      },
      professionalInfo: {
        licenseNumber: `PH-${String(i).padStart(6, '0')}`,
        yearsOfExperience: 3 + (i % 7)
      }
    });

    await pharmacist.save();
    pharmacists.push(pharmacist);
  }

  console.log(`✅ Created ${pharmacists.length} pharmacists`);
  return pharmacists;
}

// Tạo Billing Staff
async function createBillingStaff() {
  const hashedPassword = await bcrypt.hash('Billing@123', 10);
  const billingStaff = [];

  for (let i = 1; i <= 3; i++) {
    const billing = new User({
      email: `billing${i}@hospital.com`,
      password: hashedPassword,
      role: 'BILLING_STAFF',
      status: 'ACTIVE',
      personalInfo: {
        firstName: `NV Thanh toán ${i}`,
        lastName: i % 2 === 0 ? 'Cao' : 'Phan',
        phone: `094000${String(i).padStart(4, '0')}`,
        dateOfBirth: `199${i % 10}-0${(i % 12) + 1}-20`,
        gender: i % 2 === 0 ? 'FEMALE' : 'MALE'
      }
    });

    await billing.save();
    billingStaff.push(billing);
  }

  console.log(`✅ Created ${billingStaff.length} billing staff`);
  return billingStaff;
}

// Tạo Admin Staff
async function createAdminStaff() {
  const hashedPassword = await bcrypt.hash('AdminStaff@123', 10);
  const adminStaff = [];

  for (let i = 1; i <= 2; i++) {
    const admin = new User({
      email: `adminstaff${i}@hospital.com`,
      password: hashedPassword,
      role: 'HOSPITAL_ADMIN',
      status: 'ACTIVE',
      personalInfo: {
        firstName: `Quản trị ${i}`,
        lastName: i % 2 === 0 ? 'Mai' : 'Đặng',
        phone: `095000${String(i).padStart(4, '0')}`,
        dateOfBirth: `198${i % 10}-0${(i % 12) + 1}-01`,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE'
      }
    });

    await admin.save();
    adminStaff.push(admin);
  }

  console.log(`✅ Created ${adminStaff.length} admin staff`);
  return adminStaff;
}

// Tạo Patients
async function createPatients(adminUser) {
  const hashedPassword = await bcrypt.hash('Patient@123', 10);
  const patients = [];
  const firstNames = ['Bệnh nhân'];
  const lastNames = ['Võ', 'Tô', 'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ'];
  const bloodTypes = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

  for (let i = 1; i <= 20; i++) {
    // Create User
    const user = new User({
      email: `patient${i}@hospital.com`,
      password: hashedPassword,
      role: 'PATIENT',
      status: 'ACTIVE',
      personalInfo: {
        firstName: `${firstNames[0]} ${i}`,
        lastName: lastNames[i % lastNames.length],
        phone: `096000${String(i).padStart(4, '0')}`,
        dateOfBirth: `19${70 + (i % 30)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        address: {
          street: `${i} Đường ABC`,
          city: 'Hồ Chí Minh',
          state: `Quận ${(i % 12) + 1}`,
          country: 'Vietnam'
        },
        identityCard: String(100000000 + i).padStart(12, '0')
      }
    });

    await user.save();

    // Create Patient Profile
    const patient = new Patient({
      userId: user._id,
      patientId: `P-${String(i).padStart(6, '0')}`,
      bloodType: bloodTypes[i % bloodTypes.length],
      height: 150 + (i % 40),
      weight: 45 + (i % 40),
      createdBy: adminUser._id,
      vitalSigns: {
        bloodPressure: `${110 + (i % 30)}/${70 + (i % 20)}`,
        heartRate: 60 + (i % 40),
        temperature: 36 + (i % 2),
        respiratoryRate: 16 + (i % 8),
        oxygenSaturation: 95 + (i % 5)
      },
      allergies: i % 5 === 0 ? [{
        allergen: 'Penicillin',
        severity: 'MODERATE',
        reaction: 'Phát ban',
        isActive: true
      }] : [],
      insurance: i % 3 === 0 ? {
        provider: 'BHYT',
        policyNumber: `VN${String(1000000000000 + i).padStart(15, '0')}`,
        verificationStatus: 'VERIFIED',
        effectiveDate: moment().subtract(1, 'year').toDate(),
        expirationDate: moment().add(1, 'year').toDate()
      } : undefined,
      admissionStatus: i % 10 === 0 ? 'ADMITTED' : 'DISCHARGED',
      currentAdmission: i % 10 === 0 ? {
        admissionDate: moment().subtract(i % 5, 'days').toDate(),
        department: ['CARDIOLOGY', 'GENERAL', 'SURGERY'][i % 3],
        room: `${100 + (i % 50)}`,
        bed: `A${(i % 4) + 1}`,
        diagnosis: 'Theo dõi sức khỏe'
      } : undefined
    });

    await patient.save();
    patients.push({ user, patient });
  }

  console.log(`✅ Created ${patients.length} patients`);
  return patients;
}

// Tạo Appointments
async function createAppointments(patients, doctors, adminUser) {
  const appointments = [];
  const statuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  const types = ['CONSULTATION', 'FOLLOW_UP', 'CHECKUP', 'TEST'];
  const locations = ['Phòng khám 101', 'Phòng khám 102', 'Phòng khám 201', 'Phòng khám 202', 'Phòng khám 301'];
  const reasons = [
    'Khám tổng quát',
    'Tái khám',
    'Khám bệnh',
    'Tư vấn sức khỏe',
    'Tiêm chủng',
    'Xét nghiệm'
  ];

  for (let i = 0; i < 100; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctors[i % doctors.length];
    const daysOffset = -7 + (i % 14); // Từ 7 ngày trước đến 7 ngày sau

    const appointment = new Appointment({
      appointmentId: `APT${String(i + 1).padStart(8, '0')}`,
      patientId: patient.user._id,
      doctorId: doctor._id,
      department: doctor.professionalInfo.department,
      appointmentDate: moment().add(daysOffset, 'days').toDate(),
      type: types[i % types.length],
      location: locations[i % locations.length],
      room: `Phòng ${101 + (i % 10)}`,
      status: daysOffset < 0 ? statuses[2] : statuses[i % 2], // Past = COMPLETED
      reason: reasons[i % reasons.length],
      notes: i % 3 === 0 ? 'Bệnh nhân cần nhịn đói' : '',
      createdBy: adminUser._id
    });

    await appointment.save();
    appointments.push(appointment);
  }

  console.log(`✅ Created ${appointments.length} appointments`);
  return appointments;
}

// Tạo Bills
async function createBills(patients, adminUser) {
  const bills = [];
  const statuses = ['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'PARTIAL'];
  const billTypes = ['CONSULTATION', 'LABORATORY', 'PHARMACY', 'PROCEDURE'];

  for (let i = 0; i < 80; i++) {
    const patient = patients[i % patients.length];
    const hasInsurance = patient.patient.insurance?.verificationStatus === 'VERIFIED';
    
    const services = [
      {
        serviceCode: 'SVC001',
        serviceName: 'Phí khám bệnh',
        description: 'Khám tổng quát',
        quantity: 1,
        unitPrice: 200000,
        discount: 0,
        taxRate: 10,
        total: 200000
      },
      {
        serviceCode: 'SVC002',
        serviceName: 'Thuốc điều trị',
        description: 'Thuốc theo đơn',
        quantity: 2,
        unitPrice: 150000,
        discount: 0,
        taxRate: 10,
        total: 300000
      }
    ];

    if (i % 5 === 0) {
      services.push({
        serviceCode: 'SVC003',
        serviceName: 'Xét nghiệm máu',
        description: 'Xét nghiệm tổng quát',
        quantity: 1,
        unitPrice: 250000,
        discount: 0,
        taxRate: 10,
        total: 250000
      });
    }

    const subtotal = services.reduce((sum, item) => sum + item.total, 0);
    const totalTax = subtotal * 0.1;
    const insuranceCoverage = hasInsurance ? subtotal * 0.7 : 0;
    const grandTotal = subtotal + totalTax;
    const amountPaid = i < 60 ? grandTotal : 0;
    const balanceDue = grandTotal - amountPaid - insuranceCoverage;

    const bill = new Bill({
      billId: `BILL${String(i + 1).padStart(8, '0')}`,
      patientId: patient.user._id,
      billType: billTypes[i % billTypes.length],
      services: services,
      subtotal: subtotal,
      totalDiscount: 0,
      totalTax: totalTax,
      grandTotal: grandTotal,
      amountPaid: amountPaid,
      balanceDue: balanceDue,
      status: i < 60 ? 'PAID' : statuses[i % 3],
      issueDate: moment().subtract(i % 30, 'days').toDate(),
      dueDate: moment().subtract(i % 30, 'days').add(30, 'days').toDate(),
      createdBy: adminUser._id,
      insurance: hasInsurance ? {
        provider: 'BHYT',
        policyNumber: patient.patient.insurance.policyNumber,
        coverageAmount: insuranceCoverage,
        deductible: 0,
        coPayment: balanceDue
      } : undefined
    });

    await bill.save();
    bills.push(bill);
  }

  console.log(`✅ Created ${bills.length} bills`);
  return bills;
}

// Tạo Medications
async function createMedications() {
  const medications = [
    {
      medicationId: 'MED000001',
      name: 'Paracetamol 500mg',
      genericName: 'Paracetamol',
      category: 'ANALGESIC',
      type: 'TABLET',
      strength: { value: 500, unit: 'mg' },
      pricing: { sellingPrice: 5000, insurancePrice: 3500 },
      stock: { current: 10000, reorderLevel: 1000 }
    },
    {
      medicationId: 'MED000002',
      name: 'Amoxicillin 500mg',
      genericName: 'Amoxicillin',
      category: 'ANTIBIOTIC',
      type: 'CAPSULE',
      strength: { value: 500, unit: 'mg' },
      pricing: { sellingPrice: 8000, insurancePrice: 5600 },
      stock: { current: 5000, reorderLevel: 500 }
    },
    {
      medicationId: 'MED000003',
      name: 'Omeprazole 20mg',
      genericName: 'Omeprazole',
      category: 'GASTROINTESTINAL',
      type: 'CAPSULE',
      strength: { value: 20, unit: 'mg' },
      pricing: { sellingPrice: 12000, insurancePrice: 8400 },
      stock: { current: 3000, reorderLevel: 300 }
    },
    {
      medicationId: 'MED000004',
      name: 'Ibuprofen 400mg',
      genericName: 'Ibuprofen',
      category: 'ANALGESIC',
      type: 'TABLET',
      strength: { value: 400, unit: 'mg' },
      pricing: { sellingPrice: 6000, insurancePrice: 4200 },
      stock: { current: 8000, reorderLevel: 800 }
    },
    {
      medicationId: 'MED000005',
      name: 'Metformin 500mg',
      genericName: 'Metformin',
      category: 'ANTIDIABETIC',
      type: 'TABLET',
      strength: { value: 500, unit: 'mg' },
      pricing: { sellingPrice: 7000, insurancePrice: 4900 },
      stock: { current: 6000, reorderLevel: 600 },
      insurance: { covered: true }
    }
  ];

  for (const medData of medications) {
    const medication = new Medication(medData);
    await medication.save();
  }

  console.log(`✅ Created ${medications.length} medications`);
}

// Tạo Lab Tests
async function createLabTests() {
  const labTests = [
    {
      testId: 'LAB000001',
      name: 'Complete Blood Count',
      code: 'CBC',
      category: 'HEMATOLOGY',
      specimenType: 'BLOOD',
      description: 'Công thức máu toàn phần',
      turnaroundTime: 24,
      pricing: { price: 250000, insurancePrice: 175000 },
      referenceRanges: [
        { gender: 'BOTH', minValue: 4.5, maxValue: 11.0, unit: '10^9/L', conditions: 'WBC' },
        { gender: 'BOTH', minValue: 4.5, maxValue: 5.9, unit: '10^12/L', conditions: 'RBC' },
        { gender: 'MALE', minValue: 13.0, maxValue: 17.0, unit: 'g/dL', conditions: 'Hemoglobin' },
        { gender: 'FEMALE', minValue: 12.0, maxValue: 16.0, unit: 'g/dL', conditions: 'Hemoglobin' }
      ]
    },
    {
      testId: 'LAB000002',
      name: 'Blood Glucose Test',
      code: 'GLUCOSE',
      category: 'CHEMISTRY',
      specimenType: 'BLOOD',
      description: 'Xét nghiệm đường huyết',
      turnaroundTime: 12,
      pricing: { price: 150000, insurancePrice: 105000 },
      referenceRanges: [
        { gender: 'BOTH', minValue: 70, maxValue: 100, unit: 'mg/dL', conditions: 'Fasting Glucose' }
      ]
    },
    {
      testId: 'LAB000003',
      name: 'Lipid Panel',
      code: 'LIPID',
      category: 'CHEMISTRY',
      specimenType: 'BLOOD',
      description: 'Xét nghiệm Lipid máu',
      turnaroundTime: 24,
      pricing: { price: 300000, insurancePrice: 210000 },
      referenceRanges: [
        { gender: 'BOTH', minValue: 0, maxValue: 200, unit: 'mg/dL', conditions: 'Total Cholesterol' },
        { gender: 'BOTH', minValue: 0, maxValue: 100, unit: 'mg/dL', conditions: 'LDL' },
        { gender: 'BOTH', minValue: 40, maxValue: 200, unit: 'mg/dL', conditions: 'HDL' }
      ]
    }
  ];

  for (const testData of labTests) {
    const labTest = new LabTest(testData);
    await labTest.save();
  }

  console.log(`✅ Created ${labTests.length} lab tests`);
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    await connectDB();
    await clearDatabase();

    // Seed data
    const superAdmin = await createSuperAdmin();
    const doctors = await createDoctors();
    const nurses = await createNurses();
    const receptionists = await createReceptionists();
    const labTechs = await createLabTechnicians();
    const pharmacists = await createPharmacists();
    const billingStaff = await createBillingStaff();
    const adminStaff = await createAdminStaff();
    const patients = await createPatients(superAdmin);
    const appointments = await createAppointments(patients, doctors, superAdmin);
    const bills = await createBills(patients, superAdmin);
    await createMedications();
    await createLabTests();

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - 1 Super Admin`);
    console.log(`   - ${doctors.length} Doctors`);
    console.log(`   - ${nurses.length} Nurses`);
    console.log(`   - ${receptionists.length} Receptionists`);
    console.log(`   - ${labTechs.length} Lab Technicians`);
    console.log(`   - ${pharmacists.length} Pharmacists`);
    console.log(`   - ${billingStaff.length} Billing Staff`);
    console.log(`   - ${adminStaff.length} Admin Staff`);
    console.log(`   - ${patients.length} Patients`);
    console.log(`   - ${appointments.length} Appointments`);
    console.log(`   - ${bills.length} Bills`);
    console.log(`   - 5 Medications`);
    console.log(`   - 3 Lab Tests`);
    console.log('\n🔑 Login credentials:');
    console.log('   Super Admin: admin@hospital.com / Admin@123');
    console.log('   Doctor: doctor1@hospital.com / Doctor@123');
    console.log('   Nurse: nurse1@hospital.com / Nurse@123');
    console.log('   Receptionist: receptionist1@hospital.com / Reception@123');
    console.log('   Lab Tech: lab1@hospital.com / Lab@123');
    console.log('   Pharmacist: pharmacist1@hospital.com / Pharmacy@123');
    console.log('   Billing: billing1@hospital.com / Billing@123');
    console.log('   Admin Staff: adminstaff1@hospital.com / AdminStaff@123');
    console.log('   Patient: patient1@hospital.com / Patient@123');
    console.log('\n📄 Full account list: See TEST_ACCOUNTS.md');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
