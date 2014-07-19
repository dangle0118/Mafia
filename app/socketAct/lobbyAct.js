module.exports = function (io, client, db) {
var User = db.User;
var Game = db.Game;

  client.on('login', onLogin);
  client.on('new player', onNewPlayer);
  client.on('create game', onCreateGame);
  client.on('get list', onGetList);
  client.on('join game', onJoinGame);

  function onLogin(data) {
    User.find({userName: data.userName}, function (err, user) {
      if (user.length !== 0) {
        var userInfo = user[0];
        client.emit('login', {status: 'success',
          data: {
            id: userInfo._id,
            userName: userInfo.userName,
            password: userInfo.password,
            inState: userInfo.inState,
            inGame: userInfo.inGame
          }});
      } else {
        client.emit('login', {status: 'error', msg: err});
      }
    });
  }

  function onNewPlayer(data) {
    User.find({userName: data.userName}, function (err, user) {
      if (user.length !== 0 ) {
        client.emit('new player', {status: 'error', msg: 'username existed'});
      } else {
        User.create({
          userName: data.userName,
          //  password: data.password,
          inState: 'LOBBY',
          inGame: null,
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
          gameID: game._id, gameCap: game.gameCap, currentPlayers: game.currentPlayers, mafiaAmount: game.mafiaAmount} );
        User.find({userName: data.userName}, function(err, userInfo) {
          if (!err) {
            var user = userInfo[0];
            user.inState = 'WAITING';
            user.inGame = game._id;
            user.save();
          }
        });
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
          User.find({userName: data.userName}, function(err, userInfo) {
            if (!err) {
              var user = userInfo[0];
              user.inState = 'WAITING';
              user.inGame = game._id;
              user.save();
            }
          });
        } else {
          client.emit('join game', {status: 'fail', msg: "Room is fulled"});
        };
      };
    });
  }

}