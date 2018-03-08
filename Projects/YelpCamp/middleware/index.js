var Campground = require("../models/campground");
var Comment   = require("../models/comment");

module.exports = {
    checkCampgroundOwnership: function(req, res, next){
        if(req.isAuthenticated()){
            Campground.findById(req.params.id, function(err, foundCampground){
                if(err || !foundCampground) {
                    req.flash("error", "Campground not found");
                    res.redirect("back");
                } else {
                    // Added this block, to check if foundCampground exists, and if it doesn't to throw an error via connect-flash and send us back to the homepage
                    if (!foundCampground) {
                        req.flash("error", "Item not found.");
                        return res.redirect("back");
                    }
                    if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                        next();
                    } else{
                        req.flash("error", "You don't have permission to do that");
                        res.redirect("back");
                    }
                }
            });
        } else {
            req.flash("error", "You need to be logged in to do that");
            res.redirect("back");
        }
    },
    checkCommentOwnership: function(req, res, next){
        if(req.isAuthenticated()){
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err || !foundComment) {
                    req.flash("error", "Comment not found");
                    res.redirect("back");
                } else {
                    if (!foundComment) {
                        req.flash("error", "Item not found.");
                        return res.redirect("back");
                    }
                    if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                        next();
                    } else{
                        req.flash("error", "You don't have permission to do that");
                        res.redirect("back");
                    }
                }
            });
        } else {
            req.flash("error", "You need to login to do that");
            res.redirect("back");
        }
    },
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "You need to be logged in to do that");
        res.redirect("/login");
    }
}