alert("START APP!!!!");


function addToList () {
    var toAdd = prompt("Add something to you Todo list");
    todoList.push(toAdd);
}

function viewTodoList() {
    console.log(todoList);
}

function userQuit() {
    alert("You are done with the list.  Bye bye");
    askAgain = false;
}

function userHelp() {
    alert("You can do the following:\n new - add a Todo list\n list - view all Todos\n quit - quit the App\nOpen developers console to see the output.");
}

function checkResponse() {
    // if statements of what the user typed
    if ("new" == userResponse) {
        addToList();
    }
    else if ("list" == userResponse) {
        viewTodoList();
    }
    else if ("help" == userResponse) {
        userHelp();
    }
    else if ("quit" == userResponse) {
        // Break loop askiing the user what to do
        userQuit();
        return false;
    }
    return true;
}


var todoList = [];
var question = "What would we like to do?";
var askAgain = true;

console.log("Start of App");

// Loop for asking the user what to do
while (askAgain) {
    var userResponse = prompt(question);
    var isResponseValid = !(("new" !== userResponse)
                         && ("list" !== userResponse)
                         && ("quit" !== userResponse)
                         && ("help" !== userResponse));

    if (isResponseValid) {
        askAgain = checkResponse();
    }
}

console.log("End of App");
alert("End of App");

/*
SOULTION:
var todos = ["Buy New Turtle"];

var input = prompt("What would you like to do?");

while(input !== "quit") {
    if(input ==="list") {
        console.log(todos);
    }
    else if(input === "new") {
        var newTodo = prompt("Enter new todo");
        todos.push(newTodo);
    }

    input = prompt("What would you like to do?");
}
console.log("OK, YOU QUIT THE APP");
*/