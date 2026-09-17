const User = require("../models/User");
const { newAgent, signIn } = require("./helpers");

describe("contacts", () => {
  let alice;

  beforeEach(async () => {
    alice = await signIn(newAgent(), {
      name: "Alice",
      email: "alice@example.com",
    });

    await signIn(newAgent(), { name: "Bob", email: "bob@example.com" });
  });

  it("adds a contact by email", async () => {
    const response = await alice
      .post("/person/create")
      .send({ email: "bob@example.com" });

    expect(response.status).toBe(201);
    expect(response.body.data.contacts).toHaveLength(1);
    expect(response.body.data.contacts[0].email).toBe("bob@example.com");
  });

  it("never exposes the password hash of a contact", async () => {
    await alice.post("/person/create").send({ email: "bob@example.com" });

    const response = await alice.get("/person/list");

    expect(response.body.data.contacts[0]).not.toHaveProperty("password");
  });

  it("refuses an unknown email", async () => {
    const response = await alice
      .post("/person/create")
      .send({ email: "nobody@example.com" });

    expect(response.status).toBe(422);
    expect(response.body.status).toBe("validation");
  });

  it("refuses the same contact twice", async () => {
    await alice.post("/person/create").send({ email: "bob@example.com" });

    const response = await alice
      .post("/person/create")
      .send({ email: "bob@example.com" });

    expect(response.status).toBe(422);
  });

  it("refuses adding yourself", async () => {
    const response = await alice
      .post("/person/create")
      .send({ email: "alice@example.com" });

    expect(response.status).toBe(422);
  });

  it("removes a contact", async () => {
    await alice.post("/person/create").send({ email: "bob@example.com" });

    const bob = await User.findOne({ email: "bob@example.com" });
    const response = await alice
      .delete("/person/delete")
      .send({ userId: bob._id.toString() });

    expect(response.status).toBe(200);

    const list = await alice.get("/person/list");
    expect(list.body.data.contacts).toHaveLength(0);
  });
});
