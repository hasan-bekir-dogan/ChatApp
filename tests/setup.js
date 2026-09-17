const mongoose = require("mongoose");
const { sessionStore } = require("../app");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterEach(async () => {
  const { collections } = mongoose.connection;

  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
});

afterAll(async () => {
  // The session store keeps its own MongoDB connection; without closing it
  // Jest would report open handles and hang after the last test.
  await sessionStore.close();
  await mongoose.disconnect();
});
