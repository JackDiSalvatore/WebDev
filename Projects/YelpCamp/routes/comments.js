var express    = require("express");
var router     = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment    = require("../models/comment");
var middleware = require("../middleware");

/*======================================================
                     COMMENTS ROUTES
=======================================================*/
/* NEW */
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

/* CREATE */
router.post("/", middleware.isLoggedIn, function(req, res){
    
    // Find campground
    Campground.findById(req.params.id, function(err, campground){
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            // Create new comment
             Comment.create(req.body.comment, function(err, comment){
                 if(err){
                     req.flash("error", "Comment could not be created");
                     console.log(err);
                 } else {
                     // Add username and id to comment
                     comment.author.id = req.user._id;
                     comment.author.username = req.user.username;
                     // Save the comment
                     comment.save();
                     // Associate new comment with campground
                     campground.comments.push(comment);
                     campground.save();
                     req.flash("success", "Comment added!");
                     res.redirect("/campgrounds/" + campground._id);
                 }
             });
        }
    });
});

/* EDIT */
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit",
                       {
                           campground_id: req.params.id,
                           comment: foundComment
                       });
        }
    });
});

/* UPDATE */
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

/* DESTROY */
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("error", "Comment Deleted!");
            res.redirect("/campgrounds/" + req.params.id);
        };
    });
});

module.exports = router;