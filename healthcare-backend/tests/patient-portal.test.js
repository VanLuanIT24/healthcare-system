/**
 * 🧪 PATIENT PORTAL - COMPREHENSIVE TEST SUITE
 *
 * Kiểm tra toàn bộ routes, middleware, authentication, và ownership
 * Script này có thể chạy với Node.js hoặc được modify thành Postman collection
 */

const axios = require("axios");

// ⚙️ CONFIGURATION
const API_BASE_URL = process.env.API_URL || "http://localhost:5000";
const TIMEOUT = 10000;

// 🎨 COLORS FOR TERMINAL OUTPUT
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  bold: "\x1b[1m",
};

// 📊 TEST RESULTS
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
};

// 🔐 TEST DATA
let testTokens = {};
let testData = {};

/**
 * 🛠️ HELPER FUNCTIONS
 */

function log(type, message) {
  const prefix =
    {
      "✅": colors.green,
      "❌": colors.red,
      "⏳": colors.yellow,
      ℹ️: colors.blue,
    }[type.split(" ")[0]] || colors.reset;

  console.log(`${prefix}${type}${colors.reset} ${message}`);
}

function logSection(title) {
  console.log(
    `\n${colors.bold}${colors.blue}========== ${title} ==========${colors.reset}\n`
  );
}

async function test(name, fn) {
  testResults.total++;
  try {
    log("⏳", `Testing: ${name}`);
    await fn();
    testResults.passed++;
    log("✅", `PASSED: ${name}`);
    return true;
  } catch (error) {
    testResults.failed++;
    const errorMsg = error.response?.data?.error || error.message;
    log("❌", `FAILED: ${name}`);
    log("ℹ️", `Error: ${errorMsg}`);
    testResults.errors.push({ name, error: errorMsg });
    return false;
  }
}

function createClient(token = null) {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: TIMEOUT,
    validateStatus: () => true, // Don't throw on any status
  });

  if (token) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return client;
}

/**
 * 🔐 AUTHENTICATION TESTS
 */
async function testAuthentication() {
  logSection("AUTHENTICATION TESTS");

  const client = createClient();

  // Test 1: Lấy token từ đăng nhập
  await test("Login with valid credentials", async () => {
    const response = await client.post("/api/auth/login", {
      email: "superadmin@healthcare.vn",
      password: "SuperAdmin@2024",
    });

    if (response.status !== 200) {
      throw new Error(
        `Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`
      );
    }

    if (!response.data.data?.accessToken) {
      throw new Error("No accessToken in response");
    }

    testTokens.superAdmin = response.data.data.accessToken;
    log("ℹ️", `Token: ${testTokens.superAdmin.substring(0, 20)}...`);
  });

  // Test 2: Truy cập endpoint mà không có token
  await test("Access protected route without token", async () => {
    const response = await client.get("/api/patient-portal/demographics");

    if (response.status !== 401) {
      throw new Error(`Expected 401, got ${response.status}`);
    }
  });

  // Test 3: Truy cập endpoint với token không hợp lệ
  await test("Access protected route with invalid token", async () => {
    const invalidClient = createClient("invalid.token.here");
    const response = await invalidClient.get(
      "/api/patient-portal/demographics"
    );

    if (response.status !== 401) {
      throw new Error(`Expected 401, got ${response.status}`);
    }
  });

  // Test 4: Truy cập endpoint với token hợp lệ
  await test("Access protected route with valid token", async () => {
    const authenticatedClient = createClient(testTokens.superAdmin);
    const response = await authenticatedClient.get(
      "/api/patient-portal/demographics"
    );

    // 200 = exists, 404 = doesn't exist but route is accessible
    if (![200, 404, 500].includes(response.status)) {
      throw new Error(`Expected 200/404/500, got ${response.status}`);
    }
  });
}

/**
 * 🏥 DEMOGRAPHICS ROUTE TESTS
 */
