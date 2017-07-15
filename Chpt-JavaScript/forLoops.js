console.log("--While Loops Demo: START--\n");


console.log("Print all numbers between -10 and 19");
for(var i = -10; 19 >= i; i++) {
    console.log(i);
}

console.log("\nPrint all even numbers between 10 and 40");
for(i = 10; 40 >= i; i++) {
    if(i % 2 === 0) {
        console.log(i);
    } 
}

console.log("\nPrint all the odd numbers between 300 and 333");
for(i = 300; 333 >= i; i++) {
    if(i % 2) {
        console.log(i);
    }
}

console.log("\nPrint all numbers divisible by 5 AND 3 between 5 and 50");
for(i = 5; 50 >= i; i++) {
    if((i % 3 === 0) && (i % 5 === 0)) {
        console.log(i);
    }
}

console.log("\n--While Loops Demo: END--");