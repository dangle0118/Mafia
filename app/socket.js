module.exports = function(io, mongoose) {
  var User = mongoose.model('user', {
  	userName: String,
    inGame: Boolean,
    socket: String,

  });
  var Game = mongoose.model('game', {
  	roomName: String, 
  	gameCap: Number,
  	currentPlayers: Array,
  	gameRoles: Array
  });

  var GameProcess = {};



  
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
    client.on('vote player', onVotePlayer);
    client.on ('kill player', onKillPlayer);
    client.on('sleep', onSleep); 
    client.on('kill village', onNightAction);
    client.on('save village', onNightAction);
    client.on('inspect village', onNightAction);
    client.on('hook village', onNightAction);


    function onNewPlayer(data) {
      User.find({userName: data.userName}, function (err, user) {
         	if (user.length !== 0 ) {
					  client.emit('new player', {status: 'error', msg: 'username existed'});      
      	} else {
      		User.create({
      			userName: data.userName,
            inGame: false,
            socket: client
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
            
            client.join(data.userName);
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

          var playerList = io.rooms['/'+game[0]._id];
          console.log(playerList);
          var characterList = generateCharacters(game[0].gameCap, game[0].gameRoles);
            
          initializeGameProcess(game[0], playerList, characterList); 
          
          
          for (var i = 0; i < playerList.length; ++i) {  
            io.sockets.socket(playerList[i]).emit('start game', {status: 'success', character: characterList[i]});
          }
        }

      });
    }

    function initializeGameProcess(game, playerList, characterList ) {
      GameProcess[game._id] = {
        gameCap: game.gameCap        
      };
      var count = 0;
      for (var role in game.gameRoles) {
        GameProcess[game._id][role] = {};
        count += 1;
      }
      GameProcess[game._id].amountRole = count;
      GameProcess[game._id].currentSubmit = 0;
      GameProcess[game._id].votePlayers = {};
      GameProcess[game._id].voteAmount = 0;
      count = 0;
      for (var player in playerList) {
        User.find({socket: player}, function (err, data) {
          if (!err) {
            var user = data[0];
            user.inGame = true;
            GameProcess[game._id].votePlayer[user.userName].vote = 0;
            GameProcess[game._id].votePlayer[user.userName].character = characterList[count];
            user.save();
          }
        });
        count +=1;
      };
      console.log(GameProcess[game._id]);
    }

    function generateCharacters(gameCap, gameRoles) {
      //TODO: complete function
      
      return ['village', 'mafia','police','mafia', 'village'];
    }

    function getHighestVote(ID) {
      var highest = 0;
      var name = '';
      for (var player in GameProcess[ID].votePlayer) {
        if (GameProcess[ID].votePlayer[player].vote > 0 ) {
          highest = GameProcess[ID].votePlayer[player].vote;
          name = player;
        }
      }
      return player;
    }

    function checkEqualVote(player, ID) {
      for (var temp in GameProcess[ID].votePlayer) {
        if ((temp !== player) && (GameProcess[ID].votePlayer[temp].vote === GameProcess[ID].votePlayer[player].vote)) {
          return true;
        }
      }
      return false;
    }

    function onVotePlayer(data) {     
      io.sockets.in(data.gameID).emit('vote player', {status: 'success', votePlayer: data.votePlayer, fromUser: data.userName});
      GameProcess[data.gameID].votePlayer[data.userName].vote += 1;
      GameProcess[data.gameID].voteAmount += 1;
      if (GameProcess[data.gameID].voteAmount == GameProcess[data.gameID].gameCap) {
        var player = getHighestVote(data.gameID);
        if (!checkEqualVote(player, data.gameID)) {
          io.sockets.in[data.gameID].emit('kill player', {status: 'success',
                                            data: { player: GameProcess[data.gameID].votePlayer[player].character});         
          GameProcess[data.gameID].gameCap -=1;
          //TODO: implemend the rest
        }
      }
       
    }

    function executeAction(ID) {
      var killList = {};
      if (GameProcess[ID].role.hasOwnProperty('hooker')) {
        for (var character in GameProcess[ID].role) {
          if (GameProcess[ID].role[character].userName === GameProcess[ID].role['hooker'].votePlayer) {
            GameProcess[ID].role[character].userName = '';
            break;
          }
        }
      }

      if (GameProcess[ID].role.hasOwnProperty('mafia')) {
        for (var character in GameProcess[ID].role) {
          if (GameProcess[ID].role[character].userName === GameProcess[ID].role['mafia'].votePlayer) {
            GameProcess[ID].role[character].userName = '';
            break;
          }
        }
      }

      if (GameProcess[ID].role.hasOwnProperty('doctor')) {
        if (GameProcess[ID].role['mafia'].votePlayer === GameProcess[ID].role['doctor'].votePlayer) {
            GameProcess[ID].role['mafia'].votePlayer = '';           
        }        
      }


      if (GameProcess[ID].role.hasOwnProperty('police')) {
        if(GameProcess[ID].role['police'].userName !== '') {
          //TODO: implemend
          client.broadcast.to(GameProcess[ID].role['police'].userName).emit('inspect village', {data: 'inspect village'});
        }
      }

      if (GameProcess[ID].role['mafia'].votePlayer !== '') {
        killList.[GameProcess[ID].role['mafia'].votePlayer] = GameProcess[ID].votePlayer[GameProcess[ID].role['mafia'].votePlayer].character;
      }

      return killList;

    }

    function onNightAction(data) {
      GameProcess[data.gameID].roles[data.role] = {userName: data.userName, votePlayer: data.votePlayer};
      GameProcess[data.gameID].currentSubmit +=1;
      if (GameProcess[data.gameID].currentSubmit == GameProcess[data.gameID].amountRole) {
        var killList = executeAction(data.gameID);
        //broad cast wake up to all players
        io.sockets.in(data.gameID).emit('wake up', {status: 'wakeup'});    
        for (var player in killList) {
          io.sockets.in(data.gameID).emit('kill player', {status: 'success', data: {player: killList[player]}});
        }
      }
      
    }

    

    function onKillPlayer(data) {    

      
    }

    function onSleep(data) {
      
    }




    

  }

}