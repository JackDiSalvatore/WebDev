function isEven(number) {
    return ( 0 === number % 2)
}

function factorial(number) {
    var result = 1;
    for(var i = 2; i <= number; i++) {
        result = result * i;
    }
    alert("factorial is " + result);
    return result;
}

function kebabToSnake(kebabString) {
    var returnString = kebabString.replace(/-/g, "_");

    alert('Heres your new string "' + returnString  + '"');
    return returnString
}

var inputForEvenNumber = Number(prompt("Input a number to see if its even"));
isEven(inputForEvenNumber)

var inputForFactorial = Number(prompt("Now given me a number and I will compute the factorial of it"));
factorial(inputForFactorial);

var kebabString = prompt("Give me a kebab string, and I will convert it to a snake string");
kebabToSnake(kebabString);