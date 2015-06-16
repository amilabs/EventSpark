// On-ready
Template.main.onRendered(function(){
    // Init template handlers
    App.init();

    // Close sidebar for low-resolution screens
    if($(window).width() < 990){
        App.sidebar('close-sidebar');
    }
});
