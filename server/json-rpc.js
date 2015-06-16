// JSON RPC caller
// todo: make separate package
JsonRPC = {
    // Executes JSON RPC call
    exec: function(method, params, callback){
        if(typeof(callback) === 'undefined'){
            return JsonRPC.execSync(method, params);
        }
        JsonRPC.execAsync(method, params, callback);
    },
    // Sync JSON RPC call
    execSync: function(method, params){
        var res = {};
        var error = false;
        try{
            res =
                HTTP.call('POST', mrService, getRequestData(method, params));
            error = !res.data || !res.data.result;
        } catch(e){
            res.content = e.message;
            error = true;
        }
        // todo: log errors
        return error ? false : res.data.result;
    },
    // Async JSON RPC call
    execAsync: function(method, params, callback){
        HTTP.call('POST', mrService, getRequestData(method, params),
            function(e, res){
                var error = false;
                if(e){
                    error = true;
                    if(!res || !res.content){
                        res = {content: e.toString()};
                    }
                }else if(!res.data || !res.data.result){
                    error = true;
                }else{
                    callback(res.data.result);
                }
                // todo: log errors
            }
        );
    }
}

// Returns request data for JSON RPC requests
function getRequestData(method, params){
    var data = {
        data: {
            jsonrpc: "2.0",
            id: 0,
            method: method,
            params: params
        }
    };
    // Auth parse
    if(mrService.indexOf('@') > 0){
        var matches = mrService.match(/\/\/(.*?)\@/);
        if(matches.length == 2){
            data.auth = matches[1];
        }
    }
    return data;
}