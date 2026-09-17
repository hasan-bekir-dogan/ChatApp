const http = require("http");
const request = require("supertest");
const { io: connect } = require("socket.io-client");

const { app, sessionMiddleware } = require("../app");
const { createSocketServer } = require("../config/socket");
const User = require("../models/User");
const { DEFAULT_PASSWORD } = require("./helpers");

let server;
let ioServer;
let baseUrl;

beforeAll(async () => {
  server = http.createServer(app);
  ioServer = createSocketServer(server, sessionMiddleware);

  await new Promise((resolve) => server.listen(0, resolve));

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  ioServer.close();
  await new Promise((resolve) => server.close(resolve));
});

/**
 * Registers a user, signs them in over HTTP and returns the session cookie so
 * a socket can authenticate with it.
 */
async function sessionCookieFor(name, email) {
  const agent = request.agent(app);

  await agent.post("/users/signup").type("form").send({
    name,
    email,
    password: DEFAULT_PASSWORD,
    confirmPassword: DEFAULT_PASSWORD,
  });

  const response = await agent
    .post("/users/login")
    .type("form")
    .send({ email, password: DEFAULT_PASSWORD });

  return response.headers["set-cookie"];
}

function connectWith(cookie) {
  return new Promise((resolve, reject) => {
    const socket = connect(baseUrl, {
      transports: ["websocket"],
      extraHeaders: { Cookie: [].concat(cookie).join("; ") },
    });

    socket.on("connect", () => resolve(socket));
    socket.on("connect_error", reject);
  });
}

function nextEvent(socket, event, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);

    socket.once(event, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

describe("socket delivery", () => {
  it("refuses a connection without a session", async () => {
    await expect(connectWith("")).rejects.toThrow();
  });

  it("delivers a message to the recipient and to nobody else", async () => {
    const [aliceCookie, bobCookie, carolCookie] = await Promise.all([
      sessionCookieFor("Alice", "alice@example.com"),
      sessionCookieFor("Bob", "bob@example.com"),
      sessionCookieFor("Carol", "carol@example.com"),
    ]);

    const [alice, bob, carol] = await Promise.all([
      connectWith(aliceCookie),
      connectWith(bobCookie),
      connectWith(carolCookie),
    ]);

    const bobUser = await User.findOne({ email: "bob@example.com" });

    const delivered = nextEvent(bob, "add chat message");
    const leaked = nextEvent(carol, "add chat message");

    alice.emit("add chat message", {
      receiverUserId: bobUser._id.toString(),
      text: "for bob only",
    });

    expect(await delivered).toMatchObject({ text: "for bob only" });
    expect(await leaked).toBeNull();

    [alice, bob, carol].forEach((socket) => socket.disconnect());
  });

  it("takes the sender from the session, not from the payload", async () => {
    const [aliceCookie, bobCookie] = await Promise.all([
      sessionCookieFor("Alice", "alice@example.com"),
      sessionCookieFor("Bob", "bob@example.com"),
    ]);

    const [alice, bob] = await Promise.all([
      connectWith(aliceCookie),
      connectWith(bobCookie),
    ]);

    const aliceUser = await User.findOne({ email: "alice@example.com" });
    const bobUser = await User.findOne({ email: "bob@example.com" });
    const delivered = nextEvent(bob, "add chat message");

    alice.emit("add chat message", {
      receiverUserId: bobUser._id.toString(),
      senderUserId: bobUser._id.toString(),
      text: "spoofed sender",
    });

    expect(await delivered).toMatchObject({
      senderUserId: aliceUser._id.toString(),
    });

    [alice, bob].forEach((socket) => socket.disconnect());
  });
});
