var express          = require("express"),
    app              = express(),
    mongoose         = require("mongoose"),
    bodyParser       = require("body-parser"),
    methodOverride   = require("method-override"),
    expressSanitizer = require("express-sanitizer");
    
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

/* Connect to the server */
mongoose.connect('mongodb://localhost/blog_app', {
    useMongoClient: true
});

/* Mongoose Model congif */
var blogSchema = new mongoose.Schema({
   title: String,
   image: String,
   body: String,
   created: {
       type: Date,
       default: Date.now()
   }
});
var Blog = mongoose.model("Blog", blogSchema);

/*Blog.create({
    title: "Test Blog",
    image: "https://images.unsplash.com/reserve/Hxev8VTsTuOJ27thHQdK_DSC_0068.JPG?dpr=1&auto=format&fit=crop&w=1000&q=80&cs=tinysrgb",
    body: "This is a test..."
    
}, function(err, newBlog) {
    if(!err) {
        
    }
});*/

/* RESTful Routes */
app.get("/", function(req, res){
    res.redirect("/blogs");
});

/* INDEX */
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, allBlogs){
       if(!err){
           res.render("index", {blogs: allBlogs});
       } 
    });
});

/* NEW */
app.get("/blogs/new", function(req, res){
    res.render("new");
});

/* CREATE */
app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlogPost){
        if(!err){
            res.redirect("/blogs");
        } else {
            res.render("/blogs/new");
        }
    });
    
});

/* SHOW */
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, blogPost){
        if(!err){
            res.render("show", {blog: blogPost});
        } else {
            res.redirect("/blogs");
        }
    });
});

/* EDIT */
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
       if(!err){
           res.render("edit", {blog: foundBlog});
       } else {
           res.redirect("/blogs");
       }
    });
});

/* UPDATE */
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //Blog.findByIdAndUpdate(id, newData, callback)
    //console.log(req.body); <- javaScript object blog
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(!err){
            res.redirect("/blogs/" + req.params.id);
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

/* DESTROY */
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(!err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.get("", function(req, res){
    res.send("Page not found! Try again...");
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Blog App Server Started ...");
});