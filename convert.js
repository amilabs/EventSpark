Convert = {
    // Converts YYYY-MM-DD to timestamp
    date2ts: function(date){
        var aParts = date.split('-');
        var Y = parseInt(aParts[0]);
        var m = parseInt(aParts[1]);
        var d = parseInt(aParts[2]);
        var oDate = new Date(Y, m - 1, d);
        return oDate.getTime();
    },
    // Converts timestamp to date or datetime
    ts2date: function(ts, withTime){
        if(typeof(withTime) == 'undefined'){
            withTime = true;
        }
        var date = new Date(ts);
        var year = date.getFullYear();
        var day = "0" + date.getDate();
        var month = "0" + (date.getMonth() + 1);

        var res = year + '-' + month.substr(month.length-2) + '-' + day.substr(day.length-2);

        if(withTime){
            var hours = "0" + date.getHours();
            var minutes = "0" + date.getMinutes();
            var seconds = "0" + date.getSeconds();
            res += ' ';
            res += (hours.substr(hours.length-2) + ':' + minutes.substr(minutes.length-2) + ':' + seconds.substr(seconds.length-2));
        }
        return  res;
    },
    // Converts coins to kilograms
    coins2kg: function(coins){
        return parseFloat(coins) / 1000;
    },
    // Converts oz to gramms
    oz2g: function(oz){
        return parseFloat(oz) / 31.1034768;
    }
}