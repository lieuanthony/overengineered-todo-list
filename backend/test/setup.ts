process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-key";
process.env.CLIENT_URL = "http://localhost:3000";

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

// Suppress console.error in tests unless explicitly needed
// (keeps output clean; remove if you want to see service-level error logs)