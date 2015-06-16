// Menu click events
Template.leftmenu.events({
    'click #sidebar-debug': function (){ App.setScreen('debug'); }
});

// Update menu on screen change
Tracker.autorun(function(){
    updateMenu();
});

// On-ready
Template.leftmenu.onRendered(function(){
    updateMenu();
    setTimeout(updateMenu, 500);
});

// Highlights current menu item
function updateMenu(){
    $('.sidebar-nav li').removeClass('active');
    $('#sidebar-' + Session.get('screen')).addClass('active');
}