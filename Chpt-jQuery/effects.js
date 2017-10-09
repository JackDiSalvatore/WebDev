$("button").on("click", function(){
    $("div").fadeOut(1000, function(){
        console.log("Fade Completed");
        $(this).remove();   // This call back handles the synchronization scenario
    });

});


// other methods: fadeIn, fadeToggle, slideUp, slideDown, slideToggle