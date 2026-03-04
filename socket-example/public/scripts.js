// Running in the client browser

const EVENTS = {
    WELCOME: 'welcome',
    THANK_YOU: 'thankYou',
    NEW_CLIENT: 'newClient'
}

// Connect to server
const socket = io.connect(
    "http://localhost:4000",
    {
        auth: {
            secret: "secret-here"
        },
        query: {
            meaningOfLife: 42
        }
    }
);

// on: listen to evetns
// emit: sends events

socket.on(EVENTS.WELCOME, data => {
    console.log(`Recieved event 'welcome': ${data}`);

    // handle 'welcome' call back from server
    socket.emit(EVENTS.THANK_YOU, [4,5,6]);
})

socket.on(EVENTS.NEW_CLIENT, data => {
    console.log(`Recieved event 'newClient': ${data}`);
});
