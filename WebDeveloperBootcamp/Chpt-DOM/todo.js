console.log("javascript connected!");

var todoList = document.querySelectorAll("li");

for(var itemNum = 0; itemNum < todoList.length; itemNum++) {
    todoList[itemNum].addEventListener("mouseover", function(){
        this.classList.add("selected");
    });

    todoList[itemNum].addEventListener("mouseout", function(){
        this.classList.remove("selected");
    });

    todoList[itemNum].addEventListener("click", function(){
        this.classList.toggle("done");
    })
}