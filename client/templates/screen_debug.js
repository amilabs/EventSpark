Debug = new Mongo.Collection('eventspark');
DebugCount = new Mongo.Collection("eventspark-counts");

Session.set('fltRequestId', '');
Session.set('fltType', 'ALL');
Session.set('fltPeriod', 24);

Session.set('limit', 20);
Session.set('page', 1);
Session.set('pages', []);

Session.set('running', true);
Session.set('debug', []);

Meteor.autosubscribe(function(){
    Meteor.subscribe(
        'EventSpark',
        Session.get('fltPeriod'),
        Session.get('fltRequestId'),
        Session.get('fltType'),
        (Session.get('page') - 1) * Session.get('limit'), 
        Session.get('limit')
    );
    Meteor.subscribe(
        'EventSpark-Counter',
        Session.get('fltPeriod'),
        Session.get('fltRequestId'),
        Session.get('fltType')
    );
})

// Template helpers
Template.screen_debug.helpers({
    isRunning: function(){
        return Session.get('running');
    },
    debug: function(){
        return Session.get('debug') ? Session.get('debug') : [];
    },
    class: function(type){
        var res = '';
        switch(type){
            case 'ERROR':
                res = 'danger';
                break;
            case 'SUCCESS':
            case 'WARNING':
                res = type.toLowerCase();
                break;
        }
        return res;
    },
    total: function(){
        var totals = DebugCount.findOne({});
        return totals ? totals.count : 0;
    },
    page_first_el: function(){
        var total = DebugCount.findOne({}) ? DebugCount.findOne({}).count : 0;
        var n = (Session.get('page') - 1) * Session.get('limit') + 1;
        return n > total ? total : n;
    },
    page_last_el: function(){
        var total = DebugCount.findOne({}) ? DebugCount.findOne({}).count : 0;
        var n = Session.get('page') * Session.get('limit');
        return n > total ? total : n;
    },
    pages: function(){
        return Session.get('pages');
    },
    isObject: function(data){
        return typeof(data) === 'object';
    },
    format: function(data){
        if(typeof(data) === 'object'){
            data = hljs.highlightAuto(JSON.stringify(data, null, 4)).value;
        }else if(data && (typeof(data) === 'string') && data[0] === '{'){
            // JSON
            try {
                var a = JSON.parse(data);
                data = hljs.highlightAuto(JSON.stringify(a, null, 4)).value;
            }catch(e){}
        }
        data = '<pre>' + data + '</pre>';
        return data;
    }
});

Meteor.setInterval(function(){
    if(Session.get('running')){
        updateDebug();
    }
}, 5000);

// Menu click events
Template.screen_debug.events({
    'click .selectRequest': function(evt){
        evt.preventDefault();
        try{
            var pre = $(evt.target).closest('TR').next().find('PRE:eq(0)')
            selectSpan(pre[0]);
        }catch(e){}
    },
    'click .selectResponse': function(evt){
        evt.preventDefault();
        try{
            var pre = $(evt.target).closest('TR').next().find('PRE:eq(1)')
            selectSpan(pre[0]);
        }catch(e){}
    },
    'click #stop': function (){ 
        pauseDebug();
    },
    'click .debugRow' : function(evt){
        pauseDebug(true);
    },
    'click pre' : function(evt){
        $(evt.target).closest('TR').toggleClass('bigPres');
    },
    'click #filter': function (){
        Session.set('fltRequestId', $('#fltRequestId').val());
        Session.set('fltType', $('#fltType').val());
        Session.set('fltPeriod', parseFloat($('#fltPeriod').val()));
        Session.set('page', 1);
        updateDebug();
    },
    'click .page-element': function(evt){
        var el = $(evt.currentTarget);
        if(!el.hasClass('active')){
            var page = parseInt(el.children('a').attr('data-page-id'));
            if(page && !isNaN(page)){
                Session.set('page', page);
                updateDebug();
            }
        }
    }
});

// On-ready
Template.screen_debug.onRendered(function(){
    $('#elements_per_page').change(function(){
        var limit = parseInt($(this).val());
        if(limit && !isNaN(limit)){
            Session.set('limit', limit);
            Session.set('page', 1);
            recalcPages();
        }
    });
});

function pauseDebug(onlyPause){
    Session.set('running', onlyPause ? false : !Session.get('running'));
}

function updateDebug(){
    var skip = (Session.get('page') - 1) * Session.get('limit');
    var limit = Session.get('limit');
    Session.set('debug', Debug.find({}, {sort:{date: -1}, skip: skip, limit: limit}).fetch());
    recalcPages();
}

function recalcPages(){
    var limit = parseInt(Session.get('limit'));
    var total = DebugCount.findOne({}) ? DebugCount.findOne({}).count : 0;
    var pagesCnt = Math.ceil(total / limit);
    var pages = [];
    for(var i = 1; i <= pagesCnt; i++){
        pages.push({
            page_n: i,
            active: i == Session.get('page')
        });
    }
    Session.set('pages', pages);
}

// Selects text in specified span
selectSpan = function(span){
    var range = document.createRange();
    range.setStartBefore(span.firstChild);
    range.setEndAfter(span.lastChild);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}