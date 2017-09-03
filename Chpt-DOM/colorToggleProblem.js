alert("Connected!!");

var button = document.querySelector("button");

button.addEventListener("click", function(){
    // toggle a class on the body of the html document
    document.body.classList.toggle("backgroundPurple");
});

/*var toggle = true;

button.addEventListener("click", function(){
    if(toggle) {
        document.body.style.background = "purple";;
    } else {
        document.body.style.background = "white";
    }
    toggle = !toggle;
});*/