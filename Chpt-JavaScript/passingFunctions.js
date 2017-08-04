alert("Connected!");

var nums = [1,2,3,4,5,6,7,8,9,0];

// forEach method on object
nums.forEach(function(val) {
    console.log(val);
});

var colors = ["red", "orange", "yellow", "green"];

function myForEach(arr, func) {
    // loop through the entire array
    for(var i = 0; i < arr.length; i++) {
        // cal func for each item
        // func can be any function, i.e. arlet, console.log (try with either!)
        // or one you define, you can pass an anonymouse function
        // as well, this is common
        func(arr[i]);
    }
}

console.log("\nmyForEach Example Call: \"myForEach(colors, alert\"");
myForEach(colors, alert);

console.log("\nCalling myForEach with anonymouse function as argument:");
myForEach(colors, function(val){console.log(val)});

// Adding "myForEach()" function to the Array class as a user defined
// method
Array.prototype.myForEach = function(func) {
    // "this" keyword refers to the array object on which the method
    // is being invoked on
    for(var i = 0; i < this.length; i++) {
        func(this[i]);
    }
}

var friends = ["Charlie", "Mac", "Denis"];

console.log("\nCalling friends.myForEach()");
friends.myForEach(function(name) {
    console.log("Hi my name is " + name);
});
