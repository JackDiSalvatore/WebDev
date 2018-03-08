var mongoose = require("mongoose");

/* Schema Setup */
var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }
        ]
});

module.exports =  mongoose.model("Campground", campgroundSchema);

/*var myCampground = Campground.create(
    {
        name: "Salmon Creek",
        image: "https://farm2.staticflickr.com/1424/1430198323_c26451b047.jpg",
        description: "This is a beautiful salmon creek!"
    },function(err, campground){
        if(!err){
            console.log("Adding campground: ");
            console.log(campground);
    }
});
*/