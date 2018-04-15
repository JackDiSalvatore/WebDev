function listTodos() {
    console.log("**********");
    todos.forEach(function(item, index){
        console.log(index + ": " + item);
    });
    console.log("**********");
}

function addTodo() {
    var newTodo = prompt("Enter new todo");
    todos.push(newTodo);
    console.log("Added Todo!");
}

function deleteTodo() {
    var amountOfItemsToDel = 1;
    var indexToDelete = prompt("Enter the index of the Todo to delete");

    if (indexToDelete < todos.length) {
        todos.splice(indexToDelete, amountOfItemsToDel);
        console.log("Deleted Todo");
    }
    else {
        alert("That index does not exist!");
        console.log("That index does not exist!");
        }
}


alert("START APP!!!!");

var todos = ["Buy New Turtle"];

var input = prompt("What would you like to do?");

while(input !== "quit") {

    if(input === "list") {
        listTodos();
    }
    else if(input === "new") {
        addTodo();
    }
    else if(input === "delete") {
        deleteTodo();
    }
    else {
        alert("Please enter a correct command!");
        console.log("Please enter a correct command!");
    }

    input = prompt("What would you like to do?");

}

console.log("End of App");
alert("End of App");
