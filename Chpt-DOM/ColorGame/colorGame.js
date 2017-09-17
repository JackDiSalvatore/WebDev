var easy = 3;
var hard = 6;
var mode = hard;
var colors = generateRandomColors(mode);

var squares = document.querySelectorAll(".square");
var pickedColor = pickRandomColor();
var resetButton = document.querySelector("#reset");
var easyButton = document.querySelector("#easy");
var hardButton = document.querySelector("#hard");
var rgbDisplay = document.getElementById("rgbDisplay");
var messageDisplay = document.querySelector("#messageDisplay");
var header = document.querySelector("h1");

rgbDisplay.textContent = pickedColor;

function pickRandomColor() {
    var randomColor = Math.floor(Math.random() * colors.length);
    return colors[randomColor];
}

function changeSquareColorsToPickedColor(newColor) {
    for(var squareIndex = 0; squareIndex < squares.length; squareIndex++) {
        if( squares[squareIndex].style.backgroundColor != newColor) {
            squares[squareIndex].style.backgroundColor = newColor;
        }
    }
}

function randomColor() {
    var maxNumber = 256;    // one larger than 255, becuase Math.random is exclusive
    var r = Math.floor(Math.random() * maxNumber);
    var g = Math.floor(Math.random() * maxNumber);
    var b = Math.floor(Math.random() * maxNumber);
    return "rgb(" + r + ", " + g + ", " + b + ")";
}

function generateRandomColors(numberOfColors) {
    var randomColorArray = [];
    for(var index = 0; index < numberOfColors; index++) {
        randomColorArray.push(randomColor());
    }
    return randomColorArray;
}

easyButton.addEventListener("click", function(){
    easyButton.classList.add("selected");
    hardButton.classList.remove("selected");

    mode = easy;
    colors = generateRandomColors(mode);
    pickedColor = pickRandomColor();
    rgbDisplay.textContent = pickedColor;

    for(var squareIndex = 0; squareIndex < squares.length; squareIndex++) {
        if(colors[squareIndex]) {
            squares[squareIndex].style.backgroundColor = colors[squareIndex];
        } else {
            squares[squareIndex].style.display = "none";
        }
    }
});

hardButton.addEventListener("click", function(){
    easyButton.classList.remove("selected");
    hardButton.classList.add("selected");

    mode = hard;
    colors = generateRandomColors(mode);
    pickedColor = pickRandomColor();
    rgbDisplay.textContent = pickedColor;

    colors = generateRandomColors(mode);
    pickedColor = pickRandomColor();
    rgbDisplay.textContent = pickedColor;

    for(var squareIndex = 0; squareIndex < squares.length; squareIndex++) {
        squares[squareIndex].style.backgroundColor = colors[squareIndex];
        squares[squareIndex].style.display = "block";
    }
});

resetButton.addEventListener("click", function(){
    colors = generateRandomColors(mode);
    pickedColor = pickRandomColor();
    rgbDisplay.textContent = pickedColor;

    for(var squareIndex = 0; squareIndex < squares.length; squareIndex++) {
        // Add colors to the squares
        squares[squareIndex].style.backgroundColor = colors[squareIndex];
    }

    header.style.backgroundColor = "#232323";
    resetButton.textContent = "New Colors";
});

/* Start of code*/

for(var squareIndex = 0; squareIndex < squares.length; squareIndex++) {
    // Add initial colors to the squares
    squares[squareIndex].style.backgroundColor = colors[squareIndex];

    // Add event listener to all the squares
    squares[squareIndex].addEventListener("click", function(){
        if(this.style.backgroundColor === pickedColor) {
            
            header.style.backgroundColor = pickedColor;
            messageDisplay.textContent = "Correct!";
            resetButton.textContent = "Play Again?";
            changeSquareColorsToPickedColor(pickedColor);
        } else {
            this.style.backgroundColor = "#232323";
            messageDisplay.textContent = "Try Again";
        }
    });
}