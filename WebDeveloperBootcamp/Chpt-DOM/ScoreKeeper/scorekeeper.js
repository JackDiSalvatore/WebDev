alert("Connected!");

var gameOver = false;
var reset = document.querySelector("#reset");

var winningScoreSelector = document.querySelector("input[type='number']");
var winningScoreDisplay = document.querySelector("#winningScoreDisplay");
var winningScore = 5;

var playerOne = document.querySelector("#playerOne");
var playerOneScoreDisplay = document.querySelector("#playerOneScoreDisplay");
var playerOneScore = 0;

var playerTwo = document.querySelector("#playerTwo");
var playerTwoScoreDisplay = document.querySelector("#playerTwoScoreDisplay");
var playerTwoScore = 0;

function resetGame() {
    playerOneScoreDisplay.textContent = playerOneScore = 0;
    playerTwoScoreDisplay.textContent = playerTwoScore = 0;
    playerOneScoreDisplay.classList.remove("winner");
    playerTwoScoreDisplay.classList.remove("winner");
    gameOver = false;
}

reset.addEventListener("click", resetGame);

winningScoreSelector.addEventListener("change", function(){
    winningScoreDisplay.textContent = this.value;
    winningScore = Number(this.value);
    resetGame();
});

playerOne.addEventListener("click", function(){
    if(!gameOver){
        playerOneScore++;
        console.log("PlayerOneScore = " + playerOneScore);
        playerOneScoreDisplay.textContent = playerOneScore;
        if(winningScore === playerOneScore){
            console.log("PlayerOne Wins");
            gameOver = true;
            playerOneScoreDisplay.classList.add("winner");
        }
    }
});

playerTwo.addEventListener("click", function(){
    if(!gameOver){
        playerTwoScore++;
        console.log("PlayerTwoScore = " + playerTwoScore);
        playerTwoScoreDisplay.textContent = playerTwoScore;
        if(winningScore === playerTwoScore) {
            console.log("PlayerTwo Wins");
            gameOver = true;
            playerTwoScoreDisplay.classList.add("winner");
        }
    }
});
