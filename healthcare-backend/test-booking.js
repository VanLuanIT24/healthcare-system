const axios = require("axios");

async function testAppointmentBooking() {
  try {
    console.log("🔍 Testing Appointment Booking Flow...\n");

    // Step 1: Login as admin
    console.log("Step 1: Login as admin...");
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: "admin@healthcare.com",
      password: "@Admin123",
    });
    const token = loginRes.data.data.tokens.accessToken;
    const adminId = loginRes.data.data.user._id;
    console.log("✓ Admin token obtained\n");

    // Step 2: Get doctors
    console.log("Step 2: Get doctors...");
    const doctorsRes = await axios.get(
      "http://localhost:5000/api/users/doctors",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const doctors = doctorsRes.data.data;
    console.log(`✓ Found ${doctors.length} doctors`);

    if (doctors.length === 0) {
      console.log("✗ No doctors available for testing");
      return;
    }

    const doctorId = doctors[0]._id;
    console.log(
      `  Using doctor: ${doctors[0].personalInfo.firstName} ${doctors[0].personalInfo.lastName}\n`
    );

    // Step 3: Get available slots
    console.log("Step 3: Get available slots...");
    const date = new Date();
    date.setDate(date.getDate() + 1); // Tomorrow
    const dateStr = date.toISOString().split("T")[0];

    const slotsRes = await axios.get(
      `http://localhost:5000/api/patient-portal/appointments/available-slots/${doctorId}?appointmentDate=${dateStr}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const slots = slotsRes.data.data;
    console.log(`✓ Found ${slots.length} available slots`);

    if (slots.length === 0) {
      console.log("✗ No slots available for testing");
      return;
    }

    const slot = slots[0];
    console.log(`  Using slot: ${slot.time}\n`);

    // Step 4: Try to book appointment
    console.log("Step 4: Book appointment...");
    const bookingData = {
      doctorId,
      appointmentDate: dateStr,
      appointmentTime: slot.time,
      reason: "Test appointment booking",
      type: "Consultation",
      notes: "This is a test",
    };

    console.log("Booking data:", bookingData);

    const bookRes = await axios.post(
      "http://localhost:5000/api/patient-portal/appointments",
      bookingData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✓ Appointment booked successfully!");
    console.log("  Appointment ID:", bookRes.data.data.appointmentId);
    console.log("  Status:", bookRes.data.data.status);
    console.log("\n🎉 All tests passed!");
  } catch (error) {
    console.error("\n✗ Error:", error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.error("  Errors:", error.response.data.errors);
    }
    console.error("  Stack:", error.response?.data?.stack);
  }
}

testAppointmentBooking();
