module.exports = function(io, mongoose) {
  var User = mongoose.model('user', {
  	userName: String,
    inGame: Boolean,
    socket: String

  });
  var Game = mongoose.model('game', {
  	roomName: String, 
  	gameCap: Number,
  	currentPlayers: Array,
  	gameRoles: Array,
    mafiaAmount: Number
  });

  var GameProcess = {};

  GameProcess.badSide = ['mafia', 'hooker'];
  GameProcess.onBadSide = function(character) {
    for (var i = 0; i < GameProcess.badSide.length; ++i) {
      if (character == GameProcess.badSide[i]) {
        return true;
      }
    }
    return false;
  }


  
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
    client.on('sleep', onSleep);
    client.on('kill village', onNightAction);
    client.on('save village', onNightAction);
    client.on('inspect village', onNightAction);
    client.on('hook village', onNightAction);

    client.on('day chat', onDayChat);
    client.on('night chat', onNightChat);

    function onNewPlayer(data) {
      User.find({userName: data.userName}, function (err, user) {
         	if (user.length !== 0 ) {
					  client.emit('new player', {status: 'error', msg: 'username existed'});      
      	} else {
      		User.create({
      			userName: data.userName,
            inGame: false,
            socket: client.id
      		}, function (err, user) {
      				if (err) {
      					client.emit('new player', { status: 'error', msg: 'cannot create'});
      				} else {
                console.log('new user: ' + data.userName);
      					client.emit('new player', {status: 'success', userName: user.userName, id: user._id});  

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
        gameRoles: data.gameChar,
        mafiaAmount: data.mafiaAmount
      }, function (err, game) {
          if (err) {
            client.emit('create game', {status:'error', msg: 'cannot create game'});
          } else {
            client.emit('create game', {status: 'success', roomName: game.roomName,
                                    gameID: game._id, gameCap: game.gameCap,
                                    currentPlayers: game.currentPlayers, 
                                    gameRoles: game.gameRoles,
                                    mafiaAmount: game.mafiaAmount,
                                    isCreator: 1 });
            client.join(data.userName);
            client.join(game._id);

            client.broadcast.emit('add game', {status: 'success', roomName: game.roomName,
              gameID: game._id, gameCap: game.gameCap, currentPlayers: game.currentPlayers, mafiaAmount: game.mafiaAmount,} );
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
            result[gameRoom._id] = {
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
            client.join(data.userName);
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
          var characterList = generateCharacters(game[0].gameCap, game[0].gameRoles);
            
          initializeGameProcess(game[0], playerList, characterList); 
         
          
          for (var i = 0; i < playerList.length; ++i) {  
            io.sockets.socket(playerList[i]).emit('start game', {status: 'success', character: characterList[i]});
          }
          client.broadcast.emit('remove game', {status: 'success', roomName: game[0].roomName,
            gameID: game[0]._id} );
        }

      });
    }

    function initializeGameProcess(game, playerList, characterList ) {
      GameProcess[game._id] = {
        gameCap: game.gameCap        
      };
      GameProcess[game._id].role = {};
      var count = 0;
      for (var role = 0; role < characterList.length; ++role) {
        GameProcess[game._id].role[characterList[role]] = {};
        if (characterList[role] != 'village') {
            count += 1;
        }
      }
      GameProcess[game._id].amountRole = count;
      GameProcess[game._id].currentSubmit = 0;
      GameProcess[game._id].votePlayers = {};
      GameProcess[game._id].voteAmount = 0;
      GameProcess[game._id].badSide = {};
      count = 0;

      var promise = User.find({socket: {$in: playerList}}).exec();
      promise.then(function(data) {
        for (var i=0; i < data.length; ++i ) {
          var user = data[i];
          user.inGame = true;
          GameProcess[game._id].votePlayers[user.userName] = {};
          GameProcess[game._id].votePlayers[user.userName].vote = 0;
          GameProcess[game._id].votePlayers[user.userName].character = characterList[count];
          if (GameProcess.onBadSide(characterList[count])) {
            GameProcess[game._id].badSide[user.userName] = user.socket;
          }

          count +=1;
          user.save();
        }
      });
    }

    function generateCharacters(gameCap, gameRoles) {
      var result = [];
      var pos;
      for (var i = 0; i < gameRoles.length; ++i) {
        do {
          // random from 0 - 9
          pos = Math.floor((Math.random() * 10) );
        } while ( (typeof result[pos] != 'undefined') || (pos >= gameCap));
        result[pos] = gameRoles[i];
      }
      for (var i = 0; i < gameCap; ++i) {
        if (typeof result[i] == 'undefined') {
          result[i] = 'village';
        }
      }
      return result;
    }

    function getHighestVote(ID) {
      var highest = 0;
      var name = '';
      for (var player in GameProcess[ID].votePlayers) {
        if (GameProcess[ID].votePlayers[player].vote > highest ) {
          highest = GameProcess[ID].votePlayers[player].vote;
          name = player;
        }
      }
      return name;
    }

    function checkEqualVote(player, ID) {

      for (var temp in GameProcess[ID].votePlayers) {
        if (GameProcess[ID].votePlayers.hasOwnProperty(temp)) {
            if ((temp !== player) && (GameProcess[ID].votePlayers[temp].vote === GameProcess[ID].votePlayers[player].vote)) {

              return true;
            }
        }
      }
      return false;
    }

    function onVotePlayer(data) {
      io.sockets.in(data.gameID).emit('vote player', {status: 'success', votePlayer: data.votePlayer, fromUser: data.userName});
      GameProcess[data.gameID].votePlayers[data.votePlayer].vote += 1;
      GameProcess[data.gameID].voteAmount += 1;

      if (GameProcess[data.gameID].voteAmount == GameProcess[data.gameID].gameCap) {
        var player = getHighestVote(data.gameID);
        console.log('vote ' + player)
        console.log(GameProcess[data.gameID].votePlayers)
        if (!checkEqualVote(player, data.gameID)) {
          io.sockets.in(data.gameID).emit('kill player', {status: 'success', player: player, character: GameProcess[data.gameID].votePlayers[player].character});
          GameProcess[data.gameID].gameCap -=1;
          if (GameProcess[data.gameID].votePlayers[player].character != "village") {
              console.log('here ' + player + " " + GameProcess[data.gameID].votePlayers[player].character);
              GameProcess[data.gameID].amountRole -=1;
              console.log('just decrease ' + GameProcess[data.gameID].amountRole);
              console.log(GameProcess[data.gameID].votePlayers)
          }
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
          console.log(character);
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
        var msg = '';
        if(GameProcess[ID].role['police'].userName !== '') {
          if (GameProcess.onBadSide(GameProcess[ID].votePlayers[GameProcess[ID].role['police'].votePlayer].character)) {
            msg = 'not a village';
          } else {
            msg = 'is a village';
          }
          io.sockets.in('/'+GameProcess[ID].role['police'].userName).emit('inspect village', {result: msg});
          console.log(GameProcess[ID].role['police'].userName);
          console.log(io);
        }
      }

      if (GameProcess[ID].role['mafia'].votePlayer !== '') {
        killList[GameProcess[ID].role['mafia'].votePlayer] = GameProcess[ID].votePlayers[GameProcess[ID].role['mafia'].votePlayer].character;
      }

      return killList;

    }

    function onNightAction(data) {
      console.log(GameProcess[data.gameID]);
      console.log(data);
      GameProcess[data.gameID].role[data.role] = {userName: data.userName, votePlayer: data.votePlayer};
      GameProcess[data.gameID].currentSubmit +=1;
      console.log(GameProcess[data.gameID].currentSubmit + ' ' + GameProcess[data.gameID].amountRole)
      if (GameProcess[data.gameID].currentSubmit == GameProcess[data.gameID].amountRole) {
        var killList = executeAction(data.gameID);
        console.log(killList)
        //broad cast wake up to all players
        io.sockets.in(data.gameID).emit('wake up', {status: 'wakeup'});

        GameProcess[data.gameID].currentSubmit = 0;
        GameProcess[data.gameID].voteAmount = 0;
        for (var player in killList) {
          console.log('player in killlist ' + player)
          io.sockets.in(data.gameID).emit('kill player', {status: 'success', player: player, character: killList[player]});
          GameProcess[data.gameID].gameCap -=1;
          if (GameProcess[data.gameID].votePlayers[player].character != "village") {
            GameProcess[data.gameID].amountRole -=1;
          }
        }
      }      
    } 

    function onSleep(data) {
      io.sockets.in(data.gameID).emit('sleep', {status: 'success', userName: data.userName});      
    }

    function onDayChat(data) {
      console.log(data);
      console.log(io.rooms)
      client.broadcast.to(data.gameID).emit('day chat', {userName: data.userName, msg: data.msg});
    }

    function onNightChat(data) {
      var playerList = GameProcess[data.gameID].votePlayers;

      for (var player in playerList) {
        if (GameProcess[data.gameID].badSide.hasOwnProperty(player) && player !== data.userName) {
          io.sockets.socket(GameProcess[data.gameID].badSide[player]).emit('night chat', {userName: data.userName, msg: data.msg})
        }
      }


    }




  }

}