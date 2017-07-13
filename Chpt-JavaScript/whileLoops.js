console.log("While Loops Demo: START...");


console.log("Print all numbers between -10 and 19");
var count = -10;

while (19 >= count) {
    console.log(count);
    count++;
}

console.log("\nPrint all even numbers between 10 and 40");
count = 10;

while (40 >= count) {
    if (count % 2 === 0) {
        console.log(count);
    }
    count++;
}

console.log("\nPrint all the odd numbers between 300 and 333");
count = 300;

while (333 >= count) {
    if (count % 2) {
        console.log(count);
    }
    count++;
}

console.log("\nPrint all numbers divisible by 5 AND 3 between 5 and 50");
count = 5;

while(50 >= count) {
    if((count % 3 === 0) && (count % 5 === 0)) {
        console.log(count);
    }
    count++;
}