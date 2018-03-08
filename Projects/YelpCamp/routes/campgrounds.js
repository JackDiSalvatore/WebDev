var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

/*======================================================
                      CAMPGROUND ROUTES
=======================================================*/

/* INDEX - show all campgrounds */
router.get("/", function(req, res){
    
    Campground.find({}, function(err, allCampgrounds){
        if(!err){
            /* console.log(allCampgrounds); List of all campgrounds from db */
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });

});

/* CREATE - add new campground to database */
router.post("/", middleware.isLoggedIn, function(req, res){
    
    /* Create new campground and add to database */
    Campground.create(
    {
        name: req.body.name,
        price: req.body.price,
        image: req.body.image,
        description: req.body.description,
        author: {
            id: req.user._id,
            username: req.user.username
        }
    }
    , function(err, newlyCreated){
        if(!err) {
            res.redirect("campgrounds");
        }
    });
    
});

/* NEW - form to create new campground */
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

/* SHOW - show information about individual campground */
router.get("/:id", function(req, res){

    //  Associated the commends found by its ID with the campground object
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(!err){
            //console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });

});

/* EDIT */
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
            console.log(err);
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

/* UPDATE */
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

/* DELETE */
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else {
            req.flash("error", "Campground Deleted!");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;