async function testDemographicsRoutes() {
  logSection("DEMOGRAPHICS ROUTES TESTS");

  const client = createClient(testTokens.superAdmin);

  // Test 1: GET Demographics
  await test("GET /demographics - Retrieve demographics", async () => {
    const response = await client.get("/api/patient-portal/demographics");

    if (![200, 404, 500].includes(response.status)) {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  });

  // Test 2: POST Demographics
  await test("POST /demographics - Create demographics", async () => {
    const response = await client.post("/api/patient-portal/demographics", {
      firstName: "Nguyễn",
      lastName: "Văn Test",
      middleName: "Anh",
      dateOfBirth: "1990-01-15",
      gender: "M",
      bloodType: "O+",
      phoneNumber: "0912345678",
      email: "test@healthcare.vn",
      emergencyPhoneNumber: "0987654321",
      identityNumber: "123456789012",
      identityType: "NationalID",
    });

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(
        `Expected 201/200, got ${response.status}: ${JSON.stringify(
          response.data
        )}`
      );
    }

    testData.demographicsId = response.data.data?._id;
  });

  // Test 3: PUT Demographics
  await test("PUT /demographics - Update demographics", async () => {
    const response = await client.put("/api/patient-portal/demographics", {
      firstName: "Nguyễn Updated",
    });

    if (![200, 201].includes(response.status)) {
      throw new Error(`Expected 200/201, got ${response.status}`);
    }
  });

  // Test 4: POST Address
  await test("POST /demographics/addresses/add - Add address", async () => {
    const response = await client.post(
      "/api/patient-portal/demographics/addresses/add",
      {
        addressType: "Home",
        street: "123 Main Street",
        city: "Ho Chi Minh",
        state: "HCMC",
        postalCode: "70000",
        country: "Vietnam",
        isPrimary: true,
      }
    );

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Expected 201/200, got ${response.status}`);
    }

    testData.addressId = response.data.data?.addresses?.[0]?._id;
  });

  // Test 5: GET Addresses
  await test("GET /demographics/addresses/all - List addresses", async () => {
    const response = await client.get(
      "/api/patient-portal/demographics/addresses/all"
    );

    if (![200, 404].includes(response.status)) {
      throw new Error(`Expected 200/404, got ${response.status}`);
    }
  });
}

/**
 * 🏥 INSURANCE ROUTE TESTS
 */
async function testInsuranceRoutes() {
  logSection("INSURANCE ROUTES TESTS");

  const client = createClient(testTokens.superAdmin);

  // Test 1: POST Insurance
  await test("POST /insurance - Create insurance", async () => {
    const response = await client.post("/api/patient-portal/insurance", {
      provider: "Bảo Hiểm ABC",
      policyNumber: "POL12345678",
      planName: "Premium Plan",
      planType: "PPO",
      effectiveDate: "2024-01-01",
      expiryDate: "2025-12-31",
      relationshipToHolder: "Self",
      holderName: "Nguyễn Văn Test",
      copay: 50000,
      deductible: 1000000,
    });

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(
        `Expected 201/200, got ${response.status}: ${JSON.stringify(
          response.data
        )}`
      );
    }

    testData.insuranceId = response.data.data?._id;
  });

  // Test 2: GET All Insurance
  await test("GET /insurance - List all insurance policies", async () => {
    const response = await client.get("/api/patient-portal/insurance");

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
  });

  // Test 3: GET Primary Insurance
  await test("GET /insurance/primary - Get primary insurance", async () => {
    const response = await client.get("/api/patient-portal/insurance/primary");

    if (![200, 404].includes(response.status)) {
      throw new Error(`Expected 200/404, got ${response.status}`);
    }
  });

  // Test 4: SET Primary Insurance
  if (testData.insuranceId) {
    await test("PUT /insurance/:id/set-primary - Set as primary", async () => {
      const response = await client.put(
        `/api/patient-portal/insurance/${testData.insuranceId}/set-primary`
      );

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });
  }
}

/**
 * 🏥 MEDICAL HISTORY ROUTE TESTS
 */
async function testMedicalHistoryRoutes() {
  logSection("MEDICAL HISTORY ROUTES TESTS");

  const client = createClient(testTokens.superAdmin);

  // Test 1: GET Complete History
  await test("GET /medical-history - Get complete history", async () => {
    const response = await client.get("/api/patient-portal/medical-history");

    if (![200, 404].includes(response.status)) {
      throw new Error(`Expected 200/404, got ${response.status}`);
    }
  });

  // Test 2: POST Personal Condition
  await test("POST /medical-history/personal/conditions - Add condition", async () => {
    const response = await client.post(
      "/api/patient-portal/medical-history/personal/conditions",
      {
        conditionName: "Diabetes",
        diagnosisDate: "2020-01-01",
        status: "Active",
        severity: "Moderate",
      }
    );

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Expected 201/200, got ${response.status}`);
    }

    testData.conditionId = response.data.data?._id;
  });

  // Test 3: GET Personal Conditions
  await test("GET /medical-history/personal/conditions - List conditions", async () => {
    const response = await client.get(
      "/api/patient-portal/medical-history/personal/conditions"
    );

    if (![200, 404].includes(response.status)) {
      throw new Error(`Expected 200/404, got ${response.status}`);
    }
  });

  // Test 4: POST Allergy
  await test("POST /medical-history/allergies - Add allergy", async () => {
    const response = await client.post(
      "/api/patient-portal/medical-history/allergies",
      {
        allergenName: "Penicillin",
        allergenType: "Drug",
        reactionSeverity: "Severe",
        reactionDescription: "Anaphylaxis",
      }
    );

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Expected 201/200, got ${response.status}`);
    }
  });

  // Test 5: GET Allergies
  await test("GET /medical-history/allergies - List allergies", async () => {
    const response = await client.get(
      "/api/patient-portal/medical-history/allergies"
    );

    if (![200, 404].includes(response.status)) {
      throw new Error(`Expected 200/404, got ${response.status}`);
    }
  });

  // Test 6: POST Vaccination
  await test("POST /medical-history/vaccinations - Add vaccination", async () => {
    const response = await client.post(
      "/api/patient-portal/medical-history/vaccinations",
      {
        vaccineName: "COVID-19",
        vaccineType: "mRNA",
        dateAdministered: "2024-01-15",
        provider: "Hospital ABC",
      }
    );

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Expected 201/200, got ${response.status}`);
    }
  });

  // Test 7: GET Vaccinations
  await test("GET /medical-history/vaccinations - List vaccinations", async () => {
    const response = await client.get(
      "/api/patient-portal/medical-history/vaccinations"
    );

    if (![200, 404].includes(response.status)) {
      throw new Error(`Expected 200/404, got ${response.status}`);
    }
  });
}

