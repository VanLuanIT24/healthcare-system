// Setup test environment
process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "test_secret_key_123456";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "test_refresh_key_123456";

// Suppress console output in tests unless debugging
if (!process.env.DEBUG) {
  global.console.log = jest.fn();
  global.console.info = jest.fn();
}

// Set test timeout
jest.setTimeout(10000);
