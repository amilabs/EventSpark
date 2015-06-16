// EventSpark DB
EventsDB = new Mongo.Collection("eventspark");

// Used to deny all client-side DB modifications
DenyAll = {
    insert: function(){ return true; },
    remove: function(){ return true; },
    update: function(){ return true; }
};

// Uncomment to clear DB on startup
// EventsDB.remove({});

Meteor.startup(function(){
    // Restrict any changes from clientside
    EventsDB.deny(DenyAll);

    function createFilter(period, requestId, type){
        if(typeof(period) == 'undefined'){
            period = 24;
        }
        var filter = {
            date: {
                $gt: new Date().getTime() - 3600000 * parseFloat(period)
            }
        };
        if(typeof(requestId) !== 'undefined' && requestId && requestId.length){
            filter.requestId =  new RegExp(requestId);
        }
        if(typeof(type) !== 'undefined' && type && type.length && (type !== 'ALL')){
            filter.type = type;
        }
        return filter;
    }

    // Publish debug information
    Meteor.publish("EventSpark", function(period, requestId, type, skip, limit){
        var filter = createFilter(period, requestId, type, skip, limit);
        return EventsDB.find(filter, {sort: {date: -1}}, {skip: skip, limit: limit});
    });

    // Pulish count information
    Meteor.publish("EventSpark-Counter", function(period, requestId, type) {
        var self = this;
        var filter = createFilter(period, requestId, type);        
        var count = 0;
        var initializing = true;
        var handle = EventsDB.find(filter).observeChanges({
            added: function(id){
                count++;
                if(!initializing){
                    self.changed("eventspark-counts", 'total', {count: count});
                }
            },
            removed: function(id){
                count--;
                self.changed("eventspark-counts", 'total', {count: count});
            }
        });
        initializing = false;
        self.added("eventspark-counts", 'total', {count: count});
        self.ready();
        self.onStop(function () {
            handle.stop();
        });
    });

    // Meteor.setInterval(function(){}, 30000);
});
