var express = require("express");
var app = express();

/* Serve the public directory */
/*    by default express only serves app.js
*     and everything in the views directory 
*/
app.use(express.static("public"));

/* Tell express that only the files being rendered
*  are .ejs files */
app.set("view engine", "ejs");

app.get("/", function(req, res){
    res.render("home"); 
});

app.get("/fallinlovewith/:thing", function(req, res){
    var thing = req.params.thing;
    res.render("love", {thingVar: thing});
});

app.get("/posts", function(req, res){
    var posts = [
            {title: "Post 1", author: "Susy"},
            {title: "My pet bunny", author: "Hannah"},
            {title: "Check out this pomsky!", author: "Colt"}
        ];
    
    res.render("posts", {posts: posts});
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Started!"); 
});