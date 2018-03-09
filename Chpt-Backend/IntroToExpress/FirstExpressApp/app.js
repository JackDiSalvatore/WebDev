var express = require("express");
var app = express();

// Routes
app.get("/", function(request, response){
   response.send("Hi There!");
});

app.get("/bye", function(req, res){
    res.send("Goodbye!"); 
});

app.get("/dog", function(req, res){
    console.log("Request made to /dog");
    res.send("Woof!"); 
});

/* The ":" is a path matcher that will match anyname after the "/r" */
app.get("/r/:subredditName", function(req, res){
    console.log(req.params); // look at "params"
    var subredditName = req.params.subredditName;
    
    res.send("WELCOME TO THE " + subredditName.toUpperCase() + " SUBREDDIT"); 
});

app.get("/r/:subredditName/comments/:id/:title", function(req, res){
    console.log(req.params); // look at "params"
    res.send("Welcome to the comments page on of a subreddit post");
});

/* Catch all. This must be at the end, remember route order matters! */
app.get("*", function(req, res){
    res.send("caught an unhandled route request!"); 
});

// Listen for requests (start server)
// process.env.PORT = cloud9's port
// process.env.IP = cloud9's IP
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Started!");
});