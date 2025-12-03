#!/usr/bin/env node

/**
 * 🧪 Test Script for Appointment Booking
 * Tests the complete appointment booking flow
 */

const http = require("http");

function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("🧪 APPOINTMENT BOOKING TEST SUITE\n");
  console.log("=".repeat(50));

  try {
    // Step 1: Login as admin
    console.log("\n📍 Step 1: Login as admin");
    const loginRes = await makeRequest(
      "POST",
      "/auth/login",
      {},
      {
        email: "admin@healthcare.com",
        password: "@Admin123",
      }
    );

    if (loginRes.status !== 200) {
      console.log("❌ Login failed:", loginRes.data);
      return;
    }

    const token = loginRes.data.data.tokens.accessToken;
    console.log("✅ Admin logged in successfully");

    // Step 2: Get doctors
    console.log("\n📍 Step 2: Get available doctors");
    const doctorsRes = await makeRequest("GET", "/users/doctors", {
      Authorization: `Bearer ${token}`,
    });

    if (!doctorsRes.data.success || doctorsRes.data.data.length === 0) {
      console.log("❌ No doctors found");
      return;
    }

    const doctorId = doctorsRes.data.data[0]._id;
    const doctorName = `${doctorsRes.data.data[0].personalInfo.firstName} ${doctorsRes.data.data[0].personalInfo.lastName}`;
    console.log(`✅ Found doctor: ${doctorName}`);

    // Step 3: Get available slots
    console.log("\n📍 Step 3: Get available time slots");
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const dateStr = date.toISOString().split("T")[0];

    const slotsRes = await makeRequest(
      "GET",
      `/patient-portal/appointments/available-slots/${doctorId}?appointmentDate=${dateStr}`,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!slotsRes.data.success || slotsRes.data.data.length === 0) {
      console.log("❌ No available slots found");
      return;
    }

    const timeSlot = slotsRes.data.data[0].time;
    console.log(
      `✅ Found ${slotsRes.data.data.length} available slots, using: ${timeSlot}`
    );

    // Step 4: Book appointment
    console.log("\n📍 Step 4: Book appointment");
    const bookRes = await makeRequest(
      "POST",
      "/patient-portal/appointments",
      {
        Authorization: `Bearer ${token}`,
      },
      {
        doctorId: doctorId,
        appointmentDate: dateStr,
        appointmentTime: timeSlot,
        reason: "Test appointment booking",
        type: "Consultation",
        notes: "This is a test appointment",
      }
    );

    if (bookRes.status === 201 && bookRes.data.success) {
      console.log("✅ Appointment booked successfully!");
      console.log(`   Appointment ID: ${bookRes.data.data.appointmentId}`);
      console.log(`   Status: ${bookRes.data.data.status}`);
      console.log(`   Doctor: ${doctorName}`);
      console.log(`   Date: ${dateStr}`);
      console.log(`   Time: ${timeSlot}`);

      console.log("\n" + "=".repeat(50));
      console.log("🎉 ALL TESTS PASSED!");
      console.log("=".repeat(50));
    } else {
      console.log("❌ Failed to book appointment:");
      console.log(`   Status: ${bookRes.status}`);
      console.log(`   Response:`, bookRes.data);
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
}

runTests();