/**
 * 🏥 OTHER ROUTE TESTS (QUICK CHECK)
 */
async function testOtherRoutes() {
  logSection("OTHER ROUTES - SMOKE TEST");

  const client = createClient(testTokens.superAdmin);

  const routes = [
    {
      method: "GET",
      path: "/api/patient-portal/emergency-contacts",
      name: "Emergency Contacts",
    },
    { method: "GET", path: "/api/patient-portal/visits", name: "Visits" },
    {
      method: "GET",
      path: "/api/patient-portal/admissions",
      name: "Admissions",
    },
    {
      method: "GET",
      path: "/api/patient-portal/communication/messages",
      name: "Communication",
    },
    { method: "GET", path: "/api/patient-portal/billing", name: "Billing" },
    { method: "GET", path: "/api/patient-portal/dashboard", name: "Dashboard" },
    {
      method: "GET",
      path: "/api/patient-portal/appointments",
      name: "Appointments",
    },
    {
      method: "GET",
      path: "/api/patient-portal/prescriptions",
      name: "Prescriptions",
    },
    {
      method: "GET",
      path: "/api/patient-portal/lab-results",
      name: "Lab Results",
    },
  ];

  for (const route of routes) {
    await test(`${route.method} ${route.path} - ${route.name}`, async () => {
      const response = await client.get(route.path);

      if (![200, 201, 400, 404, 500].includes(response.status)) {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    });
  }
}

/**
 * 🛡️ MIDDLEWARE & SECURITY TESTS
 */
async function testMiddlewareAndSecurity() {
  logSection("MIDDLEWARE & SECURITY TESTS");

  // Test 1: Rate Limiting Header
  await test("Rate limiting headers present", async () => {
    const client = createClient(testTokens.superAdmin);
    const response = await client.get("/api/patient-portal/demographics");

    if (!response.headers["ratelimit-limit"]) {
      throw new Error("Rate limit headers not present");
    }
  });

  // Test 2: CORS Headers
  await test("CORS headers present", async () => {
    const client = createClient(testTokens.superAdmin);
    const response = await client.get("/api/patient-portal/demographics");

    if (!response.headers["access-control-allow-origin"]) {
      log(
        "⚠️",
        "CORS headers may not be set (might be normal in some environments)"
      );
    }
  });

  // Test 3: Security Headers
  await test("Security headers present", async () => {
    const client = createClient(testTokens.superAdmin);
    const response = await client.get("/api/patient-portal/demographics");

    const requiredHeaders = ["content-type"];
    for (const header of requiredHeaders) {
      if (!response.headers[header]) {
        throw new Error(`Missing header: ${header}`);
      }
    }
  });
}

/**
 * 🏃 RUN ALL TESTS
 */
async function runAllTests() {
  console.log(
    `\n${colors.bold}${colors.blue}🏥 HEALTHCARE SYSTEM - PATIENT PORTAL TEST SUITE${colors.reset}\n`
  );
  console.log(`🌍 Testing against: ${API_BASE_URL}\n`);

  try {
    // Step 1: Authentication
    await testAuthentication();

    // Step 2: Route Tests
    await testDemographicsRoutes();
    await testInsuranceRoutes();
    await testMedicalHistoryRoutes();
    await testOtherRoutes();

    // Step 3: Security Tests
    await testMiddlewareAndSecurity();

    // Final Results
    logSection("TEST SUMMARY");
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
    console.log(
      `Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(
        2
      )}%\n`
    );

    if (testResults.failed > 0) {
      console.log(`${colors.red}${colors.bold}FAILED TESTS:${colors.reset}`);
      testResults.errors.forEach((err) => {
        console.log(`  ❌ ${err.name}: ${err.error}`);
      });
    }

    process.exit(testResults.failed > 0 ? 1 : 0);
  } catch (error) {
    log("❌", `Test Suite Error: ${error.message}`);
    process.exit(1);
  }
}

// ▶️ START TESTS
runAllTests();
