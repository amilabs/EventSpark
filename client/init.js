// tsToDate helper
Handlebars.registerHelper("tsToTime", function(ts){
    return Convert.ts2date(ts, true);
});

// Screen helper
Handlebars.registerHelper("Screen", function(){
    return {
        debug: Session.get('screen') == 'debug'
    };
});

// Meteor startup functions
Meteor.startup(function (){
    // Extend App with setScreen ability
    App.setScreen = function(screen){
        Session.set('screen', screen);
    };

    // Sets user default screen on reload
    setTimeout(function(){
        App.setScreen('debug');
    }, 0);

    // Loads data and calls a callback
    App.loadData = function(method, sessionVar, callback){
        if(!Session.get(sessionVar)){
            console.log(sessionVar + ': empty, call "' + method + '" request');
            Meteor.call(
                method,
                function(err, res){
                    if(err){
                        // todo
                    }else{
                        Session.set(sessionVar, res);
                        callback();
                    }
                }
            );
        }else{
            console.log(sessionVar + ': has loaded data');
            callback();
        }
    }

    App.statusMsg = function(parentId, type, message){
        $('.alert').remove();
        var container = $('#' + parentId);
        var msgBody = $('<DIV>');
        msgBody.addClass('alert');
        msgBody.addClass('alert-' + type);
        msgBody.addClass('alert-dismissable');
        msgBody.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
        var icons = {success: 'check', info: 'info', warning: 'exclamation', danger: 'times'};
        var header = getLocale('common', 'status_' + type);
        msgBody.append('<h4><i class="fa fa-' + icons[type] + '-circle"></i> ' + header + '</h4>');
        msgBody.append(message);
        container.append(msgBody);
    }
});