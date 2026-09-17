const request = require("supertest");
const { app } = require("../app");
const User = require("../models/User");
const { newAgent, signIn, DEFAULT_PASSWORD } = require("./helpers");

describe("authentication", () => {
  it("registers a user and stores the password hashed", async () => {
    await request(app).post("/users/signup").type("form").send({
      name: "Ada",
      email: "ada@example.com",
      password: DEFAULT_PASSWORD,
      confirmPassword: DEFAULT_PASSWORD,
    });

    const user = await User.findOne({ email: "ada@example.com" });

    expect(user).not.toBeNull();
    expect(user.password).not.toBe(DEFAULT_PASSWORD);
    expect(await user.comparePassword(DEFAULT_PASSWORD)).toBe(true);
  });

  it("rejects a registration when the passwords do not match", async () => {
    await request(app).post("/users/signup").type("form").send({
      name: "Ada",
      email: "mismatch@example.com",
      password: DEFAULT_PASSWORD,
      confirmPassword: "something-else",
    });

    expect(await User.countDocuments({ email: "mismatch@example.com" })).toBe(0);
  });

  it("rejects a registration with a duplicate email", async () => {
    const payload = {
      name: "Ada",
      email: "dup@example.com",
      password: DEFAULT_PASSWORD,
      confirmPassword: DEFAULT_PASSWORD,
    };

    await request(app).post("/users/signup").type("form").send(payload);
    await request(app).post("/users/signup").type("form").send(payload);

    expect(await User.countDocuments({ email: "dup@example.com" })).toBe(1);
  });

  it("signs a registered user in and out", async () => {
    const agent = await signIn(newAgent(), {
      name: "Ada",
      email: "login@example.com",
    });

    const page = await agent.get("/");
    expect(page.status).toBe(200);

    await agent.get("/users/logout");

    const afterLogout = await agent.get("/");
    expect(afterLogout.status).toBe(302);
    expect(afterLogout.headers.location).toBe("/login");
  });

  it("refuses a wrong password", async () => {
    const agent = newAgent();

    await signIn(agent, { name: "Ada", email: "wrong@example.com" });
    await agent.get("/users/logout");

    const response = await agent
      .post("/users/login")
      .type("form")
      .send({ email: "wrong@example.com", password: "not-the-password" });

    expect(response.headers.location).toBe("/login");
    expect((await agent.get("/")).headers.location).toBe("/login");
  });

  it("does not accept a query operator in place of an email", async () => {
    await signIn(newAgent(), { name: "Ada", email: "operator@example.com" });

    const agent = newAgent();
    const response = await agent
      .post("/users/login")
      .send({ email: { $ne: null }, password: DEFAULT_PASSWORD });

    expect(response.headers.location).toBe("/login");
    expect((await agent.get("/")).headers.location).toBe("/login");
  });
});
