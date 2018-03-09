var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/blog_demo_2");

var Post = require("./models/post");
var User = require("./models/user");

/*
User.create({
    email: "Bob@gmail.com",
    name: "Bob Belcher"
});*/

/*Post.create({
    title: "How to cook the best buger part 4",
    content: "Part four to whatever I am posting to..."
}, function(err, post){
    User.findOne({email: "Bob@gmail.com"}, function(err, foundUser){
        if(!err){
            foundUser.posts.push(post._id);
            foundUser.save(function(err, user){
                if(!err){
                    console.log(user);
                }
            });
        }
    });
});*/

/* Find user and associated posts */
User.findOne({email: "Bob@gmail.com"}).populate("posts").exec(function(err, user){
   if(!err){
       console.log(user);
   } 
});