var Client = function () {
  return {
      connect : function (channel) {
      const io = ws('', {
        connectionTimeout: 600000,  // in milliseconds
        reconnectInterval: 60000,        
        reconnect: true
      })
        const client = io.channel(channel)
        client.connect(function (error, connected) {
          if (error) {
            //kendo.alert(error);
            return
          }
          // all good
        })
        return client
      },
      joinRoom : function(client,room){
       client.joinRoom(room, {}, function (error, joined) {
         // status
        })
        return client
      },
      leaveRoom : function(client,room){
          client.leaveRoom(room, {}, function (error, left) {
          // status
        })
        return client
      }
  };
}();
