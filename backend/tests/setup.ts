import "dotenv/config";

// Ensure required env vars exist before any module imports getEnv().
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret-key-min-8";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS ?? "http://localhost:3000";
process.env.PORT = process.env.PORT ?? "4000";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run tests. Copy backend/.env.example to backend/.env and set Neon credentials.");
}
