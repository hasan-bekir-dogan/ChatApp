const http = require("http");

const env = require("./config/env");
const { app, sessionMiddleware, sessionStore } = require("./app");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const { createSocketServer } = require("./config/socket");

const server = http.createServer(app);
const io = createSocketServer(server, sessionMiddleware);

// Controllers reach the Socket.IO instance through the app registry.
app.set("io", io);

async function start() {
  await connectDatabase();
  console.log("Connected to MongoDB.");

  server.listen(env.port, () => {
    console.log(`ChatApp listening on port ${env.port} (${env.nodeEnv}).`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received, shutting down.`);

  io.close();
  server.close();

  try {
    await sessionStore.close();
    await disconnectDatabase();
  } finally {
    process.exit(0);
  }
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});

start().catch((error) => {
  console.error("Failed to start ChatApp:", error);
  process.exit(1);
});
