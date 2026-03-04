const express = require("express");
const app = express();
app.use(express.static("public"));

const PORT = process.env.PORT || 4000;

const EVENTS = {
    WELCOME: 'welcome',
    THANK_YOU: 'thankYou',
    NEW_CLIENT: 'newClient'
}

const server = app.listen(
    PORT,
    () => console.log(`Server is running on port ${PORT}`)
);

// const socketio = require("socket.io");
// const io = socketio(server, {});    

const { Server } = require("socket.io");

// construct socket.io with express server
const io = new Server(server, {});

// Listen for (javascript/node) events
io.on("connect", socket => {
    console.log(socket.handshake);
    console.log(socket.id, " connected to the server");

    // Send event to client that just connected
    socket.emit(EVENTS.WELCOME, [1,2,3]);

    // Sent event to all sockets connected to `io`
    io.emit(EVENTS.NEW_CLIENT, socket.id);

    // Listen to thankYou events
    socket.on(EVENTS.THANK_YOU, data => {
        console.log(`Recieved event 'thankYou' from client: ${data}`);
    });
});
