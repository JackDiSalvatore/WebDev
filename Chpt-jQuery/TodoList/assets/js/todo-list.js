
/* toggleInput handler */
$("#toggleInput").on("click", function() {
    $("input[type='text']").slideToggle(500);
});

/* input handler*/
$("input[type='text']").keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13') {
        console.log("You entered: " + $(this).val());
        $("ol").append("<li> " + $(this).val() + " </li>");

        $(this, "textarea").val("");
    }
});

/* Check off todo by clicking */
$("li").click(function(){
    $(this).toggleClass("checkOffItem");
});

/*$("li").on("mouseenter", function() {
    $(".trashCan").toggleClass("hideMe");
});
*/

init();

function init() {
    console.log("Welcome to the Todo List App");
}