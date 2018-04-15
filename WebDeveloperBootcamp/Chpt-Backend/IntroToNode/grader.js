function average(scores) {
    var sum;
    
    scores.forEach(function(score){
        sum += score;
    });
    
    return Math.round(sum / scores.length);
}

var goodScores = [90, 98, 89, 100, 100, 86, 94];
var badScores = [40, 65, 77, 82, 80, 54, 73, 63, 95, 49];

console.log(average(goodScores));
console.log(average(badScores));
