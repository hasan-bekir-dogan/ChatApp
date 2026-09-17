const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const { newAgent, signIn } = require("./helpers");

async function twoSignedInUsers() {
  const alice = await signIn(newAgent(), {
    name: "Alice",
    email: "alice@example.com",
  });
  const bob = await signIn(newAgent(), {
    name: "Bob",
    email: "bob@example.com",
  });

  return {
    alice,
    bob,
    aliceUser: await User.findOne({ email: "alice@example.com" }),
    bobUser: await User.findOne({ email: "bob@example.com" }),
  };
}

describe("messaging", () => {
  it("creates a conversation with the first message", async () => {
    const { alice, bobUser } = await twoSignedInUsers();

    const response = await alice
      .post("/message/send")
      .send({ receiverUserId: bobUser._id.toString(), text: "hello" });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(await Chat.countDocuments()).toBe(1);
    expect(await Message.countDocuments()).toBe(1);
  });

  it("reuses the existing conversation for the reply", async () => {
    const { alice, bob, aliceUser, bobUser } = await twoSignedInUsers();

    await alice
      .post("/message/send")
      .send({ receiverUserId: bobUser._id.toString(), text: "hello" });
    await bob
      .post("/message/send")
      .send({ receiverUserId: aliceUser._id.toString(), text: "hi back" });

    expect(await Chat.countDocuments()).toBe(1);

    const detail = await alice
      .post("/chat/detail")
      .send({ receiverUserId: bobUser._id.toString() });

    expect(detail.status).toBe(200);
    expect(detail.body.data.messages).toHaveLength(2);
    expect(detail.body.data.messages[0].userType).toBe("sender");
    expect(detail.body.data.messages[1].userType).toBe("receiver");
    expect(detail.body.data.receiverName).toBe("Bob");
  });

  it("rejects an empty message", async () => {
    const { alice, bobUser } = await twoSignedInUsers();

    const response = await alice
      .post("/message/send")
      .send({ receiverUserId: bobUser._id.toString(), text: "   " });

    expect(response.status).toBe(400);
    expect(await Message.countDocuments()).toBe(0);
  });

  it("rejects a malformed receiver id instead of failing with a 500", async () => {
    const { alice } = await twoSignedInUsers();

    const response = await alice
      .post("/message/send")
      .send({ receiverUserId: "not-an-id", text: "hello" });

    expect(response.status).toBe(400);
  });

  it("lets the author delete their own message", async () => {
    const { alice, bobUser } = await twoSignedInUsers();

    const sent = await alice
      .post("/message/send")
      .send({ receiverUserId: bobUser._id.toString(), text: "hello" });

    const response = await alice.delete("/message/delete").send({
      receiverUserId: bobUser._id.toString(),
      messageId: sent.body.data.messageId,
    });

    expect(response.status).toBe(200);
    expect(response.body.checkChatEmpty).toBe(true);
    expect(await Message.countDocuments()).toBe(0);
    expect(await Chat.countDocuments()).toBe(0);
  });

  it("does not let the recipient delete a message they did not write", async () => {
    const { alice, bob, aliceUser, bobUser } = await twoSignedInUsers();

    const sent = await alice
      .post("/message/send")
      .send({ receiverUserId: bobUser._id.toString(), text: "hello" });

    const response = await bob.delete("/message/delete").send({
      receiverUserId: aliceUser._id.toString(),
      messageId: sent.body.data.messageId,
    });

    expect(response.status).toBe(403);
    expect(await Message.countDocuments()).toBe(1);
  });

  it("lists conversations with their last message", async () => {
    const { alice, bobUser } = await twoSignedInUsers();

    await alice
      .post("/message/send")
      .send({ receiverUserId: bobUser._id.toString(), text: "first" });
    await alice
      .post("/message/send")
      .send({ receiverUserId: bobUser._id.toString(), text: "second" });

    const response = await alice.get("/chat");

    expect(response.status).toBe(200);
    expect(response.body.data.chat).toHaveLength(1);
    expect(response.body.data.chat[0]).toMatchObject({
      name: "Bob",
      lastMessage: "second",
      type: "sender",
    });
  });

  it("matches conversations by contact name and escapes regex input", async () => {
    const { alice, bobUser } = await twoSignedInUsers();

    await alice
      .post("/message/send")
      .send({ receiverUserId: bobUser._id.toString(), text: "hello" });

    const match = await alice.post("/chat/search").send({ searchtext: "bo" });
    expect(match.body.data.chat).toHaveLength(1);

    // Treated as literal text, not as a wildcard that matches everything.
    const wildcard = await alice.post("/chat/search").send({ searchtext: ".*" });
    expect(wildcard.body.data.chat).toHaveLength(0);
  });
});
