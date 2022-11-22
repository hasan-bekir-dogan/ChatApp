var socket = io();

socket.on('add chat message', (msg) => {
    addMessageToHtml(msg.senderUserId, msg.receiverUserId, msg.messageId, msg.messageDate, msg.text, msg.receiverUserName, msg.receiverUserImage)
})
socket.on('delete chat message', (msg) => {
    deleteMessageFromHtml(msg.senderUserId, msg.receiverUserId, msg.messageId)
})