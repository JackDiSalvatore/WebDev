var methodOverride   = require("method-override");
var bodyParser       = require("body-parser");
var mongoose         = require("mongoose");
var express          = require("express");
var app              = express();
var expressSanitizer = require("express-sanitizer");


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

/* DATABASE: Mongoose */
mongoose.connect('mongodb://localhost/practice_restful_app');

var motorcycleSchema = new mongoose.Schema({
   brand: String,
   name: String,
   image: String,
   description: String
});

var Motorcycle = mongoose.model("Motorcycle", motorcycleSchema);

/*Motorcycle.create({
    brand: "Kawasaki",
    name: "Ninja 300",
    image: "https://wallpapersbae.com/wp-content/uploads/2017/12/Kawasaki-Ninja-300-Wallpaper-Hd-Wallpapers-Free-750x450.jpg",
    body: "Starter bike!"
    
}, function(err, newMotorcycle) {
    if(!err) {
        
    }
});*/


app.get("/", function(req, res){
    res.render("home");
});

/*---------------------------------------------- INDEX -------------------------------------------------- */
app.get("/motorcycles", function(req, res){
    Motorcycle.find({}, function(err, foundMotorcycles){
        if(!err){
            res.render("index", {motorcycles: foundMotorcycles});
        } else {
            res.render("/");
        }
    });
});

/* ------------------------------------------------ NEW -------------------------------------------------- */
app.get("/motorcycles/new", function(req, res){
    res.render("new");
});

/* ---------------------------------------------- CREATE ------------------------------------------------ */
app.post("/motorcycles", function(req, res){
    req.body.motorcycle.description = req.sanitize(req.body.motorcycle.description);
    Motorcycle.create(req.body.motorcycle, function(err, newBike){
        if(!err){
            res.redirect("/motorcycles");
        } else {
            res.render("new");
        }
    })
    
});

/* ------------------------------------------------- SHOW ----------------------------------------------- */
app.get("/motorcycles/:id", function(req, res){

    Motorcycle.findById(req.params.id, function(err, foundMotorcycle){

        if(!err){
            res.render("show", {motorcycle: foundMotorcycle});
        } else {
            res.redirect("/motorcycles");
        }
    });
});

/* ------------------------------------------------ EDIT ----------------------------------------------- */
app.get("/motorcycles/:id/edit", function(req, res){
    Motorcycle.findById(req.params.id, function(err, foundMotorcycle){
        if(!err){
            res.render("edit", {motorcycle: foundMotorcycle});
        } else {
            res.render("/motorcycles/" + req.params.id);
        }
    })
});

/*--------------- ------------------------------- UPDATE ---------------------------------------------- */
app.put("/motorcycles/:id", function(req, res){
    req.body.motorcycle.description = req.sanitize(req.body.motorcycle.description);
    Motorcycle.findByIdAndUpdate(req.params.id, req.body.motorcycle, function(err, updatedMotorcycle){
       if(!err) {
           console.log("Motorcycle Updated!");
           res.redirect("/motorcycles/" + req.params.id);
       } else {
           res.redirect("/motorcycles/" + req.params.id);
       }
    });
});

/* ---------------------------------------------- DELETE -----------------------------------------------*/
app.delete("/motorcycles/:id", function(req, res){
    Motorcycle.findByIdAndRemove(req.params.id, function(err){
       if(!err){
           res.redirect("/motorcycles");
       } else {
           res.redirect("/motorcycles");
       }
    });
});

/* ------------------------------- DEFAULT HANDLER  ------------------------- */
app.get("", function(req, res){
    res.redirect("/");
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Started...");
});