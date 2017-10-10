
$("input[type='text']").keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13') {
        console.log("You entered: " + $(this).val());
        $("ol").append("<li> " + $(this).val() + " </li>");

        $(this, "textarea").val("");
    }
});

init();

function init() {
    console.log("Welcome to the Todo List App");
}