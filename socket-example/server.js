const express = require("express");
const app = express();
app.use(express.static("public"));

const PORT = process.env.PORT || 4000;

const EVENTS = {
    WELCOME: 'welcome'
}

const server = app.listen(
    PORT,
    () => console.log(`Server is running on port ${PORT}`)
);

// const socketio = require("socket.io");
// const io = socketio(server, {});    // add socket.io to express server!

const { Server } = require("socket.io");
const io = new Server(server, {});

// Listen for (javascript/node) events
io.on("connect", socket => {
    console.log(socket.id, " connected to the server");

    // Send event to client that just connected
    socket.emit(EVENTS.WELCOME, [1,2,3]);

    // Listen to thankYou event
    socket.on('thankYou', d => {
        console.log(`message from client: ${d}`);
    });
});
