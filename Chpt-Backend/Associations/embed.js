var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/blog_demo");

var postSchema = new mongoose.Schema({
    title: String,
    content: String
});
var Post = mongoose.model("Post", postSchema);

var userSchema = new mongoose.Schema({
    email: String,
    name: String,
    posts: [postSchema]
});
var User = mongoose.model("User", userSchema);

/*var newPost = new Post({
    title: "How to brew polyjuice potion",
    content: "Go to potions class !!!"
});
newPost.save(function(err, post){
    if(err){
        console.log(err);
    } else {
        console.log(post);
    }
});

var newUser = new User({
    email: "harry@hogwarts.edu",
    name: "Harry Potter"
});

newUser.posts.push(newPost);

newUser.save(function (err, user){
    if(!err){
        console.log(user);
    } else {
        console.log("Error! " + err);
    }
});*/

User.findOne({name: "Harry Potter"}, function(err, user){
    if(err){
        console.log(err);
    } else {
        user.posts.push({
            title: "Three Things I Hate",
            content: "Voldemort, Voldemort, Voldemort"
        });
        user.save(function(err, user){
            if(err){
                console.log(err);
            } else {
                console.log(user);
            }
        })
    }
});