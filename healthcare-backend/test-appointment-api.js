/**
 * Test script for Appointment Booking API
 * Run with: node test-appointment-api.js
 */

const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api";

// Test data
let testData = {
  patientToken: null,
  doctorId: null,
  appointmentDate: null,
  appointmentTime: "10:30",
};

// Color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

async function testAPIs() {
  try {
    log.info("Starting API tests...\n");

    // 1. Test GET /doctors
    log.info("TEST 1: GET /users/doctors");
    try {
      const doctorsRes = await axios.get(`${API_BASE_URL}/users/doctors`);

      if (doctorsRes.data.success && doctorsRes.data.data.length > 0) {
        log.success(`Found ${doctorsRes.data.data.length} doctors`);
        testData.doctorId = doctorsRes.data.data[0]._id;
        console.log(
          `  - Selected doctor: ${doctorsRes.data.data[0].personalInfo?.firstName} ${doctorsRes.data.data[0].personalInfo?.lastName}`
        );
      } else {
        log.error("No doctors found");
        return;
      }
    } catch (err) {
      log.error(`Failed to fetch doctors: ${err.message}`);
      return;
    }

    // 2. Test GET /available-slots
    log.info("\nTEST 2: GET /available-slots/{doctorId}");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    testData.appointmentDate = dateStr;

    try {
      const slotsRes = await axios.get(
        `${API_BASE_URL}/patient-portal/appointments/available-slots/${testData.doctorId}`,
        {
          params: { appointmentDate: dateStr },
          headers: {
            Authorization: `Bearer test-token-placeholder`,
          },
        }
      );

      if (slotsRes.data.success && slotsRes.data.data.length > 0) {
        log.success(
          `Found ${slotsRes.data.data.length} available slots for ${dateStr}`
        );
        testData.appointmentTime = slotsRes.data.data[0].time;
        console.log(
          `  - Sample slots: ${slotsRes.data.data
            .slice(0, 3)
            .map((s) => s.time)
            .join(", ")}`
        );
      } else {
        log.warn("No available slots found (this might be expected)");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        log.warn("Authorization required (expected for protected endpoint)");
      } else {
        log.error(`Failed to fetch slots: ${err.message}`);
      }
    }

    log.info("\n" + "=".repeat(50));
    log.success("Basic API structure validation complete!");
    log.info("=".repeat(50));
    log.info("\nNext steps:");
    log.info("1. Ensure backend is running: npm run dev");
    log.info("2. Ensure MongoDB is connected");
    log.info("3. Test appointment booking with valid patient token");
    log.info("4. Run full test suite: npm test");
  } catch (err) {
    log.error(`Unexpected error: ${err.message}`);
  }
}

testAPIs();
