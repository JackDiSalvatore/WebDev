var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    passport       = require("passport"),
    flash          = require("connect-flash"),
    LocalStrategy  = require("passport-local"),
    methodOverride = require("method-override"),
    Campground     = require("./models/campground"),
    Comment        = require("./models/comment"),
    User           = require("./models/user"),
    seedBD         = require("./seeds");

var campgroundRoutes = require("./routes/campgrounds"),
    commentRoutes    = require("./routes/comments"),
    indexRoutes      = require("./routes/index");

var promise = mongoose.connect('mongodb://localhost/yelp_camp', {
    useMongoClient: true
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//seedBD();

/* PASSPORT CONFIGURATION */
app.use(require("express-session")({
    secret: "This is the expess-session secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/*======================================================
                      MIDDLEWARE
=======================================================*/
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error   = req.flash("error");
    next();
});

/*======================================================
                      ROUTES
=======================================================*/
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", indexRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp Server Started...");
});
