var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user"),
    localStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/auth_demo_app");

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(require("express-session")({
    secret: "The quick brown fox jumped over the lazy dog",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());   

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect("/login");
    }
}

/* ==================== ROUTES =================== */

app.get("/", function(req, res){
    res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res){
    res.render("secret");
});

/* ================== AUTH ROUTES ================== */
app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password,
                  function(err, user){
                      if(err){
                          console.log(err);
                          res.render("register");
                      }
                      passport.authenticate("local")(req, res, function(){
                          res.redirect("secret");
                      });
                  });
});

/* ======================= LOGIN ================================== */
app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
        successRedirect: "/secret",
        failureRedirect: "/login"
    }),function(req, res){
    
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Started.....");
});