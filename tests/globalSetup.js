const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async () => {
  const mongo = await MongoMemoryServer.create();

  globalThis.__MONGO_INSTANCE__ = mongo;

  process.env.NODE_ENV = "test";
  process.env.SESSION_SECRET = "test-session-secret";
  process.env.MONGODB_URI = mongo.getUri("chatapp_test");
};
