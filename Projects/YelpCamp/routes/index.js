var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");


router.get("/", function(req, res){
    res.render("landingpage");
});

/*======================================================
                     AUTH ROUTES
=======================================================*/

/* SHOW - register page form */
router.get("/register", function(req, res){
    res.render("register");
});

/* Handles signup logic */
router.post("/register", function(req, res){
    
    User.register(new User({username: req.body.username}), req.body.password,
                  function(err, user){
                      if(err){
                          req.flash("error", err.message);
                          return res.render("register");
                      } else {
                          // Log the user in
                          passport.authenticate("local")(req, res, function(){
                              req.flash("success", "Welcome to YelpCamp " + user.username);
                              res.redirect("/campgrounds");
                          });
                      }
                  })
});

/* SHOW - Login form */
router.get("/login", function(req, res){
    res.render("login");
});

/* Handles the login logic */
router.post("/login", passport.authenticate("local", {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
    
});

/* LOGOUT */
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

module.exports = router;