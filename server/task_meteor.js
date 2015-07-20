MeteorDBs = {};

Meteor.startup(function(){
    
    for(var service in aServices){
        var oService = aServices[service];
        if(oService.type === 'meteor'){
            oService.conn = DDP.connect(oService.host);
            DDP.loginWithPassword(
                oService.conn,
                {username: oService.user},
                oService.pass,
                function(error){
                    if(error){
                        EventsDB.insert({
                            date: new Date().getTime(),
                            requestId: '-',
                            requestCnt: 0,
                            source: 'DEBUGGER',
                            sourceURL: '',
                            destination: service,
                            destinationURL: aServices[service].host,
                            service: service,
                            type: 'ERROR',
                            message: 'AUTH ERROR',
                            data: JSON.stringify(error)
                        });                        
                    }else{
                        MeteorDBs[service] =
                            new Mongo.Collection(
                                "debug",
                                {
                                    connection: oService.conn
                                }
                            );
                        oService.conn.subscribe('Debug');
                    }
                }
            );
        }
    }
    
    Meteor.setInterval(
        function(){
            for(var service in MeteorDBs){
                // console.log('Asking ' + meteorDB + ' for logs');
                var DBlog =
                    MeteorDBs[service].find({date: {$gt: new Date().getTime() - 3600000}}, {sort: {date: -1}}, {limit: 10}).fetch();
                // console.log('Got ' + DBlog.length + ' records');
                for(var i = 0; i < DBlog.length; i++){
                    var log = DBlog[i];
                    if(!EventsDB.findOne({source: service, date: log.date})){
                        // console.log('Adding a new record');
                        // console.log(log);
                        EventsDB.insert({
                            date: log.date,
                            requestId: log.uniqid,
                            requestCnt: 0,
                            source: service,
                            user: log.user,
                            ip: log.ip,
                            sourceURL: aServices[service].host,
                            destination: log.data.serviceName,
                            destinationURL: log.data.serviceURL,
                            type: getLogType(log.type),
                            message: log.message,
                            data: log.data
                        });
                    }
                }
            }
        },
        aIntervals.meteor
    );
});

function getLogType(type){
    return ['SUCCESS', 'ERROR', 'WARNING'][type];
}