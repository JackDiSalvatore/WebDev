// Running in the client browser

// console.log("Hello World");
// console.log(io);

const EVENTS = {
    WELCOME: 'welcome',
    THANK_YOU: 'thankYou'
}

// Connect to server
const socket = io.connect("http://localhost:4000");

// on: listen to evetns
// emit: sends events

socket.on(EVENTS.WELCOME, data => {
    console.log(data);

    // handle 'welcome' call back from server
    socket.emit(EVENTS.THANK_YOU, [4,5,6]);
})
