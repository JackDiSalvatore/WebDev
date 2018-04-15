var easy = 3;
var hard = 6;
var mode = hard;
var colors = [];
var pickedColor;

var squares = document.querySelectorAll(".square");
var resetButton = document.querySelector("#reset");
var rgbDisplay = document.getElementById("rgbDisplay");
var messageDisplay = document.querySelector("#messageDisplay");
var header = document.querySelector("h1");
var modeButtons = document.querySelectorAll(".mode");


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

function resetGame() {
    colors = generateRandomColors(mode);
    pickedColor = pickRandomColor();
    rgbDisplay.textContent = pickedColor;

    // update page to reflect changes
    for(var squareIndex = 0; squareIndex < squares.length; squareIndex++) {
        if(colors[squareIndex]) {
            squares[squareIndex].style.display = "block";
            squares[squareIndex].style.backgroundColor = colors[squareIndex];
        } else {
            squares[squareIndex].style.display = "none";
        }
    }

    resetButton.textContent = "New Colors";
    header.style.backgroundColor = "#E00000"/*"steelblue"*/;
    messageDisplay.textContent = "";
}

function setupButtons() {
    for(var button = 0; button < modeButtons.length; button++) {
        modeButtons[button].addEventListener("click", function() {
            modeButtons[0].classList.remove("selected");    // manually remove class
            modeButtons[1].classList.remove("selected");    // from both buttons
            this.classList.add("selected");

            // figure out how many squares to show
            ("Easy" === this.textContent) ? (mode = easy) : (mode = hard);

            resetGame();
        });
    }
}

function setupSquares() {
    /* Square Listeners for clicking on the squares*/
    for(var squareIndex = 0; squareIndex < squares.length; squareIndex++) {
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
}

resetButton.addEventListener("click", resetGame);

function init() {
    setupButtons();
    setupSquares();
    // Setup for first game
    resetGame();

}

/* Program Start */
init();
