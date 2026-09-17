module.exports = {
  testEnvironment: "node",
  globalSetup: "<rootDir>/tests/globalSetup.js",
  globalTeardown: "<rootDir>/tests/globalTeardown.js",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 60000,
  collectCoverageFrom: [
    "controllers/**/*.js",
    "middlewares/**/*.js",
    "models/**/*.js",
    "routes/**/*.js",
    "utils/**/*.js",
  ],
};
