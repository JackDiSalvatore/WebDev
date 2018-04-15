var express = require("express");
var app = express();

// Routes
app.get("/", function(req, res){
    res.send("Hi there, welcome to my assignment!");
});

app.get("/speak/:animal", function(req, res){
    //console.log(req.params);
    var animal = req.params.animal.toLowerCase();
    var sounds = {
        pig: "Oink",
        cow: "Moo",
        dog: "Woof Woof!",
        cat: "Meow",
        goldfish: "..."
    };
    
    res.send("The " + animal + " says '" + sounds[animal] + "'");
});

app.get("/repeat/:message/:times", function(req, res){
    var message = req.params.message;
    var times = Number(req.params.times);
    var result = "";
    
    for(var count = 0; count < times; count++){
        result += message + " ";
    }
    res.send(result);
});

app.get("*", function(req, res){
    res.send("Sorry, page not found...");
});

// Start Server
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Started!"); 
});