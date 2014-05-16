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
    client.on('join game', onJoinGame);
    client.on('player confirm', onPlayerConfirm);
    client.on('player cancel', onPlayerCancel );
    client.on('start game', onStartGame);    


    function onNewPlayer(data) {
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
                console.log('new user: ' + data.userName);
      					client.emit('new player', {status: 'success', userName: user.userName, id: user._id});  
                client.join(data.userName);    
      				}
      			});
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
                                    gameRoles: game.gameRoles, 
                                    isCreator: 1 });
            console.log(game._id);
            client.join(game._id);
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

    function onJoinGame(data) {
      Game.find({_id: data.gameID}, function (err, gameInfo) {
        if (err) {
          client.emit('join game', {status: 'error', msg: 'cannot join game'});
        } else {          
          var game = gameInfo[0];
         
          if (game.currentPlayers.length < game.gameCap) {            
            
            game.currentPlayers.push(data.userName);
            var result = game.toObject();
            result.gameID = game._id; 
            result.isCreator = 0;
            delete result._id;                
            client.emit('join game', {status: 'success', data: result});
            console.log(game._id);
            client.join(game._id);
            client.broadcast.to(game._id).emit('player join', {userName: data.userName});

            io.sockets.clients(game._id);
            game.save();            
            
          } else {
            client.emit('join game', {status: 'fail', msg: "Room is fulled"});
          };
      
        };

      });
    }

    function onPlayerConfirm(data) {
      client.broadcast.to(data.gameID).emit('player confirm', {userName: data.userName});
    }

    function onPlayerCancel(data) {
      client.broadcast.to(data.gameID).emit('player cancel', {userName: data.userName});      
    }

    function onStartGame(data) {
      Game.find({_id: data.gameID }, function (err, game) {
        if (err) {
          client.emit('start game', {status: 'error', msg: 'game not exist'});
        } else {
          var playerList = game.currentPlayers;
          var characterList = generateCharacters(game.gameCap, game.gameRoles);
          for (var i = 0; i < playerList.length; ++i) {
            client.broadcast.to(playerList[i]).emit('start game', {status: 'success', character: characterList[i]});
          }
        }

      });
    }

    function generateCharacters(gameCap, gameRoles) {
      console.log(gameRoles);

    }

  }

}