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

async function test() {
  try {
    // Login
    const loginRes = await makeRequest(
      "POST",
      "/auth/login",
      {},
      {
        email: "admin@healthcare.com",
        password: "@Admin123",
      }
    );
    const token = loginRes.data.data.tokens.accessToken;
    console.log("✅ Logged in");

    // Get appointments
    const appRes = await makeRequest(
      "GET",
      "/patient-portal/appointments?page=1&limit=10",
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("Status:", appRes.status);
    if (appRes.status === 200) {
      console.log("✅ Appointments loaded successfully");
      console.log("Data:", appRes.data);
    } else {
      console.log("❌ Error loading appointments:");
      console.log("Response:", appRes.data);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();
