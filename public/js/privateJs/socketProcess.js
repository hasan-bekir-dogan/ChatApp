var socket = io();

socket.on('add chat message', (msg) => {
    addMessageToHtml(msg.senderUserId, msg.receiverUserId, msg.messageId, msg.messageDate, msg.text)
})
socket.on('delete chat message', (msg) => {
    deleteMessageFromHtml(msg.messageId)
})
