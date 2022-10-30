var socket = io();

socket.on('chat message', (msg) => {
    console.log(msg)
    //$('.surface .main .personDetail .body .eachMessage:last-child').after(`<p>${msg}</p>`);
})