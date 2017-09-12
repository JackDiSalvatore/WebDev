var colors = [
    "rgb(255, 0, 0)",
    "rgb(255, 255, 0)",
    "rgb(0, 255, 0)",
    "rgb(0, 255, 255)",
    "rgb(0, 0, 255)",
    "rgb(255, 0, 255)"
];

var squares = document.querySelectorAll(".square");
var pickedColor = colors[3];        // hardcoded for now
var rgbDisplay = document.getElementById("rgbDisplay");

rgbDisplay.textContent = pickedColor;
rgbDisplay.style.textTransform = "uppercase";

for(var squareIndex = 0; squareIndex < squares.length; squareIndex++) {
    // Add initial colors to the squares
    squares[squareIndex].style.backgroundColor = colors[squareIndex];

    // Add event listener to all the squares
    squares[squareIndex].addEventListener("click", function(){
        if(this.style.backgroundColor === pickedColor) {
            alert("Correct!");
        } else {
            alert("Wrong!");
        }
    });
}