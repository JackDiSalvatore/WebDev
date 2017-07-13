var question = "Are we there yet?";
var userResponse = prompt(question);

while ((userResponse.indexOf("yes") === -1) && ("yeah" !== userResponse)) {
    userResponse = prompt(question);
}

alert("Yay we made it!");