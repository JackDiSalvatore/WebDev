var express = require("express");
var app = express();
var request = require("request");

app.set("view engine", "ejs");

app.get("/", function(req, res){
    res.render("home");
});

app.get("/results", function(req, res){
    var query = req.query.searchMovie;
    var url = "http://www.omdbapi.com/?s=" + query + "&apikey=thewdb&"
    // TODO: How to handle the case when a movie is not found
    
    request(url, function(error, response, body){
        if(!error && response.statusCode == 200) {
            var movies = JSON.parse(body);
            
            res.render("results", {movies: movies});
        } else {
            console.log("ERROR!");
            console.log(error);
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Started...");
});