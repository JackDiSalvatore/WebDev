
/* plus icon handler */
$(".fa-plus").click(function() {
    $("input[type='text']").fadeToggle(500);
});

/* input handler*/
$("input[type='text']").keypress(function(event){
    var keycode = event.which;
    if(keycode == '13') {
        var todoText = $(this).val();

        console.log("You entered: " + todoText);
        $("ol").append("<li><span class='trashCan'><i class='fa fa-trash-o' aria-hidden='true'></i></span></i> " + todoText + "</li>");

        $(this, "textarea").val("");
    }
});

/* Delete item */
/* .click() only add event listener to existing element on page */
/* .on("clicK") will apply event lister to existing elements on page
    as well as any future elements dynamically added */
/* This says when a li is cliked inside a ol, run this code*/
$("ol").on("click", ".trashCan", function(event) {
    console.log("Deleted item");
    $(this).parent().slideUp(500, function(){
        $(this).remove();
    });
    event.stopPropagation();
});

/* Check off todo by clicking */
$("ol").on("click", "li", function(){
    $(this).toggleClass("checkOffItem");
});


init();

function init() {
    console.log("Welcome to the Todo List App");
}