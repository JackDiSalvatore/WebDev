// http://mongoosejs.com/docs/index.html
var assert = require("assert");
var mongoose = require("mongoose");

var promise = mongoose.connect('mongodb://localhost/cat_app', {
    useMongoClient: true
});

var Schema = mongoose.Schema;

var catSchema = new Schema({
    name: String,
    age: Number,
    temperament: String
});

var Cat = mongoose.model("Cat", catSchema);

// add a new cat to the database
/*var george = new Cat({
    name: "Mrs. Norris",
    age: 11,
    temperament: "Evil"
});

var promise = george.save();*/

Cat.create({
    name: "Snow White",
    age: 15,
    temperament: "Nice"
}, function(err, cat){
    if(!err){
        console.log(cat);
    }
});

// retrieve all cats from the database
Cat.find({temperament: "Nice"}, function(err, cats){
   if(!err){
       console.log(cats);
   } 
});