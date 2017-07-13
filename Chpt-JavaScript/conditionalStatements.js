var userAge = Number(prompt("What is your age?"));

if (0 > userAge) {
    console.log("Age must be non-negative");
}
else if (18 > userAge) {
    alert("Sorry, you are to young to get in");
    console.log("Sorry, you are to young to get it");
}
else if (21 > userAge) {
    alert("You can get in but cannot drink");
    console.log("You can get in but cannot drink");
}
else {
    alert("Congradulations, you can get in and drink");
    console.log("You can get in and drink");
}

if (21 === userAge) {
    alert("Happy 21st Birthday");
    console.log("Happy 21st Birthday");
}

if (0 != userAge%2) {
    console.log("User age " + userAge + " is odd.");
}

console.log( userAge / Math.sqrt(userAge) )

if (userAge % Math.sqrt(userAge) === 0 ) {
    console.log("Your age is a perfect square");
}