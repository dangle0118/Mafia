module.exports = function(io, mongoose) {
  var User = mongoose.model('user', {
  	userName: String
  });
  var Game = mongoose.model('game', {
  	roomName: String, 
  	gameCap: Number,
  	currentPlayers: Array,
  	gameRoles: Array
  });


  
  io.sockets.on('connection', onConnection);

  function onConnection(client) {
    console.log('new client connected: ' + client.id);

    client.on('new player', onNewPlayer);
    client.on('create game', onCreateGame);
    client.on('get list', onGetList);


    function onNewPlayer(data) {
      console.log(data);
      console.log(data.userName);
      User.find({userName: data.userName}, function (err, user) {
        console.log(user);
      	if (user.length !== 0 ) {
					  client.emit('new player', {status: 'error', msg: 'username existed'});      
      	} else {
      		User.create({
      			userName: data.userName
      		}, function (err, user) {
      				if (err) {
      					client.emit('new player', { status: 'error', msg: 'cannot create'});
      				} else {
      					client.emit('new player', {status: 'success', userName: user.userName, id: user._id});      
      				}
      			})
      	}
      });
    }
	
		function onCreateGame(data) {		
      Game.create({
        roomName : data.roomName,
        gameCap: data.gameCap,
        currentPlayers: [data.userName],
        gameRoles: [data.gameChar]
      }, function (err, game) {
          if (err) {
            client.emit('create game', {status:'error', msg: 'cannot create game'});
          } else {
            client.emit('create game', {status: 'success', roomName: game.roomName,
                                    gameID: game._id, gameCap: game.gameCap,
                                    currentPlayers: game.currentPlayers, 
                                    gameRoles: game.gameRoles });
          };
      });
		
		}    

    function onGetList(data) {
      Game.find({}, function (err, game) {
        if (err) {
          client.emit('get list', {status: 'error', msg: 'cannot get list'});
        } else {
          var result = {};
          game.forEach(function (gameRoom) {
            result[gameRoom.roomName] = {
              roomName: gameRoom.roomName,
              gameID: gameRoom._id,
              gameCap: gameRoom.gameCap,
              currentPlayers: gameRoom.currentPlayers
            }
          });
          client.emit('get list', {status: 'success', data: result});
        };
      });      
    }
  

  }

}