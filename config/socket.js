const { Server } = require("socket.io");

/**
 * Every authenticated socket joins a room named after its own user id. A chat
 * event is then delivered to the two rooms taking part in the conversation
 * instead of being broadcast to every client connected to the server.
 */
function userRoom(userId) {
  return `user:${userId}`;
}

function relayToParticipants(io, socket, event, message) {
  const receiverUserId = message && message.receiverUserId;

  if (!receiverUserId) return;

  // The sender is taken from the session rather than from the payload so a
  // client cannot impersonate somebody else.
  const senderUserId = socket.data.userId;

  io.to(userRoom(senderUserId))
    .to(userRoom(String(receiverUserId)))
    .emit(event, { ...message, senderUserId });
}

/**
 * Wires Socket.IO onto an existing HTTP server and reuses the Express session
 * so that socket connections are authenticated the same way HTTP requests are.
 */
function createSocketServer(httpServer, sessionMiddleware) {
  const io = new Server(httpServer);

  io.engine.use(sessionMiddleware);

  io.use((socket, next) => {
    const session = socket.request.session;

    if (!session || !session.userId) {
      return next(new Error("Unauthorized socket connection"));
    }

    socket.data.userId = String(session.userId);
    next();
  });

  io.on("connection", (socket) => {
    socket.join(userRoom(socket.data.userId));

    socket.on("add chat message", (message) => {
      relayToParticipants(io, socket, "add chat message", message);
    });

    socket.on("delete chat message", (message) => {
      relayToParticipants(io, socket, "delete chat message", message);
    });
  });

  return io;
}

module.exports = { createSocketServer, userRoom };
