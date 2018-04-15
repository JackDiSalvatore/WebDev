alert("Connected!");

var obj = {
    name: "Chuck",
    age: 45,
    isCool: false,
    friends: ["Bob", "Tina"],
    add: function(x, y) {
        return x + y;
    }
}

obj.add(25, 10);


var dog = {
    name: "Doggo"
}

var cat = {
    name: "Kitty"
}

dog.speak = function() {
    return "Woof!";
}

cat.speak = function() {
    return "Meow!";
}

// usage
dog.speak();
cat.speak();


// This keyword
comments = {};
comments.data = ["Good job!", "This stinks!", "Awesome!", "How cool", "Lame..."];

// add a method to existing Object
comments.print = function() {
    this.data.forEach(function(el) {
        console.log(el);
    });
}

// usage
comments.print();
