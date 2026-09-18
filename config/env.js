// quiet: dotenv 17 otherwise prints a promotional line on every boot.
require("dotenv").config({ quiet: true });

const DEFAULT_SESSION_SECRET = "insecure-development-secret";

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const env = {
  nodeEnv,
  isProduction,
  isTest: nodeEnv === "test",
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chatapp",
  sessionSecret: process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET,
  sessionMaxAge: Number(process.env.SESSION_MAX_AGE) || 1000 * 60 * 60 * 24 * 7,
  uploadMaxBytes: Number(process.env.UPLOAD_MAX_BYTES) || 2 * 1024 * 1024,
  trustProxy: process.env.TRUST_PROXY === "true",
};

// A production deployment must never fall back to the built-in defaults:
// a shared session secret lets anyone forge a session cookie.
if (isProduction) {
  const missing = [];

  if (!process.env.MONGODB_URI) missing.push("MONGODB_URI");
  if (!process.env.SESSION_SECRET || env.sessionSecret === DEFAULT_SESSION_SECRET) {
    missing.push("SESSION_SECRET");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(", ")}. ` +
        "See .env.example for the full list."
    );
  }
}

module.exports = env;
