alert("Connected!!");

function printReverse(array) {
    for(var idx = array.length - 1; idx >= 0; idx--) {
        console.log(array[idx]);
    }
}

function isUniform(array) {
    if(array.length) {
        for(var idx = 1; idx < array.length; idx++) {
            if(array[0] !== array[idx]){
                return false;
            }
        }
        return true;
    }
}

function sumArray(array) {
    var result = 0;
    array.forEach(function(val) {
        if(typeof(val) === "number") {
            result += val;
        }
        else{
            console.log("Array must contain all numbers!");
        }
    });
    return result;
}

function max(array) {
    var max = 0;
    array.forEach(function(val) {
        if(val > max){
            max = val;
        }
    });
    return max;
}


/*function max(array) {
    var max = array[0];

    for(var idx = 0; idx < array.length; idx++) {
        if(array[idx] > max) {
            max = array[idx];
    }
    return max;
}*/
