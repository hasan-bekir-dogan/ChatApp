// A single shared connection for the whole page. Opening one socket per
// outgoing message leaks connections on both the client and the server.
var socket = null;

(function connectSocket() {
  var userId = document.body.getAttribute("data-user-id");

  // The login and register screens render without a session, and the server
  // rejects unauthenticated socket connections.
  if (!userId) return;

  socket = io();

  socket.on("add chat message", function (msg) {
    addMessageToHtml(
      msg.senderUserId,
      msg.receiverUserId,
      msg.messageId,
      msg.messageDate,
      msg.text,
      msg.receiverUserName,
      msg.receiverUserImage
    );
  });

  socket.on("delete chat message", function (msg) {
    deleteMessageFromHtml(msg.senderUserId, msg.receiverUserId, msg.messageId);
  });
})();
